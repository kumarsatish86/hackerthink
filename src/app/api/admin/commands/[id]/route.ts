import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// GET a specific command
export async function GET(
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
      const result = await client.query(
        `SELECT id, title, slug, description, syntax, examples, options, notes, 
                category, platform, icon, file_path, published, 
                seo_title, seo_description, seo_keywords, schema_json,
                created_at, updated_at 
         FROM commands WHERE id = $1`,
        [commandId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Command not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ command: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching command with ID ${commandId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch command' },
      { status: 500 }
    );
  }
}

// PUT to update a command
export async function PUT(
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
      
      // Check for duplicate slug (excluding current command)
      const slugCheck = await client.query(
        'SELECT * FROM commands WHERE slug = $1 AND id != $2',
        [slug, commandId]
      );
      
      if (slugCheck.rows.length > 0) {
        return NextResponse.json(
          { error: 'Another command with this slug already exists' },
          { status: 400 }
        );
      }
      
      // Update command
      const result = await client.query(
        `UPDATE commands SET
          title = $1,
          slug = $2,
          description = $3,
          syntax = $4,
          examples = $5,
          options = $6,
          notes = $7,
          category = $8,
          platform = $9,
          icon = $10,
          file_path = $11,
          published = $12,
          seo_title = $13,
          seo_description = $14,
          seo_keywords = $15,
          schema_json = $16,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $17
        RETURNING *`,
        [
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
          schema_json,
          commandId
        ]
      );
      
      return NextResponse.json({ 
        command: result.rows[0],
        message: 'Command updated successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating command with ID ${commandId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update command' },
      { status: 500 }
    );
  }
}

// DELETE a command
export async function DELETE(
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
      
      // Delete command
      await client.query(
        'DELETE FROM commands WHERE id = $1',
        [commandId]
      );
      
      return NextResponse.json({ 
        message: 'Command deleted successfully' 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error deleting command with ID ${commandId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete command' },
      { status: 500 }
    );
  }
} 