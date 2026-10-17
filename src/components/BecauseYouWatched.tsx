'use client';

import { useEffect, useMemo, useState } from 'react';
import { Rail } from './Rail';
import { readProgress } from '@/lib/progress';
import type { CatalogueItem } from '@/lib/types';

/**
 * "Because you watched X" — driven entirely by localStorage. The server ships a
 * compact genre → items map so the rail can be built without a request.
 */
export function BecauseYouWatched({ byGenre }: { byGenre: Record<string, CatalogueItem[]> }) {
  const [state, setState] = useState<{ title: string; genre: string } | null>(null);

  useEffect(() => {
    const [last] = readProgress();
    if (last) setState({ title: last.title, genre: last.genre });
  }, []);

  const items = useMemo(() => {
    if (!state) return [];
    const pool = byGenre[state.genre] ?? [];
    return pool.filter((item) => item.title !== state.title).slice(0, 18);
  }, [byGenre, state]);

  if (!state || items.length === 0) return null;

  return (
    <Rail
      title={`Because you watched ${state.title.length > 44 ? `${state.title.slice(0, 44)}…` : state.title}`}
      items={items}
      moreHref={`/browse?genre=${encodeURIComponent(state.genre)}`}
    />
  );
}
