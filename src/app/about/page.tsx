import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalogue } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'About OpenReel',
  description: 'What OpenReel is, where the films come from, and why every stream is legal.',
};

export default function AboutPage() {
  const catalogue = getCatalogue();

  return (
    <div className="mx-auto max-w-[900px] px-[var(--gutter)] py-14">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">About</p>
      <h1 className="mt-2 text-[2rem] font-semibold sm:text-[2.6rem]">Cinema that is already free</h1>

      <div className="mt-6 space-y-5 text-[0.98rem] leading-[1.75] text-ink/85">
        <p className="max-w-[68ch]">
          OpenReel is a streaming interface over the public-domain film collections of the Internet Archive — a
          non-profit digital library that has been preserving moving images since 1996. There are no subscriptions,
          no accounts and no ads. The catalogue currently holds {catalogue.stats.selected.toLocaleString()} titles
          drawn from {catalogue.collections.length} archive collections.
        </p>
        <p className="max-w-[68ch]">
          Every title page links back to the archive&apos;s own item record, so you can always see the original
          files, the uploading collection and the licence the archive associates with the work. If an item is not,
          in fact, free to distribute in your country, the link back to the archive is where that is corrected and
          where the record lives — see{' '}
          <Link href="/attribution" className="text-accent underline-offset-4 hover:underline">
            attribution &amp; licences
          </Link>
          .
        </p>
      </div>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { h: 'Nothing re-hosted', p: 'OpenReel stores no video files and runs no media server. Playback is a direct HTTPS range request to archive.org.' },
          { h: 'No keys to run', p: 'The build needs no API key. Discovery and metadata come from the archive\'s public JSON endpoints.' },
          { h: 'A catalogue, not a crawler', p: 'A build-time ingester picks one quality MP4 per item and never touches commercial streaming services.' },
        ].map((card) => (
          <div key={card.h} className="rounded-[var(--radius-card)] border border-line bg-surface p-5">
            <h2 className="text-[1rem] font-semibold">{card.h}</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">{card.p}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-[1.4rem] font-semibold">How the catalogue is built</h2>
        <ol className="mt-4 space-y-3 text-[0.93rem] leading-relaxed text-ink/85">
          <li>
            <span className="font-semibold text-accent">1.</span> <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em]">scripts/ingest.mjs</code> queries{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em]">advancedsearch.php</code> for each configured collection.
          </li>
          <li>
            <span className="font-semibold text-accent">2.</span> For each item it reads{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em]">/metadata/&lt;id&gt;</code> and selects the single best
            playable file: an h.264 derivative MP4, largest first, at least 1 MB.
          </li>
          <li>
            <span className="font-semibold text-accent">3.</span> Records are normalised (genre, decade, runtime,
            resolution, licence, poster, stream URL) and written to{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em]">src/data/catalogue.json</code>, which the site
            renders statically at build time.
          </li>
        </ol>
        <p className="mt-4 text-[0.85rem] leading-relaxed text-muted">
          Run it weekly on a cron to keep the catalogue fresh: <code className="rounded bg-surface-2 px-1.5 py-0.5">npm run ingest</code>{' '}
          tops up, <code className="rounded bg-surface-2 px-1.5 py-0.5">npm run ingest:refresh</code> rebuilds from scratch.
        </p>
      </section>

      <div className="mt-12 rounded-[var(--radius-card)] border border-line bg-surface p-6">
        <h2 className="text-[1.1rem] font-semibold">What OpenReel is not</h2>
        <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
          It is not a piracy front end. It does not scrape commercial streaming services, does not proxy or
          circumvent geo-restrictions or hotlink protections, and will not link to providers that forbid embedding.
          If a title is not in an open archive collection, it is not on OpenReel.
        </p>
      </div>
    </div>
  );
}
