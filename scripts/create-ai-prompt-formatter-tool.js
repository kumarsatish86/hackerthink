/**
 * Script to create AI Prompt Formatter/Beautifier tool in the database
 * Run with: node scripts/create-ai-prompt-formatter-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIPromptFormatterTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check both slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['ai-prompt-formatter', 'ai-prompt-beautifier']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Prompt Formatter tool already exists in database');
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
      'AI Prompt Formatter / Beautifier',
      'ai-prompt-formatter',
      'Takes messy long prompts and reformats them with bullet points, syntax highlighting, and clean structure. Perfect for developers and prompt engineers who want to beautify and organize their AI prompts for better readability and professionalism.',
      'code',
      '/tools/ai-prompt-formatter',
      true, // Published by default
      'AI Prompt Formatter - Beautify & Format AI Prompts | Free Tool',
      'Format and beautify messy AI prompts with bullet points, syntax highlighting, and clean structure. Transform unformatted prompts into professional, readable formats. Perfect for prompt engineers and developers.',
      'prompt formatter, prompt beautifier, ai prompt formatter, prompt formatting tool, prompt beautifier tool, format prompts, beautify prompts, prompt organizer, prompt structure tool, ai prompt tool, prompt editor, prompt cleaner',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Prompt Formatter",
        "description": "Format and beautify AI prompts with bullet points, syntax highlighting, and clean structure",
        "applicationCategory": "DeveloperApplication",
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
      'https://ainews.com/tools/ai-prompt-formatter',
      9 // High popularity (viral potential)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Prompt Formatter tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-prompt-formatter');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Prompt Formatter tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIPromptFormatterTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

