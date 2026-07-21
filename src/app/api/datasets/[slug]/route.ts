import { NextRequest, NextResponse } from 'next/server';
import { getDatasetDetailBySlug } from '@/lib/datasets/getDatasetDetail';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const payload = await getDatasetDetailBySlug(slug);
    if (!payload) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    return NextResponse.json({
      dataset: {
        ...payload.dataset,
        models_trained_on_it: payload.models_using,
        similar_datasets: payload.similar_datasets,
        _satellites: {
          benchmarks: payload.benchmarks,
          samples: payload.samples,
          downloads: payload.downloads,
          faqs: payload.faqs,
        },
      },
      payload,
    });
  } catch (error: unknown) {
    console.error('Dataset detail error', error);
    return NextResponse.json({ error: 'Failed to fetch dataset' }, { status: 500 });
  }
}
