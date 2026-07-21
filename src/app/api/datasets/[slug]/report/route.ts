import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await params;
  const row = await queryOne(`SELECT id FROM datasets WHERE slug = $1`, [slug]);
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  try {
    await query(
      `INSERT INTO dataset_reports (dataset_id, user_id, reason, details) VALUES ($1, $2, $3, $4)`,
      [row.id, session?.user?.id || null, body.reason || 'unspecified', body.details || null]
    );
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
