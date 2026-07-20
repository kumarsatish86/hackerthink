'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlay, FaFlask, FaClock, FaBullseye, FaMemory } from 'react-icons/fa';
import { Button, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore } from '@/types/models';

export function PlaygroundSection({ model }: { model: ModelCore }) {
  const config = model.playground_config || {};
  const embedUrl = (config.embed_url as string | undefined) || undefined;
  const demoUrl = (config.demo_url as string | undefined) || model.demo_url || undefined;
  const modality = (config.modality as string | undefined) || 'text';

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ output?: any; latency_ms?: number; confidence?: number; memory?: any } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runInference = async () => {
    if (!input.trim()) {
      toast.error('Enter some input first');
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/models/${model.slug}/playground`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, modality }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Playground request failed');
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Playground request failed');
    } finally {
      setBusy(false);
    }
  };

  if (embedUrl) {
    return (
      <DetailSection id="playground" title="Playground" description="Try this model directly in your browser">
        <Card className="overflow-hidden p-0">
          <iframe
            src={embedUrl}
            title={`${model.name} playground`}
            className="h-[600px] w-full border-0"
            allow="clipboard-write; microphone; camera"
            loading="lazy"
          />
        </Card>
      </DetailSection>
    );
  }

  if (demoUrl) {
    return (
      <DetailSection id="playground" title="Playground" description="Try this model directly in your browser">
        <Card className="p-8 text-center">
          <FaFlask className="mx-auto mb-3 h-8 w-8 text-[var(--m-brand)]" />
          <p className="mb-4 text-sm text-[var(--m-text-muted)]">
            This model's demo runs on an external platform.
          </p>
          <a href={demoUrl} target="_blank" rel="noopener noreferrer">
            <Button>
              <FaPlay className="h-3.5 w-3.5" /> Launch Demo
            </Button>
          </a>
        </Card>
      </DetailSection>
    );
  }

  return (
    <DetailSection id="playground" title="Playground" description="Try this model directly in your browser">
      {config.api_url ? (
        <Card className="p-5">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">
            Input ({modality})
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder={`Enter ${modality} input for ${model.name}...`}
            className="mb-3 w-full rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm"
          />
          <Button onClick={runInference} disabled={busy}>
            <FaPlay className="h-3.5 w-3.5" /> {busy ? 'Running…' : 'Run'}
          </Button>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
          )}

          {result && (
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-[var(--m-border)] bg-[var(--m-surface-2)] p-3">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">Output</p>
                <pre className="overflow-x-auto whitespace-pre-wrap text-sm text-[var(--m-text)]">
                  {typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2)}
                </pre>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[var(--m-text-muted)]">
                {result.latency_ms != null && (
                  <span className="flex items-center gap-1.5">
                    <FaClock /> {result.latency_ms}ms latency
                  </span>
                )}
                {result.confidence != null && (
                  <span className="flex items-center gap-1.5">
                    <FaBullseye /> {(Number(result.confidence) * 100).toFixed(1)}% confidence
                  </span>
                )}
                {result.memory != null && (
                  <span className="flex items-center gap-1.5">
                    <FaMemory /> {String(result.memory)}
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <FaFlask className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">
            No interactive playground is configured for this model yet.
          </p>
        </Card>
      )}
    </DetailSection>
  );
}

export default PlaygroundSection;
