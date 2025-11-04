import { Metadata } from 'next';
import Link from 'next/link';
import { Pool } from 'pg';
import { FaComments, FaEye, FaClock } from 'react-icons/fa';
import ForumCategoryList from '@/components/forum/ForumCategoryList';
import RecentActivity from '@/components/forum/RecentActivity';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin1234',
  database: process.env.DB_NAME || 'hackerthink',
});

export const metadata: Metadata = {
  title: 'Forum - HackerThink',
  description: 'Join the AI community discussion forum',
};

async function getForumStats() {
  try {
    const statsResult = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM forum_threads) as total_threads,
        (SELECT COUNT(*) FROM forum_posts) as total_posts,
        (SELECT COUNT(*) FROM users WHERE forum_post_count > 0) as active_users
    `);

    return {
      total_threads: parseInt(statsResult.rows[0].total_threads) || 0,
      total_posts: parseInt(statsResult.rows[0].total_posts) || 0,
      active_users: parseInt(statsResult.rows[0].active_users) || 0,
    };
  } catch (error) {
    console.error('Error fetching forum stats:', error);
    return {
      total_threads: 0,
      total_posts: 0,
      active_users: 0,
    };
  }
}

export default async function ForumPage() {
  const stats = await getForumStats();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">AI Community Forum</h1>
        <p className="text-xl text-red-100">
          Connect with fellow AI enthusiasts, ask questions, and share knowledge
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Threads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_threads}</p>
            </div>
            <FaComments className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total_posts}</p>
            </div>
            <FaEye className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active_users}</p>
            </div>
            <FaClock className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories */}
        <div className="lg:col-span-2">
          <ForumCategoryList />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

