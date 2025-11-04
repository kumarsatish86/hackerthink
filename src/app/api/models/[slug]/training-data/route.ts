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

// GET training data for a specific model
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

    // Get training data from model_training_data table
    const trainingDataResult = await pool.query(
      `SELECT * FROM model_training_data 
       WHERE model_id = $1 
       ORDER BY token_count DESC NULLS LAST, dataset_name`,
      [modelId]
    );

    // Calculate totals if needed
    const totals = trainingDataResult.rows.reduce((acc: any, row: any) => {
      // Parse token count if it's a string like "1.3T" or "500B"
      const tokenStr = row.token_count || '';
      return acc; // Could parse and sum if needed
    }, {});

    return NextResponse.json({
      model_slug: slug,
      model_id: modelId,
      training_data: trainingDataResult.rows,
      total: trainingDataResult.rowCount,
      totals
    });
  } catch (error) {
    console.error('Error fetching training data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training data', details: (error as Error).message },
      { status: 500 }
    );
  }
}

