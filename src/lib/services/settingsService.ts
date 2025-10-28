/**
 * Get site settings by keys
 * @param keys Array of setting keys to retrieve
 * @returns Object with settings as key-value pairs
 */
import { dynamicFetch } from '@/lib/dynamicConfig';

export async function getSiteSettings(keys: string[] = []): Promise<Record<string, string>> {
  try {
    const queryParams = keys.length > 0 ? `?keys=${keys.join(',')}` : '';
    // Get the base URL - ensure it works in both browser and server environments
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    
    // Use dynamicFetch instead of direct fetch with no-store
    const response = await dynamicFetch(`${baseUrl}/api/settings${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }
    
    const settings = await response.json();
    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    
    // Return default values in case of error
    const defaults: Record<string, string> = {
      site_name: 'Linux Concept',
      site_description: 'Learn Linux concepts, scripts, and tutorials',
      favicon_path: '/favicon.ico'
    };
    
    // Only return the requested keys or all defaults
    if (keys.length > 0) {
      return keys.reduce((acc, key) => {
        acc[key] = defaults[key] || '';
        return acc;
      }, {} as Record<string, string>);
    }
    
    return defaults;
  }
}

/**
 * Save site settings
 * @param settings Object with settings as key-value pairs
 * @returns Success status
 */
export async function saveSiteSettings(settings: Record<string, string>): Promise<boolean> {
  try {
    // Get the base URL - ensure it works in both browser and server environments
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
    
    // Use dynamicFetch instead of direct fetch
    const response = await dynamicFetch(`${baseUrl}/api/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save settings: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error saving site settings:', error);
    return false;
  }
}

/**
 * Get a single setting value
 * @param key Setting key
 * @param defaultValue Default value if setting is not found
 * @returns Setting value or default value
 */
export async function getSiteSetting(key: string, defaultValue: string = ''): Promise<string> {
  try {
    const settings = await getSiteSettings([key]);
    return settings[key] || defaultValue;
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return defaultValue;
  }
} 