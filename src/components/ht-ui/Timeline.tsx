import { Card } from './Button';

export type TimelineEvent = {
  id: string;
  date?: string;
  title: string;
  body?: string;
};

export type TimelineProps = {
  events: TimelineEvent[];
  className?: string;
};

export function Timeline({ events, className = '' }: TimelineProps) {
  if (!events.length) return null;
  return (
    <ol className={`relative space-y-4 border-l border-[var(--ht-border)] pl-6 ${className}`}>
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span
            className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--ht-brand)] ring-4 ring-[var(--ht-bg)]"
            aria-hidden
          />
          <Card className="p-3">
            {e.date ? <time className="text-[10px] font-medium uppercase text-[var(--ht-text-muted)]">{e.date}</time> : null}
            <h4 className="text-sm font-semibold text-[var(--ht-text)]">{e.title}</h4>
            {e.body ? <p className="mt-1 text-sm text-[var(--ht-text-muted)]">{e.body}</p> : null}
          </Card>
        </li>
      ))}
    </ol>
  );
}
