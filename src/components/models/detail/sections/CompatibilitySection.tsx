'use client';

import { FaCheckCircle, FaTimesCircle, FaPlug } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore } from '@/types/models';

function formatKey(key: string) {
  return key.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CompatibilitySection({ model }: { model: ModelCore }) {
  const matrix = model.compatibility_matrix || {};
  const entries = Object.entries(matrix);

  return (
    <DetailSection id="compatibility" title="Compatibility" description="Platform, hardware, and framework support">
      {entries.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-1 divide-y divide-[var(--m-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
            {entries.map(([key, value]) => {
              const supported = value === true || (typeof value === 'string' && value.toLowerCase() !== 'no' && value.toLowerCase() !== 'false');
              return (
                <div key={key} className="flex items-center justify-between gap-2 p-4">
                  <span className="text-sm text-[var(--m-text)]">{formatKey(key)}</span>
                  {typeof value === 'boolean' ? (
                    supported ? (
                      <FaCheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    ) : (
                      <FaTimesCircle className="h-4 w-4 flex-shrink-0 text-[var(--m-text-muted)]" />
                    )
                  ) : (
                    <span className="flex-shrink-0 text-sm font-medium text-[var(--m-text)]">{String(value)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <FaPlug className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">Compatibility information is not available for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default CompatibilitySection;
