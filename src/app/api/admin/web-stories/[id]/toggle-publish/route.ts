import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// POST - Toggle publish status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const storyId = parseInt(params.id);
  
  if (isNaN(storyId)) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid web story ID' 
      },
      { status: 400 }
    );
  }
  
  try {
    const { is_published } = await request.json();
    
    if (typeof is_published !== 'boolean') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Published status is required and must be a boolean' 
        },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      // Check if the web story exists
      const storyCheck = await client.query(
        'SELECT id FROM web_stories WHERE id = $1',
        [storyId]
      );
      
      if (storyCheck.rows.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Web story not found' 
          },
          { status: 404 }
        );
      }
      
      // Update the publish status
      const result = await client.query(`
        UPDATE web_stories 
        SET is_published = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [is_published, storyId]);
      
      return NextResponse.json({ 
        success: true,
        message: 'Web story publish status updated successfully', 
        story: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating web story publish status with ID ${storyId}:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update web story publish status' 
      },
      { status: 500 }
    );
  }
}
