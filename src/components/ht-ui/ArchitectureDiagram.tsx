'use client';

import { useState } from 'react';
import { Card } from './Button';

export type ArchitectureNode = {
  key: string;
  title: string;
  explanation?: string;
};

export type ArchitectureDiagramProps = {
  nodes: ArchitectureNode[];
  className?: string;
};

export function ArchitectureDiagram({ nodes, className = '' }: ArchitectureDiagramProps) {
  const [selected, setSelected] = useState<string | null>(nodes[0]?.key || null);
  const [hovered, setHovered] = useState<string | null>(null);

  if (!nodes.length) return null;
  const active = nodes.find((n) => n.key === (hovered || selected)) || nodes[0];

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2" role="list">
        {nodes.map((n, i) => {
          const isSel = selected === n.key;
          return (
            <div key={n.key} className="flex items-center gap-2" role="listitem">
              <button
                type="button"
                onClick={() => setSelected(n.key)}
                onMouseEnter={() => setHovered(n.key)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(n.key)}
                onBlur={() => setHovered(null)}
                title={n.explanation || n.title}
                className={`rounded-lg border px-3 py-2 text-xs font-semibold transition motion-safe:duration-200 ${
                  isSel
                    ? 'scale-105 border-[var(--ht-brand)] bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]'
                    : 'border-[var(--ht-border)] bg-[var(--ht-surface)] text-[var(--ht-text)] hover:border-[var(--ht-brand)]'
                }`}
                aria-pressed={isSel}
              >
                {n.title}
              </button>
              {i < nodes.length - 1 ? (
                <span className="text-[var(--ht-text-muted)]" aria-hidden>
                  →
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {active?.explanation ? (
        <Card className="mt-4 p-3 motion-safe:animate-in motion-safe:fade-in">
          <h4 className="text-sm font-semibold text-[var(--ht-text)]">{active.title}</h4>
          <p className="mt-1 text-sm text-[var(--ht-text-muted)]">{active.explanation}</p>
        </Card>
      ) : null}
    </div>
  );
}
