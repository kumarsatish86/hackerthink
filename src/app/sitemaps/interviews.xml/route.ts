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
    
    // XML header
    let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add interviews listing page
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}/interviews</loc>\n`;
    sitemapXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    sitemapXml += `    <changefreq>daily</changefreq>\n`;
    sitemapXml += `    <priority>0.9</priority>\n`;
    sitemapXml += `  </url>\n`;
    
    // Get published interviews
    const interviewsResult = await pool.query(`
      SELECT slug, updated_at, publish_date
      FROM interviews 
      WHERE status = 'published'
      ORDER BY publish_date DESC NULLS LAST, updated_at DESC
    `);
    
    // Add interviews to sitemap
    for (const interview of interviewsResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/interviews/${interview.slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(interview.updated_at || interview.publish_date || new Date()).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>0.8</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Get guest profiles
    const guestsResult = await pool.query(`
      SELECT slug, updated_at
      FROM interview_guests
      ORDER BY updated_at DESC
    `);
    
    // Add guest profiles to sitemap
    for (const guest of guestsResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/interviews/guest/${guest.slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(guest.updated_at || new Date()).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>0.7</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Get interview categories
    const categoriesResult = await pool.query(`
      SELECT slug, updated_at
      FROM interview_categories
      ORDER BY name ASC
    `);
    
    // Add category pages to sitemap
    for (const category of categoriesResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/interviews/category/${category.slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(category.updated_at || new Date()).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>0.6</priority>\n`;
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
    console.error('Error generating interviews sitemap:', error);
    
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

