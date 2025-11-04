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

// GET public datasets list with filters, sorting, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const datasetType = searchParams.get('dataset_type');
    const domain = searchParams.get('domain');
    const license = searchParams.get('license');
    const year = searchParams.get('year');
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';

    // Build SELECT query
    let query = `
      SELECT id, name, slug, provider, description, dataset_type, format, size,
       rows, language, languages, domain, license, rating, rating_count, 
       download_count, view_count, logo_url, release_date, created_at 
      FROM datasets 
      WHERE status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    // Search filter
    if (search) {
      query += ` AND (
        name ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        provider ILIKE $${paramIndex} OR
        slug ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Dataset type filter
    if (datasetType) {
      query += ` AND dataset_type = $${paramIndex}`;
      params.push(datasetType);
      paramIndex++;
    }

    // Domain filter
    if (domain) {
      query += ` AND domain = $${paramIndex}`;
      params.push(domain);
      paramIndex++;
    }

    // License filter
    if (license) {
      query += ` AND license = $${paramIndex}`;
      params.push(license);
      paramIndex++;
    }

    // Year filter (from release_date)
    if (year) {
      query += ` AND EXTRACT(YEAR FROM release_date) = $${paramIndex}`;
      params.push(parseInt(year));
      paramIndex++;
    }

    // Sorting
    const validSortColumns = ['created_at', 'release_date', 'name', 'rating', 'download_count', 'view_count'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortColumn} ${order}`;

    // Limit
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await pool.query(query, params);

    // Parse JSONB fields
    const datasets = result.rows.map(dataset => {
      dataset.languages = parseJsonField(dataset.languages) || [];
      return dataset;
    });

    // Get filter options for dropdowns
    const filterOptionsQuery = `
      SELECT 
        DISTINCT dataset_type,
        domain,
        license,
        EXTRACT(YEAR FROM release_date) as year
      FROM datasets 
      WHERE status = $1 
      AND dataset_type IS NOT NULL
      ORDER BY dataset_type, domain, license
    `;
    const filterOptionsResult = await pool.query(filterOptionsQuery, [status]);

    const filterOptions = {
      datasetTypes: [...new Set(filterOptionsResult.rows.map(r => r.dataset_type).filter(Boolean))].sort(),
      domains: [...new Set(filterOptionsResult.rows.map(r => r.domain).filter(Boolean))].sort(),
      licenses: [...new Set(filterOptionsResult.rows.map(r => r.license).filter(Boolean))].sort(),
      years: [...new Set(filterOptionsResult.rows.map(r => r.year ? Math.floor(r.year) : null).filter(Boolean))].sort((a, b) => b - a),
    };

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM datasets WHERE status = $1`;
    const countParams: any[] = [status];
    let countParamIndex = 2;

    if (search) {
      countQuery += ` AND (
        name ILIKE $${countParamIndex} OR 
        description ILIKE $${countParamIndex} OR 
        provider ILIKE $${countParamIndex} OR
        slug ILIKE $${countParamIndex}
      )`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    if (datasetType) {
      countQuery += ` AND dataset_type = $${countParamIndex}`;
      countParams.push(datasetType);
      countParamIndex++;
    }
    if (domain) {
      countQuery += ` AND domain = $${countParamIndex}`;
      countParams.push(domain);
      countParamIndex++;
    }
    if (license) {
      countQuery += ` AND license = $${countParamIndex}`;
      countParams.push(license);
      countParamIndex++;
    }
    if (year) {
      countQuery += ` AND EXTRACT(YEAR FROM release_date) = $${countParamIndex}`;
      countParams.push(parseInt(year));
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({ 
      datasets, 
      total,
      filterOptions 
    });
  } catch (error) {
    console.error('Error fetching public datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets', details: (error as Error).message },
      { status: 500 }
    );
  }
}

