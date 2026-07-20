'use client';

import { FaRocket, FaExternalLinkAlt } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore, ModelUsageExample } from '@/types/models';

function buildQuickstartSnippets(model: ModelCore) {
  const id = model.external_model_id || model.slug;
  const framework = (model.framework || '').toLowerCase();
  const snippets: { label: string; language: string; code: string }[] = [];

  if (framework.includes('transformers') || !framework) {
    snippets.push({
      label: 'Python (Transformers)',
      language: 'python',
      code: `from transformers import AutoModel, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("${id}")
model = AutoModel.from_pretrained("${id}")

inputs = tokenizer("Hello from HackerThink!", return_tensors="pt")
outputs = model(**inputs)
print(outputs)`,
    });
  }

  if (model.api_endpoint) {
    snippets.push({
      label: 'cURL (API)',
      language: 'bash',
      code: `curl -X POST "${model.api_endpoint}" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Hello from HackerThink!"}'`,
    });
  }

  snippets.push({
    label: 'Python (pipeline)',
    language: 'python',
    code: `from transformers import pipeline

pipe = pipeline("${model.task || 'text-generation'}", model="${id}")
print(pipe("Hello from HackerThink!"))`,
  });

  return snippets;
}

export function UsageSection({
  model,
  examples = [],
}: {
  model: ModelCore;
  examples?: ModelUsageExample[];
}) {
  const generated = buildQuickstartSnippets(model);
  const fromDb = examples.map((ex) => ({
    label: ex.title || ex.language,
    language: ex.language || 'python',
    code: ex.code,
  }));
  const snippets = fromDb.length > 0 ? fromDb : generated;

  return (
    <DetailSection id="usage" title="Usage" description="Quick start guide for loading and running this model">
      <Card className="mb-4 p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--m-brand)]">
          <FaRocket /> Quick Start
        </h3>
        <p className="text-sm text-[var(--m-text-muted)]">
          {model.task ? `Optimized for ${model.task}. ` : ''}
          Below are ready-to-run snippets to get {model.name} up and running quickly.
        </p>
      </Card>

      <CodeBlock
        code={snippets[0]?.code || ''}
        language={snippets[0]?.language}
        title={snippets[0]?.label}
        versions={snippets.length > 1 ? snippets : undefined}
      />

      {(model.documentation_url || model.api_endpoint) && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {model.documentation_url && (
            <a
              href={model.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--m-brand)] hover:underline"
            >
              <FaExternalLinkAlt className="h-3 w-3" /> Full Documentation
            </a>
          )}
          {model.api_endpoint && (
            <a
              href={model.api_endpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--m-brand)] hover:underline"
            >
              <FaExternalLinkAlt className="h-3 w-3" /> API Reference
            </a>
          )}
        </div>
      )}
    </DetailSection>
  );
}

export default UsageSection;
