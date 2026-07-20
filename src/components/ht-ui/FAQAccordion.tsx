'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Card } from './Button';

export type FaqItem = { id: string; q: string; a: string };

export type FAQAccordionProps = {
  items: FaqItem[];
  className?: string;
  allowMultiple?: boolean;
};

export function FAQAccordion({ items, className = '', allowMultiple = false }: FAQAccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(items[0] ? [items[0].id] : []));

  function toggle(id: string) {
    setOpen((prev) => {
      if (allowMultiple) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }
      return prev.has(id) ? new Set() : new Set([id]);
    });
  }

  if (!items.length) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        return (
          <Card key={item.id} className="overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-[var(--ht-text)]"
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              {item.q}
              <FaChevronDown className={`shrink-0 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {isOpen ? (
              <div className="border-t border-[var(--ht-border)] px-4 py-3 text-sm text-[var(--ht-text-muted)]">
                {item.a}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
