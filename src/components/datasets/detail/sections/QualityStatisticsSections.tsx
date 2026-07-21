'use client';

import { useMemo } from 'react';
import { BenchmarkCards, BenchmarkCharts, Callout, Card } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { DatasetCore, DatasetQualityMetric, DatasetStatisticSeries } from '@/types/datasets';
import { deriveQualityHealth, estimateStatistics } from '@/lib/datasets/deriveQualityHealth';
import { DATASET_SECTION_COPY } from '@/lib/datasets/sectionCopy';

export function QualitySection({
  dataset,
  metrics,
}: {
  dataset: DatasetCore;
  metrics: DatasetQualityMetric[];
}) {
  const items = metrics.length ? metrics : deriveQualityHealth(dataset);
  const estimated = !metrics.length;

  return (
    <DetailSection id="quality" title="Data Quality" description="Completeness, bias proxies, and overall health">
      {estimated ? (
        <Callout variant="warning" title="Estimated metrics" body={DATASET_SECTION_COPY.qualityEstimated} className="mb-4" />
      ) : null}
      <BenchmarkCards
        items={items.map((m) => ({
          id: m.id || m.metric_key,
          name: m.label,
          value: m.value,
          source: (m.source as 'official' | 'community' | 'estimated') || 'estimated',
          confidence: (m.confidence as 'high' | 'medium' | 'low') || 'medium',
          hint: m.notes || undefined,
        }))}
      />
      <div className="mt-4">
        <BenchmarkCharts
          data={items.slice(0, 8).map((m) => ({ name: m.label.slice(0, 14), value: Number(m.value) }))}
          charts={['bar', 'radar']}
        />
      </div>
    </DetailSection>
  );
}

export function StatisticsSection({
  dataset,
  series,
}: {
  dataset: DatasetCore;
  series: DatasetStatisticSeries[];
}) {
  const data = useMemo(() => {
    const list = series.length ? series : estimateStatistics(dataset);
    return list;
  }, [series, dataset]);

  return (
    <DetailSection id="statistics" title="Statistics" description="Distributions and growth signals">
      {series.length === 0 ? (
        <Callout variant="info" title="Estimated charts" body={DATASET_SECTION_COPY.statsEstimated} className="mb-4" />
      ) : null}
      <div className="space-y-6">
        {data.map((s) => (
          <Card key={s.id || s.series_key} className="p-3">
            <h3 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">{s.label}</h3>
            <BenchmarkCharts data={s.points || []} charts={['bar', 'line']} />
          </Card>
        ))}
      </div>
    </DetailSection>
  );
}

export default QualitySection;
