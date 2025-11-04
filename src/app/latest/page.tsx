'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClock, FaUser, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  created_at: string;
  author_name?: string;
  category_name?: string;
}

export default function LatestPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNews(data.news || []);
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
              <FaClock className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Latest News
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Stay updated with the most recent articles and breaking news
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link key={item.id} href={`/news/${item.slug}`}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  {item.featured_image && (
                    <div className="relative h-48 w-full">
                      <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      {item.author_name && (
                        <div className="flex items-center">
                          <FaUser className="mr-1" />
                          <span>{item.author_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

