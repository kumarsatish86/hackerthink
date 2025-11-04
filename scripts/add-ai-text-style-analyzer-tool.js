const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAITextStyleAnalyzerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Text Style Analyzer Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-text-style-analyzer']
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
        WHERE slug = 'ai-text-style-analyzer'
      `, [
        'AI Text Style Analyzer',
        'Analyze writing style to identify AI writing patterns using heuristics. Check sentence length, word variety, formal connectors, and personal voice. Get recommendations to humanize your writing. Important: This is a style analysis tool, not a perfect AI detector.',
        '🔍',
        '/tools/ai-text-style-analyzer',
        true,
        'AI Text Style Analyzer - Detect AI Writing Patterns & Humanize',
        'Analyze writing style to detect AI writing patterns. Check sentence structure, word variety, and language patterns. Get recommendations to make your writing more human, authentic, and undetectable.',
        'ai detector, ai text detector, writing style analyzer, originality checker, humanize ai writing, detect ai text, ai writing analysis, text authenticity checker, human writing style, ai vs human text, writing detector',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-text-style-analyzer',
        96
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
        'AI Text Style Analyzer',
        'ai-text-style-analyzer',
        'Analyze writing style to identify AI writing patterns using heuristics. Check sentence length, word variety, formal connectors, and personal voice. Get recommendations to humanize your writing. Important: This is a style analysis tool, not a perfect AI detector.',
        '🔍',
        '/tools/ai-text-style-analyzer',
        true,
        'AI Text Style Analyzer - Detect AI Writing Patterns & Humanize',
        'Analyze writing style to detect AI writing patterns. Check sentence structure, word variety, and language patterns. Get recommendations to make your writing more human, authentic, and undetectable.',
        'ai detector, ai text detector, writing style analyzer, originality checker, humanize ai writing, detect ai text, ai writing analysis, text authenticity checker, human writing style, ai vs human text, writing detector',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-text-style-analyzer',
        96
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Text Style Analyzer tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAITextStyleAnalyzerTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

