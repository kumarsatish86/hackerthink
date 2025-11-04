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

// GET dataset by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if slug is a UUID (ID) or actual slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    const query = isUUID 
      ? `SELECT 
          id, name, slug, provider, description, full_description, dataset_type, format,
          size, rows, columns, language, languages, domain, task_types, license, 
          citation, paper_url, documentation_url, download_url, huggingface_url,
          kaggle_url, github_url, sample_data, preprocessing_info, quality_score,
          collection_method, ethical_considerations, release_date, last_updated,
          version, logo_url, featured_image, status, featured, categories, tags,
          seo_title, seo_description, seo_keywords, schema_json, bias_notes,
          pii_present, pii_description, accessibility, changelog, rating, rating_count,
          view_count, download_count, created_at, updated_at
        FROM datasets 
        WHERE id = $1`
      : `SELECT 
          id, name, slug, provider, description, full_description, dataset_type, format,
          size, rows, columns, language, languages, domain, task_types, license, 
          citation, paper_url, documentation_url, download_url, huggingface_url,
          kaggle_url, github_url, sample_data, preprocessing_info, quality_score,
          collection_method, ethical_considerations, release_date, last_updated,
          version, logo_url, featured_image, status, featured, categories, tags,
          seo_title, seo_description, seo_keywords, schema_json, bias_notes,
          pii_present, pii_description, accessibility, changelog, rating, rating_count,
          view_count, download_count, created_at, updated_at
        FROM datasets 
        WHERE slug = $1`;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ dataset: result.rows[0] });

  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

// PUT update dataset by slug or ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await request.json();
    
    const {
      name, provider, description, full_description, dataset_type,
      format, size, rows, columns, features, split_info, language, languages,
      domain, task_types, license, citation, paper_url, documentation_url,
      download_url, huggingface_url, kaggle_url, github_url, sample_data,
      preprocessing_info, quality_score, collection_method, ethical_considerations,
      release_date, last_updated, version, logo_url, featured_image, status,
      featured, categories, tags, seo_title, seo_description, seo_keywords,
      schema_json, bias_notes, pii_present, pii_description, accessibility,
      changelog, rating, rating_count
    } = data;

    // Check if slug is a UUID (ID) or actual slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    // First, find the dataset by slug or ID
    const findQuery = isUUID 
      ? 'SELECT id FROM datasets WHERE id = $1'
      : 'SELECT id FROM datasets WHERE slug = $1';
    
    const findResult = await pool.query(findQuery, [slug]);
    
    if (findResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    const datasetId = findResult.rows[0].id;

    // Ensure status is valid
    const validStatus = status && ['draft', 'published', 'archived'].includes(status) 
      ? status 
      : 'draft';

    // Update dataset
    const updateQuery = `
      UPDATE datasets SET
        name = $1, provider = $2, description = $3, full_description = $4, 
        dataset_type = $5, format = $6, size = $7, rows = $8, columns = $9,
        features = $10, split_info = $11, language = $12, languages = $13,
        domain = $14, task_types = $15, license = $16, citation = $17,
        paper_url = $18, documentation_url = $19, download_url = $20,
        huggingface_url = $21, kaggle_url = $22, github_url = $23,
        sample_data = $24, preprocessing_info = $25, quality_score = $26,
        collection_method = $27, ethical_considerations = $28,
        release_date = $29, last_updated = $30, version = $31,
        logo_url = $32, featured_image = $33, status = $34, featured = $35,
        categories = $36, tags = $37, seo_title = $38, seo_description = $39,
        seo_keywords = $40, schema_json = $41, updated_at = CURRENT_TIMESTAMP
      WHERE id = $42
      RETURNING *
    `;

    const values = [
      name, provider, description, full_description, dataset_type,
      format, size, rows, columns, JSON.stringify(features || {}),
      JSON.stringify(split_info || {}), language, JSON.stringify(languages || []),
      domain, JSON.stringify(task_types || []), license, citation,
      paper_url, documentation_url, download_url,
      huggingface_url, kaggle_url, github_url,
      JSON.stringify(sample_data || {}), preprocessing_info, quality_score,
      collection_method, ethical_considerations,
      release_date, last_updated, version,
      logo_url, featured_image, validStatus, featured || false,
      JSON.stringify(categories || []), JSON.stringify(tags || []),
      seo_title, seo_description, seo_keywords,
      JSON.stringify(schema_json || {}),
      datasetId
    ];

    const result = await pool.query(updateQuery, values);

    return NextResponse.json({
      dataset: result.rows[0],
      message: 'Dataset updated successfully'
    });

  } catch (error) {
    console.error('Error updating dataset:', error);
    return NextResponse.json(
      { error: 'Failed to update dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE dataset by slug or ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if slug is a UUID (ID) or actual slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    
    // First, find the dataset by slug or ID
    const findQuery = isUUID 
      ? 'SELECT id, name FROM datasets WHERE id = $1'
      : 'SELECT id, name FROM datasets WHERE slug = $1';
    
    const findResult = await pool.query(findQuery, [slug]);
    
    if (findResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    const datasetId = findResult.rows[0].id;
    const datasetName = findResult.rows[0].name;

    // Delete the dataset
    const deleteResult = await pool.query(
      'DELETE FROM datasets WHERE id = $1 RETURNING id, name',
      [datasetId]
    );

    if (deleteResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete dataset' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Dataset "${datasetName}" deleted successfully`,
      deleted: deleteResult.rows[0]
    });

  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json(
      { error: 'Failed to delete dataset', details: (error as Error).message },
      { status: 500 }
    );
  }
}

