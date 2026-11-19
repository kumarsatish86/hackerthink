import { query, queryOne } from '@/lib/db';

export const ASSET_STORAGE_PROVIDER = 'other';
export const ASSET_STORAGE_TYPE = 'asset_storage';
export const ASSET_STORAGE_NAME = 'Database Asset Storage';

/**
 * When enabled: logo/favicon (and similar) are stored in Postgres (good for
 * serverless hosts like Vercel where the filesystem is ephemeral).
 * When disabled (default): files are written under /public for normal VPS hosting.
 */
export async function ensureAssetStorageIntegration() {
  try {
    const existing = await queryOne(
      `SELECT id, status, config FROM integrations
       WHERE provider = $1 AND type = $2
       LIMIT 1`,
      [ASSET_STORAGE_PROVIDER, ASSET_STORAGE_TYPE]
    );
    if (existing) return existing;

    const inserted = await query(
      `INSERT INTO integrations (provider, type, name, status, config)
       VALUES ($1, $2, $3, false, $4::jsonb)
       RETURNING id, status, config`,
      [
        ASSET_STORAGE_PROVIDER,
        ASSET_STORAGE_TYPE,
        ASSET_STORAGE_NAME,
        JSON.stringify({
          mode: 'database',
          notes:
            'Enable only on hosts without persistent disk (e.g. Vercel). Leave off for VPS/local servers.',
        }),
      ]
    );
    return inserted.rows[0];
  } catch (error) {
    console.error('ensureAssetStorageIntegration:', error);
    return null;
  }
}

export async function isDatabaseAssetStorageEnabled(): Promise<boolean> {
  try {
    await ensureAssetStorageIntegration();
    const row = await queryOne(
      `SELECT status FROM integrations
       WHERE provider = $1 AND type = $2
       LIMIT 1`,
      [ASSET_STORAGE_PROVIDER, ASSET_STORAGE_TYPE]
    );
    return Boolean(row?.status);
  } catch (error) {
    console.error('isDatabaseAssetStorageEnabled:', error);
    // Fail safe for normal servers: use local filesystem
    return false;
  }
}
