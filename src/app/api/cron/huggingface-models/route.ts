import { NextRequest, NextResponse } from 'next/server';
import { runHuggingFaceAutoSync } from '@/services/import/bulkHuggingFaceImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Scheduled HuggingFace model sync.
 * Protect with CRON_SECRET:
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : request.nextUrl.searchParams.get('secret') || '';

    if (token !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const result = await runHuggingFaceAutoSync({ force: false });
    return NextResponse.json({
      ok: true,
      triggeredAt: new Date().toISOString(),
      ...result,
    });
  } catch (error: any) {
    console.error('Cron HuggingFace sync failed:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Cron sync failed',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
