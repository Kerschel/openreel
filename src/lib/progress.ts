'use client';

export type ProgressEntry = {
  id: string;
  title: string;
  posterUrl: string;
  year: number | null;
  genre: string;
  position: number;
  duration: number;
  updatedAt: number;
};

const KEY = 'openreel:progress:v1';

export function readProgress(): ProgressEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => entry && typeof entry.id === 'string');
  } catch {
    return [];
  }
}

function write(entries: ProgressEntry[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 40)));
  } catch {
    /* storage full or blocked — playback still works */
  }
}

export function saveProgress(entry: Omit<ProgressEntry, 'updatedAt'>) {
  if (typeof window === 'undefined') return;
  const entries = readProgress().filter((existing) => existing.id !== entry.id);
  // Finished titles drop out of Continue Watching.
  const finished = entry.duration > 0 && entry.position / entry.duration > 0.96;
  if (!finished && entry.position > 5) entries.unshift({ ...entry, updatedAt: Date.now() });
  write(entries);
}

export function getProgress(id: string): ProgressEntry | undefined {
  return readProgress().find((entry) => entry.id === id);
}

export function clearProgress(id: string) {
  write(readProgress().filter((entry) => entry.id !== id));
}
