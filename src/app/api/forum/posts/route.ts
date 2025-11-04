import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import { requireAuth, isUserBanned } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/posts - List posts for a thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? parseInt(session.user.id as string) : null;

    // Get posts
    const result = await pool.query(
      `SELECT 
        fp.*,
        u.name as author_name,
        u.avatar_url as author_avatar,
        u.forum_reputation as author_reputation,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.post_id = fp.id) as like_count,
        (SELECT COUNT(*) FROM forum_likes fl WHERE fl.post_id = fp.id AND fl.user_id = $1) > 0 as is_liked
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       WHERE fp.thread_id = $2
       ORDER BY fp.created_at ASC
       LIMIT $3 OFFSET $4`,
      [userId || 0, parseInt(threadId), limit, offset]
    );

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM forum_posts WHERE thread_id = $1',
      [parseInt(threadId)]
    );
    const total = parseInt(countResult.rows[0].total);

    const posts = result.rows.map((row) => ({
      id: row.id,
      thread_id: row.thread_id,
      user_id: row.user_id,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      is_edited: row.is_edited,
      edited_at: row.edited_at,
      author: {
        id: row.user_id,
        name: row.author_name,
        avatar_url: row.author_avatar,
        reputation: row.author_reputation,
      },
      like_count: parseInt(row.like_count) || 0,
      is_liked: row.is_liked || false,
    }));

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/forum/posts - Create a new post
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
    const { thread_id, content } = body;

    if (!thread_id || !content) {
      return NextResponse.json(
        { error: 'thread_id and content are required' },
        { status: 400 }
      );
    }

    // Check if thread exists and is not locked
    const threadCheck = await pool.query(
      `SELECT ft.id, ft.is_locked, ft.category_id, fc.permissions
       FROM forum_threads ft
       JOIN forum_categories fc ON fc.id = ft.category_id
       WHERE ft.id = $1`,
      [thread_id]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const thread = threadCheck.rows[0];

    if (thread.is_locked && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot post in locked thread' },
        { status: 403 }
      );
    }

    // Check permissions
    const permissions = thread.permissions || {
      view: 'all',
      post: 'registered',
      reply: 'registered',
    };

    if (permissions.reply !== 'all' && permissions.reply !== 'registered') {
      return NextResponse.json(
        { error: 'You do not have permission to reply in this category' },
        { status: 403 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create post
      const postResult = await client.query(
        `INSERT INTO forum_posts (thread_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [thread_id, user.id, content]
      );

      const post = postResult.rows[0];

      // Update thread's last_post_at (handled by trigger, but we can also update it explicitly)
      await client.query(
        `UPDATE forum_threads
         SET last_post_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [thread_id]
      );

      // Update user's last_active
      await client.query(
        'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Parse mentions from content (@username pattern)
      const mentionRegex = /@(\w+)/g;
      const mentions = content.match(mentionRegex);
      
      if (mentions) {
        const uniqueMentions = [...new Set(mentions)];
        for (const mention of uniqueMentions) {
          const username = mention.substring(1); // Remove @
          const userResult = await client.query(
            'SELECT id FROM users WHERE name = $1 OR email = $2',
            [username, username]
          );

          if (userResult.rows.length > 0) {
            const mentionedUserId = userResult.rows[0].id;
            
            // Create mention record
            await client.query(
              `INSERT INTO forum_mentions (post_id, mentioned_user_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [post.id, mentionedUserId]
            );

            // Create notification
            await client.query(
              `INSERT INTO forum_notifications (user_id, type, reference_id, message)
               VALUES ($1, 'mention', $2, $3)`,
              [
                mentionedUserId,
                post.id,
                `You were mentioned in a post by ${user.id}`,
              ]
            );
          }
        }
      }

      // Notify thread subscribers (except the post author)
      await client.query(
        `INSERT INTO forum_notifications (user_id, type, reference_id, message)
         SELECT 
           fs.user_id,
           'reply',
           $1,
           $2
         FROM forum_subscriptions fs
         WHERE fs.thread_id = $3 AND fs.user_id != $4`,
        [
          post.id,
          'New reply in a thread you are subscribed to',
          thread_id,
          user.id,
        ]
      );

      await client.query('COMMIT');

      // Fetch post with author info
      const postWithAuthor = await pool.query(
        `SELECT 
          fp.*,
          u.name as author_name,
          u.avatar_url as author_avatar,
          u.forum_reputation as author_reputation
         FROM forum_posts fp
         JOIN users u ON u.id = fp.user_id
         WHERE fp.id = $1`,
        [post.id]
      );

      return NextResponse.json(
        {
          post: {
            ...postWithAuthor.rows[0],
            author: {
              id: postWithAuthor.rows[0].user_id,
              name: postWithAuthor.rows[0].author_name,
              avatar_url: postWithAuthor.rows[0].author_avatar,
              reputation: postWithAuthor.rows[0].author_reputation,
            },
            like_count: 0,
            is_liked: false,
          },
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
    console.error('Error creating forum post:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

