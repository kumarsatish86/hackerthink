/**
 * Site settings helpers — prefer direct DB on the server (no HTTP loopback).
 */
import { query } from '@/lib/db';
import { toServableSiteAssetPath } from '@/lib/siteAssetPath';

const DEFAULTS: Record<string, string> = {
  site_name: 'HackerThink',
  site_description: 'Your comprehensive platform for AI news, tools, learning, and model training',
  favicon_path: '/api/site-favicon',
};

const ASSET_KEYS = new Set(['logo_path', 'favicon_path', 'footer_logo_path']);

function normalizeSettings(settings: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...settings };
  for (const key of ASSET_KEYS) {
    if (out[key]) out[key] = toServableSiteAssetPath(out[key]);
  }
  return out;
}

type CacheEntry = { expires: number; value: Record<string, string> };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 60_000;

function cacheKey(keys: string[]) {
  return keys.slice().sort().join(',') || '__all__';
}

export function invalidateSiteSettingsCache() {
  cache.clear();
}

/** Server-safe settings read (DB). Use this from layouts / generateMetadata. */
export async function getSiteSettingsFromDb(keys: string[] = []): Promise<Record<string, string>> {
  const key = cacheKey(keys);
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  try {
    let sql = `SELECT setting_key, setting_value FROM site_settings`;
    const params: string[] = [];
    if (keys.length > 0) {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      sql += ` WHERE setting_key IN (${placeholders})`;
      params.push(...keys);
    }
    const { rows } = await query<{ setting_key: string; setting_value: string }>(sql, params);
    const settings: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) {
      if (row.setting_key) settings[row.setting_key] = row.setting_value;
    }
    if (keys.length > 0) {
      const filtered: Record<string, string> = {};
      for (const k of keys) filtered[k] = settings[k] ?? DEFAULTS[k] ?? '';
      const normalized = normalizeSettings(filtered);
      cache.set(key, { expires: Date.now() + TTL_MS, value: normalized });
      return normalized;
    }
    const normalized = normalizeSettings(settings);
    cache.set(key, { expires: Date.now() + TTL_MS, value: normalized });
    return normalized;
  } catch (error) {
    console.error('[getSiteSettingsFromDb]', error);
    if (keys.length > 0) {
      return keys.reduce(
        (acc, k) => {
          acc[k] = DEFAULTS[k] || '';
          return acc;
        },
        {} as Record<string, string>
      );
    }
    return { ...DEFAULTS };
  }
}
