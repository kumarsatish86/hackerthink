import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const model = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 AND status = 'published'`, [slug]);
    if (!model) return NextResponse.json({ error: 'Model not found' }, { status: 404 });

    const changelog = await query(
      `SELECT * FROM model_changelog WHERE model_id = $1 ORDER BY released_at DESC NULLS LAST, created_at DESC`,
      [model.id]
    );
    const versions = await query(
      `SELECT * FROM model_versions WHERE model_id = $1 ORDER BY release_date DESC NULLS LAST`,
      [model.id]
    );

    return NextResponse.json({
      changelog: changelog.rows,
      versions: versions.rows,
      total: changelog.rowCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
