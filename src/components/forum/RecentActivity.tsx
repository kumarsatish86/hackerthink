'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaClock } from 'react-icons/fa';

interface Thread {
  id: number;
  title: string;
  slug: string;
  last_post_at: string;
  post_count: number;
  views: number;
}

export default function RecentActivity() {
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentThreads();
  }, []);

  const fetchRecentThreads = async () => {
    try {
      const response = await fetch('/api/forum/threads?limit=5&sortBy=last_post_at&sortOrder=desc');
      const data = await response.json();
      setRecentThreads(data.threads || []);
    } catch (error) {
      console.error('Error fetching recent threads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <FaClock className="w-5 h-5" />
        <span>Recent Activity</span>
      </h3>
      <div className="space-y-4">
        {recentThreads.length === 0 ? (
          <p className="text-sm text-gray-500">No recent activity</p>
        ) : (
          recentThreads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/thread/${thread.slug}`}
              className="block p-3 rounded hover:bg-gray-50 transition-colors"
            >
              <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                {thread.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{thread.post_count} posts</span>
                <span>{new Date(thread.last_post_at).toLocaleDateString()}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

