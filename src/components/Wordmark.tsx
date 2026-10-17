export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 28 28"
        width="26"
        height="26"
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <circle cx="14" cy="14" r="12.5" fill="none" stroke="#3EC6C6" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="3.1" fill="#3EC6C6" />
        <circle cx="14" cy="14" r="7.4" fill="none" stroke="#3EC6C6" strokeOpacity="0.45" strokeWidth="1.2" />
        <path d="M14 1.5v3.6M14 22.9v3.6M1.5 14h3.6M22.9 14h3.6" stroke="#3EC6C6" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="font-[family-name:var(--font-display)] text-[1.28rem] font-semibold tracking-[-0.03em] text-ink">
        Open<span className="text-accent">Reel</span>
      </span>
    </span>
  );
}
