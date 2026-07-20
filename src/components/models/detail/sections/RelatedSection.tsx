'use client';

import { useMemo } from 'react';
import { RelatedResources } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelRelatedItem } from '@/types/models';

const GROUP_ORDER: { type: ModelRelatedItem['type'] | 'paper'; label: string }[] = [
  { type: 'model', label: 'Related Models' },
  { type: 'dataset', label: 'Related Datasets' },
  { type: 'tutorial', label: 'Related Tutorials' },
  { type: 'article', label: 'Related Articles' },
  { type: 'video', label: 'Related Videos' },
  { type: 'paper', label: 'Related Papers' },
  { type: 'course', label: 'Related Courses' },
];

export function RelatedSection({ related }: { related: ModelRelatedItem[] }) {
  const groups = useMemo(() => {
    return GROUP_ORDER.map((g) => ({
      id: g.type,
      label: g.label,
      items: related
        .filter((r) => r.type === g.type)
        .map((item, i) => ({
          id: `${item.type}-${item.slug || item.url || i}`,
          title: item.title,
          href: item.url || (item.slug ? `/models/${item.slug}` : '#'),
          description: item.description || undefined,
        })),
    })).filter((g) => g.items.length > 0);
  }, [related]);

  if (!groups.length) return null;

  return (
    <DetailSection id="related" title="Related Ecosystem" description="Models, datasets, tutorials, and more">
      <RelatedResources groups={groups} />
    </DetailSection>
  );
}

export default RelatedSection;
