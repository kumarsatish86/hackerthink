import Link from 'next/link';
import { Card } from './Button';

export type RelatedResource = {
  id: string;
  title: string;
  href: string;
  description?: string;
};

export type RelatedResourceGroup = {
  id: string;
  label: string;
  items: RelatedResource[];
};

export type RelatedResourcesProps = {
  groups: RelatedResourceGroup[];
  className?: string;
};

export function RelatedResources({ groups, className = '' }: RelatedResourcesProps) {
  if (!groups.length) return null;
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className}`}>
      {groups.map((g) => (
        <Card key={g.id} className="p-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--ht-text-muted)]">
            {g.label}
          </h3>
          <ul className="space-y-2">
            {g.items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-sm font-medium text-[var(--ht-brand)] hover:underline">
                  {item.title}
                </Link>
                {item.description ? (
                  <p className="text-xs text-[var(--ht-text-muted)]">{item.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
