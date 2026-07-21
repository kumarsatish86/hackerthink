import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { HuggingFaceService } from '@/services/import/HuggingFaceService';
import { AIEnrichmentService } from '@/services/import/AIEnrichmentService';
import { buildImportEnrichment } from '@/lib/datasets/importHelpers';
import { invalidateDatasetDetailCache } from '@/lib/datasets/getDatasetDetail';
import { linkDatasetToMatchingModels } from '@/lib/models/linkTrainingDatasets';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

async function getHfApiKey() {
  const settingsResult = await pool.query(
    'SELECT api_key FROM import_settings WHERE source_name = $1 AND enabled = true',
    ['huggingface']
  );
  return settingsResult.rows[0]?.api_key as string | undefined;
}

async function autoLinkDatasetToModels(dataset: {
  slug: string;
  name: string;
  external_dataset_id?: string | null;
}) {
  try {
    return await linkDatasetToMatchingModels(pool, dataset);
  } catch (error) {
    console.error('Dataset→model auto-link failed (import still succeeded):', error);
    return 0;
  }
}

export async function upsertHfDataset(opts: {
  identifier: string;
  auto_approval?: boolean;
  apply_enrichment?: boolean;
  apiKey?: string;
  status?: 'draft' | 'published';
}) {
  const {
    identifier,
    auto_approval = false,
    apply_enrichment = true,
    apiKey,
    status = 'published',
  } = opts;
  const hfService = new HuggingFaceService(apiKey);
  const fetchedData = await hfService.fetchDataset(identifier);

  let enrichment: Record<string, unknown> = {};
  if (apply_enrichment) {
    const enrichmentService = new AIEnrichmentService();
    enrichment = (await enrichmentService.enrich({
      name: fetchedData.name,
      description: fetchedData.description,
      model_type: fetchedData.dataset_type,
    })) as unknown as Record<string, unknown>;
  }

  const externalId = `hf:${identifier}`;
  const importEnrich = buildImportEnrichment({
    name: fetchedData.name,
    slug: fetchedData.slug,
    provider: fetchedData.provider,
    description: fetchedData.description,
    dataset_type: fetchedData.dataset_type,
    download_count: fetchedData.download_count,
    license: fetchedData.license,
    size: fetchedData.size,
    rows: fetchedData.rows,
    modality: fetchedData.modality || fetchedData.dataset_type,
    languages: fetchedData.languages,
    categories: fetchedData.categories,
    tags: fetchedData.tags,
    sample_data: (fetchedData as { sample_data?: never }).sample_data,
  });

  const downloadCount = sanitizeDownloadCount(fetchedData.download_count);
  const riskScore = sanitizeRiskScore(enrichment.risk_score);
  const languagesJson = JSON.stringify(
    Array.isArray(fetchedData.languages) ? fetchedData.languages : []
  );
  const quickFactsJson = JSON.stringify({
    ...(fetchedData.quick_facts || {}),
    classes:
      fetchedData.classes != null
        ? String(fetchedData.classes)
        : fetchedData.quick_facts?.classes ?? null,
  });
  const modalityValue = fetchedData.modality || fetchedData.dataset_type || null;

  const enrichedData = {
    ...fetchedData,
    ...enrichment,
    ...importEnrich,
    download_count: downloadCount,
    external_dataset_id: externalId,
    enrichment_applied: apply_enrichment,
  };

  if (!auto_approval) {
    return { mode: 'preview' as const, dataset: enrichedData };
  }

  const existing = await pool.query(
    `SELECT id, slug FROM datasets WHERE external_dataset_id = $1 OR slug = $2 LIMIT 1`,
    [externalId, fetchedData.slug]
  );

  if (existing.rows[0]) {
    const id = existing.rows[0].id;
    const slug = existing.rows[0].slug;
    await pool.query(
      `UPDATE datasets SET
         name = COALESCE($2, name),
         provider = COALESCE($3, provider),
         description = COALESCE($4, description),
         dataset_type = COALESCE($5, dataset_type),
         download_url = COALESCE($6, download_url),
         huggingface_url = COALESCE($7, huggingface_url),
         download_count = COALESCE($8, download_count),
         categories = COALESCE($9::jsonb, categories),
         tags = COALESCE($10::jsonb, tags),
         import_source = 'huggingface',
         import_metadata = COALESCE($11::jsonb, import_metadata),
         enrichment_applied = $12,
         ideal_hardware = COALESCE($13, ideal_hardware),
         risk_score = COALESCE($14, risk_score),
         comparison_notes = COALESCE($15, comparison_notes),
         external_dataset_id = $16,
         ai_summary = COALESCE($17::jsonb, ai_summary),
         sample_data = COALESCE($18::jsonb, sample_data),
         storage_estimate = COALESCE($19, storage_estimate),
         ram_estimate = COALESCE($20, ram_estimate),
         freshness_score = COALESCE($21, freshness_score),
         popularity_score = COALESCE($22, popularity_score),
         commercial_use = COALESCE($23, commercial_use),
         quality_score = COALESCE($24, quality_score),
         modality = COALESCE($25, modality),
         size = COALESCE($26, size),
         rows = COALESCE($27, rows),
         columns = COALESCE($28, columns),
         languages = CASE
           WHEN $29::jsonb <> '[]'::jsonb THEN $29::jsonb
           ELSE languages
         END,
         language = COALESCE($30, language),
         license = COALESCE($31, license),
         format = COALESCE($32, format),
         domain = COALESCE($33, domain),
         stars_count = COALESCE($34, stars_count),
         release_date = COALESCE($35::date, release_date),
         last_updated = COALESCE($36::timestamptz, last_updated),
         quick_facts = COALESCE(quick_facts, '{}'::jsonb) || $37::jsonb,
         updated_at = NOW()
       WHERE id = $1`,
      [
        id,
        fetchedData.name,
        fetchedData.provider,
        fetchedData.description,
        fetchedData.dataset_type,
        fetchedData.download_url,
        fetchedData.huggingface_url,
        downloadCount,
        JSON.stringify(fetchedData.categories || []),
        JSON.stringify(fetchedData.tags || []),
        JSON.stringify(fetchedData.metadata || {}),
        apply_enrichment,
        enrichment.ideal_hardware != null ? JSON.stringify(enrichment.ideal_hardware) : null,
        riskScore,
        enrichment.comparison_notes ?? null,
        externalId,
        JSON.stringify(importEnrich.ai_summary),
        JSON.stringify(importEnrich.sample_data),
        importEnrich.storage_estimate,
        importEnrich.ram_estimate,
        importEnrich.freshness_score,
        importEnrich.popularity_score,
        importEnrich.commercial_use,
        importEnrich.quality_score,
        modalityValue,
        fetchedData.size || null,
        fetchedData.rows ?? null,
        fetchedData.columns ?? null,
        languagesJson,
        fetchedData.language || null,
        fetchedData.license || null,
        fetchedData.format || null,
        fetchedData.domain || null,
        fetchedData.stars_count ?? null,
        fetchedData.release_date || null,
        fetchedData.last_updated || null,
        quickFactsJson,
      ]
    );
    invalidateDatasetDetailCache(slug);
    await pool.query(
      `INSERT INTO import_logs (source, item_type, item_id, import_status, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      ['huggingface', 'dataset', id, 'updated', JSON.stringify({ identifier, externalId })]
    );
    const row = await pool.query(`SELECT * FROM datasets WHERE id = $1`, [id]);
    const linkedModels = await autoLinkDatasetToModels({
      slug: row.rows[0].slug,
      name: row.rows[0].name,
      external_dataset_id: row.rows[0].external_dataset_id || externalId,
    });
    return { mode: 'updated' as const, dataset: row.rows[0], linked_models: linkedModels };
  }

  const result = await pool.query(
    `
    INSERT INTO datasets (
      name, slug, provider, description, dataset_type,
      download_url, huggingface_url, download_count,
      categories, tags, status, import_source, import_metadata,
      enrichment_applied, ideal_hardware, risk_score, comparison_notes,
      external_dataset_id, ai_summary, sample_data,
      storage_estimate, ram_estimate, freshness_score, popularity_score,
      commercial_use, quality_score, modality,
      size, rows, columns, languages, language, license, format, domain,
      stars_count, release_date, last_updated, quick_facts
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12,$13::jsonb,
      $14,$15,$16,$17,$18,$19::jsonb,$20::jsonb,$21,$22,$23,$24,$25,$26,$27,
      $28,$29,$30,$31::jsonb,$32,$33,$34,$35,$36,$37::date,$38::timestamptz,$39::jsonb
    )
    RETURNING *
  `,
    [
      fetchedData.name,
      fetchedData.slug,
      fetchedData.provider,
      fetchedData.description,
      fetchedData.dataset_type,
      fetchedData.download_url,
      fetchedData.huggingface_url,
      downloadCount,
      JSON.stringify(fetchedData.categories || []),
      JSON.stringify(fetchedData.tags || []),
      status === 'draft' ? 'draft' : 'published',
      'huggingface',
      JSON.stringify(fetchedData.metadata || {}),
      apply_enrichment,
      enrichment.ideal_hardware != null ? JSON.stringify(enrichment.ideal_hardware) : null,
      riskScore,
      enrichment.comparison_notes ?? null,
      externalId,
      JSON.stringify(importEnrich.ai_summary),
      JSON.stringify(importEnrich.sample_data),
      importEnrich.storage_estimate,
      importEnrich.ram_estimate,
      importEnrich.freshness_score,
      importEnrich.popularity_score,
      importEnrich.commercial_use,
      importEnrich.quality_score,
      modalityValue,
      fetchedData.size || null,
      fetchedData.rows ?? null,
      fetchedData.columns ?? null,
      languagesJson,
      fetchedData.language || null,
      fetchedData.license || null,
      fetchedData.format || null,
      fetchedData.domain || null,
      fetchedData.stars_count ?? null,
      fetchedData.release_date || null,
      fetchedData.last_updated || null,
      quickFactsJson,
    ]
  );

  await pool.query(
    `INSERT INTO import_logs (source, item_type, item_id, import_status, metadata)
     VALUES ($1, $2, $3, $4, $5)`,
    ['huggingface', 'dataset', result.rows[0].id, 'success', JSON.stringify({ identifier, externalId })]
  );

  invalidateDatasetDetailCache(result.rows[0].slug);
  const linkedModels = await autoLinkDatasetToModels({
    slug: result.rows[0].slug,
    name: result.rows[0].name,
    external_dataset_id: result.rows[0].external_dataset_id || externalId,
  });

  return { mode: 'created' as const, dataset: result.rows[0], linked_models: linkedModels };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, auto_approval = false, apply_enrichment = true, status } = body;

    if (!identifier) {
      return NextResponse.json({ error: 'Dataset identifier is required' }, { status: 400 });
    }

    const apiKey = await getHfApiKey();
    const result = await upsertHfDataset({
      identifier,
      auto_approval,
      apply_enrichment,
      apiKey,
      status: status === 'draft' ? 'draft' : 'published',
    });

    if (result.mode === 'preview') {
      return NextResponse.json({
        dataset: result.dataset,
        message: 'Dataset data fetched successfully. Ready for import.',
        enrichment_applied: apply_enrichment,
      });
    }

    return NextResponse.json({
      dataset: result.dataset,
      message:
        result.mode === 'updated'
          ? 'Dataset updated (idempotent by external_dataset_id)'
          : 'Dataset imported successfully',
      enrichment_applied: apply_enrichment,
      mode: result.mode,
      linked_models: 'linked_models' in result ? result.linked_models : 0,
    });
  } catch (error) {
    console.error('Error importing dataset from HuggingFace:', error);
    try {
      await pool.query(
        `INSERT INTO import_logs (source, item_type, import_status, error_message, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        ['huggingface', 'dataset', 'failed', (error as Error).message, JSON.stringify({ error: true })]
      );
    } catch {
      /* ignore */
    }

    return NextResponse.json(
      { error: 'Failed to import dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}

/** Cap HF download totals so they fit BIGINT (and avoid NaN). */
function sanitizeDownloadCount(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(Math.floor(n), Number.MAX_SAFE_INTEGER);
}

/** risk_score is INTEGER; clamp to a sensible 0–100 range. */
function sanitizeRiskScore(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(100, Math.max(0, Math.round(n)));
}
