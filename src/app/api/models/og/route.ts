import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Simple SVG OG image for models (1200x630). */
export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || '';
  const model = slug
    ? await queryOne(
        `SELECT name, developer, task, model_type, parameters, license
         FROM ai_models WHERE slug = $1 AND status = 'published' LIMIT 1`,
        [slug]
      )
    : null;

  const title = escapeXml(model?.name || 'AI Model');
  const subtitle = escapeXml(
    [model?.developer, model?.task || model?.model_type, model?.parameters, model?.license]
      .filter(Boolean)
      .join(' · ') || 'HackerThink Models'
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="48" y="48" width="1104" height="534" rx="24" fill="rgba(255,255,255,0.08)"/>
  <text x="80" y="140" fill="#fecaca" font-family="Arial, sans-serif" font-size="28" font-weight="600">HackerThink</text>
  <text x="80" y="280" fill="#ffffff" font-family="Arial, sans-serif" font-size="64" font-weight="700">${title}</text>
  <text x="80" y="360" fill="#fee2e2" font-family="Arial, sans-serif" font-size="28">${subtitle}</text>
  <text x="80" y="520" fill="#fecaca" font-family="Arial, sans-serif" font-size="22">Specs · Benchmarks · Install · Playground</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeXml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .slice(0, 80);
}
