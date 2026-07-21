'use client';

import { Card, CodeViewer, ComparisonTable, FAQAccordion, RelatedResources, Timeline, CommunitySectionUI, Callout, Badge } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import { DatasetEmptyState } from '../DatasetEmptyState';
import type {
  DatasetAnnotationDoc,
  DatasetBenchmark,
  DatasetChangelogEntry,
  DatasetCommunityLink,
  DatasetComparisonPeer,
  DatasetCore,
  DatasetFaq,
  DatasetFileNode,
  DatasetModelLink,
  DatasetPaper,
  DatasetRelatedItem,
  DatasetSecurityNote,
  DatasetTutorial,
  DatasetVersion,
} from '@/types/datasets';
import { generatePeopleAlsoAsk } from '@/lib/datasets/generatePeopleAlsoAsk';
import Link from 'next/link';

const DEFAULT_TREE: DatasetFileNode[] = [
  { id: '1', path: 'data/', node_type: 'folder' },
  { id: '2', path: 'data/train/', node_type: 'folder' },
  { id: '3', path: 'data/train/samples.parquet', node_type: 'file', format: 'parquet' },
  { id: '4', path: 'data/validation/', node_type: 'folder' },
  { id: '5', path: 'README.md', node_type: 'file', format: 'markdown' },
  { id: '6', path: 'dataset_infos.json', node_type: 'file', format: 'json' },
];

export function StructureSection({ dataset, files }: { dataset: DatasetCore; files: DatasetFileNode[] }) {
  const tree = files.length ? files : DEFAULT_TREE;
  const schema = dataset.schema_json ? JSON.stringify(dataset.schema_json, null, 2) : `{
  "format": "${dataset.format || 'unknown'}",
  "features": ${JSON.stringify(dataset.features || [], null, 2)}
}`;

  return (
    <DetailSection id="structure" title="Dataset Structure" description="Folders, files, and schemas">
      {!files.length ? (
        <Callout variant="info" title="Generated tree" body="File inventory not stored yet — showing a typical layout. Upload dataset_files in admin for accuracy." className="mb-4" />
      ) : null}
      <Card className="mb-4 p-3 font-mono text-xs">
        <ul className="space-y-1">
          {tree.map((f) => (
            <li key={f.id} className="flex gap-2 text-[var(--ht-text)]">
              <span>{f.node_type === 'folder' ? '📁' : '📄'}</span>
              <span>{f.path}</span>
              {f.format ? <Badge tone="neutral">{f.format}</Badge> : null}
            </li>
          ))}
        </ul>
      </Card>
      <CodeViewer code={schema} language="json" title="Schema (JSON)" />
    </DetailSection>
  );
}

export function AnnotationsSection({ annotations }: { annotations: DatasetAnnotationDoc[] }) {
  const defaults: DatasetAnnotationDoc[] = annotations.length
    ? annotations
    : [
        { id: 'coco', format_name: 'COCO', description: 'Bounding boxes / segmentation JSON.' },
        { id: 'yolo', format_name: 'YOLO', description: 'Normalized class + bbox per line.' },
        { id: 'voc', format_name: 'Pascal VOC', description: 'XML annotations per image.' },
      ];
  return (
    <DetailSection id="annotations" title="Annotations" description="Formats and visualization configs">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {defaults.map((a) => (
          <Card key={a.id} className="p-3">
            <h3 className="font-semibold text-[var(--ht-text)]">{a.format_name}</h3>
            <p className="mt-1 text-sm text-[var(--ht-text-muted)]">{a.description}</p>
            {a.example_json ? (
              <pre className="mt-2 max-h-32 overflow-auto text-[10px]">{JSON.stringify(a.example_json, null, 2)}</pre>
            ) : null}
          </Card>
        ))}
      </div>
    </DetailSection>
  );
}

export function BenchmarksSection({ benchmarks, dataset }: { benchmarks: DatasetBenchmark[]; dataset: DatasetCore }) {
  const items =
    benchmarks.length > 0
      ? benchmarks
      : [
          { id: 'est-acc', benchmark_name: 'Task quality (est.)', score: 70, metric: 'score', source: 'estimated' },
          { id: 'est-f1', benchmark_name: 'F1 proxy (est.)', score: 68, metric: 'f1', source: 'estimated' },
        ];
  return (
    <DetailSection id="benchmarks" title="Benchmarks" description="Official and estimated evaluation signals">
      <ComparisonTable
        columns={[
          { id: 'name', label: 'Benchmark' },
          { id: 'score', label: 'Score' },
          { id: 'metric', label: 'Metric' },
          { id: 'source', label: 'Source' },
        ]}
        rows={items.map((b) => ({
          id: b.id,
          cells: {
            name: b.benchmark_name,
            score: b.score ?? '—',
            metric: b.metric || '—',
            source: b.source || 'official',
          },
        }))}
      />
      <p className="mt-2 text-xs text-[var(--ht-text-muted)]">Dataset: {dataset.name}</p>
    </DetailSection>
  );
}

