'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import type { ModelDetailPayload } from '@/types/models';
import { ModelBreadcrumb } from './ModelBreadcrumb';
import { ModelHero } from './ModelHero';
import { ModelHeroActions } from './ModelHeroActions';
import { StickySectionNav, type NavSection } from './StickySectionNav';
import { MonetizationSlots } from './MonetizationSlots';
import { QuickStatsGrid } from './QuickStatsGrid';
import { ProductionReadinessCard } from './ProductionReadinessCard';
import { DecisionAssistantCard } from './DecisionAssistantCard';
import { DeveloperScoreCard } from './DeveloperScoreCard';
import { StickyCompareBar } from './StickyCompareBar';
import { buildQuickStats } from '@/lib/models/buildQuickStats';
import { deriveProductionReadiness } from '@/lib/models/deriveProductionReadiness';
import { deriveDecisionAssistant } from '@/lib/models/deriveDecisionAssistant';
import { deriveDeveloperScore } from '@/lib/models/deriveDeveloperScore';
import { OverviewSection } from './sections/OverviewSection';
import { InstallationSection } from './sections/InstallationSection';
import { UsageSection } from './sections/UsageSection';
import { ComparisonSection } from './sections/ComparisonSection';
import { CompatibilitySection } from './sections/CompatibilitySection';
import { DatasetsSection } from './sections/DatasetsSection';
import { PapersSection } from './sections/PapersSection';
import { ApiDocsSection } from './sections/ApiDocsSection';
import { SecuritySection } from './sections/SecuritySection';
import { FaqSection } from './sections/FaqSection';
import { ChangelogSection } from './sections/ChangelogSection';
import { DownloadsAnalyticsSection } from './sections/DownloadsAnalyticsSection';
import { CommunitySection } from './sections/CommunitySection';
import { RelatedSection } from './sections/RelatedSection';
import { TutorialsSection } from './sections/TutorialsSection';
import { UseCasesSection } from './sections/UseCasesSection';
import { ExamplesSection } from './sections/ExamplesSection';
import { ModelDetailSkeleton } from './ModelDetailSkeleton';

const ArchitectureSection = dynamic(
  () => import('./sections/ArchitectureSection').then((m) => m.ArchitectureSection),
  { loading: () => <SectionFallback label="Architecture" /> }
);
const BenchmarksSection = dynamic(
  () => import('./sections/BenchmarksSection').then((m) => m.BenchmarksSection),
  { loading: () => <SectionFallback label="Benchmarks" /> }
);
const PlaygroundSection = dynamic(
  () => import('./sections/PlaygroundSection').then((m) => m.PlaygroundSection),
  { loading: () => <SectionFallback label="Playground" /> }
);
const ModelAssistantDrawer = dynamic(
  () => import('./ModelAssistantDrawer').then((m) => m.ModelAssistantDrawer),
  { ssr: false }
);
const DeploymentGenerator = dynamic(
  () => import('./DeploymentGenerator').then((m) => m.DeploymentGenerator),
  { loading: () => null }
);

function SectionFallback({ label }: { label: string }) {
  return (
    <div className="py-10 text-sm text-[var(--m-text-muted)]" aria-busy>
      Loading {label}…
    </div>
  );
}

type SectionDef = {
  id: string;
  label: string;
  isEmpty: (data: ModelDetailPayload) => boolean;
  render: (data: ModelDetailPayload) => React.ReactNode;
  rhythm?: 'card' | 'table' | 'callout' | 'accordion';
};

