'use client';

import Link from 'next/link';
import { FaExchangeAlt } from 'react-icons/fa';
import type { ModelComparisonPeer, ModelCore, ModelRelatedItem } from '@/types/models';

const EMBEDDING_PEERS = [
  { slug: 'sentence-transformers-all-minilm-l6-v2', name: 'MiniLM' },
  { slug: 'bge-base-en-v1-5', name: 'BGE' },
  { slug: 'multilingual-e5-base', name: 'E5' },
  { slug: 'nomic-embed-text-v1', name: 'Nomic' },
  { slug: 'jina-embeddings-v2-base-en', name: 'Jina' },
  { slug: 'instructor-xl', name: 'Instructor' },
];

export function StickyCompareBar({
  model,
  peers,
  related,
}: {
  model: ModelCore;
  peers: ModelComparisonPeer[];
  related: ModelRelatedItem[];
}) {
  const dynamicPeers = [
    ...peers.filter((p) => p.peer_slug).map((p) => ({ slug: p.peer_slug!, name: p.name || p.peer_slug! })),
    ...related
      .filter((r) => r.type === 'model' && r.slug)
      .map((r) => ({ slug: r.slug!, name: r.title })),
  ].filter((p) => p.slug !== model.slug);

  const curated = /embed|sentence|retrieval|search/i.test(`${model.task} ${model.name}`)
    ? EMBEDDING_PEERS.filter((p) => p.slug !== model.slug)
    : [];

  const chips = [...curated, ...dynamicPeers]
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, 6);

  const compareHref = (peerSlug?: string) => {
    const models = peerSlug ? `${model.slug},${peerSlug}` : model.slug;
    return `/models/compare?models=${encodeURIComponent(models)}`;
  };

  return (
    <div className="fixed bottom-5 left-1/2 z-40 flex max-w-[95vw] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--m-border)] bg-[var(--m-surface)]/95 px-3 py-2 shadow-lg backdrop-blur">
      <Link
        href={compareHref()}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--m-brand)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--m-brand-hover)]"
        aria-label="Compare models"
      >
        <FaExchangeAlt className="h-3 w-3" /> Compare
      </Link>
      {chips.map((c) => (
        <Link
          key={c.slug}
          href={compareHref(c.slug)}
          className="rounded-full border border-[var(--m-border)] px-2.5 py-1 text-xs text-[var(--m-text)] hover:border-[var(--m-brand)]"
        >
          vs {c.name}
        </Link>
      ))}
    </div>
  );
}
