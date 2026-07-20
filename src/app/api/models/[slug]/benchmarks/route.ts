import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getModelId(slug: string) {
  const row = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 AND status = 'published'`, [slug]);
  return row?.id as string | undefined;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const modelId = await getModelId(slug);
    if (!modelId) return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    const result = await query(
      `SELECT * FROM model_benchmarks WHERE model_id = $1 ORDER BY benchmark_name`,
      [modelId]
    );
    return NextResponse.json({
      model_slug: slug,
      model_id: modelId,
      benchmarks: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
