import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getModelId(slug: string): Promise<string | undefined> {
  const row = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
  return row?.id as string | undefined;
}

async function getBookmarkCount(modelId: string): Promise<number> {
  const row = await queryOne(`SELECT COUNT(*)::int AS count FROM model_bookmarks WHERE model_id = $1`, [modelId]);
  return Number(row?.count || 0);
}

// GET whether the current user has bookmarked this model, plus the total count.
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

    const session = await auth();
    const userId = session?.user?.id;
    const count = await getBookmarkCount(modelId);

    if (!userId) {
      return NextResponse.json({ bookmarked: false, count });
    }

    const existing = await queryOne(
      `SELECT id FROM model_bookmarks WHERE model_id = $1 AND user_id = $2`,
      [modelId, userId]
    );

    return NextResponse.json({ bookmarked: !!existing, count });
  } catch (error: any) {
    console.error('Error fetching bookmark status:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmark status', details: error?.message }, { status: 500 });
  }
}

// POST add a bookmark for the current user.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'You must be signed in to bookmark models' }, { status: 401 });
    }

    const { slug } = await params;
    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    await query(
      `INSERT INTO model_bookmarks (model_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (model_id, user_id) DO NOTHING`,
      [modelId, userId]
    );

    const count = await getBookmarkCount(modelId);
    return NextResponse.json({ bookmarked: true, count });
  } catch (error: any) {
    console.error('Error adding bookmark:', error);
    return NextResponse.json({ error: 'Failed to add bookmark', details: error?.message }, { status: 500 });
  }
}

// DELETE remove a bookmark for the current user.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'You must be signed in to manage bookmarks' }, { status: 401 });
    }

    const { slug } = await params;
    const modelId = await getModelId(slug);
    if (!modelId) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    await query(`DELETE FROM model_bookmarks WHERE model_id = $1 AND user_id = $2`, [modelId, userId]);

    const count = await getBookmarkCount(modelId);
    return NextResponse.json({ bookmarked: false, count });
  } catch (error: any) {
    console.error('Error removing bookmark:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark', details: error?.message }, { status: 500 });
  }
}
