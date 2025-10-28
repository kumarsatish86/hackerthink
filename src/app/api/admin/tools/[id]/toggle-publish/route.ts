import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// POST to toggle publish status
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const toolId = parseInt(params.id);
  
  if (isNaN(toolId)) {
    return NextResponse.json(
      { error: 'Invalid tool ID' },
      { status: 400 }
    );
  }
  
  try {
    const { published } = await request.json();
    
    if (typeof published !== 'boolean') {
      return NextResponse.json(
        { error: 'Published status is required and must be a boolean' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      // Check if the tool exists
      const toolCheck = await client.query(
        'SELECT id FROM tools WHERE id = $1',
        [toolId]
      );
      
      if (toolCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      
      // Update the publish status
      const result = await client.query(`
        UPDATE tools 
        SET published = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `, [published, toolId]);
      
      return NextResponse.json({ 
        message: 'Tool publish status updated successfully', 
        tool: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating tool publish status with ID ${toolId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update tool publish status' },
      { status: 500 }
    );
  }
}
