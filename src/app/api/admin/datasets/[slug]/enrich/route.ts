import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';
import { buildFallbackAiSummary } from '@/lib/datasets/generateDatasetSummary';
import { deriveQualityHealth, estimateStatistics } from '@/lib/datasets/deriveQualityHealth';
import { generatePeopleAlsoAsk } from '@/lib/datasets/generatePeopleAlsoAsk';
import { generatePreprocessingSnippets } from '@/lib/datasets/generatePreprocessingSnippets';
import {
  computeFreshnessScore,
  computePopularityScore,
  commercialFriendly,
  estimateStorageRam,
} from '@/lib/datasets/estimateHardware';
import type { DatasetCore } from '@/types/datasets';
import { invalidateDatasetDetailCache } from '@/lib/datasets/getDatasetDetail';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { slug } = await params;
  const row = await queryOne(`SELECT * FROM datasets WHERE slug = $1`, [slug]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const dataset = row as unknown as DatasetCore;
  const datasetId = dataset.id;
  const summary = buildFallbackAiSummary(dataset);
  const hw = estimateStorageRam(dataset);
  const freshness = computeFreshnessScore(dataset);
  const popularity = computePopularityScore(dataset);

  await query(
    `UPDATE datasets SET
       ai_summary = $2::jsonb,
       storage_estimate = $3,
       ram_estimate = $4,
       freshness_score = $5,
       popularity_score = $6,
       commercial_use = $7,
       enrichment_applied = TRUE,
       updated_at = NOW()
     WHERE id = $1`,
    [
      datasetId,
      JSON.stringify(summary),
      hw.storage,
      hw.ram,
      freshness,
      popularity,
      commercialFriendly(dataset),
    ]
  );

  const qCount = (await queryOne(
    `SELECT COUNT(*)::int AS c FROM dataset_quality_metrics WHERE dataset_id = $1`,
    [datasetId]
  )) as { c?: number } | null;
  if (!qCount?.c) {
    for (const m of deriveQualityHealth(dataset)) {
      await query(
        `INSERT INTO dataset_quality_metrics (dataset_id, metric_key, label, value, source, confidence, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [datasetId, m.metric_key, m.label, m.value, m.source, m.confidence, m.notes || null]
      );
    }
  }

  const sCount = (await queryOne(
    `SELECT COUNT(*)::int AS c FROM dataset_statistics WHERE dataset_id = $1`,
    [datasetId]
  )) as { c?: number } | null;
  if (!sCount?.c) {
    for (const s of estimateStatistics(dataset)) {
      await query(
        `INSERT INTO dataset_statistics (dataset_id, series_key, label, points, source) VALUES ($1,$2,$3,$4::jsonb,$5)`,
        [datasetId, s.series_key, s.label, JSON.stringify(s.points), s.source]
      );
    }
  }

  const fCount = (await queryOne(
    `SELECT COUNT(*)::int AS c FROM dataset_faqs WHERE dataset_id = $1`,
    [datasetId]
  )) as { c?: number } | null;
  if (!fCount?.c) {
    const faqs = generatePeopleAlsoAsk(dataset);
    for (let i = 0; i < faqs.length; i++) {
      const f = faqs[i];
      await query(
        `INSERT INTO dataset_faqs (dataset_id, question, answer, sort_order) VALUES ($1,$2,$3,$4)`,
        [datasetId, f.question, f.answer, i]
      );
    }
  }

  const pCount = (await queryOne(
    `SELECT COUNT(*)::int AS c FROM dataset_preprocessing WHERE dataset_id = $1`,
    [datasetId]
  )) as { c?: number } | null;
  if (!pCount?.c) {
    for (const g of generatePreprocessingSnippets(dataset)) {
      await query(
        `INSERT INTO dataset_preprocessing (dataset_id, title, language, framework, code, tier)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [datasetId, g.title, g.language, g.framework || null, g.code, g.tier || null]
      );
    }
  }

  invalidateDatasetDetailCache(slug);
  return NextResponse.json({ ok: true, summary, freshness, popularity });
}
