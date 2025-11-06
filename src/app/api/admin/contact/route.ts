import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List inquiries with filters
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const inquiryType = searchParams.get('inquiryType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Build query
    let whereConditions: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (inquiryType) {
      whereConditions.push(`inquiry_type = $${paramIndex}`);
      queryParams.push(inquiryType);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(
        `(sender_name ILIKE $${paramIndex} OR sender_email ILIKE $${paramIndex} OR subject ILIKE $${paramIndex} OR message_content ILIKE $${paramIndex})`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM contact_inquiries ${whereClause}`,
      queryParams
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Get inquiries
    queryParams.push(limit, offset);
    const result = await query(
      `SELECT 
        id, sender_name, sender_email, subject, message_content, inquiry_type,
        status, assigned_to, ip_address, attachments_url, received_at, resolved_at,
        created_at, updated_at
      FROM contact_inquiries 
      ${whereClause}
      ORDER BY received_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      queryParams
    );

    return NextResponse.json({
      inquiries: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// POST: Create inquiry manually (admin)
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      senderName,
      senderEmail,
      subject,
      messageContent,
      inquiryType,
      status = 'new',
    } = body;

    // Validate required fields
    if (!senderName || !senderEmail || !subject || !messageContent || !inquiryType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert inquiry
    const result = await query(
      `INSERT INTO contact_inquiries (
        sender_name, sender_email, subject, message_content, inquiry_type,
        status, received_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *`,
      [senderName, senderEmail, subject, messageContent, inquiryType, status]
    );

    return NextResponse.json({ inquiry: result.rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to create inquiry' },
      { status: 500 }
    );
  }
}
