import type { ModelCore, ModelDetailPayload } from '@/types/models';
import { deriveModelScores, starsFromScore } from './deriveModelScores';

export type ProductionReadinessLabel =
  | 'Production Ready'
  | 'Enterprise Ready'
  | 'Research Only'
  | 'Experimental'
  | 'Maintained'
  | 'Actively Updated';

export type ProductionReadiness = {
  score: number;
  stars: number;
  labels: ProductionReadinessLabel[];
  reason: string;
  communitySize: 'small' | 'medium' | 'large';
  documentationScore: number;
  deploymentScore: number;
  maintained: boolean;
  activelyUpdated: boolean;
};

export function deriveProductionReadiness(
  model: ModelCore,
  payload?: Pick<ModelDetailPayload, 'faqs' | 'install_guides' | 'api_docs' | 'security_notes' | 'download_analytics'>
): ProductionReadiness {
  const scores = deriveModelScores(model, payload?.download_analytics);
  const docsBits =
    (payload?.faqs?.length ? 1 : 0) +
    (payload?.install_guides?.length ? 1 : 0) +
    (payload?.api_docs?.length ? 1 : 0) +
    (model.ai_summary?.what ? 1 : 0) +
    (model.description ? 1 : 0);
  const documentationScore = Math.min(100, docsBits * 20);
  const deploymentScore = Math.min(
    100,
    (payload?.install_guides?.length ? 40 : 10) +
      (model.compatibility_badge ? 20 : 0) +
      (model.demo_url || model.playground_config?.demo_url ? 20 : 0) +
      (model.api_endpoint ? 20 : 0)
  );

  const downloads = model.download_count || payload?.download_analytics?.total || 0;
  const communitySize: ProductionReadiness['communitySize'] =
    downloads > 100_000 ? 'large' : downloads > 5_000 ? 'medium' : 'small';

  const updated = model.last_updated ? new Date(model.last_updated).getTime() : 0;
  const monthsAgo = updated ? (Date.now() - updated) / (1000 * 60 * 60 * 24 * 30) : 99;
  const activelyUpdated = monthsAgo < 6;
  const maintained = monthsAgo < 18 || Boolean(model.verified);

  const labels: ProductionReadinessLabel[] = [];
  if (scores.production >= 75 && scores.commercialFriendly) labels.push('Enterprise Ready');
  else if (scores.production >= 60) labels.push('Production Ready');
  else if (/research|experimental|alpha|beta/i.test(`${model.license} ${model.name}`)) labels.push('Experimental');
  else labels.push('Research Only');

  if (maintained) labels.push('Maintained');
  if (activelyUpdated) labels.push('Actively Updated');

  const reason = scores.commercialFriendly
    ? `${model.name} scores ${scores.production}/100 for production readiness based on popularity, documentation depth, license friendliness, and deployment signals.`
    : `${model.name} may be limited for commercial use under ${model.license || 'its license'}; treat as ${labels[0].toLowerCase()} until legal and ops reviews complete.`;

  return {
    score: scores.production,
    stars: starsFromScore(scores.production),
    labels: [...new Set(labels)],
    reason,
    communitySize,
    documentationScore,
    deploymentScore,
    maintained,
    activelyUpdated,
  };
}
