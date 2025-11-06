import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// GET /api/admin/news/[id] - Get a single news item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch news item from database
    const { rows } = await pool.query(
      `SELECT 
        n.*,
        u.name as author_name,
        nc.name as category_name,
        nc.slug as category_slug
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      WHERE n.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'News item not found' }, { status: 404 });
    }

    const newsItem = rows[0];

    // Format the response to match what the frontend expects
    const formattedNewsItem = {
      id: newsItem.id,
      title: newsItem.title,
      slug: newsItem.slug,
      content: newsItem.content,
      excerpt: newsItem.excerpt || '',
      featured_image: newsItem.featured_image || null,
      featured_image_alt: newsItem.featured_image_alt || '',
      status: newsItem.status,
      schedule_date: newsItem.schedule_date ? new Date(newsItem.schedule_date).toISOString() : null,
      publish_date: newsItem.publish_date ? new Date(newsItem.publish_date).toISOString() : null,
      update_date: newsItem.updated_at ? new Date(newsItem.updated_at).toISOString() : null,
      category_id: newsItem.category_id ? newsItem.category_id.toString() : null,
      author_id: newsItem.author_id ? newsItem.author_id.toString() : null,
      co_authors: Array.isArray(newsItem.co_authors) ? newsItem.co_authors : [],
      tags: Array.isArray(newsItem.tags) ? newsItem.tags : (typeof newsItem.tags === 'string' ? JSON.parse(newsItem.tags || '[]') : []),
      seo_title: newsItem.meta_title || '',
      seo_description: newsItem.meta_description || '',
      seo_keywords: newsItem.seo_keywords || '',
      seo_graphs: newsItem.seo_graphs || '',
      seo_schema: newsItem.seo_schema || '',
      estimated_reading_time: newsItem.estimated_reading_time || 0,
      word_count: newsItem.word_count || 0,
      schema_json: newsItem.schema_json ? (typeof newsItem.schema_json === 'string' ? newsItem.schema_json : JSON.stringify(newsItem.schema_json)) : '',
      created_at: newsItem.created_at ? new Date(newsItem.created_at).toISOString() : null,
      updated_at: newsItem.updated_at ? new Date(newsItem.updated_at).toISOString() : null
    };

    return NextResponse.json(formattedNewsItem);
  } catch (error) {
    console.error('Error fetching news item:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/news/[id] - Update a news item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      author_id,
      category_id,
      featured_image,
      featured_image_alt,
      meta_title,
      meta_description,
      seo_title, // Frontend uses seo_title, map to meta_title
      seo_description, // Frontend uses seo_description, map to meta_description
      seo_keywords,
      seo_graphs,
      seo_schema,
      schema_json,
      tags,
      status,
      schedule_date,
      publish_date,
      co_authors,
      estimated_reading_time,
      word_count
    } = body;

    // Map frontend field names to database field names
    const finalMetaTitle = meta_title || seo_title;
    const finalMetaDescription = meta_description || seo_description;

    // Check if news item exists
    const existingNews = await pool.query(
      'SELECT id, title FROM news WHERE id = $1',
      [id]
    );

    if (existingNews.rows.length === 0) {
      return NextResponse.json({ message: 'News item not found' }, { status: 404 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex++}`);
      values.push(slug);
    }
    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex++}`);
      values.push(excerpt);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (author_id !== undefined) {
      updates.push(`author_id = $${paramIndex++}`);
      // Handle empty string as null
      values.push(author_id === '' || author_id === null ? null : author_id);
    }
    if (category_id !== undefined) {
      updates.push(`category_id = $${paramIndex++}`);
      // Handle empty string as null
      values.push(category_id === '' || category_id === null ? null : category_id);
    }
    if (featured_image !== undefined) {
      updates.push(`featured_image = $${paramIndex++}`);
      values.push(featured_image);
    }
    if (featured_image_alt !== undefined) {
      updates.push(`featured_image_alt = $${paramIndex++}`);
      values.push(featured_image_alt);
    }
    if (finalMetaTitle !== undefined) {
      updates.push(`meta_title = $${paramIndex++}`);
      values.push(finalMetaTitle);
    }
    if (finalMetaDescription !== undefined) {
      updates.push(`meta_description = $${paramIndex++}`);
      values.push(finalMetaDescription);
    }
    if (seo_keywords !== undefined) {
      updates.push(`seo_keywords = $${paramIndex++}`);
      values.push(seo_keywords || null);
    }
    if (seo_graphs !== undefined) {
      updates.push(`seo_graphs = $${paramIndex++}`);
      values.push(seo_graphs || null);
    }
    if (seo_schema !== undefined) {
      updates.push(`seo_schema = $${paramIndex++}`);
      values.push(seo_schema || null);
    }
    if (schema_json !== undefined) {
      updates.push(`schema_json = $${paramIndex++}::jsonb`);
      // Handle schema_json - convert to valid JSON or null
      if (!schema_json || schema_json === '' || schema_json === 'null') {
        values.push(null);
      } else if (typeof schema_json === 'string') {
        // Try to parse and validate JSON string
        try {
          JSON.parse(schema_json);
          values.push(schema_json);
        } catch (e) {
          console.error('[PATCH] Invalid JSON in schema_json, setting to null:', e);
          values.push(null);
        }
      } else {
        // It's an object, stringify it
        values.push(JSON.stringify(schema_json));
      }
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}::jsonb`);
      // Handle tags - ensure it's a valid JSON array
      if (!tags || (Array.isArray(tags) && tags.length === 0)) {
        values.push('[]');
      } else if (Array.isArray(tags)) {
        values.push(JSON.stringify(tags));
      } else if (typeof tags === 'string') {
        // Try to parse and validate JSON string
        try {
          const parsed = JSON.parse(tags);
          if (Array.isArray(parsed)) {
            values.push(tags);
          } else {
            values.push('[]');
          }
        } catch (e) {
          console.error('[PATCH] Invalid JSON in tags, setting to empty array:', e);
          values.push('[]');
        }
      } else {
        values.push('[]');
      }
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (schedule_date !== undefined) {
      updates.push(`schedule_date = $${paramIndex++}`);
      if (schedule_date && schedule_date !== '' && schedule_date !== null) {
        try {
          values.push(new Date(schedule_date).toISOString());
        } catch (e) {
          console.error('Error parsing schedule_date:', schedule_date, e);
          values.push(null);
        }
      } else {
        values.push(null);
      }
    }
    if (publish_date !== undefined) {
      updates.push(`publish_date = $${paramIndex++}`);
      if (publish_date && publish_date !== '' && publish_date !== null) {
        try {
          values.push(new Date(publish_date).toISOString());
        } catch (e) {
          console.error('Error parsing publish_date:', publish_date, e);
          values.push(null);
        }
      } else {
        values.push(null);
      }
    }
    if (co_authors !== undefined) {
      updates.push(`co_authors = $${paramIndex++}::jsonb`);
      // Handle co_authors - ensure it's a valid JSON array
      if (!co_authors || (Array.isArray(co_authors) && co_authors.length === 0)) {
        values.push('[]');
      } else if (Array.isArray(co_authors)) {
        values.push(JSON.stringify(co_authors));
      } else if (typeof co_authors === 'string') {
        // Try to parse and validate JSON string
        try {
          const parsed = JSON.parse(co_authors);
          if (Array.isArray(parsed)) {
            values.push(co_authors);
          } else {
            values.push('[]');
          }
        } catch (e) {
          console.error('[PATCH] Invalid JSON in co_authors, setting to empty array:', e);
          values.push('[]');
        }
      } else {
        values.push('[]');
      }
    }
    if (estimated_reading_time !== undefined) {
      updates.push(`estimated_reading_time = $${paramIndex++}`);
      values.push(estimated_reading_time || 0);
    }
    if (word_count !== undefined) {
      updates.push(`word_count = $${paramIndex++}`);
      values.push(word_count || 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add id to values for WHERE clause
    values.push(id);

    const updateQuery = `
      UPDATE news 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    console.log('[PATCH /api/admin/news/[id]] Update query:', updateQuery);
    console.log('[PATCH /api/admin/news/[id]] Values count:', values.length);
    console.log('[PATCH /api/admin/news/[id]] Values:', values);
    console.log('[PATCH /api/admin/news/[id]] News ID:', id);
    console.log('[PATCH /api/admin/news/[id]] Parameter index:', paramIndex);

    let result;
    try {
      result = await pool.query(updateQuery, values);
      console.log('[PATCH /api/admin/news/[id]] Update successful, rows affected:', result.rows.length);
    } catch (dbError: any) {
      console.error('[PATCH /api/admin/news/[id]] Database error:', dbError);
      console.error('[PATCH /api/admin/news/[id]] Error code:', dbError.code);
      console.error('[PATCH /api/admin/news/[id]] Error message:', dbError.message);
      console.error('[PATCH /api/admin/news/[id]] Error detail:', dbError.detail);
      throw dbError;
    }

    if (result.rows.length === 0) {
      console.error('[PATCH /api/admin/news/[id]] No rows returned from UPDATE');
      return NextResponse.json({ message: 'Failed to update news item' }, { status: 500 });
    }

    console.log('[PATCH /api/admin/news/[id]] News item updated successfully');
    return NextResponse.json({
      message: 'News item updated successfully',
      news: result.rows[0]
    });
  } catch (error) {
    console.error('[PATCH /api/admin/news/[id]] Error updating news item:', error);
    console.error('[PATCH /api/admin/news/[id]] Error details:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/news/[id] - Delete a news item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[DELETE /api/admin/news/[id]] Starting delete request');
    
    const { id } = await params;
    console.log('[DELETE /api/admin/news/[id]] Received ID:', id);

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('[DELETE /api/admin/news/[id]] Unauthorized - no session');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user?.role !== 'admin') {
      console.log('[DELETE /api/admin/news/[id]] Forbidden - not admin');
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Check if news item exists
    console.log('[DELETE /api/admin/news/[id]] Checking if news item exists...');
    const existingNews = await pool.query(
      'SELECT id, title FROM news WHERE id = $1',
      [id]
    );

    console.log('[DELETE /api/admin/news/[id]] News check result:', existingNews.rows.length > 0 ? 'Found' : 'Not found');

    if (existingNews.rows.length === 0) {
      console.log('[DELETE /api/admin/news/[id]] News item not found with ID:', id);
      return NextResponse.json(
        { message: 'News item not found' },
        { status: 404 }
      );
    }

    console.log('[DELETE /api/admin/news/[id]] Deleting news item:', existingNews.rows[0].title);

    // Delete news item
    const result = await pool.query(
      'DELETE FROM news WHERE id = $1 RETURNING id, title',
      [id]
    );

    console.log('[DELETE /api/admin/news/[id]] Delete result:', result.rows.length > 0 ? 'Success' : 'Failed');

    if (result.rows.length === 0) {
      console.error('[DELETE /api/admin/news/[id]] Delete query returned no rows');
      return NextResponse.json(
        { message: 'Failed to delete news item' },
        { status: 500 }
      );
    }

    console.log('[DELETE /api/admin/news/[id]] News item deleted successfully:', result.rows[0]);
    return NextResponse.json({
      message: 'News item deleted successfully',
      deleted: result.rows[0]
    });
  } catch (error) {
    console.error('[DELETE /api/admin/news/[id]] Error deleting news item:', error);
    console.error('[DELETE /api/admin/news/[id]] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        message: 'Failed to delete news item', 
        error: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

