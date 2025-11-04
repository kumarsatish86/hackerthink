'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FaLock, FaThumbtack, FaCheckCircle, FaEye, FaComments, FaClock } from 'react-icons/fa';

interface Thread {
  id: number;
  title: string;
  slug: string;
  post_count: number;
  views: number;
  is_locked: boolean;
  is_sticky: boolean;
  is_solved: boolean;
  last_post_at: string;
  created_at: string;
  author: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

interface ThreadListProps {
  categoryId: number;
}

export default function ThreadList({ categoryId }: ThreadListProps) {
  const searchParams = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const sortBy = searchParams.get('sortBy') || 'last_post_at';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchThreads();
  }, [categoryId, sortBy, sortOrder, page]);

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/forum/threads?categoryId=${categoryId}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=20`
      );
      const data = await response.json();
      setThreads(data.threads || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Threads</h2>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              const params = new URLSearchParams(searchParams.toString());
              params.set('sortBy', newSortBy);
              params.set('sortOrder', newSortOrder);
              window.location.href = `/forum/category/${categoryId}?${params.toString()}`;
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="last_post_at-desc">Latest Posts</option>
            <option value="created_at-desc">Newest First</option>
            <option value="views-desc">Most Viewed</option>
            <option value="post_count-desc">Most Replies</option>
          </select>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {threads.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No threads yet. Be the first to start a discussion!
          </div>
        ) : (
          threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/thread/${thread.slug}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {thread.is_sticky && (
                      <FaThumbtack className="w-4 h-4 text-yellow-500" title="Sticky" />
                    )}
                    {thread.is_locked && (
                      <FaLock className="w-4 h-4 text-gray-500" title="Locked" />
                    )}
                    {thread.is_solved && (
                      <FaCheckCircle className="w-4 h-4 text-green-500" title="Solved" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <FaComments className="w-4 h-4" />
                      <span>{thread.post_count} posts</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaEye className="w-4 h-4" />
                      <span>{thread.views} views</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaClock className="w-4 h-4" />
                      <span>{new Date(thread.last_post_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 ml-4">
                  <p className="font-medium">{thread.author.name}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
      {pagination.totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex space-x-2">
            {pagination.page > 1 && (
              <Link
                href={`?page=${pagination.page - 1}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Previous
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`?page=${pagination.page + 1}&sortBy=${sortBy}&sortOrder=${sortOrder}`}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

