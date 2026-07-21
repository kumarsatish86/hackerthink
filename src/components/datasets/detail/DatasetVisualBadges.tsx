'use client';

import { TagPill } from '@/components/ht-ui';
import type { DatasetCore } from '@/types/datasets';
import { commercialFriendly, computeFreshnessScore, computePopularityScore } from '@/lib/datasets/estimateHardware';
import { toStringArray } from '@/lib/datasets/arrayUtils';

export function DatasetVisualBadges({ dataset }: { dataset: DatasetCore }) {
  const pills: { id: string; label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' | 'info' }[] = [];
  if (dataset.license) pills.push({ id: 'license', label: dataset.license, tone: 'brand' });
  if (dataset.modality) pills.push({ id: 'modality', label: dataset.modality, tone: 'info' });
  if (dataset.dataset_type) pills.push({ id: 'type', label: dataset.dataset_type, tone: 'neutral' });
  pills.push({
    id: 'commercial',
    label: commercialFriendly(dataset) ? 'Commercial OK' : 'License review',
    tone: commercialFriendly(dataset) ? 'success' : 'warning',
  });
  if (dataset.quality_score != null) {
    pills.push({ id: 'quality', label: `Quality ${dataset.quality_score}`, tone: 'success' });
  }
  pills.push({ id: 'fresh', label: `Freshness ${computeFreshnessScore(dataset)}`, tone: 'neutral' });
  pills.push({ id: 'pop', label: `Popularity ${computePopularityScore(dataset)}`, tone: 'neutral' });
  toStringArray(dataset.task_types)
    .slice(0, 3)
    .forEach((t, i) => pills.push({ id: `task-${i}`, label: t, tone: 'brand' }));

  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Dataset badges">
      {pills.map((p) => (
        <TagPill key={p.id} label={p.label} tone={p.tone} />
      ))}
    </div>
  );
}
