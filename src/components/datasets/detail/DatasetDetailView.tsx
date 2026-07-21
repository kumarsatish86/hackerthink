'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import type { DatasetDetailPayload } from '@/types/datasets';
import { QuickStats } from '@/components/ht-ui';
import { DecisionCard, DeveloperScore } from '@/components/ht-ui';
import { DatasetBreadcrumb } from './DatasetBreadcrumb';
import { DatasetHero } from './DatasetHero';
import { DatasetHeroActions } from './DatasetHeroActions';
import { StickyTOC } from '@/components/ht-ui';
import { DatasetDetailSkeleton, SectionFallback } from './DatasetDetailSkeleton';
import { buildQuickStats } from '@/lib/datasets/buildQuickStats';
import { deriveDecisionAssistant } from '@/lib/datasets/deriveDecisionAssistant';
import { deriveDeveloperScore } from '@/lib/datasets/deriveDeveloperScore';
import { OverviewSection } from './sections/OverviewSection';
import { DownloadSection, PreprocessingSection } from './sections/DownloadPreprocessSections';
import { QualitySection, StatisticsSection } from './sections/QualityStatisticsSections';
import {
  StructureSection,
  AnnotationsSection,
  BenchmarksSection,
  ModelsUsingSection,
  PapersSection,
  TutorialsSection,
  ComparisonSection,
  SecuritySection,
  FaqSection,
  CommunitySection,
  RelatedSection,
  ChangelogSection,
} from './sections/MoreSections';

import { DatasetMonetizationSlots } from './DatasetMonetizationSlots';
import { DatasetCollectionsMenu } from './DatasetCollectionsMenu';

const ExplorerSection = dynamic(
  () => import('./sections/ExplorerSection').then((m) => m.ExplorerSection),
  { loading: () => <SectionFallback label="Explorer" /> }
);
const SamplesSection = dynamic(
  () => import('./sections/ExplorerSection').then((m) => m.SamplesSection),
  { loading: () => <SectionFallback label="Samples" /> }
);
const DatasetAssistantDrawer = dynamic(
  () => import('./DatasetAssistantDrawer').then((m) => m.DatasetAssistantDrawer),
  { ssr: false }
);
const StickyCompareBar = dynamic(
  () => import('./StickyCompareBar').then((m) => m.StickyCompareBar),
  { ssr: false }
);

type SectionDef = {
  id: string;
  label: string;
  isEmpty: (d: DatasetDetailPayload) => boolean;
  render: (d: DatasetDetailPayload) => React.ReactNode;
};

function buildRegistry(): SectionDef[] {
  return [
    { id: 'overview', label: 'Overview', isEmpty: () => false, render: (d) => <OverviewSection dataset={d.dataset} /> },
    {
      id: 'explorer',
      label: 'Explorer',
      isEmpty: () => false,
      render: (d) => <ExplorerSection dataset={d.dataset} initialSamples={d.samples} />,
    },
    {
      id: 'samples',
      label: 'Samples',
      isEmpty: () => false,
      render: (d) => <SamplesSection samples={d.samples} dataset={d.dataset} />,
    },
    {
      id: 'statistics',
      label: 'Statistics',
      isEmpty: () => false,
      render: (d) => <StatisticsSection dataset={d.dataset} series={d.statistics} />,
    },
    {
      id: 'quality',
      label: 'Quality',
      isEmpty: () => false,
      render: (d) => <QualitySection dataset={d.dataset} metrics={d.quality_metrics} />,
    },
    {
      id: 'download',
      label: 'Download',
      isEmpty: () => false,
      render: (d) => <DownloadSection dataset={d.dataset} downloads={d.downloads} />,
    },
    {
      id: 'structure',
      label: 'Structure',
      isEmpty: () => false,
      render: (d) => <StructureSection dataset={d.dataset} files={d.files} />,
    },
    {
      id: 'preprocessing',
      label: 'Preprocessing',
      isEmpty: () => false,
      render: (d) => <PreprocessingSection dataset={d.dataset} guides={d.preprocessing} />,
    },
    {
      id: 'annotations',
      label: 'Annotations',
      isEmpty: () => false,
      render: (d) => <AnnotationsSection annotations={d.annotations} />,
    },
    {
      id: 'benchmarks',
      label: 'Benchmarks',
      isEmpty: () => false,
      render: (d) => <BenchmarksSection benchmarks={d.benchmarks} dataset={d.dataset} />,
    },
    {
      id: 'models',
      label: 'Models',
      isEmpty: () => false,
      render: (d) => <ModelsUsingSection models={d.models_using} />,
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      isEmpty: () => false,
      render: (d) => <TutorialsSection tutorials={d.tutorials} dataset={d.dataset} />,
    },
    {
      id: 'papers',
      label: 'Papers',
      isEmpty: (d) => d.papers.length === 0 && !d.dataset.paper_url,
      render: (d) => <PapersSection papers={d.papers} dataset={d.dataset} />,
    },
    {
      id: 'comparison',
      label: 'Comparison',
      isEmpty: () => false,
      render: (d) => <ComparisonSection dataset={d.dataset} peers={d.comparisons} />,
    },
    {
      id: 'security',
      label: 'Security',
      isEmpty: () => false,
      render: (d) => <SecuritySection notes={d.security_notes} dataset={d.dataset} />,
    },
    {
      id: 'faq',
      label: 'FAQ',
      isEmpty: () => false,
      render: (d) => <FaqSection faqs={d.faqs} dataset={d.dataset} />,
    },
    {
      id: 'community',
      label: 'Community',
      isEmpty: () => false,
      render: (d) => <CommunitySection links={d.community_links} dataset={d.dataset} />,
    },
    {
      id: 'related',
      label: 'Related',
      isEmpty: (d) => d.related.length === 0,
      render: (d) => <RelatedSection related={d.related} />,
    },
    {
      id: 'changelog',
      label: 'Changelog',
      isEmpty: (d) => d.changelog.length === 0 && d.versions.length === 0,
      render: (d) => <ChangelogSection changelog={d.changelog} versions={d.versions} />,
    },
  ];
}

