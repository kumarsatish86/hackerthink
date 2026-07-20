import { NextRequest, NextResponse } from 'next/server';
import {
  discoverHuggingFaceModelIds,
  runBulkHuggingFaceImport,
} from '@/services/import/bulkHuggingFaceImport';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// POST bulk import models from HuggingFace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mode = 'identifiers', // 'identifiers' | 'discover'
      identifiers = [],
      sort = 'downloads',
      limit = 20,
      pipeline_tag = '',
      search = '',
      auto_approval = false,
      apply_enrichment = true,
      skip_existing = true,
      delay_ms = 400,
    } = body;

    let ids: string[] = Array.isArray(identifiers) ? identifiers : [];
    let skippedExisting = 0;

    if (mode === 'discover') {
      const discovered = await discoverHuggingFaceModelIds({
        sort,
        limit: Math.min(Number(limit) || 20, 100),
        pipeline_tag: pipeline_tag || undefined,
        search: search || undefined,
        skipExisting: Boolean(skip_existing),
      });
      ids = discovered.ids;
      skippedExisting = discovered.skippedExisting;
    }

    if (!ids.length) {
      return NextResponse.json({
        message: skippedExisting
          ? `No new models to import (${skippedExisting} already exist).`
          : 'No model identifiers provided.',
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

    const summary = await runBulkHuggingFaceImport({
      identifiers: ids,
      auto_approval: Boolean(auto_approval),
      apply_enrichment: Boolean(apply_enrichment),
      // For discover mode we already filtered; for identifiers honor skip_existing
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
  } catch (error: any) {
    console.error('Bulk HuggingFace import error:', error);
    return NextResponse.json(
      {
        error: 'Bulk import failed',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
