import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSiteUrl } from '../../lib/getSiteUrl';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const runtime = 'nodejs';

export async function GET() {
  try {
    const baseUrl = getSiteUrl();
    
    // Get sitemap settings
    const settingsResult = await pool.query(`
      SELECT setting_key, setting_value
      FROM seo_settings
      WHERE setting_key IN (
        'generate_sitemap',
        'sitemap_change_frequency',
        'sitemap_priority',
        'include_in_sitemap'
      )
    `);
    
    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    
    if (settings.generate_sitemap === 'false') {
      return new NextResponse('Sitemap generation is disabled', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Check if quizzes are included in sitemap
    const includeInSitemap = settings.include_in_sitemap || '';
    if (!includeInSitemap.includes('quizzes')) {
      return new NextResponse('Quizzes are not included in sitemap', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    const changeFreq = settings.sitemap_change_frequency || 'weekly';
    const priority = settings.sitemap_priority || '0.7';
    
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Get published quizzes
    const quizzesResult = await pool.query(`
      SELECT slug, updated_at 
      FROM quizzes 
      WHERE status = 'published'
      ORDER BY updated_at DESC
    `);
    
    // Add quizzes to sitemap
    for (const quiz of quizzesResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/quizzes/${quiz.slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(quiz.updated_at).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${priority}</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    sitemapXml += '</urlset>';
    
    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating quizzes sitemap:', error);
    
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>',
      {
        status: 500,
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  }
}

