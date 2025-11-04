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

// Migration to add additional HuggingFace fields to ai_models table
export async function GET() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('Adding HuggingFace extra fields to ai_models...');
    
    const columns = [
      // Links - store as JSONB for flexibility
      'homepage_url VARCHAR(500)',
      'api_platform_url VARCHAR(500)',
      'modelscope_url VARCHAR(500)',
      'contact_info TEXT',
      
      // Additional URLs (we already have github_url, huggingface_url)
      // These can be stored in import_metadata.links JSONB
    ];

    for (const column of columns) {
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

    await client.query('COMMIT');
    
    return NextResponse.json({ 
      success: true, 
      message: 'HuggingFace extra fields added successfully' 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: String(error) },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

