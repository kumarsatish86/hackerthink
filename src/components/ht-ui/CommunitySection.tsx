'use client';

import { useState } from 'react';
import { Card } from './Button';

export type CommunityBlock = {
  id: string;
  label: string;
  items: { id: string; title: string; body?: string; href?: string }[];
};

export type CommunitySectionProps = {
  blocks: CommunityBlock[];
  className?: string;
};

export function CommunitySectionUI({ blocks, className = '' }: CommunitySectionProps) {
  const [tab, setTab] = useState(blocks[0]?.id || '');
  if (!blocks.length) return null;
  const active = blocks.find((b) => b.id === tab) || blocks[0];

  return (
    <div className={className}>
      <div className="mb-3 flex flex-wrap gap-1" role="tablist">
        {blocks.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={b.id === active.id}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              b.id === active.id
                ? 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]'
                : 'text-[var(--ht-text-muted)] hover:bg-[var(--ht-surface-2)]'
            }`}
            onClick={() => setTab(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div className="space-y-2" role="tabpanel">
        {active.items.map((item) => (
          <Card key={item.id} className="p-3">
            <h4 className="text-sm font-semibold text-[var(--ht-text)]">
              {item.href ? (
                <a href={item.href} className="text-[var(--ht-brand)] hover:underline">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </h4>
            {item.body ? <p className="mt-1 text-sm text-[var(--ht-text-muted)]">{item.body}</p> : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
