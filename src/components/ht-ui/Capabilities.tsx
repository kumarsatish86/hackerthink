import { Badge, Card } from './Button';

export type CapabilityGroupData = {
  id: string;
  label: string;
  items: string[];
};

export type CapabilitiesProps = {
  groups: CapabilityGroupData[];
  title?: string;
  className?: string;
};

export function Capabilities({ groups, title = 'Capabilities', className = '' }: CapabilitiesProps) {
  if (!groups.length) return null;
  return (
    <div className={`space-y-3 ${className}`} aria-label={title}>
      <h3 className="text-sm font-semibold text-[var(--ht-text)]">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <Card key={g.id} className="p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--ht-text-muted)]">
              {g.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <Badge key={item} tone="neutral">
                  {item}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
