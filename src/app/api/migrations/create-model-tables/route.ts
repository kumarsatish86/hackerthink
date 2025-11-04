import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Creating related model tables...');

    // 1. model_benchmarks table
    const benchmarksCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_benchmarks'
      )
    `);

    if (!benchmarksCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_benchmarks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          benchmark_name VARCHAR(255) NOT NULL,
          score DECIMAL(10, 4),
          category VARCHAR(100),
          metric_type VARCHAR(100),
          dataset_name VARCHAR(255),
          evaluation_date DATE,
          source VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(model_id, benchmark_name, category)
        )
      `);
      await client.query(`CREATE INDEX idx_model_benchmarks_model_id ON model_benchmarks(model_id)`);
      await client.query(`CREATE INDEX idx_model_benchmarks_category ON model_benchmarks(category)`);
      await client.query(`CREATE INDEX idx_model_benchmarks_name ON model_benchmarks(benchmark_name)`);
      console.log('Created model_benchmarks table');
    }

    // 2. model_variants table
    const variantsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_variants'
      )
    `);

    if (!variantsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_variants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          parent_model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          variant_model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          relationship_type VARCHAR(50) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CHECK (parent_model_id != variant_model_id)
        )
      `);
      await client.query(`CREATE INDEX idx_model_variants_parent ON model_variants(parent_model_id)`);
      await client.query(`CREATE INDEX idx_model_variants_variant ON model_variants(variant_model_id)`);
      await client.query(`CREATE INDEX idx_model_variants_type ON model_variants(relationship_type)`);
      console.log('Created model_variants table');
    }

    // 3. model_training_data table
    const trainingDataCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_training_data'
      )
    `);

    if (!trainingDataCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_training_data (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          dataset_name VARCHAR(255) NOT NULL,
          dataset_type VARCHAR(100),
          token_count BIGINT,
          percentage DECIMAL(5, 2),
          source VARCHAR(255),
          url VARCHAR(500),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_model_training_data_model_id ON model_training_data(model_id)`);
      await client.query(`CREATE INDEX idx_model_training_data_type ON model_training_data(dataset_type)`);
      console.log('Created model_training_data table');
    }

    // 4. model_community_links table
    const communityLinksCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_community_links'
      )
    `);

    if (!communityLinksCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_community_links (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          link_type VARCHAR(100) NOT NULL,
          url VARCHAR(500) NOT NULL,
          title VARCHAR(255),
          description TEXT,
          icon_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_model_community_links_model_id ON model_community_links(model_id)`);
      await client.query(`CREATE INDEX idx_model_community_links_type ON model_community_links(link_type)`);
      console.log('Created model_community_links table');
    }

    // 5. model_usage_examples table
    const usageExamplesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_usage_examples'
      )
    `);

    if (!usageExamplesCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_usage_examples (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          example_type VARCHAR(100) NOT NULL,
          code TEXT NOT NULL,
          language VARCHAR(50),
          description TEXT,
          title VARCHAR(255),
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await client.query(`CREATE INDEX idx_model_usage_examples_model_id ON model_usage_examples(model_id)`);
      await client.query(`CREATE INDEX idx_model_usage_examples_type ON model_usage_examples(example_type)`);
      console.log('Created model_usage_examples table');
    }

    // 6. model_comparisons table
    const comparisonsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_comparisons'
      )
    `);

    if (!comparisonsCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_comparisons (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_a_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          model_b_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          comparison_type VARCHAR(100),
          pros JSONB,
          cons JSONB,
          verdict TEXT,
          performance_delta JSONB,
          strengths JSONB,
          weaknesses JSONB,
          recommendation TEXT,
          slug VARCHAR(255) UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CHECK (model_a_id != model_b_id)
        )
      `);
      await client.query(`CREATE INDEX idx_model_comparisons_model_a ON model_comparisons(model_a_id)`);
      await client.query(`CREATE INDEX idx_model_comparisons_model_b ON model_comparisons(model_b_id)`);
      await client.query(`CREATE INDEX idx_model_comparisons_slug ON model_comparisons(slug)`);
      console.log('Created model_comparisons table');
    }

    // 7. model_changelog table
    const changelogCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'model_changelog'
      )
    `);

    if (!changelogCheck.rows[0].exists) {
      await client.query(`
        CREATE TABLE model_changelog (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
          version VARCHAR(50) NOT NULL,
          release_date DATE,
          changes JSONB,
          description TEXT,
          performance_improvements TEXT,
          bug_fixes TEXT,
          new_features TEXT,
          breaking_changes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(model_id, version)
        )
      `);
      await client.query(`CREATE INDEX idx_model_changelog_model_id ON model_changelog(model_id)`);
      await client.query(`CREATE INDEX idx_model_changelog_date ON model_changelog(release_date DESC)`);
      console.log('Created model_changelog table');
    }

    await client.query('COMMIT');

    return NextResponse.json({
      success: true,
      message: 'All related model tables created successfully',
      tablesCreated: [
        'model_benchmarks',
        'model_variants',
        'model_training_data',
        'model_community_links',
        'model_usage_examples',
        'model_comparisons',
        'model_changelog'
      ]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating model tables:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create model tables', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

