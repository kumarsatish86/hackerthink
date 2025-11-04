/**
 * Script to create AI Content Planner (30-Day Schedule Generator) tool in the database
 * Run with: node scripts/create-ai-content-planner-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIContentPlannerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['ai-content-planner', 'content-planner-30-day']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Content Planner tool already exists in database');
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
      'AI Content Planner (30-Day Schedule Generator)',
      'ai-content-planner',
      'Choose a topic and posting frequency, then generate a complete 30-day content plan with daily AI prompt ideas. Perfect for influencers and small businesses who need a structured content strategy with daily prompts, hashtags, and content type suggestions.',
      'calendar',
      '/tools/ai-content-planner',
      true, // Published by default
      'AI Content Planner - 30-Day Content Schedule Generator | Free Tool for Influencers',
      'Generate a complete 30-day content plan with daily AI prompt ideas. Choose topic and frequency to create a content calendar with prompts, hashtags, and scheduling. Perfect for influencers and small businesses.',
      'content planner, content calendar, 30 day content plan, content schedule generator, social media planner, content calendar tool, ai content planner, content strategy tool, social media content planner, influencer content planner, small business content planner, content planning tool',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Content Planner",
        "description": "Generate 30-day content plans with daily AI prompt ideas",
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
      'https://ainews.com/tools/ai-content-planner',
      10 // Maximum popularity (perfect for influencers and small businesses)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Content Planner tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-content-planner');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Content Planner tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIContentPlannerTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

