'use client';

import { TagPill } from './TagPill';
import { CodeViewer } from './CodeViewer';

export type InstallStep = {
  id: string;
  title: string;
  code: string;
  language?: string;
};

export type InstallationBlocksProps = {
  meta?: { id: string; label: string; tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'info' }[];
  steps: InstallStep[];
  className?: string;
};

export function InstallationBlocks({ meta = [], steps, className = '' }: InstallationBlocksProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {meta.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {meta.map((m) => (
            <TagPill key={m.id} label={m.label} tone={m.tone || 'neutral'} />
          ))}
        </div>
      ) : null}
      {steps.map((s) => (
        <div key={s.id}>
          <h4 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">{s.title}</h4>
          <CodeViewer code={s.code} language={s.language || 'bash'} filename={`${s.id}.${s.language || 'sh'}`} />
        </div>
      ))}
    </div>
  );
}
