'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FaChartBar, FaTrophy } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelBenchmark } from '@/types/models';
import { formatDate } from '../utils';

const BAR_COLORS = ['#dc2626', '#f87171', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#c084fc'];

export function BenchmarksSection({ benchmarks }: { benchmarks: ModelBenchmark[] }) {
  const chartData = useMemo(
    () =>
      benchmarks
        .filter((b) => typeof b.score === 'number')
        .map((b) => ({ name: b.benchmark_name, score: Number(b.score) })),
    [benchmarks]
  );

  const bestScore = chartData.length ? Math.max(...chartData.map((d) => d.score)) : null;

  return (
    <DetailSection id="benchmarks" title="Benchmarks" description="Evaluation results across standard benchmarks">
      {benchmarks.length > 0 ? (
        <div className="space-y-6">
          {chartData.length > 0 && (
            <Card className="p-4">
              <div style={{ width: '100%', height: Math.max(240, chartData.length * 36) }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 24, right: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--m-surface-2)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--m-text)]">Benchmark</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--m-text)]">Score</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--m-text)]">Metric</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--m-text)]">Dataset</th>
                    <th className="px-4 py-3 text-left font-semibold text-[var(--m-text)]">Evaluated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--m-border)]">
                  {benchmarks.map((b) => {
                    const isBest = bestScore !== null && Number(b.score) === bestScore;
                    return (
                      <tr key={b.id} className={isBest ? 'bg-[var(--m-brand-soft)]' : undefined}>
                        <td className="px-4 py-3 font-medium text-[var(--m-text)]">
                          <span className="flex items-center gap-2">
                            {isBest && <FaTrophy className="h-3.5 w-3.5 text-amber-500" />}
                            {b.source_url ? (
                              <a href={b.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--m-brand)] hover:underline">
                                {b.benchmark_name}
                              </a>
                            ) : (
                              b.benchmark_name
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[var(--m-text)]">{b.score ?? '—'}</td>
                        <td className="px-4 py-3 text-[var(--m-text-muted)]">{b.metric || '—'}</td>
                        <td className="px-4 py-3 text-[var(--m-text-muted)]">{b.dataset || '—'}</td>
                        <td className="px-4 py-3 text-[var(--m-text-muted)]">{formatDate(b.evaluated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {benchmarks.some((b) => b.notes) && (
            <div className="space-y-2">
              {benchmarks
                .filter((b) => b.notes)
                .map((b) => (
                  <Card key={b.id} className="p-3 text-sm text-[var(--m-text-muted)]">
                    <Badge tone="brand" className="mr-2">
                      {b.benchmark_name}
                    </Badge>
                    {b.notes}
                  </Card>
                ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaChartBar className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">Benchmark data is not available for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default BenchmarksSection;
