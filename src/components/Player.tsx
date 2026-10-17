'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { formatTime } from '@/lib/format';
import { getProgress, saveProgress } from '@/lib/progress';
import { useToast } from './Toast';
import {
  ArrowRightIcon,
  FullscreenIcon,
  MuteIcon,
  PauseIcon,
  PipIcon,
  PlayIcon,
  ReplayIcon,
  VolumeIcon,
} from './Icons';

const RATES = [0.75, 1, 1.25, 1.5, 2];

export function Player({ item, next }: { item: CatalogueItem; next?: CatalogueItem }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [resumeAt, setResumeAt] = useState(0);
  const [ended, setEnded] = useState(false);
  const toast = useToast();

  /* Restore saved position once the metadata is in. */
  useEffect(() => {
    const saved = getProgress(item.id);
    if (saved && saved.position > 5 && (saved.duration === 0 || saved.position / saved.duration < 0.96)) {
      setResumeAt(saved.position);
    }
  }, [item.id]);

  const persist = useCallback(
    (position: number, total: number) => {
      saveProgress({
        id: item.id,
        title: item.title,
        posterUrl: item.posterUrl,
        year: item.year,
        genre: item.genre,
        position,
        duration: total,
      });
    },
    [item],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => {
      setDuration(video.duration || 0);
      setStatus('ready');
      if (resumeAt > 0 && video.currentTime < 1) {
        video.currentTime = resumeAt;
      }
    };
    const onProgress = () => {
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setEnded(true);
      persist(0, video.duration || 0);
    };
    const onError = () => setStatus('error');

    video.addEventListener('timeupdate', onTime);
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('progress', onProgress);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, [persist, resumeAt]);

  /* Save progress every 5s of playback. */
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (video && video.duration) persist(video.currentTime, video.duration);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, persist]);

  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video && video.duration) persist(video.currentTime, video.duration);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [persist]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setStatus('error'));
    } else {
      video.pause();
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  }, []);

  const toggleFullscreen = useCallback(() => {
    const shell = shellRef.current;
    if (!shell) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shell.requestFullscreen?.().catch(() => {});
  }, []);

  const togglePip = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {
      /* PiP unsupported — silently ignore */
    }
  }, []);

  const changeVolume = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const cycleRate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const index = RATES.indexOf(rate);
    const nextRate = RATES[(index + 1) % RATES.length];
    video.playbackRate = nextRate;
    setRate(nextRate);
    toast.push(`Playback speed ${nextRate}×`);
  }, [rate, toast]);

  /* Keyboard shortcuts. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      switch (event.key.toLowerCase()) {
        case ' ':
        case 'k':
          event.preventDefault();
          toggle();
          break;
        case 'arrowright':
          event.preventDefault();
          seekBy(10);
          break;
        case 'arrowleft':
          event.preventDefault();
          seekBy(-10);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm': {
          const video = videoRef.current;
          if (!video) break;
          video.muted = !video.muted;
          setMuted(video.muted);
          break;
        }
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [seekBy, toggle, toggleFullscreen]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, 2800);
  }, []);

  const progressPct = duration > 0 ? (current / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? Math.min(100, (buffered / duration) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-black">
      <div
        ref={shellRef}
        onMouseMove={revealControls}
        onTouchStart={revealControls}
        className={`relative mx-auto flex min-h-screen max-w-[1600px] flex-col justify-center ${
          controlsVisible ? '' : 'cursor-none'
        }`}
      >
        <video
          ref={videoRef}
          src={item.streamUrl}
          poster={item.posterUrl}
          preload="metadata"
          playsInline
          onClick={toggle}
          className="max-h-[86vh] w-full bg-black object-contain"
          aria-label={`${item.title} — streaming from the Internet Archive`}
        />

        {status === 'loading' ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-accent" aria-hidden="true" />
            <span className="sr-only">Loading stream from the Internet Archive</span>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgb(7_8_11/0.94)] px-6">
            <div className="max-w-md text-center">
              <h2 className="text-[1.4rem] font-semibold">This stream didn&apos;t load</h2>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
                The Internet Archive may be re-deriving this file, or the item has moved. You can retry, open the
                item on archive.org, or pick something else from the catalogue.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('loading');
                    videoRef.current?.load();
                  }}
                  className="rounded-[var(--radius-card)] bg-accent px-4 py-2.5 text-[0.88rem] font-semibold text-[#04231f]"
                >
                  Retry stream
                </button>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[var(--radius-card)] border border-line px-4 py-2.5 text-[0.88rem] text-ink hover:border-accent/60"
                >
                  Open on archive.org
                </a>
                <Link
                  href="/browse"
                  className="rounded-[var(--radius-card)] border border-line px-4 py-2.5 text-[0.88rem] text-ink hover:border-accent/60"
                >
                  Browse catalogue
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {resumeAt > 0 && current < 2 && status === 'ready' ? (
          <div className="absolute left-[var(--gutter)] top-6 rounded-[var(--radius-card)] border border-accent/40 bg-surface/95 px-4 py-2 text-[0.8rem] text-ink shadow-xl">
            Resumed from {formatTime(resumeAt)}
          </div>
        ) : null}

        {ended && next ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgb(7_8_11/0.92)] px-6">
            <div className="flex max-w-2xl flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={next.posterUrl} alt="" className="h-40 w-[107px] rounded-[6px] object-cover" />
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-accent">Up next</p>
                <h2 className="mt-2 text-[1.4rem] font-semibold">{next.title}</h2>
                <p className="mt-1 text-[0.82rem] text-muted">
                  {next.year ?? 'Year unknown'} · {next.genre}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/watch/${next.id}`}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-card)] bg-accent px-4 py-2.5 text-[0.88rem] font-semibold text-[#04231f]"
                  >
                    <PlayIcon className="h-3.5 w-3.5" />
                    Play next
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const video = videoRef.current;
                      setEnded(false);
                      if (video) {
                        video.currentTime = 0;
                        void video.play();
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-line px-4 py-2.5 text-[0.88rem] text-ink"
                  >
                    <ReplayIcon className="h-3.5 w-3.5" />
                    Watch again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Controls */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(3_4_6/0.96)] via-[rgb(3_4_6/0.55)] to-transparent px-[var(--gutter)] pb-4 pt-16 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-[0.95rem] font-medium">{item.title}</p>
              <p className="text-[0.74rem] text-muted">
                {item.year ?? '—'} · {item.genre} · Internet Archive
              </p>
            </div>
            <Link
              href={`/title/${item.id}`}
              className="hidden items-center gap-1.5 rounded border border-line px-3 py-1.5 text-[0.76rem] text-ink/85 hover:border-accent/60 hover:text-accent sm:inline-flex"
            >
              Details
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          <label className="sr-only" htmlFor="seek">
            Seek
          </label>
          <div className="group/seek relative h-4">
            <div className="absolute inset-x-0 top-1.5 h-1 overflow-hidden rounded-full bg-white/18">
              <div className="h-full bg-white/28" style={{ width: `${bufferedPct}%` }} />
            </div>
            <div
              className="absolute top-1.5 h-1 rounded-full bg-accent"
              style={{ width: `${progressPct}%` }}
              aria-hidden="true"
            />
            <div
              className="absolute top-0 h-4 w-1 rounded-full bg-accent opacity-0 transition-opacity group-hover/seek:opacity-100"
              style={{ left: `calc(${progressPct}% - 2px)` }}
              aria-hidden="true"
            />
            <input
              id="seek"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(event) => {
                const video = videoRef.current;
                const value = Number(event.target.value);
                if (video) video.currentTime = value;
                setCurrent(value);
              }}
              className="absolute inset-0 h-4 w-full cursor-pointer appearance-none bg-transparent opacity-0"
            />
          </div>

          <div className="mt-1 flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause' : 'Play'}
              className="rounded p-2 text-ink hover:text-accent"
            >
              {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  video.muted = !video.muted;
                  setMuted(video.muted);
                }}
                aria-label={muted ? 'Unmute' : 'Mute'}
                className="rounded p-2 text-ink hover:text-accent"
              >
                {muted || volume === 0 ? <MuteIcon className="h-5 w-5" /> : <VolumeIcon className="h-5 w-5" />}
              </button>
              <label className="sr-only" htmlFor="volume">
                Volume
              </label>
              <input
                id="volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => changeVolume(Number(event.target.value))}
                className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/25 accent-accent sm:w-20"
              />
            </div>

            <p className="ml-1 font-variant-numeric text-[0.76rem] tabular-nums text-ink/80">
              {formatTime(current)} <span className="text-muted">/ {formatTime(duration)}</span>
            </p>

            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={cycleRate}
                aria-label={`Playback speed ${rate} times, click to change`}
                className="rounded border border-line px-2 py-1 font-variant-numeric text-[0.72rem] tabular-nums text-ink/85 hover:border-accent/60 hover:text-accent"
              >
                {rate}×
              </button>
              <button
                type="button"
                onClick={() => void togglePip()}
                aria-label="Picture in picture"
                className="hidden rounded p-2 text-ink hover:text-accent sm:block"
              >
                <PipIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Toggle fullscreen"
                className="rounded p-2 text-ink hover:text-accent"
              >
                <FullscreenIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <p className="mt-2 hidden text-[0.68rem] text-muted/80 sm:block">
            Space play/pause · ← → 10s · F fullscreen · M mute
          </p>
        </div>
      </div>
    </div>
  );
}
