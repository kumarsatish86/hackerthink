import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET - Fetch all web stories
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          id, title, slug, cover_image, is_published, 
          creation_method, created_at, updated_at
        FROM web_stories 
        ORDER BY created_at DESC
      `);
      
      return NextResponse.json({ 
        success: true,
        stories: result.rows 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching web stories:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch web stories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new web story
export async function POST(request: NextRequest) {
  try {
    const {
      title,
      slug,
      cover_image,
      is_published,
      creation_method,
      content
    } = await request.json();

    if (!title || !slug) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Title and slug are required' 
        },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Check if slug already exists
      const existingStory = await client.query(
        'SELECT id FROM web_stories WHERE slug = $1',
        [slug]
      );

      if (existingStory.rows.length > 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'A web story with this slug already exists' 
          },
          { status: 400 }
        );
      }

      // Insert new web story
      const result = await client.query(`
        INSERT INTO web_stories (
          title, slug, cover_image, is_published, 
          creation_method, content, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *
      `, [
        title,
        slug,
        cover_image || '',
        is_published || false,
        creation_method || 'manual',
        content || ''
      ]);

      return NextResponse.json(
        { 
          success: true,
          story: result.rows[0] 
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating web story:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create web story',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

