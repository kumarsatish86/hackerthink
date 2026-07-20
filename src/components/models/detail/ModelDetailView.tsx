'use client';

import { useEffect, useMemo } from 'react';
import type { ModelDetailPayload } from '@/types/models';
import { ModelBreadcrumb } from './ModelBreadcrumb';
import { ModelHero } from './ModelHero';
import { ModelHeroActions } from './ModelHeroActions';
import { StickySectionNav, type NavSection } from './StickySectionNav';
import { ModelAssistantDrawer } from './ModelAssistantDrawer';
import { MonetizationSlots } from './MonetizationSlots';
import { OverviewSection } from './sections/OverviewSection';
import { InstallationSection } from './sections/InstallationSection';
import { UsageSection } from './sections/UsageSection';
import { ArchitectureSection } from './sections/ArchitectureSection';
import { BenchmarksSection } from './sections/BenchmarksSection';
import { PlaygroundSection } from './sections/PlaygroundSection';
import { ExamplesSection } from './sections/ExamplesSection';
import { TutorialsSection } from './sections/TutorialsSection';
import { UseCasesSection } from './sections/UseCasesSection';
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

/**
 * All possible detail sections in display order. Each entry declares how to
 * decide whether it has content worth rendering (and thus worth a nav link).
 */
function useVisibleSections(data: ModelDetailPayload): NavSection[] {
  return useMemo(() => {
    const { model } = data;
    const candidates: (NavSection & { visible: boolean })[] = [
      { id: 'overview', label: 'Overview', visible: true },
      { id: 'installation', label: 'Installation', visible: true },
      { id: 'usage', label: 'Usage', visible: true },
      { id: 'architecture', label: 'Architecture', visible: true },
      { id: 'benchmarks', label: 'Benchmarks', visible: data.benchmarks.length > 0 },
      { id: 'playground', label: 'Playground', visible: true },
      { id: 'examples', label: 'Examples', visible: data.usage_examples.length > 0 },
      { id: 'tutorials', label: 'Tutorials', visible: data.tutorials.length > 0 },
      { id: 'use-cases', label: 'Use Cases', visible: data.use_case_cards.length > 0 },
      { id: 'comparison', label: 'Comparison', visible: true },
      { id: 'compatibility', label: 'Compatibility', visible: !!model.compatibility_matrix && Object.keys(model.compatibility_matrix).length > 0 },
      { id: 'datasets', label: 'Training Data', visible: data.training_data.length > 0 },
      { id: 'papers', label: 'Papers', visible: data.papers.length > 0 },
      { id: 'api-docs', label: 'API Docs', visible: data.api_docs.length > 0 },
      { id: 'security', label: 'Security', visible: data.security_notes.length > 0 },
      { id: 'faq', label: 'FAQ', visible: data.faqs.length > 0 },
      { id: 'changelog', label: 'Changelog', visible: data.changelog.length > 0 },
      { id: 'downloads-analytics', label: 'Analytics', visible: true },
      { id: 'community', label: 'Community', visible: true },
      { id: 'related', label: 'Related', visible: data.related.length > 0 },
    ];
    return candidates.filter((c) => c.visible).map(({ id, label }) => ({ id, label }));
  }, [data]);
}

export function ModelDetailView({ initialData }: { initialData: ModelDetailPayload }) {
  const { model } = initialData;
  const sections = useVisibleSections(initialData);
  const category = Array.isArray(model.categories) && typeof model.categories[0] === 'string' ? (model.categories[0] as string) : undefined;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="models-scope min-h-screen">
      <ModelBreadcrumb modelName={model.name} category={category} />
      <ModelHero model={model} />
      <ModelHeroActions model={model} installGuides={initialData.install_guides} />
      <StickySectionNav sections={sections} />

      <main className="mx-auto max-w-7xl divide-y divide-[var(--m-border)] px-4 sm:px-6 lg:px-8">
        <OverviewSection model={model} />
        <InstallationSection model={model} installGuides={initialData.install_guides} />
        <UsageSection model={model} examples={initialData.usage_examples} />
        <ArchitectureSection model={model} nodes={initialData.architecture_nodes} />
        <BenchmarksSection benchmarks={initialData.benchmarks} />
        <PlaygroundSection model={model} />
        <ExamplesSection examples={initialData.usage_examples} />
        <TutorialsSection tutorials={initialData.tutorials} />
        <UseCasesSection cards={initialData.use_case_cards} />
        <ComparisonSection model={model} peers={initialData.comparisons} />
        <CompatibilitySection model={model} />
        <DatasetsSection trainingData={initialData.training_data} />
        <PapersSection papers={initialData.papers} />
        <ApiDocsSection docs={initialData.api_docs} />
        <SecuritySection notes={initialData.security_notes} />
        <FaqSection faqs={initialData.faqs} />
        <ChangelogSection changelog={initialData.changelog} versions={initialData.versions} />
        <DownloadsAnalyticsSection analytics={initialData.download_analytics} />
        <CommunitySection model={model} links={initialData.community_links} />
        <RelatedSection related={initialData.related} />
      </main>

      <MonetizationSlots variant="both" />

      <ModelAssistantDrawer model={model} />
    </div>
  );
}

export default ModelDetailView;
