'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewsEditor from '../NewsEditor';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  featured_image_alt?: string;
  status: 'draft' | 'published' | 'scheduled';
  schedule_date?: string;
  publish_date?: string;
  update_date?: string;
  category_id?: string | null;
  author_id?: string;
  co_authors?: string[];
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  seo_graphs?: string;
  seo_schema?: string;
  estimated_reading_time?: number;
  word_count?: number;
  schema_json?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch news item
        const newsResponse = await fetch(`/api/admin/news/${params.id}`);
        if (!newsResponse.ok) {
          throw new Error('Failed to fetch news item');
        }
        const newsData = await newsResponse.json();
        setNewsItem(newsData.news);

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/news-categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }

        // Fetch authors
        const authorsResponse = await fetch('/api/admin/users');
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json();
          setAuthors(authorsData.users || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSave = async (newsData: any) => {
    try {
      const response = await fetch(`/api/admin/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      });

      if (!response.ok) {
        throw new Error('Failed to update news item');
      }

      const result = await response.json();
      router.push('/admin/content/news');
    } catch (error) {
      console.error('Error updating news item:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/content/news')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">News Item Not Found</h2>
          <p className="text-gray-600 mb-4">The news item you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/content/news')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <NewsEditor
      newsItem={newsItem}
      onSave={handleSave}
      categories={categories}
      authors={authors}
    />
  );
}
