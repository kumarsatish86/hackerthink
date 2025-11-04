'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHeart, FaUser, FaEye, FaCalendarAlt } from 'react-icons/fa';

export default function PopularPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?limit=20')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaHeart className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Popular Articles
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Most read and trending articles on HackerThink
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    {article.author_name && (
                      <div className="flex items-center">
                        <FaUser className="mr-1" />
                        <span>{article.author_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No popular articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

