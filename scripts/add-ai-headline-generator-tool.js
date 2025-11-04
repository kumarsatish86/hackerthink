const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIHeadlineGeneratorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Headline Generator Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-headline-generator']
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
        WHERE slug = 'ai-headline-generator'
      `, [
        'AI Headline Generator',
        'Generate eye-catching headlines, hooks, and titles for YouTube videos, blog posts, social media, and marketing campaigns. Choose from 8 tone styles (clickbait, serious, funny, LinkedIn, YouTube, professional, casual, dramatic) and 6 format types. Perfect for content creators and marketers.',
        '📰',
        '/tools/ai-headline-generator',
        true,
        'AI Headline Generator - Create Eye-Catching Titles for YouTube, Blog & Social Media',
        'Generate engaging headlines and titles for YouTube, blogs, social media, and marketing. Choose from 8 tone styles (clickbait, serious, LinkedIn, YouTube) and 6 formats. Perfect for content creators, bloggers, and marketers.',
        'headline generator, title generator, youtube title generator, blog headline generator, clickbait generator, hook generator, content title generator, seo headline tool, social media titles, article headline maker, viral headline generator, marketing headline tool',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-headline-generator',
        94
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
        'AI Headline Generator',
        'ai-headline-generator',
        'Generate eye-catching headlines, hooks, and titles for YouTube videos, blog posts, social media, and marketing campaigns. Choose from 8 tone styles (clickbait, serious, funny, LinkedIn, YouTube, professional, casual, dramatic) and 6 format types. Perfect for content creators and marketers.',
        '📰',
        '/tools/ai-headline-generator',
        true,
        'AI Headline Generator - Create Eye-Catching Titles for YouTube, Blog & Social Media',
        'Generate engaging headlines and titles for YouTube, blogs, social media, and marketing. Choose from 8 tone styles (clickbait, serious, LinkedIn, YouTube) and 6 formats. Perfect for content creators, bloggers, and marketers.',
        'headline generator, title generator, youtube title generator, blog headline generator, clickbait generator, hook generator, content title generator, seo headline tool, social media titles, article headline maker, viral headline generator, marketing headline tool',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-headline-generator',
        94
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Headline Generator tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIHeadlineGeneratorTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

