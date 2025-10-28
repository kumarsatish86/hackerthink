/**
 * Gets the base URL of the site from environment variables
 * Falls back to localhost:3000 in development and a custom domain in production
 */
export function getSiteUrl(): string {
  // First, try to get from environment variables
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;
  
  // In production, use a default domain for your site (change to your actual domain)
  if (process.env.NODE_ENV === 'production') {
    return 'https://ainews.com';
  }
  
  // In development, use localhost
  return 'http://localhost:3000';
} 