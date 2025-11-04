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

// Debug endpoint to check model data in database
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const result = await pool.query(
      `SELECT * FROM ai_models WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    const model = result.rows[0];
    
    // Parse import_metadata to check extracted data
    let importMetadata = {};
    if (model.import_metadata) {
      try {
        importMetadata = typeof model.import_metadata === 'string' 
          ? JSON.parse(model.import_metadata) 
          : model.import_metadata;
      } catch (e) {
        importMetadata = {};
      }
    }

    return NextResponse.json({
      slug,
      databaseFields: {
        parameters: model.parameters,
        architecture: model.architecture,
        context_length: model.context_length,
        license: model.license,
        full_description: model.full_description ? `Present (${model.full_description.length} chars)` : 'Missing',
        status: model.status
      },
      importMetadata: {
        extracted: importMetadata.extracted || {},
        hasConfig: !!importMetadata.configs,
        configKeys: importMetadata.configs ? Object.keys(importMetadata.configs) : [],
        hasReadme: !!importMetadata.readme,
      },
      rawImportMetadata: importMetadata,
      rawModel: {
        name: model.name,
        developer: model.developer,
        model_type: model.model_type,
        huggingface_url: model.huggingface_url,
        status: model.status,
        created_at: model.created_at,
        updated_at: model.updated_at
      }
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug info', details: String(error) },
      { status: 500 }
    );
  }
}

