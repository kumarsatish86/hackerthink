import { Pool } from 'pg';
import { HuggingFaceService } from '@/services/import/HuggingFaceService';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const HF_DATASETS_SOURCE = 'huggingface_datasets';

export function datasetIdToSlug(datasetId: string): string {
  return datasetId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export async function getHuggingFaceApiKey(): Promise<string | undefined> {
  try {
    const result = await pool.query(
      `SELECT api_key FROM import_settings
       WHERE source_name = ANY($1::text[]) AND api_key IS NOT NULL AND api_key <> ''
       ORDER BY CASE WHEN source_name = $2 THEN 0 ELSE 1 END
       LIMIT 1`,
      [[HF_DATASETS_SOURCE, 'huggingface'], HF_DATASETS_SOURCE]
    );
    return result.rows[0]?.api_key || undefined;
  } catch {
    return undefined;
  }
}

export async function getExistingDatasetKeys(ids: string[]): Promise<{
  bySlug: Set<string>;
  byExternal: Set<string>;
}> {
  if (!ids.length) return { bySlug: new Set(), byExternal: new Set() };
  const slugs = ids.map(datasetIdToSlug);
  const externals = ids.map((id) => `hf:${id}`);
  const result = await pool.query(
    `SELECT slug, external_dataset_id FROM datasets
     WHERE slug = ANY($1::text[]) OR external_dataset_id = ANY($2::text[])`,
    [slugs, externals]
  );
  return {
    bySlug: new Set(result.rows.map((r: { slug: string }) => r.slug)),
    byExternal: new Set(
      result.rows
        .map((r: { external_dataset_id?: string }) => r.external_dataset_id)
        .filter(Boolean) as string[]
    ),
  };
}

export async function discoverHuggingFaceDatasetIds(options: {
  sort?: 'downloads' | 'likes' | 'createdAt' | 'lastModified' | 'trending';
  limit?: number;
  search?: string;
  filter?: string;
  skipExisting?: boolean;
}): Promise<{ ids: string[]; skippedExisting: number }> {
  const apiKey = await getHuggingFaceApiKey();
  const hf = new HuggingFaceService(apiKey);
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);

  const datasets = await hf.searchDatasets({
    sort: options.sort || 'downloads',
    limit,
    search: options.search || undefined,
    filter: options.filter || undefined,
  });

  const ids = datasets
    .map((d: any) => d.id || d.datasetId)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

  if (!options.skipExisting) {
    return { ids, skippedExisting: 0 };
  }

  const existing = await getExistingDatasetKeys(ids);
  const filtered = ids.filter((id) => {
    const slug = datasetIdToSlug(id);
    return !existing.bySlug.has(slug) && !existing.byExternal.has(`hf:${id}`);
  });

  return {
    ids: filtered,
    skippedExisting: ids.length - filtered.length,
  };
}

export type BulkDatasetResultItem = {
  identifier: string;
  status: 'imported' | 'updated' | 'skipped' | 'failed';
  message: string;
  slug?: string;
};

async function callUpsert(opts: {
  identifier: string;
  auto_approval?: boolean;
  apply_enrichment?: boolean;
  apiKey?: string;
  status?: 'draft' | 'published';
}) {
  const mod = await import('@/app/api/admin/import/datasets/huggingface/route');
  return mod.upsertHfDataset(opts);
}

export async function runBulkHuggingFaceDatasetImport(options: {
  identifiers: string[];
  auto_approval?: boolean;
  apply_enrichment?: boolean;
  skipExisting?: boolean;
  delayMs?: number;
}): Promise<{
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  results: BulkDatasetResultItem[];
}> {
  const identifiers = options.identifiers
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 100);

  const apiKey = await getHuggingFaceApiKey();
  const results: BulkDatasetResultItem[] = [];
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  let existing = { bySlug: new Set<string>(), byExternal: new Set<string>() };
  if (options.skipExisting) {
    existing = await getExistingDatasetKeys(identifiers);
  }

  for (const identifier of identifiers) {
    const slug = datasetIdToSlug(identifier);
    const externalId = `hf:${identifier}`;

    if (
      options.skipExisting &&
      (existing.bySlug.has(slug) || existing.byExternal.has(externalId))
    ) {
      skipped += 1;
      results.push({
        identifier,
        status: 'skipped',
        message: 'Already exists in catalog',
        slug,
      });
      continue;
    }

    try {
      const result = await callUpsert({
        identifier,
        auto_approval: true,
        apply_enrichment: options.apply_enrichment !== false,
        apiKey,
        status: options.auto_approval === false ? 'draft' : 'published',
      });

      if (result.mode === 'preview') {
        failed += 1;
        results.push({
          identifier,
          status: 'failed',
          message: 'Import returned preview only',
        });
      } else if (result.mode === 'updated') {
        updated += 1;
        results.push({
          identifier,
          status: 'updated',
          message: 'Updated existing dataset',
          slug: result.dataset?.slug,
        });
      } else {
        imported += 1;
        results.push({
          identifier,
          status: 'imported',
          message: 'Imported successfully',
          slug: result.dataset?.slug,
        });
      }
    } catch (err) {
      failed += 1;
      results.push({
        identifier,
        status: 'failed',
        message: (err as Error).message || 'Import failed',
      });
    }

    const delay = Math.min(Math.max(options.delayMs ?? 400, 0), 5000);
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  return {
    total: identifiers.length,
    imported,
    updated,
    skipped,
    failed,
    results,
  };
}

