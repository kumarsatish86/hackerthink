import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET all commands (for admin)
export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM commands ORDER BY title ASC
      `);
      
      return NextResponse.json({ commands: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching commands for admin:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commands' },
      { status: 500 }
    );
  }
}

// POST to create a new command
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      slug, 
      description, 
      syntax,
      examples,
      options,
      notes,
      category,
      platform,
      icon,
      file_path,
      published,
      seo_title,
      seo_description,
      seo_keywords,
      schema_json
    } = body;
    
    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      // Check for duplicate slug
      const slugCheck = await client.query(
        'SELECT * FROM commands WHERE slug = $1',
        [slug]
      );
      
      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'A command with this slug already exists' },
          { status: 400 }
        );
      }
      
      // Insert new command
      const result = await client.query(
        `INSERT INTO commands (
          title, 
          slug, 
          description, 
          syntax,
          examples,
          options,
          notes,
          category,
          platform,
          icon,
          file_path,
          published,
          seo_title,
          seo_description,
          seo_keywords,
          schema_json
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *`,
        [
          title, 
          slug, 
          description, 
          syntax,
          examples,
          options,
          notes,
          category || 'misc',
          platform || 'linux',
          icon,
          file_path,
          published || false,
          seo_title,
          seo_description,
          seo_keywords,
          schema_json
        ]
      );
      
      return NextResponse.json({ 
        command: result.rows[0],
        message: 'Command created successfully' 
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating command:', error);
    return NextResponse.json(
      { error: 'Failed to create command' },
      { status: 500 }
    );
  }
} 
