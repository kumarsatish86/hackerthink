import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pool } from 'pg';
import ThreadView from '@/components/forum/ThreadView';

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
      'SELECT title FROM forum_threads WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      return {
        title: 'Thread Not Found - Forum',
      };
    }

    return {
      title: `${result.rows[0].title} - Forum`,
      description: result.rows[0].title,
    };
  } catch {
    return {
      title: 'Thread - Forum',
    };
  }
}

export default async function ThreadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const result = await pool.query(
      'SELECT id FROM forum_threads WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) {
      notFound();
    }

    return <ThreadView threadSlug={slug} />;
  } catch (error) {
    console.error('Error fetching thread:', error);
    notFound();
  }
}

