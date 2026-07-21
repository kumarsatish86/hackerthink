'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ht-ui';
import type { DatasetComparisonPeer, DatasetCore, DatasetModelLink } from '@/types/datasets';

export function StickyCompareBar({
  dataset,
  peers,
  similar,
}: {
  dataset: DatasetCore;
  peers: DatasetComparisonPeer[];
  similar: DatasetModelLink[];
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  const peerSlug = peers[0]?.peer_slug || similar[0]?.slug;
  const href = peerSlug
    ? `/datasets/compare?datasets=${dataset.slug},${peerSlug}`
    : `/datasets/compare?datasets=${dataset.slug}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[var(--ht-border)] bg-[var(--ht-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <span className="truncate text-sm text-[var(--ht-text)]">Compare {dataset.name}</span>
        <Link href={href}>
          <Button size="sm">Open compare</Button>
        </Link>
      </div>
    </div>
  );
}
