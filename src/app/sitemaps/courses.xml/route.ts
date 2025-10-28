import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSiteUrl } from '../../lib/getSiteUrl';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
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
        'sitemap_priority'
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
    
    // Default values if not set
    const changeFreq = settings.sitemap_change_frequency || 'weekly';
    const priority = settings.sitemap_priority || '0.8';
    
    // XML header
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Get courses
    const coursesResult = await pool.query(`
      SELECT c.slug, c.updated_at
      FROM courses c
      JOIN content co ON c.id = co.id
      WHERE co.published = true
    `);
    
    // Add courses to sitemap
    for (const course of coursesResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/courses/${course.slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(course.updated_at).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${priority}</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Get lessons
    const lessonsResult = await pool.query(`
      SELECT c.slug as course_slug, l.slug as lesson_slug, l.updated_at
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      JOIN content co ON l.id = co.id
      WHERE co.published = true
    `);
    
    // Add lessons to sitemap
    for (const lesson of lessonsResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/courses/${lesson.course_slug}/lessons/${lesson.lesson_slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(lesson.updated_at).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${(parseFloat(priority) - 0.1).toFixed(1)}</priority>\n`;
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
    console.error('Error generating courses sitemap:', error);
    
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