import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const redirectId = params.id;

    // Fetch redirect
    const { rows } = await pool.query(
      'SELECT * FROM url_redirects WHERE id = $1',
      [redirectId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Redirect not found' }, { status: 404 });
    }

    return NextResponse.json({ redirect: rows[0] });
  } catch (error) {
    console.error('Error fetching redirect:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const redirectId = params.id;
    const body = await request.json();
    
    // Extract fields from body
    const { 
      source_url, 
      target_url, 
      redirect_type, 
      is_active, 
      notes 
    } = body;
    
    // Build update query dynamically
    let updateFields = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (source_url !== undefined) {
      // Normalize source URL
      const normalizedSourceUrl = source_url.startsWith('/') ? source_url : `/${source_url}`;
      updateFields.push(`source_url = $${paramCounter++}`);
      queryParams.push(normalizedSourceUrl);
      
      // Check for duplicate source URL
      const existingCheck = await pool.query(
        'SELECT id FROM url_redirects WHERE source_url = $1 AND id != $2',
        [normalizedSourceUrl, redirectId]
      );

      if (existingCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'A redirect with this source URL already exists' },
          { status: 400 }
        );
      }
    }
    
    if (target_url !== undefined) {
      // Normalize target URL
      const normalizedTargetUrl = target_url.startsWith('/') || target_url.startsWith('http') 
        ? target_url 
        : `/${target_url}`;
      updateFields.push(`target_url = $${paramCounter++}`);
      queryParams.push(normalizedTargetUrl);
    }
    
    if (redirect_type !== undefined) {
      updateFields.push(`redirect_type = $${paramCounter++}`);
      queryParams.push(redirect_type);
    }
    
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCounter++}`);
      queryParams.push(is_active);
    }
    
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCounter++}`);
      queryParams.push(notes);
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // If no fields to update, return error
    if (updateFields.length === 0) {
      return NextResponse.json(
        { message: 'No fields to update' },
        { status: 400 }
      );
    }
    
    // Add the redirect ID to the parameters array
    queryParams.push(redirectId);
    
    // Execute the update query
    const { rowCount } = await pool.query(
      `UPDATE url_redirects SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      queryParams
    );
    
    if (rowCount === 0) {
      return NextResponse.json(
        { message: 'Redirect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Redirect updated successfully' });
  } catch (error) {
    console.error('Error updating redirect:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized - Please sign in to continue' }, { status: 401 });
    }

    const redirectId = params.id;
    
    // Delete the redirect
    const { rowCount } = await pool.query(
      'DELETE FROM url_redirects WHERE id = $1',
      [redirectId]
    );
    
    if (rowCount === 0) {
      return NextResponse.json(
        { message: 'Redirect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Redirect deleted successfully' });
  } catch (error) {
    console.error('Error deleting redirect:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
} 