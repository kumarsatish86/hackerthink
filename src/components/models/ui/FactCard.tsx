import { Card } from './primitives';

export function FactCard({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <Card className="p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--m-text)] break-words">{value}</p>
    </Card>
  );
}

export function QuickFactsGrid({ facts }: { facts: Record<string, string | undefined | null> }) {
  const entries = Object.entries(facts).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(([label, value]) => (
        <FactCard key={label} label={label.replace(/_/g, ' ')} value={value} />
      ))}
    </div>
  );
}
