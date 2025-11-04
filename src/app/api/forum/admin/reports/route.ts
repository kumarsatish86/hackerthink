import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { requireAdmin, requireModerator } from '@/lib/forum-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/forum/admin/reports - List reports
export async function GET(request: NextRequest) {
  try {
    await requireModerator();
    
    // Check if forum_reports table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'forum_reports'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('forum_reports table does not exist yet. Returning empty array.');
      return NextResponse.json({
        reports: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    }
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        fr.*,
        fp.content as post_content,
        fp.thread_id,
        u1.name as reporter_name,
        u2.name as post_author_name,
        ft.title as thread_title,
        ft.slug as thread_slug
       FROM forum_reports fr
       LEFT JOIN forum_posts fp ON fp.id = fr.post_id
       LEFT JOIN users u1 ON u1.id = fr.user_id
       LEFT JOIN users u2 ON u2.id = fp.user_id
       LEFT JOIN forum_threads ft ON ft.id = fp.thread_id
       WHERE fr.status = $1
       ORDER BY fr.created_at DESC
       LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [status, limit, offset]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM forum_reports WHERE status = $1',
      [status]
    );
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      reports: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching reports:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
    
    // If table doesn't exist, return empty array instead of error
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation "forum_reports"')) {
      console.log('forum_reports table does not exist. Returning empty array.');
      return NextResponse.json({
        reports: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// POST /api/forum/admin/reports - Resolve report
export async function POST(request: NextRequest) {
  try {
    const user = await requireModerator();
    const body = await request.json();
    const { report_id, action, reason } = body; // action: 'resolved' or 'dismissed'

    if (!report_id || !action) {
      return NextResponse.json(
        { error: 'report_id and action are required' },
        { status: 400 }
      );
    }

    if (!['resolved', 'dismissed'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "resolved" or "dismissed"' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE forum_reports
       SET status = $1, resolved_at = CURRENT_TIMESTAMP, resolved_by = $2
       WHERE id = $3
       RETURNING *`,
      [action === 'resolved' ? 'resolved' : 'dismissed', user.id, report_id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report: result.rows[0] });
  } catch (error: any) {
    console.error('Error resolving report:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to resolve report' },
      { status: error.message?.includes('Forbidden') || error.message?.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

