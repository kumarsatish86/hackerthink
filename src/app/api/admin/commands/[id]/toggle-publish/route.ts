import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const commandId = parseInt(params.id);
  
  if (isNaN(commandId)) {
    return NextResponse.json(
      { error: 'Invalid command ID' },
      { status: 400 }
    );
  }
  
  try {
    const client = await pool.connect();
    
    try {
      // Check if command exists
      const commandCheck = await client.query(
        'SELECT * FROM commands WHERE id = $1',
        [commandId]
      );
      
      if (commandCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Command not found' },
          { status: 404 }
        );
      }
      
      const currentPublishedState = commandCheck.rows[0].published;
      
      // Toggle published status
      const result = await client.query(
        `UPDATE commands 
         SET published = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [!currentPublishedState, commandId]
      );
      
      const newStatus = result.rows[0].published ? 'published' : 'unpublished';
      
      return NextResponse.json({ 
        command: result.rows[0],
        message: `Command ${newStatus} successfully` 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error toggling publish status for command ID ${commandId}:`, error);
    return NextResponse.json(
      { error: 'Failed to toggle publish status' },
      { status: 500 }
    );
  }
} 