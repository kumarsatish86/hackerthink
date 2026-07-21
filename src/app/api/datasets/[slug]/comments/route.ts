import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function datasetId(slug: string) {
  const row = await queryOne(`SELECT id FROM datasets WHERE slug = $1`, [slug]);
  return row?.id as string | undefined;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = await datasetId(slug);
  if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const res = await query(
      `SELECT c.id, c.body, c.created_at, c.user_id FROM dataset_comments c WHERE c.dataset_id = $1 ORDER BY c.created_at DESC LIMIT 50`,
      [id]
    );
    return NextResponse.json({ comments: res.rows });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const id = await datasetId(slug);
  if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  if (!body?.body?.trim()) return NextResponse.json({ error: 'Empty comment' }, { status: 400 });
  try {
    const res = await query(
      `INSERT INTO dataset_comments (dataset_id, user_id, body) VALUES ($1, $2, $3) RETURNING id, body, created_at, user_id`,
      [id, session.user.id || null, body.body.trim()]
    );
    return NextResponse.json({ comment: res.rows[0] });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
