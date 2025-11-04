import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function POST(request: NextRequest) {
  try {
    const client = await pool.connect();
    
    try {
      // Check if tool already exists
      const existingCheck = await client.query(
        'SELECT id FROM tools WHERE slug = $1',
        ['ai-idea-generator']
      );
      
      if (existingCheck.rows.length > 0) {
        return NextResponse.json(
          { 
            message: 'AI Idea Generator tool already exists',
            tool: existingCheck.rows[0]
          },
          { status: 200 }
        );
      }

      // Insert new tool
      const result = await client.query(`
        INSERT INTO tools (
          title, slug, description, icon, file_path, published,
          seo_title, seo_description, seo_keywords, schema_json,
          category, platform, license, official_url, popularity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        'AI Idea Generator (Startup / App / Project)',
        'ai-idea-generator',
        'Generate AI startup ideas, app concepts, and project opportunities based on any topic or industry. Enter a topic (e.g., "healthcare" or "education") and get comprehensive startup ideas with elevator pitches, target markets, revenue models, and competitive advantages.',
        'lightbulb',
        '/tools/ai-idea-generator',
        true, // Published by default
        'AI Startup Idea Generator - Generate AI Startup Ideas, App Concepts & Projects',
        'Generate AI startup ideas, app concepts, and project opportunities. Enter any topic or industry and get comprehensive startup ideas with elevator pitches, target markets, revenue models, and competitive advantages. Perfect for entrepreneurs, innovators, and creators.',
        'ai startup idea generator, startup ideas, app ideas, project ideas, ai business ideas, startup generator, ai tool, entrepreneurship, innovation, business ideas, startup concepts, ai startup, idea generator tool',
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "AI Idea Generator",
          "description": "Generate AI startup ideas, app concepts, and project opportunities based on any topic or industry",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        }),
        'development',
        'cross-platform',
        'MIT',
        'https://ainews.com/tools/ai-idea-generator',
        8 // High popularity
      ]);
      
      return NextResponse.json({ 
        message: 'AI Idea Generator tool created successfully', 
        tool: result.rows[0] 
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating AI Idea Generator tool:', error);
    return NextResponse.json(
      { error: 'Failed to create AI Idea Generator tool', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

