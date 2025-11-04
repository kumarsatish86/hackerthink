/**
 * Script to create AI Workflow Blueprint Builder tool in the database
 * Run with: node scripts/create-ai-workflow-blueprint-builder-tool.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function createAIWorkflowBlueprintBuilderTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if tool already exists (check multiple slugs)
    const existingCheck = await client.query(
      'SELECT id FROM tools WHERE slug IN ($1, $2)',
      ['ai-workflow-blueprint-builder', 'workflow-builder']
    );
    
    if (existingCheck.rows.length > 0) {
      console.log('✅ AI Workflow Blueprint Builder tool already exists in database');
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
      'AI Workflow Blueprint Builder',
      'ai-workflow-blueprint-builder',
      'Select a task type (content creation, research, coding, social media, email marketing, data analysis) and generate a visual step-by-step AI workflow blueprint with icons, descriptions, and ready-to-use AI prompts. Perfect for people who love "visual automation" style guides.',
      'workflow',
      '/tools/ai-workflow-blueprint-builder',
      true, // Published by default
      'AI Workflow Blueprint Builder - Visual Automation Guides | Free Tool',
      'Generate visual step-by-step AI workflows for content creation, research, coding, and more. Get workflow blueprints with icons, descriptions, and ready-to-use AI prompts. Perfect for visual automation guides.',
      'ai workflow builder, workflow blueprint, automation workflow, ai automation guide, visual workflow, step by step workflow, ai process builder, workflow generator, automation blueprint, ai workflow tool, visual automation, workflow design',
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Workflow Blueprint Builder",
        "description": "Generate visual step-by-step AI workflows for different tasks",
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
      'https://ainews.com/tools/ai-workflow-blueprint-builder',
      10 // Maximum popularity (people love visual automation guides)
    ]);

    await client.query('COMMIT');
    
    console.log('✅ AI Workflow Blueprint Builder tool created successfully!');
    console.log('Tool ID:', result.rows[0].id);
    console.log('Slug:', result.rows[0].slug);
    console.log('Published:', result.rows[0].published);
    console.log('\n🔗 Access the tool at: /tools/ai-workflow-blueprint-builder');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating AI Workflow Blueprint Builder tool:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

// Execute the script
createAIWorkflowBlueprintBuilderTool()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

