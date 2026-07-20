import { query } from '@/lib/db';
import { SEO_TXT_CONFIG, type SeoTxtKind } from '@/lib/seo/txtFileConfig';

export type { SeoTxtKind };
export { SEO_TXT_CONFIG };

export async function getSeoTxtContent(kind: SeoTxtKind): Promise<string> {
  const { settingKey, defaultValue } = SEO_TXT_CONFIG[kind];
  try {
    const { rows } = await query(
      'SELECT setting_value FROM seo_settings WHERE setting_key = $1',
      [settingKey]
    );
    if (rows.length === 0 || rows[0].setting_value == null) {
      return defaultValue;
    }
    return String(rows[0].setting_value);
  } catch (error) {
    console.error(`Error reading seo_settings.${settingKey}:`, error);
    return defaultValue;
  }
}

export async function upsertSeoTxtContent(kind: SeoTxtKind, value: string): Promise<void> {
  const { settingKey, title } = SEO_TXT_CONFIG[kind];
  const description = `${title.replace(/^Edit /, '')} content`;
  await query(
    `INSERT INTO seo_settings (setting_key, setting_value, description, created_at, updated_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
    [settingKey, value, description]
  );
}

export function plainTextResponse(body: string, maxAgeSeconds = 3600) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAgeSeconds}`,
    },
  });
}
