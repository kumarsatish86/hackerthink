const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check if site_settings table exists
    const settingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `);
    
    if (!settingsTableCheck.rows[0].exists) {
      console.log('Creating site_settings table...');
      await client.query(`
        CREATE TABLE site_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          setting_group VARCHAR(50),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default settings
      const defaultSettings = [
        {
          key: 'site_name',
          value: 'Linux Concept',
          group: 'general',
          description: 'The name of the website'
        },
        {
          key: 'site_description',
          value: 'Learn Linux concepts, scripts, and tutorials',
          group: 'general',
          description: 'The meta description for the website'
        },
        {
          key: 'logo_path',
          value: '/images/default-logo.png',
          group: 'appearance',
          description: 'Path to the site logo'
        },
        {
          key: 'favicon_path',
          value: '/favicon.ico',
          group: 'appearance',
          description: 'Path to the site favicon'
        },
        {
          key: 'primary_color',
          value: '#3b82f6',
          group: 'appearance',
          description: 'Primary theme color'
        },
        {
          key: 'secondary_color',
          value: '#6366f1',
          group: 'appearance',
          description: 'Secondary theme color'
        },
        {
          key: 'footer_text',
          value: '© 2023 HackerThink. All rights reserved.',
          group: 'appearance',
          description: 'Text displayed in the footer'
        }
      ];
      
      for (const setting of defaultSettings) {
        await client.query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_group, description)
          VALUES ($1, $2, $3, $4)
        `, [setting.key, setting.value, setting.group, setting.description]);
      }

      console.log('Default site settings inserted.');
    } else {
      console.log('site_settings table already exists.');
    }
    
    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error); 
