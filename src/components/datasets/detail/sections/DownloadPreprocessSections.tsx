'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Card, CodeViewer, TagPill } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { DatasetCore, DatasetDownloadMirror, DatasetPreprocessingGuide } from '@/types/datasets';
import { estimateStorageRam } from '@/lib/datasets/estimateHardware';
import { generatePreprocessingSnippets } from '@/lib/datasets/generatePreprocessingSnippets';

function buildMirrors(dataset: DatasetCore, downloads: DatasetDownloadMirror[]): DatasetDownloadMirror[] {
  const base: DatasetDownloadMirror[] = [...downloads];
  const push = (label: string, url?: string | null, provider?: string) => {
    if (!url) return;
    if (base.some((b) => b.url === url)) return;
    base.push({ id: label, label, url, provider });
  };
  push('Official Download', dataset.download_url, 'official');
  push('Hugging Face', dataset.huggingface_url, 'huggingface');
  push('Kaggle', dataset.kaggle_url, 'kaggle');
  push('GitHub', dataset.github_url, 'github');
  return base;
}

export function DownloadSection({
  dataset,
  downloads,
}: {
  dataset: DatasetCore;
  downloads: DatasetDownloadMirror[];
}) {
  const mirrors = buildMirrors(dataset, downloads);
  const hw = estimateStorageRam(dataset);
  const id = dataset.external_dataset_id || dataset.slug;
  const apiSnippet = `curl -s "https://hackerthink.com/api/datasets/${dataset.slug}" | jq .dataset.name\n# HF: datasets.load_dataset("${id}")`;

  const postman = () => {
    const collection = {
      info: { name: `${dataset.name} Dataset API`, schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      item: [
        {
          name: 'Get dataset',
          request: { method: 'GET', url: `https://hackerthink.com/api/datasets/${dataset.slug}` },
        },
        {
          name: 'List samples',
          request: { method: 'GET', url: `https://hackerthink.com/api/datasets/${dataset.slug}/samples` },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.slug}-postman.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DetailSection id="download" title="Download Center" description="Official links, mirrors, checksums, and storage estimates">
      <div className="mb-4 flex flex-wrap gap-2 text-sm text-[var(--ht-text-muted)]">
        <span>Storage: {hw.storage}</span>
        <span>·</span>
        <span>RAM: {hw.ram}</span>
        {hw.estimated ? <Badge tone="warning">estimated</Badge> : null}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {mirrors.map((m) => (
          <Card key={m.id || m.url} className="flex items-center justify-between gap-3 p-3">
            <div>
              <div className="font-semibold text-[var(--ht-text)]">{m.label}</div>
              <div className="text-xs text-[var(--ht-text-muted)]">
                {m.provider || 'mirror'}
                {m.checksum ? ` · ${m.checksum}` : ''}
                {m.size_hint ? ` · ${m.size_hint}` : ''}
              </div>
            </div>
            <a href={m.url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">
                Open
              </Button>
            </a>
          </Card>
        ))}
      </div>
      {!mirrors.length ? (
        <p className="mt-3 text-sm text-[var(--ht-text-muted)]">
          Add download URLs in admin, or search the provider catalog for {dataset.name}.
        </p>
      ) : null}
      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-[var(--ht-text)]">Generate API</h3>
        <CodeViewer code={apiSnippet} language="bash" title="API / SDK" />
        <Button type="button" size="sm" variant="outline" onClick={postman}>
          Download Postman Collection
        </Button>
      </div>
    </DetailSection>
  );
}

export function PreprocessingSection({
  dataset,
  guides,
}: {
  dataset: DatasetCore;
  guides: DatasetPreprocessingGuide[];
}) {
  const items = guides.length ? guides : generatePreprocessingSnippets(dataset);
  const [active, setActive] = useState(items[0]?.id || '');
  const current = useMemo(() => items.find((i) => i.id === active) || items[0], [items, active]);

  return (
    <DetailSection id="preprocessing" title="Preprocessing" description="Ready-to-adapt loaders and cleaning pipelines">
      <div className="mb-3 flex flex-wrap gap-1.5">
        {items.map((g) => (
          <button key={g.id} type="button" onClick={() => setActive(g.id)}>
            <TagPill label={`${g.tier || g.framework || g.language}: ${g.title}`} tone={g.id === active ? 'brand' : 'neutral'} />
          </button>
        ))}
      </div>
      {current ? (
        <CodeViewer code={current.code} language={current.language} title={current.title} />
      ) : null}
    </DetailSection>
  );
}

export default DownloadSection;
