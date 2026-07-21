'use client';

import { FaDatabase } from 'react-icons/fa';
import { EmptyState } from '@/components/ht-ui';
import type { HtAction } from '@/components/ht-ui';

export function DatasetEmptyState({
  title,
  body,
  actions,
  related,
}: {
  title: string;
  body?: string;
  actions?: HtAction[];
  related?: { id: string; label: string; href: string }[];
}) {
  return (
    <EmptyState
      title={title}
      body={body}
      actions={actions}
      related={related}
      icon={<FaDatabase className="h-8 w-8" />}
    />
  );
}
