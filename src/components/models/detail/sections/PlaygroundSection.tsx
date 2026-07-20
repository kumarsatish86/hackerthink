'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlay, FaFlask, FaClock, FaBullseye, FaMemory, FaDownload, FaImage, FaMicrophone } from 'react-icons/fa';
import { Button, Card } from '@/components/models/ui/primitives';
import { Playground as HtPlayground } from '@/components/ht-ui';
import { ModelEmptyState } from '@/components/models/detail/ModelEmptyState';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore } from '@/types/models';

function isEmbeddingModel(model: ModelCore) {
  const h = `${model.playground_config?.modality || ''} ${model.task} ${model.model_type} ${model.name}`.toLowerCase();
  return /embed|sentence-similarity|feature-extraction|similarity/.test(h);
}

function detectModality(model: ModelCore): 'text' | 'image' | 'audio' {
  const cfg = (model.playground_config?.modality as string | undefined) || '';
  const h = `${cfg} ${model.task} ${model.model_type} ${model.name}`.toLowerCase();
  if (/image|vision|diffusion|ocr|clip/i.test(h)) return 'image';
  if (/audio|speech|asr|tts|whisper/i.test(h)) return 'audio';
  return 'text';
}

export function PlaygroundSection({ model }: { model: ModelCore }) {
  const config = model.playground_config || {};
  const embedUrl = (config.embed_url as string | undefined) || undefined;
  const demoUrl = (config.demo_url as string | undefined) || model.demo_url || undefined;
  const embeddingFlagship = isEmbeddingModel(model);
  const defaultModality = detectModality(model);

  const [modality, setModality] = useState<'text' | 'image' | 'audio'>(defaultModality);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    output?: unknown;
    latency_ms?: number;
    confidence?: number;
    memory?: unknown;
    inference_time_ms?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(() => {
    if (modality === 'image') return 'Describe the image task or paste an image URL…';
    if (modality === 'audio') return 'Describe the audio task or paste an audio URL…';
    return `Enter text input for ${model.name}…`;
  }, [modality, model.name]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Playground request failed');
    } finally {
      setBusy(false);
    }
  };

  const downloadOutput = () => {
    if (!result) return;
    const text = typeof result.output === 'string' ? result.output : JSON.stringify(result.output, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.slug}-playground-output.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (embedUrl) {
    return (
      <DetailSection id="playground" title="Playground" description="Try this model directly in your browser">
        <HtPlayground modality="text" embedUrl={embedUrl} modelName={model.name} demoLabel={`${model.name} playground`} />
      </DetailSection>
    );
  }

  if (embeddingFlagship) {
    return (
      <DetailSection
        id="playground"
        title="Embedding Playground"
        description="Cosine similarity lab with vector viz — demo embeddings (not hosted GPU inference)"
      >
        {demoUrl ? (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 inline-block text-sm text-[var(--ht-brand)] hover:underline"
          >
            Also available: external demo
          </a>
        ) : null}
        <HtPlayground modality="embedding" modelName={model.name} />
      </DetailSection>
    );
  }

  if (demoUrl) {
    return (
      <DetailSection id="playground" title="Playground" description="Try this model directly in your browser">
        <Card className="p-8 text-center">
          <FaFlask className="mx-auto mb-3 h-8 w-8 text-[var(--m-brand)]" />
          <p className="mb-4 text-sm text-[var(--m-text-muted)]">This model&apos;s demo runs on an external platform.</p>
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
          <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Input modality">
            {(
              [
                { id: 'text' as const, label: 'Text', icon: null },
                { id: 'image' as const, label: 'Image', icon: <FaImage /> },
                { id: 'audio' as const, label: 'Audio', icon: <FaMicrophone /> },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={modality === m.id}
                onClick={() => setModality(m.id)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium ${
                  modality === m.id
                    ? 'border-[var(--m-brand)] bg-[var(--m-brand-soft)] text-[var(--m-brand)]'
                    : 'border-[var(--m-border)] text-[var(--m-text-muted)]'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">
            Input ({modality})
          </label>
          {modality === 'image' || modality === 'audio' ? (
            <div className="mb-3 space-y-2">
              <input
                type="file"
                accept={modality === 'image' ? 'image/*' : 'audio/*'}
                aria-label={`Upload ${modality}`}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setInput(file.name);
                }}
                className="block w-full text-sm text-[var(--m-text-muted)]"
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm"
              />
            </div>
          ) : (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={4}
              placeholder={placeholder}
              className="mb-3 w-full rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm"
            />
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={runInference} disabled={busy}>
              <FaPlay className="h-3.5 w-3.5" /> {busy ? 'Running…' : 'Run'}
            </Button>
            {result && (
              <Button variant="outline" onClick={downloadOutput}>
                <FaDownload className="h-3.5 w-3.5" /> Download Output
              </Button>
            )}
          </div>

          {error && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
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
                {result.inference_time_ms != null && (
                  <span className="flex items-center gap-1.5">
                    <FaClock /> {result.inference_time_ms}ms inference
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
        <ModelEmptyState
          title="Playground coming online"
          body={`Configure a demo URL or API for ${model.name}, or explore Installation and Examples to run locally.`}
          actions={[
            { id: 'install', label: 'Go to Installation', href: '#installation', variant: 'outline' },
            { id: 'examples', label: 'View Examples', href: '#examples', variant: 'ghost' },
          ]}
        />
      )}
    </DetailSection>
  );
}

export default PlaygroundSection;
