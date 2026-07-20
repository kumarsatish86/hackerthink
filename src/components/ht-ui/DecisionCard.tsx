import Link from 'next/link';
import { FaStar } from 'react-icons/fa';
import { Badge, Card } from './Button';

export type DecisionListItem = {
  id: string;
  label: string;
  why?: string;
};

export type DecisionAlternative = {
  id: string;
  label: string;
  name: string;
  slug: string;
  why?: string;
};

export type DecisionCardProps = {
  title?: string;
  stars?: number;
  maxStars?: number;
  recommended?: DecisionListItem[];
  notRecommended?: DecisionListItem[];
  alternatives?: DecisionAlternative[];
  className?: string;
};

export function DecisionCard({
  title = 'Should You Use This Model?',
  stars = 0,
  maxStars = 5,
  recommended = [],
  notRecommended = [],
  alternatives = [],
  className = '',
}: DecisionCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--ht-text)]">{title}</h3>
        <div className="flex items-center gap-0.5" aria-label={`${stars} of ${maxStars} stars`}>
          {Array.from({ length: maxStars }).map((_, i) => (
            <FaStar
              key={i}
              className={i < stars ? 'text-[var(--ht-warning)]' : 'text-[var(--ht-border)]'}
              aria-hidden
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ht-success)]">
            Recommended For
          </h4>
          <ul className="space-y-2">
            {recommended.map((r) => (
              <li key={r.id} className="text-sm">
                <span className="font-medium text-[var(--ht-text)]">{r.label}</span>
                {r.why ? <p className="text-xs text-[var(--ht-text-muted)]">{r.why}</p> : null}
              </li>
            ))}
            {!recommended.length ? (
              <li className="text-xs text-[var(--ht-text-muted)]">No strong recommendations derived yet.</li>
            ) : null}
          </ul>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ht-danger)]">
            Not Recommended For
          </h4>
          <ul className="space-y-2">
            {notRecommended.map((r) => (
              <li key={r.id} className="text-sm">
                <span className="font-medium text-[var(--ht-text)]">{r.label}</span>
                {r.why ? <p className="text-xs text-[var(--ht-text-muted)]">{r.why}</p> : null}
              </li>
            ))}
            {!notRecommended.length ? (
              <li className="text-xs text-[var(--ht-text-muted)]">No hard exclusions derived yet.</li>
            ) : null}
          </ul>
        </div>
      </div>
      {alternatives.length > 0 ? (
        <div className="mt-4 border-t border-[var(--ht-border)] pt-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ht-text-muted)]">
            Better Alternatives
          </h4>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((a) => (
              <Link key={a.id} href={`/models/${a.slug}`} className="group">
                <Badge tone="brand" className="group-hover:opacity-90">
                  {a.label}: {a.name}
                </Badge>
                {a.why ? (
                  <span className="mt-0.5 block max-w-[12rem] text-[10px] text-[var(--ht-text-muted)]">{a.why}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
