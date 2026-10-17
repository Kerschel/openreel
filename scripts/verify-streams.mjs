#!/usr/bin/env node
/**
 * Spot-check stream URLs from the committed catalogue.
 *
 * Sends an HTTP GET with `Range: bytes=0-1023` (the same request shape a browser
 * makes to start playback) and asserts 200/206 + a video/* content type.
 *
 *   node scripts/verify-streams.mjs            # 10 random titles
 *   node scripts/verify-streams.mjs --count 25
 *   node scripts/verify-streams.mjs --all
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOGUE = path.join(__dirname, '..', 'src', 'data', 'catalogue.json');

const args = process.argv.slice(2);
const all = args.includes('--all');
const countIndex = args.indexOf('--count');
const count = countIndex >= 0 ? Number(args[countIndex + 1]) : 10;

const catalogue = JSON.parse(await fs.readFile(CATALOGUE, 'utf8'));
let items = catalogue.items;
if (!all && Number.isFinite(count)) {
  // Deterministic sample so runs are comparable.
  items = items.filter((_, i) => i % Math.max(1, Math.floor(items.length / count)) === 0).slice(0, count);
}

let pass = 0;
const failures = [];

for (const item of items) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(item.streamUrl, {
      method: 'GET',
      headers: { Range: 'bytes=0-1023', 'User-Agent': 'OpenReelStreamCheck/1.0' },
      signal: controller.signal,
      redirect: 'follow',
    });
    const type = res.headers.get('content-type') ?? '';
    const ok = (res.status === 200 || res.status === 206) && /^video\//i.test(type);
    if (ok) {
      pass += 1;
      console.log(`  PASS ${res.status} ${type.padEnd(16)} ${item.id}`);
    } else {
      failures.push({ id: item.id, status: res.status, type, url: item.streamUrl });
      console.log(`  FAIL ${res.status} ${type || 'no content-type'} ${item.id}`);
    }
  } catch (err) {
    failures.push({ id: item.id, status: 0, type: String(err?.message ?? err), url: item.streamUrl });
    console.log(`  FAIL network ${item.id}: ${err?.message ?? err}`);
  } finally {
    clearTimeout(timer);
  }
}

console.log('');
console.log(`Checked ${items.length} streams — ${pass}/${items.length} returned 200/206 with video/* content type.`);
if (failures.length) {
  console.log('Failures:');
  for (const failure of failures) console.log(`  ${failure.id} → ${failure.status} ${failure.type}`);
  process.exitCode = 1;
}
