'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaNewspaper, FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  created_at: string;
  author_name?: string;
  category_name?: string;
  category_slug?: string;
  source_type?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/news?page=${page}&limit=12`);

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNews(data.news || []);
      setPagination(data.pagination || {
        total: 0,
        pages: 1,
        page: 1,
        limit: 12,
      });
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to load news articles');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaNewspaper className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            All News
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Stay updated with the latest news, articles, and breaking stories
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchNews(pagination.page)}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : news.length > 0 ? (
          <>
            <div className="mb-6 text-gray-600">
              <p>
                Showing {news.length} of {pagination.total} articles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {news.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
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
                    {item.category_name && (
                      <div className="flex items-center mb-2">
                        <FaTag className="mr-1 text-red-600 text-xs" />
                        <span className="text-xs text-red-600 font-semibold uppercase">
                          {item.category_name}
                        </span>
                      </div>
                    )}
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
              ))}
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
            <p className="text-gray-600">No news articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
