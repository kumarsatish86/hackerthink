'use client';

import { useMemo, useState } from 'react';
import { Button, Card, Badge } from './Button';
import { EmptyState } from './EmptyState';

export type PlaygroundModality = 'text' | 'image' | 'audio' | 'embedding';

export type PlaygroundProps = {
  modality: PlaygroundModality;
  modelName?: string;
  embedUrl?: string;
  demoLabel?: string;
  className?: string;
};

function cosineSimilarity(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Deterministic demo embedding from text (not a real model — labeled as demo). */
function demoEmbed(text: string, dims = 32): number[] {
  const out = new Array(dims).fill(0);
  for (let i = 0; i < text.length; i++) {
    out[i % dims] += (text.charCodeAt(i) % 97) / 97;
  }
  const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
  return out.map((v) => Number((v / norm).toFixed(6)));
}

export function Playground({ modality, modelName, embedUrl, demoLabel, className = '' }: PlaygroundProps) {
  const [textA, setTextA] = useState('semantic search query');
  const [textB, setTextB] = useState('document about vector retrieval');
  const [batch, setBatch] = useState(false);
  const [batchLines, setBatchLines] = useState('apple\norange\nbanana');

  const result = useMemo(() => {
    if (modality !== 'embedding') return null;
    if (batch) {
      const lines = batchLines.split('\n').map((l) => l.trim()).filter(Boolean);
      const vectors = lines.map((l) => ({ text: l, vector: demoEmbed(l) }));
      return { mode: 'batch' as const, vectors, similarity: null as number | null, dims: 32 };
    }
    const va = demoEmbed(textA);
    const vb = demoEmbed(textB);
    return {
      mode: 'pair' as const,
      vectors: [
        { text: textA, vector: va },
        { text: textB, vector: vb },
      ],
      similarity: cosineSimilarity(va, vb),
      dims: 32,
    };
  }, [modality, textA, textB, batch, batchLines]);

  if (embedUrl) {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <iframe title={demoLabel || 'Playground'} src={embedUrl} className="h-[480px] w-full border-0" />
      </Card>
    );
  }

  if (modality === 'embedding' && result) {
    const json = JSON.stringify(result, null, 2);
    return (
      <Card className={`space-y-4 p-4 ${className}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="warning">Demo embeddings</Badge>
          <span className="text-xs text-[var(--ht-text-muted)]">
            Client-side illustration for {modelName || 'this model'} — not hosted inference.
          </span>
        </div>
        <label className="flex items-center gap-2 text-xs text-[var(--ht-text)]">
          <input type="checkbox" checked={batch} onChange={(e) => setBatch(e.target.checked)} />
          Batch mode
        </label>
        {batch ? (
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-[var(--ht-border)] bg-[var(--ht-surface)] p-3 text-sm"
            value={batchLines}
            onChange={(e) => setBatchLines(e.target.value)}
            aria-label="Batch texts"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-[var(--ht-border)] bg-[var(--ht-surface)] p-3 text-sm"
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              aria-label="Text A"
            />
            <textarea
              className="min-h-[100px] w-full rounded-lg border border-[var(--ht-border)] bg-[var(--ht-surface)] p-3 text-sm"
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              aria-label="Text B"
            />
          </div>
        )}
        {result.similarity != null ? (
          <p className="text-sm font-semibold text-[var(--ht-text)]">
            Cosine similarity:{' '}
            <span className="tabular-nums text-[var(--ht-brand)]">{result.similarity.toFixed(4)}</span>
          </p>
        ) : null}
        <div className="overflow-x-auto">
          <div className="flex h-24 items-end gap-0.5" aria-label="Vector visualization">
            {(result.vectors[0]?.vector || []).slice(0, 32).map((v, i) => (
              <div
                key={i}
                className="w-2 rounded-t bg-[var(--ht-brand)]"
                style={{ height: `${Math.max(4, Math.abs(v) * 100)}%` }}
                title={`dim ${i}: ${v}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => navigator.clipboard.writeText(json)}
          >
            Copy JSON
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'embeddings.json';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download JSON
          </Button>
        </div>
        <pre className="max-h-48 overflow-auto rounded-lg bg-[var(--ht-surface-2)] p-3 text-[10px] text-[var(--ht-text-muted)]">
          {json}
        </pre>
      </Card>
    );
  }

  return (
    <EmptyState
      className={className}
      title="Try this model in the playground"
      body="Connect a demo URL or use modality tools when available. Embedding models get a cosine similarity lab automatically."
      actions={[{ id: 'hf', label: 'Open on Hugging Face', href: '#', variant: 'outline' }]}
    />
  );
}
