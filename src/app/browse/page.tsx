import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { BrowseFilters } from '@/components/BrowseFilters';
import { PosterCard } from '@/components/PosterCard';
import { DECADES, GENRES, getItems, mediaTypeOf, sortItems } from '@/lib/catalogue';
import { FilmIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Browse the catalogue',
  description: 'Filter public-domain movies and classic TV by type, genre, decade and runtime.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function BrowsePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const type = first(params.type);
  const genre = first(params.genre);
  const decade = first(params.decade);
  const sort = first(params.sort) || 'title';
  const q = first(params.q).trim().toLowerCase();

  let items = getItems();
  if (type === 'movie' || type === 'tv') items = items.filter((item) => mediaTypeOf(item) === type);
  if (genre) items = items.filter((item) => item.genre === genre);
  if (decade) items = items.filter((item) => item.decade === decade);
  if (q) {
    items = items.filter((item) =>
      `${item.title} ${item.description} ${item.subjectTags.join(' ')}`.toLowerCase().includes(q),
    );
  }
  items = sortItems(items, sort);

  const activeGenres = GENRES.filter((g) => getItems().some((item) => item.genre === g));
  const activeDecades = DECADES.filter((d) => getItems().some((item) => item.decade === d));

  return (
    <div className="mx-auto max-w-[1400px] px-[var(--gutter)] py-10">
      <header className="mb-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">Catalogue</p>
        <h1 className="mt-2 text-[1.9rem] font-semibold sm:text-[2.4rem]">Browse everything</h1>
        <p className="mt-2 max-w-[64ch] text-[0.93rem] leading-relaxed text-muted">
          {items.length.toLocaleString()} title{items.length === 1 ? '' : 's'} matching your filters. Every entry
          streams from the Internet Archive under its collection&apos;s licence.
        </p>
      </header>

      <Suspense fallback={<div className="skeleton h-[76px] rounded-[var(--radius-card)]" />}>
        <BrowseFilters genres={activeGenres} decades={activeDecades} />
      </Suspense>

      {items.length === 0 ? (
        <div className="mt-10 rounded-[var(--radius-card)] border border-dashed border-line bg-surface/60 p-12 text-center">
          <FilmIcon className="mx-auto h-8 w-8 text-muted" />
          <h2 className="mt-4 text-[1.2rem] font-semibold">No titles match those filters</h2>
          <p className="mx-auto mt-2 max-w-[48ch] text-[0.9rem] leading-relaxed text-muted">
            The catalogue is deep but not infinite. Try widening the decade, dropping the genre, or clearing the
            keyword.
          </p>
          <Link
            href="/browse"
            className="mt-6 inline-block rounded-[var(--radius-card)] bg-accent px-4 py-2.5 text-[0.88rem] font-semibold text-[#04231f]"
          >
            Clear all filters
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <li key={item.id}>
              <PosterCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
