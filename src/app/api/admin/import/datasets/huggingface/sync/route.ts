import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  ensureHuggingFaceDatasetImportSettings,
  runHuggingFaceDatasetAutoSync,
} from '@/services/import/bulkHuggingFaceDatasetImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await runHuggingFaceDatasetAutoSync({
      force: body.force !== false,
      limitOverride: body.limit,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('HuggingFace dataset auto-sync error:', error);
    return NextResponse.json(
      { error: 'Auto-sync failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await ensureHuggingFaceDatasetImportSettings();
    return NextResponse.json({
      settings: {
        source_name: settings.source_name,
        enabled: settings.enabled,
        auto_approval: settings.auto_approval,
        import_limit: settings.import_limit,
        import_interval: settings.import_interval,
        schedule_cron: settings.schedule_cron,
        filters: settings.filters,
        last_sync: settings.last_sync,
        sync_status: settings.sync_status,
        error_log: settings.error_log,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to load sync settings', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
