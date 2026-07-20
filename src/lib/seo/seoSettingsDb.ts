import { query } from '@/lib/db';

export async function getSeoSetting(key: string): Promise<string | null> {
  const { rows } = await query(
    'SELECT setting_value FROM seo_settings WHERE setting_key = $1',
    [key]
  );
  if (!rows.length) return null;
  return rows[0].setting_value == null ? null : String(rows[0].setting_value);
}

export async function upsertSeoSetting(key: string, value: string, description: string) {
  await query(
    `INSERT INTO seo_settings (setting_key, setting_value, description, created_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
    [key, value, description]
  );
}
