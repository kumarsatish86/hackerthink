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

// GET public models list with filters, sorting, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const modelType = searchParams.get('model_type');
    const license = searchParams.get('license');
    const organization = searchParams.get('organization');
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';
    const minParams = searchParams.get('min_params');
    const maxParams = searchParams.get('max_params');

    // Build SELECT query - using only core columns that should definitely exist
    let query = `
      SELECT 
        id, name, slug, developer, description, model_type, 
        parameters,
        context_length, architecture, license, 
        rating,
        rating_count, 
        download_count, 
        logo_url, created_at,
        status
      FROM ai_models 
      WHERE status = $1
    `;
    const params: any[] = [status];
    let paramIndex = 2;

    // Search filter
    if (search) {
      query += ` AND (
        name ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        developer ILIKE $${paramIndex} OR
        slug ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Model type filter (can be comma-separated list for categories)
    if (modelType) {
      const types = modelType.split(',');
      if (types.length === 1) {
        query += ` AND model_type = $${paramIndex}`;
        params.push(types[0]);
      } else {
        query += ` AND model_type = ANY($${paramIndex}::text[])`;
        params.push(types);
      }
      paramIndex++;
    }

    // License filter
    if (license) {
      query += ` AND license = $${paramIndex}`;
      params.push(license);
      paramIndex++;
    }

    // Organization filter
    if (organization) {
      query += ` AND developer ILIKE $${paramIndex}`;
      params.push(`%${organization}%`);
      paramIndex++;
    }

    // Parameter range filter (requires parsing parameters field)
    if (minParams || maxParams) {
      // This is a simplified filter - in production, you'd want to parse parameters better
      // For now, we'll filter models that have parameters field
      query += ` AND parameters IS NOT NULL`;
    }

    // Sorting - only use fields that definitely exist
    const validSortFields: Record<string, string> = {
      'created_at': 'created_at',
      'rating': 'rating',
      'downloads': 'download_count',
      'download_count': 'download_count',
      'name': 'name',
      'parameters': 'parameters'
    };

    const sortField = validSortFields[sortBy] || 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${order} NULLS LAST`;

    // Limit
    query += ` LIMIT $${paramIndex}`;
    params.push(limit);

    console.log('Executing query with params:', { status, limit, params });
    
    const result = await pool.query(query, params);
    
    console.log('Query executed successfully, found', result.rows.length, 'models');

    // Get filter options for UI (with error handling)
    let typesResult: any = { rows: [] };
    let licensesResult: any = { rows: [] };
    
    try {
      const [types, licenses] = await Promise.all([
        pool.query(`SELECT DISTINCT model_type FROM ai_models WHERE status = $1 AND model_type IS NOT NULL ORDER BY model_type`, [status]),
        pool.query(`SELECT DISTINCT license FROM ai_models WHERE status = $1 AND license IS NOT NULL ORDER BY license`, [status])
      ]);
      typesResult = types;
      licensesResult = licenses;
    } catch (filterError) {
      console.error('Error fetching filter options:', filterError);
      // Continue without filter options
    }

    return NextResponse.json({ 
      models: result.rows,
      total: result.rows.length,
      filterOptions: {
        modelTypes: typesResult.rows?.map((r: any) => r.model_type).filter(Boolean) || [],
        licenses: licensesResult.rows?.map((r: any) => r.license).filter(Boolean) || []
      }
    });
  } catch (error) {
    console.error('Error fetching public models:', error);
    console.error('Error stack:', (error as Error).stack);
    console.error('Error details:', {
      message: (error as Error).message,
      name: (error as Error).name
    });
    return NextResponse.json(
      { 
        error: 'Failed to fetch models', 
        details: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

