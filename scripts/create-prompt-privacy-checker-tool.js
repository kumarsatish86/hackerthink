/**
 * Script to create Prompt Privacy Checker tool in the database
 * Run with: node scripts/create-prompt-privacy-checker-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createPromptPrivacyCheckerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['prompt-privacy-checker', 'privacy-checker']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ Prompt Privacy Checker tool already exists in database');
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
      'Prompt Privacy Checker',
      'prompt-privacy-checker',
      'Paste your prompt and scan for sensitive or personal data. Flags emails, phone numbers, credentials, credit cards, SSNs, API keys, and other PII. Perfect for enterprise AI users who need to ensure privacy compliance and protect sensitive data before sending prompts to AI models.',
      'shield',
      '/tools/prompt-privacy-checker',
      true, // Published by default
      'Prompt Privacy Checker - Scan AI Prompts for Sensitive Data | Privacy Tool',
      'Scan AI prompts for sensitive data like emails, phone numbers, credentials, credit cards, SSNs, and API keys. Perfect for enterprise AI privacy compliance and protecting sensitive data before sharing with AI models.',
      'prompt privacy checker, privacy checker, sensitive data detector, pii detector, privacy compliance tool, ai privacy tool, data protection tool, privacy scanner, enterprise ai security, gdpr compliance tool, hipaa compliance, privacy awareness tool',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Prompt Privacy Checker",
        "description": "Scan AI prompts for sensitive and personal data",
        "applicationCategory": "SecurityApplication",
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
      'https://ainews.com/tools/prompt-privacy-checker',
      10 // Maximum popularity (privacy awareness trending)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ Prompt Privacy Checker tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/prompt-privacy-checker');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating Prompt Privacy Checker tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createPromptPrivacyCheckerTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

