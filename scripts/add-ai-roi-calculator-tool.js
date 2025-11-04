const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function addAIROICalculatorTool() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('Adding AI ROI Calculator Tool to database...\n');
    
    // Check if tool already exists
    const existingTool = await client.query(
      'SELECT id FROM tools WHERE slug = $1',
      ['ai-roi-calculator']
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
        WHERE slug = 'ai-roi-calculator'
      `, [
        'AI Automation Savings Calculator',
        'Calculate cost savings and ROI from AI automation. Enter hourly employee cost, hours saved per day, and team size. Get monthly/yearly savings calculations, ROI percentages, and key insights. Perfect for justifying AI investments, building business cases, and quantifying productivity gains.',
        '💰',
        '/tools/ai-roi-calculator',
        true,
        'AI Automation Savings Calculator - ROI Calculator for AI Productivity | Cost Savings Tool',
        'Calculate AI automation savings and ROI. Enter employee hourly cost, hours saved per day, and team size. Get monthly and yearly savings, ROI percentages, and productivity insights. Justify AI investments with concrete numbers. Perfect for managers, executives, and business case presentations.',
        'ai roi calculator, ai automation savings, ai productivity calculator, ai cost savings, ai roi tool, automation roi calculator, ai investment calculator, productivity savings calculator, ai automation roi, business ai calculator, ai savings calculator, ai efficiency calculator, ai cost benefit calculator',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-roi-calculator',
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
        'AI Automation Savings Calculator',
        'ai-roi-calculator',
        'Calculate cost savings and ROI from AI automation. Enter hourly employee cost, hours saved per day, and team size. Get monthly/yearly savings calculations, ROI percentages, and key insights. Perfect for justifying AI investments, building business cases, and quantifying productivity gains.',
        '💰',
        '/tools/ai-roi-calculator',
        true,
        'AI Automation Savings Calculator - ROI Calculator for AI Productivity | Cost Savings Tool',
        'Calculate AI automation savings and ROI. Enter employee hourly cost, hours saved per day, and team size. Get monthly and yearly savings, ROI percentages, and productivity insights. Justify AI investments with concrete numbers. Perfect for managers, executives, and business case presentations.',
        'ai roi calculator, ai automation savings, ai productivity calculator, ai cost savings, ai roi tool, automation roi calculator, ai investment calculator, productivity savings calculator, ai automation roi, business ai calculator, ai savings calculator, ai efficiency calculator, ai cost benefit calculator',
        'ai-tools',
        'web',
        'Free',
        'https://hackerthink.com/tools/ai-roi-calculator',
        99
      ]);
      
      console.log('✅ Tool added successfully!');
      console.log(`   ID: ${result.rows[0].id}`);
      console.log(`   Title: ${result.rows[0].title}`);
      console.log(`   Slug: ${result.rows[0].slug}`);
    }

    await client.query('COMMIT');
    console.log('\n🎉 AI ROI Calculator tool has been added/updated in the database!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

addAIROICalculatorTool()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

