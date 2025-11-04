import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pool } from 'pg';
import ThreadList from '@/components/forum/ThreadList';
import CreateThreadButton from '@/components/forum/CreateThreadButton';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const result = await pool.query(
      'SELECT name, description FROM forum_categories WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return {
        title: 'Category Not Found - Forum',
      };
    }

    const category = result.rows[0];
    return {
      title: `${category.name} - Forum`,
      description: category.description || `${category.name} discussion forum`,
    };
  } catch {
    return {
      title: 'Category - Forum',
    };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const result = await pool.query(
      `SELECT 
        fc.*,
        COUNT(DISTINCT ft.id) as thread_count,
        COUNT(DISTINCT fp.id) as post_count
       FROM forum_categories fc
       LEFT JOIN forum_threads ft ON ft.category_id = fc.id
       LEFT JOIN forum_posts fp ON fp.thread_id = ft.id
       WHERE fc.slug = $1
       GROUP BY fc.id`,
      [slug]
    );

    if (result.rows.length === 0) {
      notFound();
    }

    const category = result.rows[0];
    category.permissions = typeof category.permissions === 'string' 
      ? JSON.parse(category.permissions) 
      : category.permissions;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
            <CreateThreadButton categoryId={category.id} />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{parseInt(category.thread_count) || 0} threads</span>
            <span>{parseInt(category.post_count) || 0} posts</span>
          </div>
        </div>

        <ThreadList categoryId={category.id} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching category:', error);
    notFound();
  }
}

