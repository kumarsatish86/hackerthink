'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaThumbsUp, FaThumbsDown,
  FaGraduationCap, FaArrowRight, FaTimesCircle, FaTools,
} from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { AISummary, ProsCons } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import { QuickFactsGrid } from '@/components/models/ui/FactCard';
import type { ModelCore } from '@/types/models';
import { toStringArray } from '../utils';
import { resolveModelDescription } from '@/lib/models/generateModelSummary';
import { groupModelCapabilities } from '@/lib/models/capabilityGroups';
import { CapabilitiesGrouped } from '../CapabilitiesGrouped';
import { InfoCard } from '../InfoCard';
import { ModelVisualBadges } from '../ModelVisualBadges';

export function OverviewSection({ model }: { model: ModelCore }) {
  const aiSummary = model.ai_summary || {};
  const guidance = model.overview_guidance || {};
  const useCases = toStringArray(model.use_cases);
  const inputTypes = toStringArray(model.input_types);
  const outputTypes = toStringArray(model.output_types);
  const features = toStringArray(guidance.features);
  const capabilityGroups = groupModelCapabilities(model);

  const hasSummary = aiSummary.what || aiSummary.who || aiSummary.when_to_use || aiSummary.when_not_to_use;
  const bodyMarkdown = (model.full_description || model.description || '').trim();
  const showGenerated =
    !bodyMarkdown || /^no description available$/i.test(bodyMarkdown);
  const generated = resolveModelDescription(model);

  return (
    <DetailSection id="overview" title="Overview" description="What this model is, who it's for, and when to use it">
      <div className="mb-4">
        <ModelVisualBadges model={model} />
      </div>

      {(aiSummary.what || generated) && (
        <div className="mb-6">
          <AISummary
            title="AI Summary"
            paragraph={String(aiSummary.what || generated)}
            bullets={[
              ...(aiSummary.advantages || []).slice(0, 3),
            ].filter(Boolean)}
          />
        </div>
      )}

      {(aiSummary.advantages?.length || aiSummary.limitations?.length) ? (
        <div className="mb-6">
          <ProsCons
            pros={aiSummary.advantages || []}
            cons={aiSummary.limitations || []}
            expandable
            initiallyExpanded
          />
        </div>
      ) : null}

      {hasSummary && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {aiSummary.what && (
            <Card className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--m-brand)]">
                <FaLightbulb /> What it is
              </h3>
              <p className="text-sm text-[var(--m-text)]">{aiSummary.what}</p>
            </Card>
          )}
          {aiSummary.who && (
            <Card className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--m-brand)]">
                <FaGraduationCap /> Who it&apos;s for
              </h3>
              <p className="text-sm text-[var(--m-text)]">{aiSummary.who}</p>
              {aiSummary.difficulty && (
                <Badge tone="brand" className="mt-2 capitalize">
                  {aiSummary.difficulty} level
                </Badge>
              )}
            </Card>
          )}
          {aiSummary.when_to_use && (
            <Card className="p-4 border-l-4 border-l-emerald-500">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <FaCheckCircle /> When to use
              </h3>
              <p className="text-sm text-[var(--m-text)]">{aiSummary.when_to_use}</p>
            </Card>
          )}
          {aiSummary.when_not_to_use && (
            <Card className="p-4 border-l-4 border-l-amber-500">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
                <FaTimesCircle /> When not to use
              </h3>
              <p className="text-sm text-[var(--m-text)]">{aiSummary.when_not_to_use}</p>
            </Card>
          )}
        </div>
      )}

      {showGenerated ? (
        <Card className="mb-6 p-5">
          <h3 className="mb-2 text-sm font-semibold text-[var(--m-text)]">Summary</h3>
          <p className="text-sm leading-relaxed text-[var(--m-text)]">{generated}</p>
        </Card>
      ) : (
        <Card className="mb-6 p-5">
          <div className="prose prose-sm max-w-none prose-headings:text-[var(--m-text)] prose-p:text-[var(--m-text)] prose-a:text-[var(--m-brand)] prose-strong:text-[var(--m-text)] prose-li:text-[var(--m-text)] dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMarkdown}</ReactMarkdown>
          </div>
        </Card>
      )}

      {(aiSummary.advantages?.length || aiSummary.limitations?.length || aiSummary.ideal_use_cases?.length) ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <InfoCard title="Advantages" icon={<FaThumbsUp />} bullets={aiSummary.advantages || []} tone="success" />
          <InfoCard title="Limitations" icon={<FaThumbsDown />} bullets={aiSummary.limitations || []} tone="warning" />
          <InfoCard title="Ideal Use Cases" icon={<FaArrowRight />} bullets={aiSummary.ideal_use_cases || []} />
        </div>
      ) : null}

      {(guidance.strengths?.length || guidance.weaknesses?.length || guidance.best_practices?.length || guidance.common_mistakes?.length) ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard title="Strengths" icon={<FaThumbsUp />} bullets={guidance.strengths || []} tone="success" />
          <InfoCard title="Weaknesses" icon={<FaThumbsDown />} bullets={guidance.weaknesses || []} tone="warning" />
          <InfoCard title="Best Practices" icon={<FaCheckCircle />} bullets={guidance.best_practices || []} tone="success" />
          <InfoCard title="Common Mistakes" icon={<FaExclamationTriangle />} bullets={guidance.common_mistakes || []} tone="warning" />
        </div>
      ) : null}

      {features.length > 0 && (
        <Card className="mb-6 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
            <FaTools className="text-[var(--m-brand)]" /> Key Features
          </h3>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <Badge key={i} tone="brand">
                {f}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {useCases.length > 0 && (
        <div className="mb-6">
          <InfoCard title="Use Cases" icon={<FaArrowRight />} bullets={useCases} />
        </div>
      )}

      {capabilityGroups.length > 0 && (
        <div className="mb-6">
          <CapabilitiesGrouped groups={capabilityGroups} />
        </div>
      )}

      {(inputTypes.length > 0 || outputTypes.length > 0) && (
        <QuickFactsGrid
          facts={{
            input_types: inputTypes.join(', ') || undefined,
            output_types: outputTypes.join(', ') || undefined,
            expected_performance: guidance.expected_performance,
            commercial_usage: guidance.commercial_usage,
          }}
        />
      )}
    </DetailSection>
  );
}

export default OverviewSection;
