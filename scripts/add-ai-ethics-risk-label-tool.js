const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIEthicsRiskLabelTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI Ethics Risk Label Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-ethics-risk-label']
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
        WHERE slug = 'ai-ethics-risk-label'
      `, [
        'AI Ethics / Deepfake Risk Label',
        'Get an ethical risk assessment for your AI content creation scenario. Analyze if your intended use is safe (green), requires caution (yellow), or is high-risk (red). Understand ethical implications before creating deepfakes, voice clones, or synthetic media. Traffic-light system helps identify fraud risks, reputation harm, and acceptable use cases.',
        '⚠️',
        '/tools/ai-ethics-risk-label',
        true,
        'AI Ethics Risk Label - Deepfake Risk Assessment Tool | Ethical AI Content Checker',
        'Assess ethical risk of AI content scenarios. Get traffic-light risk labels (green/yellow/red) for deepfakes, voice clones, and synthetic media. Identify if content is safe, requires caution, or is high-risk. Understand fraud risks, reputation harm, and acceptable use cases. Essential for responsible AI usage.',
        'ai ethics, deepfake risk, ethical ai, deepfake assessment, ai risk checker, synthetic media ethics, voice cloning ethics, deepfake detector, ai content ethics, responsible ai, ai ethics tool, deepfake risk assessment, ai ethical guidelines, fake content detection, ai misuse prevention',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-ethics-risk-label',
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
        'AI Ethics / Deepfake Risk Label',
        'ai-ethics-risk-label',
        'Get an ethical risk assessment for your AI content creation scenario. Analyze if your intended use is safe (green), requires caution (yellow), or is high-risk (red). Understand ethical implications before creating deepfakes, voice clones, or synthetic media. Traffic-light system helps identify fraud risks, reputation harm, and acceptable use cases.',
        '⚠️',
        '/tools/ai-ethics-risk-label',
        true,
        'AI Ethics Risk Label - Deepfake Risk Assessment Tool | Ethical AI Content Checker',
        'Assess ethical risk of AI content scenarios. Get traffic-light risk labels (green/yellow/red) for deepfakes, voice clones, and synthetic media. Identify if content is safe, requires caution, or is high-risk. Understand fraud risks, reputation harm, and acceptable use cases. Essential for responsible AI usage.',
        'ai ethics, deepfake risk, ethical ai, deepfake assessment, ai risk checker, synthetic media ethics, voice cloning ethics, deepfake detector, ai content ethics, responsible ai, ai ethics tool, deepfake risk assessment, ai ethical guidelines, fake content detection, ai misuse prevention',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-ethics-risk-label',
        98
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI Ethics Risk Label tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIEthicsRiskLabelTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

