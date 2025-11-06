import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('content_type');

    // Fetch tutorial categories directly from database
    let tutorialCategories: any[] = [];
    try {
      // Check if parent_id column exists and fetch categories
      // Note: Removed is_active filter to show all categories in Taxonomy management
      let tutorialQuery = `
        SELECT id, name, slug, description, created_at, updated_at
        FROM tutorial_categories 
        ORDER BY order_index, name
      `;
      
      try {
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'tutorial_categories' AND column_name = 'parent_id'
        `);
        if (columnCheck.rows.length > 0) {
          tutorialQuery = `
            SELECT id, name, slug, description, parent_id, created_at, updated_at
            FROM tutorial_categories 
            ORDER BY order_index, name
          `;
        }
      } catch (e) {
        // Column check failed, use default query
      }
      
      const tutorialResult = await pool.query(tutorialQuery);
      tutorialCategories = tutorialResult.rows;
    } catch (error) {
      console.error('Error fetching tutorial categories:', error);
    }

    // Transform tutorial categories to match taxonomy format
    const transformedTutorialCategories = await Promise.all(tutorialCategories.map(async (cat: any) => {
      // Count tutorials in this category
      let itemCount = 0;
      try {
        // Try to count tutorials - check if tutorials table exists first
        const tableExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'tutorials'
          )
        `);
        
        if (tableExists.rows[0].exists) {
          // Check if category_id column exists in tutorials table
          const columnExists = await pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns 
              WHERE table_name = 'tutorials' AND column_name = 'category_id'
            )
          `);
          
          if (columnExists.rows[0].exists) {
            // Count tutorials - simplified query without join
            const countResult = await pool.query(`
              SELECT COUNT(*) as count 
              FROM tutorials t
              WHERE t.category_id = $1 AND t.is_active = true
            `, [cat.id]);
            itemCount = parseInt(countResult.rows[0]?.count || '0');
          } else {
            // If category_id doesn't exist, set count to 0
            // Categories will still show but with 0 items
            itemCount = 0;
          }
        }
      } catch (error) {
        console.error(`Error counting tutorials for category ${cat.name}:`, error);
        // Don't let counting errors prevent categories from showing
      }

      return {
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        content_type: 'tutorials' as const,
        item_count: itemCount,
        parent_id: cat.parent_id ? cat.parent_id.toString() : null,
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      };
    }));

    // Fetch news categories from database
    let newsCategories: any[] = [];
    try {
      // Check if parent_id column exists and fetch categories
      let newsQuery = `
        SELECT id, name, slug, description, created_at, updated_at
        FROM news_categories 
        ORDER BY name ASC
      `;
      
      try {
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'news_categories' AND column_name = 'parent_id'
        `);
        if (columnCheck.rows.length > 0) {
          newsQuery = `
            SELECT id, name, slug, description, parent_id, created_at, updated_at
            FROM news_categories 
            ORDER BY name ASC
          `;
        }
      } catch (e) {
        // Column check failed, use default query
      }
      
      const newsResult = await pool.query(newsQuery);
      newsCategories = newsResult.rows;
    } catch (error) {
      console.error('Error fetching news categories:', error);
    }

    // Transform news categories to match taxonomy format
    const transformedNewsCategories = await Promise.all(newsCategories.map(async (cat: any) => {
      // Count news items in this category
      let itemCount = 0;
      try {
        const countResult = await pool.query(`
          SELECT COUNT(*) as count 
          FROM news 
          WHERE category_id = $1 AND status = 'published'
        `, [cat.id]);
        itemCount = parseInt(countResult.rows[0]?.count || '0');
      } catch (error) {
        console.error(`Error counting news for category ${cat.name}:`, error);
      }

      return {
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        content_type: 'news' as const,
        item_count: itemCount,
        parent_id: cat.parent_id ? cat.parent_id.toString() : null,
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      };
    }));

    // Fetch command categories from commands table (distinct category values)
    let commandCategories: any[] = [];
    try {
      const commandsResult = await pool.query(`
        SELECT DISTINCT category, COUNT(*) as item_count
        FROM commands 
        WHERE category IS NOT NULL AND category != '' AND published = true
        GROUP BY category
        ORDER BY category ASC
      `);
      commandCategories = commandsResult.rows.map((row: any, index: number) => ({
        id: `cmd-${index + 1}`,
        name: row.category,
        slug: row.category.toLowerCase().replace(/\s+/g, '-'),
        description: '',
        item_count: parseInt(row.item_count || '0'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching command categories:', error);
    }

    // Transform command categories to match taxonomy format
    const transformedCommandCategories = commandCategories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      content_type: 'commands' as const,
      item_count: cat.item_count,
      created_at: cat.created_at,
      updated_at: cat.updated_at
    }));

    // Fetch product categories from products table (distinct category values from JSONB array)
    let productCategories: any[] = [];
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'products'
        )
      `);
      
      if (tableExists.rows[0].exists) {
        const productsResult = await pool.query(`
          SELECT 
            category,
            COUNT(*) as item_count
          FROM (
            SELECT 
              jsonb_array_elements_text(categories) as category,
              id
            FROM products
            WHERE categories IS NOT NULL 
              AND jsonb_typeof(categories) = 'array'
              AND jsonb_array_length(categories) > 0
              AND status = 'published'
          ) AS expanded_categories
          WHERE category IS NOT NULL AND category != ''
          GROUP BY category
          ORDER BY category ASC
        `);
        
        productCategories = productsResult.rows.map((row: any, index: number) => ({
          id: `prod-${index + 1}`,
          name: row.category,
          slug: row.category.toLowerCase().replace(/\s+/g, '-'),
          description: '',
          item_count: parseInt(row.item_count || '0'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error fetching product categories:', error);
    }

    // Transform product categories to match taxonomy format
    const transformedProductCategories = productCategories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      content_type: 'products' as const,
      item_count: cat.item_count,
      created_at: cat.created_at,
      updated_at: cat.updated_at
    }));

    // Fetch article categories from categories table
    let articleCategories: any[] = [];
    try {
      // Check if parent_id column exists and fetch categories
      let articleQuery = `
        SELECT id, name, slug, description, created_at, updated_at
        FROM categories 
        ORDER BY name ASC
      `;
      
      try {
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'parent_id'
        `);
        if (columnCheck.rows.length > 0) {
          articleQuery = `
            SELECT id, name, slug, description, parent_id, created_at, updated_at
            FROM categories 
            ORDER BY name ASC
          `;
        }
      } catch (e) {
        // Column check failed, use default query
      }
      
      const articleResult = await pool.query(articleQuery);
      articleCategories = articleResult.rows;
    } catch (error) {
      console.error('Error fetching article categories:', error);
    }

    // Transform article categories to match taxonomy format
    const transformedArticleCategories = await Promise.all(articleCategories.map(async (cat: any) => {
      // Count articles in this category
      let itemCount = 0;
      try {
        const countResult = await pool.query(`
          SELECT COUNT(*) as count 
          FROM articles 
          WHERE category_id = $1 AND published = true
        `, [cat.id]);
        itemCount = parseInt(countResult.rows[0]?.count || '0');
      } catch (error) {
        console.error(`Error counting articles for category ${cat.name}:`, error);
      }

      return {
        id: cat.id.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        content_type: 'articles' as const,
        item_count: itemCount,
        parent_id: cat.parent_id ? cat.parent_id.toString() : null,
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      };
    }));

    // Combine all categories
    const allCategories = [...transformedTutorialCategories, ...transformedNewsCategories, ...transformedCommandCategories, ...transformedArticleCategories, ...transformedProductCategories];

    // Filter by content type if specified
    let filteredCategories = allCategories;
    if (contentType && contentType !== 'all') {
      filteredCategories = allCategories.filter(cat => cat.content_type === contentType);
    }

    return NextResponse.json({
      categories: filteredCategories,
      total: filteredCategories.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, content_type, parent_id } = body;

    // Validate required fields
    if (!name || !slug || !content_type) {
      return NextResponse.json(
        { error: 'Name, slug, and content_type are required' },
        { status: 400 }
      );
    }

    // For tutorial categories, create them directly in database
    if (content_type === 'tutorials') {
      try {
        // Check if parent_id column exists in tutorial_categories table
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'tutorial_categories' AND column_name = 'parent_id'
        `);
        
        const hasParentId = columnCheck.rows.length > 0;
        
        let result;
        if (hasParentId && parent_id && parent_id !== '') {
          // Insert with parent_id if column exists and parent_id is provided
          // Note: tutorial_categories.id is UUID, so we use the parent_id as-is (not parseInt)
          result = await pool.query(`
            INSERT INTO tutorial_categories (name, slug, description, parent_id, order_index, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, name, slug, description, created_at, updated_at
          `, [
            name,
            slug,
            description || '',
            parent_id || null,
            1,
            true,
            new Date(),
            new Date()
          ]);
        } else {
          // Insert without parent_id
          result = await pool.query(`
            INSERT INTO tutorial_categories (name, slug, description, order_index, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, slug, description, created_at, updated_at
          `, [
            name,
            slug,
            description || '',
            1,
            true,
            new Date(),
            new Date()
          ]);
        }

        const newCategory = {
          id: result.rows[0].id.toString(),
          name: result.rows[0].name,
          slug: result.rows[0].slug,
          description: result.rows[0].description || '',
          content_type: 'tutorials' as const,
          item_count: 0,
          created_at: result.rows[0].created_at || new Date().toISOString(),
          updated_at: result.rows[0].updated_at || new Date().toISOString()
        };

        return NextResponse.json({
          category: newCategory,
          message: 'Tutorial category created successfully'
        }, { status: 201 });
      } catch (dbError: any) {
        if (dbError.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'A category with this name or slug already exists' },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // For news categories, create them in news_categories table
    if (content_type === 'news') {
      try {
        // Check if parent_id column exists in news_categories table
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'news_categories' AND column_name = 'parent_id'
        `);
        
        const hasParentId = columnCheck.rows.length > 0;
        
        let result;
        if (hasParentId && parent_id && parent_id !== '') {
          // Insert with parent_id if column exists and parent_id is provided
          result = await pool.query(`
            INSERT INTO news_categories (name, slug, description, parent_id, created_at, updated_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, name, slug, description, created_at, updated_at
          `, [
            name,
            slug,
            description || '',
            parseInt(parent_id) || null
          ]);
        } else {
          // Insert without parent_id
          result = await pool.query(`
            INSERT INTO news_categories (name, slug, description, created_at, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, name, slug, description, created_at, updated_at
          `, [
            name,
            slug,
            description || ''
          ]);
        }

        const newCategory = {
          id: result.rows[0].id.toString(),
          name: result.rows[0].name,
          slug: result.rows[0].slug,
          description: result.rows[0].description || '',
          content_type: 'news' as const,
          item_count: 0,
          created_at: result.rows[0].created_at || new Date().toISOString(),
          updated_at: result.rows[0].updated_at || new Date().toISOString()
        };

        return NextResponse.json({
          category: newCategory,
          message: 'News category created successfully'
        }, { status: 201 });
      } catch (dbError: any) {
        if (dbError.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'A category with this name or slug already exists' },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // For article categories, create them in categories table
    if (content_type === 'articles') {
      try {
        // Check if parent_id column exists in categories table
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'parent_id'
        `);
        
        const hasParentId = columnCheck.rows.length > 0;
        
        // Check data type of id column in categories table
        const idTypeCheck = await pool.query(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'id'
        `);
        const isUuid = idTypeCheck.rows[0]?.data_type === 'uuid';
        
        let result;
        if (hasParentId && parent_id && parent_id !== '') {
          // Insert with parent_id if column exists and parent_id is provided
          if (isUuid) {
            result = await pool.query(`
              INSERT INTO categories (name, slug, description, parent_id, created_at, updated_at)
              VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id, name, slug, description, created_at, updated_at
            `, [
              name,
              slug,
              description || '',
              parent_id || null
            ]);
          } else {
            result = await pool.query(`
              INSERT INTO categories (name, slug, description, parent_id, created_at, updated_at)
              VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING id, name, slug, description, created_at, updated_at
            `, [
              name,
              slug,
              description || '',
              parseInt(parent_id) || null
            ]);
          }
        } else {
          // Insert without parent_id
          result = await pool.query(`
            INSERT INTO categories (name, slug, description, created_at, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, name, slug, description, created_at, updated_at
          `, [
            name,
            slug,
            description || ''
          ]);
        }

        const newCategory = {
          id: result.rows[0].id.toString(),
          name: result.rows[0].name,
          slug: result.rows[0].slug,
          description: result.rows[0].description || '',
          content_type: 'articles' as const,
          item_count: 0,
          created_at: result.rows[0].created_at || new Date().toISOString(),
          updated_at: result.rows[0].updated_at || new Date().toISOString()
        };

        return NextResponse.json({
          category: newCategory,
          message: 'Article category created successfully'
        }, { status: 201 });
      } catch (dbError: any) {
        if (dbError.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'A category with this name or slug already exists' },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // For other content types, you would implement their creation logic here
    return NextResponse.json(
      { error: 'Content type not yet implemented' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, description, content_type, parent_id } = body;

    // Validate required fields
    if (!id || !name || !slug || !content_type) {
      return NextResponse.json(
        { error: 'ID, name, slug, and content_type are required' },
        { status: 400 }
      );
    }

    // For tutorial categories, update them directly in database
    if (content_type === 'tutorials') {
      try {
        // Check if parent_id column exists
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'tutorial_categories' AND column_name = 'parent_id'
        `);
        const hasParentId = columnCheck.rows.length > 0;
        
        let result;
        if (hasParentId) {
          // Update with parent_id if column exists
          result = await pool.query(`
            UPDATE tutorial_categories 
            SET name = $1, slug = $2, description = $3, parent_id = $4, updated_at = $5
            WHERE id = $6
            RETURNING id, name, slug, description, parent_id, created_at, updated_at
          `, [name, slug, description || '', (parent_id && parent_id !== '') ? parent_id : null, new Date(), id]);
        } else {
          // Update without parent_id
          result = await pool.query(`
            UPDATE tutorial_categories 
            SET name = $1, slug = $2, description = $3, updated_at = $4
            WHERE id = $5
            RETURNING id, name, slug, description, created_at, updated_at
          `, [name, slug, description || '', new Date(), id]);
        }

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        const updatedCategory = {
          id: result.rows[0].id.toString(),
          name: result.rows[0].name,
          slug: result.rows[0].slug,
          description: result.rows[0].description || '',
          content_type: 'tutorials' as const,
          item_count: 0,
          created_at: result.rows[0].created_at || new Date().toISOString(),
          updated_at: result.rows[0].updated_at || new Date().toISOString()
        };

        return NextResponse.json({
          category: updatedCategory,
          message: 'Tutorial category updated successfully'
        });
      } catch (dbError: any) {
        if (dbError.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'A category with this name or slug already exists' },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // For news categories, update them in news_categories table
    if (content_type === 'news') {
      try {
        // Check if parent_id column exists
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'news_categories' AND column_name = 'parent_id'
        `);
        const hasParentId = columnCheck.rows.length > 0;
        
        let result;
        if (hasParentId) {
          // Update with parent_id if column exists
          result = await pool.query(`
            UPDATE news_categories 
            SET name = $1, slug = $2, description = $3, parent_id = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING id, name, slug, description, parent_id, created_at, updated_at
          `, [name, slug, description || '', (parent_id && parent_id !== '') ? parseInt(parent_id) : null, id]);
        } else {
          // Update without parent_id
          result = await pool.query(`
            UPDATE news_categories 
            SET name = $1, slug = $2, description = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, name, slug, description, created_at, updated_at
          `, [name, slug, description || '', id]);
        }

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        const updatedCategory = {
          id: result.rows[0].id.toString(),
          name: result.rows[0].name,
          slug: result.rows[0].slug,
          description: result.rows[0].description || '',
          content_type: 'news' as const,
          item_count: 0,
          created_at: result.rows[0].created_at || new Date().toISOString(),
          updated_at: result.rows[0].updated_at || new Date().toISOString()
        };

        return NextResponse.json({
          category: updatedCategory,
          message: 'News category updated successfully'
        });
      } catch (dbError: any) {
        if (dbError.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'A category with this name or slug already exists' },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // For article categories, update them in categories table
    if (content_type === 'articles') {
      try {
        // Check if parent_id column exists
        const columnCheck = await pool.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'parent_id'
        `);
        const hasParentId = columnCheck.rows.length > 0;
        
        // Check data type of id column in categories table
        const idTypeCheck = await pool.query(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = 'categories' AND column_name = 'id'
        `);
        const isUuid = idTypeCheck.rows[0]?.data_type === 'uuid';
        
        let result;
        if (hasParentId) {
          // Update with parent_id if column exists
          if (isUuid) {
            result = await pool.query(`
              UPDATE categories 
              SET name = $1, slug = $2, description = $3, parent_id = $4, updated_at = CURRENT_TIMESTAMP
              WHERE id = $5
              RETURNING id, name, slug, description, parent_id, created_at, updated_at
            `, [name, slug, description || '', (parent_id && parent_id !== '') ? parent_id : null, id]);
          } else {
            result = await pool.query(`
              UPDATE categories 
              SET name = $1, slug = $2, description = $3, parent_id = $4, updated_at = CURRENT_TIMESTAMP
              WHERE id = $5
              RETURNING id, name, slug, description, parent_id, created_at, updated_at
            `, [name, slug, description || '', (parent_id && parent_id !== '') ? parseInt(parent_id) : null, id]);
          }
        } else {
          // Update without parent_id
          result = await pool.query(`
            UPDATE categories 
            SET name = $1, slug = $2, description = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, name, slug, description, created_at, updated_at
          `, [name, slug, description || '', id]);
        }

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        const updatedCategory = {
          id: result.rows[0].id.toString(),
          name: result.rows[0].name,
          slug: result.rows[0].slug,
          description: result.rows[0].description || '',
          content_type: 'articles' as const,
          item_count: 0,
          created_at: result.rows[0].created_at || new Date().toISOString(),
          updated_at: result.rows[0].updated_at || new Date().toISOString()
        };

        return NextResponse.json({
          category: updatedCategory,
          message: 'Article category updated successfully'
        });
      } catch (dbError: any) {
        if (dbError.code === '23505') { // Unique constraint violation
          return NextResponse.json(
            { error: 'A category with this name or slug already exists' },
            { status: 400 }
          );
        }
        throw dbError;
      }
    }

    // For other content types, you would implement their update logic here
    return NextResponse.json(
      { error: 'Content type not yet implemented' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if it's a tutorial or news category by trying to find it in either table
    // First try tutorial_categories
    let tutorialResult;
    try {
      tutorialResult = await pool.query(`
        SELECT id FROM tutorial_categories WHERE id = $1
      `, [id]);
    } catch (error) {
      tutorialResult = { rows: [] };
    }

    if (tutorialResult.rows.length > 0) {
      // It's a tutorial category
      try {
        const result = await pool.query(`
          UPDATE tutorial_categories 
          SET is_active = false, updated_at = $1
          WHERE id = $2
          RETURNING id
        `, [new Date(), id]);

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: 'Category deleted successfully'
        });
      } catch (dbError) {
        console.error('Error deleting tutorial category:', dbError);
        return NextResponse.json(
          { error: 'Failed to delete category' },
          { status: 500 }
        );
      }
    }

    // Try news_categories
    let newsResult;
    try {
      newsResult = await pool.query(`
        SELECT id FROM news_categories WHERE id = $1
      `, [id]);
    } catch (error) {
      newsResult = { rows: [] };
    }

    if (newsResult.rows.length > 0) {
      // It's a news category
      try {
        // Check if any news items are using this category
        const newsCountResult = await pool.query(`
          SELECT COUNT(*) as count FROM news WHERE category_id = $1
        `, [id]);

        if (parseInt(newsCountResult.rows[0].count) > 0) {
          return NextResponse.json(
            { error: 'Cannot delete category: it is being used by news items' },
            { status: 400 }
          );
        }

        const result = await pool.query(`
          DELETE FROM news_categories 
          WHERE id = $1
          RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: 'Category deleted successfully'
        });
      } catch (dbError) {
        console.error('Error deleting news category:', dbError);
        return NextResponse.json(
          { error: 'Failed to delete category' },
          { status: 500 }
        );
      }
    }

    // Try categories table (for articles)
    let articleResult;
    try {
      articleResult = await pool.query(`
        SELECT id FROM categories WHERE id = $1
      `, [id]);
    } catch (error) {
      articleResult = { rows: [] };
    }

    if (articleResult.rows.length > 0) {
      // It's an article category
      try {
        // Check if any articles are using this category
        const articleCountResult = await pool.query(`
          SELECT COUNT(*) as count FROM articles WHERE category_id = $1
        `, [id]);

        if (parseInt(articleCountResult.rows[0].count) > 0) {
          return NextResponse.json(
            { error: 'Cannot delete category: it is being used by articles' },
            { status: 400 }
          );
        }

        const result = await pool.query(`
          DELETE FROM categories 
          WHERE id = $1
          RETURNING id
        `, [id]);

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          message: 'Category deleted successfully'
        });
      } catch (dbError) {
        console.error('Error deleting article category:', dbError);
        return NextResponse.json(
          { error: 'Failed to delete category' },
          { status: 500 }
        );
      }
    }

    // Category not found in any table
    return NextResponse.json(
      { error: 'Category not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

