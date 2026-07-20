'use client';

import { QuickStats } from '@/components/ht-ui';
import type { QuickStatItem } from '@/lib/models/buildQuickStats';

export function QuickStatsGrid({ items }: { items: QuickStatItem[] }) {
  return (
    <QuickStats
      items={items.map((i) => ({
        id: i.id,
        label: i.label,
        value: i.value,
        hint: i.hint,
        estimated: i.estimated,
      }))}
      columns={6}
    />
  );
}
