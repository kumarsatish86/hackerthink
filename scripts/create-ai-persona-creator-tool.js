/**
 * Script to create AI Persona Creator tool in the database
 * Run with: node scripts/create-ai-persona-creator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIPersonaCreatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-persona-creator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Persona Creator tool already exists in database');
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
      'AI Persona Creator',
      'ai-persona-creator',
      'Build a persona by selecting name, background, goal → outputs a complete persona prompt usable in any chatbot. Perfect for prompt-engineering enthusiasts who love creating personas like "Tech Mentor" or "Investor Advisor".',
      'user-circle',
      '/tools/ai-persona-creator',
      true, // Published by default
      'AI Persona Creator - Build Custom AI Personas for Chatbots | Persona Prompt Generator',
      'Create custom AI personas for chatbots. Build detailed personas with name, background, expertise, goals, and communication style. Generate ready-to-use persona prompts for ChatGPT, Claude, and any AI assistant. Perfect for prompt engineering enthusiasts.',
      'ai persona creator, persona generator, chatbot persona, ai character creator, persona prompt generator, prompt engineering, ai persona builder, custom ai assistant, persona maker, ai character builder, tech mentor persona, investor advisor persona',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Persona Creator",
        "description": "Build custom AI personas for chatbots with detailed attributes and generate ready-to-use persona prompts",
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
      'https://ainews.com/tools/ai-persona-creator',
      9 // Very high popularity (viral potential)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Persona Creator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-persona-creator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Persona Creator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIPersonaCreatorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

