import { Pool } from 'pg';
import { HuggingFaceService } from '@/services/import/HuggingFaceService';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export function modelIdToSlug(modelId: string): string {
  return modelId.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'http://localhost:3007'
  );
}

export async function getHuggingFaceApiKey(): Promise<string | undefined> {
  try {
    const settingsResult = await pool.query(
      `SELECT api_key FROM import_settings WHERE source_name = $1 AND enabled = true`,
      ['huggingface']
    );
    return settingsResult.rows[0]?.api_key || undefined;
  } catch {
    return undefined;
  }
}

export async function getExistingModelSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set();
  const result = await pool.query(
    `SELECT slug FROM ai_models WHERE slug = ANY($1::text[])`,
    [slugs]
  );
  return new Set(result.rows.map((row: { slug: string }) => row.slug));
}

export async function importHuggingFaceModelViaApi(
  identifier: string,
  options: { auto_approval?: boolean; apply_enrichment?: boolean } = {}
): Promise<{ ok: boolean; status: number; message: string; model?: any }> {
  const baseUrl = getAppBaseUrl();
  const response = await fetch(`${baseUrl}/api/admin/import/models/huggingface`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier,
      auto_approval: options.auto_approval ?? false,
      apply_enrichment: options.apply_enrichment ?? true,
    }),
  });

  let payload: any = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    message: payload?.message || payload?.error || payload?.details || response.statusText,
    model: payload?.model,
  };
}

export async function discoverHuggingFaceModelIds(options: {
  sort?: 'downloads' | 'likes' | 'createdAt' | 'lastModified' | 'trending';
  limit?: number;
  pipeline_tag?: string;
  search?: string;
  skipExisting?: boolean;
}): Promise<{ ids: string[]; skippedExisting: number }> {
  const apiKey = await getHuggingFaceApiKey();
  const hf = new HuggingFaceService(apiKey);
  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);

  const models = await hf.searchModels({
    sort: options.sort || 'downloads',
    limit,
    pipeline_tag: options.pipeline_tag || undefined,
    search: options.search || undefined,
  });

  const ids = models
    .map((m: any) => m.modelId || m.id)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

  if (!options.skipExisting) {
    return { ids, skippedExisting: 0 };
  }

  const slugs = ids.map(modelIdToSlug);
  const existing = await getExistingModelSlugs(slugs);
  const filtered = ids.filter((id) => !existing.has(modelIdToSlug(id)));

  return {
    ids: filtered,
    skippedExisting: ids.length - filtered.length,
  };
}

