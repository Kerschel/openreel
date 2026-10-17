import fs from 'node:fs';
import path from 'node:path';
import type { Catalogue, CatalogueItem } from './types';

const CATALOGUE_PATH = path.join(process.cwd(), 'src', 'data', 'catalogue.json');

let cache: Catalogue | null = null;

export function getCatalogue(): Catalogue {
  if (cache) return cache;
  const raw = fs.readFileSync(CATALOGUE_PATH, 'utf8');
  cache = JSON.parse(raw) as Catalogue;
  return cache;
}

export function getItems(): CatalogueItem[] {
  return getCatalogue().items;
}

/**
 * Ids prerendered at build time. The catalogue is intentionally larger than the
 * prerender budget so the build stays inside a small CI container's memory; the
 * router renders any other title on demand (`dynamicParams` default) and caches
 * it, so every title is still reachable.
 */
export function prerenderIds(perRoute = 150): string[] {
  return getItems()
    .slice(0, perRoute)
    .map((item) => item.id);
}

export function getItem(id: string): CatalogueItem | undefined {
  return getItems().find((item) => item.id === id);
}

export function getAdjacent(id: string): { next?: CatalogueItem; previous?: CatalogueItem } {
  const items = getItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return {};
  return { next: items[(index + 1) % items.length], previous: items[(index - 1 + items.length) % items.length] };
}

export const GENRES = [
  'Drama',
  'Comedy',
  'Film Noir',
  'Sci-Fi & Horror',
  'Mystery & Crime',
  'Animation',
  'Western',
  'Documentary',
  'Adventure',
  'Classic TV',
] as const;

export const DECADES = [
  '1890s',
  '1900s',
  '1910s',
  '1920s',
  '1930s',
  '1940s',
  '1950s',
  '1960s',
  '1970s',
  '1980s',
  '1990s',
  'Unknown',
] as const;

export function mediaTypeOf(item: CatalogueItem): 'tv' | 'movie' {
  const haystack = [...item.collections, ...item.subjectTags, item.genre].join(' ').toLowerCase();
  if (item.genre === 'Classic TV') return 'tv';
  return /classic_tv|television|tv_series|\btv\b|episode|serials?/.test(haystack) ? 'tv' : 'movie';
}

export function sortItems(items: CatalogueItem[], sort: string): CatalogueItem[] {
  const copy = [...items];
  switch (sort) {
    case 'year':
    case 'year-asc':
      return copy.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999));
    case 'newest':
      return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case 'runtime':
      return copy.sort((a, b) => (a.runtimeSeconds ?? 1e9) - (b.runtimeSeconds ?? 1e9));
    case 'runtime-desc':
      return copy.sort((a, b) => (b.runtimeSeconds ?? 0) - (a.runtimeSeconds ?? 0));
    case 'title-desc':
      return copy.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
}

/** Deterministic pseudo-shuffle so SSG and client agree on ordering. */
export function seededOrder(items: CatalogueItem[], seed: number): CatalogueItem[] {
  const copy = [...items];
  let s = seed || 1;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function featured(items: CatalogueItem[], count = 5): CatalogueItem[] {
  return items
    .filter((i) => i.description.length > 120 && i.title.length > 3)
    .slice(0, count);
}

export function byGenre(items: CatalogueItem[], genre: string, limit = 24): CatalogueItem[] {
  return items.filter((i) => i.genre === genre).slice(0, limit);
}

export function topTen(items: CatalogueItem[]): CatalogueItem[] {
  return seededOrder(items.filter((i) => mediaTypeOf(i) === 'movie'), 7).slice(0, 10);
}

export function trending(items: CatalogueItem[], limit = 24): CatalogueItem[] {
  return seededOrder(items, 42).slice(0, limit);
}

export function newRestorations(items: CatalogueItem[], limit = 24): CatalogueItem[] {
  return seededOrder(
    [...items].sort((a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0)).slice(0, 120),
    11,
  ).slice(0, limit);
}

export function similarTo(item: CatalogueItem, limit = 18): CatalogueItem[] {
  const scored = getItems()
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => {
      let score = candidate.genre === item.genre ? 4 : 0;
      if (candidate.decade === item.decade) score += 1;
      for (const c of candidate.collections) if (item.collections.includes(c)) score += 2;
      for (const s of candidate.subjectTags) if (item.subjectTags.includes(s)) score += 1;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.candidate);
}

export type SearchEntry = {
  id: string;
  title: string;
  year: number | null;
  genre: string;
  media: 'tv' | 'movie';
  posterUrl: string;
  keywords: string;
  runtimeSeconds: number | null;
};

export function buildSearchIndex(items: CatalogueItem[]): SearchEntry[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    year: item.year,
    genre: item.genre,
    media: mediaTypeOf(item),
    posterUrl: item.posterUrl,
    runtimeSeconds: item.runtimeSeconds,
    keywords: `${item.subjectTags.join(' ')} ${item.description.slice(0, 180)}`.toLowerCase(),
  }));
}
