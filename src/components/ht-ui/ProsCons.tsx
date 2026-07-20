'use client';

import { useState } from 'react';
import { FaChevronDown, FaThumbsDown, FaThumbsUp } from 'react-icons/fa';
import { Card } from './Button';

export type ProsConsProps = {
  pros?: string[];
  cons?: string[];
  expandable?: boolean;
  initiallyExpanded?: boolean;
  className?: string;
};

export function ProsCons({
  pros = [],
  cons = [],
  expandable = true,
  initiallyExpanded = true,
  className = '',
}: ProsConsProps) {
  const [open, setOpen] = useState(initiallyExpanded);
  if (!pros.length && !cons.length) return null;

  return (
    <Card className={`p-4 ${className}`}>
      {expandable ? (
        <button
          type="button"
          className="mb-3 flex w-full items-center justify-between text-sm font-semibold text-[var(--ht-text)]"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Pros & Cons
          <FaChevronDown className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden />
        </button>
      ) : (
        <h3 className="mb-3 text-sm font-semibold text-[var(--ht-text)]">Pros & Cons</h3>
      )}
      {open ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--ht-success)]">
              <FaThumbsUp aria-hidden /> Pros
            </h4>
            <ul className="space-y-1.5 text-sm text-[var(--ht-text)]">
              {pros.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--ht-success)]">+</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-[var(--ht-danger)]">
              <FaThumbsDown aria-hidden /> Cons
            </h4>
            <ul className="space-y-1.5 text-sm text-[var(--ht-text)]">
              {cons.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[var(--ht-danger)]">−</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
