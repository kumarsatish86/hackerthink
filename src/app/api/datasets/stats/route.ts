import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const row = await queryOne(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'published')::int AS datasets,
         COALESCE(SUM(download_count) FILTER (WHERE status = 'published'), 0)::bigint AS downloads,
         COUNT(DISTINCT COALESCE(domain, dataset_type)) FILTER (WHERE status = 'published')::int AS categories
       FROM datasets`
    );
    return NextResponse.json({
      datasets: row?.datasets || 0,
      downloads: Number(row?.downloads || 0),
      categories: row?.categories || 0,
    });
  } catch {
    return NextResponse.json({ datasets: 0, downloads: 0, categories: 0 });
  }
}
