import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getModelId(slug: string): Promise<string | undefined> {
  const row = await queryOne(`SELECT id FROM ai_models WHERE slug = $1 LIMIT 1`, [slug]);
  return row?.id as string | undefined;
}

// POST file a report about incorrect metadata, broken links, or policy concerns.
// Auth is optional: signed-in users are attributed, anonymous reports are still accepted.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const reason = typeof payload?.reason === 'string' ? payload.reason.trim() : '';
    const details = typeof payload?.details === 'string' ? payload.details.trim() : null;

    if (!reason) {
      return NextResponse.json({ error: 'A reason is required to submit a report' }, { status: 400 });
    }
    if (reason.length > 255) {
      return NextResponse.json({ error: 'Reason is too long (max 255 characters)' }, { status: 400 });
    }
    if (details && details.length > 5000) {
      return NextResponse.json({ error: 'Details are too long (max 5000 characters)' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id || null;

    const inserted = await queryOne(
      `INSERT INTO model_reports (model_id, user_id, reason, details, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING id, model_id, user_id, reason, details, status, created_at`,
      [modelId, userId, reason, details]
    );

    return NextResponse.json({
      message: 'Report submitted. Our team will review it shortly.',
      report: inserted,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting report:', error);
    return NextResponse.json({ error: 'Failed to submit report', details: error?.message }, { status: 500 });
  }
}