export function ModelsUsingSection({ models }: { models: DatasetModelLink[] }) {
  return (
    <DetailSection id="models" title="Models Using This Dataset" description="Foundation and fine-tuned models linked on HackerThink">
      {models.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((m) => (
            <Link key={m.id} href={`/models/${m.slug}`}>
              <Card className="p-3 transition hover:border-[var(--ht-brand)]">
                <div className="font-semibold text-[var(--ht-text)]">{m.name}</div>
                <div className="text-xs text-[var(--ht-text-muted)]">
                  {[m.developer, m.model_type, m.parameters].filter(Boolean).join(' · ')}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <DatasetEmptyState
          title="Connect models to this dataset"
          body="When training_data or related_dataset_slug links exist, models appear here automatically."
          actions={[{ id: 'models', label: 'Browse models', href: '/models', variant: 'outline' }]}
        />
      )}
    </DetailSection>
  );
}

export function PapersSection({ papers, dataset }: { papers: DatasetPaper[]; dataset: DatasetCore }) {
  const list =
    papers.length > 0
      ? papers
      : dataset.paper_url
        ? [{ id: 'paper', title: `${dataset.name} paper`, url: dataset.paper_url, bibtex: `@misc{${dataset.slug},\n  title={${dataset.name}},\n  url={${dataset.paper_url}}\n}` }]
        : [];
  return (
    <DetailSection id="papers" title="Related Papers" description="Original and follow-up research">
      {list.length ? (
        <ul className="space-y-3">
          {list.map((p) => (
            <Card key={p.id} className="p-3">
              <a href={p.url || '#'} className="font-semibold text-[var(--ht-brand)] hover:underline" target="_blank" rel="noopener noreferrer">
                {p.title}
              </a>
              {p.authors ? <p className="text-xs text-[var(--ht-text-muted)]">{p.authors}</p> : null}
              {p.bibtex ? <pre className="mt-2 overflow-auto text-[10px]">{p.bibtex}</pre> : null}
            </Card>
          ))}
        </ul>
      ) : (
        <DatasetEmptyState title="Papers coming soon" body="Add paper URLs in admin or cite the documentation link." />
      )}
    </DetailSection>
  );
}

export function TutorialsSection({ tutorials, dataset }: { tutorials: DatasetTutorial[]; dataset: DatasetCore }) {
  const generated: DatasetTutorial[] = [
    { id: 'b', title: `Beginner: Load ${dataset.name}`, tier: 'Beginner', description: 'Use Preprocessing Quick Start.', url: '#preprocessing' },
    { id: 'i', title: 'Intermediate: Train/val split', tier: 'Intermediate', url: '#preprocessing' },
    { id: 'a', title: 'Advanced: Augmentation + eval', tier: 'Advanced', url: '#preprocessing' },
  ];
  const list = tutorials.length ? tutorials : generated;
  return (
    <DetailSection id="tutorials" title="Tutorials" description="Beginner to deployment paths">
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((t) => (
          <Card key={t.id} className="p-3">
            <Badge tone="brand">{t.tier || 'Guide'}</Badge>
            <h3 className="mt-2 font-semibold text-[var(--ht-text)]">{t.title}</h3>
            {t.description ? <p className="text-sm text-[var(--ht-text-muted)]">{t.description}</p> : null}
            {t.url ? (
              <a href={t.url} className="mt-2 inline-block text-sm text-[var(--ht-brand)] hover:underline">
                Open
              </a>
            ) : null}
          </Card>
        ))}
      </div>
    </DetailSection>
  );
}

export function ComparisonSection({ dataset, peers }: { dataset: DatasetCore; peers: DatasetComparisonPeer[] }) {
  const rows = [
    {
      id: 'self',
      href: `/datasets/${dataset.slug}`,
      cells: {
        name: dataset.name,
        samples: dataset.rows ?? '—',
        license: dataset.license || '—',
        quality: dataset.quality_score ?? '—',
        format: dataset.format || '—',
      },
    },
    ...peers.map((p) => ({
      id: p.id,
      href: p.peer_slug ? `/datasets/${p.peer_slug}` : undefined,
      cells: {
        name: p.name || 'Peer',
        samples: p.samples || '—',
        license: p.license || '—',
        quality: '—',
        format: '—',
      },
    })),
  ];
  return (
    <DetailSection id="comparison" title="Comparison" description="Side-by-side peers">
      <ComparisonTable
        columns={[
          { id: 'name', label: 'Dataset' },
          { id: 'samples', label: 'Samples' },
          { id: 'license', label: 'License' },
          { id: 'quality', label: 'Quality' },
          { id: 'format', label: 'Format' },
        ]}
        rows={rows}
      />
      <Link href={`/datasets/compare?datasets=${dataset.slug}`} className="mt-3 inline-block text-sm text-[var(--ht-brand)] hover:underline">
        Open full compare
      </Link>
    </DetailSection>
  );
}

