'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { PosterCard } from './PosterCard';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

type Props = {
  title: string;
  items: CatalogueItem[];
  moreHref?: string;
  variant?: 'default' | 'top10';
  emptyHint?: string;
};

export function Rail({ title, items, moreHref, variant = 'default', emptyHint }: Props) {
  const scroller = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    measure();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure, items.length]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 280), behavior: 'smooth' });
  };

  return (
    <section className="group/rail relative">
      <div className="mb-3 flex items-end justify-between gap-4 px-[var(--gutter)]">
        <h2 className="text-[1.32rem] font-semibold sm:text-[1.5rem]">{title}</h2>
        {moreHref ? (
          <Link
            href={moreHref}
            className="inline-flex items-center gap-1 pb-1 text-[0.8rem] font-medium text-muted transition-colors hover:text-accent"
          >
            See all
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="px-[var(--gutter)] text-sm text-muted">{emptyHint ?? 'Nothing here yet.'}</p>
      ) : (
        <div className="relative">
          <div
            ref={scroller}
            className="no-scrollbar rail-mask flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-[var(--gutter)] pb-2 sm:gap-4"
            style={{ scrollPaddingLeft: 'var(--gutter)' }}
          >
            {items.map((item, index) =>
              variant === 'top10' ? (
                <Link
                  key={item.id}
                  href={`/title/${item.id}`}
                  className="poster-card group flex shrink-0 snap-start items-end"
                  aria-label={`Number ${index + 1}: ${item.title}`}
                >
                  <span
                    className="outline-numeral select-none pr-1 text-[7rem] sm:text-[8.5rem]"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div className="-ml-6 w-[104px] shrink-0 sm:w-[124px]">
                    <div className="poster-shell aspect-[2/3] bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.posterUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 line-clamp-1 text-[0.78rem] text-muted group-hover:text-ink">{item.title}</p>
                  </div>
                </Link>
              ) : (
                <div key={item.id} className="w-[122px] shrink-0 snap-start sm:w-[148px] lg:w-[162px]">
                  <PosterCard item={item} />
                </div>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() => page(-1)}
            aria-label={`Scroll ${title} left`}
            disabled={atStart}
            className="absolute left-1 top-[34%] hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-[rgb(7_8_11/0.82)] text-ink opacity-0 transition-opacity hover:border-accent hover:text-accent disabled:pointer-events-none md:flex group-hover/rail:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            aria-label={`Scroll ${title} right`}
            disabled={atEnd}
            className="absolute right-1 top-[34%] hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-[rgb(7_8_11/0.82)] text-ink opacity-0 transition-opacity hover:border-accent hover:text-accent disabled:pointer-events-none md:flex group-hover/rail:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
