import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT n.id, n.title, n.slug, n.excerpt, n.created_at
      FROM news n
      WHERE n.status = 'published'
      ORDER BY n.created_at DESC
      LIMIT 20
    `);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';
    
    const items = rows.map((item: any) => {
      const pubDate = new Date(item.created_at).toUTCString();
      const link = `${baseUrl}/news/${item.slug}`;
      return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description><![CDATA[${item.excerpt || ''}]]></description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    }).join('');

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Breaking News - HackerThink</title>
    <link>${baseUrl}/breaking</link>
    <description>Latest breaking news from HackerThink</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating RSS feed', { status: 500 });
  }
}

