'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { formatRuntime } from '@/lib/format';
import { InfoIcon, PlayIcon } from './Icons';

export function HeroCarousel({ items }: { items: CatalogueItem[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), 9000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) return null;
  const item = items[index];

  return (
    <section aria-roledescription="carousel" aria-label="Featured public-domain films" className="relative">
      <div className="relative h-[64vh] min-h-[420px] w-full overflow-hidden sm:h-[70vh] lg:h-[76vh]">
        {items.map((entry, i) => (
          <div
            key={entry.id}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.posterUrl}
              alt=""
              className="h-full w-full scale-105 object-cover opacity-70"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
        <div className="hero-scrim absolute inset-0" />

        <div className="absolute inset-0 flex items-end pb-16 sm:items-center sm:pb-0">
          <div className="max-w-[41rem] px-[var(--gutter)]">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-accent">
              Public domain · Free to stream
            </p>
            <h1 className="text-[2.1rem] font-semibold leading-[1.02] sm:text-[3rem] lg:text-[3.6rem]">
              {item.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.85rem] text-muted">
              <span className="font-variant-numeric tabular-nums">{item.year ?? 'Year unknown'}</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted/50" />
              <span>{formatRuntime(item.runtimeSeconds)}</span>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-muted/50" />
              <span className="text-ink/80">{item.genre}</span>
            </div>
            <p className="mt-4 hidden max-w-[52ch] text-[0.95rem] leading-relaxed text-ink/80 sm:block">
              {item.description.slice(0, 220)}
              {item.description.length > 220 ? '…' : ''}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={`/watch/${item.id}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-accent px-5 py-3 text-[0.92rem] font-semibold text-[#04231f] transition-colors hover:bg-[#5ad7d7]"
              >
                <PlayIcon className="h-4 w-4" />
                Play
              </Link>
              <Link
                href={`/title/${item.id}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-line bg-[rgb(22_27_35/0.7)] px-5 py-3 text-[0.92rem] font-medium text-ink transition-colors hover:border-accent/60 hover:text-accent"
              >
                <InfoIcon className="h-4 w-4" />
                More info
              </Link>
            </div>
          </div>
        </div>

        {count > 1 ? (
          <div className="absolute bottom-5 right-[var(--gutter)] flex items-center gap-2">
            {items.map((entry, i) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${entry.title}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-7 bg-accent' : 'w-3 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
