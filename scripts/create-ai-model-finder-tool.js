/**
 * Script to create AI Model Finder / Recommender tool in the database
 * Run with: node scripts/create-ai-model-finder-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIModelFinderTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['ai-model-finder', 'ai-model-recommender']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Model Finder tool already exists in database');
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
      'AI Model Finder / Recommender',
      'ai-model-finder',
      'Find and compare the best AI models for your task. Select task type (Text generation, Image, Voice, Code, etc.) and get recommendations for open-source or commercial models. Helps navigate the confusion between GPT, Claude, Mistral, DALL-E, and other AI models.',
      'search',
      '/tools/ai-model-finder',
      true, // Published by default
      'AI Model Finder - Find Best AI Models for Your Task | GPT, Claude, Mistral Comparison',
      'Find the best AI models for your task. Compare GPT, Claude, Mistral, DALL-E, and other models. Get recommendations for text generation, image creation, code assistance, voice synthesis, and more. Navigate the AI model landscape with ease.',
      'ai model finder, ai model recommender, best ai model, gpt vs claude, ai model comparison, open source ai models, commercial ai models, text generation models, image generation models, code ai models, voice ai models, ai model guide, chatgpt alternatives, ai model selection',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Model Finder",
        "description": "Find and compare the best AI models for your specific task",
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
      'https://ainews.com/tools/ai-model-finder',
      9 // High popularity (helps navigate confusion)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Model Finder tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-model-finder');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Model Finder tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIModelFinderTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

