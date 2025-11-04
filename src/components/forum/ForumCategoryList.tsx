'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaComments, FaEye, FaLock } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thread_count: number;
  post_count: number;
  last_activity: string | null;
}

export default function ForumCategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories?includeStats=true');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Categories</h2>
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
        <h2 className="text-2xl font-bold">Categories</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories yet. Check back later!
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/forum/category/${category.slug}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {category.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <FaComments className="w-4 h-4" />
                      <span>{category.thread_count} threads</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FaEye className="w-4 h-4" />
                      <span>{category.post_count} posts</span>
                    </span>
                  </div>
                </div>
                {category.last_activity && (
                  <div className="text-sm text-gray-500 ml-4">
                    <p className="text-xs">Last activity</p>
                    <p>{new Date(category.last_activity).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

