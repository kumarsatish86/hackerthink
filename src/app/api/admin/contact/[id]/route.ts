import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get single inquiry details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiryId = parseInt(params.id, 10);
    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: 'Invalid inquiry ID' }, { status: 400 });
    }

    // Get inquiry
    const inquiryResult = await query(
      `SELECT 
        ci.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM contact_inquiries ci
      LEFT JOIN users u ON ci.assigned_to = u.id
      WHERE ci.id = $1`,
      [inquiryId]
    );

    if (inquiryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    // Get notes
    const notesResult = await query(
      `SELECT 
        cin.*,
        u.name as user_name,
        u.email as user_email
      FROM contact_inquiry_notes cin
      LEFT JOIN users u ON cin.user_id = u.id
      WHERE cin.inquiry_id = $1
      ORDER BY cin.created_at DESC`,
      [inquiryId]
    );

    return NextResponse.json({
      inquiry: inquiryResult.rows[0],
      notes: notesResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry' },
      { status: 500 }
    );
  }
}

// PATCH: Update inquiry
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiryId = parseInt(params.id, 10);
    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: 'Invalid inquiry ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status, assignedTo, note } = body;

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;

      // Set resolved_at if status is resolved
      if (status === 'resolved') {
        updates.push(`resolved_at = CURRENT_TIMESTAMP`);
      } else if (status !== 'resolved') {
        updates.push(`resolved_at = NULL`);
      }
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramIndex}`);
      values.push(assignedTo || null);
      paramIndex++;
    }

    if (updates.length === 0 && !note) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Update inquiry
    if (updates.length > 0) {
      values.push(inquiryId);
      await query(
        `UPDATE contact_inquiries 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}`,
        values
      );
    }

    // Add note if provided
    if (note && typeof note === 'string' && note.trim().length > 0) {
      const userId = session.user?.id ? parseInt(session.user.id.toString(), 10) : null;
      await query(
        `INSERT INTO contact_inquiry_notes (inquiry_id, user_id, note_content)
        VALUES ($1, $2, $3)`,
        [inquiryId, userId, note.trim()]
      );
    }

    // Get updated inquiry
    const result = await query(
      `SELECT 
        ci.*,
        u.name as assigned_to_name,
        u.email as assigned_to_email
      FROM contact_inquiries ci
      LEFT JOIN users u ON ci.assigned_to = u.id
      WHERE ci.id = $1`,
      [inquiryId]
    );

    return NextResponse.json({ inquiry: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry' },
      { status: 500 }
    );
  }
}

// DELETE: Archive inquiry (soft delete by setting status to archived)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inquiryId = parseInt(params.id, 10);
    if (isNaN(inquiryId)) {
      return NextResponse.json({ error: 'Invalid inquiry ID' }, { status: 400 });
    }

    // Update status to archived
    await query(
      `UPDATE contact_inquiries 
      SET status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1`,
      [inquiryId]
    );

    return NextResponse.json({ success: true, message: 'Inquiry archived' });
  } catch (error: any) {
    console.error('Error archiving inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to archive inquiry' },
      { status: 500 }
    );
  }
}
