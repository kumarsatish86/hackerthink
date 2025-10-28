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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // No authentication required for GET as news may be public
    const { id: newsId } = await params;

    // First, check what columns exist in the news table
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'news'
    `);
    
    const columnNames = columnInfo.map(col => col.column_name);
    
    // Build a query dynamically
    let selectClause = [`n.id`, `n.title`, `n.slug`, `n.content`];
    
    // Add optional columns if they exist
    if (columnNames.includes('excerpt')) selectClause.push(`n.excerpt`);
    if (columnNames.includes('author_id')) selectClause.push(`n.author_id`);
    if (columnNames.includes('status')) selectClause.push(`n.status`);
    if (columnNames.includes('featured_image')) selectClause.push(`n.featured_image`);
    if (columnNames.includes('featured_image_alt')) selectClause.push(`n.featured_image_alt`);
    if (columnNames.includes('category_id')) selectClause.push(`n.category_id`);
    if (columnNames.includes('schedule_date')) selectClause.push(`n.schedule_date`);
    if (columnNames.includes('tags')) selectClause.push(`n.tags`);
    if (columnNames.includes('meta_title')) selectClause.push(`n.meta_title as seo_title`);
    if (columnNames.includes('meta_description')) selectClause.push(`n.meta_description as seo_description`);
    if (columnNames.includes('seo_keywords')) selectClause.push(`n.seo_keywords`);
    if (columnNames.includes('schema_json')) selectClause.push(`n.schema_json`);
    if (columnNames.includes('created_at')) selectClause.push(`n.created_at`);
    if (columnNames.includes('updated_at')) selectClause.push(`n.updated_at`);
    
    // Build from clause and joins
    let fromClause = `FROM news n`;
    let joinClauses = [];
    
    // Add author join if author_id exists
    if (columnNames.includes('author_id')) {
      joinClauses.push(`LEFT JOIN users u ON n.author_id = u.id`);
      selectClause.push(`u.name as author_name`);
    }
    
    // Add category join if category_id exists
    if (columnNames.includes('category_id')) {
      joinClauses.push(`LEFT JOIN news_categories nc ON n.category_id = nc.id`);
      selectClause.push(`nc.name as category_name`);
    }
    
    // Check table types for proper ID handling
    const { rows: tableTypes } = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_name IN ('news', 'users', 'news_categories')
      AND column_name = 'id'
    `);

    // Determine the news ID data type
    const newsIdType = tableTypes.find(t => 
      t.table_name === 'news' && t.column_name === 'id'
    )?.data_type;
    
    // Build the complete query with appropriate casting
    const whereClause = newsIdType === 'uuid' 
      ? `WHERE n.id = $1::uuid`
      : `WHERE n.id = $1::integer`;
      
    const query = `
      SELECT ${selectClause.join(', ')}
      ${fromClause}
      ${joinClauses.join(' ')}
      ${whereClause}
    `;
    
    console.log('Generated query:', query);
    
    // Fetch news from database
    const { rows } = await pool.query(query, [newsId]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'News item not found' }, { status: 404 });
    }

    const newsItem = rows[0];

    return NextResponse.json({ news: newsItem });
  } catch (error) {
    console.error('Error fetching news item:', error);

    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract the ID directly through destructuring
    const { id: newsId } = await params;
    
    // Parse the request body safely
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { 
      title, 
      slug, 
      excerpt, 
      content, 
      author_id,
      featured_image,
      featured_image_alt,
      category_id,
      status,
      schedule_date,
      tags,
      meta_title,
      meta_description,
      schema_json,
      seo_keywords
    } = requestBody;

    // Validation
    if (!title && !content && status === undefined) {
      return NextResponse.json(
        { message: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (title) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (slug) {
      // Check if slug already exists for another news item
      const existingSlug = await pool.query(
        'SELECT id FROM news WHERE slug = $1 AND id != $2',
        [slug, newsId]
      );

      if (existingSlug.rows.length > 0) {
        return NextResponse.json(
          { message: 'Slug already exists for another news item' },
          { status: 409 }
        );
      }

      updates.push(`slug = $${paramIndex}`);
      values.push(slug);
      paramIndex++;
    }

    if (excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex}`);
      values.push(excerpt);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(content);
      paramIndex++;
    }

    if (author_id !== undefined) {
      updates.push(`author_id = $${paramIndex}`);
      values.push(author_id);
      paramIndex++;
    }

    if (featured_image !== undefined) {
      updates.push(`featured_image = $${paramIndex}`);
      values.push(featured_image);
      paramIndex++;
    }

    if (featured_image_alt !== undefined) {
      updates.push(`featured_image_alt = $${paramIndex}`);
      values.push(featured_image_alt);
      paramIndex++;
    }

    if (category_id !== undefined) {
      // Handle category_id - it might be null or a valid ID
      let categoryIdValue = null;
      if (category_id && category_id !== '') {
        categoryIdValue = category_id;
      }
      
      updates.push(`category_id = $${paramIndex}`);
      values.push(categoryIdValue);
      paramIndex++;
    }
    
    // Handle status updates
    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;

      // Handle scheduled status
      if (status === 'scheduled' && schedule_date) {
        updates.push(`schedule_date = $${paramIndex}`);
        values.push(schedule_date);
        paramIndex++;
      } else if (status !== 'scheduled') {
        updates.push(`schedule_date = NULL`);
      }
    }
    
    if (tags !== undefined) {
      // Make sure tags is valid JSON or an empty array
      let tagsValue = [];
      
      if (Array.isArray(tags)) {
        tagsValue = tags;
      } else if (typeof tags === 'string') {
        try {
          tagsValue = JSON.parse(tags);
        } catch (e) {
          // Use empty array if JSON parsing fails
        }
      }
      
      updates.push(`tags = $${paramIndex}`);
      values.push(JSON.stringify(tagsValue));
      paramIndex++;
    }

    if (meta_title !== undefined) {
      updates.push(`meta_title = $${paramIndex}`);
      values.push(meta_title);
      paramIndex++;
    }
    
    if (meta_description !== undefined) {
      updates.push(`meta_description = $${paramIndex}`);
      values.push(meta_description);
      paramIndex++;
    }
    
    if (seo_keywords !== undefined) {
      updates.push(`seo_keywords = $${paramIndex}`);
      values.push(seo_keywords);
      paramIndex++;
    }
    
    if (schema_json !== undefined) {
      updates.push(`schema_json = $${paramIndex}`);
      values.push(schema_json);
      paramIndex++;
    }

    // If no updates were defined, return early
    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Add updated_at to the updates
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add WHERE clause and finalize query
    values.push(newsId);
    const query = `
      UPDATE news
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    console.log('Update query:', query);
    console.log('Values:', values);

    // Execute the query
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'News item updated successfully',
      news: rows[0]
    });
  } catch (error) {
    console.error('Error updating news item:', error);

    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract the ID directly through destructuring
    const { id: newsId } = await params;
    
    // Parse the request body safely
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { status } = requestBody;

    // Validation
    if (!status) {
      return NextResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status values
    if (!['draft', 'published', 'scheduled'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Check the news ID data type
    const { rows: tableTypes } = await pool.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'news' AND column_name = 'id'
    `);
    
    const newsIdType = tableTypes[0]?.data_type;
    const whereClause = newsIdType === 'uuid' 
      ? 'WHERE id = $1::uuid'
      : 'WHERE id = $1::integer';

    // Update status
    const query = `
      UPDATE news
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      ${whereClause}
      RETURNING *
    `;

    console.log('PATCH query:', query);
    console.log('Values:', [newsId, status]);

    // Execute the query
    const { rows } = await pool.query(query, [newsId, status]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'News item status updated successfully',
      news: rows[0]
    });
  } catch (error) {
    console.error('Error updating news item status:', error);

    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Extract the ID directly through destructuring
    const { id: newsId } = await params;

    // Check the news ID data type
    const { rows: tableTypes } = await pool.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'news' AND column_name = 'id'
    `);
    
    const newsIdType = tableTypes[0]?.data_type;
    const deleteQuery = newsIdType === 'uuid' 
      ? 'DELETE FROM news WHERE id = $1::uuid'
      : 'DELETE FROM news WHERE id = $1::integer';
    
    // Delete news from database
    const { rowCount } = await pool.query(deleteQuery, [newsId]);

    if (rowCount === 0) {
      return NextResponse.json({ message: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Error deleting news item:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
