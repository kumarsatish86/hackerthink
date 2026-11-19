import { query, queryOne } from '@/lib/db';

export type SiteAssetKey = 'logo' | 'favicon' | 'footer_logo';

export type SiteAssetRow = {
  asset_key: string;
  mime_type: string;
  data: Buffer;
  updated_at: Date;
};

let ensured = false;

export async function ensureSiteAssetsTable() {
  if (ensured) return;
  await query(`
    CREATE TABLE IF NOT EXISTS site_assets (
      asset_key VARCHAR(50) PRIMARY KEY,
      mime_type VARCHAR(100) NOT NULL,
      data BYTEA NOT NULL,
      original_filename VARCHAR(255),
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    )
  `);
  ensured = true;
}

export async function upsertSiteAsset(
  key: SiteAssetKey,
  mimeType: string,
  data: Buffer,
  originalFilename?: string
) {
  await ensureSiteAssetsTable();
  await query(
    `
    INSERT INTO site_assets (asset_key, mime_type, data, original_filename, updated_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    ON CONFLICT (asset_key) DO UPDATE SET
      mime_type = EXCLUDED.mime_type,
      data = EXCLUDED.data,
      original_filename = EXCLUDED.original_filename,
      updated_at = CURRENT_TIMESTAMP
    `,
    [key, mimeType, data, originalFilename || null]
  );
}

export async function getSiteAsset(key: SiteAssetKey): Promise<SiteAssetRow | null> {
  await ensureSiteAssetsTable();
  const row = await queryOne(
    `SELECT asset_key, mime_type, data, updated_at FROM site_assets WHERE asset_key = $1`,
    [key]
  );
  if (!row) return null;
  return {
    asset_key: row.asset_key,
    mime_type: row.mime_type,
    data: Buffer.isBuffer(row.data) ? row.data : Buffer.from(row.data),
    updated_at: row.updated_at,
  };
}

/** Public URL stored in site_settings; cache-bust with timestamp. */
export function siteAssetPublicUrl(key: SiteAssetKey, versionMs = Date.now()) {
  return `/api/site-assets/${key}?v=${versionMs}`;
}
