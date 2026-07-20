import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getModelId(slug: string): Promise<string | undefined> {
  const row = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
  return row?.id as string | undefined;
}

// GET list published comments for a model, newest first, with author name where available.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const result = await query(
      `SELECT c.id, c.model_id, c.user_id, c.parent_id, c.body, c.status, c.created_at, c.updated_at,
              u.name AS author_name
       FROM model_comments c
       LEFT JOIN users u ON u.id::text = c.user_id::text
       WHERE c.model_id = $1 AND c.status = 'published'
       ORDER BY c.created_at DESC`,
      [modelId]
    );

    return NextResponse.json({
      model_slug: slug,
      model_id: modelId,
      comments: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: error?.message }, { status: 500 });
  }
}

// POST create a new comment (or reply, via parent_id) for a model. Requires auth.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'You must be signed in to comment' }, { status: 401 });
    }

    const { slug } = await params;
    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const body = typeof payload?.body === 'string' ? payload.body.trim() : '';
    const parentId = payload?.parent_id || null;

    if (!body) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }
    if (body.length > 5000) {
      return NextResponse.json({ error: 'Comment is too long (max 5000 characters)' }, { status: 400 });
    }

    if (parentId) {
      const parent = await queryOne(
        `SELECT id FROM model_comments WHERE id = $1 AND model_id = $2`,
        [parentId, modelId]
      );
      if (!parent) {
        return NextResponse.json({ error: 'Parent comment not found' }, { status: 400 });
      }
    }

    const inserted = await queryOne(
      `INSERT INTO model_comments (model_id, user_id, parent_id, body, status)
       VALUES ($1, $2, $3, $4, 'published')
       RETURNING id, model_id, user_id, parent_id, body, status, created_at, updated_at`,
      [modelId, userId, parentId, body]
    );

    return NextResponse.json({ comment: inserted }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment', details: error?.message }, { status: 500 });
  }
}
