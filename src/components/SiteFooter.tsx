import Link from 'next/link';
import { Wordmark } from './Wordmark';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/60">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-[var(--gutter)] py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-[34ch] text-[0.82rem] leading-relaxed text-muted">
            A free, legal streaming library built entirely on public-domain and openly licensed films preserved
            by the Internet Archive.
          </p>
        </div>
        <nav aria-label="Browse">
          <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">Browse</h2>
          <ul className="mt-3 space-y-2 text-[0.85rem]">
            <li><Link href="/browse" className="text-ink/80 hover:text-accent">Everything</Link></li>
            <li><Link href="/browse?type=movie" className="text-ink/80 hover:text-accent">Movies</Link></li>
            <li><Link href="/browse?type=tv" className="text-ink/80 hover:text-accent">Classic TV</Link></li>
            <li><Link href="/continue" className="text-ink/80 hover:text-accent">Continue watching</Link></li>
          </ul>
        </nav>
        <nav aria-label="About">
          <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">About</h2>
          <ul className="mt-3 space-y-2 text-[0.85rem]">
            <li><Link href="/about" className="text-ink/80 hover:text-accent">About OpenReel</Link></li>
            <li><Link href="/attribution" className="text-ink/80 hover:text-accent">Attribution &amp; licences</Link></li>
            <li><Link href="/privacy" className="text-ink/80 hover:text-accent">Privacy</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted">Source</h2>
          <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">
            Every stream is served by{' '}
            <a
              href="https://archive.org"
              className="text-accent underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              archive.org
            </a>
            . Poster art and stills are the archive&apos;s own derivatives. OpenReel hosts no video files.
          </p>
        </div>
      </div>
      <div className="border-t border-line px-[var(--gutter)] py-5">
        <p className="mx-auto max-w-[1280px] text-[0.72rem] leading-relaxed text-muted">
          © {new Date().getFullYear()} OpenReel. Code is MIT licensed. Catalogue media remains the property of
          its respective rights holders and is streamed from the Internet Archive under the terms of its
          collection. Public domain status is asserted per item by the archive, not by OpenReel.
        </p>
      </div>
    </footer>
  );
}
