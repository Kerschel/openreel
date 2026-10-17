'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { readProgress, type ProgressEntry } from '@/lib/progress';
import { formatTime } from '@/lib/format';
import { ClockIcon, PlayIcon } from './Icons';

export function ContinueRail() {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  useEffect(() => {
    setEntries(readProgress().slice(0, 12));
  }, []);

  if (entries === null) {
    return (
      <section aria-label="Continue watching" className="px-[var(--gutter)]">
        <div className="skeleton h-5 w-48 rounded" />
        <div className="mt-3 flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[92px] w-[164px] rounded-[var(--radius-poster)]" />
          ))}
        </div>
      </section>
    );
  }

  if (entries.length === 0) return null;

  return (
    <section aria-labelledby="continue-heading" className="px-[var(--gutter)]">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 id="continue-heading" className="text-[1.32rem] font-semibold sm:text-[1.5rem]">
          Continue watching
        </h2>
        <Link href="/continue" className="pb-1 text-[0.8rem] font-medium text-muted hover:text-accent">
          See all
        </Link>
      </div>
      <div className="no-scrollbar rail-mask flex snap-x gap-3 overflow-x-auto pb-2">
        {entries.map((entry) => {
          const pct = entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0;
          return (
            <Link
              key={entry.id}
              href={`/watch/${entry.id}`}
              className="group relative w-[190px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-poster)] border border-line bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.posterUrl} alt="" className="h-[107px] w-full object-cover opacity-85 group-hover:opacity-100" />
              <span className="absolute left-2 top-2 rounded-full bg-black/70 p-1.5">
                <PlayIcon className="h-3 w-3 text-accent" />
              </span>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/20">
                <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
              </span>
              <span className="block truncate px-2 py-2 text-[0.78rem] text-ink/90">{entry.title}</span>
              <span className="flex items-center gap-1 px-2 pb-2 text-[0.68rem] text-muted">
                <ClockIcon className="h-3 w-3" />
                {formatTime(entry.position)} of {formatTime(entry.duration)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
