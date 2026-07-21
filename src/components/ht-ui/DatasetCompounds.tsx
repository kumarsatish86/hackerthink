'use client';

import type { ReactNode } from 'react';
import { Card, Badge } from './Button';
import { BenchmarkCharts } from './BenchmarkCharts';
import type { BenchmarkChartPoint } from './BenchmarkCharts';
import { CodeViewer } from './CodeViewer';
import type { CodeViewerVersion } from './CodeViewer';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import type { HtTone } from './types';

/** Shared Estimated / Official / Community badge. */
export function SourceBadge({
  source = 'estimated',
}: {
  source?: 'official' | 'estimated' | 'community' | string;
}) {
  const tone: HtTone =
    source === 'official' ? 'success' : source === 'community' ? 'brand' : 'neutral';
  const label =
    source === 'official' ? 'Official' : source === 'community' ? 'Community' : 'Estimated';
  return <Badge tone={tone}>{label}</Badge>;
}

export type QualityDashboardMetric = {
  id: string;
  label: string;
  value: number;
  source?: string;
  notes?: string;
};

export function QualityDashboard({
  metrics,
  title = 'Quality health',
}: {
  metrics: QualityDashboardMetric[];
  title?: string;
}) {
  if (!metrics.length) {
    return (
      <EmptyState
        title="Quality estimates loading"
        body="Health metrics will appear from catalog heuristics or official audits."
      />
    );
  }
  const points: BenchmarkChartPoint[] = metrics.map((m) => ({
    name: m.label,
    value: m.value,
  }));
  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--ht-text)]">{title}</h3>
        <SourceBadge source={metrics[0]?.source || 'estimated'} />
      </div>
      <BenchmarkCharts data={points} charts={['bar']} />
      <ul className="grid gap-2 sm:grid-cols-2">
        {metrics.map((m) => (
          <li key={m.id} className="rounded border border-[var(--ht-border)] p-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-[var(--ht-text)]">{m.label}</span>
              <span className="tabular-nums text-[var(--ht-text-muted)]">{Math.round(m.value)}</span>
            </div>
            {m.notes ? <p className="mt-1 text-xs text-[var(--ht-text-muted)]">{m.notes}</p> : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export type DownloadMirror = {
  id: string;
  label: string;
  url: string;
  source?: string;
  checksum?: string;
  size?: string;
};

export function DownloadCenter({
  mirrors,
  storageHint,
  snippets,
  children,
}: {
  mirrors: DownloadMirror[];
  storageHint?: string;
  snippets?: CodeViewerVersion[];
  children?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {storageHint ? (
        <p className="text-sm text-[var(--ht-text-muted)]">Storage / bandwidth estimate: {storageHint}</p>
      ) : null}
      {mirrors.length ? (
        <ul className="space-y-2">
          {mirrors.map((m) => (
            <li key={m.id}>
              <Card className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[var(--ht-brand)] hover:underline"
                  >
                    {m.label}
                  </a>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-[var(--ht-text-muted)]">
                    {m.source ? <SourceBadge source={m.source} /> : null}
                    {m.size ? <span>{m.size}</span> : null}
                    {m.checksum ? <span className="font-mono">sha: {m.checksum.slice(0, 12)}…</span> : null}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="Official mirrors not listed yet"
          body="Use Hugging Face, Kaggle, or GitHub links from the hero when available."
        />
      )}
      {snippets?.length ? (
        <CodeViewer
          code={snippets[0].code}
          language={snippets[0].language || 'python'}
          title={snippets[0].label}
          versions={snippets}
        />
      ) : null}
      {children}
    </div>
  );
}

export type DataExplorerRow = {
  id: string;
  label?: string;
  modality?: string;
  preview?: string;
};

export function DataExplorer({
  rows,
  query,
  onQueryChange,
  error,
  onRetry,
  children,
}: {
  rows: DataExplorerRow[];
  query?: string;
  onQueryChange?: (q: string) => void;
  error?: string | null;
  onRetry?: () => void;
  children?: ReactNode;
}) {
  if (error) {
    return <ErrorState title="Explorer unavailable" message={error} onRetry={onRetry} />;
  }

  const q = (query || '').toLowerCase().trim();
  const filtered = q
    ? rows.filter(
        (r) =>
          (r.label || '').toLowerCase().includes(q) ||
          (r.preview || '').toLowerCase().includes(q) ||
          (r.modality || '').toLowerCase().includes(q)
      )
    : rows;

  return (
    <div className="space-y-3">
      {onQueryChange ? (
        <label className="block text-sm">
          <span className="sr-only">Filter samples</span>
          <input
            value={query || ''}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Filter preview rows…"
            className="w-full rounded-md border border-[var(--ht-border)] bg-[var(--ht-bg)] px-3 py-2 text-sm text-[var(--ht-text)] focus:outline-none focus:ring-2 focus:ring-[var(--ht-brand)]"
          />
        </label>
      ) : null}
      {filtered.length ? (
        <ul className="divide-y divide-[var(--ht-border)] rounded-lg border border-[var(--ht-border)]">
          {filtered.map((r) => (
            <li key={r.id} className="px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-[var(--ht-text)]">{r.label || r.id}</span>
                {r.modality ? <Badge>{r.modality}</Badge> : null}
              </div>
              {r.preview ? (
                <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap text-xs text-[var(--ht-text-muted)]">
                  {r.preview.slice(0, 500)}
                </pre>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No preview rows in this window"
          body="Try another filter, open Hugging Face, or enrich samples in admin."
        />
      )}
      {children}
    </div>
  );
}
