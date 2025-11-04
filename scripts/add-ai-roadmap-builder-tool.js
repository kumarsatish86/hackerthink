const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIRoadmapBuilderTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Roadmap Builder Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-roadmap-builder']
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
        WHERE slug = 'ai-roadmap-builder'
      `, [
        'AI Roadmap Builder',
        'Answer 3 simple questions to get your personalized 30-day AI learning roadmap. Find which AI skills to learn based on your goals (get job, automate work, start agency, create content, build startup), background (coder, designer, marketer, student, ops), and time commitment. Perfect for anyone feeling lost about AI skills. Get the full 90-day roadmap PDF via email.',
        '🗺️',
        '/tools/ai-roadmap-builder',
        true,
        'AI Roadmap Builder - Personalized 30-Day AI Learning Path | Which AI Skills Should I Learn?',
        'Get your personalized 30-day AI learning roadmap. Answer 3 questions about your goals, background, and time commitment. Learn which AI skills to prioritize. Get job-ready, automate work, start an agency, enhance content, or build a startup. Includes lead magnet for 90-day PDF roadmap.',
        'ai roadmap, ai learning path, which ai skills to learn, ai career roadmap, learn ai in 30 days, ai skills for jobs, ai automation roadmap, ai agency roadmap, personalized ai learning, ai education, ai training, ai skills guide, ai learning plan',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-roadmap-builder',
        99
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
        'AI Roadmap Builder',
        'ai-roadmap-builder',
        'Answer 3 simple questions to get your personalized 30-day AI learning roadmap. Find which AI skills to learn based on your goals (get job, automate work, start agency, create content, build startup), background (coder, designer, marketer, student, ops), and time commitment. Perfect for anyone feeling lost about AI skills. Get the full 90-day roadmap PDF via email.',
        '🗺️',
        '/tools/ai-roadmap-builder',
        true,
        'AI Roadmap Builder - Personalized 30-Day AI Learning Path | Which AI Skills Should I Learn?',
        'Get your personalized 30-day AI learning roadmap. Answer 3 questions about your goals, background, and time commitment. Learn which AI skills to prioritize. Get job-ready, automate work, start an agency, enhance content, or build a startup. Includes lead magnet for 90-day PDF roadmap.',
        'ai roadmap, ai learning path, which ai skills to learn, ai career roadmap, learn ai in 30 days, ai skills for jobs, ai automation roadmap, ai agency roadmap, personalized ai learning, ai education, ai training, ai skills guide, ai learning plan',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-roadmap-builder',
        99
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Roadmap Builder tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIRoadmapBuilderTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

