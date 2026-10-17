import type { Metadata } from 'next';
import Link from 'next/link';
import { PosterCard } from '@/components/PosterCard';
import { getItems } from '@/lib/catalogue';
import { SearchIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search public-domain films and classic television by title, genre, subject or year.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.q;
  const query = (Array.isArray(raw) ? raw[0] : raw ?? '').trim();
  const needle = query.toLowerCase();

  const items = needle
    ? getItems()
        .map((item) => {
          const title = item.title.toLowerCase();
          let score = 0;
          if (title === needle) score += 100;
          else if (title.startsWith(needle)) score += 70;
          else if (title.includes(needle)) score += 50;
          if (item.genre.toLowerCase().includes(needle)) score += 25;
          if (String(item.year ?? '').includes(needle)) score += 20;
          if (item.description.toLowerCase().includes(needle)) score += 10;
          if (item.subjectTags.some((tag) => tag.toLowerCase().includes(needle))) score += 12;
          return { item, score };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item)
        .slice(0, 120)
    : [];

  return (
    <div className="mx-auto max-w-[1400px] px-[var(--gutter)] py-10">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">Search</p>
        <h1 className="mt-2 text-[1.9rem] font-semibold sm:text-[2.4rem]">
          {query ? <>Results for “{query}”</> : 'Search the catalogue'}
        </h1>
        <p className="mt-2 max-w-[64ch] text-[0.93rem] leading-relaxed text-muted">
          {query
            ? `${items.length.toLocaleString()} match${items.length === 1 ? '' : 'es'} across titles, genres, subjects and synopses.`
            : 'Use the search field above, or press ⌘K / Ctrl+K anywhere on the site.'}
        </p>
      </header>

      {!query ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface/60 p-12 text-center">
          <SearchIcon className="mx-auto h-8 w-8 text-muted" />
          <h2 className="mt-4 text-[1.2rem] font-semibold">Start typing to search</h2>
          <p className="mx-auto mt-2 max-w-[46ch] text-[0.9rem] leading-relaxed text-muted">
            Try “noir”, “Lugosi”, “1927” or “science fiction”. The index covers every title in the catalogue.
          </p>
          <Link
            href="/browse"
            className="mt-6 inline-block rounded-[var(--radius-card)] bg-accent px-4 py-2.5 text-[0.88rem] font-semibold text-[#04231f]"
          >
            Browse instead
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface/60 p-12 text-center">
          <h2 className="text-[1.2rem] font-semibold">No titles matched “{query}”</h2>
          <p className="mx-auto mt-2 max-w-[48ch] text-[0.9rem] leading-relaxed text-muted">
            Spelling matters less than you&apos;d think — try a shorter phrase, a genre name, or a decade.
          </p>
          <Link
            href="/browse"
            className="mt-6 inline-block rounded-[var(--radius-card)] bg-accent px-4 py-2.5 text-[0.88rem] font-semibold text-[#04231f]"
          >
            Browse the catalogue
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
