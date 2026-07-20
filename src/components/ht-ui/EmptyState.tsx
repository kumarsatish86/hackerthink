import Link from 'next/link';
import { Button, Card } from './Button';
import type { HtAction } from './types';

export type EmptyStateProps = {
  title: string;
  body?: string;
  actions?: HtAction[];
  related?: { id: string; label: string; href: string }[];
  icon?: React.ReactNode;
  className?: string;
};

/** Never use "no data available" — pass helpful title/body/actions via JSON. */
export function EmptyState({ title, body, actions = [], related = [], icon, className = '' }: EmptyStateProps) {
  return (
    <Card className={`p-6 text-center ${className}`} role="status">
      {icon ? <div className="mx-auto mb-3 flex justify-center text-[var(--ht-text-muted)]">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-[var(--ht-text)]">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ht-text-muted)]">{body}</p> : null}
      {actions.length > 0 ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {actions.map((a) =>
            a.href ? (
              <Link key={a.id} href={a.href}>
                <Button variant={a.variant || 'outline'} size="sm">
                  {a.label}
                </Button>
              </Link>
            ) : (
              <Button key={a.id} variant={a.variant || 'outline'} size="sm">
                {a.label}
              </Button>
            )
          )}
        </div>
      ) : null}
      {related.length > 0 ? (
        <ul className="mt-4 flex flex-wrap justify-center gap-3 text-xs">
          {related.map((r) => (
            <li key={r.id}>
              <Link href={r.href} className="text-[var(--ht-brand)] hover:underline">
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
