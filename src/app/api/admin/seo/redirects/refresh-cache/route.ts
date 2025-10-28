import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    console.log('[Admin] Manually refreshing redirects cache...');
    
    // Force fetch from redirects-cache endpoint
    const response = await fetch('http://localhost:3000/api/redirects-cache', {
      cache: 'no-store', // Force fresh data
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to refresh redirects cache: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const redirectCount = Object.keys(data.redirects || {}).length;
    
    console.log(`[Admin] Successfully refreshed cache with ${redirectCount} redirects`);
    
    return NextResponse.json({
      message: 'Redirects cache refreshed successfully',
      count: redirectCount,
      redirects: data.redirects
    });
  } catch (error) {
    console.error('[Admin] Error refreshing redirects cache:', error);
    
    return NextResponse.json(
      { message: 'Failed to refresh redirects cache', error: String(error) },
      { status: 500 }
    );
  }
} 
