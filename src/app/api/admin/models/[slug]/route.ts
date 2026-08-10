import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export const dynamic = 'force-dynamic';

// Satellite tables surfaced alongside the core row so the admin docs editor
// (`/admin/content/models/[slug]/edit`) can hydrate every tab from a single
// request. Mutations for these go through `/api/admin/models/[slug]/relations`.
const SATELLITE_QUERIES: Record<string, string> = {
  faqs: `SELECT * FROM model_faqs WHERE model_id = $1 ORDER BY sort_order, question`,
  install_guides: `SELECT * FROM model_install_guides WHERE model_id = $1 ORDER BY sort_order, target`,
  usage_examples: `SELECT * FROM model_usage_examples WHERE model_id = $1 ORDER BY sort_order, title`,
  papers: `SELECT * FROM model_papers WHERE model_id = $1 ORDER BY published_at DESC NULLS LAST, title`,
  security_notes: `SELECT * FROM model_security_notes WHERE model_id = $1 ORDER BY created_at DESC`,
  benchmarks: `SELECT * FROM model_benchmarks WHERE model_id = $1 ORDER BY benchmark_name`,
  variants: `SELECT v.*, m.slug AS variant_slug FROM model_variants v LEFT JOIN ai_models m ON m.id = v.variant_model_id WHERE v.model_id = $1 ORDER BY v.sort_order, v.name`,
  comparisons: `SELECT c.*, m.name AS peer_name, m.slug AS resolved_slug FROM model_comparisons c LEFT JOIN ai_models m ON m.id = c.peer_model_id WHERE c.model_id = $1 ORDER BY c.sort_order`,
  community_links: `SELECT * FROM model_community_links WHERE model_id = $1 ORDER BY title`,
  architecture_nodes: `SELECT * FROM model_architecture_nodes WHERE model_id = $1 ORDER BY sort_order, title`,
  use_case_cards: `SELECT * FROM model_use_case_cards WHERE model_id = $1 ORDER BY sort_order, industry`,
  api_docs: `SELECT * FROM model_api_docs WHERE model_id = $1 ORDER BY sort_order, doc_type`,
  tutorials: `SELECT * FROM model_tutorials WHERE model_id = $1 ORDER BY sort_order, title`,
};

// GET model by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Use SELECT * so missing optional columns from newer migrations don't break the admin editor
    const result = await pool.query(
      `SELECT * FROM ai_models WHERE slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    const model = result.rows[0];

    const satelliteEntries = Object.entries(SATELLITE_QUERIES);
    const satelliteResults = await Promise.all(
      satelliteEntries.map(([, sql]) => pool.query(sql, [model.id]).catch(() => ({ rows: [] })))
    );

    const satellites: Record<string, any[]> = {};
    satelliteEntries.forEach(([key], index) => {
      satellites[key] = satelliteResults[index].rows;
    });

    return NextResponse.json({ model, ...satellites });

  } catch (error: any) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model', details: error?.message },
      { status: 500 }
    );
  }
}

// PUT update model by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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

    // Only update columns that exist (schema may be partially migrated)
    const columnCheck = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'ai_models'
    `);
    const existingColumns = new Set(columnCheck.rows.map((r: any) => r.column_name));

    const contextLength = data.context_length && data.context_length !== '' ? parseInt(data.context_length) : null;
    const vocabularySize = data.vocabulary_size && data.vocabulary_size !== '' ? parseInt(data.vocabulary_size) : null;
    const paramCountB = data.param_count_b !== undefined && data.param_count_b !== null && data.param_count_b !== ''
      ? parseFloat(data.param_count_b)
      : null;

    const toJsonArray = (value: any) =>
      Array.isArray(value) ? JSON.stringify(value) : (typeof value === 'string' && value ? value : '[]');

    const toJsonObject = (value: any) => {
      if (value === undefined || value === null || value === '') return '{}';
      if (typeof value === 'string') return value;
      return JSON.stringify(value);
    };

    const toBool = (value: any) => Boolean(value);

    const fieldValues: Record<string, any> = {
      name: data.name,
      slug: data.slug,
      developer: data.developer,
      description: data.description,
      full_description: data.full_description,
      model_type: data.model_type,
      architecture: data.architecture,
      parameters: data.parameters,
      context_length: contextLength,
      tokenizer: data.tokenizer,
      vocabulary_size: vocabularySize,
      training_framework: data.training_framework,
      quantized_versions: toJsonArray(data.quantized_versions),
      version: data.version,
      license: data.license,
      pricing_type: data.pricing_type,
      status: data.status,
      featured: data.featured,
      homepage_url: data.homepage_url,
      api_platform_url: data.api_platform_url,
      modelscope_url: data.modelscope_url,
      github_url: data.github_url,
      huggingface_url: data.huggingface_url,
      paper_url: data.paper_url,
      demo_url: data.demo_url,
      documentation_url: data.documentation_url,
      logo_url: data.logo_url,
      hardware_requirements: data.hardware_requirements,
      inference_speed: data.inference_speed,
      memory_footprint: data.memory_footprint,
      categories: toJsonArray(data.categories),
      tags: toJsonArray(data.tags),
      capabilities: toJsonArray(data.capabilities),
      use_cases: toJsonArray(data.use_cases),
      release_date: data.release_date || null,

      // Docs-editor / classification columns (001_models_module_rebuild.sql)
      verified: toBool(data.verified),
      security_badge: toBool(data.security_badge),
      compatibility_badge: toBool(data.compatibility_badge),
      external_model_id: data.external_model_id,
      task: data.task,
      framework: data.framework,
      input_types: toJsonArray(data.input_types),
      output_types: toJsonArray(data.output_types),
      param_count_b: paramCountB,
      model_family: data.model_family,
      architecture_family: data.architecture_family,
      likes_count: data.likes_count !== undefined && data.likes_count !== '' ? parseInt(data.likes_count) : null,
      stars_count: data.stars_count !== undefined && data.stars_count !== '' ? parseInt(data.stars_count) : null,
      trending_rank: data.trending_rank !== undefined && data.trending_rank !== '' ? parseInt(data.trending_rank) : null,
      evaluation_summary: data.evaluation_summary,

      // AI-generated documentation JSON columns
      playground_config: toJsonObject(data.playground_config),
      ai_summary: toJsonObject(data.ai_summary),
      quick_facts: toJsonObject(data.quick_facts),
      compatibility_matrix: toJsonObject(data.compatibility_matrix),
      overview_guidance: toJsonObject(data.overview_guidance),
    };

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    for (const [column, value] of Object.entries(fieldValues)) {
      if (!existingColumns.has(column)) continue;
      updateFields.push(`${column} = $${paramIndex}`);
      updateValues.push(value ?? null);
      paramIndex++;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(modelId);

    const result = await pool.query(
      `UPDATE ai_models SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      updateValues
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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
