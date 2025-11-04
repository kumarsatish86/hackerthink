/**
 * Script to create AI Accent Simulator (Text-based) tool in the database
 * Run with: node scripts/create-ai-accent-simulator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIAccentSimulatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-accent-simulator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Accent Simulator tool already exists in database');
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
      'AI Accent Simulator (Text-based)',
      'ai-accent-simulator',
      'Enter a sentence and see how it would sound phonetically in different accents (US, UK, Indian, Australian, Irish, Scottish, Canadian, South African). Text-based phonetic representation showing how different accents might pronounce your text. Fun and viral - perfect for "How would AI pronounce this?" content.',
      'microphone',
      '/tools/ai-accent-simulator',
      true, // Published by default
      'AI Accent Simulator - Text-Based Accent Converter | Fun & Viral Tool',
      'Convert text to phonetic representations showing how different accents (US, UK, Indian, Australian) would pronounce it. Fun and viral tool perfect for social media and shareable content.',
      'accent simulator, text accent converter, phonetic converter, accent text generator, how would ai pronounce this, accent comparison tool, phonetic representation, accent simulator tool, text to accent, accent converter online, viral accent tool, fun accent tool',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Accent Simulator",
        "description": "Convert text to phonetic representations of different accents",
        "applicationCategory": "EntertainmentApplication",
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
      'https://ainews.com/tools/ai-accent-simulator',
      10 // Maximum popularity (fun & viral)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Accent Simulator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-accent-simulator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Accent Simulator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIAccentSimulatorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

