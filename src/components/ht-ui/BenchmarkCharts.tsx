'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from './Button';

export type BenchmarkChartPoint = {
  name: string;
  value: number;
  peer?: number;
};

export type BenchmarkChartsProps = {
  data: BenchmarkChartPoint[];
  charts?: Array<'bar' | 'radar' | 'line'>;
  className?: string;
};

export function BenchmarkCharts({ data, charts = ['bar', 'radar'], className = '' }: BenchmarkChartsProps) {
  if (!data.length) return null;

  return (
    <div className={`grid grid-cols-1 gap-4 lg:grid-cols-2 ${className}`}>
      {charts.includes('bar') ? (
        <Card className="p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase text-[var(--ht-text-muted)]">Bar</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ht-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--ht-brand)" name="This model" />
                {data.some((d) => d.peer != null) ? (
                  <Bar dataKey="peer" fill="var(--ht-info)" name="Peer avg" />
                ) : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}
      {charts.includes('radar') ? (
        <Card className="p-3">
          <h4 className="mb-2 text-xs font-semibold uppercase text-[var(--ht-text-muted)]">Radar</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid stroke="var(--ht-border)" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis tick={{ fontSize: 9 }} />
                <Radar dataKey="value" stroke="var(--ht-brand)" fill="var(--ht-brand)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}
      {charts.includes('line') ? (
        <Card className="p-3 lg:col-span-2">
          <h4 className="mb-2 text-xs font-semibold uppercase text-[var(--ht-text-muted)]">Trend</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--ht-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="var(--ht-brand)" name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
