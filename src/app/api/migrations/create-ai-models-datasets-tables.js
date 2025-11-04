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

    console.log('Starting AI Models and Datasets migration...');

    // Create ai_models table
    const aiModelsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_models'
      );
    `);
    
    if (!aiModelsTableCheck.rows[0].exists) {
      console.log('Creating ai_models table...');
      await client.query(`
        CREATE TABLE ai_models (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          developer VARCHAR(255),
          description TEXT,
          full_description TEXT,
          model_type VARCHAR(100),
          architecture VARCHAR(100),
          parameters VARCHAR(50),
          context_length INTEGER,
          training_data TEXT,
          release_date DATE,
          last_updated DATE,
          version VARCHAR(50),
          license VARCHAR(100),
          pricing_type VARCHAR(50),
          pricing_details JSONB,
          capabilities JSONB,
          languages JSONB,
          use_cases JSONB,
          limitations JSONB,
          benchmarks JSONB,
          api_endpoint VARCHAR(500),
          documentation_url VARCHAR(500),
          demo_url VARCHAR(500),
          github_url VARCHAR(500),
          paper_url VARCHAR(500),
          huggingface_url VARCHAR(500),
          download_url VARCHAR(500),
          logo_url VARCHAR(500),
          featured_image VARCHAR(500),
          status VARCHAR(20) DEFAULT 'draft',
          featured BOOLEAN DEFAULT FALSE,
          rating DECIMAL(3,2) DEFAULT 0.00,
          rating_count INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          download_count INTEGER DEFAULT 0,
          categories JSONB,
          tags JSONB,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          schema_json JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          updated_by UUID REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      
      // Create indexes for ai_models
      await client.query(`CREATE INDEX idx_ai_models_slug ON ai_models(slug)`);
      await client.query(`CREATE INDEX idx_ai_models_status ON ai_models(status)`);
      await client.query(`CREATE INDEX idx_ai_models_model_type ON ai_models(model_type)`);
      await client.query(`CREATE INDEX idx_ai_models_license ON ai_models(license)`);
      await client.query(`CREATE INDEX idx_ai_models_pricing_type ON ai_models(pricing_type)`);
      await client.query(`CREATE INDEX idx_ai_models_featured ON ai_models(featured)`);
      await client.query(`CREATE INDEX idx_ai_models_rating ON ai_models(rating)`);
      await client.query(`CREATE INDEX idx_ai_models_categories ON ai_models USING GIN(categories)`);
      await client.query(`CREATE INDEX idx_ai_models_tags ON ai_models USING GIN(tags)`);
      await client.query(`CREATE INDEX idx_ai_models_capabilities ON ai_models USING GIN(capabilities)`);
      
      console.log('ai_models table created successfully');
    } else {
      console.log('ai_models table already exists');
    }

    // Create datasets table
    const datasetsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'datasets'
      );
    `);
    
    if (!datasetsTableCheck.rows[0].exists) {
      console.log('Creating datasets table...');
      await client.query(`
        CREATE TABLE datasets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          provider VARCHAR(255),
          description TEXT,
          full_description TEXT,
          dataset_type VARCHAR(100),
          format VARCHAR(100),
          size VARCHAR(50),
          rows BIGINT,
          columns INTEGER,
          features JSONB,
          split_info JSONB,
          language VARCHAR(100),
          languages JSONB,
          domain VARCHAR(100),
          task_types JSONB,
          license VARCHAR(100),
          citation TEXT,
          paper_url VARCHAR(500),
          documentation_url VARCHAR(500),
          download_url VARCHAR(500),
          huggingface_url VARCHAR(500),
          kaggle_url VARCHAR(500),
          github_url VARCHAR(500),
          sample_data JSONB,
          preprocessing_info TEXT,
          quality_score DECIMAL(3,2),
          collection_method TEXT,
          ethical_considerations TEXT,
          release_date DATE,
          last_updated DATE,
          version VARCHAR(50),
          logo_url VARCHAR(500),
          featured_image VARCHAR(500),
          status VARCHAR(20) DEFAULT 'draft',
          featured BOOLEAN DEFAULT FALSE,
          rating DECIMAL(3,2) DEFAULT 0.00,
          rating_count INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          download_count INTEGER DEFAULT 0,
          categories JSONB,
          tags JSONB,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          schema_json JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_by UUID REFERENCES users(id) ON DELETE SET NULL,
          updated_by UUID REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      
      // Create indexes for datasets
      await client.query(`CREATE INDEX idx_datasets_slug ON datasets(slug)`);
      await client.query(`CREATE INDEX idx_datasets_status ON datasets(status)`);
      await client.query(`CREATE INDEX idx_datasets_dataset_type ON datasets(dataset_type)`);
      await client.query(`CREATE INDEX idx_datasets_license ON datasets(license)`);
      await client.query(`CREATE INDEX idx_datasets_featured ON datasets(featured)`);
      await client.query(`CREATE INDEX idx_datasets_rating ON datasets(rating)`);
      await client.query(`CREATE INDEX idx_datasets_categories ON datasets USING GIN(categories)`);
      await client.query(`CREATE INDEX idx_datasets_tags ON datasets USING GIN(tags)`);
      await client.query(`CREATE INDEX idx_datasets_features ON datasets USING GIN(features)`);
      
      console.log('datasets table created successfully');
    } else {
      console.log('datasets table already exists');
    }

    // Create ai_model_versions table
    const modelVersionsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_model_versions'
      );
    `);
    
    if (!modelVersionsTableCheck.rows[0].exists) {
      console.log('Creating ai_model_versions table...');
      await client.query(`
        CREATE TABLE ai_model_versions (
          id SERIAL PRIMARY KEY,
          model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
          version VARCHAR(50) NOT NULL,
          release_date DATE,
          changelog TEXT,
          benchmarks JSONB,
          download_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`CREATE INDEX idx_model_versions_model_id ON ai_model_versions(model_id)`);
      console.log('ai_model_versions table created successfully');
    } else {
      console.log('ai_model_versions table already exists');
    }

    // Create ai_model_benchmarks table
    const modelBenchmarksTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_model_benchmarks'
      );
    `);
    
    if (!modelBenchmarksTableCheck.rows[0].exists) {
      console.log('Creating ai_model_benchmarks table...');
      await client.query(`
        CREATE TABLE ai_model_benchmarks (
          id SERIAL PRIMARY KEY,
          model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
          benchmark_name VARCHAR(100),
          score DECIMAL(5,2),
          metric VARCHAR(50),
          evaluated_at DATE,
          source_url VARCHAR(500)
        )
      `);
      
      await client.query(`CREATE INDEX idx_model_benchmarks_model_id ON ai_model_benchmarks(model_id)`);
      console.log('ai_model_benchmarks table created successfully');
    } else {
      console.log('ai_model_benchmarks table already exists');
    }

    // Create model_ratings table
    const modelRatingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_ratings'
      );
    `);
    
    if (!modelRatingsTableCheck.rows[0].exists) {
      console.log('Creating model_ratings table...');
      await client.query(`
        CREATE TABLE model_ratings (
          id SERIAL PRIMARY KEY,
          model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          review TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`CREATE INDEX idx_model_ratings_model_id ON model_ratings(model_id)`);
      await client.query(`CREATE INDEX idx_model_ratings_user_id ON model_ratings(user_id)`);
      console.log('model_ratings table created successfully');
    } else {
      console.log('model_ratings table already exists');
    }

    // Create dataset_ratings table
    const datasetRatingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'dataset_ratings'
      );
    `);
    
    if (!datasetRatingsTableCheck.rows[0].exists) {
      console.log('Creating dataset_ratings table...');
      await client.query(`
        CREATE TABLE dataset_ratings (
          id SERIAL PRIMARY KEY,
          dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          review TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`CREATE INDEX idx_dataset_ratings_dataset_id ON dataset_ratings(dataset_id)`);
      await client.query(`CREATE INDEX idx_dataset_ratings_user_id ON dataset_ratings(user_id)`);
      console.log('dataset_ratings table created successfully');
    } else {
      console.log('dataset_ratings table already exists');
    }
    
    await client.query('COMMIT');
    console.log('AI Models and Datasets migration completed successfully');
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
    console.log('AI Models and Datasets migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('AI Models and Datasets migration failed:', error);
    process.exit(1);
  });

