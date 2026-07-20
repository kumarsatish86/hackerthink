'use client';

import { useMemo, useState } from 'react';
import { FaTerminal, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import type { ModelCore } from '@/types/models';

type SnippetKey = 'curl' | 'python' | 'js' | 'docker' | 'gh-actions';

const TABS: { key: SnippetKey; label: string; language: string }[] = [
  { key: 'curl', label: 'cURL', language: 'bash' },
  { key: 'python', label: 'Python', language: 'python' },
  { key: 'js', label: 'JavaScript', language: 'javascript' },
  { key: 'docker', label: 'Docker Compose', language: 'yaml' },
  { key: 'gh-actions', label: 'GitHub Actions', language: 'yaml' },
];

function buildSnippets(model: ModelCore): Record<SnippetKey, string> {
  const id = model.external_model_id || model.slug;
  const apiUrl = model.api_endpoint || `https://api.hackerthink.com/v1/models/${model.slug}/infer`;

  return {
    curl: `curl -X POST "${apiUrl}" \\
  -H "Authorization: Bearer $API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "Hello from HackerThink!"}'`,
    python: `import requests

response = requests.post(
    "${apiUrl}",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"input": "Hello from HackerThink!"},
)
print(response.json())`,
    js: `const response = await fetch("${apiUrl}", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ input: "Hello from HackerThink!" }),
});
console.log(await response.json());`,
    docker: `version: "3.9"
services:
  ${(model.slug || 'model').replace(/[^a-z0-9-]/gi, '-')}:
    image: ghcr.io/hackerthink/model-runner:latest
    environment:
      - MODEL_ID=${id}
      - API_KEY=\${API_KEY}
    ports:
      - "8080:8080"`,
    'gh-actions': `name: Run ${model.name}
on: [workflow_dispatch]
jobs:
  infer:
    runs-on: ubuntu-latest
    steps:
      - name: Call ${model.name} API
        run: |
          curl -X POST "${apiUrl}" \\
            -H "Authorization: Bearer \${{ secrets.API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{"input": "Hello from HackerThink!"}'`,
  };
}

export function DevToolsPanel({ model }: { model: ModelCore }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<SnippetKey>('curl');
  const snippets = useMemo(() => buildSnippets(model), [model]);
  const activeTab = TABS.find((t) => t.key === tab) || TABS[0];

  return (
    <Card className="overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
          <FaTerminal className="text-[var(--m-brand)]" /> Developer Tools — generate integration snippets
        </span>
        {open ? <FaChevronUp className="text-[var(--m-text-muted)]" /> : <FaChevronDown className="text-[var(--m-text-muted)]" />}
      </button>
      {open && (
        <div className="border-t border-[var(--m-border)] p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t.key
                    ? 'bg-[var(--m-brand)] text-white'
                    : 'bg-[var(--m-surface-2)] text-[var(--m-text-muted)] hover:text-[var(--m-text)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <CodeBlock code={snippets[tab]} language={activeTab.language} title={activeTab.label} />
        </div>
      )}
    </Card>
  );
}

export default DevToolsPanel;
