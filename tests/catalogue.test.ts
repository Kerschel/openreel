import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

type Item = {
  id: string;
  title: string;
  year: number | null;
  decade: string;
  description: string;
  runtimeSeconds: number | null;
  posterUrl: string;
  streamUrl: string;
  downloadUrl: string;
  collections: string[];
  subjectTags: string[];
  genre: string;
  licence: string;
  sourceUrl: string;
};

const cataloguePath = path.join(process.cwd(), 'src', 'data', 'catalogue.json');
const catalogue = JSON.parse(fs.readFileSync(cataloguePath, 'utf8')) as {
  generatedAt: string;
  source: string;
  collections: string[];
  stats: { scanned: number; selected: number; skipped: number };
  items: Item[];
};

const items = catalogue.items;

describe('catalogue.json', () => {
  it('is sourced only from the Internet Archive', () => {
    expect(catalogue.source).toBe('Internet Archive');
    expect(catalogue.collections.length).toBeGreaterThan(0);
  });

  it('contains at least 300 playable titles', () => {
    expect(items.length).toBeGreaterThanOrEqual(300);
  });

  it('has unique identifiers', () => {
    const ids = new Set(items.map((item) => item.id));
    expect(ids.size).toBe(items.length);
  });

  it.each(items.map((item) => [item.id, item] as const))('%s has valid required fields', (_id, item) => {
    expect(typeof item.id).toBe('string');
    expect(item.id.length).toBeGreaterThan(0);
    expect(item.title.trim().length).toBeGreaterThan(0);
    expect(item.description.trim().length).toBeGreaterThan(0);

    // Year is either a plausible number or null — never NaN/undefined.
    if (item.year !== null) {
      expect(Number.isInteger(item.year)).toBe(true);
      expect(item.year).toBeGreaterThan(1880);
      expect(item.year).toBeLessThan(2100);
    }

    expect(item.decade).toMatch(/^(\d{4}s|Unknown)$/);
    expect(item.genre.trim().length).toBeGreaterThan(0);
    expect(item.licence.trim().length).toBeGreaterThan(0);
    expect(Array.isArray(item.collections)).toBe(true);
    expect(Array.isArray(item.subjectTags)).toBe(true);
  });

  it.each(items.map((item) => [item.id, item] as const))('%s has an https archive.org stream URL', (_id, item) => {
    const url = new URL(item.streamUrl);
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('archive.org');
    // Direct playable pattern: /download/<identifier>/<encoded file name>
    expect(url.pathname.startsWith('/download/')).toBe(true);
    const segments = url.pathname.split('/').filter(Boolean);
    expect(segments.length).toBeGreaterThanOrEqual(3);
    expect(decodeURIComponent(segments[1])).toBe(item.id);
    expect(decodeURIComponent(segments.slice(2).join('/'))).toMatch(/\.mp4$/i);
    expect(url.pathname).not.toContain(' ');
  });

  it.each(items.map((item) => [item.id, item] as const))('%s has valid poster and source URLs', (_id, item) => {
    expect(new URL(item.posterUrl).hostname).toBe('archive.org');
    const source = new URL(item.sourceUrl);
    expect(source.hostname).toBe('archive.org');
    expect(source.pathname).toBe(`/details/${item.id}`);
    expect(item.posterUrl.startsWith('https://')).toBe(true);
    expect(item.sourceUrl.startsWith('https://')).toBe(true);
  });
});
