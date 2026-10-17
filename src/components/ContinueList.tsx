'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearProgress, readProgress, type ProgressEntry } from '@/lib/progress';
import { formatTime } from '@/lib/format';
import { ClockIcon, PlayIcon } from './Icons';

export function ContinueList() {
  const [entries, setEntries] = useState<ProgressEntry[] | null>(null);

  useEffect(() => {
    setEntries(readProgress());
  }, []);

  if (entries === null) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-[120px] rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-surface/60 p-10 text-center">
        <ClockIcon className="mx-auto h-7 w-7 text-muted" />
        <h2 className="mt-4 text-[1.15rem] font-semibold">Nothing in progress yet</h2>
        <p className="mx-auto mt-2 max-w-[46ch] text-[0.9rem] leading-relaxed text-muted">
          Start any film and OpenReel will remember where you stopped — stored in this browser only, never on a
          server.
        </p>
        <Link
          href="/browse"
          className="mt-6 inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-accent px-4 py-2.5 text-[0.88rem] font-semibold text-[#04231f]"
        >
          <PlayIcon className="h-3.5 w-3.5" />
          Browse the catalogue
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => {
        const pct = entry.duration > 0 ? Math.min(100, (entry.position / entry.duration) * 100) : 0;
        return (
          <li
            key={entry.id}
            className="flex gap-3 rounded-[var(--radius-card)] border border-line bg-surface p-3"
          >
            <Link href={`/watch/${entry.id}`} className="shrink-0" aria-label={`Resume ${entry.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.posterUrl}
                alt=""
                className="h-[100px] w-[67px] rounded-[4px] object-cover"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[0.9rem] font-medium leading-snug">{entry.title}</p>
              <p className="mt-1 text-[0.72rem] text-muted">
                {entry.year ?? '—'} · {entry.genre}
              </p>
              <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/15">
                <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 font-variant-numeric text-[0.7rem] tabular-nums text-muted">
                {formatTime(entry.position)} / {formatTime(entry.duration)}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <Link href={`/watch/${entry.id}`} className="text-[0.76rem] font-medium text-accent hover:underline">
                  Resume
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    clearProgress(entry.id);
                    setEntries(readProgress());
                  }}
                  className="text-[0.76rem] text-muted hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
