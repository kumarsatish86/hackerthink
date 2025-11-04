import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import slugify from 'slugify';
import { requireAuth, isUserBanned } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/threads - List threads with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const sortBy = searchParams.get('sortBy') || 'last_post_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const isLocked = searchParams.get('isLocked');
    const isSticky = searchParams.get('isSticky');
    const isSolved = searchParams.get('isSolved');

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id as string) : null;

    let query = `
      SELECT 
        ft.*,
        u.name as author_name,
        u.avatar_url as author_avatar,
        u.forum_reputation as author_reputation,
        fc.name as category_name,
        fc.slug as category_slug,
        (SELECT COUNT(*) FROM forum_posts fp WHERE fp.thread_id = ft.id) as actual_post_count,
        (SELECT COUNT(*) FROM forum_subscriptions fs WHERE fs.thread_id = ft.id AND fs.user_id = $1) > 0 as is_subscribed,
        (SELECT COUNT(*) FROM forum_bookmarks fb WHERE fb.thread_id = ft.id AND fb.user_id = $1) > 0 as is_bookmarked
      FROM forum_threads ft
      JOIN users u ON u.id = ft.user_id
      JOIN forum_categories fc ON fc.id = ft.category_id
      WHERE 1=1
    `;

    const queryParams: any[] = [userId || 0];
    let paramIndex = 2;

    if (categoryId) {
      query += ` AND ft.category_id = $${paramIndex++}`;
      queryParams.push(parseInt(categoryId));
    }

    if (isLocked !== null && isLocked !== undefined) {
      query += ` AND ft.is_locked = $${paramIndex++}`;
      queryParams.push(isLocked === 'true');
    }

    if (isSticky !== null && isSticky !== undefined) {
      query += ` AND ft.is_sticky = $${paramIndex++}`;
      queryParams.push(isSticky === 'true');
    }

    if (isSolved !== null && isSolved !== undefined) {
      query += ` AND ft.is_solved = $${paramIndex++}`;
      queryParams.push(isSolved === 'true');
    }

    // Validate sortBy and sortOrder
    const validSortFields = ['created_at', 'last_post_at', 'views', 'post_count', 'title'];
    const validSortOrder = ['asc', 'desc'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'last_post_at';
    const safeSortOrder = validSortOrder.includes(sortOrder.toLowerCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Order by sticky first, then by sort field
    query += ` ORDER BY ft.is_sticky DESC, ft.${safeSortBy} ${safeSortOrder}`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM forum_threads ft
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (categoryId) {
      countQuery += ` AND ft.category_id = $${countParamIndex++}`;
      countParams.push(parseInt(categoryId));
    }

    if (isLocked !== null && isLocked !== undefined) {
      countQuery += ` AND ft.is_locked = $${countParamIndex++}`;
      countParams.push(isLocked === 'true');
    }

    if (isSticky !== null && isSticky !== undefined) {
      countQuery += ` AND ft.is_sticky = $${countParamIndex++}`;
      countParams.push(isSticky === 'true');
    }

    if (isSolved !== null && isSolved !== undefined) {
      countQuery += ` AND ft.is_solved = $${countParamIndex++}`;
      countParams.push(isSolved === 'true');
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    const threads = result.rows.map((row) => ({
      id: row.id,
      category_id: row.category_id,
      user_id: row.user_id,
      title: row.title,
      slug: row.slug,
      created_at: row.created_at,
      last_post_at: row.last_post_at,
      views: row.views,
      post_count: parseInt(row.actual_post_count) || row.post_count,
      is_locked: row.is_locked,
      is_sticky: row.is_sticky,
      is_solved: row.is_solved,
      solved_post_id: row.solved_post_id,
      updated_at: row.updated_at,
      author: {
        id: row.user_id,
        name: row.author_name,
        avatar_url: row.author_avatar,
        reputation: row.author_reputation,
      },
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
      is_subscribed: row.is_subscribed || false,
      is_bookmarked: row.is_bookmarked || false,
    }));

    return NextResponse.json({
      threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching forum threads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threads' },
      { status: 500 }
    );
  }
}

// POST /api/forum/threads - Create a new thread
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    // Check if user is banned
    if (await isUserBanned(user.id)) {
      return NextResponse.json(
        { error: 'You are banned from posting' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, category_id } = body;

    if (!title || !content || !category_id) {
      return NextResponse.json(
        { error: 'Title, content, and category_id are required' },
        { status: 400 }
      );
    }

    // Validate category exists
    const categoryCheck = await pool.query(
      'SELECT id, permissions FROM forum_categories WHERE id = $1',
      [category_id]
    );

    if (categoryCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const permissions = categoryCheck.rows[0].permissions || {
      view: 'all',
      post: 'registered',
      reply: 'registered',
    };

    if (permissions.post !== 'all' && permissions.post !== 'registered') {
      return NextResponse.json(
        { error: 'You do not have permission to post in this category' },
        { status: 403 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });
    const slugBase = slug;
    let finalSlug = slugBase;
    let slugCounter = 1;

    // Ensure unique slug
    while (true) {
      const slugCheck = await pool.query(
        'SELECT id FROM forum_threads WHERE slug = $1',
        [finalSlug]
      );

      if (slugCheck.rows.length === 0) {
        break;
      }

      finalSlug = `${slugBase}-${slugCounter++}`;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create thread
      const threadResult = await client.query(
        `INSERT INTO forum_threads (category_id, user_id, title, slug)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [category_id, user.id, title, finalSlug]
      );

      const thread = threadResult.rows[0];

      // Create initial post
      const postResult = await client.query(
        `INSERT INTO forum_posts (thread_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [thread.id, user.id, content]
      );

      // Update user's last_active
      await client.query(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          thread: {
            ...thread,
            post_count: 1,
          },
          post: postResult.rows[0],
        },
        { status: 201 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating forum thread:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create thread' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

