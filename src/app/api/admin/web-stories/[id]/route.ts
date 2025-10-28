import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// GET - Fetch single web story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM web_stories WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Web story not found' 
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
    console.error('Error fetching web story:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch web story',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update web story
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      // Check if web story exists
      const existingStory = await client.query(
        'SELECT id FROM web_stories WHERE id = $1',
        [id]
      );

      if (existingStory.rows.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Web story not found' 
          },
          { status: 404 }
        );
      }

      // Check if slug already exists for different story
      const slugCheck = await client.query(
        'SELECT id FROM web_stories WHERE slug = $1 AND id != $2',
        [slug, id]
      );

      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'A web story with this slug already exists' 
          },
          { status: 400 }
        );
      }

      // Update web story
      const result = await client.query(`
        UPDATE web_stories 
        SET 
          title = $1, 
          slug = $2, 
          cover_image = $3, 
          is_published = $4, 
          creation_method = $5, 
          content = $6, 
          updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `, [
        title,
        slug,
        cover_image || '',
        is_published || false,
        creation_method || 'manual',
        content || '',
        id
      ]);

      return NextResponse.json({ 
        success: true,
        story: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating web story:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to update web story',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete web story
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await pool.connect();
    
    try {
      // Check if web story exists
      const existingStory = await client.query(
        'SELECT id, title FROM web_stories WHERE id = $1',
        [id]
      );

      if (existingStory.rows.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Web story not found' 
          },
          { status: 404 }
        );
      }

      // Delete web story
      const result = await client.query(
        'DELETE FROM web_stories WHERE id = $1 RETURNING *',
        [id]
      );

      return NextResponse.json({ 
        success: true,
        message: 'Web story deleted successfully',
        story: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting web story:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete web story',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
