import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get inquiry statistics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total inquiries
    const totalResult = await query('SELECT COUNT(*) as total FROM contact_inquiries');
    const total = parseInt(totalResult.rows[0].total, 10);

    // Get inquiries by status
    const statusResult = await query(
      `SELECT status, COUNT(*) as count 
      FROM contact_inquiries 
      GROUP BY status`
    );
    const byStatus = statusResult.rows.reduce((acc: any, row: any) => {
      acc[row.status] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Get inquiries by type
    const typeResult = await query(
      `SELECT inquiry_type, COUNT(*) as count 
      FROM contact_inquiries 
      GROUP BY inquiry_type 
      ORDER BY count DESC`
    );
    const byType = typeResult.rows.map((row: any) => ({
      type: row.inquiry_type,
      count: parseInt(row.count, 10),
    }));

    // Get recent inquiries (last 7 days)
    const recentResult = await query(
      `SELECT COUNT(*) as count 
      FROM contact_inquiries 
      WHERE received_at >= NOW() - INTERVAL '7 days'`
    );
    const recent = parseInt(recentResult.rows[0].count, 10);

    // Get new inquiries (status = 'new')
    const newResult = await query(
      `SELECT COUNT(*) as count 
      FROM contact_inquiries 
      WHERE status = 'new'`
    );
    const newCount = parseInt(newResult.rows[0].count, 10);

    return NextResponse.json({
      total,
      byStatus,
      byType,
      recent,
      new: newCount,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
