'use client';

import { Card, Badge } from '@/components/ht-ui';
import type { DatasetSample } from '@/types/datasets';

export function SampleViewer({ sample }: { sample: DatasetSample }) {
  const modality = (sample.modality || 'text').toLowerCase();
  const meta = sample.metadata as Record<string, unknown> | null;
  const ann = sample.annotations;

  return (
    <Card className="p-4" aria-label="Sample viewer">
      <div className="mb-2 flex flex-wrap gap-2">
        <Badge tone="brand">{modality}</Badge>
        {sample.label ? <Badge>{sample.label}</Badge> : null}
      </div>

      {/image|vision/.test(modality) && sample.media_url ? (
        <div className="relative overflow-hidden rounded-lg border border-[var(--ht-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sample.media_url} alt={sample.label || 'sample'} className="max-h-96 w-full object-contain" />
          {ann ? (
            <pre className="absolute bottom-0 left-0 right-0 max-h-24 overflow-auto bg-black/70 p-2 text-[10px] text-white">
              {JSON.stringify(ann, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      {/audio/.test(modality) && sample.media_url ? (
        <div>
          <audio controls src={sample.media_url} className="w-full" />
          <div className="mt-2 flex h-16 items-end gap-0.5" aria-label="Waveform placeholder">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 rounded-t bg-[var(--ht-brand)]"
                style={{ height: `${20 + ((i * 17) % 60)}%` }}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/video/.test(modality) && sample.media_url ? (
        <video controls src={sample.media_url} className="max-h-96 w-full rounded-lg" />
      ) : null}

      {(sample.text_content || /text|ner|class|json|csv|parquet|tabular/.test(modality)) && (
        <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-[var(--ht-surface-2)] p-3 text-xs text-[var(--ht-text)]">
          {sample.text_content ||
            (typeof ann === 'object' ? JSON.stringify(ann, null, 2) : '') ||
            (meta ? JSON.stringify(meta, null, 2) : '—')}
        </pre>
      )}
    </Card>
  );
}

export default SampleViewer;
