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

// GET single model by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const result = await pool.query(
      `SELECT * FROM ai_models WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await pool.query(
      'UPDATE ai_models SET view_count = view_count + 1 WHERE slug = $1',
      [slug]
    );

    const model = result.rows[0];

    // Helper function to parse JSONB fields
    const parseJsonField = (field: any) => {
      if (!field) return null;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field;
        }
      }
      return field;
    };

    // Parse JSON fields (PostgreSQL JSONB columns are sometimes returned as strings)
    model.capabilities = parseJsonField(model.capabilities) || [];
    model.categories = parseJsonField(model.categories) || [];
    model.tags = parseJsonField(model.tags) || [];
    model.use_cases = parseJsonField(model.use_cases) || [];
    model.import_metadata = parseJsonField(model.import_metadata) || {};
    model.benchmarks = parseJsonField(model.benchmarks) || {};
    model.quantized_versions = parseJsonField(model.quantized_versions) || [];
    model.changelog = parseJsonField(model.changelog) || [];
    model.community_stats = parseJsonField(model.community_stats) || {};
    model.github_stats = parseJsonField(model.github_stats) || {};
    model.detailed_metadata = parseJsonField(model.detailed_metadata) || {};
    model.known_biases = parseJsonField(model.known_biases) || [];
    model.safety_results = parseJsonField(model.safety_results) || {};
    model.ethical_risks = parseJsonField(model.ethical_risks) || {};

    // Fetch related data from joined tables
    try {
      // Fetch benchmarks
      const benchmarksResult = await pool.query(
        'SELECT * FROM model_benchmarks WHERE model_id = $1 ORDER BY category, benchmark_name',
        [model.id]
      );
      model.benchmarks_list = benchmarksResult.rows;

      // Fetch variants
      const variantsResult = await pool.query(
        `SELECT v.*, m.name as variant_name, m.slug as variant_slug 
         FROM model_variants v
         JOIN ai_models m ON v.variant_model_id = m.id
         WHERE v.parent_model_id = $1`,
        [model.id]
      );
      model.variants = variantsResult.rows;

      // Also fetch if this model is a variant of another
      const parentResult = await pool.query(
        `SELECT v.*, m.name as parent_name, m.slug as parent_slug
         FROM model_variants v
         JOIN ai_models m ON v.parent_model_id = m.id
         WHERE v.variant_model_id = $1`,
        [model.id]
      );
      model.parent_models = parentResult.rows;

      // Fetch training data sources
      const trainingDataResult = await pool.query(
        'SELECT * FROM model_training_data WHERE model_id = $1 ORDER BY token_count DESC NULLS LAST',
        [model.id]
      );
      model.training_data_sources = trainingDataResult.rows;

      // Fetch community links
      const communityLinksResult = await pool.query(
        'SELECT * FROM model_community_links WHERE model_id = $1 ORDER BY link_type',
        [model.id]
      );
      model.community_links_list = communityLinksResult.rows;

      // Fetch usage examples
      const usageExamplesResult = await pool.query(
        'SELECT * FROM model_usage_examples WHERE model_id = $1 ORDER BY order_index, example_type',
        [model.id]
      );
      model.usage_examples = usageExamplesResult.rows;

      // Fetch changelog
      const changelogResult = await pool.query(
        'SELECT * FROM model_changelog WHERE model_id = $1 ORDER BY release_date DESC NULLS LAST, version DESC',
        [model.id]
      );
      model.changelog_list = changelogResult.rows;
    } catch (relatedError) {
      console.error(`[API] Error fetching related data for ${slug}:`, relatedError);
      // Set defaults if error
      model.benchmarks_list = [];
      model.variants = [];
      model.parent_models = [];
      model.training_data_sources = [];
      model.community_links_list = [];
      model.usage_examples = [];
      model.changelog_list = [];
    }

    // Enrich with Hugging Face README and metadata if available
    try {
      const meta = model.import_metadata || {};
      const extracted = meta.extracted || {};
      const huggingfaceUrl: string | undefined = model.huggingface_url || undefined;

      // Use extracted technical details from metadata if database fields are empty
      if (!model.parameters && extracted.parameters) {
        model.parameters = extracted.parameters;
      }
      if (!model.architecture && extracted.architecture) {
        model.architecture = extracted.architecture;
      }
      if (!model.context_length && extracted.context_length) {
        model.context_length = Number(extracted.context_length);
      }
      if (!model.license && (extracted.license || meta.license)) {
        model.license = extracted.license || meta.license;
      }

      // Extract new technical fields from detailed_metadata if database fields are empty
      const detailedMeta = model.detailed_metadata || {};
      if (!model.tokenizer && detailedMeta.tokenizer) {
        model.tokenizer = detailedMeta.tokenizer;
      }
      if (!model.vocabulary_size && detailedMeta.vocabulary_size) {
        model.vocabulary_size = Number(detailedMeta.vocabulary_size);
      }
      if (!model.training_framework && detailedMeta.training_framework) {
        model.training_framework = detailedMeta.training_framework;
      }
      if (!model.quantized_versions && detailedMeta.quantized_versions) {
        model.quantized_versions = Array.isArray(detailedMeta.quantized_versions) 
          ? detailedMeta.quantized_versions 
          : [];
      }

      // Add training data sources from detailed_metadata if not in database table
      if (model.training_data_sources.length === 0 && detailedMeta.training_data_sources) {
        model.training_data_sources = Array.isArray(detailedMeta.training_data_sources)
          ? detailedMeta.training_data_sources
          : [];
      }
      
      // Full description from metadata if available
      if (!model.full_description && meta.readme) {
        model.full_description = meta.readme;
      }

      // Tags and task/library as capabilities/extra info
      if (!model.capabilities && Array.isArray(meta.tags)) {
        model.capabilities = meta.tags.slice(0, 12);
      }

      // Expose additional HF data from metadata - check if it exists and is not empty
      if (meta.safetensors && Object.keys(meta.safetensors).length > 0) {
        model.safetensors = meta.safetensors;
      }
      if (meta.model_tree && Object.keys(meta.model_tree).length > 0) {
        model.model_tree = meta.model_tree;
      }
      if (meta.spaces_using && Array.isArray(meta.spaces_using) && meta.spaces_using.length > 0) {
        model.spaces_using = meta.spaces_using;
      }
      if (meta.links && Object.keys(meta.links).length > 0) {
        model.links = meta.links;
      }
      if (meta.coding_benchmarks && Object.keys(meta.coding_benchmarks).length > 0) {
        model.coding_benchmarks = meta.coding_benchmarks;
      }
      if (meta.intelligence_benchmarks && Object.keys(meta.intelligence_benchmarks).length > 0) {
        model.intelligence_benchmarks = meta.intelligence_benchmarks;
      }

      // Debug logging to help diagnose
      console.log(`[API] Model ${slug} metadata check:`, {
        hasMetadata: !!model.import_metadata,
        hasSafetensors: !!meta.safetensors,
        hasModelTree: !!meta.model_tree,
        hasSpacesUsing: !!meta.spaces_using && Array.isArray(meta.spaces_using),
        spacesCount: Array.isArray(meta.spaces_using) ? meta.spaces_using.length : 0,
        hasLinks: !!meta.links,
        hasCodingBenchmarks: !!meta.coding_benchmarks,
        hasIntelligenceBenchmarks: !!meta.intelligence_benchmarks,
        parameters: model.parameters || extracted.parameters || 'N/A',
        contextLength: model.context_length || extracted.context_length || 'N/A',
        architecture: model.architecture || extracted.architecture || 'N/A'
      });
      
      // Parse benchmarks JSONB field if it exists
      if (model.benchmarks && typeof model.benchmarks === 'string') {
        try {
          model.benchmarks = JSON.parse(model.benchmarks);
        } catch {
          model.benchmarks = {};
        }
      }

      // If no full_description, try to fetch README.md raw from HF
      if ((!model.full_description || model.full_description.trim() === '') && huggingfaceUrl) {
        const readmeUrl = huggingfaceUrl.replace('https://huggingface.co/', 'https://huggingface.co/') + '/raw/README.md';
        const resp = await fetch(readmeUrl, { next: { revalidate: 3600 } });
        if (resp.ok) {
          const md = await resp.text();
          if (md && md.trim().length > 0) {
            model.full_description = md;
          }
        }
      }
    } catch {}

    return NextResponse.json({ model });

  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

