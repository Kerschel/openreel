#!/usr/bin/env node
/**
 * OpenReel catalogue ingester.
 *
 * Builds src/data/catalogue.json from the Internet Archive's public,
 * key-less APIs:
 *   - advancedsearch.php  (item discovery)
 *   - metadata/{id}       (file list + technical metadata)
 *
 * Only Internet Archive public-domain / openly licensed collections are
 * queried. Nothing here scrapes, proxies or circumvents a commercial
 * streaming provider.
 *
 * Usage:
 *   npm run ingest                 # incremental (uses .cache/)
 *   npm run ingest:refresh         # ignore cache, re-fetch everything
 *   node scripts/ingest.mjs --limit 40 --collections feature_films,film_noir
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'catalogue.json');

/**
 * Requested collections followed by the additional ones that actually return
 * items. Some historical names (film_noir, sci-fi_horror, serials,
 * mysteryandcrimefilms, comedy_films) resolve to 0 documents on archive.org's
 * advanced search; they are kept in the list because the ingester skips empty
 * collections instead of failing, and they may be populated again later.
 */
const DEFAULT_COLLECTIONS = [
  'feature_films',
  'film_noir',
  'sci-fi_horror',
  'classic_tv',
  'serials',
  'animationandcartoons',
  'prelinger',
  'silent_films',
  'mysteryandcrimefilms',
  'comedy_films',
  'short_films',
  'moviesandfilms',
  'avgeeks',
  'classic_cartoons',
];

const UA = 'OpenReelCatalogueBot/1.0 (+https://github.com/Kerschel/openreel; public-domain ingest)';
const CONCURRENCY = 4;
const DELAY_MS = 150;
const TIMEOUT_MS = 15_000;
const RETRIES = 2;
const MIN_BYTES = 1_000_000;

/* ------------------------------------------------------------------ CLI */

function parseArgs(argv) {
  const out = { limit: null, collections: null, refresh: false, rows: 100, pages: 1 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--refresh') out.refresh = true;
    else if (a === '--limit') out.limit = Number(argv[(i += 1)]);
    else if (a === '--rows') out.rows = Number(argv[(i += 1)]);
    else if (a === '--pages') out.pages = Number(argv[(i += 1)]);
    else if (a === '--collections') {
      out.collections = String(argv[(i += 1)])
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return out;
}

const ARGS = parseArgs(process.argv.slice(2));
const COLLECTIONS = ARGS.collections?.length ? ARGS.collections : DEFAULT_COLLECTIONS;

/* --------------------------------------------------------------- helpers */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(...args) {
  process.stdout.write(`${args.join(' ')}\n`);
}

async function cachedFetch(url, { refresh = ARGS.refresh, cacheKey } = {}) {
  const key = cacheKey ?? url.replace(/[^a-z0-9]+/gi, '_').slice(0, 180);
  const file = path.join(CACHE_DIR, `${key}.json`);

  if (!refresh) {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8'));
    } catch {
      /* cache miss */
    }
  }

  let lastErr;
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        redirect: 'follow',
      });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(file, JSON.stringify(json));
      return json;
    } catch (err) {
      lastErr = err;
      if (attempt < RETRIES) await sleep(400 * (attempt + 1));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
}

/** Run `worker` over `items` with a fixed concurrency ceiling. */
async function pool(items, worker, concurrency = CONCURRENCY) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor;
      cursor += 1;
      results[i] = await worker(items[i], i);
      await sleep(DELAY_MS);
    }
  });
  await Promise.all(runners);
  return results;
}

/* ------------------------------------------------------------ discovery */

async function discover(collection, { rows, page }) {
  const params = new URLSearchParams();
  params.set('q', `collection:${collection} AND mediatype:movies`);
  params.append('fl[]', 'identifier');
  params.append('fl[]', 'title');
  params.append('fl[]', 'year');
  params.append('fl[]', 'description');
  params.append('fl[]', 'subject');
  params.set('rows', String(rows));
  params.set('page', String(page));
  params.set('output', 'json');
  const url = `https://archive.org/advancedsearch.php?${params.toString()}`;
  const json = await cachedFetch(url, {
    cacheKey: `search_${collection}_p${page}_r${rows}`,
  });
  const docs = json?.response?.docs;
  return Array.isArray(docs) ? docs : [];
}

/* ----------------------------------------------------------- file choice */

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|tiff?|svg|ico)$/i;

