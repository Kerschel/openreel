import type { Metadata } from 'next';
import { Bricolage_Grotesque, Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { buildSearchIndex, getItems } from '@/lib/catalogue';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  axes: ['opsz'],
});

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://openreel.example'),
  title: {
    default: 'OpenReel — public-domain cinema, streaming free',
    template: '%s · OpenReel',
  },
  description:
    'OpenReel streams films that are free to watch: public-domain features, film noir, silent era, sci-fi, animation and classic TV, all served by the Internet Archive.',
  openGraph: {
    title: 'OpenReel — public-domain cinema, streaming free',
    description: 'A legal streaming library built entirely on Internet Archive public-domain collections.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchIndex = buildSearchIndex(getItems());

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-page text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#04231f]"
        >
          Skip to content
        </a>
        <SiteHeader searchIndex={searchIndex} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
