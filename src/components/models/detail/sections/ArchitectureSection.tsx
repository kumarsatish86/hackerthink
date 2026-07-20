'use client';

import { useMemo } from 'react';
import { ArchitectureDiagram, Callout } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelArchitectureNode, ModelCore } from '@/types/models';

const DEFAULT_PIPELINE = [
  { key: 'input', title: 'Input', explanation: 'Raw text, image, or audio enters the pipeline.' },
  { key: 'tokenizer', title: 'Tokenizer', explanation: 'Converts input into model-ready tokens or features.' },
  { key: 'embedding', title: 'Embedding', explanation: 'Maps tokens into dense vector representations.' },
  { key: 'encoder', title: 'Encoder', explanation: 'Builds contextual representations.' },
  { key: 'attention', title: 'Attention', explanation: 'Weights relationships across the sequence.' },
  { key: 'pooling', title: 'Pooling', explanation: 'Aggregates token states into a fixed representation when needed.' },
  { key: 'output', title: 'Output', explanation: 'Final logits, embeddings, or generated tokens.' },
];

export function ArchitectureSection({
  model,
  nodes,
}: {
  model: ModelCore;
  nodes: ModelArchitectureNode[];
}) {
  const diagramNodes = useMemo(() => {
    if (nodes.length > 0) {
      return [...nodes]
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((n) => ({
          key: n.node_key || n.id,
          title: n.title,
          explanation:
            n.explanation ||
            (model.architecture
              ? `Part of the ${model.architecture} stack used by ${model.name}.`
              : undefined),
        }));
    }
    return DEFAULT_PIPELINE;
  }, [nodes, model.architecture, model.name]);

  return (
    <DetailSection id="architecture" title="Architecture" description="Interactive pipeline — hover or select a block">
      {model.architecture ? (
        <Callout
          variant="info"
          title={model.architecture}
          body={`High-level stack for ${model.name}. Select nodes for stage-level detail.`}
          className="mb-4"
        />
      ) : null}
      <ArchitectureDiagram nodes={diagramNodes} />
    </DetailSection>
  );
}

export default ArchitectureSection;
