import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

/**
 * Minimal model collections API.
 * Table is created lazily on first write.
 */
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS model_collections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL,
      name VARCHAR(200) NOT NULL,
      slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await query(`CREATE INDEX IF NOT EXISTS idx_model_collections_user ON model_collections(user_id)`);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ collections: [] });
  }
  try {
    await ensureTable();
    const { rows } = await query(
      `SELECT id, name, slugs, created_at, updated_at FROM model_collections WHERE user_id = $1 ORDER BY updated_at DESC`,
      [session.user.id]
    );
    return NextResponse.json({ collections: rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ collections: [], error: 'Failed to load collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }
  try {
    await ensureTable();
    const body = await request.json();
    const name = String(body.name || 'My collection').slice(0, 200);
    const slugs = Array.isArray(body.slugs) ? body.slugs.map(String) : [];
    const { rows } = await query(
      `INSERT INTO model_collections (user_id, name, slugs)
       VALUES ($1, $2, $3::jsonb)
       RETURNING id, name, slugs, created_at, updated_at`,
      [session.user.id, name, JSON.stringify(slugs)]
    );
    return NextResponse.json({ collection: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }
  try {
    await ensureTable();
    const body = await request.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const slugs = Array.isArray(body.slugs) ? body.slugs.map(String) : null;
    const name = body.name != null ? String(body.name).slice(0, 200) : null;
    const { rows } = await query(
      `UPDATE model_collections
       SET slugs = COALESCE($3::jsonb, slugs),
           name = COALESCE($4, name),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, name, slugs, created_at, updated_at`,
      [id, session.user.id, slugs ? JSON.stringify(slugs) : null, name]
    );
    if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ collection: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}
