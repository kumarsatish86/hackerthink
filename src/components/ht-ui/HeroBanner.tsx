import Link from 'next/link';
import { Button, Badge } from './Button';
import { MetricCard, type MetricCardProps } from './MetricCard';
import type { HtAction } from './types';

export type HeroBannerProps = {
  title: string;
  subtitle?: string;
  badges?: { id: string; label: string; tone?: 'neutral' | 'brand' | 'success' | 'warning' }[];
  metrics?: MetricCardProps[];
  media?: { src?: string; alt?: string };
  actions?: HtAction[];
  className?: string;
  children?: React.ReactNode;
};

export function HeroBanner({
  title,
  subtitle,
  badges = [],
  metrics = [],
  media,
  actions = [],
  className = '',
  children,
}: HeroBannerProps) {
  return (
    <header
      className={`rounded-[var(--ht-radius-lg)] border border-[var(--ht-border)] bg-[var(--ht-surface)] p-4 shadow-[var(--ht-shadow)] sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {media?.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={media.src}
            alt={media.alt || title}
            className="h-14 w-14 shrink-0 rounded-lg border border-[var(--ht-border)] object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--ht-text)] sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-[var(--ht-text-muted)] sm:text-base">{subtitle}</p> : null}
          {badges.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {badges.map((b) => (
                <Badge key={b.id} tone={b.tone || 'neutral'}>
                  {b.label}
                </Badge>
              ))}
            </div>
          ) : null}
          {actions.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((a) =>
                a.href ? (
                  <Link key={a.id} href={a.href} target={a.external ? '_blank' : undefined} rel={a.external ? 'noopener noreferrer' : undefined}>
                    <Button variant={a.variant || 'primary'} size="sm">
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
          {children}
        </div>
      </div>
      {metrics.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <MetricCard key={m.id || i} {...m} />
          ))}
        </div>
      ) : null}
    </header>
  );
}
