import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { formatResolution, formatRuntime } from '@/lib/format';

export function PosterCard({
  item,
  priority = false,
}: {
  item: CatalogueItem;
  priority?: boolean;
}) {
  const resolution = formatResolution(item.width, item.height);
  return (
    <Link
      href={`/title/${item.id}`}
      className="poster-card group block w-full focus-visible:outline-none"
      aria-label={`${item.title}${item.year ? `, ${item.year}` : ''} — ${item.genre}, ${formatRuntime(item.runtimeSeconds)}`}
    >
      <div className="poster-shell aspect-[2/3] bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.posterUrl}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="poster-meta absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(7_8_11/0.96)] via-[rgb(7_8_11/0.72)] to-transparent p-2.5">
          <p className="text-[0.72rem] font-medium leading-tight text-ink">
            {formatRuntime(item.runtimeSeconds)}
            {resolution ? <span className="text-muted"> · {resolution}</span> : null}
          </p>
          <p className="mt-0.5 truncate text-[0.68rem] uppercase tracking-[0.08em] text-accent">{item.genre}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-[0.82rem] font-medium leading-snug text-ink/90 group-hover:text-ink">
        {item.title}
      </p>
      <p className="text-[0.72rem] text-muted">{item.year ?? 'Year unknown'}</p>
    </Link>
  );
}
