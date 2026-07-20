import { Badge, Card } from './Button';

export type BenchmarkSource = 'official' | 'community' | 'estimated';

export type BenchmarkCardItem = {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  source: BenchmarkSource;
  confidence?: 'high' | 'medium' | 'low';
  hint?: string;
};

export type BenchmarkCardsProps = {
  items: BenchmarkCardItem[];
  className?: string;
};

const sourceTone: Record<BenchmarkSource, 'success' | 'info' | 'warning'> = {
  official: 'success',
  community: 'info',
  estimated: 'warning',
};

export function BenchmarkCards({ items, className = '' }: BenchmarkCardsProps) {
  if (!items.length) return null;
  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {items.map((b) => (
        <Card key={b.id} className="p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--ht-text)]">{b.name}</span>
            <Badge tone={sourceTone[b.source]}>{b.source}</Badge>
          </div>
          <div className="text-lg font-bold tabular-nums text-[var(--ht-text)]">
            {b.value}
            {b.unit ? <span className="ml-1 text-xs font-normal text-[var(--ht-text-muted)]">{b.unit}</span> : null}
          </div>
          {b.confidence ? (
            <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--ht-text-muted)]">
              Confidence: {b.confidence}
            </p>
          ) : null}
          {b.hint ? <p className="mt-1 text-xs text-[var(--ht-text-muted)]">{b.hint}</p> : null}
        </Card>
      ))}
    </div>
  );
}
