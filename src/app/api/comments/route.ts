import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Create a PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contentId, content, authorName, authorEmail, parentId } = body;
    
    console.log("Received comment submission with contentId:", contentId);

    // Validate required fields
    if (!contentId || !content || !authorName || !authorEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate UUID format for contentId
    if (!isValidUUID(contentId)) {
      console.error(`Invalid UUID format for contentId: ${contentId}`);
      return NextResponse.json(
        { error: 'Invalid content ID format' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert comment into database
    const client = await pool.connect();
    try {
      // First, check if content with the given ID exists
      const contentCheckResult = await client.query(
        `SELECT id FROM content WHERE id = $1`,
        [contentId]
      );

      // If content doesn't exist, create a placeholder entry
      if (contentCheckResult.rowCount === 0) {
        console.log(`Content with ID ${contentId} not found, creating placeholder entry`);
        await client.query(
          `INSERT INTO content (id, title, slug, content_type, status) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            contentId, 
            `Auto-generated content ${contentId}`, 
            `auto-generated-${contentId.substring(0, 8)}`,
            'auto-generated',
            'published'
          ]
        );
      }

      const result = await client.query(
        `INSERT INTO comments (id, content_id, content, author_name, author_email, parent_id, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, created_at`,
        [uuidv4(), contentId, content, authorName, authorEmail, parentId || null, false]
      );

      return NextResponse.json({
        message: 'Comment submitted successfully and is awaiting approval',
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

// GET /api/comments?contentId=xxx - Get approved comments for a content
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get('contentId');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, content, author_name, parent_id, created_at
         FROM comments
         WHERE content_id = $1 AND is_approved = true
         ORDER BY created_at DESC`,
        [contentId]
      );

      return NextResponse.json({ comments: result.rows });
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
