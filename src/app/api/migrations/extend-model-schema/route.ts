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
  try {
    console.log('Extending ai_models table schema...');

    const columnsToAdd = [
      // Technical specifications
      { name: 'tokenizer', type: 'VARCHAR(255)' },
      { name: 'vocabulary_size', type: 'INTEGER' },
      { name: 'training_framework', type: 'VARCHAR(100)' },
      { name: 'quantized_versions', type: 'JSONB' },
      { name: 'hardware_requirements', type: 'TEXT' },
      { name: 'inference_speed', type: 'TEXT' },
      { name: 'memory_footprint', type: 'TEXT' },
      
      // Release and versioning
      { name: 'release_date_full', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'changelog', type: 'JSONB' },
      
      // Community and ecosystem
      { name: 'community_stats', type: 'JSONB' },
      { name: 'github_stats', type: 'JSONB' },
      
      // Evaluation and safety
      { name: 'evaluation_summary', type: 'TEXT' },
      { name: 'known_biases', type: 'JSONB' },
      { name: 'safety_results', type: 'JSONB' },
      { name: 'ethical_risks', type: 'JSONB' },
      
      // Model relationships
      { name: 'model_family', type: 'VARCHAR(255)' },
      { name: 'variant_parent_id', type: 'UUID' },
      { name: 'architecture_family', type: 'VARCHAR(255)' },
      
      // Extensible metadata
      { name: 'detailed_metadata', type: 'JSONB' },
    ];

    const addedColumns: string[] = [];
    const existingColumns: string[] = [];

    for (const column of columnsToAdd) {
      // Check if column already exists
      const columnCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'ai_models' AND column_name = $1
        )
      `, [column.name]);

      if (!columnCheck.rows[0].exists) {
        await pool.query(`ALTER TABLE ai_models ADD COLUMN ${column.name} ${column.type}`);
        
        // Add default value for variant_parent_id if needed
        if (column.name === 'variant_parent_id') {
          await pool.query(`
            ALTER TABLE ai_models 
            ADD CONSTRAINT fk_variant_parent 
            FOREIGN KEY (variant_parent_id) 
            REFERENCES ai_models(id) 
            ON DELETE SET NULL
          `);
        }
        
        addedColumns.push(column.name);
        console.log(`Added ${column.name} to ai_models`);
      } else {
        existingColumns.push(column.name);
        console.log(`${column.name} already exists in ai_models`);
      }
    }

    // Create indexes for frequently queried columns
    const indexesToCreate = [
      { name: 'idx_ai_models_family', column: 'model_family' },
      { name: 'idx_ai_models_architecture_family', column: 'architecture_family' },
      { name: 'idx_ai_models_variant_parent', column: 'variant_parent_id' },
      { name: 'idx_ai_models_release_date', column: 'release_date_full' },
    ];

    for (const index of indexesToCreate) {
      try {
        const indexCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM pg_indexes 
            WHERE indexname = $1
          )
        `, [index.name]);

        if (!indexCheck.rows[0].exists) {
          await pool.query(`CREATE INDEX ${index.name} ON ai_models(${index.column})`);
          console.log(`Created index ${index.name}`);
        }
      } catch (err) {
        console.log(`Index ${index.name} may already exist or column may be nullable:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Model schema extension completed',
      addedColumns,
      existingColumns,
      totalColumns: columnsToAdd.length
    });
  } catch (error) {
    console.error('Error extending model schema:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extend model schema', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

