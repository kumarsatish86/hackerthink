import { buildFallbackAiSummary } from './generateDatasetSummary';
import { deriveQualityHealth } from './deriveQualityHealth';
import {
  computeFreshnessScore,
  computePopularityScore,
  commercialFriendly,
  estimateStorageRam,
} from './estimateHardware';
import type { DatasetCore } from '@/types/datasets';

/** Build enrichment fields for HF (or other) imports before INSERT/UPDATE. */
export function buildImportEnrichment(partial: Partial<DatasetCore> & { name: string; slug: string }) {
  const dataset = partial as DatasetCore;
  const summary = buildFallbackAiSummary(dataset);
  const hw = estimateStorageRam(dataset);
  const freshness = clampScore(computeFreshnessScore(dataset), 0, 100);
  const popularity = clampScore(computePopularityScore(dataset), 0, 100);
  const quality = deriveQualityHealth(dataset);
  const healthRaw = quality.find((q) => q.metric_key === 'overall_health')?.value ?? null;
  // Catalog quality_score is 0–10; heuristics often return 0–100.
  const qualityScore = clampScore(
    dataset.quality_score != null
      ? Number(dataset.quality_score)
      : healthRaw != null
        ? Number(healthRaw) / 10
        : null,
    0,
    10
  );

  const sampleStub =
    Array.isArray(dataset.sample_data) || (dataset.sample_data && Object.keys(dataset.sample_data as object).length)
      ? dataset.sample_data
      : {
          note: 'Preview samples load via hybrid explorer (DB → Hugging Face datasets-server).',
          source: 'import_stub',
        };

  return {
    ai_summary: summary,
    sample_data: sampleStub,
    storage_estimate: hw.storage,
    ram_estimate: hw.ram,
    freshness_score: freshness,
    popularity_score: popularity,
    commercial_use: commercialFriendly(dataset),
    quality_score: qualityScore,
    quality_metrics: quality,
  };
}

function clampScore(value: number | null | undefined, min: number, max: number): number | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Math.min(max, Math.max(min, Number(value)));
}
