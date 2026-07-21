import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Live SQL aggregates for admin dataset analytics. */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totals, topDownloads, byType, recent] = await Promise.all([
      query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE status = 'published')::int AS published,
          COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
          COUNT(*) FILTER (WHERE status = 'archived')::int AS archived,
          COALESCE(SUM(view_count), 0)::bigint AS total_views,
          COALESCE(SUM(download_count), 0)::bigint AS total_downloads,
          COALESCE(AVG(NULLIF(rating, 0)), 0)::float AS average_rating,
          COALESCE(AVG(quality_score), 0)::float AS average_quality,
          COALESCE(AVG(freshness_score), 0)::float AS average_freshness,
          COALESCE(AVG(popularity_score), 0)::float AS average_popularity
        FROM datasets
      `),
      query(`
        SELECT name, slug, download_count, view_count, rating, quality_score
        FROM datasets
        WHERE status = 'published'
        ORDER BY download_count DESC NULLS LAST
        LIMIT 10
      `),
      query(`
        SELECT COALESCE(dataset_type, 'Unknown') AS dataset_type, COUNT(*)::int AS count
        FROM datasets
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 20
      `),
      query(`
        SELECT name, slug, status, created_at
        FROM datasets
        ORDER BY created_at DESC NULLS LAST
        LIMIT 12
      `),
    ]);

    return NextResponse.json({
      stats: totals.rows[0],
      topDownloads: topDownloads.rows,
      byType: byType.rows,
      recent: recent.rows,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load analytics', details: (error as Error).message },
      { status: 500 }
    );
  }
}
