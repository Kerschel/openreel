import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'OpenReel collects nothing. Playback positions live in your browser.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-[860px] px-[var(--gutter)] py-14">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-accent">Privacy</p>
      <h1 className="mt-2 text-[2rem] font-semibold sm:text-[2.6rem]">We collect nothing</h1>

      <div className="mt-6 space-y-5 text-[0.95rem] leading-[1.75] text-ink/85">
        <p className="max-w-[66ch]">
          OpenReel has no accounts, no analytics, no advertising pixels and no third-party trackers. There is no
          server-side database of viewers because there is no viewer account.
        </p>

        <h2 className="pt-3 text-[1.25rem] font-semibold text-ink">What is stored, and where</h2>
        <ul className="max-w-[66ch] list-disc space-y-2 pl-5">
          <li>
            <span className="text-ink">Playback position and history</span> — written to your browser&apos;s{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em]">localStorage</code> under the key{' '}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 text-[0.85em]">openreel:progress:v1</code>. It never
            leaves your device. Clearing site data or pressing <em>Remove</em> on the Continue watching page deletes it.
          </li>
          <li>
            <span className="text-ink">Nothing else.</span> No cookies are set by OpenReel itself.
          </li>
        </ul>

        <h2 className="pt-3 text-[1.25rem] font-semibold text-ink">Third parties</h2>
        <p className="max-w-[66ch]">
          Video streams, posters and thumbnails are requested directly from <span className="text-accent">archive.org</span>.
          Your browser makes those requests, so the Internet Archive can see your IP address and request metadata, in
          the same way as visiting the site itself. Their handling of that data is described in the Internet
          Archive&apos;s own privacy policy.
        </p>

        <h2 className="pt-3 text-[1.25rem] font-semibold text-ink">Fonts</h2>
        <p className="max-w-[66ch]">
          Typefaces are self-hosted at build time via Next.js font optimisation, so no request is made to Google&apos;s
          font CDN when you load a page.
        </p>

        <h2 className="pt-3 text-[1.25rem] font-semibold text-ink">Contact</h2>
        <p className="max-w-[66ch]">
          Questions about this policy: <span className="text-accent">privacy@openreel.example</span>.
        </p>
      </div>
    </div>
  );
}
