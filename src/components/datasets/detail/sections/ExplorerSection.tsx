'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, ErrorState } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import { DatasetEmptyState } from '../DatasetEmptyState';
import { DATASET_SECTION_COPY } from '@/lib/datasets/sectionCopy';
import type { DatasetCore, DatasetSample } from '@/types/datasets';
import { SampleViewer } from './SampleViewer';

type SamplesResponse = {
  source: 'database' | 'huggingface' | 'empty';
  samples: DatasetSample[];
  message?: string;
};

export function ExplorerSection({
  dataset,
  initialSamples = [],
}: {
  dataset: DatasetCore;
  initialSamples?: DatasetSample[];
}) {
  const [samples, setSamples] = useState<DatasetSample[]>(initialSamples);
  const [source, setSource] = useState<string>(initialSamples.length ? 'database' : 'loading');
  const [q, setQ] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DatasetSample | null>(initialSamples[0] || null);

  useEffect(() => {
    if (initialSamples.length) return;
    let alive = true;
    fetch(`/api/datasets/${dataset.slug}/samples`)
      .then((r) => r.json())
      .then((data: SamplesResponse) => {
        if (!alive) return;
        setSamples(data.samples || []);
        setSource(data.source);
        setSelected(data.samples?.[0] || null);
        if (data.message) setError(null);
      })
      .catch((e) => {
        if (alive) setError(e.message || 'Failed to load samples');
      });
    return () => {
      alive = false;
    };
  }, [dataset.slug, initialSamples.length]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return samples;
    return samples.filter(
      (s) =>
        (s.label || '').toLowerCase().includes(needle) ||
        (s.text_content || '').toLowerCase().includes(needle) ||
        (s.modality || '').toLowerCase().includes(needle)
    );
  }, [samples, q]);

  return (
    <DetailSection id="explorer" title="Interactive Data Explorer" description="Browse capped previews — no full corpus download required">
      {error ? <ErrorState message={error} className="mb-4" onRetry={() => window.location.reload()} /> : null}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone={source === 'database' ? 'success' : source === 'huggingface' ? 'info' : 'warning'}>
          Source: {source}
        </Badge>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search / filter preview…"
          className="min-w-[12rem] flex-1 rounded-md border border-[var(--ht-border)] bg-[var(--ht-surface)] px-3 py-2 text-sm"
          aria-label="Filter samples"
        />
      </div>
      {filtered.length === 0 ? (
        <DatasetEmptyState
          title={DATASET_SECTION_COPY.explorerEmptyTitle}
          body={DATASET_SECTION_COPY.explorerEmptyBody}
          actions={[
            { id: 'download', label: 'Go to Download', href: '#download', variant: 'outline' },
            { id: 'preprocess', label: 'Preprocessing', href: '#preprocessing', variant: 'ghost' },
          ]}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
          <Card className="max-h-[480px] overflow-y-auto p-2">
            <ul className="space-y-1">
              {filtered.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(s)}
                    className={`w-full rounded-md px-2 py-2 text-left text-xs ${
                      selected?.id === s.id
                        ? 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]'
                        : 'hover:bg-[var(--ht-surface-2)]'
                    }`}
                  >
                    <div className="font-medium">{s.label || s.modality || 'Sample'}</div>
                    <div className="truncate text-[var(--ht-text-muted)]">{s.text_content?.slice(0, 60) || s.media_url || s.id}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <div>{selected ? <SampleViewer sample={selected} /> : null}</div>
        </div>
      )}
    </DetailSection>
  );
}

export function SamplesSection({ samples, dataset }: { samples: DatasetSample[]; dataset: DatasetCore }) {
  return (
    <DetailSection id="samples" title="Sample Preview" description="Multimodal sample viewer">
      {samples.length ? (
        <div className="space-y-4">
          {samples.slice(0, 6).map((s) => (
            <SampleViewer key={s.id} sample={s} />
          ))}
        </div>
      ) : (
        <ExplorerSection dataset={dataset} initialSamples={[]} />
      )}
    </DetailSection>
  );
}

export default ExplorerSection;
