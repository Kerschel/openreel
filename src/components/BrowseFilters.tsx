'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV' },
];

const SORTS = [
  { value: 'title', label: 'Title A–Z' },
  { value: 'year', label: 'Year (oldest)' },
  { value: 'newest', label: 'Year (newest)' },
  { value: 'runtime', label: 'Runtime (short)' },
  { value: 'runtime-desc', label: 'Runtime (long)' },
];

export function BrowseFilters({ genres, decades }: { genres: string[]; decades: string[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      next.delete('page');
      router.push(`/browse${next.toString() ? `?${next.toString()}` : ''}`, { scroll: false });
    },
    [params, router],
  );

  const current = (key: string) => params.get(key) ?? '';
  const hasFilters = ['type', 'genre', 'decade', 'sort', 'q'].some((key) => params.get(key));

  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-line bg-surface/70 p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-q" className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
          Keyword
        </label>
        <input
          id="filter-q"
          type="search"
          defaultValue={current('q')}
          onChange={(event) => {
            const value = event.target.value;
            window.clearTimeout((window as unknown as { __orT?: number }).__orT);
            (window as unknown as { __orT?: number }).__orT = window.setTimeout(() => update('q', value), 320);
          }}
          placeholder="Title or subject"
          className="h-10 w-[13rem] rounded-[6px] border border-line bg-page px-3 text-[0.86rem] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-type" className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
          Type
        </label>
        <select
          id="filter-type"
          value={current('type')}
          onChange={(event) => update('type', event.target.value)}
          className="h-10 rounded-[6px] border border-line bg-page px-2 text-[0.86rem] text-ink focus:border-accent focus:outline-none"
        >
          {TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-genre" className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
          Genre
        </label>
        <select
          id="filter-genre"
          value={current('genre')}
          onChange={(event) => update('genre', event.target.value)}
          className="h-10 rounded-[6px] border border-line bg-page px-2 text-[0.86rem] text-ink focus:border-accent focus:outline-none"
        >
          <option value="">All genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-decade" className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
          Decade
        </label>
        <select
          id="filter-decade"
          value={current('decade')}
          onChange={(event) => update('decade', event.target.value)}
          className="h-10 rounded-[6px] border border-line bg-page px-2 text-[0.86rem] text-ink focus:border-accent focus:outline-none"
        >
          <option value="">All decades</option>
          {decades.map((decade) => (
            <option key={decade} value={decade}>
              {decade}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="filter-sort" className="text-[0.7rem] font-medium uppercase tracking-[0.1em] text-muted">
          Sort
        </label>
        <select
          id="filter-sort"
          value={current('sort') || 'title'}
          onChange={(event) => update('sort', event.target.value)}
          className="h-10 rounded-[6px] border border-line bg-page px-2 text-[0.86rem] text-ink focus:border-accent focus:outline-none"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.push('/browse', { scroll: false })}
          className="h-10 rounded-[6px] border border-line px-3 text-[0.82rem] text-muted hover:border-accent/60 hover:text-ink"
        >
          Reset
        </button>
      ) : null}
    </form>
  );
}
