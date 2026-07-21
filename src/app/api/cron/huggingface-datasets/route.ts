import { NextRequest, NextResponse } from 'next/server';
import { runHuggingFaceDatasetAutoSync } from '@/services/import/bulkHuggingFaceDatasetImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Scheduled HuggingFace dataset sync.
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
    const result = await runHuggingFaceDatasetAutoSync({ force: false });
    return NextResponse.json({
      ok: true,
      triggeredAt: new Date().toISOString(),
      ...result,
    });
  } catch (error: unknown) {
    console.error('Cron HuggingFace dataset sync failed:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Cron sync failed',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
