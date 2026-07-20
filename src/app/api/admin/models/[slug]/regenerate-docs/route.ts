import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { enrichModelDocsBySlug } from '@/services/enrichment/ModelDocsEnrichment';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== 'admin' && role !== 'superadmin')) {
    return null;
  }
  return session;
}

// POST regenerate all generated documentation (FAQs, install guides, usage
// examples, architecture nodes, use case cards, API docs, security notes,
// AI summary, quick facts, compatibility matrix, overview guidance and
// playground config) for a single model.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const result = await enrichModelDocsBySlug(slug);

    return NextResponse.json({
      message: `Regenerated documentation for ${result.name || slug}`,
      ...result,
    });
  } catch (error: any) {
    console.error('Error regenerating model docs:', error);
    const status = /not found/i.test(error?.message || '') ? 404 : 500;
    return NextResponse.json(
      { error: 'Failed to regenerate model docs', details: error?.message },
      { status }
    );
  }
}
