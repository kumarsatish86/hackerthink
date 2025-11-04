/**
 * Script to create AI Script-to-Scene Visualizer tool in the database
 * Run with: node scripts/create-ai-script-to-scene-visualizer-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIScriptToSceneVisualizerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-script-to-scene-visualizer']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Script-to-Scene Visualizer tool already exists in database');
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
      'AI Script-to-Scene Visualizer',
      'ai-script-to-scene-visualizer',
      'Write 1-2 lines of script and generate cinematic camera instructions or prompts for Veo/Pika. Perfect for filmmakers and content creators who want to visualize scripts quickly and create shareable video concepts.',
      'video',
      '/tools/ai-script-to-scene-visualizer',
      true, // Published by default
      'AI Script-to-Scene Visualizer - Generate Camera Instructions & Video Prompts | Veo & Pika',
      'Convert script lines into cinematic camera instructions and AI video prompts. Generate optimized prompts for Google Veo and Pika. Perfect for filmmakers and content creators visualizing scenes.',
      'script to scene visualizer, camera instructions generator, veo prompt generator, pika prompt generator, cinematic camera shots, video prompt generator, filmmaking tool, video generation prompts, ai video prompts, script visualization, camera shot generator, video production tool',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Script-to-Scene Visualizer",
        "description": "Convert script lines into cinematic camera instructions and video generation prompts",
        "applicationCategory": "MediaApplication",
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
      'https://ainews.com/tools/ai-script-to-scene-visualizer',
      10 // Maximum popularity (highly shareable)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Script-to-Scene Visualizer tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-script-to-scene-visualizer');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Script-to-Scene Visualizer tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIScriptToSceneVisualizerTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

