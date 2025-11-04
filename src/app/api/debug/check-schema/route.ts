import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const dynamic = 'force-dynamic';

// Debug endpoint to check database schema for ai_models table
export async function GET() {
  try {
    // Get all columns from ai_models table
    const columnsResult = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'ai_models'
      ORDER BY ordinal_position
    `);

    const columns = columnsResult.rows;

    // Fields we're trying to save in the import route
    const fieldsWeSave = [
      'name', 'slug', 'developer', 'description', 'full_description', 
      'model_type', 'architecture', 'parameters', 'context_length', 
      'license', 'github_url', 'huggingface_url', 'download_count', 
      'categories', 'tags', 'status', 'import_source', 'import_metadata', 
      'enrichment_applied', 'ideal_hardware', 'risk_score', 
      'comparison_notes', 'tutorial_links', 'community_links'
    ];

    // Check which fields exist vs what we're trying to save
    const existingColumns = columns.map(col => col.column_name);
    const missingColumns = fieldsWeSave.filter(field => !existingColumns.includes(field));
    const extraColumns = existingColumns.filter(col => !fieldsWeSave.includes(col));

    // Fields we extract from HuggingFace
    const hfExtractedFields = {
      'parameters': 'VARCHAR(50) or TEXT',
      'architecture': 'VARCHAR(100)',
      'context_length': 'INTEGER',
      'license': 'VARCHAR(100)',
      'full_description': 'TEXT'
    };

    // Check if extracted fields have proper column types
    const extractedFieldsCheck = Object.keys(hfExtractedFields).map(field => {
      const col = columns.find(c => c.column_name === field);
      return {
        field,
        expected: hfExtractedFields[field as keyof typeof hfExtractedFields],
        actual: col ? `${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}` : 'MISSING',
        exists: !!col
      };
    });

    return NextResponse.json({
      summary: {
        totalColumns: columns.length,
        fieldsWeTryToSave: fieldsWeSave.length,
        missingColumns,
        hasAllFields: missingColumns.length === 0
      },
      allColumns: columns,
      extractedFieldsCheck,
      missingColumns,
      extraColumns,
      recommendation: missingColumns.length > 0 
        ? `Missing columns: ${missingColumns.join(', ')}. You may need to run a migration.`
        : 'All required columns exist! ✅'
    });
  } catch (error) {
    console.error('Error checking schema:', error);
    return NextResponse.json(
      { error: 'Failed to check schema', details: String(error) },
      { status: 500 }
    );
  }
}

