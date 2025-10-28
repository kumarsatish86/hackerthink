import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Adding roadmap enhancement columns...');
    
    // Add new columns to roadmaps table
    const alterQueries = [
      // SEO Settings
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS seo_title TEXT',
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS seo_description TEXT',
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS seo_keywords TEXT',
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS schema_json TEXT',
      
      // Content Sections
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS prerequisites TEXT',
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS career_outcomes TEXT',
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS related_roadmaps TEXT',
      'ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS progress_tracking TEXT'
    ];

    for (const queryText of alterQueries) {
      try {
        await query(queryText);
        console.log(`Executed: ${queryText}`);
      } catch (error) {
        console.error(`Error executing ${queryText}:`, error);
        // Continue with other queries even if one fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Roadmap enhancement columns added successfully' 
    });

  } catch (error) {
    console.error('Error adding roadmap enhancement columns:', error);
    return NextResponse.json(
      { error: 'Failed to add roadmap enhancement columns', details: error.message },
      { status: 500 }
    );
  }
}

