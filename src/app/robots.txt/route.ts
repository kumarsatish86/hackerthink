import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Function to convert HTML to plain text for robots.txt
function htmlToPlainText(html: string): string {
  if (!html) return '';
  
  // Remove HTML tags and decode entities
  let text = html
    // Remove script and style elements completely
    .replace(/<(script|style)[^>]*>.*?<\/(script|style)>/gis, '')
    // Replace div elements with line breaks
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '')
    // Replace paragraph elements with line breaks
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '')
    // Replace br tags with line breaks
    .replace(/<br[^>]*>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up multiple consecutive newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    // Remove leading/trailing whitespace
    .trim();
    
  return text;
}

export async function GET() {
  try {
    // Get robots.txt content from database
    const { rows } = await pool.query(
      "SELECT setting_value FROM seo_settings WHERE setting_key = 'default_robots_txt'"
    );

    let robotsTxt = 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml';

    if (rows.length > 0 && rows[0].setting_value) {
      // Convert HTML from rich text editor to plain text
      robotsTxt = htmlToPlainText(rows[0].setting_value);
      
      // If the conversion results in empty content, use default
      if (!robotsTxt.trim()) {
        robotsTxt = 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml';
      }
    }

    // Return robots.txt content with text/plain content type
    return new NextResponse(robotsTxt, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving robots.txt:', error);
    
    // Return a default robots.txt in case of errors
    return new NextResponse(
      'User-agent: *\nAllow: /\nDisallow: /admin/',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }
} 