function parseFilters(raw: unknown) {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw || '{}');
    } catch {
      return {};
    }
  }
  return raw as Record<string, unknown>;
}

export async function ensureHuggingFaceDatasetImportSettings() {
  const existing = await pool.query(
    `SELECT * FROM import_settings WHERE source_name = $1 LIMIT 1`,
    [HF_DATASETS_SOURCE]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const created = await pool.query(
    `INSERT INTO import_settings
      (source_name, enabled, auto_approval, import_limit, import_interval, schedule_cron, filters, sync_status)
     VALUES ($1, false, false, 20, 'every_6_hours', '0 */6 * * *', $2, 'idle')
     RETURNING *`,
    [
      HF_DATASETS_SOURCE,
      JSON.stringify({
        sort: 'createdAt',
        search: '',
        filter: '',
        apply_enrichment: true,
      }),
    ]
  );

  return created.rows[0];
}

export async function updateHuggingFaceDatasetSyncStatus(options: {
  sync_status: string;
  error_log?: string | null;
  touchLastSync?: boolean;
  filters?: Record<string, unknown>;
}) {
  await pool.query(
    `UPDATE import_settings SET
       sync_status = $2,
       error_log = $3,
       last_sync = CASE WHEN $4 THEN CURRENT_TIMESTAMP ELSE last_sync END,
       filters = COALESCE($5::jsonb, filters),
       updated_at = CURRENT_TIMESTAMP
     WHERE source_name = $1`,
    [
      HF_DATASETS_SOURCE,
      options.sync_status,
      options.error_log ?? null,
      Boolean(options.touchLastSync),
      options.filters ? JSON.stringify(options.filters) : null,
    ]
  );
}

export async function runHuggingFaceDatasetAutoSync(options: {
  force?: boolean;
  limitOverride?: number;
} = {}) {
  const settings = await ensureHuggingFaceDatasetImportSettings();

  if (!options.force && !settings.enabled) {
    return {
      skipped: true,
      message: 'HuggingFace dataset auto-sync is disabled in import settings.',
      settings,
    };
  }

  const filters = parseFilters(settings.filters);
  const limit = Math.min(
    Math.max(Number(options.limitOverride || settings.import_limit || 20), 1),
    50
  );

  await updateHuggingFaceDatasetSyncStatus({
    sync_status: 'running',
    error_log: null,
    filters,
  });

  try {
    const discovered = await discoverHuggingFaceDatasetIds({
      sort: (filters.sort as any) || 'createdAt',
      limit,
      search: (filters.search as string) || undefined,
      filter: (filters.filter as string) || undefined,
      skipExisting: true,
    });

    if (discovered.ids.length === 0) {
      await updateHuggingFaceDatasetSyncStatus({
        sync_status: 'success',
        touchLastSync: true,
        error_log: null,
        filters,
      });

      return {
        skipped: false,
        message: `No new datasets found (${discovered.skippedExisting} already imported).`,
        summary: {
          total: 0,
          imported: 0,
          updated: 0,
          skipped: discovered.skippedExisting,
          failed: 0,
        },
      };
    }

    const summary = await runBulkHuggingFaceDatasetImport({
      identifiers: discovered.ids,
      auto_approval: Boolean(settings.auto_approval),
      apply_enrichment: filters.apply_enrichment !== false,
      skipExisting: false,
      delayMs: 400,
    });

    await updateHuggingFaceDatasetSyncStatus({
      sync_status: 'success',
      touchLastSync: true,
      error_log: null,
      filters,
    });

    return {
      skipped: false,
      message: `Dataset sync finished: ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped + discovered.skippedExisting} skipped, ${summary.failed} failed.`,
      summary: {
        ...summary,
        skipped: summary.skipped + discovered.skippedExisting,
      },
      results: summary.results,
    };
  } catch (error) {
    await updateHuggingFaceDatasetSyncStatus({
      sync_status: 'error',
      error_log: (error as Error).message,
      filters,
    });
    throw error;
  }
}
