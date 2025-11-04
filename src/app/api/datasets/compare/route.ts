import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// Helper function to parse JSONB fields
function parseJsonField(field: any) {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

// GET compare multiple datasets (by IDs or slugs)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const slugs = searchParams.get('slugs');
    
    if (!ids && !slugs) {
      return NextResponse.json(
        { error: 'Dataset IDs or slugs are required' },
        { status: 400 }
      );
    }

    let result;
    if (slugs) {
      const slugArray = slugs.split(',');
      result = await pool.query(
        `SELECT * FROM datasets WHERE slug = ANY($1::text[]) AND status = 'published'`,
        [slugArray]
      );
    } else {
      const datasetIds = ids!.split(',');
      result = await pool.query(
        `SELECT * FROM datasets WHERE id = ANY($1::uuid[]) AND status = 'published'`,
        [datasetIds]
      );
    }

    // Parse JSONB fields
    const datasets = result.rows.map(dataset => {
      dataset.features = parseJsonField(dataset.features) || [];
      dataset.split_info = parseJsonField(dataset.split_info) || {};
      dataset.languages = parseJsonField(dataset.languages) || [];
      dataset.task_types = parseJsonField(dataset.task_types) || [];
      dataset.categories = parseJsonField(dataset.categories) || [];
      dataset.tags = parseJsonField(dataset.tags) || [];
      dataset.sample_data = parseJsonField(dataset.sample_data) || {};
      dataset.schema_json = parseJsonField(dataset.schema_json) || {};
      return dataset;
    });

    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Error fetching datasets for comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets', details: (error as Error).message },
      { status: 500 }
    );
  }
}

