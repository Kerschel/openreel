'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wordmark } from './Wordmark';
import { SearchOverlay } from './SearchOverlay';
import type { SearchEntry } from '@/lib/catalogue';
import { MenuIcon, SearchIcon } from './Icons';

const NAV = [
  { href: '/', label: 'Discover' },
  { href: '/browse?type=movie', label: 'Movies' },
  { href: '/browse?type=tv', label: 'TV' },
  { href: '/continue', label: 'Continue' },
];

export function SiteHeader({ searchIndex }: { searchIndex: SearchEntry[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isWatch = pathname?.startsWith('/watch');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (isWatch) return null;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          scrolled
            ? 'border-b border-line bg-[rgb(7_8_11/0.86)] backdrop-blur-xl'
            : 'border-b border-transparent bg-gradient-to-b from-[rgb(7_8_11/0.9)] to-transparent'
        }`}
      >
        <div className="flex h-16 items-center gap-4 px-[var(--gutter)]">
          <Link href="/" aria-label="OpenReel home" className="rounded">
            <Wordmark />
          </Link>

          <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((entry) => {
              const active =
                entry.href === '/'
                  ? pathname === '/'
                  : pathname?.startsWith(entry.href.split('?')[0]) && entry.href !== '/';
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded px-3 py-2 text-[0.86rem] font-medium transition-colors ${
                    active ? 'text-accent' : 'text-muted hover:text-ink'
                  }`}
                >
                  {entry.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-[var(--radius-card)] border border-line bg-surface/70 px-3 py-2 text-[0.82rem] text-muted transition-colors hover:border-accent/50 hover:text-ink"
              aria-label="Search the catalogue (Command or Control K)"
            >
              <SearchIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="ml-1 hidden rounded border border-line px-1.5 py-0.5 font-mono text-[0.65rem] text-muted lg:inline">
                ⌘K
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Toggle navigation menu"
              className="rounded-[var(--radius-card)] border border-line p-2 text-ink md:hidden"
            >
              <MenuIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav id="mobile-nav" aria-label="Primary mobile" className="border-t border-line bg-surface px-[var(--gutter)] py-2 md:hidden">
            {NAV.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded px-2 py-2.5 text-[0.95rem] text-ink/85 hover:text-accent"
              >
                {entry.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} index={searchIndex} />
    </>
  );
}
