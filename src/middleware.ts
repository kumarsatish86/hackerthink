import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cache for redirects to minimize API calls
let redirectsCache: { [key: string]: { target: string; type: number } } = {};
let lastCacheUpdate = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds in milliseconds (reduced from 5 minutes for testing)

async function loadRedirects() {
  try {
    // Skip loading if cache is still fresh
    const now = Date.now();
    if (now - lastCacheUpdate < CACHE_TTL && Object.keys(redirectsCache).length > 0) {
      return;
    }
    
    // Always use localhost in server-side middleware context
    // The server doesn't know about the Nginx proxy
    console.log('[Middleware] Fetching redirects from API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('http://localhost:3000/api/redirects-cache', {
      signal: controller.signal
    }).catch(err => {
      console.error('[Middleware] Error fetching redirects:', err);
      return null;
    });
    
    clearTimeout(timeoutId);
    
    if (!response || !response.ok) {
      console.error(`[Middleware] Failed to fetch redirects: ${response?.status} ${response?.statusText}`);
      // Don't throw, just use existing cache or fallback
      return;
    }
    
    const data = await response.json();
    
    // Update the cache
    redirectsCache = data.redirects || {};
    lastCacheUpdate = now;
    console.log(`[Middleware] Loaded ${Object.keys(redirectsCache).length} redirects into cache`);
  } catch (error) {
    console.error('[Middleware] Error loading redirects:', error);
    // On error, keep using existing cache
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  
  console.log(`[Middleware] Processing request for: ${pathname}`);
  
  // Skip for assets, api routes, admin routes, etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') || // Skip redirect check for admin routes
    pathname.includes('.') // Files like images, CSS, etc.
  ) {
    return NextResponse.next();
  }
  
  try {
    // Load redirects from the database via our API
    await loadRedirects();
    
    // Add the user's testing redirect as a backup if it's not in the cache
    if (!redirectsCache['/testing'] && pathname === '/testing') {
      redirectsCache['/testing'] = { target: '/no-reply', type: 301 };
    }
    
    // Check if we have a redirect for this path
    const redirect = redirectsCache[pathname];
    
    if (redirect) {
      console.log(`[Middleware] Redirecting ${pathname} to ${redirect.target} (${redirect.type})`);
      
      // Handle URL and path redirects differently
      if (redirect.target.startsWith('http')) {
        // External URL redirect
        return NextResponse.redirect(redirect.target, redirect.type);
      } else {
        // Internal path redirect
        url.pathname = redirect.target;
        return NextResponse.redirect(url, redirect.type);
      }
    } else {
      console.log(`[Middleware] No redirect found for: ${pathname}`);
    }
    
    // No redirect found, continue to the application
    return NextResponse.next();
  } catch (error) {
    console.error('[Middleware] Error in redirect middleware:', error);
    return NextResponse.next();
  }
}

// Run middleware on all routes
export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}; 