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

// GET compare multiple models (by IDs or slugs)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const slugs = searchParams.get('slugs');
    
    if (!ids && !slugs) {
      return NextResponse.json(
        { error: 'Model IDs or slugs are required' },
        { status: 400 }
      );
    }

    let result;
    if (slugs) {
      const slugArray = slugs.split(',');
      result = await pool.query(
        `SELECT * FROM ai_models WHERE slug = ANY($1::text[]) AND status = 'published'`,
        [slugArray]
      );
    } else {
      const modelIds = ids!.split(',');
      result = await pool.query(
        `SELECT * FROM ai_models WHERE id = ANY($1::uuid[]) AND status = 'published'`,
        [modelIds]
      );
    }

    // Parse JSONB fields
    const models = result.rows.map(model => {
      const parseJson = (field: any) => {
        if (!field) return null;
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return field;
          }
        }
        return field;
      };

      model.capabilities = parseJson(model.capabilities) || [];
      model.categories = parseJson(model.categories) || [];
      model.tags = parseJson(model.tags) || [];
      model.benchmarks = parseJson(model.benchmarks) || {};
      model.community_stats = parseJson(model.community_stats) || {};
      model.github_stats = parseJson(model.github_stats) || {};

      return model;
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models for comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', details: (error as Error).message },
      { status: 500 }
    );
  }
}

