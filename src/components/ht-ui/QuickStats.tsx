import { MetricCard, type MetricCardProps } from './MetricCard';

export type QuickStatsProps = {
  items: MetricCardProps[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
};

const colClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-3 lg:grid-cols-5',
  6: 'sm:grid-cols-3 lg:grid-cols-6',
};

export function QuickStats({ items, columns = 4, className = '' }: QuickStatsProps) {
  if (!items.length) return null;
  return (
    <div className={`grid grid-cols-2 gap-2 ${colClass[columns] || colClass[4]} ${className}`} role="list">
      {items.map((item, i) => (
        <div key={item.id || i} role="listitem">
          <MetricCard {...item} />
        </div>
      ))}
    </div>
  );
}
