'use client';

import { useMemo, useState } from 'react';
import { TagPill } from './TagPill';
import { CodeViewer } from './CodeViewer';

export type DeploymentTarget = {
  id: string;
  label: string;
  snippet: string;
  language?: string;
};

export type DeploymentGeneratorProps = {
  targets: DeploymentTarget[];
  defaultTargetId?: string;
  className?: string;
};

export function DeploymentGeneratorUI({
  targets,
  defaultTargetId,
  className = '',
}: DeploymentGeneratorProps) {
  const [active, setActive] = useState(defaultTargetId || targets[0]?.id || '');
  const current = useMemo(() => targets.find((t) => t.id === active) || targets[0], [targets, active]);

  if (!targets.length) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-1.5">
        {targets.map((t) => (
          <button key={t.id} type="button" onClick={() => setActive(t.id)}>
            <TagPill label={t.label} tone={t.id === active ? 'brand' : 'neutral'} />
          </button>
        ))}
      </div>
      {current ? (
        <CodeViewer code={current.snippet} language={current.language || 'bash'} title={current.label} />
      ) : null}
    </div>
  );
}
