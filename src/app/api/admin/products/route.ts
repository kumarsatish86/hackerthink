import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import getConfig from 'next/config';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

// Get server runtime config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };

// Create a database connection pool using server runtime config
const pool = new Pool({
  host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(serverRuntimeConfig.DB_PORT || process.env.DB_PORT || '5432'),
  user: serverRuntimeConfig.DB_USER || process.env.DB_USER || 'postgres',
  password: serverRuntimeConfig.DB_PASSWORD || process.env.DB_PASSWORD || 'Admin1234',
  database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME || 'hackerthink',
});

// GET /api/admin/products - Get all products with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/admin/products] Starting fetch request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[GET /api/admin/products] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[GET /api/admin/products] Forbidden - not admin');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if products table exists
    const client = await pool.connect();
    try {
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'products'
        );
      `);

      if (!tableCheck.rows[0].exists) {
        console.log('[GET /api/admin/products] Products table does not exist');
        return NextResponse.json({
          products: [],
          pagination: {
            total: 0,
            pages: 0,
            page: 1,
            limit: 10,
            hasNext: false,
            hasPrev: false
          }
        });
      }
    } finally {
      client.release();
    }

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
        p.name ILIKE $${paramIndex} OR 
        p.short_description ILIKE $${paramIndex} OR 
        p.full_description ILIKE $${paramIndex} OR
        p.company_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status !== 'all') {
      whereConditions.push(`p.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (category !== 'all') {
      whereConditions.push(`p.categories @> $${paramIndex}`);
      queryParams.push(`["${category}"]`);
      paramIndex++;
    }

    if (pricingType !== 'all') {
      whereConditions.push(`p.pricing_type = $${paramIndex}`);
      queryParams.push(pricingType);
      paramIndex++;
    }

    if (featured !== 'all') {
      whereConditions.push(`p.featured = $${paramIndex}`);
      queryParams.push(featured === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM products p ${whereClause}`;
    const countClient = await pool.connect();
    let total = 0;
    try {
      const countResult = await countClient.query(countQuery, queryParams);
      total = parseInt(countResult.rows[0]?.count || '0');
    } catch (error) {
      console.error('[GET /api/admin/products] Error counting products:', error);
      // If count fails, still try to fetch products
      total = 0;
    } finally {
      countClient.release();
    }

    // Get products
    // Use a simpler query without JOIN if users table might not exist or have different column types
    const productsQuery = `
      SELECT 
        p.*
      FROM products p
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const productsClient = await pool.connect();
    let productsResult;
    try {
      productsResult = await productsClient.query(productsQuery, queryParams);
    } catch (error) {
      console.error('[GET /api/admin/products] Error fetching products:', error);
      console.error('[GET /api/admin/products] Error details:', error instanceof Error ? error.message : String(error));
      throw error;
    } finally {
      productsClient.release();
    }

    // Parse JSON fields safely
    const products = productsResult.rows.map(product => {
      try {
        return {
          ...product,
          pricing_details: product.pricing_details ? (typeof product.pricing_details === 'string' ? JSON.parse(product.pricing_details) : product.pricing_details) : null,
          integrations: product.integrations ? (typeof product.integrations === 'string' ? JSON.parse(product.integrations) : product.integrations) : [],
          pros: product.pros ? (typeof product.pros === 'string' ? JSON.parse(product.pros) : product.pros) : [],
          cons: product.cons ? (typeof product.cons === 'string' ? JSON.parse(product.cons) : product.cons) : [],
          features: product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [],
          categories: product.categories ? (typeof product.categories === 'string' ? JSON.parse(product.categories) : product.categories) : [],
          tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [],
          social_links: product.social_links ? (typeof product.social_links === 'string' ? JSON.parse(product.social_links) : product.social_links) : {},
          schema_json: product.schema_json ? (typeof product.schema_json === 'string' ? JSON.parse(product.schema_json) : product.schema_json) : null,
        };
      } catch (parseError) {
        console.error('[GET /api/admin/products] Error parsing JSON for product:', product.id, parseError);
        return product; // Return original if parsing fails
      }
    });

    console.log('[GET /api/admin/products] Successfully fetched', products.length, 'products');
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
    console.error('[GET /api/admin/products] Error fetching products:', error);
    console.error('[GET /api/admin/products] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : String(error),
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    console.log('[POST /api/admin/products] Starting create request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[POST /api/admin/products] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user?.role !== 'admin') {
      console.log('[POST /api/admin/products] Forbidden - not admin');
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

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
      pricing_type || 'free', pricing_details ? JSON.stringify(pricing_details) : null, website_url,
      demo_url, documentation_url, github_url, integrations ? JSON.stringify(integrations) : null,
      pros ? JSON.stringify(pros) : null, cons ? JSON.stringify(cons) : null, features ? JSON.stringify(features) : null,
      categories ? JSON.stringify(categories) : null, tags ? JSON.stringify(tags) : null, status || 'draft',
      featured || false, company_name, company_size, founded_year, headquarters,
      social_links ? JSON.stringify(social_links) : null, seo_title, seo_description, seo_keywords,
      schema_json ? JSON.stringify(schema_json) : null, launch_date, last_updated, session.user?.id || null
    ];

    const client = await pool.connect();
    let result;
    try {
      result = await client.query(insertQuery, values);
    } finally {
      client.release();
    }
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
