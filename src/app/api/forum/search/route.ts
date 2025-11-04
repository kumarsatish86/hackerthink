import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/search - Search forum
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all'; // all, threads, posts
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchTerm = query.trim();
    const results: any = {
      threads: [],
      posts: [],
    };

    // Search threads
    if (type === 'all' || type === 'threads') {
      let threadQuery = `
        SELECT 
          ft.*,
          u.name as author_name,
          u.avatar_url as author_avatar,
          fc.name as category_name,
          fc.slug as category_slug,
          ts_rank(to_tsvector('english', ft.title), plainto_tsquery('english', $1)) as rank
        FROM forum_threads ft
        JOIN users u ON u.id = ft.user_id
        JOIN forum_categories fc ON fc.id = ft.category_id
        WHERE to_tsvector('english', ft.title) @@ plainto_tsquery('english', $1)
      `;

      const threadParams: any[] = [searchTerm];
      let paramIndex = 2;

      if (categoryId) {
        threadQuery += ` AND ft.category_id = $${paramIndex++}`;
        threadParams.push(parseInt(categoryId));
      }

      threadQuery += ` ORDER BY rank DESC, ft.last_post_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      threadParams.push(limit, offset);

      const threadResult = await pool.query(threadQuery, threadParams);
      results.threads = threadResult.rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        post_count: row.post_count,
        views: row.views,
        last_post_at: row.last_post_at,
        created_at: row.created_at,
        author: {
          name: row.author_name,
          avatar_url: row.author_avatar,
        },
        category: {
          name: row.category_name,
          slug: row.category_slug,
        },
      }));
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      let postQuery = `
        SELECT 
          fp.*,
          ft.title as thread_title,
          ft.slug as thread_slug,
          u.name as author_name,
          u.avatar_url as author_avatar,
          fc.name as category_name,
          fc.slug as category_slug,
          ts_rank(to_tsvector('english', fp.content), plainto_tsquery('english', $1)) as rank
        FROM forum_posts fp
        JOIN forum_threads ft ON ft.id = fp.thread_id
        JOIN users u ON u.id = fp.user_id
        JOIN forum_categories fc ON fc.id = ft.category_id
        WHERE to_tsvector('english', fp.content) @@ plainto_tsquery('english', $1)
      `;

      const postParams: any[] = [searchTerm];
      let paramIndex = 2;

      if (categoryId) {
        postQuery += ` AND ft.category_id = $${paramIndex++}`;
        postParams.push(parseInt(categoryId));
      }

      postQuery += ` ORDER BY rank DESC, fp.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      postParams.push(limit, offset);

      const postResult = await pool.query(postQuery, postParams);
      results.posts = postResult.rows.map((row) => ({
        id: row.id,
        content: row.content.substring(0, 300) + (row.content.length > 300 ? '...' : ''),
        created_at: row.created_at,
        thread: {
          id: row.thread_id,
          title: row.thread_title,
          slug: row.thread_slug,
        },
        author: {
          name: row.author_name,
          avatar_url: row.author_avatar,
        },
        category: {
          name: row.category_name,
          slug: row.category_slug,
        },
      }));
    }

    return NextResponse.json({ results, query: searchTerm });
  } catch (error) {
    console.error('Error searching forum:', error);
    return NextResponse.json(
      { error: 'Failed to search forum' },
      { status: 500 }
    );
  }
}

