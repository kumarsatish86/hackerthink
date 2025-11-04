/**
 * Script to create AI Logo Prompt Generator tool in the database
 * Run with: node scripts/create-ai-logo-prompt-generator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAILogoPromptGeneratorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-logo-prompt-generator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Logo Prompt Generator tool already exists in database');
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
      'AI Logo Prompt Generator',
      'ai-logo-prompt-generator',
      'Generate optimized image prompts for logo creation. Enter your brand name, style preferences, and color scheme to get platform-specific prompts for Midjourney, Leonardo.ai, DALL-E, and Stable Diffusion. Perfect for creating professional logos with AI.',
      'image',
      '/tools/ai-logo-prompt-generator',
      true, // Published by default
      'AI Logo Prompt Generator - Create Logo Prompts for Midjourney, Leonardo, DALL-E | Free Tool',
      'Generate optimized AI logo prompts for Midjourney, Leonardo.ai, DALL-E, and Stable Diffusion. Enter brand name, style, and colors to create professional logo generation prompts. Perfect for designers and entrepreneurs creating logos with AI.',
      'logo prompt generator, ai logo generator, midjourney logo prompt, leonardo ai logo, dalle logo prompt, stable diffusion logo, logo design prompt, ai logo maker, brand logo generator, logo creation tool, ai branding tool, logo prompt maker',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Logo Prompt Generator",
        "description": "Generate optimized image prompts for AI logo creation across multiple platforms",
        "applicationCategory": "DesignApplication",
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
      'https://ainews.com/tools/ai-logo-prompt-generator',
      10 // Maximum popularity (trending search)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Logo Prompt Generator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-logo-prompt-generator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Logo Prompt Generator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAILogoPromptGeneratorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

