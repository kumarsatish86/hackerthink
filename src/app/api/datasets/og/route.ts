import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return new NextResponse('Missing slug', { status: 400 });
  }

  const row = await queryOne(
    `SELECT name, provider, dataset_type, license FROM datasets WHERE slug = $1 AND status = 'published'`,
    [slug]
  );
  const title = row?.name || slug;
  const subtitle = [row?.provider, row?.dataset_type, row?.license].filter(Boolean).join(' · ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="64" y="120" fill="#f8fafc" font-size="36" font-family="system-ui,sans-serif">HackerThink Datasets</text>
  <text x="64" y="280" fill="#ffffff" font-size="64" font-family="system-ui,sans-serif" font-weight="700">${escapeXml(title).slice(0, 48)}</text>
  <text x="64" y="360" fill="#cbd5e1" font-size="28" font-family="system-ui,sans-serif">${escapeXml(subtitle).slice(0, 80)}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));
}
