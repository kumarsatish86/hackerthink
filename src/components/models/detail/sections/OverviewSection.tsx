'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaThumbsUp, FaThumbsDown,
  FaGraduationCap, FaArrowRight, FaTimesCircle, FaLanguage, FaTools,
} from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import { QuickFactsGrid } from '@/components/models/ui/FactCard';
import type { ModelCore } from '@/types/models';
import { toStringArray } from '../utils';

function ListCard({
  title,
  icon,
  items,
  tone = 'neutral',
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone?: 'success' | 'warning' | 'neutral';
}) {
  if (!items.length) return null;
  const toneClass =
    tone === 'success' ? 'text-emerald-600' : tone === 'warning' ? 'text-amber-600' : 'text-[var(--m-brand)]';
  return (
    <Card className="p-4">
      <h3 className={`mb-3 flex items-center gap-2 text-sm font-semibold ${toneClass}`}>
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[var(--m-text)]">
            <span className={`mt-0.5 ${toneClass}`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function OverviewSection({ model }: { model: ModelCore }) {
  const aiSummary = model.ai_summary || {};
  const guidance = model.overview_guidance || {};
  const capabilities = toStringArray(model.capabilities);
  const useCases = toStringArray(model.use_cases);
  const languages = toStringArray(model.languages);
  const inputTypes = toStringArray(model.input_types);
  const outputTypes = toStringArray(model.output_types);
  const features = toStringArray(guidance.features);

  const hasSummary = aiSummary.what || aiSummary.who || aiSummary.when_to_use || aiSummary.when_not_to_use;

  return (
    <DetailSection id="overview" title="Overview" description="What this model is, who it's for, and when to use it">
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
                <FaGraduationCap /> Who it's for
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
            <Card className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <FaCheckCircle /> When to use
              </h3>
              <p className="text-sm text-[var(--m-text)]">{aiSummary.when_to_use}</p>
            </Card>
          )}
          {aiSummary.when_not_to_use && (
            <Card className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600">
                <FaTimesCircle /> When not to use
              </h3>
              <p className="text-sm text-[var(--m-text)]">{aiSummary.when_not_to_use}</p>
            </Card>
          )}
        </div>
      )}

      {(model.full_description || model.description) && (
        <Card className="mb-6 p-5">
          <div className="prose prose-sm max-w-none prose-headings:text-[var(--m-text)] prose-p:text-[var(--m-text)] prose-a:text-[var(--m-brand)] prose-strong:text-[var(--m-text)] prose-li:text-[var(--m-text)] dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{model.full_description || model.description || ''}</ReactMarkdown>
          </div>
        </Card>
      )}

      {(aiSummary.advantages?.length || aiSummary.limitations?.length || aiSummary.ideal_use_cases?.length) ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ListCard title="Advantages" icon={<FaThumbsUp />} items={aiSummary.advantages || []} tone="success" />
          <ListCard title="Limitations" icon={<FaThumbsDown />} items={aiSummary.limitations || []} tone="warning" />
          <ListCard title="Ideal Use Cases" icon={<FaArrowRight />} items={aiSummary.ideal_use_cases || []} />
        </div>
      ) : null}

      {(guidance.strengths?.length || guidance.weaknesses?.length || guidance.best_practices?.length || guidance.common_mistakes?.length) ? (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ListCard title="Strengths" icon={<FaThumbsUp />} items={guidance.strengths || []} tone="success" />
          <ListCard title="Weaknesses" icon={<FaThumbsDown />} items={guidance.weaknesses || []} tone="warning" />
          <ListCard title="Best Practices" icon={<FaCheckCircle />} items={guidance.best_practices || []} tone="success" />
          <ListCard title="Common Mistakes" icon={<FaExclamationTriangle />} items={guidance.common_mistakes || []} tone="warning" />
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

      {(capabilities.length > 0 || useCases.length > 0 || languages.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {capabilities.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--m-text)]">Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {capabilities.map((c, i) => (
                  <Badge key={i}>{c}</Badge>
                ))}
              </div>
            </Card>
          )}
          {useCases.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--m-text)]">Use Cases</h3>
              <div className="flex flex-wrap gap-1.5">
                {useCases.map((c, i) => (
                  <Badge key={i}>{c}</Badge>
                ))}
              </div>
            </Card>
          )}
          {languages.length > 0 && (
            <Card className="p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
                <FaLanguage /> Languages
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {languages.map((c, i) => (
                  <Badge key={i}>{c}</Badge>
                ))}
              </div>
            </Card>
          )}
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

      {!hasSummary && !model.full_description && !model.description && capabilities.length === 0 && useCases.length === 0 && (
        <p className="text-sm text-[var(--m-text-muted)]">Overview information is not available for this model yet.</p>
      )}
    </DetailSection>
  );
}

export default OverviewSection;
