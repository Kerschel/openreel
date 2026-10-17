import Link from 'next/link';
import { FilmIcon } from '@/components/Icons';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[62vh] max-w-[640px] flex-col items-center justify-center px-[var(--gutter)] py-20 text-center">
      <FilmIcon className="h-10 w-10 text-accent" />
      <p className="mt-6 font-[family-name:var(--font-display)] text-[0.9rem] font-semibold uppercase tracking-[0.16em] text-muted">
        404 · Reel not found
      </p>
      <h1 className="mt-3 text-[2rem] font-semibold sm:text-[2.6rem]">This title isn&apos;t in the archive</h1>
      <p className="mt-4 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted">
        The page you asked for does not exist, or the item has been withdrawn from the Internet Archive catalogue.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-[var(--radius-card)] bg-accent px-5 py-3 text-[0.9rem] font-semibold text-[#04231f] transition-colors hover:bg-[#5ad7d7]"
        >
          Back to Discover
        </Link>
        <Link
          href="/browse"
          className="rounded-[var(--radius-card)] border border-line px-5 py-3 text-[0.9rem] font-medium text-ink transition-colors hover:border-accent/60 hover:text-accent"
        >
          Browse the catalogue
        </Link>
      </div>
    </div>
  );
}
