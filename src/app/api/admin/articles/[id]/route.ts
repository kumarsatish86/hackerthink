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
    // No authentication required for GET as articles may be public
    const { id: articleId } = await params;

    // First, check what columns exist in the articles table
    const { rows: columnInfo } = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles'
    `);
    
    const columnNames = columnInfo.map(col => col.column_name);
    
    // Build a query dynamically
    let selectClause = [`a.id`, `a.title`, `a.slug`, `a.content`];
    
    // Add optional columns if they exist
    if (columnNames.includes('excerpt')) selectClause.push(`a.excerpt`);
    if (columnNames.includes('author_id')) selectClause.push(`a.author_id`);
    if (columnNames.includes('published')) selectClause.push(`a.published`);
    if (columnNames.includes('featured_image')) selectClause.push(`a.featured_image`);
    if (columnNames.includes('featured_image_alt')) selectClause.push(`a.featured_image_alt`);
    if (columnNames.includes('category_id')) selectClause.push(`a.category_id`);
    if (columnNames.includes('schedule_date')) selectClause.push(`a.schedule_date`);
    if (columnNames.includes('tags')) selectClause.push(`a.tags`);
    if (columnNames.includes('meta_title')) selectClause.push(`a.meta_title as seo_title`);
    if (columnNames.includes('meta_description')) selectClause.push(`a.meta_description as seo_description`);
    if (columnNames.includes('seo_keywords')) selectClause.push(`a.seo_keywords`);
    if (columnNames.includes('schema_json')) selectClause.push(`a.schema_json`);
    if (columnNames.includes('word_count')) selectClause.push(`a.word_count`);
    if (columnNames.includes('estimated_reading_time')) selectClause.push(`a.estimated_reading_time`);
    if (columnNames.includes('created_at')) selectClause.push(`a.created_at`);
    if (columnNames.includes('updated_at')) selectClause.push(`a.updated_at`);
    
    // Add join columns for author and category if needed
    let joinClauses = [];
    let fromClause = `FROM articles a`;
    
    // Get the exact data types from the database
    const { rows: tableTypes } = await pool.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type 
      FROM 
        information_schema.columns 
      WHERE 
        table_name IN ('articles', 'users', 'categories') 
        AND column_name IN ('id', 'author_id', 'category_id')
    `);
    
    // Log table types for debugging
    console.log('Table types:', tableTypes);
    
    // Add author name if author_id exists
    if (columnNames.includes('author_id')) {
      selectClause.push(`u.name as author_name`);
      // Use the simple text comparison without casting 
      joinClauses.push(`LEFT JOIN users u ON a.author_id = u.id::text`);
    }
    
    // Add category name if category_id exists
    if (columnNames.includes('category_id')) {
      selectClause.push(`c.name as category_name`);
      // Use direct text comparison or UUID casting based on data type
      const categoryIdType = tableTypes.find(t => 
        t.table_name === 'categories' && t.column_name === 'id'
      )?.data_type;
      
      if (categoryIdType === 'uuid') {
        // For UUID categories
        joinClauses.push(`LEFT JOIN categories c ON a.category_id::text = c.id::text`);
      } else {
        // For integer categories
        joinClauses.push(`LEFT JOIN categories c ON a.category_id::integer = c.id::integer`);
      }
    }
    
    // Determine the article ID data type
    const articleIdType = tableTypes.find(t => 
      t.table_name === 'articles' && t.column_name === 'id'
    )?.data_type;
    
    // Build the complete query with appropriate casting
    const whereClause = articleIdType === 'uuid' 
      ? `WHERE a.id = $1::uuid`
      : `WHERE a.id = $1::integer`;
      
    const query = `
      SELECT ${selectClause.join(', ')}
      ${fromClause}
      ${joinClauses.join(' ')}
      ${whereClause}
    `;
    
    console.log('Generated query:', query);
    
    // Fetch article from database
    const { rows } = await pool.query(query, [articleId]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    const article = rows[0];

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
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
    const { id: articleId } = await params;
    
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
      seo_keywords,
      // Convert status to published boolean
      published = status === 'published' 
    } = requestBody;

    // Validation
    if (!title && !content && status === undefined && published === undefined) {
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
      // Check if slug already exists for another article
      const existingSlug = await pool.query(
        'SELECT * FROM articles WHERE slug = $1 AND id != $2',
        [slug, articleId]
      );

      if (existingSlug.rows.length > 0) {
        return NextResponse.json(
          { message: 'Article with this slug already exists' },
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

    if (content) {
      updates.push(`content = $${paramIndex}`);
      values.push(content);
      paramIndex++;
    }
    
    if (author_id !== undefined) {
      // If author_id is a UUID, we need to store it properly
      let authorIdValue = author_id;
      
      // If it's an empty string, set to NULL
      if (author_id === '') {
        authorIdValue = null;
      }
      
      updates.push(`author_id = $${paramIndex}`);
      values.push(authorIdValue);
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
      // Handle UUID for category_id
      let categoryIdValue = null;
      
      if (category_id && category_id !== '') {
        categoryIdValue = category_id;
      }
      
      updates.push(`category_id = $${paramIndex}`);
      values.push(categoryIdValue);
      paramIndex++;
    }
    
    // Handle direct published flag or status string
    if (published !== undefined) {
      updates.push(`published = $${paramIndex}`);
      values.push(published);
      paramIndex++;
    } else if (status !== undefined) {
      // Convert status to published boolean
      const isPublished = status === 'published';
      updates.push(`published = $${paramIndex}`);
      values.push(isPublished);
      paramIndex++;

      // Handle scheduled status
      if (status === 'scheduled' && schedule_date) {
        updates.push(`schedule_date = $${paramIndex}`);
        values.push(schedule_date);
        paramIndex++;
      } else {
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
    values.push(articleId);
    const query = `
      UPDATE articles
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    console.log('Update query:', query);
    console.log('Values:', values);

    // Execute the query
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Article updated successfully',
      article: rows[0]
    });
  } catch (error) {
    console.error('Error updating article:', error);
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
    const { id: articleId } = await params;

    // Check the article ID data type
    const { rows: tableTypes } = await pool.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'id'
    `);
    
    const articleIdType = tableTypes[0]?.data_type;
    const deleteQuery = articleIdType === 'uuid' 
      ? 'DELETE FROM articles WHERE id = $1::uuid'
      : 'DELETE FROM articles WHERE id = $1::integer';
    
    // Delete article from database
    const { rowCount } = await pool.query(deleteQuery, [articleId]);

    if (rowCount === 0) {
      return NextResponse.json({ message: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}