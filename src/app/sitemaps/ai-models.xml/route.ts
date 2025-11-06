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

    // Check if AI models are included in sitemap
    const includeInSitemap = settings.include_in_sitemap || '';
    if (!includeInSitemap.includes('ai-models')) {
      return new NextResponse('AI Models are not included in sitemap', {
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
    
    // Add static model pages
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}/models</loc>\n`;
    sitemapXml += `    <changefreq>daily</changefreq>\n`;
    sitemapXml += `    <priority>0.9</priority>\n`;
    sitemapXml += `  </url>\n`;
    
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}/models/compare</loc>\n`;
    sitemapXml += `    <changefreq>weekly</changefreq>\n`;
    sitemapXml += `    <priority>0.8</priority>\n`;
    sitemapXml += `  </url>\n`;
    
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}/models/leaderboard</loc>\n`;
    sitemapXml += `    <changefreq>daily</changefreq>\n`;
    sitemapXml += `    <priority>0.8</priority>\n`;
    sitemapXml += `  </url>\n`;
    
    sitemapXml += `  <url>\n`;
    sitemapXml += `    <loc>${baseUrl}/models/timeline</loc>\n`;
    sitemapXml += `    <changefreq>weekly</changefreq>\n`;
    sitemapXml += `    <priority>0.7</priority>\n`;
    sitemapXml += `  </url>\n`;
    
    // Add category pages
    const categories = ['text-generation', 'vision', 'multimodal', 'audio', 'nlp', 'code', 'embeddings'];
    for (const category of categories) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/models/${category}</loc>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>0.7</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Add use case pages
    const useCases = ['chatbots', 'code-generation', 'text-generation', 'image-generation', 'translation', 'summarization', 'question-answering', 'classification'];
    for (const useCase of useCases) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/models/use-cases/${useCase}</loc>\n`;
      sitemapXml += `    <changefreq>weekly</changefreq>\n`;
      sitemapXml += `    <priority>0.7</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Get published AI models
    const modelsResult = await pool.query(`
      SELECT slug, updated_at 
      FROM ai_models 
      WHERE status = 'published'
      ORDER BY updated_at DESC
      LIMIT 10000
    `);
    
    // Add AI models to sitemap
    for (const model of modelsResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/models/${model.slug}</loc>\n`;
      sitemapXml += `    <lastmod>${new Date(model.updated_at || new Date()).toISOString()}</lastmod>\n`;
      sitemapXml += `    <changefreq>${changeFreq}</changefreq>\n`;
      sitemapXml += `    <priority>${priority}</priority>\n`;
      sitemapXml += `  </url>\n`;
    }
    
    // Get organization pages
    const orgResult = await pool.query(`
      SELECT DISTINCT developer 
      FROM ai_models 
      WHERE status = 'published' AND developer IS NOT NULL 
      LIMIT 100
    `);
    
    // Add organization pages to sitemap
    for (const org of orgResult.rows) {
      sitemapXml += `  <url>\n`;
      sitemapXml += `    <loc>${baseUrl}/models/org/${org.developer.toLowerCase().replace(/\s+/g, '-')}</loc>\n`;
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
    console.error('Error generating AI models sitemap:', error);
    
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

