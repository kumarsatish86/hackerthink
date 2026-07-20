import type { ModelCore, ModelDownloadAnalytics } from '@/types/models';

export type ModelScores = {
  trending: number; // 0–100
  popularity: number;
  production: number;
  commercialFriendly: boolean;
  beginnerFriendly: boolean;
  cpuFriendly: boolean;
  gpuFriendly: boolean;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function licenseCommercial(license?: string | null): boolean {
  if (!license) return false;
  const l = license.toLowerCase();
  if (/gpl|agpl|cc-by-nc|non.?commercial|research.?only|llama.?2.?community/i.test(l)) return false;
  return /apache|mit|bsd|cc0|cc-by-4|openrail|llama.?3|commercial/i.test(l);
}

export function deriveModelScores(
  model: ModelCore,
  analytics?: ModelDownloadAnalytics | null
): ModelScores {
  const downloads = model.download_count || analytics?.total || 0;
  const likes = model.likes_count || 0;
  const rating = model.rating || 0;
  const faqish = Boolean(model.ai_summary?.what || model.description);
  const verifiedBoost = model.verified ? 12 : 0;
  const securityBoost = model.security_badge ? 8 : 0;

  const popularity = clamp(
    Math.log10(Math.max(downloads, 1)) * 18 + Math.log10(Math.max(likes, 1)) * 10 + rating * 8 + verifiedBoost
  );

  const trending =
    model.trending_rank != null && model.trending_rank > 0
      ? clamp(100 - model.trending_rank * 2)
      : clamp(popularity * 0.7 + (analytics?.today || 0) * 0.05);

  const docsScore = faqish ? 20 : 5;
  const commercial = licenseCommercial(model.license);
  const production = clamp(
    popularity * 0.35 +
      docsScore +
      verifiedBoost +
      securityBoost +
      (commercial ? 15 : 0) +
      (model.compatibility_badge ? 10 : 0)
  );

  const paramsB = model.param_count_b ?? null;
  const cpuFriendly =
    (paramsB != null && paramsB <= 3) ||
    /cpu|lightweight|edge|mobile|mini|small/i.test(`${model.parameters || ''} ${model.name}`);
  const gpuFriendly = !cpuFriendly || (paramsB != null && paramsB >= 1);

  const difficulty = model.ai_summary?.difficulty?.toLowerCase();
  const beginnerFriendly =
    difficulty === 'beginner' ||
    cpuFriendly ||
    /mini|small|base|embedding|sentence/i.test(`${model.name} ${model.task || ''}`);

  return {
    trending,
    popularity: analytics?.popularity_score != null ? clamp(analytics.popularity_score) : popularity,
    production,
    commercialFriendly: commercial,
    beginnerFriendly,
    cpuFriendly,
    gpuFriendly,
  };
}

export function starsFromScore(score: number): number {
  return clamp(Math.round(score / 20), 0, 5);
}
