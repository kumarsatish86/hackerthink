import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';
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

// POST bulk-regenerate documentation for multiple models.
// Body (optional): { limit?: number, status?: string }
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const limit = Math.min(Math.max(parseInt(String(body?.limit ?? 50), 10) || 50, 1), 500);
    const status = typeof body?.status === 'string' && body.status.trim() ? body.status.trim() : undefined;

    const values: any[] = [];
    let whereClause = '';
    if (status) {
      values.push(status);
      whereClause = `WHERE status = $${values.length}`;
    }
    values.push(limit);
    const limitPlaceholder = `$${values.length}`;

    const modelsResult = await query(
      `SELECT slug, name FROM ai_models ${whereClause} ORDER BY updated_at DESC NULLS LAST LIMIT ${limitPlaceholder}`,
      values
    );

    const results: Array<{ slug: string; success: boolean; error?: string; counts?: Record<string, number> }> = [];

    for (const row of modelsResult.rows) {
      try {
        const result = await enrichModelDocsBySlug(row.slug);
        results.push({ slug: row.slug, success: true, counts: result.counts });
      } catch (error: any) {
        results.push({ slug: row.slug, success: false, error: error?.message || 'Unknown error' });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.length - succeeded;

    return NextResponse.json({
      message: `Regenerated documentation for ${succeeded}/${results.length} model(s)${failed ? ` (${failed} failed)` : ''}`,
      total: results.length,
      succeeded,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('Error bulk-regenerating model docs:', error);
    return NextResponse.json(
      { error: 'Failed to bulk-regenerate model docs', details: error?.message },
      { status: 500 }
    );
  }
}
