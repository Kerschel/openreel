import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Attribution & licences',
  description: 'Where OpenReel media comes from, what licence applies, and how to request removal.',
};

export default function AttributionPage() {
  const catalogue = getCatalogue();

  return (
    <div className="mx-auto max-w-[900px] px-[var(--gutter)] py-14">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">Attribution</p>
      <h1 className="mt-2 text-[2rem] font-semibold sm:text-[2.6rem]">Sources, licences &amp; removal</h1>

      <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.75] text-ink/85">
        <p className="max-w-[68ch]">
          All media in OpenReel is sourced from the Internet Archive (<a href="https://archive.org" className="text-accent underline-offset-4 hover:underline" rel="noopener noreferrer" target="_blank">archive.org</a>),
          a 501(c)(3) non-profit library. OpenReel does not host, transcode or mirror any video file: each player
          points at the archive&apos;s own MP4 derivative for the item, and each title page links to the item record
          where the upload, collection and licence are visible.
        </p>

        <h2 className="pt-4 text-[1.3rem] font-semibold text-ink">Licence basis</h2>
        <p className="max-w-[68ch]">
          Items in the collections below are published by the Internet Archive as public domain or openly licensed.
          Where the archive item carries a machine-readable licence it is shown verbatim on the title page. Where it
          does not, OpenReel records the item as <em>Public domain</em> — the assertion belongs to the archiving
          collection, not to OpenReel.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {catalogue.collections.map((collection) => (
            <li key={collection} className="rounded-[6px] border border-line bg-surface px-3 py-2 text-[0.82rem] text-ink/85">
              <code className="text-accent">{collection}</code>
            </li>
          ))}
        </ul>

        <h2 className="pt-4 text-[1.3rem] font-semibold text-ink">Public domain is jurisdiction-specific</h2>
        <p className="max-w-[68ch]">
          A work that is out of copyright in the United States may still be protected elsewhere. If you are outside
          the United States, check the law where you are before streaming. OpenReel makes no legal determination
          about any individual title; it surfaces the archive&apos;s record.
        </p>

        <h2 className="pt-4 text-[1.3rem] font-semibold text-ink">Requesting removal</h2>
        <p className="max-w-[68ch]">
          If you hold rights in a title listed here and believe its inclusion is a mistake, email{' '}
          <span className="text-accent">rights@openreel.example</span> with the archive.org identifier (shown on the
          title page and in the URL) and the basis of your claim. Removals are handled at the archive level — the
          item is corrected or withdrawn from the catalogue at the next ingest run — and OpenReel will de-list the
          item in the meantime.
        </p>

        <h2 className="pt-4 text-[1.3rem] font-semibold text-ink">Code licence</h2>
        <p className="max-w-[68ch]">
          The OpenReel codebase is MIT licensed. That licence covers the application code only; it does not extend to
          any film, poster, still or metadata shown in the catalogue, which remain with their respective rights
          holders and the Internet Archive.
        </p>

        <h2 className="pt-4 text-[1.3rem] font-semibold text-ink">Metadata</h2>
        <p className="max-w-[68ch]">
          Titles, descriptions, subjects, runtimes and technical metadata are read from the archive&apos;s public
          JSON endpoints at build time. Poster art is the archive&apos;s generated thumbnail service for the item.
          Catalogue generated {new Date(catalogue.generatedAt).toISOString().slice(0, 10)}.
        </p>
      </div>
    </div>
  );
}
