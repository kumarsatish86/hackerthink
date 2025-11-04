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

// POST submit rating for a dataset
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

    // First, get the dataset ID from the slug
    const datasetResult = await pool.query(
      'SELECT id FROM datasets WHERE slug = $1',
      [slug]
    );

    if (datasetResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    const datasetId = datasetResult.rows[0].id;

    // Insert or update rating
    await pool.query(
      `INSERT INTO dataset_ratings (dataset_id, user_id, rating, review)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (dataset_id, user_id) 
       DO UPDATE SET rating = $3, review = $4, created_at = CURRENT_TIMESTAMP`,
      [datasetId, user_id || null, rating, review || '']
    );

    // Recalculate average rating
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM dataset_ratings WHERE dataset_id = $1',
      [datasetId]
    );

    const avgRating = parseFloat(avgResult.rows[0].avg_rating);
    const ratingCount = parseInt(avgResult.rows[0].count);

    // Update dataset with new rating
    await pool.query(
      'UPDATE datasets SET rating = $1, rating_count = $2 WHERE id = $3',
      [avgRating, ratingCount, datasetId]
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

