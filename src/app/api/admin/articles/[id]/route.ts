import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/authOptions';
import getConfig from 'next/config';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

// Get server runtime config
const { serverRuntimeConfig } = getConfig() || { serverRuntimeConfig: {} };

// Create a database connection pool using server runtime config
const pool = new Pool({
  host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(serverRuntimeConfig.DB_PORT || process.env.DB_PORT || '5432'),
  user: serverRuntimeConfig.DB_USER || process.env.DB_USER || 'postgres',
  password: serverRuntimeConfig.DB_PASSWORD || process.env.DB_PASSWORD || 'Admin1234',
  database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME || 'hackerthink',
});

// GET /api/admin/articles/[id] - Get article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { message: 'Invalid article ID' },
        { status: 400 }
      );
    }

    // Fetch article from database
    const { rows } = await pool.query(
      `SELECT 
        a.*,
        u.name as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = $1`,
      [articleId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    const article = rows[0];

    // Format dates
    article.created_at = new Date(article.created_at).toISOString();
    article.updated_at = new Date(article.updated_at).toISOString();
    article.publish_date = article.publish_date ? new Date(article.publish_date).toISOString() : null;
    article.update_date = article.update_date ? new Date(article.update_date).toISOString() : null;
    article.schedule_date = article.schedule_date ? new Date(article.schedule_date).toISOString() : null;

    return NextResponse.json({
      article
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { message: 'Failed to fetch article', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT /api/admin/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { message: 'Invalid article ID' },
        { status: 400 }
      );
    }

    // Check if article exists
    const existingArticle = await pool.query(
      'SELECT id FROM articles WHERE id = $1',
      [articleId]
    );

    if (existingArticle.rows.length === 0) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    const data = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      author_id,
      category_id,
      featured_image,
      meta_title,
      meta_description,
      schema_json,
      published,
      status,
      publish_date,
      update_date,
      schedule_date
    } = data;

    // Determine published status - can come as 'published'/'draft' in status field or boolean in published field
    let finalPublished = published;
    if (status === 'published') {
      finalPublished = true;
    } else if (status === 'draft') {
      finalPublished = false;
    } else if (published === undefined && status === undefined) {
      // If neither is provided, keep existing value
      const currentArticle = await pool.query(
        'SELECT published FROM articles WHERE id = $1',
        [articleId]
      );
      finalPublished = currentArticle.rows[0]?.published || false;
    }

    // Build update query dynamically based on what fields are provided
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`);
      updateValues.push(title);
    }
    if (slug !== undefined) {
      updateFields.push(`slug = $${paramIndex++}`);
      updateValues.push(slug);
    }
    if (excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramIndex++}`);
      updateValues.push(excerpt);
    }
    if (content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`);
      updateValues.push(content);
    }
    if (author_id !== undefined) {
      updateFields.push(`author_id = $${paramIndex++}`);
      updateValues.push(author_id);
    }
    if (category_id !== undefined) {
      updateFields.push(`category_id = $${paramIndex++}`);
      updateValues.push(category_id);
    }
    if (featured_image !== undefined) {
      updateFields.push(`featured_image = $${paramIndex++}`);
      updateValues.push(featured_image);
    }
    if (meta_title !== undefined) {
      updateFields.push(`meta_title = $${paramIndex++}`);
      updateValues.push(meta_title);
    }
    if (meta_description !== undefined) {
      updateFields.push(`meta_description = $${paramIndex++}`);
      updateValues.push(meta_description);
    }
    if (schema_json !== undefined) {
      updateFields.push(`schema_json = $${paramIndex++}`);
      updateValues.push(schema_json);
    }
    if (finalPublished !== undefined) {
      updateFields.push(`published = $${paramIndex++}`);
      updateValues.push(finalPublished);
    }
    if (publish_date !== undefined) {
      updateFields.push(`publish_date = $${paramIndex++}`);
      if (publish_date && publish_date !== '' && publish_date !== null) {
        try {
          // Handle datetime-local format (YYYY-MM-DDTHH:mm) - treat as local time
          let dateValue: Date;
          if (typeof publish_date === 'string' && publish_date.includes('T') && !publish_date.includes('Z') && !publish_date.includes('+')) {
            // datetime-local format without timezone - parse as local time
            dateValue = new Date(publish_date);
          } else {
            // Already in ISO format or has timezone
            dateValue = new Date(publish_date);
          }
          
          if (isNaN(dateValue.getTime())) {
            console.error('Invalid publish_date:', publish_date);
            updateValues.push(null);
          } else {
            const isoString = dateValue.toISOString();
            console.log('Converting publish_date:', publish_date, '->', isoString);
            updateValues.push(isoString);
          }
        } catch (e) {
          console.error('Error parsing publish_date:', publish_date, e);
          updateValues.push(null);
        }
      } else {
        updateValues.push(null);
      }
    }
    if (update_date !== undefined) {
      updateFields.push(`update_date = $${paramIndex++}`);
      if (update_date && update_date !== '' && update_date !== null) {
        try {
          // Handle datetime-local format (YYYY-MM-DDTHH:mm) - treat as local time
          let dateValue: Date;
          if (typeof update_date === 'string' && update_date.includes('T') && !update_date.includes('Z') && !update_date.includes('+')) {
            // datetime-local format without timezone - parse as local time
            dateValue = new Date(update_date);
          } else {
            // Already in ISO format or has timezone
            dateValue = new Date(update_date);
          }
          
          if (isNaN(dateValue.getTime())) {
            console.error('Invalid update_date:', update_date);
            updateValues.push(null);
          } else {
            const isoString = dateValue.toISOString();
            console.log('Converting update_date:', update_date, '->', isoString);
            updateValues.push(isoString);
          }
        } catch (e) {
          console.error('Error parsing update_date:', update_date, e);
          updateValues.push(null);
        }
      } else {
        console.log('update_date is empty or null, setting to null in database');
        updateValues.push(null);
      }
    }
    if (schedule_date !== undefined) {
      updateFields.push(`schedule_date = $${paramIndex++}`);
      if (schedule_date && schedule_date !== '' && schedule_date !== null) {
        try {
          // Handle datetime-local format (YYYY-MM-DDTHH:mm) - treat as local time
          let dateValue: Date;
          if (typeof schedule_date === 'string' && schedule_date.includes('T') && !schedule_date.includes('Z') && !schedule_date.includes('+')) {
            dateValue = new Date(schedule_date);
          } else {
            dateValue = new Date(schedule_date);
          }
          
          if (isNaN(dateValue.getTime())) {
            console.error('Invalid schedule_date:', schedule_date);
            updateValues.push(null);
          } else {
            updateValues.push(dateValue.toISOString());
          }
        } catch (e) {
          console.error('Error parsing schedule_date:', schedule_date, e);
          updateValues.push(null);
        }
      } else {
        updateValues.push(null);
      }
    }

    // Always update updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    if (updateFields.length === 1) {
      // Only updated_at would be updated, which is fine
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
    }

    // Add the WHERE clause parameter
    updateValues.push(articleId);

    const updateQuery = `
      UPDATE articles
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, updateValues);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Article updated successfully',
      article: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { message: 'Failed to update article', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DELETE /api/admin/articles/[id]] Starting delete request');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[DELETE /api/admin/articles/[id]] Unauthorized - no session');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      console.log('[DELETE /api/admin/articles/[id]] Forbidden - not admin');
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    console.log('[DELETE /api/admin/articles/[id]] Received ID:', id);
    
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      console.log('[DELETE /api/admin/articles/[id]] Invalid article ID:', id);
      return NextResponse.json(
        { message: 'Invalid article ID' },
        { status: 400 }
      );
    }

    console.log('[DELETE /api/admin/articles/[id]] Parsed article ID:', articleId);
    console.log('[DELETE /api/admin/articles/[id]] Database config:', {
      host: serverRuntimeConfig.DB_HOST || process.env.DB_HOST,
      port: serverRuntimeConfig.DB_PORT || process.env.DB_PORT,
      user: serverRuntimeConfig.DB_USER || process.env.DB_USER,
      database: serverRuntimeConfig.DB_NAME || process.env.DB_NAME,
    });

    // Check if article exists
    console.log('[DELETE /api/admin/articles/[id]] Checking if article exists...');
    const existingArticle = await pool.query(
      'SELECT id, title FROM articles WHERE id = $1',
      [articleId]
    );

    console.log('[DELETE /api/admin/articles/[id]] Article check result:', existingArticle.rows.length > 0 ? 'Found' : 'Not found');

    if (existingArticle.rows.length === 0) {
      console.log('[DELETE /api/admin/articles/[id]] Article not found with ID:', articleId);
      return NextResponse.json(
        { message: 'Article not found' },
        { status: 404 }
      );
    }

    console.log('[DELETE /api/admin/articles/[id]] Deleting article:', existingArticle.rows[0].title);

    // Delete article
    const result = await pool.query(
      'DELETE FROM articles WHERE id = $1 RETURNING id, title',
      [articleId]
    );

    console.log('[DELETE /api/admin/articles/[id]] Delete result:', result.rows.length > 0 ? 'Success' : 'Failed');

    if (result.rows.length === 0) {
      console.error('[DELETE /api/admin/articles/[id]] Delete query returned no rows');
      return NextResponse.json(
        { message: 'Failed to delete article' },
        { status: 500 }
      );
    }

    console.log('[DELETE /api/admin/articles/[id]] Article deleted successfully:', result.rows[0]);
    return NextResponse.json({
      message: 'Article deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('[DELETE /api/admin/articles/[id]] Error deleting article:', error);
    console.error('[DELETE /api/admin/articles/[id]] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Failed to delete article', 
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

