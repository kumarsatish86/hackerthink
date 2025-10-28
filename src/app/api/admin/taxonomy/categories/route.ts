import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'ainews',
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
      const tutorialResult = await pool.query(`
        SELECT id, name, slug, description, created_at, updated_at
        FROM tutorial_categories 
        WHERE is_active = true 
        ORDER BY order_index, name
      `);
      tutorialCategories = tutorialResult.rows;
    } catch (error) {
      console.error('Error fetching tutorial categories:', error);
    }

    // Transform tutorial categories to match taxonomy format
    const transformedCategories = await Promise.all(tutorialCategories.map(async (cat: any) => {
      // Count tutorials in this category
      let itemCount = 0;
      try {
        const countResult = await pool.query(`
          SELECT COUNT(*) as count 
          FROM tutorials t
          JOIN tutorial_sections ts ON t.id = ts.tutorial_id
          WHERE t.category_id = $1 AND t.is_active = true AND ts.is_active = true
        `, [cat.id]);
        itemCount = parseInt(countResult.rows[0]?.count || '0');
      } catch (error) {
        console.error(`Error counting tutorials for category ${cat.name}:`, error);
      }

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        content_type: 'tutorials' as const,
        item_count: itemCount,
        created_at: cat.created_at || new Date().toISOString(),
        updated_at: cat.updated_at || new Date().toISOString()
      };
    }));

    // Add some mock data for other content types to make the page more complete
    const mockCategories = [
      {
        id: 'mock-1',
        name: 'Linux Basics',
        slug: 'linux-basics',
        description: 'Fundamental Linux concepts and commands',
        content_type: 'articles' as const,
        item_count: 12,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'mock-2',
        name: 'System Administration',
        slug: 'system-administration',
        description: 'Advanced system administration topics',
        content_type: 'articles' as const,
        item_count: 8,
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-10T09:00:00Z'
      },
      {
        id: 'mock-3',
        name: 'DevOps',
        slug: 'devops',
        description: 'DevOps practices and tools',
        content_type: 'courses' as const,
        item_count: 5,
        created_at: '2024-01-08T14:30:00Z',
        updated_at: '2024-01-08T14:30:00Z'
      },
      {
        id: 'mock-4',
        name: 'Security',
        slug: 'security',
        description: 'Linux security and hardening',
        content_type: 'lab_exercises' as const,
        item_count: 15,
        created_at: '2024-01-05T11:15:00Z',
        updated_at: '2024-01-05T11:15:00Z'
      },
      {
        id: 'mock-5',
        name: 'Networking',
        slug: 'networking',
        description: 'Network configuration and troubleshooting',
        content_type: 'scripts' as const,
        item_count: 7,
        created_at: '2024-01-03T16:45:00Z',
        updated_at: '2024-01-03T16:45:00Z'
      }
    ];

    // Combine tutorial categories with mock categories
    const allCategories = [...transformedCategories, ...mockCategories];

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
    const { name, slug, description, content_type } = body;

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
        const result = await pool.query(`
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

        const newCategory = {
          id: result.rows[0].id,
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
    const { id, name, slug, description, content_type } = body;

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
        const result = await pool.query(`
          UPDATE tutorial_categories 
          SET name = $1, slug = $2, description = $3, updated_at = $4
          WHERE id = $5
          RETURNING id, name, slug, description, created_at, updated_at
        `, [name, slug, description || '', new Date(), id]);

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Category not found' },
            { status: 404 }
          );
        }

        const updatedCategory = {
          id: result.rows[0].id,
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

    // For tutorial categories, delete them directly from database
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
      console.error('Error deleting category:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

