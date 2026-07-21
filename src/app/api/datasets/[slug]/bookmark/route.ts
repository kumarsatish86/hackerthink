import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const row = await queryOne(`SELECT id FROM datasets WHERE slug = $1`, [slug]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    await query(
      `INSERT INTO dataset_bookmarks (dataset_id, user_id) VALUES ($1, $2)
       ON CONFLICT (dataset_id, user_id) DO NOTHING`,
      [row.id, session.user.id]
    );
    return NextResponse.json({ bookmarked: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { slug } = await params;
  const row = await queryOne(`SELECT id FROM datasets WHERE slug = $1`, [slug]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await query(`DELETE FROM dataset_bookmarks WHERE dataset_id = $1 AND user_id = $2`, [row.id, session.user.id]);
  return NextResponse.json({ bookmarked: false });
}
