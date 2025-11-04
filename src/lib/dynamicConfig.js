// dynamicConfig.js
// This file contains configuration for dynamic routes

/**
 * Export these configuration objects in route files to make them dynamic
 * 
 * Example usage in a page file:
 * ```
 * export const dynamic = 'force-dynamic';
 * ```
 */

// Force dynamic rendering for routes that need fresh data on every request
export const DYNAMIC = 'force-dynamic';

// Default export for simplicity
export default {
  dynamic: DYNAMIC
};

/**
 * Fetch helper with common settings for dynamic data
 * This wrapper ensures all API calls use the right settings
 */
export async function dynamicFetch(url, options = {}) {
  const defaultOptions = {
    next: { revalidate: 0 }, // No caching by default
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Log the fetch attempt for debugging
  console.log('[dynamicFetch] Fetching URL:', url);
  
  try {
    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      }
    });
    
    console.log('[dynamicFetch] Response status:', response.status);
    return response;
  } catch (error) {
    console.error('[dynamicFetch] Fetch error:', error);
    throw error;
  }
}

/**
 * Helper to fetch site settings with dynamic configuration
 * Use this instead of direct fetches to /api/settings
 */
export async function fetchSiteSettings(keys) {
  try {
    // Define clean default keys as separate strings to avoid any hidden character issues
    const defaultKeys = [
      'site_name',
      'site_description', 
      'favicon_path'
    ];
    
    // Use provided keys or fall back to clean defaults
    const keysToUse = keys && keys.length > 0 ? keys : defaultKeys;
    
    // Clean the keys
    const cleanKeys = keysToUse.map(key => key.replace(/\s+/g, ''));
    
    // Build the query parameter
    const keysParam = cleanKeys.join(',');
    
    // Determine the base URL based on environment (server vs client)
    let baseUrl = '';
    if (typeof window !== 'undefined') {
      // Client-side: use current origin
      baseUrl = window.location.origin;
    } else {
      // Server-side: construct from environment or use localhost
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                process.env.NEXT_PUBLIC_API_URL || 
                'http://localhost:3007';
    }
    
    // Construct the full URL
    const fullUrl = `${baseUrl}/api/settings?keys=${encodeURIComponent(keysParam)}`;
    
    console.log('[fetchSiteSettings] Environment:', typeof window !== 'undefined' ? 'client' : 'server');
    console.log('[fetchSiteSettings] Base URL:', baseUrl);
    console.log('[fetchSiteSettings] Full URL:', fullUrl);
    
    const response = await dynamicFetch(fullUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch site settings: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching site settings:', error);
    
    // Return default settings as fallback
    return {
      site_name: 'HackerThink',
      site_description: 'Your comprehensive platform for AI news, tools, learning, and model training',
      favicon_path: '/favicon.ico',
    };
  }
}