import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products - Get published products for frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const pricingType = searchParams.get('pricing_type') || 'all';
    const featured = searchParams.get('featured') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const offset = (page - 1) * limit;

    // Build WHERE clause (only published products)
    let whereConditions = ['status = $1'];
    let queryParams = ['published'];
    let paramIndex = 2;

    if (search) {
      whereConditions.push(`(
        name ILIKE $${paramIndex} OR 
        short_description ILIKE $${paramIndex} OR 
        company_name ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
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

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get products
    const productsQuery = `
      SELECT 
        id, name, slug, logo_url, logo_alt, short_description,
        pricing_type, pricing_details, website_url, demo_url,
        integrations, pros, cons, features, categories, tags,
        rating, review_count, view_count, company_name,
        launch_date, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
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
