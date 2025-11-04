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

// GET all models with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const model_type = searchParams.get('model_type') || 'all';
    const license = searchParams.get('license') || 'all';
    const pricing_type = searchParams.get('pricing_type') || 'all';
    const featured = searchParams.get('featured') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        name ILIKE $${paramIndex} OR 
        developer ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (model_type !== 'all') {
      whereConditions.push(`model_type = $${paramIndex}`);
      queryParams.push(model_type);
      paramIndex++;
    }

    if (license !== 'all') {
      whereConditions.push(`license = $${paramIndex}`);
      queryParams.push(license);
      paramIndex++;
    }

    if (pricing_type !== 'all') {
      whereConditions.push(`pricing_type = $${paramIndex}`);
      queryParams.push(pricing_type);
      paramIndex++;
    }

    if (featured !== 'all') {
      whereConditions.push(`featured = $${paramIndex}`);
      queryParams.push(featured === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM ai_models ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get models
    const modelsQuery = `
      SELECT 
        id, name, slug, developer, description, model_type, architecture,
        parameters, context_length, version, license, pricing_type, status,
        featured, rating, rating_count, view_count, download_count,
        capabilities, languages, use_cases, limitations, benchmarks,
        api_endpoint, documentation_url, demo_url, github_url, paper_url,
        huggingface_url, download_url, logo_url, featured_image, categories,
        tags, seo_title, seo_description, created_at, updated_at
      FROM ai_models
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const modelsResult = await pool.query(modelsQuery, queryParams);

    return NextResponse.json({
      models: modelsResult.rows,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

// POST create new model
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name, slug, developer, description, full_description, model_type,
      architecture, parameters, context_length, training_data, release_date,
      last_updated, version, license, pricing_type, pricing_details,
      capabilities, languages, use_cases, limitations, benchmarks,
      api_endpoint, documentation_url, demo_url, github_url, paper_url,
      huggingface_url, download_url, logo_url, featured_image, status,
      featured, categories, tags, seo_title, seo_description, seo_keywords,
      schema_json, created_by,
      // Enrichment fields
      ideal_hardware, risk_score, comparison_notes, tutorial_links,
      community_links, research_papers, alternative_models, deployment_guide,
      cost_estimate, import_source, import_metadata, enrichment_applied
    } = data;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingModel = await pool.query(
      'SELECT id FROM ai_models WHERE slug = $1',
      [slug]
    );

    if (existingModel.rows.length > 0) {
      return NextResponse.json(
        { error: 'Model with this slug already exists' },
        { status: 400 }
      );
    }

    // Insert model
    const insertQuery = `
      INSERT INTO ai_models (
        name, slug, developer, description, full_description, model_type,
        architecture, parameters, context_length, training_data, release_date,
        last_updated, version, license, pricing_type, pricing_details,
        capabilities, languages, use_cases, limitations, benchmarks,
        api_endpoint, documentation_url, demo_url, github_url, paper_url,
        huggingface_url, download_url, logo_url, featured_image, status,
        featured, categories, tags, seo_title, seo_description, seo_keywords,
        schema_json, created_by, ideal_hardware, risk_score, comparison_notes,
        tutorial_links, community_links, research_papers, alternative_models,
        deployment_guide, cost_estimate, import_source, import_metadata, enrichment_applied
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
        $42, $43, $44, $45, $46, $47, $48, $49, $50
      ) RETURNING *
    `;

    const values = [
      name, slug, developer, description, full_description, model_type,
      architecture, parameters, context_length, training_data, release_date,
      last_updated, version, license, pricing_type || 'free',
      JSON.stringify(pricing_details), JSON.stringify(capabilities || []),
      JSON.stringify(languages || []), JSON.stringify(use_cases || []),
      JSON.stringify(limitations || []), JSON.stringify(benchmarks),
      api_endpoint, documentation_url, demo_url, github_url, paper_url,
      huggingface_url, download_url, logo_url, featured_image,
      status || 'draft', featured || false, JSON.stringify(categories || []),
      JSON.stringify(tags || []), seo_title, seo_description, seo_keywords,
      JSON.stringify(schema_json), created_by,
      ideal_hardware || null, risk_score || 50, comparison_notes || null,
      JSON.stringify(tutorial_links || []), JSON.stringify(community_links || []),
      JSON.stringify(research_papers || []), JSON.stringify(alternative_models || []),
      deployment_guide || null, JSON.stringify(cost_estimate || {}),
      import_source || null, JSON.stringify(import_metadata || {}), enrichment_applied || false
    ];

    const result = await pool.query(insertQuery, values);

    return NextResponse.json({
      model: result.rows[0],
      message: 'Model created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating model:', error);
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    );
  }
}

