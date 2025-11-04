import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query based on category
    let query = `
      SELECT n.id, n.title, n.slug, n.excerpt, n.created_at, n.updated_at
      FROM news n
      WHERE n.status = 'published'
    `;
    const params: any[] = [];

    if (category !== 'all') {
      const categoryIds: any = {
        'breaking': 1,
        'tech': 2,
        'business': 3,
        'research': 4,
        'opinion': 5,
        'world': 6
      };
      if (categoryIds[category]) {
        query += ' AND n.category_id = $1';
        params.push(categoryIds[category]);
      }
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const { rows } = await pool.query(query, params);

    // Build RSS XML
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3007';
    const siteName = 'HackerThink';
    const siteDescription = 'AI News, Tools & Learning Platform';

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
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[${siteName}]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>editor@hackerthink.com (HackerThink Editorial)</managingEditor>
    <webMaster>editor@hackerthink.com (HackerThink Webmaster)</webMaster>
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

