// dynamicConfig.js
// Dynamic route helpers + fetch wrappers (client/server).

export const DYNAMIC = 'force-dynamic';

export default {
  dynamic: DYNAMIC,
};

const isDev = process.env.NODE_ENV === 'development';
const debugFetch = process.env.DEBUG_DYNAMIC_FETCH === '1';

/**
 * Fetch helper for dynamic data. Avoid using this for server→self /api/settings
 * (prefer getSiteSettingsFromDb / fetchSiteSettings which use DB on the server).
 */
export async function dynamicFetch(url, options = {}) {
  const defaultOptions = {
    next: { revalidate: 60 },
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (debugFetch) {
    console.log('[dynamicFetch] Fetching URL:', url);
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (debugFetch) {
      console.log('[dynamicFetch] Response status:', response.status);
    }
    return response;
  } catch (error) {
    console.error('[dynamicFetch] Fetch error:', error);
    throw error;
  }
}

/**
 * Fetch site settings. On the server this queries Postgres directly (no HTTP loopback).
 * On the client it calls /api/settings once.
 */
export async function fetchSiteSettings(keys) {
  const defaultKeys = ['site_name', 'site_description', 'favicon_path'];
  const keysToUse = keys && keys.length > 0 ? keys : defaultKeys;
  const cleanKeys = keysToUse.map((key) => String(key).replace(/\s+/g, ''));

  // Server: never HTTP-loopback to ourselves — that floods the terminal on every RSC render.
  if (typeof window === 'undefined') {
    try {
      const { getSiteSettingsFromDb } = await import('@/lib/siteSettings');
      return await getSiteSettingsFromDb(cleanKeys);
    } catch (error) {
      console.error('Error fetching site settings (db):', error);
      return {
        site_name: 'HackerThink',
        site_description: 'Your comprehensive platform for AI news, tools, learning, and model training',
        favicon_path: '/favicon.ico',
      };
    }
  }

  try {
    const keysParam = cleanKeys.join(',');
    const fullUrl = `/api/settings?keys=${encodeURIComponent(keysParam)}`;
    if (debugFetch || isDev === false) {
      /* quiet in normal client use */
    }
    const response = await dynamicFetch(fullUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch site settings: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return {
      site_name: 'HackerThink',
      site_description: 'Your comprehensive platform for AI news, tools, learning, and model training',
      favicon_path: '/favicon.ico',
    };
  }
}
