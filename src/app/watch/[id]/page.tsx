import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Player } from '@/components/Player';
import { ToastProvider } from '@/components/Toast';
import { getAdjacent, getItem, prerenderIds } from '@/lib/catalogue';

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return prerenderIds(150).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const item = getItem(decodeURIComponent(id));
  return { title: item ? `Watch ${item.title}` : 'Watch' };
}

export default async function WatchPage({ params }: { params: Params }) {
  const { id } = await params;
  const item = getItem(decodeURIComponent(id));
  if (!item) notFound();
  const { next } = getAdjacent(item.id);

  return (
    <ToastProvider>
      <Player item={item} next={next} />
    </ToastProvider>
  );
}
