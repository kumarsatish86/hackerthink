import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Public endpoint to get active inquiry types
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      'SELECT id, type_name, email_recipient FROM inquiry_types WHERE is_active = TRUE ORDER BY type_name'
    );
    
    return NextResponse.json({
      inquiryTypes: result.rows
    });
  } catch (error) {
    console.error('Error fetching inquiry types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry types' },
      { status: 500 }
    );
  }
}

