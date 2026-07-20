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

    const result = await query(
      `SELECT * FROM model_training_data WHERE model_id = $1 ORDER BY dataset_name`,
      [model.id]
    );

    return NextResponse.json({
      training_data: result.rows,
      total: result.rowCount,
      totals: { datasets: result.rowCount },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
