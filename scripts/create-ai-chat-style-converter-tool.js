/**
 * Script to create AI Chat Style Converter tool in the database
 * Run with: node scripts/create-ai-chat-style-converter-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIChatStyleConverterTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-chat-style-converter']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Chat Style Converter tool already exists in database');
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
      'AI Chat Style Converter',
      'ai-chat-style-converter',
      'Paste any text and rewrite it as if written by different AI personalities (formal, poetic, sarcastic, concise, enthusiastic, etc.). Perfect for creating shareable content like "ChatGPT vs SarcasticGPT" comparisons that go viral on X and Threads.',
      'sparkles',
      '/tools/ai-chat-style-converter',
      true, // Published by default
      'AI Chat Style Converter - Rewrite Text in Different AI Personalities | Free Tool',
      'Convert any text to different AI personality styles (formal, poetic, sarcastic, concise). Create viral "ChatGPT vs SarcasticGPT" comparisons. Perfect for shareable social media content on X and Threads.',
      'ai chat style converter, text style converter, ai personality converter, chatgpt vs sarcasticgpt, text rewrite ai, ai tone converter, personality text converter, ai style generator, viral ai tool, social media ai tool, text personality changer, ai writing styles',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Chat Style Converter",
        "description": "Rewrite text in different AI personality styles for viral social media content",
        "applicationCategory": "SocialMediaApplication",
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
      'https://ainews.com/tools/ai-chat-style-converter',
      10 // Maximum popularity (viral potential)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Chat Style Converter tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-chat-style-converter');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Chat Style Converter tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIChatStyleConverterTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

