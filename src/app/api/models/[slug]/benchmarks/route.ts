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

// GET benchmarks for a specific model
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // First get the model ID
    const modelResult = await pool.query(
      `SELECT id FROM ai_models WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    if (modelResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    const modelId = modelResult.rows[0].id;

    // Get benchmarks from model_benchmarks table
    const benchmarksResult = await pool.query(
      `SELECT * FROM model_benchmarks 
       WHERE model_id = $1 
       ORDER BY category, benchmark_name`,
      [modelId]
    );

    return NextResponse.json({
      model_slug: slug,
      model_id: modelId,
      benchmarks: benchmarksResult.rows,
      total: benchmarksResult.rowCount
    });
  } catch (error) {
    console.error('Error fetching benchmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmarks', details: (error as Error).message },
      { status: 500 }
    );
  }
}

