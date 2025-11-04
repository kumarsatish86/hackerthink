import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET - Fetch single published web story by slug
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT 
          id, title, slug, cover_image, content, created_at, updated_at,
          is_published, creation_method
        FROM web_stories 
        WHERE slug = $1 AND is_published = true
      `, [slug]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Story not found' 
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        story: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching story by slug:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch story',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
