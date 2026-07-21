import { NextRequest, NextResponse } from 'next/server';
import { getDatasetDetailBySlug, getDatasetBySlug } from '@/lib/datasets/getDatasetDetail';
import { parseJsonField } from '@/lib/datasets/arrayUtils';
import type { DatasetSample } from '@/types/datasets';

export const dynamic = 'force-dynamic';

function samplesFromLegacy(sampleData: unknown): DatasetSample[] {
  if (!sampleData) return [];
  if (Array.isArray(sampleData)) {
    return sampleData.slice(0, 50).map((row, i) => ({
      id: `legacy-${i}`,
      modality: 'text',
      label: `Sample ${i + 1}`,
      text_content: typeof row === 'string' ? row : JSON.stringify(row, null, 2),
      metadata: typeof row === 'object' && row !== null ? (row as DatasetSample['metadata']) : undefined,
      sort_order: i,
    }));
  }
  if (typeof sampleData === 'object') {
    return [
      {
        id: 'legacy-0',
        modality: 'json',
        label: 'Sample payload',
        text_content: JSON.stringify(sampleData, null, 2),
        sort_order: 0,
      },
    ];
  }
  return [];
}

async function proxyHf(datasetId: string): Promise<DatasetSample[]> {
  try {
    const url = `https://datasets-server.huggingface.co/rows?dataset=${encodeURIComponent(datasetId)}&config=default&split=train&offset=0&length=12`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const rows = data.rows || [];
    return rows.slice(0, 12).map((r: { row?: Record<string, unknown> }, i: number) => {
      const row = r.row || {};
      const text =
        (row.text as string) ||
        (row.content as string) ||
        (row.sentence as string) ||
        JSON.stringify(row).slice(0, 2000);
      return {
        id: `hf-${i}`,
        modality: row.image ? 'image' : row.audio ? 'audio' : 'text',
        label: `HF row ${i}`,
        text_content: typeof text === 'string' ? text : JSON.stringify(text),
        media_url: typeof row.image === 'string' ? row.image : undefined,
        metadata: row,
        sort_order: i,
      } as DatasetSample;
    });
  } catch {
    return [];
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const detail = await getDatasetDetailBySlug(slug);
  if (!detail) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }

  if (detail.samples.length) {
    return NextResponse.json({ source: 'database', samples: detail.samples });
  }

  const legacy = samplesFromLegacy(parseJsonField(detail.dataset.sample_data, null));
  if (legacy.length) {
    return NextResponse.json({ source: 'database', samples: legacy });
  }

  const hfId =
    detail.dataset.external_dataset_id ||
    detail.dataset.huggingface_url?.split('/datasets/')[1]?.replace(/\/$/, '');
  if (hfId) {
    const proxied = await proxyHf(hfId);
    if (proxied.length) {
      return NextResponse.json({
        source: 'huggingface',
        samples: proxied,
        message: 'Capped Hugging Face preview — not a full download.',
      });
    }
  }

  return NextResponse.json({
    source: 'empty',
    samples: [],
    message: 'No preview samples yet. Use Download or add samples in admin.',
  });
}

// keep helper available for warm cache paths
export async function HEAD(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await getDatasetBySlug(slug);
  return new NextResponse(null, { status: row ? 200 : 404 });
}
