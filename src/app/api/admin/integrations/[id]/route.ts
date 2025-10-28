import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

// GET a specific integration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const integrationId = parseInt(params.id);
  
  if (isNaN(integrationId)) {
    return NextResponse.json(
      { error: 'Invalid integration ID' },
      { status: 400 }
    );
  }
  
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT * FROM integrations WHERE id = $1',
        [integrationId]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Integration not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ integration: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching integration with ID ${integrationId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch integration' },
      { status: 500 }
    );
  }
}

// PATCH to update an integration
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const integrationId = parseInt(params.id);
  
  if (isNaN(integrationId)) {
    return NextResponse.json(
      { error: 'Invalid integration ID' },
      { status: 400 }
    );
  }
  
  try {
    const { 
      provider, type, name, status, config
    } = await request.json();
    
    const client = await pool.connect();
    
    try {
      // Check if the integration exists
      const integrationCheck = await client.query(
        'SELECT id FROM integrations WHERE id = $1',
        [integrationId]
      );
      
      if (integrationCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Integration not found' },
          { status: 404 }
        );
      }
      
      // Build the update query dynamically
      const updateFields = [];
      const queryParams = [];
      let paramIndex = 1;
      
      if (provider !== undefined) {
        updateFields.push(`provider = $${paramIndex}`);
        queryParams.push(provider);
        paramIndex++;
      }
      
      if (type !== undefined) {
        updateFields.push(`type = $${paramIndex}`);
        queryParams.push(type);
        paramIndex++;
      }
      
      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex}`);
        queryParams.push(name);
        paramIndex++;
      }
      
      if (status !== undefined) {
        updateFields.push(`status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }
      
      if (config !== undefined) {
        updateFields.push(`config = $${paramIndex}`);
        queryParams.push(config);
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
      
      // Add the integration ID as the last parameter
      queryParams.push(integrationId);
      
      const result = await client.query(`
        UPDATE integrations 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex}
        RETURNING *
      `, queryParams);
      
      return NextResponse.json({ 
        message: 'Integration updated successfully', 
        integration: result.rows[0] 
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating integration with ID ${integrationId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}

// DELETE an integration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const integrationId = parseInt(params.id);
  
  if (isNaN(integrationId)) {
    return NextResponse.json(
      { error: 'Invalid integration ID' },
      { status: 400 }
    );
  }
  
  try {
    const client = await pool.connect();
    
    try {
      // Check if the integration exists
      const integrationCheck = await client.query(
        'SELECT id FROM integrations WHERE id = $1',
        [integrationId]
      );
      
      if (integrationCheck.rows.length === 0) {
        return NextResponse.json(
          { error: 'Integration not found' },
          { status: 404 }
        );
      }
      
      // Delete the integration
      await client.query('DELETE FROM integrations WHERE id = $1', [integrationId]);
      
      return NextResponse.json({ 
        message: 'Integration deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error deleting integration with ID ${integrationId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
} 