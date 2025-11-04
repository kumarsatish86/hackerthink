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

// GET model by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const result = await pool.query(
      `SELECT 
        id, name, slug, developer, description, full_description, model_type,
        architecture, parameters, context_length, tokenizer, vocabulary_size,
        training_framework, quantized_versions, release_date, version, license,
        pricing_type, homepage_url, api_platform_url, modelscope_url,
        github_url, huggingface_url, paper_url, demo_url, documentation_url,
        logo_url, hardware_requirements, inference_speed, memory_footprint,
        capabilities, categories, tags, use_cases, status, featured,
        rating, rating_count, view_count, download_count,
        import_source, import_metadata, enrichment_applied,
        created_at, updated_at
      FROM ai_models 
      WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ model: result.rows[0] });

  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

// PUT update model by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const data = await request.json();

    // First get the model ID from slug
    const getModel = await pool.query(
      'SELECT id FROM ai_models WHERE slug = $1',
      [slug]
    );

    if (getModel.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    const modelId = getModel.rows[0].id;

    // Handle empty values for numeric fields
    const contextLength = data.context_length && data.context_length !== '' ? parseInt(data.context_length) : null;
    const vocabularySize = data.vocabulary_size && data.vocabulary_size !== '' ? parseInt(data.vocabulary_size) : null;

    // Prepare JSONB arrays
    const categories = Array.isArray(data.categories) ? JSON.stringify(data.categories) : (data.categories || '[]');
    const tags = Array.isArray(data.tags) ? JSON.stringify(data.tags) : (data.tags || '[]');
    const capabilities = Array.isArray(data.capabilities) ? JSON.stringify(data.capabilities) : (data.capabilities || '[]');
    const useCases = Array.isArray(data.use_cases) ? JSON.stringify(data.use_cases) : (data.use_cases || '[]');
    const quantizedVersions = Array.isArray(data.quantized_versions) ? JSON.stringify(data.quantized_versions) : (data.quantized_versions || '[]');
    const overrideFields = Array.isArray(data.override_fields) ? JSON.stringify(data.override_fields) : (data.override_fields || '[]');

    // Update the model using the ID - include all new fields
    const result = await pool.query(
      `UPDATE ai_models SET
        name = $1, slug = $2, developer = $3, description = $4, full_description = $5, model_type = $6,
        architecture = $7, parameters = $8, context_length = $9, tokenizer = $10,
        vocabulary_size = $11, training_framework = $12, quantized_versions = $13,
        version = $14, license = $15, pricing_type = $16, status = $17, featured = $18,
        homepage_url = $19, api_platform_url = $20, modelscope_url = $21,
        github_url = $22, huggingface_url = $23, paper_url = $24, demo_url = $25,
        documentation_url = $26, logo_url = $27, hardware_requirements = $28,
        inference_speed = $29, memory_footprint = $30,
        categories = $31, tags = $32, capabilities = $33, use_cases = $34,
        release_date = $35,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $36
      RETURNING *`,
      [
        data.name, data.slug, data.developer, data.description, data.full_description, data.model_type,
        data.architecture, data.parameters, contextLength, data.tokenizer,
        vocabularySize, data.training_framework, quantizedVersions,
        data.version, data.license, data.pricing_type, data.status, data.featured,
        data.homepage_url, data.api_platform_url, data.modelscope_url,
        data.github_url, data.huggingface_url, data.paper_url, data.demo_url,
        data.documentation_url, data.logo_url, data.hardware_requirements,
        data.inference_speed, data.memory_footprint,
        categories, tags, capabilities, useCases,
        data.release_date || null,
        modelId
      ]
    );

    return NextResponse.json({ 
      model: result.rows[0],
      message: 'Model updated successfully' 
    });

  } catch (error: any) {
    console.error('Error updating model:', error);
    return NextResponse.json(
      { error: 'Failed to update model', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE model by slug
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // First get the model ID from slug
    const getModel = await pool.query(
      'SELECT id FROM ai_models WHERE slug = $1',
      [slug]
    );

    if (getModel.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    const modelId = getModel.rows[0].id;

    // Delete any dependent rows via ON DELETE CASCADE (set in migration)
    const result = await pool.query(
      'DELETE FROM ai_models WHERE id = $1 RETURNING *',
      [modelId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Model deleted successfully' });
  } catch (error) {
    console.error('Error deleting model:', error);
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    );
  }
}

