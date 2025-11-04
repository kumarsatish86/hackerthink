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

// POST submit rating for a model
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { rating, review, user_id } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // First, get the model ID from the slug
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

    // Insert or update rating
    await pool.query(
      `INSERT INTO model_ratings (model_id, user_id, rating, review)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (model_id, user_id) 
       DO UPDATE SET rating = $3, review = $4, created_at = CURRENT_TIMESTAMP`,
      [modelId, user_id || null, rating, review || '']
    );

    // Recalculate average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM model_ratings WHERE model_id = $1',
      [modelId]
    );

    const avgRating = parseFloat(avgResult.rows[0].avg_rating);
    const ratingCount = parseInt(avgResult.rows[0].count);

    // Update model with new rating
    await pool.query(
      'UPDATE ai_models SET rating = $1, rating_count = $2 WHERE id = $3',
      [avgRating, ratingCount, modelId]
    );

    return NextResponse.json({
      message: 'Rating submitted successfully',
      rating: avgRating,
      count: ratingCount
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

