import { FaStar } from 'react-icons/fa';
import { Card } from './Button';

export type RatingAxis = {
  id: string;
  name: string;
  score: number;
  max?: number;
  why?: string;
};

export type RatingCardProps = {
  title?: string;
  score: number;
  max?: number;
  axes?: RatingAxis[];
  className?: string;
};

export function RatingCard({ title, score, max = 10, axes = [], className = '' }: RatingCardProps) {
  const display = Number.isFinite(score) ? score.toFixed(1) : '—';
  return (
    <Card className={`p-4 ${className}`}>
      {title ? <h3 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">{title}</h3> : null}
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-[var(--ht-brand)]">{display}</span>
        <span className="text-sm text-[var(--ht-text-muted)]">/ {max}</span>
        <FaStar className="ml-1 text-[var(--ht-warning)]" aria-hidden />
      </div>
      {axes.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {axes.map((a) => {
            const aMax = a.max ?? max;
            const pct = Math.min(100, Math.max(0, (a.score / aMax) * 100));
            return (
              <li key={a.id}>
                <div className="mb-0.5 flex justify-between text-xs">
                  <span className="text-[var(--ht-text)]">{a.name}</span>
                  <span className="tabular-nums text-[var(--ht-text-muted)]">
                    {a.score.toFixed(1)}/{aMax}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ht-surface-2)]">
                  <div
                    className="h-full rounded-full bg-[var(--ht-brand)] transition-[width]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {a.why ? <p className="mt-0.5 text-[10px] text-[var(--ht-text-muted)]">{a.why}</p> : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </Card>
  );
}
