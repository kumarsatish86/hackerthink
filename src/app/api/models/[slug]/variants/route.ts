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

// GET variants for a specific model
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

    // Get variants where this model is the parent
    const variantsResult = await pool.query(
      `SELECT v.*, m.name as variant_name, m.slug as variant_slug, m.model_type, m.parameters,
              m.logo_url, m.developer, m.rating, m.download_count
       FROM model_variants v
       JOIN ai_models m ON v.variant_model_id = m.id
       WHERE v.parent_model_id = $1 AND m.status = 'published'
       ORDER BY v.variant_type, m.name`,
      [modelId]
    );

    // Get parent models where this model is a variant
    const parentsResult = await pool.query(
      `SELECT v.*, m.name as parent_name, m.slug as parent_slug, m.model_type, m.parameters,
              m.logo_url, m.developer, m.rating, m.download_count
       FROM model_variants v
       JOIN ai_models m ON v.parent_model_id = m.id
       WHERE v.variant_model_id = $1 AND m.status = 'published'
       ORDER BY v.variant_type, m.name`,
      [modelId]
    );

    return NextResponse.json({
      model_slug: slug,
      model_id: modelId,
      variants: variantsResult.rows,
      parent_models: parentsResult.rows,
      variants_count: variantsResult.rowCount,
      parents_count: parentsResult.rowCount
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch variants', details: (error as Error).message },
      { status: 500 }
    );
  }
}

