const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIPromptGeneratorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Prompt Generator Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-prompt-generator']
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
        WHERE slug = 'ai-prompt-generator'
      `, [
        'AI Prompt Generator',
        'Generate perfect prompts for ChatGPT, Claude, and other AI assistants. Create professional prompts for blog posts, ad copy, YouTube scripts, LinkedIn posts, study notes, and more. Get maximum quality output from AI with structured, effective prompts.',
        '🤖',
        '/tools/ai-prompt-generator',
        true,
        'AI Prompt Generator - Create Perfect Prompts for ChatGPT & Claude',
        'Generate perfect prompts for AI assistants like ChatGPT and Claude. Create professional prompts for content writing, marketing copy, video scripts, social media, and more. Get maximum quality AI output with our structured prompt generator.',
        'ai prompt generator, chatgpt prompts, claude prompts, ai writing prompts, prompt engineering, blog writing prompts, youtube script prompts, linkedin post prompts, study notes prompts, ai assistant prompts, effective prompts, prompt template generator, ai content generation, perfect prompts',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-prompt-generator',
        95
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
        'AI Prompt Generator',
        'ai-prompt-generator',
        'Generate perfect prompts for ChatGPT, Claude, and other AI assistants. Create professional prompts for blog posts, ad copy, YouTube scripts, LinkedIn posts, study notes, and more. Get maximum quality output from AI with structured, effective prompts.',
        '🤖',
        '/tools/ai-prompt-generator',
        true,
        'AI Prompt Generator - Create Perfect Prompts for ChatGPT & Claude',
        'Generate perfect prompts for AI assistants like ChatGPT and Claude. Create professional prompts for content writing, marketing copy, video scripts, social media, and more. Get maximum quality AI output with our structured prompt generator.',
        'ai prompt generator, chatgpt prompts, claude prompts, ai writing prompts, prompt engineering, blog writing prompts, youtube script prompts, linkedin post prompts, study notes prompts, ai assistant prompts, effective prompts, prompt template generator, ai content generation, perfect prompts',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-prompt-generator',
        95
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Prompt Generator tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIPromptGeneratorTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

