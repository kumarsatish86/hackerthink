/**
 * Script to create AI Pricing Comparison Calculator tool in the database
 * Run with: node scripts/create-ai-pricing-comparison-calculator-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIPricingComparisonCalculatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['ai-pricing-comparison-calculator', 'ai-pricing-calculator']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Pricing Comparison Calculator tool already exists in database');
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
      'AI Pricing Comparison Calculator',
      'ai-pricing-comparison-calculator',
      'Select AI models (GPT, Claude, Gemini, Mistral, etc.) and enter monthly token usage to calculate and compare API costs. See cost per 1M tokens instantly and find the most cost-effective model for your use case. Perfect for developers who want quick cost comparisons.',
      'calculator',
      '/tools/ai-pricing-comparison-calculator',
      true, // Published by default
      'AI Pricing Comparison Calculator - Compare GPT, Claude, Gemini API Costs | Free Tool',
      'Compare AI API costs across GPT, Claude, Gemini, Mistral, and more. Calculate monthly costs and see cost per 1M tokens instantly. Perfect for developers comparing AI model pricing.',
      'ai pricing calculator, api cost calculator, ai model pricing, gpt pricing, claude pricing, gemini pricing, ai cost comparison, api cost comparison, token pricing calculator, ai pricing tool, developer tools, cost per 1m tokens',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Pricing Comparison Calculator",
        "description": "Compare AI API costs across multiple models",
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
      'https://ainews.com/tools/ai-pricing-comparison-calculator',
      10 // Maximum popularity (developers love cost comparisons)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Pricing Comparison Calculator tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-pricing-comparison-calculator');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Pricing Comparison Calculator tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIPricingComparisonCalculatorTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

