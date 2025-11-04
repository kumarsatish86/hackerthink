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

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Get base URL using our utility
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
    
    // Convert to object format
    const settings = settingsResult.rows.reduce((acc, row) => {
      acc[row.setting_key] = row.setting_value;
      return acc;
    }, {});
    
    // If sitemap generation is disabled, return 404
    if (settings.generate_sitemap === 'false') {
      return new NextResponse('Sitemap generation is disabled', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // Check if lessons are included in sitemap
    const includeInSitemap = settings.include_in_sitemap || '';
    if (!includeInSitemap.includes('lessons')) {
      return new NextResponse('Lessons are not included in sitemap', {
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // Default values if not set
    const changeFreq = settings.sitemap_change_frequency || 'weekly';
    const priority = settings.sitemap_priority || '0.8';
    
    // XML header
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Get lessons from tutorial sections
    const lessonsResult = await pool.query(`
      SELECT ts.slug as section_slug, t.slug as tutorial_slug, ts.updated_at
      FROM tutorial_sections ts
      JOIN tutorials t ON ts.tutorial_id = t.id
      WHERE ts.is_active = true AND t.is_active = true
    `);
    
    // Add sections to sitemap
    for (const section of lessonsResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/tutorials/${section.tutorial_slug}/${section.section_slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(section.updated_at).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${(parseFloat(priority) - 0.1).toFixed(1)}</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Get individual lessons
    const individualLessonsResult = await pool.query(`
      SELECT tl.slug as lesson_slug, ts.slug as section_slug, t.slug as tutorial_slug, tl.updated_at
      FROM tutorial_lessons tl
      JOIN tutorial_sections ts ON tl.section_id = ts.id
      JOIN tutorials t ON ts.tutorial_id = t.id
      WHERE tl.is_active = true AND ts.is_active = true AND t.is_active = true
    `);
    
    // Add individual lessons to sitemap
    for (const lesson of individualLessonsResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/tutorials/${lesson.tutorial_slug}/${lesson.section_slug}/${lesson.lesson_slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(lesson.updated_at).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${(parseFloat(priority) - 0.2).toFixed(1)}</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Close the XML
    sitemapXml += '</urlset>';
    
    // Return the sitemap XML with proper content type
    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating lessons sitemap:', error);
    
    // Return a simple error-indicating sitemap in case of errors
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
