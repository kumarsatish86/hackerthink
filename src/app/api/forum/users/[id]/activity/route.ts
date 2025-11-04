import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/users/[id]/activity - Get user activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const type = searchParams.get('type') || 'all'; // all, threads, posts

    let activity: any[] = [];

    if (type === 'all' || type === 'threads') {
      // Get threads created by user
      const threadsResult = await pool.query(
        `SELECT 
          ft.*,
          fc.name as category_name,
          fc.slug as category_slug,
          (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id) as post_count
         FROM forum_threads ft
         JOIN forum_categories fc ON fc.id = ft.category_id
         WHERE ft.user_id = $1
         ORDER BY ft.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      activity.push(
        ...threadsResult.rows.map((row) => ({
          type: 'thread',
          id: row.id,
          title: row.title,
          slug: row.slug,
          category: {
            name: row.category_name,
            slug: row.category_slug,
          },
          post_count: parseInt(row.post_count) || 0,
          views: row.views,
          created_at: row.created_at,
        }))
      );
    }

    if (type === 'all' || type === 'posts') {
      // Get posts by user
      const postsResult = await pool.query(
        `SELECT 
          fp.*,
          ft.title as thread_title,
          ft.slug as thread_slug,
          fc.name as category_name,
          fc.slug as category_slug,
          (SELECT COUNT(*) FROM forum_likes fl WHERE fl.post_id = fp.id) as like_count
         FROM forum_posts fp
         JOIN forum_threads ft ON ft.id = fp.thread_id
         JOIN forum_categories fc ON fc.id = ft.category_id
         WHERE fp.user_id = $1
         ORDER BY fp.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      activity.push(
        ...postsResult.rows.map((row) => ({
          type: 'post',
          id: row.id,
          content: row.content.substring(0, 200) + (row.content.length > 200 ? '...' : ''),
          thread: {
            id: row.thread_id,
            title: row.thread_title,
            slug: row.thread_slug,
          },
          category: {
            name: row.category_name,
            slug: row.category_slug,
          },
          like_count: parseInt(row.like_count) || 0,
          created_at: row.created_at,
          is_edited: row.is_edited,
        }))
      );
    }

    // Sort by created_at if type is 'all'
    if (type === 'all') {
      activity.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      activity = activity.slice(0, limit);
    }

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    );
  }
}

