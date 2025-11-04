import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Pool } from 'pg';
import UserProfile from '@/components/forum/UserProfile';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const result = await pool.query(
      'SELECT name FROM users WHERE id = $1',
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return {
        title: 'User Not Found - Forum',
      };
    }

    return {
      title: `${result.rows[0].name} - Profile - Forum`,
      description: `View ${result.rows[0].name}'s forum profile`,
    };
  } catch {
    return {
      title: 'User Profile - Forum',
    };
  }
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    notFound();
  }

  return <UserProfile userId={userId} />;
}

