import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { estimateStorageRam, commercialFriendly } from '@/lib/datasets/estimateHardware';
import type { DatasetCore } from '@/types/datasets';

export const dynamic = 'force-dynamic';

function parseJsonField(field: unknown) {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');
    const slugs = searchParams.get('slugs');

    if (!ids && !slugs) {
      return NextResponse.json({ error: 'Dataset IDs or slugs are required' }, { status: 400 });
    }

    let result;
    if (slugs) {
      const slugArray = slugs.split(',').map((s) => s.trim()).filter(Boolean);
      result = await query(
        `SELECT * FROM datasets WHERE slug = ANY($1::text[]) AND status = 'published'`,
        [slugArray]
      );
    } else {
      const datasetIds = ids!.split(',').map((s) => s.trim()).filter(Boolean);
      result = await query(
        `SELECT * FROM datasets WHERE id = ANY($1::uuid[]) AND status = 'published'`,
        [datasetIds]
      );
    }

    const datasets = result.rows.map((raw: Record<string, unknown>) => {
      const dataset = {
        ...raw,
        features: parseJsonField(raw.features) || [],
        split_info: parseJsonField(raw.split_info) || {},
        languages: parseJsonField(raw.languages) || [],
        task_types: parseJsonField(raw.task_types) || [],
        categories: parseJsonField(raw.categories) || [],
        tags: parseJsonField(raw.tags) || [],
        sample_data: parseJsonField(raw.sample_data) || {},
        schema_json: parseJsonField(raw.schema_json) || {},
        ai_summary: parseJsonField(raw.ai_summary) || {},
      } as DatasetCore;

      const hw = estimateStorageRam(dataset);
      return {
        ...dataset,
        storage_estimate: dataset.storage_estimate || hw.storage,
        ram_estimate: dataset.ram_estimate || hw.ram,
        commercial_friendly: commercialFriendly(dataset),
        quality_score: dataset.quality_score ?? null,
        freshness_score: dataset.freshness_score ?? null,
        popularity_score: dataset.popularity_score ?? null,
        modality: dataset.modality || dataset.dataset_type || null,
      };
    });

    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Error fetching datasets for comparison:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets', details: (error as Error).message },
      { status: 500 }
    );
  }
}
