'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { SearchEntry } from '@/lib/catalogue';
import { formatRuntime } from '@/lib/format';
import { CloseIcon, SearchIcon } from './Icons';

function score(entry: SearchEntry, query: string): number {
  const title = entry.title.toLowerCase();
  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (title.includes(query)) return 60;
  if (entry.keywords.includes(query)) return 30;
  if (entry.genre.toLowerCase().includes(query)) return 20;
  if (String(entry.year ?? '').includes(query)) return 15;
  return 0;
}

export function SearchOverlay({
  open,
  onClose,
  index,
}: {
  open: boolean;
  onClose: () => void;
  index: SearchEntry[];
}) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery('');
      setDebounced('');
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim().toLowerCase()), 140);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!debounced) return [];
    return index
      .map((entry) => ({ entry, s: score(entry, debounced) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || (b.entry.year ?? 0) - (a.entry.year ?? 0))
      .slice(0, 8)
      .map((r) => r.entry);
  }, [debounced, index]);

  useEffect(() => {
    setActive(0);
  }, [debounced]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (results[active]) {
        router.push(`/title/${results[active].id}`);
        onClose();
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgb(3_4_6/0.78)] px-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Search the OpenReel catalogue"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-autocomplete="list"
            placeholder="Search public-domain films, genres, years…"
            className="h-14 w-full bg-transparent text-[1rem] text-ink placeholder:text-muted/70 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded p-1.5 text-muted hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div id="search-results" role="listbox" aria-label="Search results" className="max-h-[56vh] overflow-y-auto">
          {debounced === '' ? (
            <p className="px-4 py-6 text-[0.85rem] text-muted">
              Type a title, a genre like <span className="text-accent">noir</span>, or a year like{' '}
              <span className="text-accent">1954</span>.
            </p>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[0.95rem] text-ink">No matches for “{query.trim()}”.</p>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={onClose}
                className="mt-3 inline-block text-[0.85rem] font-medium text-accent underline-offset-4 hover:underline"
              >
                Open the full search page
              </Link>
            </div>
          ) : (
            results.map((entry, i) => (
              <Link
                key={entry.id}
                href={`/title/${entry.id}`}
                onClick={onClose}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                  i === active ? 'bg-surface-2' : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.posterUrl}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded-[4px] object-cover"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9rem] text-ink">{entry.title}</span>
                  <span className="block text-[0.74rem] text-muted">
                    {entry.year ?? '—'} · {entry.genre} · {formatRuntime(entry.runtimeSeconds)}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[0.7rem] text-muted">
          <span>↑ ↓ to move · Enter to open · Esc to close</span>
          <span className="text-accent">Internet Archive</span>
        </div>
      </div>
    </div>
  );
}