function bestFile(files) {
  if (!Array.isArray(files)) return null;
  const mp4s = files.filter((f) => {
    if (!f || typeof f.name !== 'string') return false;
    if (!/\.mp4$/i.test(f.name)) return false;
    if (IMAGE_EXT.test(f.name)) return false;
    return true;
  });

  const playable = mp4s.filter((f) => Number(f.size ?? 0) >= MIN_BYTES);
  if (!playable.length) return null;

  const isDerivativeH264 = (f) => {
    const format = String(f.format ?? '').toLowerCase();
    const source = String(f.source ?? '').toLowerCase();
    const isH264 = format.includes('h.264') || format.includes('h264') || format === 'mpeg4' || format.includes('mpeg4');
    return isH264 && source === 'derivative';
  };

  const tierA = playable.filter(isDerivativeH264);
  const pool = tierA.length ? tierA : playable;
  return pool.sort((a, b) => Number(b.size ?? 0) - Number(a.size ?? 0))[0];
}

/* ---------------------------------------------------------- normalising */

const HTML_TAG = /<[^>]*>/g;
const WIKI_JUNK = [
  /This article (?:is|needs)[^.]*\./gi,
  /From Wikipedia,? the free encyclopedia/gi,
  /\[\d+\]/g,
  /\(\s*\)/g,
  /\s{2,}/g,
];

function cleanText(input, max = 600) {
  if (!input) return '';
  let text = Array.isArray(input) ? input.join(' ') : String(input);
  text = text.replace(HTML_TAG, ' ');
  text = text.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"');
  text = text.replace(/&#\d+;/g, ' ');
  for (const rule of WIKI_JUNK) text = text.replace(rule, ' ');
  text = text.trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > max * 0.5) return cut.slice(0, lastStop + 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).trim()}…`;
}

/**
 * Ordered genre rules — first match wins. Order matters: specific buckets are
 * tested before broad ones so "crime drama" lands in noir rather than drama.
 */
const GENRE_RULES = [
  { genre: 'Animation', test: /animation|cartoon|stop.?motion|puppet/i },
  { genre: 'Classic TV', test: /classic_tv|television|\btv\b|tv_series|episode/i },
  { genre: 'Sci-Fi & Horror', test: /sci-?fi|science fiction|horror|monster|alien|space[ -]?(travel|age)|mad scientist/i },
  { genre: 'Film Noir', test: /noir|hardboiled|detective|private eye|crime|murder|mystery|gangster|heist|suspense|thriller|racketeer/i },
  { genre: 'Comedy', test: /comedy|comedies|slapstick|farce|humou?r/i },
  { genre: 'Western', test: /western|cowboy|frontier/i },
  { genre: 'Documentary', test: /documentary|newsreel|educational|propaganda|instructional|avgeeks/i },
  { genre: 'Adventure', test: /adventure|swashbuck|serial|jungle|pirate/i },
  { genre: 'Drama', test: /drama|romance|melodrama/i },
];

function deriveGenre(item, collections, subjects) {
  const haystack = [collections.join(' '), subjects.join(' '), item.title ?? '', cleanText(item.description, 500)].join(' ');
  for (const rule of GENRE_RULES) if (rule.test.test(haystack)) return rule.genre;
  return 'Drama';
}

function deriveDecade(year) {
  const n = Number.parseInt(String(year ?? ''), 10);
  if (!Number.isFinite(n) || n < 1890 || n > 2100) return 'Unknown';
  return `${Math.floor(n / 10) * 10}s`;
}

function pickLicence(metadata) {
  const raw =
    metadata?.licenseurl ??
    metadata?.license_url ??
    metadata?.['licenseurl'] ??
    '';
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return 'Public domain';
}

function toRecord(item, meta, collection) {
  const files = meta?.files;
  const file = bestFile(files);
  if (!file) return { skipped: 'no-playable-mp4', id: item.identifier };

  const md = meta?.metadata ?? {};
  const id = String(item.identifier);
  const identifier = id;
  const fileName = String(file.name);
  const collections = []
    .concat(md.collection ?? [])
    .concat(collection)
    .flat()
    .filter((c) => typeof c === 'string')
    .map((c) => c.trim())
    .filter(Boolean);
  const uniqueCollections = [...new Set(collections)];

  const subjectRaw = md.subject ?? item.subject ?? [];
  const subjects = (Array.isArray(subjectRaw) ? subjectRaw : String(subjectRaw).split(/[;,]/))
    .flat()
    .map((s) => String(s).trim())
    .filter((s) => s && s.length < 60)
    .slice(0, 8);

  const title = cleanText(md.title ?? item.title ?? identifier, 200) || identifier;
  const description = cleanText(md.description ?? item.description ?? '', 600);
  const year =
    Number.parseInt(String(md.year ?? item.year ?? (md.date ?? '').toString().slice(0, 4) ?? ''), 10) || null;
  const runtimeSeconds = Number.parseFloat(String(file.length ?? md.runtime ?? '')) || null;
  const width = Number.parseInt(String(file.width ?? ''), 10) || null;
  const height = Number.parseInt(String(file.height ?? ''), 10) || null;

  return {
    id,
    title,
    year,
    decade: deriveDecade(year),
    description:
      description ||
      `${title} is a ${year ? `${year} ` : ''}public-domain film preserved by the Internet Archive.`,
    runtimeSeconds,
    width,
    height,
    posterUrl: `https://archive.org/services/img/${encodeURIComponent(identifier)}`,
    streamUrl: `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(fileName)}`,
    downloadUrl: `https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(fileName)}`,
    collections: uniqueCollections,
    subjectTags: subjects,
    genre: deriveGenre(item, uniqueCollections, subjects),
    licence: pickLicence(md),
    sourceUrl: `https://archive.org/details/${encodeURIComponent(identifier)}`,
  };
}

