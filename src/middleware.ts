import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of reserved routes that should not be treated as model slugs
  const reservedRoutes = [
    '/models/category',
    '/models/compare',
    '/models/leaderboard',
    '/models/timeline',
    '/models/org',
    '/models/use-cases',
    '/models/page',
    '/models/admin',
  ];
    
  // Check if pathname matches a reserved route
  const isReservedRoute = reservedRoutes.some(route => pathname.startsWith(route));
  
  // If it's a reserved route, let it pass through
  if (isReservedRoute) {
    return NextResponse.next();
  }
  
  // For /models/[slug], we'll let Next.js handle it
  // This middleware just ensures reserved routes are not caught by [slug]
    return NextResponse.next();
}

export const config = {
  matcher: [
    '/models/:path*',
  ],
}; 
