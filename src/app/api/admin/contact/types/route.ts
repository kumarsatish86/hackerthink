import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List inquiry types
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(
      `SELECT 
        it.*,
        sc.name as smtp_config_name
      FROM inquiry_types it
      LEFT JOIN smtp_configs sc ON it.smtp_config_id = sc.id
      ORDER BY it.type_name`
    );

    return NextResponse.json({ types: result.rows });
  } catch (error: any) {
    console.error('Error fetching inquiry types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiry types' },
      { status: 500 }
    );
  }
}

// POST: Create inquiry type
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { typeName, emailRecipient, smtpConfigId, isActive = true } = body;

    if (!typeName || !emailRecipient) {
      return NextResponse.json(
        { error: 'Type name and email recipient are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO inquiry_types (type_name, email_recipient, smtp_config_id, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [typeName, emailRecipient, smtpConfigId || null, isActive]
    );

    return NextResponse.json({ type: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Inquiry type with this name already exists' },
        { status: 400 }
      );
    }
    console.error('Error creating inquiry type:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry type' },
      { status: 500 }
    );
  }
}

// PATCH: Update inquiry type
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, typeName, emailRecipient, smtpConfigId, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (typeName !== undefined) {
      updates.push(`type_name = $${paramIndex}`);
      values.push(typeName);
      paramIndex++;
    }

    if (emailRecipient !== undefined) {
      updates.push(`email_recipient = $${paramIndex}`);
      values.push(emailRecipient);
      paramIndex++;
    }

    if (smtpConfigId !== undefined) {
      updates.push(`smtp_config_id = $${paramIndex}`);
      values.push(smtpConfigId || null);
      paramIndex++;
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const result = await query(
      `UPDATE inquiry_types 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Inquiry type not found' }, { status: 404 });
    }

    return NextResponse.json({ type: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating inquiry type:', error);
    return NextResponse.json(
      { error: 'Failed to update inquiry type' },
      { status: 500 }
    );
  }
}

// DELETE: Delete inquiry type
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Check if type is being used
    const usageResult = await query(
      'SELECT COUNT(*) as count FROM contact_inquiries WHERE inquiry_type = (SELECT type_name FROM inquiry_types WHERE id = $1)',
      [id]
    );

    if (parseInt(usageResult.rows[0].count, 10) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete inquiry type that is in use' },
        { status: 400 }
      );
    }

    await query('DELETE FROM inquiry_types WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: 'Inquiry type deleted' });
  } catch (error: any) {
    console.error('Error deleting inquiry type:', error);
    return NextResponse.json(
      { error: 'Failed to delete inquiry type' },
      { status: 500 }
    );
  }
}
