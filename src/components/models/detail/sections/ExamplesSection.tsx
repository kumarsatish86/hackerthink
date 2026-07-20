'use client';

import { FaFileCode } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelUsageExample } from '@/types/models';

export function ExamplesSection({ examples }: { examples: ModelUsageExample[] }) {
  return (
    <DetailSection id="examples" title="Examples" description="Practical code examples for common tasks">
      {examples.length > 0 ? (
        <div className="space-y-5">
          {examples.map((example) => (
            <Card key={example.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[var(--m-text)]">{example.title}</h3>
                <Badge>{example.language}</Badge>
                {example.runtime && <Badge tone="brand">{example.runtime}</Badge>}
              </div>
              {example.description && <p className="mb-3 text-sm text-[var(--m-text-muted)]">{example.description}</p>}
              <CodeBlock code={example.code} language={example.language} title={example.title} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaFileCode className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">No curated examples are available for this model yet.</p>
        </Card>
      )}
    </DetailSection>
  );
}

export default ExamplesSection;