function buildRegistry(): SectionDef[] {
  return [
    {
      id: 'overview',
      label: 'Overview',
      isEmpty: () => false,
      rhythm: 'card',
      render: (d) => <OverviewSection model={d.model} />,
    },
    {
      id: 'installation',
      label: 'Installation',
      isEmpty: () => false,
      rhythm: 'accordion',
      render: (d) => <InstallationSection model={d.model} installGuides={d.install_guides} />,
    },
    {
      id: 'deployment',
      label: 'Deploy',
      isEmpty: () => false,
      rhythm: 'callout',
      render: (d) => (
        <div id="deployment" className="scroll-mt-28 py-8">
          <h2 className="mb-4 text-xl font-semibold text-[var(--m-text)]">Deployment Generator</h2>
          <DeploymentGenerator model={d.model} />
        </div>
      ),
    },
    {
      id: 'usage',
      label: 'Usage',
      isEmpty: () => false,
      rhythm: 'card',
      render: (d) => <UsageSection model={d.model} examples={d.usage_examples} />,
    },
    {
      id: 'architecture',
      label: 'Architecture',
      isEmpty: () => false,
      rhythm: 'callout',
      render: (d) => <ArchitectureSection model={d.model} nodes={d.architecture_nodes} />,
    },
    {
      id: 'benchmarks',
      label: 'Benchmarks',
      isEmpty: () => false,
      rhythm: 'table',
      render: (d) => (
        <BenchmarksSection benchmarks={d.benchmarks} model={d.model} peers={d.comparisons} />
      ),
    },
    {
      id: 'playground',
      label: 'Playground',
      isEmpty: () => false,
      rhythm: 'card',
      render: (d) => <PlaygroundSection model={d.model} />,
    },
    {
      id: 'examples',
      label: 'Examples',
      isEmpty: () => false,
      rhythm: 'accordion',
      render: (d) => <ExamplesSection examples={d.usage_examples} model={d.model} />,
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      isEmpty: (d) => d.tutorials.length === 0,
      rhythm: 'card',
      render: (d) => <TutorialsSection tutorials={d.tutorials} />,
    },
    {
      id: 'use-cases',
      label: 'Use Cases',
      isEmpty: (d) => d.use_case_cards.length === 0,
      rhythm: 'card',
      render: (d) => <UseCasesSection cards={d.use_case_cards} />,
    },
    {
      id: 'comparison',
      label: 'Comparison',
      isEmpty: () => false,
      rhythm: 'table',
      render: (d) => <ComparisonSection model={d.model} peers={d.comparisons} />,
    },
    {
      id: 'compatibility',
      label: 'Compatibility',
      isEmpty: (d) => !d.model.compatibility_matrix || Object.keys(d.model.compatibility_matrix).length === 0,
      rhythm: 'table',
      render: (d) => <CompatibilitySection model={d.model} />,
    },
    {
      id: 'datasets',
      label: 'Training Data',
      isEmpty: (d) => d.training_data.length === 0,
      rhythm: 'card',
      render: (d) => <DatasetsSection trainingData={d.training_data} />,
    },
    {
      id: 'papers',
      label: 'Papers',
      isEmpty: (d) => d.papers.length === 0,
      rhythm: 'accordion',
      render: (d) => <PapersSection papers={d.papers} />,
    },
    {
      id: 'api-docs',
      label: 'API Docs',
      isEmpty: (d) => d.api_docs.length === 0,
      rhythm: 'card',
      render: (d) => <ApiDocsSection docs={d.api_docs} />,
    },
    {
      id: 'security',
      label: 'Security',
      isEmpty: (d) => d.security_notes.length === 0,
      rhythm: 'callout',
      render: (d) => <SecuritySection notes={d.security_notes} />,
    },
    {
      id: 'faq',
      label: 'FAQ',
      isEmpty: () => false,
      rhythm: 'accordion',
      render: (d) => <FaqSection faqs={d.faqs} model={d.model} />,
    },
    {
      id: 'changelog',
      label: 'Changelog',
      isEmpty: (d) => d.changelog.length === 0 && d.versions.length === 0,
      rhythm: 'accordion',
      render: (d) => <ChangelogSection changelog={d.changelog} versions={d.versions} />,
    },
    {
      id: 'downloads-analytics',
      label: 'Analytics',
      isEmpty: () => false,
      rhythm: 'table',
      render: (d) => <DownloadsAnalyticsSection analytics={d.download_analytics} />,
    },
    {
      id: 'community',
      label: 'Community',
      isEmpty: () => false,
      rhythm: 'card',
      render: (d) => <CommunitySection model={d.model} links={d.community_links} />,
    },
    {
      id: 'related',
      label: 'Related',
      isEmpty: (d) => d.related.length === 0,
      rhythm: 'card',
      render: (d) => <RelatedSection related={d.related} />,
    },
  ];
}

const REGISTRY = buildRegistry();

export function ModelDetailView({ initialData }: { initialData: ModelDetailPayload }) {
  const { model } = initialData;

  const visibleSections = useMemo(() => {
    return REGISTRY.filter((s) => !s.isEmpty(initialData));
  }, [initialData]);

  const navSections: NavSection[] = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      ...visibleSections
        .filter((s) => s.id !== 'overview')
        .map(({ id, label }) => ({ id, label })),
    ],
    [visibleSections]
  );

  const quickStats = useMemo(
    () => buildQuickStats(model, initialData.download_analytics, initialData.training_data),
    [model, initialData.download_analytics, initialData.training_data]
  );
  const readiness = useMemo(
    () => deriveProductionReadiness(model, initialData),
    [model, initialData]
  );
  const decision = useMemo(
    () => deriveDecisionAssistant(model, initialData.comparisons, initialData.related),
    [model, initialData.comparisons, initialData.related]
  );
  const developerScore = useMemo(
    () => deriveDeveloperScore(model, initialData.download_analytics),
    [model, initialData.download_analytics]
  );

  const category =
    Array.isArray(model.categories) && typeof model.categories[0] === 'string'
      ? (model.categories[0] as string)
      : undefined;

  useEffect(() => {
    const url = new URL(window.location.href);
    const target = url.searchParams.get('section') || (window.location.hash ? window.location.hash.slice(1) : '');
    if (!target) return;
    const el = document.getElementById(target);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  if (!model?.slug) {
    return <ModelDetailSkeleton />;
  }

  return (
    <div className="models-scope ht-scope min-h-screen">
      <a
        href="#overview"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--m-brand)] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to overview
      </a>
      <ModelBreadcrumb modelName={model.name} category={category} />
      <ModelHero model={model} />
      <ModelHeroActions model={model} installGuides={initialData.install_guides} />

      <div className="border-b border-[var(--m-border)] bg-[var(--m-bg)]">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-5 sm:px-6 lg:px-8">
          <QuickStatsGrid items={quickStats} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <DecisionAssistantCard data={decision} />
            <DeveloperScoreCard data={developerScore} />
            <ProductionReadinessCard data={readiness} />
          </div>
        </div>
      </div>

      <StickySectionNav sections={navSections} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {visibleSections.map((section, idx) => {
          const rhythm = section.rhythm || 'card';
          const wrapper =
            rhythm === 'callout'
              ? 'border-l-2 border-l-[var(--m-brand)]/30 pl-1'
              : '';
          return (
            <div
              key={section.id}
              className={`divide-none border-b border-[var(--m-border)] ${idx % 2 === 1 ? 'bg-[var(--m-surface)]/40' : ''} ${wrapper}`}
            >
              {section.render(initialData)}
            </div>
          );
        })}
      </main>

      <MonetizationSlots variant="both" />
      <ModelAssistantDrawer model={model} />
      <StickyCompareBar model={model} peers={initialData.comparisons} related={initialData.related} />
    </div>
  );
}

export default ModelDetailView;
