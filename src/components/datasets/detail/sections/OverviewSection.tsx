'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AISummary, ProsCons, Card, Callout } from '@/components/ht-ui';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { DatasetCore } from '@/types/datasets';
import { toStringArray } from '@/lib/datasets/arrayUtils';
import {
  buildFallbackAiSummary,
  resolveDatasetDescription,
} from '@/lib/datasets/generateDatasetSummary';
import { DatasetVisualBadges } from '../DatasetVisualBadges';
import { InfoCard } from '@/components/models/detail/InfoCard';
import { FaCheckCircle, FaExclamationTriangle, FaThumbsDown, FaThumbsUp } from 'react-icons/fa';

export function OverviewSection({ dataset }: { dataset: DatasetCore }) {
  const ai = { ...buildFallbackAiSummary(dataset), ...(dataset.ai_summary || {}) };
  const g = dataset.overview_guidance || {};
  const tasks = toStringArray(dataset.task_types);
  const body = resolveDatasetDescription(dataset);
  const [expert, setExpert] = useState(false);

  return (
    <DetailSection id="overview" title="Overview" description="What this dataset is and when to use it">
      <div className="mb-4">
        <DatasetVisualBadges dataset={dataset} />
      </div>
      <div className="mb-4 flex gap-2 text-xs">
        <button
          type="button"
          className={`rounded-md px-3 py-1 ${!expert ? 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]' : 'text-[var(--ht-text-muted)]'}`}
          onClick={() => setExpert(false)}
        >
          Beginner
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1 ${expert ? 'bg-[var(--ht-brand-soft)] text-[var(--ht-brand)]' : 'text-[var(--ht-text-muted)]'}`}
          onClick={() => setExpert(true)}
        >
          Expert
        </button>
      </div>
      <div className="mb-6">
        <AISummary
          title="AI Summary"
          paragraph={expert ? ai.expert_summary || body : ai.beginner_summary || ai.what || body}
          bullets={ai.ideal_use_cases?.slice(0, 4)}
        />
      </div>
      {(ai.advantages?.length || ai.limitations?.length) ? (
        <div className="mb-6">
          <ProsCons pros={ai.advantages || []} cons={ai.limitations || []} />
        </div>
      ) : null}
      <Card className="mb-6 prose prose-sm max-w-none p-4 dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </Card>
      {dataset.provider ? (
        <Callout variant="info" title="Who created it" body={`Provider / organization: ${dataset.provider}`} className="mb-4" />
      ) : null}
      {tasks.length ? (
        <p className="mb-4 text-sm text-[var(--ht-text)]">
          <span className="font-semibold">Supported tasks:</span> {tasks.join(', ')}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard title="Strengths" icon={<FaThumbsUp />} bullets={g.strengths || g.advantages || ai.advantages || []} tone="success" />
        <InfoCard title="Weaknesses" icon={<FaThumbsDown />} bullets={g.weaknesses || g.limitations || ai.limitations || []} tone="warning" />
        <InfoCard title="Best Practices" icon={<FaCheckCircle />} bullets={g.best_practices || []} tone="success" />
        <InfoCard title="Common Mistakes" icon={<FaExclamationTriangle />} bullets={g.common_mistakes || []} tone="warning" />
      </div>
      {(g.commercial_usage || g.privacy_considerations) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {g.commercial_usage ? <Callout variant="success" title="Commercial use" body={g.commercial_usage} /> : null}
          {g.privacy_considerations ? <Callout variant="warning" title="Privacy" body={g.privacy_considerations} /> : null}
        </div>
      )}
    </DetailSection>
  );
}

export default OverviewSection;
