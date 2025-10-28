import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Get all published roadmaps (public access)
export async function GET() {
  try {
    console.log('API: Fetching all published roadmaps...');
    
    // Get all roadmaps with basic columns first
    const result = await query(
      'SELECT id, title, slug, description FROM roadmaps ORDER BY id DESC LIMIT 10'
    );
    
    console.log(`API: Found ${result.rows.length} published roadmaps`);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    console.error('Error details:', error.message);
    
    // If database connection fails, return empty array instead of error
    // This allows the page to load with fallback data
    if (error.code === '28P01' || error.message?.includes('password authentication failed') || error.message?.includes('connection')) {
      console.log('Database connection failed, returning empty array for fallback');
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch roadmaps', message: error.message }, 
      { status: 500 }
    );
  }
}

