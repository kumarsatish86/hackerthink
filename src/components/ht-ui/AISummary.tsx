import { Card } from './Button';

export type AISummaryProps = {
  title?: string;
  paragraph: string;
  bullets?: string[];
  className?: string;
};

export function AISummary({ title = 'AI Summary', paragraph, bullets = [], className = '' }: AISummaryProps) {
  if (!paragraph && !bullets.length) return null;
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="mb-2 text-sm font-semibold text-[var(--ht-brand)]">{title}</h3>
      {paragraph ? <p className="text-sm leading-relaxed text-[var(--ht-text)]">{paragraph}</p> : null}
      {bullets.length > 0 ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ht-text)]">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
