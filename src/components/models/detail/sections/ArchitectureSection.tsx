'use client';

import { FaProjectDiagram, FaArrowDown } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelArchitectureNode, ModelCore } from '@/types/models';

export function ArchitectureSection({
  model,
  nodes,
}: {
  model: ModelCore;
  nodes: ModelArchitectureNode[];
}) {
  const sorted = [...nodes].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return (
    <DetailSection id="architecture" title="Architecture" description="How the model is structured, layer by layer">
      {sorted.length > 0 ? (
        <div className="flex flex-col items-stretch">
          {sorted.map((node, idx) => (
            <div key={node.id} className="flex flex-col items-center">
              <Card className="w-full max-w-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--m-brand-soft)] text-[var(--m-brand)]">
                    <FaProjectDiagram className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--m-text)]">{node.title}</p>
                    <p className="text-xs uppercase tracking-wide text-[var(--m-text-muted)]">{node.node_key}</p>
                  </div>
                </div>
                {node.explanation && <p className="mt-2 text-sm text-[var(--m-text-muted)]">{node.explanation}</p>}
              </Card>
              {idx < sorted.length - 1 && <FaArrowDown className="my-2 h-4 w-4 text-[var(--m-text-muted)]" />}
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaProjectDiagram className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">
            {model.architecture
              ? `Detailed architecture breakdown is not available yet. This model uses a ${model.architecture} architecture.`
              : 'Architecture details are not available for this model yet.'}
          </p>
        </Card>
      )}
    </DetailSection>
  );
}

export default ArchitectureSection;
