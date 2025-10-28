import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// GET all tools (for admin)
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM tools ORDER BY title ASC
      `);
      
      return NextResponse.json({ tools: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching tools for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools' },
      { status: 500 }
    );
  }
}

// POST to create a new tool
export async function POST(request: NextRequest) {
  try {
    const { 
      title, slug, description, icon, file_path, published,
      seo_title, seo_description, seo_keywords, schema_json,
      category, platform, license, official_url, popularity
    } = await request.json();
    
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      // Check if slug already exists
      const slugCheck = await client.query(
        'SELECT slug FROM tools WHERE slug = $1',
        [slug]
      );
      
      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'A tool with this slug already exists' },
          { status: 409 }
        );
      }
      
      // Insert new tool
      const result = await client.query(`
        INSERT INTO tools (
          title, slug, description, icon, file_path, published,
          seo_title, seo_description, seo_keywords, schema_json,
          category, platform, license, official_url, popularity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        title, slug, description, icon, file_path, 
        published || false, seo_title, seo_description, seo_keywords, schema_json,
        category || 'misc', platform || 'linux', license || 'MIT', 
        official_url, popularity || 5
      ]);
      
      return NextResponse.json({ 
        message: 'Tool created successfully', 
        tool: result.rows[0] 
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { error: 'Failed to create tool' },
      { status: 500 }
    );
  }
} 
