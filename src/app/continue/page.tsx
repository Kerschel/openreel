import type { Metadata } from 'next';
import { ContinueList } from '@/components/ContinueList';

export const metadata: Metadata = {
  title: 'Continue watching',
  description: 'Resume the films you have started. Playback positions are stored in your browser only.',
};

export default function ContinuePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-[var(--gutter)] py-12">
      <header className="mb-8">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">Your shelf</p>
        <h1 className="mt-2 text-[1.9rem] font-semibold sm:text-[2.4rem]">Continue watching</h1>
        <p className="mt-2 max-w-[64ch] text-[0.93rem] leading-relaxed text-muted">
          Positions are saved to this browser&apos;s local storage after a few seconds of playback — no account,
          no tracking, nothing sent to a server.
        </p>
      </header>
      <ContinueList />
    </div>
  );
}
