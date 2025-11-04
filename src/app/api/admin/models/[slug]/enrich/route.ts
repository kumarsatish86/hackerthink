import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { ModelEnrichmentService } from '@/services/enrichment/ModelEnrichmentService';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

const enrichmentService = new ModelEnrichmentService();

// POST enrich a single model by slug
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // First get the model ID from slug
    const modelResult = await pool.query(
      'SELECT id FROM ai_models WHERE slug = $1',
      [slug]
    );

    if (modelResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    const modelId = modelResult.rows[0].id;
    const result = await enrichmentService.enrichModel(modelId);

    return NextResponse.json({
      success: result.success,
      updated_fields: result.updated_fields,
      github_stats: result.github_stats,
      community_stats: result.community_stats,
      errors: result.errors,
      message: `Model ${slug} enrichment completed`
    });
  } catch (error) {
    console.error('Error enriching model:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enrich model', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

