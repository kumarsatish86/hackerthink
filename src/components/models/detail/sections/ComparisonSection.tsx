'use client';

import Link from 'next/link';
import { FaBalanceScale, FaBrain, FaArrowRight } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelComparisonPeer, ModelCore } from '@/types/models';

export function ComparisonSection({ model, peers }: { model: ModelCore; peers: ModelComparisonPeer[] }) {
  return (
    <DetailSection id="comparison" title="Comparison" description="See how this model stacks up against similar peers">
      {peers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {peers.map((peer) => (
            <Card key={peer.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                  <FaBrain />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--m-text)]">{peer.name || 'Unknown model'}</p>
                  {peer.developer && <p className="truncate text-xs text-[var(--m-text-muted)]">{peer.developer}</p>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-[var(--m-text-muted)]">
                {peer.parameters && <span>Params: {peer.parameters}</span>}
                {peer.license && <span>License: {peer.license}</span>}
              </div>
              {peer.notes && <p className="text-sm text-[var(--m-text-muted)]">{peer.notes}</p>}
              {peer.peer_slug && (
                <Link
                  href={`/models/compare?models=${model.slug},${peer.peer_slug}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-brand)] hover:underline"
                >
                  Compare side by side <FaArrowRight className="h-3 w-3" />
                </Link>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaBalanceScale className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="mb-4 text-sm text-[var(--m-text-muted)]">No curated comparisons are available yet.</p>
          <Link
            href={`/models/compare?models=${model.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--m-brand)] hover:underline"
          >
            Start a comparison <FaArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      )}
    </DetailSection>
  );
}

export default ComparisonSection;
