'use client';

import { FaLightbulb } from 'react-icons/fa';
import { EmptyState } from '@/components/ht-ui';
import type { HtAction } from '@/components/ht-ui';

export function ModelEmptyState({
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
      icon={<FaLightbulb className="h-8 w-8" />}
    />
  );
}
