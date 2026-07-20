'use client';

import Link from 'next/link';
import {
  FaBrain, FaDatabase, FaNewspaper, FaGraduationCap, FaBookOpen, FaVideo, FaArrowRight,
} from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelRelatedItem } from '@/types/models';

const TYPE_ICON: Record<ModelRelatedItem['type'], React.ReactNode> = {
  model: <FaBrain />,
  dataset: <FaDatabase />,
  article: <FaNewspaper />,
  tutorial: <FaGraduationCap />,
  course: <FaBookOpen />,
  video: <FaVideo />,
};

export function RelatedSection({ related }: { related: ModelRelatedItem[] }) {
  return (
    <DetailSection id="related" title="Related Models" description="Discover similar models, datasets, and resources">
      {related.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item, i) => (
            <Link key={`${item.type}-${item.slug || item.url || i}`} href={item.url || '#'}>
              <Card className="flex h-full flex-col gap-2 p-4 transition hover:border-[var(--m-brand)]">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                    {TYPE_ICON[item.type]}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">{item.type}</span>
                </div>
                <p className="font-semibold text-[var(--m-text)]">{item.title}</p>
                {item.description && <p className="line-clamp-2 text-sm text-[var(--m-text-muted)]">{item.description}</p>}
                <span className="mt-auto flex items-center gap-1 text-sm text-[var(--m-brand)]">
                  View <FaArrowRight className="h-3 w-3" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-sm text-[var(--m-text-muted)]">No related items found yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default RelatedSection;
