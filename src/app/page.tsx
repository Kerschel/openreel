import Link from 'next/link';
import { HeroCarousel } from '@/components/HeroCarousel';
import { Rail } from '@/components/Rail';
import { ContinueRail } from '@/components/ContinueRail';
import { BecauseYouWatched } from '@/components/BecauseYouWatched';
import {
  byGenre,
  featured,
  getCatalogue,
  getItems,
  newRestorations,
  seededOrder,
  topTen,
  trending,
} from '@/lib/catalogue';

export default function HomePage() {
  const catalogue = getCatalogue();
  const items = getItems();
  const heroes = featured(items, 5);

  // Compact genre → titles map so the client-side "Because you watched" rail can
  // resolve a recommendation without a network request.
  const genreMap: Record<string, typeof items> = {};
  for (const item of items) {
    const bucket = (genreMap[item.genre] ??= []);
    if (bucket.length < 24) bucket.push(item);
  }

  const rails = [
    { title: 'Trending Now', items: trending(items, 20), href: '/browse?sort=newest' },
    { title: 'New Restorations', items: newRestorations(items, 20), href: '/browse?sort=newest' },
    { title: 'Film Noir', items: byGenre(items, 'Film Noir', 20), href: '/browse?genre=Film+Noir' },
    { title: 'Sci-Fi & Horror', items: byGenre(items, 'Sci-Fi & Horror', 20), href: '/browse?genre=Sci-Fi+%26+Horror' },
    { title: 'Classic TV', items: byGenre(items, 'Classic TV', 20), href: '/browse?type=tv' },
    { title: 'Silent Era', items: seededOrder(items.filter((i) => i.year !== null && i.year < 1930), 3).slice(0, 20), href: '/browse?decade=1920s' },
    { title: 'Animation', items: byGenre(items, 'Animation', 20), href: '/browse?genre=Animation' },
    { title: 'Comedy', items: byGenre(items, 'Comedy', 20), href: '/browse?genre=Comedy' },
    { title: 'Documentary & Newsreel', items: byGenre(items, 'Documentary', 20), href: '/browse?genre=Documentary' },
  ].filter((rail) => rail.items.length > 0);

  return (
    <div className="pb-8">
      <HeroCarousel items={heroes} />

      <div className="relative z-10 -mt-10 space-y-10 sm:space-y-12">
        <ContinueRail />

        <Rail title="Top 10 Movies Today" items={topTen(items)} variant="top10" moreHref="/browse?sort=newest" />

        {rails.map((rail) => (
          <Rail key={rail.title} title={rail.title} items={rail.items} moreHref={rail.href} />
        ))}

        <BecauseYouWatched byGenre={genreMap} />


        <section className="mx-auto max-w-[1280px] px-[var(--gutter)]">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface">
            <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.6fr_1fr] lg:items-center">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">
                  How OpenReel works
                </p>
                <h2 className="mt-3 text-[1.6rem] font-semibold sm:text-[2rem]">
                  Every film here is legal to watch, forever.
                </h2>
                <p className="mt-3 max-w-[62ch] text-[0.93rem] leading-relaxed text-muted">
                  OpenReel is a catalogue over {catalogue.stats.selected.toLocaleString()} public-domain and openly
                  licensed titles preserved by the Internet Archive. Nothing is re-hosted: the player streams the
                  archive&apos;s own MP4 derivatives straight from archive.org, with a link back to the original item
                  and its licence on every page.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/about"
                    className="rounded-[var(--radius-card)] border border-line px-4 py-2.5 text-[0.86rem] font-medium text-ink hover:border-accent/60 hover:text-accent"
                  >
                    Read about the sourcing
                  </Link>
                  <Link
                    href="/attribution"
                    className="rounded-[var(--radius-card)] border border-line px-4 py-2.5 text-[0.86rem] font-medium text-ink hover:border-accent/60 hover:text-accent"
                  >
                    Attribution &amp; removal requests
                  </Link>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 font-variant-numeric tabular-nums">
                <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/60 p-4">
                  <dt className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">Titles</dt>
                  <dd className="mt-1 text-[1.7rem] font-semibold">{catalogue.stats.selected}</dd>
                </div>
                <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/60 p-4">
                  <dt className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">Collections</dt>
                  <dd className="mt-1 text-[1.7rem] font-semibold">{catalogue.collections.length}</dd>
                </div>
                <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/60 p-4">
                  <dt className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">Keys required</dt>
                  <dd className="mt-1 text-[1.7rem] font-semibold">0</dd>
                </div>
                <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/60 p-4">
                  <dt className="text-[0.7rem] uppercase tracking-[0.1em] text-muted">Hosted video</dt>
                  <dd className="mt-1 text-[1.7rem] font-semibold">None</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