export async function runBulkHuggingFaceImport(options: {
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
  results: Array<{ identifier: string; status: 'imported' | 'updated' | 'skipped' | 'failed'; message: string }>;
}> {
  const uniqueIds = Array.from(
    new Set(
      options.identifiers
        .map((id) => id.trim())
        .filter(Boolean)
        .map((id) => id.replace(/^https?:\/\/huggingface\.co\//, ''))
    )
  ).slice(0, 100);

  const results: Array<{
    identifier: string;
    status: 'imported' | 'updated' | 'skipped' | 'failed';
    message: string;
  }> = [];

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  const existing = options.skipExisting
    ? await getExistingModelSlugs(uniqueIds.map(modelIdToSlug))
    : new Set<string>();

  for (const identifier of uniqueIds) {
    const slug = modelIdToSlug(identifier);

    if (options.skipExisting && existing.has(slug)) {
      skipped += 1;
      results.push({
        identifier,
        status: 'skipped',
        message: 'Already exists in database',
      });
      continue;
    }

    try {
      const existedBefore = existing.has(slug);
      const result = await importHuggingFaceModelViaApi(identifier, {
        auto_approval: options.auto_approval,
        apply_enrichment: options.apply_enrichment,
      });

      if (!result.ok) {
        failed += 1;
        results.push({
          identifier,
          status: 'failed',
          message: result.message || 'Import failed',
        });
      } else if (existedBefore) {
        updated += 1;
        results.push({
          identifier,
          status: 'updated',
          message: result.message || 'Updated existing model',
        });
      } else {
        imported += 1;
        existing.add(slug);
        results.push({
          identifier,
          status: 'imported',
          message: result.message || 'Imported successfully',
        });
      }
    } catch (error: any) {
      failed += 1;
      results.push({
        identifier,
        status: 'failed',
        message: error?.message || 'Unexpected import error',
      });
    }

    if (options.delayMs && options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
  }

  return {
    total: uniqueIds.length,
    imported,
    updated,
    skipped,
    failed,
    results,
  };
}

export async function updateHuggingFaceSyncStatus(payload: {
  sync_status: string;
  error_log?: string | null;
  touchLastSync?: boolean;
  filters?: any;
}): Promise<void> {
  const fields = [
    'sync_status = $1',
    'error_log = $2',
    'updated_at = CURRENT_TIMESTAMP',
  ];
  const values: any[] = [payload.sync_status, payload.error_log ?? null];

  if (payload.touchLastSync) {
    fields.push('last_sync = CURRENT_TIMESTAMP');
  }
  if (payload.filters !== undefined) {
    values.push(JSON.stringify(payload.filters));
    fields.push(`filters = $${values.length}`);
  }

  values.push('huggingface');
  await pool.query(
    `UPDATE import_settings SET ${fields.join(', ')} WHERE source_name = $${values.length}`,
    values
  );
}

export async function ensureHuggingFaceImportSettings() {
  const existing = await pool.query(
    `SELECT * FROM import_settings WHERE source_name = $1`,
    ['huggingface']
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const created = await pool.query(
    `INSERT INTO import_settings
      (source_name, enabled, auto_approval, import_limit, import_interval, schedule_cron, filters, sync_status)
     VALUES ($1, false, false, 20, 'daily', '0 */6 * * *', $2, 'idle')
     RETURNING *`,
    [
      'huggingface',
      JSON.stringify({
        sort: 'createdAt',
        pipeline_tag: '',
        apply_enrichment: true,
      }),
    ]
  );

  return created.rows[0];
}

export async function runHuggingFaceAutoSync(options: {
  force?: boolean;
  limitOverride?: number;
} = {}) {
  const settings = await ensureHuggingFaceImportSettings();

  if (!options.force && !settings.enabled) {
    return {
      skipped: true,
      message: 'HuggingFace auto-sync is disabled in import settings.',
      settings,
    };
  }

  const filters =
    typeof settings.filters === 'string'
      ? JSON.parse(settings.filters || '{}')
      : settings.filters || {};

  const limit = Math.min(
    Math.max(Number(options.limitOverride || settings.import_limit || 20), 1),
    50
  );

  await updateHuggingFaceSyncStatus({
    sync_status: 'running',
    error_log: null,
    filters,
  });

  try {
    const discovered = await discoverHuggingFaceModelIds({
      sort: filters.sort || 'createdAt',
      limit,
      pipeline_tag: filters.pipeline_tag || undefined,
      search: filters.search || undefined,
      skipExisting: true,
    });

    if (discovered.ids.length === 0) {
      await updateHuggingFaceSyncStatus({
        sync_status: 'success',
        touchLastSync: true,
        error_log: null,
        filters,
      });

      return {
        skipped: false,
        message: `No new models found (${discovered.skippedExisting} already imported).`,
        summary: {
          total: 0,
          imported: 0,
          updated: 0,
          skipped: discovered.skippedExisting,
          failed: 0,
        },
        settings,
      };
    }

    const summary = await runBulkHuggingFaceImport({
      identifiers: discovered.ids,
      auto_approval: Boolean(settings.auto_approval),
      apply_enrichment: filters.apply_enrichment !== false,
      skipExisting: false,
      delayMs: 500,
    });

    await updateHuggingFaceSyncStatus({
      sync_status: summary.failed > 0 ? 'partial' : 'success',
      touchLastSync: true,
      error_log:
        summary.failed > 0
          ? `${summary.failed} model(s) failed during auto-sync`
          : null,
      filters,
    });

    return {
      skipped: false,
      message: `Auto-sync finished: ${summary.imported} imported, ${summary.failed} failed.`,
      summary: {
        ...summary,
        skipped: summary.skipped + discovered.skippedExisting,
      },
      results: summary.results,
      settings,
    };
  } catch (error: any) {
    await updateHuggingFaceSyncStatus({
      sync_status: 'error',
      error_log: error?.message || 'Auto-sync failed',
      filters,
    });
    throw error;
  }
}
