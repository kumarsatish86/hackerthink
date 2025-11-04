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

    console.log('Starting import enrichment migration...');

    // Create import_settings table
    const importSettingsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'import_settings'
      );
    `);
    
    if (!importSettingsCheck.rows[0].exists) {
      console.log('Creating import_settings table...');
      await client.query(`
        CREATE TABLE import_settings (
          id SERIAL PRIMARY KEY,
          source_name VARCHAR(100) NOT NULL UNIQUE,
          enabled BOOLEAN DEFAULT false,
          api_key TEXT,
          api_secret TEXT,
          auto_approval BOOLEAN DEFAULT false,
          import_limit INTEGER DEFAULT 10,
          import_interval VARCHAR(50),
          schedule_cron VARCHAR(100),
          filters JSONB,
          last_sync TIMESTAMP,
          sync_status VARCHAR(50),
          error_log TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('import_settings table created');
    }

    // Create import_logs table
    const importLogsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'import_logs'
      );
    `);
    
    if (!importLogsCheck.rows[0].exists) {
      console.log('Creating import_logs table...');
      await client.query(`
        CREATE TABLE import_logs (
          id SERIAL PRIMARY KEY,
          source VARCHAR(100) NOT NULL,
          item_type VARCHAR(50),
          item_id UUID,
          import_status VARCHAR(50),
          metadata JSONB,
          error_message TEXT,
          imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_import_logs_source ON import_logs(source)`);
      await client.query(`CREATE INDEX idx_import_logs_status ON import_logs(import_status)`);
      console.log('import_logs table created');
    }

    // Add enrichment columns to ai_models
    console.log('Adding enrichment columns to ai_models...');
    const enrichmentColumns = [
      'ideal_hardware TEXT',
      'risk_score INTEGER DEFAULT 0',
      'comparison_notes TEXT',
      'tutorial_links JSONB',
      'community_links JSONB',
      'research_papers JSONB',
      'alternative_models JSONB',
      'deployment_guide TEXT',
      'cost_estimate JSONB',
      'import_source VARCHAR(100)',
      'import_metadata JSONB',
      'enrichment_applied BOOLEAN DEFAULT false'
    ];

    for (const column of enrichmentColumns) {
      const columnName = column.split(' ')[0];
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'ai_models' AND column_name = $1
        )
      `, [columnName]);

      if (!columnCheck.rows[0].exists) {
        await client.query(`ALTER TABLE ai_models ADD COLUMN ${column}`);
        console.log(`Added ${columnName} to ai_models`);
      }
    }

    // Add enrichment columns to datasets
    console.log('Adding enrichment columns to datasets...');
    const datasetEnrichmentColumns = [
      'ideal_hardware TEXT',
      'risk_score INTEGER DEFAULT 0',
      'comparison_notes TEXT',
      'tutorial_links JSONB',
      'related_models JSONB',
      'preprocessing_tools JSONB',
      'annotation_guide TEXT',
      'download_size_breakdown JSONB',
      'import_source VARCHAR(100)',
      'import_metadata JSONB',
      'enrichment_applied BOOLEAN DEFAULT false'
    ];

    for (const column of datasetEnrichmentColumns) {
      const columnName = column.split(' ')[0];
      const columnCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'datasets' AND column_name = $1
        )
      `, [columnName]);

      if (!columnCheck.rows[0].exists) {
        await client.query(`ALTER TABLE datasets ADD COLUMN ${column}`);
        console.log(`Added ${columnName} to datasets`);
      }
    }

    await client.query('COMMIT');
    console.log('Import enrichment migration completed successfully');
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
    console.log('Import enrichment migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import enrichment migration failed:', error);
    process.exit(1);
  });

