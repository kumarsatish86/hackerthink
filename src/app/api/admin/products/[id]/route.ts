import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const query = `
      SELECT 
        p.*,
        u1.name as created_by_name,
        u2.name as updated_by_name
      FROM products p
      LEFT JOIN users u1 ON p.created_by = u1.id
      LEFT JOIN users u2 ON p.updated_by = u2.id
      WHERE p.id = $1
    `;

    const result = await db.query(query, [productId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = result.rows[0];

    // Parse JSON fields
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

    return NextResponse.json({ product: responseProduct });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
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

    // Check if product exists
    const existingProduct = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if slug already exists (excluding current product)
    if (slug) {
      const slugCheck = await db.query(
        'SELECT id FROM products WHERE slug = $1 AND id != $2',
        [slug, productId]
      );

      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update product
    const updateQuery = `
      UPDATE products SET
        name = COALESCE($1, name),
        slug = COALESCE($2, slug),
        logo_url = COALESCE($3, logo_url),
        logo_alt = COALESCE($4, logo_alt),
        short_description = COALESCE($5, short_description),
        full_description = COALESCE($6, full_description),
        pricing_type = COALESCE($7, pricing_type),
        pricing_details = COALESCE($8, pricing_details),
        website_url = COALESCE($9, website_url),
        demo_url = COALESCE($10, demo_url),
        documentation_url = COALESCE($11, documentation_url),
        github_url = COALESCE($12, github_url),
        integrations = COALESCE($13, integrations),
        pros = COALESCE($14, pros),
        cons = COALESCE($15, cons),
        features = COALESCE($16, features),
        categories = COALESCE($17, categories),
        tags = COALESCE($18, tags),
        status = COALESCE($19, status),
        featured = COALESCE($20, featured),
        company_name = COALESCE($21, company_name),
        company_size = COALESCE($22, company_size),
        founded_year = COALESCE($23, founded_year),
        headquarters = COALESCE($24, headquarters),
        social_links = COALESCE($25, social_links),
        seo_title = COALESCE($26, seo_title),
        seo_description = COALESCE($27, seo_description),
        seo_keywords = COALESCE($28, seo_keywords),
        schema_json = COALESCE($29, schema_json),
        launch_date = COALESCE($30, launch_date),
        last_updated = COALESCE($31, last_updated),
        updated_by = $32,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $33
      RETURNING *
    `;

    const values = [
      name, slug, logo_url, logo_alt, short_description, full_description,
      pricing_type, JSON.stringify(pricing_details), website_url, demo_url,
      documentation_url, github_url, JSON.stringify(integrations),
      JSON.stringify(pros), JSON.stringify(cons), JSON.stringify(features),
      JSON.stringify(categories), JSON.stringify(tags), status, featured,
      company_name, company_size, founded_year, headquarters,
      JSON.stringify(social_links), seo_title, seo_description, seo_keywords,
      JSON.stringify(schema_json), launch_date, last_updated, 1, // TODO: Get from session
      productId
    ];

    const result = await db.query(updateQuery, values);
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
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Check if product exists
    const existingProduct = await db.query(
      'SELECT id FROM products WHERE id = $1',
      [productId]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete product (this will also delete related reviews due to CASCADE)
    await db.query('DELETE FROM products WHERE id = $1', [productId]);

    return NextResponse.json({
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
