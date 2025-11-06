const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function verify() {
  try {
    const newsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'news_categories' AND column_name = 'parent_id'
    `);
    
    const tutorialResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tutorial_categories' AND column_name = 'parent_id'
    `);
    
    console.log('\n=== Parent ID Column Verification ===\n');
    console.log('news_categories.parent_id:', newsResult.rows.length > 0 ? '✓ EXISTS (' + newsResult.rows[0].data_type + ')' : '✗ MISSING');
    console.log('tutorial_categories.parent_id:', tutorialResult.rows.length > 0 ? '✓ EXISTS (' + tutorialResult.rows[0].data_type + ')' : '✗ MISSING');
    
    // Check indexes
    const newsIndex = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'news_categories' AND indexname = 'idx_news_categories_parent_id'
    `);
    
    const tutorialIndex = await pool.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'tutorial_categories' AND indexname = 'idx_tutorial_categories_parent_id'
    `);
    
    console.log('\n=== Index Verification ===\n');
    console.log('idx_news_categories_parent_id:', newsIndex.rows.length > 0 ? '✓ EXISTS' : '✗ MISSING');
    console.log('idx_tutorial_categories_parent_id:', tutorialIndex.rows.length > 0 ? '✓ EXISTS' : '✗ MISSING');
    
    console.log('\n=== Implementation Complete ===\n');
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
  }
}

verify();

