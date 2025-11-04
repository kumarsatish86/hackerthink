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

// Helper function to parse JSONB fields
function parseJsonField(field: any) {
  if (!field) return null;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

// GET single dataset by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const result = await pool.query(
      `SELECT * FROM datasets WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await pool.query(
      'UPDATE datasets SET view_count = view_count + 1 WHERE slug = $1',
      [slug]
    );

    const dataset = result.rows[0];

    // Parse JSONB fields
    dataset.features = parseJsonField(dataset.features) || [];
    dataset.split_info = parseJsonField(dataset.split_info) || {};
    dataset.languages = parseJsonField(dataset.languages) || [];
    dataset.task_types = parseJsonField(dataset.task_types) || [];
    dataset.categories = parseJsonField(dataset.categories) || [];
    dataset.tags = parseJsonField(dataset.tags) || [];
    dataset.sample_data = parseJsonField(dataset.sample_data) || {};
    dataset.schema_json = parseJsonField(dataset.schema_json) || {};

    // Fetch models trained on this dataset
    // Try to find models that reference this dataset in training_data or model_training_data
    try {
      const datasetName = dataset.name;
      
      // Query 1: Check model_training_data table
      const modelsFromTable = await pool.query(
        `SELECT DISTINCT m.id, m.name, m.slug, m.developer, m.model_type, m.parameters, m.logo_url
         FROM ai_models m
         JOIN model_training_data td ON m.id = td.model_id
         WHERE td.dataset_name ILIKE $1 OR td.dataset_name ILIKE $2
         AND m.status = 'published'
         ORDER BY m.name`,
        [`%${datasetName}%`, `%${dataset.name.toLowerCase()}%`]
      );

      // Query 2: Check training_data field (contains dataset name)
      const modelsFromField = await pool.query(
        `SELECT id, name, slug, developer, model_type, parameters, logo_url
         FROM ai_models
         WHERE (training_data ILIKE $1 OR training_data ILIKE $2)
         AND status = 'published'
         ORDER BY name`,
        [`%${datasetName}%`, `%${dataset.name.toLowerCase()}%`]
      );

      // Combine and deduplicate
      const allModels = [...modelsFromTable.rows, ...modelsFromField.rows];
      const uniqueModels = Array.from(
        new Map(allModels.map(m => [m.id, m])).values()
      );

      dataset.models_trained_on_it = uniqueModels;
    } catch (error) {
      console.error('Error fetching related models:', error);
      dataset.models_trained_on_it = [];
    }

    // Fetch similar datasets (same type or domain)
    try {
      const similarDatasets = await pool.query(
        `SELECT id, name, slug, dataset_type, domain, rating, download_count, logo_url
         FROM datasets
         WHERE (dataset_type = $1 OR domain = $2)
         AND slug != $3
         AND status = 'published'
         ORDER BY rating DESC, download_count DESC
         LIMIT 6`,
        [dataset.dataset_type, dataset.domain, slug]
      );
      dataset.similar_datasets = similarDatasets.rows;
    } catch (error) {
      console.error('Error fetching similar datasets:', error);
      dataset.similar_datasets = [];
    }

    return NextResponse.json({ dataset });

  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

