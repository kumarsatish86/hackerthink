'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  created_at: string;
  author_name?: string;
  category_name?: string;
  sourceType?: 'article' | 'news';
}

export default function BreakingNewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/breaking?page=${page}&limit=12`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch breaking news');
      }
      
      const data = await response.json();
      setNews(data.news || []);
      setPagination(data.pagination || {
        total: 0,
        pages: 1,
        page: 1,
        limit: 12
      });
    } catch (err) {
      console.error('Error fetching breaking news:', err);
      setError('Failed to load breaking news');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get article/news URL
  const getArticleUrl = (item: NewsItem) => {
    return item.sourceType === 'article' 
      ? `/articles/${item.slug}` 
      : `/news/${item.slug}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Breaking News</h1>
        <p className="text-gray-600">
          {pagination.total} {pagination.total === 1 ? 'article' : 'articles'} published today
        </p>
      </div>

      {/* News Grid */}
      {news.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {news.map((item) => {
              const articleUrl = getArticleUrl(item);
              return (
                <Link
                  key={item.id}
                  href={articleUrl}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {item.featured_image && (
                    <div className="relative h-48 w-full">
                      <img
                        src={item.featured_image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                      {item.author_name && (
                        <div className="flex items-center">
                          <FaUser className="mr-1" />
                          <span>{item.author_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => fetchNews(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => fetchNews(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No breaking news articles published today.</p>
        </div>
      )}
    </div>
  );
}

