const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addPromptCleanerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding Prompt Cleaner Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['prompt-cleaner']
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
        WHERE slug = 'prompt-cleaner'
      `, [
        'Prompt Cleaner / Jailbreak Risk Highlighter',
        'Analyze prompts for risky language, jailbreak attempts, and policy violations. Get suggestions for safe rewrites that maintain your intent while staying within AI safety guidelines. Flag phrases like "bypass", "ignore safety", "undetectable malware", and more. Essential for corporate compliance and preventing account bans.',
        '🧹',
        '/tools/prompt-cleaner',
        true,
        'Prompt Cleaner - Jailbreak Risk Detection & Safe Rewrite Suggestions | AI Prompt Safety',
        'Analyze prompts for jailbreak attempts and policy violations. Detect risky phrases like "bypass", "ignore safety", "undetectable malware". Get safe rewrite suggestions to maintain intent while complying with AI safety guidelines. Prevent account bans and policy violations. Essential for corporate compliance and responsible AI usage.',
        'prompt cleaner, jailbreak detection, prompt safety, ai prompt checker, jailbreak risk, prompt analyzer, safe prompt rewrite, ai compliance, prompt policy checker, ai safety tool, jailbreak highlighter, prompt risk assessment, ai terms compliance, safe ai prompts, prompt sanitizer',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/prompt-cleaner',
        98
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
        'Prompt Cleaner / Jailbreak Risk Highlighter',
        'prompt-cleaner',
        'Analyze prompts for risky language, jailbreak attempts, and policy violations. Get suggestions for safe rewrites that maintain your intent while staying within AI safety guidelines. Flag phrases like "bypass", "ignore safety", "undetectable malware", and more. Essential for corporate compliance and preventing account bans.',
        '🧹',
        '/tools/prompt-cleaner',
        true,
        'Prompt Cleaner - Jailbreak Risk Detection & Safe Rewrite Suggestions | AI Prompt Safety',
        'Analyze prompts for jailbreak attempts and policy violations. Detect risky phrases like "bypass", "ignore safety", "undetectable malware". Get safe rewrite suggestions to maintain intent while complying with AI safety guidelines. Prevent account bans and policy violations. Essential for corporate compliance and responsible AI usage.',
        'prompt cleaner, jailbreak detection, prompt safety, ai prompt checker, jailbreak risk, prompt analyzer, safe prompt rewrite, ai compliance, prompt policy checker, ai safety tool, jailbreak highlighter, prompt risk assessment, ai terms compliance, safe ai prompts, prompt sanitizer',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/prompt-cleaner',
        98
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 Prompt Cleaner Tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addPromptCleanerTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

