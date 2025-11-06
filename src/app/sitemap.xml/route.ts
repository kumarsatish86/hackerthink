import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSiteUrl } from '../lib/getSiteUrl';

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

    // Get sitemap settings from database
    const settingsResult = await pool.query(`
      SELECT setting_key, setting_value
      FROM seo_settings
      WHERE setting_key IN (
        'generate_sitemap',
        'include_in_sitemap'
      )
    `);

    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {} as Record<string, string>);

    // Check if sitemap generation is enabled
    if (settings.generate_sitemap === 'false') {
      return new NextResponse('Sitemap generation is disabled', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Get included content types
    let includeInSitemap: string[] = [];
    if (settings.include_in_sitemap) {
      includeInSitemap = settings.include_in_sitemap.split(',').map((t: string) => t.trim());
    }

    // Helper function to check if content type is included
    const isIncluded = (type: string) => {
      return includeInSitemap.length === 0 || includeInSitemap.includes(type);
    };

    // Build sitemap index XML
    let sitemapIndexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapIndexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add individual content type sitemaps based on include_in_sitemap setting
    if (isIncluded('articles')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/articles.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('news')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/news.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('ai-models')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/ai-models.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('ai-datasets')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/ai-datasets.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('quizzes')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/quizzes.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('interviews')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/interviews.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('commands')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/commands.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('tutorials')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/tutorials.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('lessons')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/lessons.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('tools')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/tools.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('lab-exercises')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/lab-exercises.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('web-stories')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/web-stories.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('courses')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/courses.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    if (isIncluded('scripts')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/scripts.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }

    sitemapIndexXml += '</sitemapindex>';

    return new NextResponse(sitemapIndexXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</sitemapindex>',
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

