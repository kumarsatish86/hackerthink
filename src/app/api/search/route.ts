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

// GET global search across models and datasets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, models, datasets
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!q) {
      return NextResponse.json({ models: [], datasets: [] });
    }

    const results: { models: any[]; datasets: any[] } = {
      models: [],
      datasets: []
    };

    // Search models
    if (type === 'all' || type === 'models') {
      const modelResult = await pool.query(
        `SELECT id, name, slug, developer, description, model_type, rating, download_count, logo_url
         FROM ai_models
         WHERE status = 'published' AND (
           name ILIKE $1 OR
           description ILIKE $1 OR
           developer ILIKE $1
         )
         ORDER BY rating DESC, download_count DESC
         LIMIT $2`,
        [`%${q}%`, limit]
      );
      results.models = modelResult.rows;
    }

    // Search datasets
    if (type === 'all' || type === 'datasets') {
      const datasetResult = await pool.query(
        `SELECT id, name, slug, provider, description, dataset_type, rating, download_count, logo_url
         FROM datasets
         WHERE status = 'published' AND (
           name ILIKE $1 OR
           description ILIKE $1 OR
           provider ILIKE $1
         )
         ORDER BY rating DESC, download_count DESC
         LIMIT $2`,
        [`%${q}%`, limit]
      );
      results.datasets = datasetResult.rows;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

