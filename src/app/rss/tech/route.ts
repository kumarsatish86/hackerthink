import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tech News - HackerThink</title>
    <link>${baseUrl}/tech</link>
    <description>Technology news from HackerThink</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <item>
      <title><![CDATA[Coming Soon]]></title>
      <link>${baseUrl}/tech</link>
      <description><![CDATA[Tech news RSS feed coming soon.]]></description>
    </item>
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

