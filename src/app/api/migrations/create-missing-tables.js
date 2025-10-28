/**
 * Script to create missing tables in the LinuxConcept database
 */
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

async function createMissingTables() {
  console.log('Starting to create missing tables...');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Check and create scripts table
    const scriptsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'scripts'
      );
    `);
    
    if (!scriptsTableCheck.rows[0].exists) {
      console.log('Creating scripts table...');
      await client.query(`
        CREATE TABLE scripts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          summary TEXT,
          content TEXT NOT NULL,
          script_code TEXT,
          language VARCHAR(50) DEFAULT 'bash',
          author_id INTEGER,
          featured_image TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          published BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('scripts table created successfully');
    } else {
      console.log('scripts table already exists');
    }

    // Check and create tools table
    const toolsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tools'
      );
    `);
    
    if (!toolsTableCheck.rows[0].exists) {
      console.log('Creating tools table...');
      await client.query(`
        CREATE TABLE tools (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          content TEXT,
          featured_image TEXT,
          download_url TEXT,
          github_url TEXT,
          version VARCHAR(50),
          author_id INTEGER,
          meta_title VARCHAR(255),
          meta_description TEXT,
          published BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('tools table created successfully');
    } else {
      console.log('tools table already exists');
    }

    // Check and create assignments table (if missing)
    const assignmentsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'assignments'
      );
    `);
    
    if (!assignmentsTableCheck.rows[0].exists) {
      console.log('Creating assignments table...');
      await client.query(`
        CREATE TABLE assignments (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          due_date TIMESTAMP WITH TIME ZONE,
          course_id INTEGER,
          max_score INTEGER DEFAULT 100,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('assignments table created successfully');
    } else {
      console.log('assignments table already exists');
    }

    // Check and create migrations table
    const migrationsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'migrations'
      );
    `);
    
    if (!migrationsTableCheck.rows[0].exists) {
      console.log('Creating migrations table...');
      await client.query(`
        CREATE TABLE migrations (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('migrations table created successfully');
    } else {
      console.log('migrations table already exists');
    }

    // Check and create meta_tag table if not exists
    const metaTagTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'meta_tag'
      );
    `);
    
    if (!metaTagTableCheck.rows[0].exists) {
      console.log('Creating meta_tag table...');
      await client.query(`
        CREATE TABLE meta_tag (
          id SERIAL PRIMARY KEY,
          page_path VARCHAR(255) NOT NULL,
          tag_name VARCHAR(100) NOT NULL,
          content TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(page_path, tag_name)
        )
      `);
      console.log('meta_tag table created successfully');
    } else {
      console.log('meta_tag table already exists');
    }

    // Check and create site_settings table
    const siteSettingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
      );
    `);
    
    if (!siteSettingsTableCheck.rows[0].exists) {
      console.log('Creating site_settings table...');
      await client.query(`
        CREATE TABLE site_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) NOT NULL UNIQUE,
          setting_value TEXT,
          setting_type VARCHAR(50) DEFAULT 'string',
          category VARCHAR(100) DEFAULT 'general',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default settings
      const defaultSettings = [
        { key: 'site_name', value: 'LinuxConcept', type: 'string', category: 'general' },
        { key: 'site_tagline', value: 'Learn Linux concepts, scripts and tools', type: 'string', category: 'general' },
        { key: 'contact_email', value: 'admin@ainews.com', type: 'string', category: 'contact' },
        { key: 'enable_comments', value: 'true', type: 'boolean', category: 'comments' },
        { key: 'default_theme', value: 'light', type: 'string', category: 'appearance' },
        { key: 'items_per_page', value: '10', type: 'number', category: 'pagination' }
      ];
      
      for (const setting of defaultSettings) {
        await client.query(`
          INSERT INTO site_settings (setting_key, setting_value, setting_type, category)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (setting_key) DO NOTHING
        `, [setting.key, setting.value, setting.type, setting.category]);
      }
      
      console.log('site_settings table created and populated with defaults');
    } else {
      console.log('site_settings table already exists');
    }
    
    // Check and create integrations table if not already done by another script
    const integrationsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'integrations'
      );
    `);
    
    if (!integrationsTableCheck.rows[0].exists) {
      console.log('Creating integrations table...');
      await client.query(`
        CREATE TABLE integrations (
          id SERIAL PRIMARY KEY,
          provider VARCHAR(50) NOT NULL,
          type VARCHAR(50) NOT NULL,
          name VARCHAR(100) NOT NULL,
          status BOOLEAN DEFAULT false,
          config JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(provider, type, name)
        )
      `);
      
      // Create index on provider and type for faster lookups
      await client.query(`
        CREATE INDEX idx_integrations_provider_type ON integrations(provider, type)
      `);
      
      console.log('integrations table created successfully');
    } else {
      console.log('integrations table already exists');
    }
    
    // Check and create url_redirects table if not already created
    const urlRedirectsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'url_redirects'
      );
    `);
    
    if (!urlRedirectsTableCheck.rows[0].exists) {
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
        CREATE INDEX idx_url_redirects_source_url ON url_redirects (source_url)
      `);
      
      console.log('url_redirects table created successfully');
    } else {
      console.log('url_redirects table already exists');
    }
    
    // Check and create seo_settings table if not already created
    const seoSettingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'seo_settings'
      );
    `);
    
    if (!seoSettingsTableCheck.rows[0].exists) {
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
      
      console.log('seo_settings table created successfully');
    } else {
      console.log('seo_settings table already exists');
    }
    
    // Check and create glossary_terms table if not already created
    const glossaryTermsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'glossary_terms'
      );
    `);
    
    if (!glossaryTermsTableCheck.rows[0].exists) {
      console.log('Creating glossary_terms table...');
      await client.query(`
        CREATE TABLE glossary_terms (
          id SERIAL PRIMARY KEY,
          term VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          definition TEXT NOT NULL,
          category VARCHAR(100) DEFAULT 'General',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('glossary_terms table created successfully');
    } else {
      console.log('glossary_terms table already exists');
    }
    
    await client.query('COMMIT');
    console.log('All missing tables created successfully');
    return { success: true };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to create missing tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// If this file is being run directly
if (require.main === module) {
  createMissingTables()
    .then(() => {
      console.log('Tables creation process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Tables creation process failed:', error);
      process.exit(1);
    });
} else {
  // Export for importing in other files
  module.exports = { createMissingTables };
} 
