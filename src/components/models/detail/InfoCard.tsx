'use client';

import { useState } from 'react';
import { Card } from '@/components/models/ui/primitives';

export function InfoCard({
  title,
  icon,
  bullets,
  tone = 'neutral',
  maxBullets = 3,
}: {
  title: string;
  icon?: React.ReactNode;
  bullets: string[];
  tone?: 'neutral' | 'success' | 'warning';
  maxBullets?: number;
}) {
  const [open, setOpen] = useState(false);
  if (!bullets.length) return null;
  const visible = open ? bullets : bullets.slice(0, maxBullets);
  const toneClass =
    tone === 'success' ? 'text-emerald-600' : tone === 'warning' ? 'text-amber-600' : 'text-[var(--m-brand)]';

  return (
    <Card className="p-4">
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${toneClass}`}>
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {visible.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[var(--m-text)]">
            <span className={`mt-0.5 ${toneClass}`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {bullets.length > maxBullets && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 text-xs font-medium text-[var(--m-brand)] hover:underline"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </Card>
  );
}
