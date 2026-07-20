'use client';

import { useEffect, useState } from 'react';

export type StickyTocSection = { id: string; label: string };

export type StickyTOCProps = {
  sections: StickyTocSection[];
  keyboardHint?: string;
  className?: string;
};

export function StickyTOC({ sections, keyboardHint, className = '' }: StickyTOCProps) {
  const [active, setActive] = useState(sections[0]?.id || '');

  useEffect(() => {
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  if (!sections.length) return null;

  return (
    <nav
      className={`sticky top-16 z-30 border-b border-[var(--ht-border)] bg-[var(--ht-bg)]/95 backdrop-blur ${className}`}
      aria-label="Table of contents"
    >
      <div className="flex gap-1 overflow-x-auto py-2 scrollbar-thin">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              active === s.id
                ? 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]'
                : 'text-[var(--ht-text-muted)] hover:bg-[var(--ht-surface-2)] hover:text-[var(--ht-text)]'
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
      {keyboardHint ? (
        <p className="pb-2 text-[10px] text-[var(--ht-text-muted)]">{keyboardHint}</p>
      ) : null}
    </nav>
  );
}
