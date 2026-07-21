import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  discoverHuggingFaceDatasetIds,
  runBulkHuggingFaceDatasetImport,
} from '@/services/import/bulkHuggingFaceDatasetImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Bulk HF dataset import — discover or paste identifiers.
 * Idempotent by external_dataset_id (hf:owner/name).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      mode = 'identifiers',
      identifiers = [],
      sort = 'downloads',
      limit = 20,
      search = '',
      filter = '',
      auto_approval = false,
      apply_enrichment = true,
      skip_existing = true,
      delay_ms = 400,
    } = body;

    let ids: string[] = Array.isArray(identifiers) ? identifiers : [];
    let skippedExisting = 0;

    if (mode === 'discover') {
      const discovered = await discoverHuggingFaceDatasetIds({
        sort,
        limit: Math.min(Number(limit) || 20, 100),
        search: search || undefined,
        filter: filter || undefined,
        skipExisting: Boolean(skip_existing),
      });
      ids = discovered.ids;
      skippedExisting = discovered.skippedExisting;
    }

    if (!ids.length) {
      return NextResponse.json({
        message: skippedExisting
          ? `No new datasets to import (${skippedExisting} already exist).`
          : 'No dataset identifiers provided.',
        summary: {
          total: 0,
          imported: 0,
          updated: 0,
          skipped: skippedExisting,
          failed: 0,
        },
        results: [],
      });
    }

    const summary = await runBulkHuggingFaceDatasetImport({
      identifiers: ids,
      auto_approval: Boolean(auto_approval),
      apply_enrichment: Boolean(apply_enrichment),
      skipExisting: mode === 'identifiers' ? Boolean(skip_existing) : false,
      delayMs: Math.min(Math.max(Number(delay_ms) || 400, 0), 5000),
    });

    return NextResponse.json({
      message: `Bulk import finished: ${summary.imported} imported, ${summary.updated} updated, ${summary.skipped + skippedExisting} skipped, ${summary.failed} failed.`,
      summary: {
        ...summary,
        skipped: summary.skipped + skippedExisting,
      },
      results: summary.results,
    });
  } catch (error: unknown) {
    console.error('Bulk HuggingFace dataset import error:', error);
    return NextResponse.json(
      {
        error: 'Bulk import failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
