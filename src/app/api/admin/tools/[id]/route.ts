import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// GET a specific tool
export async function GET(
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
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `SELECT id, title, slug, description, icon, file_path, published, 
                seo_title, seo_description, seo_keywords, schema_json,
                category, platform, license, official_url, popularity,
                created_at, updated_at 
         FROM tools WHERE id = $1`,
        [toolId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Tool not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ tool: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching tool with ID ${toolId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch tool' },
      { status: 500 }
    );
  }
}

// PATCH to update a tool
export async function PATCH(
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
    const { 
      title, slug, description, icon, file_path, published,
      seo_title, seo_description, seo_keywords, schema_json,
      category, platform, license, official_url, popularity
    } = await request.json();
    
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
      
      // If slug is being updated, check it doesn't conflict
      if (slug) {
        const slugCheck = await client.query(
          'SELECT id FROM tools WHERE slug = $1 AND id != $2',
          [slug, toolId]
        );
        
        if (slugCheck.rows.length > 0) {
          return NextResponse.json(
            { error: 'A tool with this slug already exists' },
            { status: 409 }
          );
        }
      }
      
      // Build the update query dynamically
      const updateFields = [];
      const queryParams = [];
      let paramIndex = 1;
      
      if (title !== undefined) {
        updateFields.push(`title = $${paramIndex}`);
        queryParams.push(title);
        paramIndex++;
      }
      
      if (slug !== undefined) {
        updateFields.push(`slug = $${paramIndex}`);
        queryParams.push(slug);
        paramIndex++;
      }
      
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex}`);
        queryParams.push(description);
        paramIndex++;
      }
      
      if (icon !== undefined) {
        updateFields.push(`icon = $${paramIndex}`);
        queryParams.push(icon);
        paramIndex++;
      }
      
      if (file_path !== undefined) {
        updateFields.push(`file_path = $${paramIndex}`);
        queryParams.push(file_path);
        paramIndex++;
      }
      
      if (published !== undefined) {
        updateFields.push(`published = $${paramIndex}`);
        queryParams.push(published);
        paramIndex++;
      }
      
      if (seo_title !== undefined) {
        updateFields.push(`seo_title = $${paramIndex}`);
        queryParams.push(seo_title);
        paramIndex++;
      }
      
      if (seo_description !== undefined) {
        updateFields.push(`seo_description = $${paramIndex}`);
        queryParams.push(seo_description);
        paramIndex++;
      }
      
      if (seo_keywords !== undefined) {
        updateFields.push(`seo_keywords = $${paramIndex}`);
        queryParams.push(seo_keywords);
        paramIndex++;
      }
      
      if (schema_json !== undefined) {
        updateFields.push(`schema_json = $${paramIndex}`);
        queryParams.push(schema_json);
        paramIndex++;
      }
      
      if (category !== undefined) {
        updateFields.push(`category = $${paramIndex}`);
        queryParams.push(category);
        paramIndex++;
      }
      
      if (platform !== undefined) {
        updateFields.push(`platform = $${paramIndex}`);
        queryParams.push(platform);
        paramIndex++;
      }
      
      if (license !== undefined) {
        updateFields.push(`license = $${paramIndex}`);
        queryParams.push(license);
        paramIndex++;
      }
      
      if (official_url !== undefined) {
        updateFields.push(`official_url = $${paramIndex}`);
        queryParams.push(official_url);
        paramIndex++;
      }
      
      if (popularity !== undefined) {
        updateFields.push(`popularity = $${paramIndex}`);
        queryParams.push(popularity);
        paramIndex++;
      }
      
      // Always update the updated_at timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }
      
      // Add the tool ID as the last parameter
      queryParams.push(toolId);
      
      const result = await client.query(`
        UPDATE tools 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING *
      `, queryParams);
      
      return NextResponse.json({ 
        message: 'Tool updated successfully', 
        tool: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating tool with ID ${toolId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update tool' },
      { status: 500 }
    );
  }
}

// DELETE a tool
export async function DELETE(
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
      
      // Delete the tool
      await client.query('DELETE FROM tools WHERE id = $1', [toolId]);
      
      return NextResponse.json({ 
        message: 'Tool deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error deleting tool with ID ${toolId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete tool' },
      { status: 500 }
    );
  }
} 