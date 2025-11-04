/**
 * Script to create AI Idea Generator tool in the database
 * Run with: node scripts/create-ai-idea-generator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIIdeaGeneratorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-idea-generator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Idea Generator tool already exists in database');
      console.log('Tool ID:', existingCheck.rows[0].id);
      await client.query('COMMIT');
      return;
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

    await client.query('COMMIT');
    
    console.log('✅ AI Idea Generator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-idea-generator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Idea Generator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIIdeaGeneratorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