export function SecuritySection({ notes, dataset }: { notes: DatasetSecurityNote[]; dataset: DatasetCore }) {
  const fallback: DatasetSecurityNote[] = notes.length
    ? notes
    : [
        { id: 'bias', title: 'Bias & fairness', body: 'Run demographic and label audits before high-stakes use.', severity: 'medium' },
        { id: 'pii', title: 'PII / privacy', body: dataset.ethical_considerations || 'Scan for PII before redistribution; respect GDPR/HIPAA where applicable.', severity: 'high' },
        { id: 'license', title: 'License restrictions', body: `Review ${dataset.license || 'license'} for commercial and derivative constraints.`, severity: 'medium' },
      ];
  return (
    <DetailSection id="security" title="Security & Ethics" description="Bias, privacy, and responsible AI notes">
      <div className="space-y-3">
        {fallback.map((n) => (
          <Callout key={n.id} variant={n.severity === 'high' ? 'warning' : 'info'} title={n.title} body={n.body} />
        ))}
      </div>
    </DetailSection>
  );
}

export function FaqSection({ faqs, dataset }: { faqs: DatasetFaq[]; dataset: DatasetCore }) {
  const items = (faqs.length ? faqs : generatePeopleAlsoAsk(dataset)).map((f) => ({
    id: f.id,
    q: f.question,
    a: f.answer,
  }));
  return (
    <DetailSection id="faq" title="FAQ" description={faqs.length ? 'Frequently asked questions' : 'People also ask'}>
      <FAQAccordion items={items} />
    </DetailSection>
  );
}

export function CommunitySection({ links, dataset }: { links: DatasetCommunityLink[]; dataset: DatasetCore }) {
  const blocks = [
    {
      id: 'links',
      label: 'Links',
      items: links.length
        ? links.map((l) => ({ id: l.id, title: l.title, href: l.url }))
        : [{ id: 'discuss', title: `Discuss ${dataset.name}`, body: 'Share training tips and known issues below after signing in.' }],
    },
    {
      id: 'tips',
      label: 'Training Tips',
      items: [
        { id: 't1', title: 'Start with a stratified subset', body: 'Validate pipelines before full download.' },
        { id: 't2', title: 'Log license + revision digests', body: 'Pin versions for reproducibility.' },
      ],
    },
    {
      id: 'issues',
      label: 'Known Issues',
      items: [{ id: 'i1', title: 'Label noise', body: 'Expect noisy labels on web-scale corpora — clean iteratively.' }],
    },
  ];
  return (
    <DetailSection id="community" title="Community" description="Discussions, tips, and corrections">
      <CommunitySectionUI blocks={blocks} />
    </DetailSection>
  );
}

export function RelatedSection({ related }: { related: DatasetRelatedItem[] }) {
  const groupsMap = new Map<string, DatasetRelatedItem[]>();
  for (const r of related) {
    const arr = groupsMap.get(r.type) || [];
    arr.push(r);
    groupsMap.set(r.type, arr);
  }
  const groups = Array.from(groupsMap.entries()).map(([type, items]) => ({
    id: type,
    label: `Related ${type}s`,
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      href: i.url || (i.slug ? `/${i.type === 'model' ? 'models' : 'datasets'}/${i.slug}` : '#'),
      description: i.description || undefined,
    })),
  }));
  if (!groups.length) return null;
  return (
    <DetailSection id="related" title="Related Resources" description="Datasets, models, and more">
      <RelatedResources groups={groups} />
    </DetailSection>
  );
}

export function ChangelogSection({
  changelog,
  versions,
}: {
  changelog: DatasetChangelogEntry[];
  versions: DatasetVersion[];
}) {
  const events =
    changelog.length > 0
      ? changelog.map((c) => ({
          id: c.id,
          date: c.changed_at || undefined,
          title: c.title || c.version || 'Update',
          body: c.body || undefined,
        }))
      : versions.map((v) => ({
          id: v.id,
          date: v.release_date || undefined,
          title: `Version ${v.version}`,
          body: v.changelog || undefined,
        }));
  if (!events.length) return null;
  return (
    <DetailSection id="changelog" title="Version History" description="Releases and changelog">
      <Timeline events={events} />
    </DetailSection>
  );
}
