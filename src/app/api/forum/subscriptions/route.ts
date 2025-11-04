import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAuth } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/subscriptions - List subscribed threads
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        fs.*,
        ft.title,
        ft.slug,
        ft.post_count,
        ft.views,
        ft.last_post_at,
        ft.is_locked,
        ft.is_sticky,
        fc.name as category_name,
        fc.slug as category_slug
       FROM forum_subscriptions fs
       JOIN forum_threads ft ON ft.id = fs.thread_id
       JOIN forum_categories fc ON fc.id = ft.category_id
       WHERE fs.user_id = $1
       ORDER BY ft.last_post_at DESC
       LIMIT $2 OFFSET $3`,
      [user.id, limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM forum_subscriptions WHERE user_id = $1',
      [user.id]
    );
    const total = parseInt(countResult.rows[0].total);

    const subscriptions = result.rows.map((row) => ({
      id: row.id,
      thread_id: row.thread_id,
      created_at: row.created_at,
      thread: {
        id: row.thread_id,
        title: row.title,
        slug: row.slug,
        post_count: row.post_count,
        views: row.views,
        last_post_at: row.last_post_at,
        is_locked: row.is_locked,
        is_sticky: row.is_sticky,
      },
      category: {
        name: row.category_name,
        slug: row.category_slug,
      },
    }));

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscriptions' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

