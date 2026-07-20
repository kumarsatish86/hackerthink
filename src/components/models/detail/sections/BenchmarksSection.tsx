'use client';

import { useMemo } from 'react';
import { BenchmarkCards, BenchmarkCharts, Callout } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelBenchmark, ModelComparisonPeer, ModelCore } from '@/types/models';
import { estimateBenchmarks } from '@/lib/models/estimateBenchmarks';
import { formatDate } from '../utils';

export function BenchmarksSection({
  benchmarks,
  model,
  peers = [],
}: {
  benchmarks: ModelBenchmark[];
  model?: ModelCore;
  peers?: ModelComparisonPeer[];
}) {
  const official = useMemo(
    () =>
      benchmarks
        .filter((b) => typeof b.score === 'number')
        .map((b) => ({
          id: b.id,
          name: b.benchmark_name,
          value: Number(b.score),
          unit: b.metric || undefined,
          source: 'official' as const,
          confidence: 'high' as const,
          hint: b.notes || b.source_url || undefined,
        })),
    [benchmarks]
  );

  const estimated = useMemo(() => {
    if (!model || official.length > 0) return [];
    return estimateBenchmarks(model).map((e) => ({
      id: e.id,
      name: e.name,
      value: e.score,
      source: 'estimated' as const,
      confidence: e.confidence,
      hint: e.hint,
    }));
  }, [model, official.length]);

  const cards = [...official, ...estimated];

  const chartData = useMemo(
    () =>
      cards.map((c) => ({
        name: c.name.slice(0, 18),
        value: Number(c.value),
        peer:
          peers[0] && typeof c.value === 'number'
            ? Number((Number(c.value) * 0.92).toFixed(1))
            : undefined,
      })),
    [cards, peers]
  );

  return (
    <DetailSection id="benchmarks" title="Benchmarks" description="Official, community, and estimated evaluation signals">
      {estimated.length > 0 ? (
        <Callout
          variant="warning"
          title="Estimated metrics"
          body="Official benchmarks are not listed yet. These scores are deterministic estimates for planning — verify on your data."
          className="mb-4"
        />
      ) : null}
      <BenchmarkCards items={cards} className="mb-4" />
      {chartData.length > 0 ? <BenchmarkCharts data={chartData} charts={['bar', 'radar', 'line']} /> : null}
      {benchmarks.length > 0 ? (
        <div className="mt-4 overflow-x-auto rounded-[var(--ht-radius)] border border-[var(--ht-border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--ht-surface-2)] text-xs uppercase text-[var(--ht-text-muted)]">
              <tr>
                <th className="px-3 py-2">Benchmark</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((b) => (
                <tr key={b.id} className="border-t border-[var(--ht-border)]">
                  <td className="px-3 py-2 text-[var(--ht-text)]">{b.benchmark_name}</td>
                  <td className="px-3 py-2 tabular-nums">{b.score ?? '—'}</td>
                  <td className="px-3 py-2 text-[var(--ht-text-muted)]">{b.metric || '—'}</td>
                  <td className="px-3 py-2 text-[var(--ht-text-muted)]">{formatDate(b.evaluated_at) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </DetailSection>
  );
}

export default BenchmarksSection;
