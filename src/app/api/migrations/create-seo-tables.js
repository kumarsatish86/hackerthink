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

    // Check if seo_settings table exists
    const settingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'seo_settings'
      );
    `);
    
    if (!settingsTableCheck.rows[0].exists) {
      console.log('Creating seo_settings table...');
      await client.query(`
        CREATE TABLE seo_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
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
          description: 'The name of the website'
        },
        {
          key: 'site_description',
          value: 'Learn Linux concepts, scripts, and tutorials',
          description: 'The meta description for the website'
        },
        {
          key: 'default_robots_txt',
          value: 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://example.com/sitemap.xml',
          description: 'Default robots.txt content'
        },
        {
          key: 'generate_sitemap',
          value: 'true',
          description: 'Whether to automatically generate sitemap'
        },
        {
          key: 'sitemap_change_frequency',
          value: 'weekly',
          description: 'Default change frequency for sitemap'
        },
        {
          key: 'sitemap_priority',
          value: '0.8',
          description: 'Default priority for sitemap'
        },
        {
          key: 'include_in_sitemap',
          value: 'courses,scripts,articles,tools,lab-exercises,web-stories,commands,tutorials,lessons',
          description: 'Content types to include in sitemap'
        }
      ];
      
      for (const setting of defaultSettings) {
        await client.query(`
          INSERT INTO seo_settings (setting_key, setting_value, description)
          VALUES ($1, $2, $3)
        `, [setting.key, setting.value, setting.description]);
      }
    }
    
    // Check if url_redirects table exists
    const redirectsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'url_redirects'
      );
    `);
    
    if (!redirectsTableCheck.rows[0].exists) {
      console.log('Creating url_redirects table...');
      await client.query(`
        CREATE TABLE url_redirects (
          id SERIAL PRIMARY KEY,
          source_url VARCHAR(255) NOT NULL UNIQUE,
          target_url VARCHAR(255) NOT NULL,
          redirect_type INTEGER DEFAULT 301,
          is_active BOOLEAN DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add an index for performance
      await client.query(`
        CREATE INDEX idx_url_redirects_source_url ON url_redirects (source_url);
      `);
    }
    
    // Check if meta_tags table exists
    const metaTagsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'meta_tags'
      );
    `);
    
    if (!metaTagsTableCheck.rows[0].exists) {
      console.log('Creating meta_tags table...');
      await client.query(`
        CREATE TABLE meta_tags (
          id SERIAL PRIMARY KEY,
          page_path VARCHAR(255) NOT NULL UNIQUE,
          title VARCHAR(255),
          description TEXT,
          keywords TEXT,
          og_title VARCHAR(255),
          og_description TEXT,
          og_image VARCHAR(255),
          twitter_card VARCHAR(100),
          twitter_title VARCHAR(255),
          twitter_description TEXT,
          twitter_image VARCHAR(255),
          canonical_url VARCHAR(255),
          is_noindex BOOLEAN DEFAULT FALSE,
          is_nofollow BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add an index for performance
      await client.query(`
        CREATE INDEX idx_meta_tags_page_path ON meta_tags (page_path);
      `);
    }
    
    await client.query('COMMIT');
    console.log('SEO tables migration completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the migration
runMigration()
  .then(() => {
    console.log('SEO tables migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('SEO tables migration failed:', error);
    process.exit(1);
  }); 
