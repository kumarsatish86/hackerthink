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
    
    // Add the homepage
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}</loc>\n`;
    sitemapXml += `    <changefreq>daily</changefreq>\n`;
    sitemapXml += `    <priority>1.0</priority>\n`;
    sitemapXml += `  </url>\n`;
    
    // Add static pages
    const staticPages = [
      { path: '/about', priority: '0.7' },
      { path: '/contact', priority: '0.7' },
      { path: '/scripts', priority: '0.8' },
      { path: '/courses', priority: '0.9' },
      { path: '/articles', priority: '0.8' },
      { path: '/lab-exercises', priority: '0.8' },
      { path: '/tools', priority: '0.8' },
      { path: '/glossary', priority: '0.7' },
      { path: '/tutorials', priority: '0.8' },
    ];
    
    for (const page of staticPages) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}${page.path}</loc>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${page.priority}</priority>\n`;
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
    console.error('Error generating main sitemap:', error);
    
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