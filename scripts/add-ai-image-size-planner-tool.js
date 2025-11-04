const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIImageSizePlannerTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Image Size Planner Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-image-size-planner']
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
        WHERE slug = 'ai-image-size-planner'
      `, [
        'AI Image Size Planner',
        'Get exact dimensions and specifications for YouTube thumbnails, Instagram Reels, LinkedIn banners, Twitter posts, TikTok, and more. Includes safe zones, font size recommendations, and platform-specific tips for perfect social media graphics.',
        '📐',
        '/tools/ai-image-size-planner',
        true,
        'AI Image Size Planner - Dimensions for Social Media Graphics',
        'Get exact image dimensions for YouTube thumbnails, Instagram Reels, LinkedIn banners, Twitter posts, TikTok, and more. Includes safe zones, font recommendations, and platform-specific design tips.',
        'image size planner, social media dimensions, youtube thumbnail size, instagram reel size, linkedin banner size, twitter image size, pinterest pin size, image dimensions, thumbnail dimensions, safe zone calculator, social media graphics, content creator tools',
        'content-creation',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-image-size-planner',
        91
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
        'AI Image Size Planner',
        'ai-image-size-planner',
        'Get exact dimensions and specifications for YouTube thumbnails, Instagram Reels, LinkedIn banners, Twitter posts, TikTok, and more. Includes safe zones, font size recommendations, and platform-specific tips for perfect social media graphics.',
        '📐',
        '/tools/ai-image-size-planner',
        true,
        'AI Image Size Planner - Dimensions for Social Media Graphics',
        'Get exact image dimensions for YouTube thumbnails, Instagram Reels, LinkedIn banners, Twitter posts, TikTok, and more. Includes safe zones, font recommendations, and platform-specific design tips.',
        'image size planner, social media dimensions, youtube thumbnail size, instagram reel size, linkedin banner size, twitter image size, pinterest pin size, image dimensions, thumbnail dimensions, safe zone calculator, social media graphics, content creator tools',
        'content-creation',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-image-size-planner',
        91
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Image Size Planner tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIImageSizePlannerTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