/* ------------------------------------------------------------------ main */

async function main() {
  log(`OpenReel ingest — ${COLLECTIONS.length} collections${ARGS.refresh ? ' (refresh)' : ' (cached)'}`);
  const stats = { scanned: 0, selected: 0, skipped: 0, collections: [], playable: 0 };
  const byId = new Map();

  // Incremental by default: keep titles already in the catalogue so a run over a
  // subset of collections (or a collection that is temporarily flaky) tops the
  // catalogue up instead of shrinking it. `--refresh` rebuilds from scratch.
  if (!ARGS.refresh) {
    try {
      const existing = JSON.parse(await fs.readFile(OUT_FILE, 'utf8'));
      for (const item of existing.items ?? []) if (item?.id) byId.set(item.id, item);
      if (byId.size) log(`  · keeping ${byId.size} existing titles`);
    } catch {
      /* first run — nothing to merge */
    }
  }

  const addedThisRun = new Set();

  for (const collection of COLLECTIONS) {
    let docs = [];
    for (let page = 1; page <= ARGS.pages; page += 1) {
      try {
        const pageDocs = await discover(collection, { rows: ARGS.rows, page });
        docs = docs.concat(pageDocs);
        if (pageDocs.length < ARGS.rows) break;
      } catch (err) {
        log(`  ! ${collection} page ${page}: ${err.message}`);
        break;
      }
    }

    docs = docs.filter((d) => d?.identifier);
    if (!docs.length) {
      log(`  - ${collection}: 0 items, skipped`);
      stats.collections.push({ collection, found: 0, kept: 0 });
      continue;
    }

    if (ARGS.limit) {
      const room = ARGS.limit - stats.selected;
      if (room <= 0) break;
      docs = docs.slice(0, Math.max(room, 4));
    }

    stats.scanned += docs.length;
    let kept = 0;

    await pool(docs, async (doc) => {
      let meta;
      try {
        meta = await cachedFetch(`https://archive.org/metadata/${encodeURIComponent(doc.identifier)}`, {
          cacheKey: `meta_${doc.identifier}`,
        });
      } catch (err) {
        stats.skipped += 1;
        return;
      }
      const record = toRecord(doc, meta, collection);
      if (record.skipped) {
        stats.skipped += 1;
        return;
      }
      byId.set(record.id, record);
      if (!addedThisRun.has(record.id)) {
        addedThisRun.add(record.id);
        kept += 1;
      }
    });

    stats.collections.push({ collection, found: docs.length, kept });
    log(`  + ${collection}: ${docs.length} scanned, ${kept} selected`);
  }

  const items = [...byId.values()].sort((a, b) => {
    if ((a.year ?? 0) !== (b.year ?? 0)) return (b.year ?? 0) - (a.year ?? 0);
    return a.title.localeCompare(b.title);
  });

  stats.selected = items.length;
  stats.playable = items.length;

  const catalogue = {
    generatedAt: new Date().toISOString(),
    source: 'Internet Archive',
    collections: COLLECTIONS,
    stats: {
      scanned: stats.scanned,
      selected: stats.selected,
      skipped: stats.skipped,
    },
    items,
  };

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, `${JSON.stringify(catalogue, null, 2)}\n`);

  log('');
  log('─────────────────────────────────────────────');
  log(`items scanned     ${stats.scanned}`);
  log(`items selected    ${stats.selected}`);
  log(`items skipped     ${stats.skipped}`);
  log(`playable URLs     ${stats.playable}`);
  log(`written to        ${path.relative(ROOT, OUT_FILE)}`);
  log('─────────────────────────────────────────────');
}

main().catch((err) => {
  console.error('ingest failed:', err);
  process.exitCode = 1;
});
