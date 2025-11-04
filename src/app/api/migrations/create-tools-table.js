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

    // Check if tools table exists
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
          icon VARCHAR(50),
          file_path VARCHAR(255),
          published BOOLEAN DEFAULT false,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add index for performance
      await client.query(`
        CREATE INDEX idx_tools_slug ON tools (slug);
      `);

      // Insert some sample tools
      const sampleTools = [
        {
          title: 'Chmod Calculator',
          slug: 'chmod-calculator',
          description: 'Calculate file permissions in Linux using a visual interface',
          icon: 'file-lock',
          file_path: '/tools/chmod-calculator.html',
          published: true,
          seo_title: 'Linux Chmod Calculator - File Permissions Made Easy',
          seo_description: 'Use our chmod calculator to easily convert between Linux file permission formats (symbolic and numeric).',
          seo_keywords: 'chmod, linux, file permissions, calculator, numeric permissions, symbolic permissions'
        },
        {
          title: 'Crontab Generator',
          slug: 'crontab-generator',
          description: 'Generate cron expressions for scheduled tasks',
          icon: 'calendar-clock',
          file_path: '/tools/crontab-generator.html',
          published: true,
          seo_title: 'Linux Crontab Generator & Expression Helper',
          seo_description: 'Create and verify crontab expressions for Linux scheduled tasks with our easy-to-use tool.',
          seo_keywords: 'crontab, linux, scheduler, cron job, cron expression, task scheduler'
        }
      ];
      
      for (const tool of sampleTools) {
        await client.query(`
          INSERT INTO tools (
            title, slug, description, icon, file_path, published, 
            seo_title, seo_description, seo_keywords
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          tool.title, tool.slug, tool.description, tool.icon, tool.file_path, tool.published,
          tool.seo_title, tool.seo_description, tool.seo_keywords
        ]);
      }
    }
    
    await client.query('COMMIT');
    console.log('Tools table migration completed successfully');
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
    console.log('Tools table migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Tools table migration failed:', error);
    process.exit(1);
  }); 
