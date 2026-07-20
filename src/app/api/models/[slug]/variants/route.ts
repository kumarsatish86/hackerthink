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

    const variants = await query(
      `SELECT v.*, m.slug, m.name AS variant_name
       FROM model_variants v
       LEFT JOIN ai_models m ON m.id = v.variant_model_id
       WHERE v.model_id = $1
       ORDER BY sort_order, name`,
      [model.id]
    );

    const parents = await query(
      `SELECT v.*, m.slug AS parent_slug, m.name AS parent_name
       FROM model_variants v
       JOIN ai_models m ON m.id = v.model_id
       WHERE v.variant_model_id = $1`,
      [model.id]
    );

    return NextResponse.json({
      variants: variants.rows,
      parent_models: parents.rows,
      counts: { variants: variants.rowCount, parents: parents.rowCount },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
