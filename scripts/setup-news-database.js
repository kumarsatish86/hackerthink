const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function setupNewsDatabase() {
  try {
    console.log('Setting up news database tables...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-news-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ News database tables created successfully!');
    
    // Verify tables were created
    const { rows: tables } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('news', 'news_categories')
    `);
    
    console.log('Created tables:', tables.map(t => t.table_name));
    
    // Check if sample data was inserted
    const { rows: newsCount } = await pool.query('SELECT COUNT(*) FROM news');
    const { rows: categoriesCount } = await pool.query('SELECT COUNT(*) FROM news_categories');
    
    console.log(`📰 News items: ${newsCount[0].count}`);
    console.log(`📂 Categories: ${categoriesCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error setting up news database:', error);
  } finally {
    await pool.end();
  }
}

setupNewsDatabase();
