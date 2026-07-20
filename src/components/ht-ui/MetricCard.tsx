'use client';

import type { HtTone } from './types';
import { Card } from './Button';

export type MetricCardProps = {
  id?: string;
  label: string;
  value: string;
  hint?: string;
  estimated?: boolean;
  tone?: HtTone;
  className?: string;
};

export function MetricCard({
  id,
  label,
  value,
  hint,
  estimated,
  className = '',
}: MetricCardProps) {
  return (
    <Card className={`p-3 ${className}`} data-metric-id={id}>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--ht-text-muted)]">
        {label}
        {estimated ? <span className="ml-1 font-normal normal-case">(est.)</span> : null}
      </div>
      <div className="mt-1 text-sm font-semibold text-[var(--ht-text)]">{value}</div>
      {hint ? <p className="mt-0.5 text-xs text-[var(--ht-text-muted)]">{hint}</p> : null}
    </Card>
  );
}