const REGISTRY = buildRegistry();

export function DatasetDetailView({ initialData }: { initialData: DatasetDetailPayload }) {
  const { dataset } = initialData;

  const visible = useMemo(() => REGISTRY.filter((s) => !s.isEmpty(initialData)), [initialData]);
  const toc = useMemo(() => visible.map(({ id, label }) => ({ id, label })), [visible]);
  const quickStats = useMemo(() => buildQuickStats(dataset), [dataset]);
  const decision = useMemo(
    () => deriveDecisionAssistant(dataset, initialData.comparisons),
    [dataset, initialData.comparisons]
  );
  const score = useMemo(() => deriveDeveloperScore(dataset), [dataset]);

  const category =
    Array.isArray(dataset.categories) && typeof dataset.categories[0] === 'string'
      ? dataset.categories[0]
      : undefined;

  useEffect(() => {
    const target =
      new URL(window.location.href).searchParams.get('section') ||
      (window.location.hash ? window.location.hash.slice(1) : '');
    if (!target) return;
    const el = document.getElementById(target);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  if (!dataset?.slug) return <DatasetDetailSkeleton />;

  return (
    <div className="ht-scope models-scope min-h-screen">
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--ht-brand)] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to overview
      </a>
      <DatasetBreadcrumb name={dataset.name} category={category} />
      <DatasetHero dataset={dataset} />
      <DatasetHeroActions dataset={dataset} />
      <div className="mx-auto flex max-w-7xl justify-end px-4 py-2 sm:px-6 lg:px-8">
        <DatasetCollectionsMenu dataset={dataset} />
      </div>

      <div className="border-b border-[var(--ht-border)] bg-[var(--ht-bg)]">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
          <QuickStats items={quickStats} columns={6} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DecisionCard
              stars={decision.stars}
              recommended={decision.recommended}
              notRecommended={decision.notRecommended}
              alternatives={decision.alternatives}
            />
            <DeveloperScore overall={score.overall} max={score.max} axes={score.axes} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <StickyTOC sections={toc} keyboardHint="Use section links or hash URLs to jump." />
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {visible.map((section, idx) => (
          <div
            key={section.id}
            className={`border-b border-[var(--ht-border)] ${idx % 2 === 1 ? 'bg-[var(--ht-surface)]/40' : ''}`}
          >
            {section.render(initialData)}
          </div>
        ))}
      </main>

      <DatasetMonetizationSlots variant="both" />
      <DatasetAssistantDrawer dataset={dataset} />
      <StickyCompareBar dataset={dataset} peers={initialData.comparisons} similar={initialData.similar_datasets} />
    </div>
  );
}

export default DatasetDetailView;
