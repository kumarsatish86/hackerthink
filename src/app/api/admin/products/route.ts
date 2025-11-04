import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

// GET /api/admin/products - Get all products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const pricingType = searchParams.get('pricing_type') || 'all';
    const featured = searchParams.get('featured') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(
        name ILIKE $${paramIndex} OR 
        short_description ILIKE $${paramIndex} OR 
        full_description ILIKE $${paramIndex} OR
        company_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (category !== 'all') {
      whereConditions.push(`categories @> $${paramIndex}`);
      queryParams.push(`["${category}"]`);
      paramIndex++;
    }

    if (pricingType !== 'all') {
      whereConditions.push(`pricing_type = $${paramIndex}`);
      queryParams.push(pricingType);
      paramIndex++;
    }

    if (featured !== 'all') {
      whereConditions.push(`featured = $${paramIndex}`);
      queryParams.push(featured === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get products
    const productsQuery = `
      SELECT 
        p.*,
        u1.name as created_by_name,
        u2.name as updated_by_name
      FROM products p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const productsResult = await db.query(productsQuery, queryParams);

    // Parse JSON fields
    const products = productsResult.rows.map(product => ({
      ...product,
      pricing_details: product.pricing_details ? JSON.parse(product.pricing_details) : null,
      integrations: product.integrations ? JSON.parse(product.integrations) : [],
      pros: product.pros ? JSON.parse(product.pros) : [],
      cons: product.cons ? JSON.parse(product.cons) : [],
      features: product.features ? JSON.parse(product.features) : [],
      categories: product.categories ? JSON.parse(product.categories) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      social_links: product.social_links ? JSON.parse(product.social_links) : {},
      schema_json: product.schema_json ? JSON.parse(product.schema_json) : null,
    }));

    return NextResponse.json({
      products,
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      name,
      slug,
      logo_url,
      logo_alt,
      short_description,
      full_description,
      pricing_type,
      pricing_details,
      website_url,
      demo_url,
      documentation_url,
      github_url,
      integrations,
      pros,
      cons,
      features,
      categories,
      tags,
      status,
      featured,
      company_name,
      company_size,
      founded_year,
      headquarters,
      social_links,
      seo_title,
      seo_description,
      seo_keywords,
      schema_json,
      launch_date,
      last_updated
    } = data;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingProduct = await db.query(
      'SELECT id FROM products WHERE slug = $1',
      [slug]
    );

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }

    // Insert product
    const insertQuery = `
      INSERT INTO products (
        name, slug, logo_url, logo_alt, short_description, full_description,
        pricing_type, pricing_details, website_url, demo_url, documentation_url,
        github_url, integrations, pros, cons, features, categories, tags,
        status, featured, company_name, company_size, founded_year,
        headquarters, social_links, seo_title, seo_description, seo_keywords,
        schema_json, launch_date, last_updated, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
      ) RETURNING *
    `;

    const values = [
      name, slug, logo_url, logo_alt, short_description, full_description,
      pricing_type || 'free', JSON.stringify(pricing_details), website_url,
      demo_url, documentation_url, github_url, JSON.stringify(integrations || []),
      JSON.stringify(pros || []), JSON.stringify(cons || []), JSON.stringify(features || []),
      JSON.stringify(categories || []), JSON.stringify(tags || []), status || 'draft',
      featured || false, company_name, company_size, founded_year, headquarters,
      JSON.stringify(social_links || {}), seo_title, seo_description, seo_keywords,
      JSON.stringify(schema_json), launch_date, last_updated, 1 // TODO: Get from session
    ];

    const result = await db.query(insertQuery, values);
    const product = result.rows[0];

    // Parse JSON fields for response
    const responseProduct = {
      ...product,
      pricing_details: product.pricing_details ? JSON.parse(product.pricing_details) : null,
      integrations: product.integrations ? JSON.parse(product.integrations) : [],
      pros: product.pros ? JSON.parse(product.pros) : [],
      cons: product.cons ? JSON.parse(product.cons) : [],
      features: product.features ? JSON.parse(product.features) : [],
      categories: product.categories ? JSON.parse(product.categories) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      social_links: product.social_links ? JSON.parse(product.social_links) : {},
      schema_json: product.schema_json ? JSON.parse(product.schema_json) : null,
    };

    return NextResponse.json({
      product: responseProduct,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
