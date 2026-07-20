'use client';

import { Badge } from '@/components/models/ui/primitives';
import type { ModelCore } from '@/types/models';
import { deriveModelScores } from '@/lib/models/deriveModelScores';
import { toStringArray } from './utils';

type Tone = 'neutral' | 'brand' | 'success' | 'warning';

function ModelBadge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  return <Badge tone={tone}>{children}</Badge>;
}

export function buildModelBadges(model: ModelCore) {
  const scores = deriveModelScores(model);
  const badges: { key: string; label: string; tone: Tone }[] = [];

  if (model.license) badges.push({ key: 'license', label: model.license, tone: 'brand' });
  if (model.framework) badges.push({ key: 'framework', label: model.framework, tone: 'neutral' });
  if (model.task) badges.push({ key: 'task', label: model.task, tone: 'neutral' });
  if (model.architecture) badges.push({ key: 'arch', label: model.architecture, tone: 'neutral' });

  const tags = toStringArray(model.tags);
  if (tags.some((t) => /onnx/i.test(t))) badges.push({ key: 'onnx', label: 'ONNX', tone: 'success' });
  if (tags.some((t) => /transformers/i.test(t)) || /transformers/i.test(model.framework || '')) {
    badges.push({ key: 'transformers', label: 'Transformers', tone: 'neutral' });
  }
  if (/embed|sentence/i.test(`${model.task} ${model.name}`)) {
    badges.push({ key: 'sentence', label: 'Sentence Embedding', tone: 'brand' });
  }

  if (scores.cpuFriendly) badges.push({ key: 'cpu', label: 'CPU', tone: 'success' });
  if (scores.gpuFriendly) badges.push({ key: 'gpu', label: 'GPU', tone: 'success' });
  if (scores.production >= 60) badges.push({ key: 'prod', label: 'Production', tone: 'success' });
  if (scores.beginnerFriendly) badges.push({ key: 'beginner', label: 'Beginner', tone: 'brand' });
  if (scores.cpuFriendly || /fast|mini|lite|tiny/i.test(model.name)) {
    badges.push({ key: 'fast', label: 'Fast', tone: 'warning' });
  }
  if (scores.cpuFriendly) badges.push({ key: 'light', label: 'Lightweight', tone: 'neutral' });
  if (scores.commercialFriendly) badges.push({ key: 'commercial', label: 'Commercial', tone: 'success' });

  // de-dupe by label
  const seen = new Set<string>();
  return badges.filter((b) => {
    const k = b.label.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function ModelVisualBadges({ model, className = '' }: { model: ModelCore; className?: string }) {
  const badges = buildModelBadges(model);
  if (!badges.length) return null;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Model badges">
      {badges.map((b) => (
        <ModelBadge key={b.key} tone={b.tone}>
          {b.label}
        </ModelBadge>
      ))}
    </div>
  );
}
