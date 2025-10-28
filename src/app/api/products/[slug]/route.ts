import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products/[slug] - Get single product by slug for frontend
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    // Get product
    const productQuery = `
      SELECT 
        id, name, slug, logo_url, logo_alt, short_description, full_description,
        pricing_type, pricing_details, website_url, demo_url, documentation_url,
        github_url, integrations, pros, cons, features, categories, tags,
        rating, review_count, view_count, company_name, company_size,
        founded_year, headquarters, social_links, launch_date, created_at, updated_at
      FROM products
      WHERE slug = $1 AND status = 'published'
    `;

    const productResult = await db.query(productQuery, [slug]);

    if (productResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = productResult.rows[0];

    // Increment view count
    await db.query(
      'UPDATE products SET view_count = view_count + 1 WHERE id = $1',
      [product.id]
    );

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
