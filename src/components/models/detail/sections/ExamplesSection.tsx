'use client';

import { useMemo } from 'react';
import { Badge, Card, CodeViewer, TagPill } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore, ModelUsageExample } from '@/types/models';
import { generateTieredExamples } from '@/lib/models/generateTieredExamples';

export function ExamplesSection({
  examples,
  model,
}: {
  examples: ModelUsageExample[];
  model?: ModelCore;
}) {
  const generated = useMemo(() => (model && examples.length === 0 ? generateTieredExamples(model) : []), [model, examples.length]);

  const tiers = useMemo(() => {
    if (examples.length > 0) {
      return examples.map((example) => ({
        id: example.id,
        tier: example.runtime || 'Example',
        title: example.title,
        language: example.language,
        code: example.code,
        description: example.description,
      }));
    }
    return generated.map((g) => ({
      id: g.id,
      tier: g.tier,
      title: g.title,
      language: g.language,
      code: g.code,
      description: undefined as string | undefined,
    }));
  }, [examples, generated]);

  return (
    <DetailSection id="examples" title="Examples" description="Practical code examples by difficulty and language">
      {generated.length > 0 ? (
        <p className="mb-3 text-xs text-[var(--ht-text-muted)]">
          Generated starter packs for this model — download any block and adapt to your stack.
        </p>
      ) : null}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {Array.from(new Set(tiers.map((t) => t.tier))).map((tier) => (
          <TagPill key={tier} label={tier} tone="brand" />
        ))}
      </div>
      <div className="space-y-5">
        {tiers.map((example) => (
          <Card key={example.id} className="p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-[var(--ht-text)]">{example.title}</h3>
              <Badge>{example.language}</Badge>
              <Badge tone="brand">{example.tier}</Badge>
            </div>
            {example.description ? (
              <p className="mb-3 text-sm text-[var(--ht-text-muted)]">{example.description}</p>
            ) : null}
            <CodeViewer code={example.code} language={example.language} title={example.title} model={model} />
          </Card>
        ))}
      </div>
    </DetailSection>
  );
}

export default ExamplesSection;
