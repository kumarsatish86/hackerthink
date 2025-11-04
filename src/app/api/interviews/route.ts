import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const offset = (page - 1) * limit;
    const category = url.searchParams.get('category');
    const interviewType = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sort') || 'latest'; // latest, popular, oldest
    const featured = url.searchParams.get('featured') === 'true';

    // Build WHERE clause
    const whereConditions: string[] = ["i.status = 'published'"];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`c.slug = $${paramIndex++}`);
      queryParams.push(category);
    }

    if (interviewType) {
      whereConditions.push(`i.interview_type = $${paramIndex++}`);
      queryParams.push(interviewType);
    }

    if (featured) {
      whereConditions.push(`i.featured = true`);
    }

    if (search) {
      whereConditions.push(`(
        i.title ILIKE $${paramIndex} OR 
        i.excerpt ILIKE $${paramIndex} OR 
        g.name ILIKE $${paramIndex} OR 
        g.company ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'i.created_at DESC';
    if (sortBy === 'popular') {
      orderBy = 'i.view_count DESC, i.created_at DESC';
    } else if (sortBy === 'oldest') {
      orderBy = 'i.created_at ASC';
    } else if (sortBy === 'publish_date') {
      orderBy = 'i.publish_date DESC NULLS LAST';
    }

    // Calculate total interviews for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM interviews i
      LEFT JOIN interview_categories c ON i.category_id = c.id
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Fetch published interviews from database
    const query = `
      SELECT 
        i.id,
        i.title,
        i.slug,
        i.excerpt,
        i.featured_image,
        i.featured_image_alt,
        i.interview_type,
        i.featured,
        i.view_count,
        i.publish_date,
        i.created_at,
        i.updated_at,
        g.name as guest_name,
        g.slug as guest_slug,
        g.photo_url as guest_photo,
        g.title as guest_title,
        g.company as guest_company,
        c.name as category_name,
        c.slug as category_slug
      FROM interviews i
      LEFT JOIN interview_guests g ON i.guest_id = g.id
      LEFT JOIN interview_categories c ON i.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);
    const { rows } = await pool.query(query, queryParams);

    // Format dates for display
    const interviews = rows.map(interview => ({
      ...interview,
      created_at: interview.created_at ? new Date(interview.created_at).toISOString() : null,
      updated_at: interview.updated_at ? new Date(interview.updated_at).toISOString() : null,
      publish_date: interview.publish_date ? new Date(interview.publish_date).toISOString() : null,
    }));

    return NextResponse.json({
      interviews,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

