'use client';

import { FaStar } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import type { ProductionReadiness } from '@/lib/models/deriveProductionReadiness';

export function ProductionReadinessCard({ data }: { data: ProductionReadiness }) {
  return (
    <Card className="p-5" aria-label="Production readiness">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--m-text)]">Production Readiness</h3>
          <div className="mt-2 flex items-center gap-1" aria-label={`${data.stars} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                className={`h-4 w-4 ${i < data.stars ? 'text-amber-400' : 'text-[var(--m-border)]'}`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-[var(--m-text)]">{data.score}/100</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {data.labels.map((l) => (
            <Badge key={l} tone={l.includes('Production') || l.includes('Enterprise') ? 'success' : 'neutral'}>
              {l}
            </Badge>
          ))}
        </div>
      </div>
      <p className="mt-3 text-sm text-[var(--m-text-muted)]">{data.reason}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Community" value={data.communitySize} />
        <Metric label="Documentation" value={`${data.documentationScore}/100`} />
        <Metric label="Deployment" value={`${data.deploymentScore}/100`} />
        <Metric label="Updates" value={data.activelyUpdated ? 'Active' : data.maintained ? 'Maintained' : 'Stale'} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[var(--m-surface-2)] px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--m-text-muted)]">{label}</div>
      <div className="mt-0.5 text-sm font-semibold capitalize text-[var(--m-text)]">{value}</div>
    </div>
  );
}
