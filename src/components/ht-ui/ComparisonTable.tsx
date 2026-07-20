import Link from 'next/link';
import { Card } from './Button';

export type ComparisonColumn = { id: string; label: string };
export type ComparisonRow = { id: string; cells: Record<string, string | number | null | undefined>; href?: string };

export type ComparisonTableProps = {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
};

export function ComparisonTable({ columns, rows, className = '' }: ComparisonTableProps) {
  if (!columns.length) return null;
  return (
    <Card className={`overflow-x-auto ${className}`}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--ht-border)] bg-[var(--ht-surface-2)] text-xs uppercase text-[var(--ht-text-muted)]">
          <tr>
            {columns.map((c) => (
              <th key={c.id} className="px-3 py-2 font-semibold">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[var(--ht-border)] last:border-0">
              {columns.map((c, i) => {
                const val = r.cells[c.id];
                const content = val == null || val === '' ? '—' : String(val);
                return (
                  <td key={c.id} className="px-3 py-2 text-[var(--ht-text)]">
                    {i === 0 && r.href ? (
                      <Link href={r.href} className="font-medium text-[var(--ht-brand)] hover:underline">
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
