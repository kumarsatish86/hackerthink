import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../db/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/authOptions';

// Helper function to check admin permissions
async function checkAdminPermission() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session data in admin check:", JSON.stringify(session, null, 2));
    if (!session || !session.user || session.user.role !== 'admin') {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    return false;
  }
}

// GET /api/admin/comments - Get all comments with filtering options
export async function GET(request: NextRequest) {
  // Check admin permissions
  console.log("Admin comments API called");
  const isAdmin = await checkAdminPermission();
  console.log("isAdmin check result:", isAdmin);
  
  if (!isAdmin) {
    console.log("Unauthorized access attempt to admin comments API");
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending'; // pending, approved, all
    const contentId = searchParams.get('contentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log(`Fetching comments with status: ${status}, page: ${page}, limit: ${limit}`);

    const client = await pool.connect();
    try {
      let query = `
        SELECT c.id, c.content_id, c.content, c.author_name, c.author_email, 
               c.parent_id, c.is_approved, c.created_at, cnt.title as content_title
        FROM comments c
        LEFT JOIN content cnt ON c.content_id = cnt.id
      `;
      
      const queryParams: any[] = [];
      let whereConditions = [];
      
      // Filter by approval status
      if (status === 'pending') {
        whereConditions.push('c.is_approved = false');
      } else if (status === 'approved') {
        whereConditions.push('c.is_approved = true');
      }
      
      // Filter by content ID if provided
      if (contentId) {
        queryParams.push(contentId);
        whereConditions.push(`c.content_id = $${queryParams.length}`);
      }
      
      // Add WHERE clause if we have conditions
      if (whereConditions.length > 0) {
        query += ` WHERE ${whereConditions.join(' AND ')}`;
      }
      
      // Add ordering and pagination
      query += ` ORDER BY c.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(limit, offset);
      
      console.log("Executing SQL query:", query);
      console.log("With parameters:", queryParams);
      
      const result = await client.query(query, queryParams);
      console.log(`Query returned ${result.rows.length} results`);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM comments c';
      if (whereConditions.length > 0) {
        countQuery += ` WHERE ${whereConditions.join(' AND ')}`;
      }
      
      const countResult = await client.query(countQuery, queryParams.slice(0, -2));
      const totalComments = parseInt(countResult.rows[0].count);
      
      return NextResponse.json({
        comments: result.rows,
        pagination: {
          total: totalComments,
          page,
          limit,
          totalPages: Math.ceil(totalComments / limit)
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/comments/:id - Approve or reject a comment
export async function PATCH(request: NextRequest) {
  // Check admin permissions
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, isApproved } = body;

    if (!id || isApproved === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE comments 
         SET is_approved = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id, is_approved`,
        [isApproved, id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: isApproved ? 'Comment approved' : 'Comment rejected',
        comment: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/comments/:id - Delete a comment
export async function DELETE(request: NextRequest) {
  // Check admin permissions
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM comments WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rowCount === 0) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Comment deleted successfully',
        id: result.rows[0].id
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
} 
