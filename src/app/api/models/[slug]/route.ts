import { NextRequest, NextResponse } from 'next/server';
import { getModelDetailBySlug } from '@/lib/models/getModelDetail';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const published = await queryOne(
      `SELECT id FROM ai_models WHERE slug = $1 AND status = 'published' LIMIT 1`,
      [slug]
    );
    if (!published) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const payload = await getModelDetailBySlug(slug);
    if (!payload) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Backward-compatible flat fields for older clients
    const model = {
      ...payload.model,
      benchmarks_list: payload.benchmarks,
      variants: payload.variants,
      training_data_sources: payload.training_data,
      community_links_list: payload.community_links,
      usage_examples: payload.usage_examples,
      changelog_entries: payload.changelog,
      install_guides: payload.install_guides,
      architecture_nodes: payload.architecture_nodes,
      faqs: payload.faqs,
      tutorials: payload.tutorials,
      papers: payload.papers,
      use_case_cards: payload.use_case_cards,
      api_docs: payload.api_docs,
      security_notes: payload.security_notes,
      comparisons: payload.comparisons,
      download_analytics: payload.download_analytics,
      related: payload.related,
    };

    return NextResponse.json({ model, ...payload });
  } catch (error: any) {
    console.error('Error fetching model:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch model' }, { status: 500 });
  }
}
