import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from 'next-auth';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

// Simple function to test database connection
async function testDatabaseConnection() {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Check table structure to understand column types
async function getTableStructure() {
  try {
    const { rows } = await pool.query(`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        udt_name
      FROM 
        information_schema.columns
      WHERE 
        table_name IN ('news', 'users', 'news_categories')
        AND column_name IN ('id', 'author_id', 'category_id')
    `);
    
    console.log('Table structure details:', rows);
    return rows;
  } catch (error) {
    console.error('Error getting table structure:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    console.log('Starting GET request for news');
    
    // Test database connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      console.error('Cannot proceed: Database connection failed');
      return NextResponse.json(
        { message: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Check table structure to understand column types
    const tableStructure = await getTableStructure();
    
    // Get column types from structure
    const columnTypes = {};
    tableStructure.forEach(col => {
      columnTypes[`${col.table_name}.${col.column_name}`] = col.data_type;
    });
    
    console.log('Column types mapping:', columnTypes);
    
    // Check session (but don't block if not authenticated for debugging)
    let session;
    try {
      session = await getServerSession();
      console.log('Session check:', session ? 'Authenticated' : 'Not authenticated');
    } catch (error) {
      console.error('Error checking session:', error);
    }
    
    console.log('Fetching news');
    
    // Retrieve all news
    const { rows: news } = await pool.query('SELECT * FROM news ORDER BY created_at DESC');
    console.log(`Retrieved ${news.length} news items`);
    
    // Get unique author_ids 
    const authorIds = Array.from(new Set(news.map(n => n.author_id).filter(Boolean)));
    console.log('Author IDs:', authorIds);
    
    // Get unique category_ids - need to handle the integer to UUID conversion
    const categoryIds = Array.from(new Set(news.map(n => n.category_id).filter(Boolean)));
    console.log('Category IDs:', categoryIds);
    
    // Retrieve author data
    let authors = [];
    if (authorIds.length > 0) {
      try {
        // First check if the users table exists and has data
        const { rows: userCheck } = await pool.query(`
          SELECT COUNT(*) FROM users
        `);
        console.log(`User count: ${userCheck[0].count}`);
        
        // Retrieve all users for comprehensive mapping
        const { rows: allUsers } = await pool.query(`
          SELECT * FROM users
        `);
        console.log(`Total users in database: ${allUsers.length}`);
        
        // Try direct lookup for each author ID with explicit type conversion
        authors = [];
        for (const authorId of authorIds) {
          try {
            const { rows: authorRows } = await pool.query(`
              SELECT id, name FROM users WHERE id::text = $1
            `, [authorId.toString()]);
            
            if (authorRows.length > 0) {
              authors.push(authorRows[0]);
            } else {
              console.log(`No user found with ID ${authorId}`);
            }
          } catch (err) {
            console.error(`Error looking up author ID ${authorId}:`, err);
          }
        }
        
        console.log(`Successfully retrieved ${authors.length} authors out of ${authorIds.length} IDs:`, authors);
      } catch (error) {
        console.error('Error retrieving authors:', error);
      }
    }
    
    // Create author map with multiple ID formats for reliable lookup
    const authorMap = authors.reduce((map, author) => {
      // Store with both original format and string format for safer lookup
      map[author.id] = author.name;
      map[author.id.toString()] = author.name;
      return map;
    }, {});
    
    console.log('Author mapping:', authorMap);
    
    // Retrieve category data with proper type handling
    let categories = [];
    if (categoryIds.length > 0) {
      try {
        // Check if news_categories exist first
        const { rows: categoryCheck } = await pool.query(`
          SELECT COUNT(*) FROM news_categories
        `);
        console.log(`News category count: ${categoryCheck[0].count}`);
        
        // Convert integer ids to strings for the query if needed
        const categoryIdStrings = categoryIds.map(id => id.toString());
        
        // Adjust this query based on whether category_id is integer and id is UUID
        const { rows } = await pool.query(`
          SELECT * FROM news_categories
        `);
        console.log('All news categories:', rows);
        
        // Try direct lookup for each category ID
        categories = [];
        for (const categoryId of categoryIds) {
          try {
            const { rows: categoryRows } = await pool.query(`
              SELECT id, name FROM news_categories WHERE id::text = $1
            `, [categoryId.toString()]);
            
            if (categoryRows.length > 0) {
              categories.push(categoryRows[0]);
            }
          } catch (err) {
            console.error(`Error looking up category ID ${categoryId}:`, err);
          }
        }
        
        console.log(`Successfully retrieved ${categories.length} news categories:`, categories);
      } catch (error) {
        console.error('Error retrieving news categories:', error);
      }
    }
    
    // Create category map
    const categoryMap = categories.reduce((map, category) => {
      // Store with both string and number keys to handle type conversion safely
      map[category.id] = category.name;
      map[category.id.toString()] = category.name;
      return map;
    }, {});
    
    console.log('Category mapping:', categoryMap);
    
    // Format the news data
    const formattedNews = news.map(newsItem => {
      // Try to get author name with multiple fallbacks
      let authorName = 'Unknown';
      const authorId = newsItem.author_id;
      
      if (authorId) {
        // Try different formats of the ID for lookup
        if (authorMap[authorId]) {
          authorName = authorMap[authorId];
        } else if (authorMap[authorId.toString()]) {
          authorName = authorMap[authorId.toString()];
        }
        
        console.log(`News ${newsItem.id} author mapping: ID=${authorId}, Name=${authorName}`);
      }
      
      // Try to get a category name from the category_id with multiple fallbacks
      let categoryName = 'Uncategorized';
      const categoryId = newsItem.category_id;
      
      if (categoryId) {
        // Try different formats of the ID for lookup
        if (categoryMap[categoryId]) {
          categoryName = categoryMap[categoryId];
        } else if (categoryMap[categoryId.toString()]) {
          categoryName = categoryMap[categoryId.toString()];
        }
        
        console.log(`News ${newsItem.id} category mapping: ID=${categoryId}, Name=${categoryName}`);
      }
      
      return {
        ...newsItem,
        created_at: newsItem.created_at ? new Date(newsItem.created_at).toISOString() : null,
        updated_at: newsItem.updated_at ? new Date(newsItem.updated_at).toISOString() : null,
        author_name: authorName,
        category_name: categoryName,
        tags: Array.isArray(newsItem.tags) ? newsItem.tags : []
      };
    });
    
    console.log('Successfully formatted news with author and category data');
    return NextResponse.json({ news: formattedNews });
  } catch (error) {
    console.error('Top-level error in GET /api/admin/news:', error);
    // Return a detailed error response
    return NextResponse.json({
      message: 'Failed to fetch news',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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
      tags,
      status = 'draft' 
    } = await request.json();

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const finalSlug = slug || title.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');

    // Check if slug already exists
    const existingSlug = await pool.query(
      'SELECT * FROM news WHERE slug = $1',
      [finalSlug]
    );

    if (existingSlug.rows.length > 0) {
      return NextResponse.json(
        { message: 'News item with this slug already exists' },
        { status: 409 }
      );
    }

    // Determine the author ID (use the provided one or default to session user's ID if available)
    // If neither is available, use null (the database should have a default or allow nulls)
    const finalAuthorId = author_id || (session.user?.id) || null;

    // Insert news into database
    const result = await pool.query(
      `INSERT INTO news (
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
        tags,
        status, 
        created_at, 
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id, 
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
        tags,
        status, 
        created_at, 
        updated_at`,
      [
        title, 
        finalSlug, 
        excerpt, 
        content, 
        finalAuthorId, 
        category_id ? category_id : null,
        featured_image || null,
        meta_title || null,
        meta_description || null,
        schema_json || null,
        tags ? JSON.stringify(tags) : '[]',
        status
      ]
    );

    const newNews = result.rows[0];

    return NextResponse.json(
      { message: 'News item created successfully', news: newNews },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating news item:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}

