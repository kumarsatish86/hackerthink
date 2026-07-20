import type { ModelCore, ModelDownloadAnalytics } from '@/types/models';
import { deriveModelScores } from './deriveModelScores';
import { toStringArray } from './arrayUtils';

export type DeveloperScoreAxis = {
  id: string;
  name: string;
  score: number;
  max: number;
  why: string;
};

export type DeveloperScoreResult = {
  overall: number;
  max: number;
  axes: DeveloperScoreAxis[];
  stars: number;
};

function clamp(n: number, min = 0, max = 10) {
  return Math.max(min, Math.min(max, n));
}

function axis(id: string, name: string, score: number, why: string): DeveloperScoreAxis {
  return { id, name, score: clamp(Number(score.toFixed(1))), max: 10, why };
}

/**
 * Nine-axis developer score → overall X.X/10.
 * Deterministic heuristics from model metadata (not a hosted judge).
 */
export function deriveDeveloperScore(
  model: ModelCore,
  analytics?: ModelDownloadAnalytics | null
): DeveloperScoreResult {
  const scores = deriveModelScores(model, analytics);
  const tags = toStringArray(model.tags).join(' ');
  const hasDocs = Boolean(model.full_description || model.description || model.ai_summary);
  const hasHf = Boolean(model.huggingface_url || model.external_model_id);
  const licenseOk = /mit|apache|bsd|openrail|cc-by/i.test(model.license || '');
  const commercial = scores.commercialFriendly;
  const downloads = model.download_count || analytics?.total || 0;
  const params = model.param_count_b ?? 0;

  const axes: DeveloperScoreAxis[] = [
    axis(
      'documentation',
      'Documentation',
      hasDocs ? (model.full_description ? 9 : 7.5) : 4,
      hasDocs ? 'Description and summary fields are populated.' : 'Sparse docs — expect to lean on external cards.'
    ),
    axis(
      'community',
      'Community',
      downloads > 1_000_000 ? 9.2 : downloads > 100_000 ? 8 : downloads > 10_000 ? 6.5 : 5,
      downloads
        ? `Download signal ≈ ${downloads.toLocaleString()} indicates community traction.`
        : 'Limited download signal; community size is uncertain.'
    ),
    axis(
      'deployment',
      'Deployment',
      scores.cpuFriendly || scores.gpuFriendly ? 8.5 : 6,
      'Based on CPU/GPU friendliness and framework metadata.'
    ),
    axis(
      'performance',
      'Performance',
      params > 0 && params < 1 ? 8.8 : params < 7 ? 7.5 : 6.5,
      params
        ? `Parameter scale (${params}B) informs expected latency/cost tradeoffs.`
        : 'Parameter count missing; performance estimated from task type.'
    ),
    axis(
      'maintenance',
      'Maintenance',
      model.last_updated ? 8 : model.release_date ? 6.5 : 5,
      model.last_updated ? 'Recent update timestamp present.' : 'No recent update signal.'
    ),
    axis(
      'popularity',
      'Popularity',
      scores.popularity / 10,
      `Popularity score ${scores.popularity}/100 mapped to 10-point scale.`
    ),
    axis(
      'enterprise',
      'Enterprise',
      commercial && licenseOk ? 8.5 : commercial ? 6.5 : 4.5,
      commercial ? 'License and readiness lean enterprise-friendly.' : 'Review license and SLA needs carefully.'
    ),
    axis(
      'security',
      'Security',
      /safetensors|gguf/i.test(tags + (model.framework || '')) ? 8 : 6.5,
      'Inferred from format/framework signals; always run your own threat model.'
    ),
    axis(
      'commercial',
      'Commercial',
      commercial ? 9 : licenseOk ? 7 : 4,
      model.license ? `License: ${model.license}.` : 'License unclear — verify before commercial use.'
    ),
  ];

  const overall = clamp(axes.reduce((s, a) => s + a.score, 0) / axes.length);
  const stars = Math.max(1, Math.min(5, Math.round(overall / 2)));

  return {
    overall: Number(overall.toFixed(1)),
    max: 10,
    axes,
    stars,
  };
}
