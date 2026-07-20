'use client';

import { useMemo, useState } from 'react';
import { FaTerminal, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button, Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import type { ModelCore } from '@/types/models';

type SnippetKey =
  | 'curl'
  | 'python'
  | 'js'
  | 'go'
  | 'rust'
  | 'java'
  | 'csharp'
  | 'php'
  | 'cli'
  | 'sdk'
  | 'docker'
  | 'gh-actions';

const TABS: { key: SnippetKey; label: string; language: string }[] = [
  { key: 'curl', label: 'cURL', language: 'bash' },
  { key: 'python', label: 'Python', language: 'python' },
  { key: 'js', label: 'JavaScript', language: 'javascript' },
  { key: 'go', label: 'Go', language: 'go' },
  { key: 'rust', label: 'Rust', language: 'rust' },
  { key: 'java', label: 'Java', language: 'java' },
  { key: 'csharp', label: 'C#', language: 'csharp' },
  { key: 'php', label: 'PHP', language: 'php' },
  { key: 'cli', label: 'CLI', language: 'bash' },
  { key: 'sdk', label: 'SDK', language: 'python' },
  { key: 'docker', label: 'Docker Compose', language: 'yaml' },
  { key: 'gh-actions', label: 'GitHub Actions', language: 'yaml' },
];

function buildSnippets(model: ModelCore): Record<SnippetKey, string> {
  const id = model.external_model_id || model.slug;
  const apiUrl = model.api_endpoint || `https://api.hackerthink.com/v1/models/${model.slug}/infer`;
  const fw = model.framework || 'transformers';

  return {
    curl: `curl -X POST "${apiUrl}" \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"input": "Hello from HackerThink!", "model": "${id}"}'`,
    python: `import requests\n\nresponse = requests.post(\n    "${apiUrl}",\n    headers={"Authorization": "Bearer YOUR_API_KEY"},\n    json={"input": "Hello from HackerThink!", "model": "${id}"},\n)\nprint(response.json())`,
    js: `const response = await fetch("${apiUrl}", {\n  method: "POST",\n  headers: {\n    Authorization: "Bearer YOUR_API_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ input: "Hello from HackerThink!", model: "${id}" }),\n});\nconsole.log(await response.json());`,
    go: `package main\n\nimport (\n  "bytes"\n  "net/http"\n)\n\nfunc main() {\n  body := []byte(\`{"input":"Hello","model":"${id}"}\`)\n  req, _ := http.NewRequest("POST", "${apiUrl}", bytes.NewBuffer(body))\n  req.Header.Set("Authorization", "Bearer YOUR_API_KEY")\n  req.Header.Set("Content-Type", "application/json")\n  http.DefaultClient.Do(req)\n}`,
    rust: `// reqwest example\nlet client = reqwest::Client::new();\nlet res = client.post("${apiUrl}")\n  .bearer_auth("YOUR_API_KEY")\n  .json(&serde_json::json!({"input":"Hello","model":"${id}"}))\n  .send()\n  .await?;`,
    java: `HttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n  .uri(URI.create("${apiUrl}"))\n  .header("Authorization", "Bearer YOUR_API_KEY")\n  .header("Content-Type", "application/json")\n  .POST(HttpRequest.BodyPublishers.ofString("{\\\"input\\\":\\\"Hello\\\",\\\"model\\\":\\\"${id}\\\"}"))\n  .build();\nclient.send(request, HttpResponse.BodyHandlers.ofString());`,
    csharp: `using var client = new HttpClient();\nclient.DefaultRequestHeaders.Authorization =\n  new AuthenticationHeaderValue("Bearer", "YOUR_API_KEY");\nvar content = new StringContent("{\\\"input\\\":\\\"Hello\\\",\\\"model\\\":\\\"${id}\\\"}", Encoding.UTF8, "application/json");\nvar response = await client.PostAsync("${apiUrl}", content);`,
    php: `<?php\n$ch = curl_init("${apiUrl}");\ncurl_setopt_array($ch, [\n  CURLOPT_POST => true,\n  CURLOPT_HTTPHEADER => ["Authorization: Bearer YOUR_API_KEY", "Content-Type: application/json"],\n  CURLOPT_POSTFIELDS => json_encode(["input" => "Hello", "model" => "${id}"]),\n  CURLOPT_RETURNTRANSFER => true,\n]);\necho curl_exec($ch);`,
    cli: `ht models infer ${model.slug} --input "Hello from HackerThink!" --model-id "${id}"`,
    sdk: `# pip install hackerthink-sdk\nfrom hackerthink import Client\n\nclient = Client(api_key="YOUR_API_KEY")\nresult = client.models.infer(\n    model="${id}",\n    input="Hello from HackerThink!",\n    framework="${fw}",\n)\nprint(result)`,
    docker: `version: "3.9"\nservices:\n  ${(model.slug || 'model').replace(/[^a-z0-9-]/gi, '-')}:\n    image: ghcr.io/hackerthink/model-runner:latest\n    environment:\n      - MODEL_ID=${id}\n      - API_KEY=\${API_KEY}\n    ports:\n      - "8080:8080"`,
    'gh-actions': `name: Run ${model.name}\non: [workflow_dispatch]\njobs:\n  infer:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Call ${model.name} API\n        run: |\n          curl -X POST "${apiUrl}" \\\n            -H "Authorization: Bearer \${{ secrets.API_KEY }}" \\\n            -H "Content-Type: application/json" \\\n            -d '{"input": "Hello from HackerThink!", "model": "${id}"}'`,
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
        aria-expanded={open}
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
          <CodeBlock code={snippets[tab]} language={activeTab.language} title={activeTab.label} model={model} />
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const id = model.external_model_id || model.slug;
                const apiUrl = model.api_endpoint || `https://api.hackerthink.com/v1/models/${model.slug}/infer`;
                const collection = {
                  info: {
                    name: `${model.name} API`,
                    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
                  },
                  item: [
                    {
                      name: 'Infer',
                      request: {
                        method: 'POST',
                        header: [
                          { key: 'Authorization', value: 'Bearer {{API_KEY}}' },
                          { key: 'Content-Type', value: 'application/json' },
                        ],
                        url: apiUrl,
                        body: {
                          mode: 'raw',
                          raw: JSON.stringify({ input: 'Hello from HackerThink!', model: id }, null, 2),
                        },
                      },
                    },
                  ],
                };
                const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${model.slug}-postman.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download Postman Collection
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default DevToolsPanel;
