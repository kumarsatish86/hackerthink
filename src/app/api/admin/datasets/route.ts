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

// GET all datasets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const dataset_type = searchParams.get('dataset_type') || 'all';
    const format = searchParams.get('format') || 'all';
    const domain = searchParams.get('domain') || 'all';
    const license = searchParams.get('license') || 'all';
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
        provider ILIKE $${paramIndex} OR 
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

    if (dataset_type !== 'all') {
      whereConditions.push(`dataset_type = $${paramIndex}`);
      queryParams.push(dataset_type);
      paramIndex++;
    }

    if (format !== 'all') {
      whereConditions.push(`format = $${paramIndex}`);
      queryParams.push(format);
      paramIndex++;
    }

    if (domain !== 'all') {
      whereConditions.push(`domain = $${paramIndex}`);
      queryParams.push(domain);
      paramIndex++;
    }

    if (license !== 'all') {
      whereConditions.push(`license = $${paramIndex}`);
      queryParams.push(license);
      paramIndex++;
    }

    if (featured !== 'all') {
      whereConditions.push(`featured = $${paramIndex}`);
      queryParams.push(featured === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM datasets ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get datasets
    const datasetsQuery = `
      SELECT *
      FROM datasets
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const datasetsResult = await pool.query(datasetsQuery, queryParams);

    return NextResponse.json({
      datasets: datasetsResult.rows,
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
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

// POST create new dataset
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name, slug, provider, description, full_description, dataset_type,
      format, size, rows, columns, features, split_info, language, languages,
      domain, task_types, license, citation, paper_url, documentation_url,
      download_url, huggingface_url, kaggle_url, github_url, sample_data,
      preprocessing_info, quality_score, collection_method, ethical_considerations,
      release_date, last_updated, version, logo_url, featured_image, status,
      featured, categories, tags, seo_title, seo_description, seo_keywords,
      schema_json, created_by
    } = data;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingDataset = await pool.query(
      'SELECT id FROM datasets WHERE slug = $1',
      [slug]
    );

    if (existingDataset.rows.length > 0) {
      return NextResponse.json(
        { error: 'Dataset with this slug already exists' },
        { status: 400 }
      );
    }

    // Insert dataset
    const insertQuery = `
      INSERT INTO datasets (
        name, slug, provider, description, full_description, dataset_type,
        format, size, rows, columns, features, split_info, language, languages,
        domain, task_types, license, citation, paper_url, documentation_url,
        download_url, huggingface_url, kaggle_url, github_url, sample_data,
        preprocessing_info, quality_score, collection_method, ethical_considerations,
        release_date, last_updated, version, logo_url, featured_image, status,
        featured, categories, tags, seo_title, seo_description, seo_keywords,
        schema_json, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43
      ) RETURNING *
    `;

      // Ensure status is valid - default to 'draft' only if not provided or invalid
      const validStatus = status && ['draft', 'published', 'archived'].includes(status) 
        ? status 
        : 'draft';
      
      console.log('Creating dataset with status:', validStatus, 'received status:', status);

      // Helper function to safely stringify JSONB fields
      const safeStringify = (value: any): string | null => {
        if (value === null || value === undefined || value === '') return null;
        if (typeof value === 'string') {
          // If it's already a string, try to parse it first to validate
          try {
            const parsed = JSON.parse(value);
            // If it parsed successfully, return the original string (already valid JSON)
            return value;
          } catch {
            // Not valid JSON string, might be empty or invalid - return null
            return null;
          }
        }
        // If it's an object/array, stringify it
        if (typeof value === 'object') {
          return JSON.stringify(value);
        }
        return null;
      };

      // Convert numeric fields with validation
      const rowsValue = rows 
        ? (typeof rows === 'number' && !isNaN(rows) ? rows : 
           (typeof rows === 'string' ? (isNaN(parseInt(rows)) ? null : parseInt(rows)) : null))
        : null;
      
      const columnsValue = columns 
        ? (typeof columns === 'number' && !isNaN(columns) ? columns : 
           (typeof columns === 'string' ? (isNaN(parseInt(columns)) ? null : parseInt(columns)) : null))
        : null;
      
      const qualityScoreValue = quality_score 
        ? (typeof quality_score === 'number' && !isNaN(quality_score) ? quality_score : 
           (typeof quality_score === 'string' ? (isNaN(parseFloat(quality_score)) ? null : parseFloat(quality_score)) : null))
        : null;

      // Validate quality_score range (0-5)
      const validatedQualityScore = qualityScoreValue !== null && !isNaN(qualityScoreValue) && qualityScoreValue >= 0 && qualityScoreValue <= 5
        ? qualityScoreValue
        : null;

      // Build values array - ensure all 43 values match the 43 columns
      const values = [
        name,                                                    // 1. name
        slug,                                                    // 2. slug
        provider || null,                                        // 3. provider
        description || null,                                     // 4. description
        full_description || null,                                // 5. full_description
        dataset_type || null,                                    // 6. dataset_type
        format || null,                                          // 7. format
        size || null,                                            // 8. size
        rowsValue,                                               // 9. rows
        columnsValue,                                            // 10. columns
        safeStringify(features),                                 // 11. features
        safeStringify(split_info),                              // 12. split_info
        language || null,                                        // 13. language
        safeStringify(languages),                                // 14. languages
        domain || null,                                          // 15. domain
        safeStringify(task_types),                              // 16. task_types
        license || null,                                        // 17. license
        citation || null,                                        // 18. citation
        paper_url || null,                                       // 19. paper_url
        documentation_url || null,                              // 20. documentation_url
        download_url || null,                                    // 21. download_url
        huggingface_url || null,                                 // 22. huggingface_url
        kaggle_url || null,                                      // 23. kaggle_url
        github_url || null,                                      // 24. github_url
        safeStringify(sample_data),                              // 25. sample_data
        preprocessing_info || null,                             // 26. preprocessing_info
        validatedQualityScore,                                   // 27. quality_score
        collection_method || null,                               // 28. collection_method
        ethical_considerations || null,                          // 29. ethical_considerations
        release_date || null,                                    // 30. release_date
        last_updated || null,                                    // 31. last_updated
        version || null,                                        // 32. version
        logo_url || null,                                        // 33. logo_url
        featured_image || null,                                  // 34. featured_image
        validStatus,                                             // 35. status
        featured || false,                                       // 36. featured
        safeStringify(categories),                              // 37. categories
        safeStringify(tags),                                    // 38. tags
        seo_title || null,                                       // 39. seo_title
        seo_description || null,                                 // 40. seo_description
        seo_keywords || null,                                    // 41. seo_keywords
        safeStringify(schema_json),                              // 42. schema_json
        created_by || null                                       // 43. created_by
      ];

      // Debug: Verify we have 43 values
      console.log('Values array length:', values.length, 'Expected: 43');
      if (values.length !== 43) {
        throw new Error(`Values array has ${values.length} elements, expected 43`);
      }

    const result = await pool.query(insertQuery, values);

    return NextResponse.json({
      dataset: result.rows[0],
      message: 'Dataset created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating dataset:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    return NextResponse.json(
      { 
        error: 'Failed to create dataset',
        details: error.message || 'Unknown error',
        constraint: error.constraint,
        code: error.code
      },
      { status: 500 }
    );
  }
}

