import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Rail } from '@/components/Rail';
import { getItem, prerenderIds, mediaTypeOf, similarTo } from '@/lib/catalogue';
import { formatResolution, formatRuntime } from '@/lib/format';
import { ArchiveIcon, PlayIcon } from '@/components/Icons';

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return prerenderIds(150).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const item = getItem(decodeURIComponent(id));
  if (!item) return { title: 'Title not found' };
  return {
    title: item.title,
    description: item.description.slice(0, 160),
    openGraph: { title: item.title, description: item.description.slice(0, 160), images: [item.posterUrl] },
  };
}

export default async function TitlePage({ params }: { params: Params }) {
  const { id } = await params;
  const item = getItem(decodeURIComponent(id));
  if (!item) notFound();

  const resolution = formatResolution(item.width, item.height);
  const media = mediaTypeOf(item) === 'tv' ? 'Classic TV' : 'Feature film';
  const similar = similarTo(item, 18);

  return (
    <article>
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.posterUrl} alt="" className="h-full w-full scale-110 object-cover opacity-25 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-t from-page via-page/85 to-page/40" />
        </div>

        <div className="relative mx-auto grid max-w-[1240px] gap-8 px-[var(--gutter)] pb-10 pt-24 sm:grid-cols-[220px_1fr] sm:pt-28 lg:grid-cols-[260px_1fr]">
          <div className="mx-auto w-[180px] sm:mx-0 sm:w-full">
            <div className="poster-shell aspect-[2/3] bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.posterUrl} alt={`Poster for ${item.title}`} className="h-full w-full object-cover" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">
              {media} · Public domain
            </p>
            <h1 className="mt-2 text-[2rem] font-semibold leading-[1.03] sm:text-[2.7rem]">{item.title}</h1>

            <ul className="mt-4 flex flex-wrap items-center gap-2 text-[0.76rem]">
              <li className="rounded-full border border-line bg-surface px-2.5 py-1 font-variant-numeric tabular-nums text-ink/85">
                {item.year ?? 'Year unknown'}
              </li>
              <li className="rounded-full border border-line bg-surface px-2.5 py-1 text-ink/85">
                {formatRuntime(item.runtimeSeconds)}
              </li>
              {resolution ? (
                <li className="rounded-full border border-line bg-surface px-2.5 py-1 font-variant-numeric tabular-nums text-ink/85">
                  {resolution}
                </li>
              ) : null}
              <li className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-accent">
                {item.genre}
              </li>
              <li className="rounded-full border border-line bg-surface px-2.5 py-1 text-ink/85">{item.decade}</li>
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/watch/${item.id}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-accent px-5 py-3 text-[0.92rem] font-semibold text-[#04231f] transition-colors hover:bg-[#5ad7d7]"
              >
                <PlayIcon className="h-4 w-4" />
                Watch now
              </Link>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-line px-5 py-3 text-[0.9rem] font-medium text-ink transition-colors hover:border-accent/60 hover:text-accent"
              >
                <ArchiveIcon className="h-4 w-4" />
                View on archive.org
              </a>
            </div>

            <h2 className="mt-9 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">Synopsis</h2>
            <p className="mt-2 max-w-[70ch] text-[0.95rem] leading-relaxed text-ink/85">{item.description}</p>

            {item.subjectTags.length > 0 ? (
              <div className="mt-6">
                <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">Subjects</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {item.subjectTags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/browse?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-line px-2.5 py-1 text-[0.74rem] text-muted hover:border-accent/60 hover:text-accent"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <section
              aria-labelledby="attribution-heading"
              className="mt-8 rounded-[var(--radius-card)] border border-line bg-surface/80 p-5"
            >
              <h2 id="attribution-heading" className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Source &amp; licence
              </h2>
              <dl className="mt-3 grid gap-2 text-[0.82rem] sm:grid-cols-[120px_1fr]">
                <dt className="text-muted">Licence</dt>
                <dd className="break-words text-ink/85">{item.licence}</dd>
                <dt className="text-muted">Collection</dt>
                <dd className="break-words text-ink/85">{item.collections.slice(0, 4).join(', ') || 'Internet Archive'}</dd>
                <dt className="text-muted">Archive item</dt>
                <dd>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-accent underline-offset-4 hover:underline"
                  >
                    {item.sourceUrl}
                  </a>
                </dd>
              </dl>
              <p className="mt-3 text-[0.76rem] leading-relaxed text-muted">
                OpenReel hosts no video. Playback uses the Internet Archive&apos;s own MP4 derivative, streamed
                directly from archive.org. See{' '}
                <Link href="/attribution" className="text-accent underline-offset-4 hover:underline">
                  attribution &amp; licences
                </Link>{' '}
                for how to request a removal.
              </p>
            </section>
          </div>
        </div>
      </div>

      {similar.length > 0 ? (
        <div className="mt-8">
          <Rail title="More like this" items={similar} moreHref={`/browse?genre=${encodeURIComponent(item.genre)}`} />
        </div>
      ) : null}
    </article>
  );
}
