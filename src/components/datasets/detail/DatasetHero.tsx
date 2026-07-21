'use client';

import { HeroBanner, MetricCard } from '@/components/ht-ui';
import type { DatasetCore } from '@/types/datasets';
import { formatCompactNumber, formatDate, toStringArray } from '@/lib/datasets/arrayUtils';
import {
  commercialFriendly,
  computeFreshnessScore,
  computePopularityScore,
} from '@/lib/datasets/estimateHardware';
import { DatasetVisualBadges } from './DatasetVisualBadges';

export function DatasetHero({ dataset }: { dataset: DatasetCore }) {
  const langs = toStringArray(dataset.languages);
  const tasks = toStringArray(dataset.task_types);
  const subtitle = [
    dataset.provider,
    dataset.version ? `v${dataset.version}` : null,
    tasks[0] || dataset.dataset_type,
    dataset.modality,
  ]
    .filter(Boolean)
    .join(' · ');

  const sizeValue =
    dataset.size ||
    dataset.storage_estimate ||
    (dataset.quick_facts as { size_category?: string } | undefined)?.size_category ||
    '—';

  const classValue =
    dataset.quick_facts?.classes ||
    (dataset.columns != null ? `${dataset.columns} cols` : null) ||
    '—';

  const languageValue =
    langs.length === 0
      ? dataset.language || '—'
      : langs.length <= 3
        ? langs.join(', ')
        : `${langs.length} (${langs.slice(0, 2).join(', ')}…)`;

  const metrics = [
    { id: 'size', label: 'Size', value: sizeValue, estimated: !dataset.size && Boolean(dataset.storage_estimate) },
    { id: 'samples', label: 'Samples', value: formatCompactNumber(dataset.rows) },
    {
      id: 'classes',
      label: dataset.quick_facts?.classes ? 'Classes' : 'Features',
      value: String(classValue),
      estimated: !dataset.quick_facts?.classes && dataset.columns != null,
    },
    { id: 'langs', label: 'Languages', value: languageValue },
    { id: 'downloads', label: 'Downloads', value: formatCompactNumber(dataset.download_count) },
    {
      id: 'stars',
      label: 'Stars',
      value: formatCompactNumber(dataset.stars_count || dataset.rating_count),
    },
    { id: 'views', label: 'Views', value: formatCompactNumber(dataset.view_count) },
    {
      id: 'quality',
      label: 'Quality',
      value: dataset.quality_score != null ? String(dataset.quality_score) : `${Math.round(computePopularityScore(dataset) / 10)}/10`,
      estimated: dataset.quality_score == null,
    },
    { id: 'fresh', label: 'Freshness', value: `${computeFreshnessScore(dataset)}/100` },
    { id: 'pop', label: 'Popularity', value: `${computePopularityScore(dataset)}/100` },
    {
      id: 'commercial',
      label: 'Commercial',
      value: commercialFriendly(dataset) ? 'Yes' : 'Review',
    },
    {
      id: 'updated',
      label: 'Updated',
      value: formatDate(dataset.last_updated || dataset.release_date) || '—',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <HeroBanner
        title={dataset.name}
        subtitle={subtitle}
        media={dataset.logo_url ? { src: dataset.logo_url, alt: dataset.name } : undefined}
        badges={[
          ...(dataset.license ? [{ id: 'lic', label: dataset.license, tone: 'brand' as const }] : []),
          ...(dataset.verified ? [{ id: 'ver', label: 'Verified', tone: 'success' as const }] : []),
        ]}
      >
        <div className="mt-3">
          <DatasetVisualBadges dataset={dataset} />
        </div>
      </HeroBanner>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>
    </div>
  );
}
