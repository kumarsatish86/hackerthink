import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Live category facets from published datasets (domain / dataset_type / categories JSON). */
export async function GET() {
  try {
    const res = await query(
      `SELECT COALESCE(domain, dataset_type, 'general') AS name,
              LOWER(REGEXP_REPLACE(COALESCE(domain, dataset_type, 'general'), '[^a-zA-Z0-9]+', '-', 'g')) AS slug,
              COUNT(*)::int AS count
       FROM datasets
       WHERE status = 'published'
       GROUP BY 1, 2
       ORDER BY count DESC
       LIMIT 100`
    );
    return NextResponse.json({
      categories: res.rows.map((r: { name: string; slug: string; count: number }, i: number) => ({
        id: String(i),
        name: r.name,
        slug: r.slug,
        count: r.count,
        description: `${r.count} published datasets`,
      })),
    });
  } catch {
    return NextResponse.json({ categories: [] });
  }
}
