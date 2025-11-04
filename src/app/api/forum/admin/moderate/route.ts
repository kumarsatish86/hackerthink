import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireModerator } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// POST /api/forum/admin/moderate - Moderate content (edit, delete, move, merge)
export async function POST(request: NextRequest) {
  try {
    await requireModerator();
    const body = await request.json();
    const { action, type, id, target_id, category_id, content } = body;

    if (!action || !type || !id) {
      return NextResponse.json(
        { error: 'action, type, and id are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (type === 'post') {
        if (action === 'delete') {
          await client.query('DELETE FROM forum_posts WHERE id = $1', [id]);
        } else if (action === 'edit' && content) {
          await client.query(
            `UPDATE forum_posts
             SET content = $1, is_edited = TRUE, edited_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [content, id]
          );
        }
      } else if (type === 'thread') {
        if (action === 'delete') {
          await client.query('DELETE FROM forum_threads WHERE id = $1', [id]);
        } else if (action === 'move' && category_id) {
          await client.query(
            `UPDATE forum_threads
             SET category_id = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [category_id, id]
          );
        } else if (action === 'merge' && target_id) {
          // Move all posts from source thread to target thread
          await client.query(
            `UPDATE forum_posts
             SET thread_id = $1
             WHERE thread_id = $2`,
            [target_id, id]
          );
          // Delete source thread
          await client.query('DELETE FROM forum_threads WHERE id = $1', [id]);
        } else if (action === 'edit' && content) {
          // Note: Thread content is in the first post, so we'd need to update that
          // For now, we'll just update the title
          if (content.title) {
            await client.query(
              `UPDATE forum_threads
               SET title = $1, updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [content.title, id]
            );
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({ message: `${action} completed successfully` });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error moderating content:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to moderate content' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

