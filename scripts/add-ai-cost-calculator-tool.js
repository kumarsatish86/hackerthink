const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAICostCalculatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Cost Calculator Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-cost-calculator']
    );

    if (existingTool.rows.length > 0) {
      console.log('Tool already exists, updating...');
      
      await client.query(`
        UPDATE tools SET
          title = $1,
          description = $2,
          icon = $3,
          file_path = $4,
          published = $5,
          seo_title = $6,
          seo_description = $7,
          seo_keywords = $8,
          category = $9,
          platform = $10,
          license = $11,
          official_url = $12,
          popularity = $13,
          updated_at = CURRENT_TIMESTAMP
        WHERE slug = 'ai-cost-calculator'
      `, [
        'AI Cost Calculator',
        'Calculate token usage and estimate costs for GPT-4, Claude, Llama, and other AI models. Track word count, character count, estimated tokens, and compare pricing across 9 AI models. Perfect for budgeting and cost optimization.',
        '💰',
        '/tools/ai-cost-calculator',
        true,
        'AI Cost Calculator - Token Counter & API Cost Estimator',
        'Calculate token usage and estimate costs for AI models like GPT-4, Claude, Llama, Gemini. Compare pricing across 9 models, optimize your prompts, and budget your AI expenses effectively.',
        'ai cost calculator, token counter, api cost estimator, gpt-4 cost, claude pricing, llama cost, ai model pricing, token usage, prompt cost calculator, ai budget tool, openai cost, anthropic pricing, model comparison',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-cost-calculator',
        90
      ]);
      
      console.log('✅ Tool updated successfully!');
    } else {
      console.log('Adding new tool...');
      
      const result = await client.query(`
        INSERT INTO tools (
          title, slug, description, icon, file_path, published,
          seo_title, seo_description, seo_keywords,
          category, platform, license, official_url, popularity,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, title, slug
      `, [
        'AI Cost Calculator',
        'ai-cost-calculator',
        'Calculate token usage and estimate costs for GPT-4, Claude, Llama, and other AI models. Track word count, character count, estimated tokens, and compare pricing across 9 AI models. Perfect for budgeting and cost optimization.',
        '💰',
        '/tools/ai-cost-calculator',
        true,
        'AI Cost Calculator - Token Counter & API Cost Estimator',
        'Calculate token usage and estimate costs for AI models like GPT-4, Claude, Llama, Gemini. Compare pricing across 9 models, optimize your prompts, and budget your AI expenses effectively.',
        'ai cost calculator, token counter, api cost estimator, gpt-4 cost, claude pricing, llama cost, ai model pricing, token usage, prompt cost calculator, ai budget tool, openai cost, anthropic pricing, model comparison',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-cost-calculator',
        90
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Cost Calculator tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAICostCalculatorTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

