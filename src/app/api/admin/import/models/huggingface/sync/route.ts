import { NextRequest, NextResponse } from 'next/server';
import {
  ensureHuggingFaceImportSettings,
  runHuggingFaceAutoSync,
} from '@/services/import/bulkHuggingFaceImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// POST manual trigger / settings-aware sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await runHuggingFaceAutoSync({
      force: body.force !== false,
      limitOverride: body.limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('HuggingFace auto-sync error:', error);
    return NextResponse.json(
      { error: 'Auto-sync failed', details: error?.message },
      { status: 500 }
    );
  }
}

// GET sync status
export async function GET() {
  try {
    const settings = await ensureHuggingFaceImportSettings();
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
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to load sync settings', details: error?.message },
      { status: 500 }
    );
  }
}
