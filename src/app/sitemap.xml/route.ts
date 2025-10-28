import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getSiteUrl } from '../lib/getSiteUrl';

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
    
    // Get content types to include
    const includeTypes = (settings.include_in_sitemap || 'courses,scripts,articles,lab-exercises,tools,web-stories').split(',');
    
    // Last modified date for the index (current time)
    const lastMod = new Date().toISOString();
    
    // Create sitemap index
    let sitemapIndexXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapIndexXml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add main pages sitemap
    sitemapIndexXml += `  <sitemap>\n`;
    sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/main.xml</loc>\n`;
    sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
    sitemapIndexXml += `  </sitemap>\n`;
    
    // Add content-specific sitemaps
    if (includeTypes.includes('courses')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/courses.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('scripts')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/scripts.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('articles')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/articles.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('lab-exercises')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/lab-exercises.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('tools')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/tools.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('web-stories')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/web-stories.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('commands')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/commands.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('tutorials')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/tutorials.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    if (includeTypes.includes('lessons')) {
      sitemapIndexXml += `  <sitemap>\n`;
      sitemapIndexXml += `    <loc>${baseUrl}/sitemaps/lessons.xml</loc>\n`;
      sitemapIndexXml += `    <lastmod>${lastMod}</lastmod>\n`;
      sitemapIndexXml += `  </sitemap>\n`;
    }
    
    // Close the XML
    sitemapIndexXml += '</sitemapindex>';
    
    // Return the sitemap index XML with proper content type
    return new NextResponse(sitemapIndexXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    
    // Return a simple error-indicating sitemap in case of errors
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