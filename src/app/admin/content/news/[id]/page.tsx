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

export default function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsId, setNewsId] = useState<string | null>(null);

  // Get the id from params
  useEffect(() => {
    params.then((resolvedParams) => {
      setNewsId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!newsId) return;

    const fetchData = async () => {
      try {
        // Fetch news item
        const newsResponse = await fetch(`/api/admin/news/${newsId}`);
        if (!newsResponse.ok) {
          if (newsResponse.status === 404) {
            setError('News item not found');
          } else {
            throw new Error('Failed to fetch news item');
          }
          return;
        }
        const newsData = await newsResponse.json();
        // API returns the news item directly, not wrapped in a 'news' property
        setNewsItem(newsData);

        // Fetch categories
        const categoriesResponse = await fetch('/api/admin/news-categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.categories || []);
        }

        // Fetch authors - only users with admin, editor, or author roles
        const authorsResponse = await fetch('/api/admin/users');
        if (authorsResponse.ok) {
          const authorsData = await authorsResponse.json();
          // Filter for users with roles that can be authors (admin, editor, author)
          const authorUsers = (authorsData.users || []).filter((user: Author) => 
            user.role === 'admin' || user.role === 'editor' || user.role === 'author'
          );
          setAuthors(authorUsers);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [newsId]);

  const handleSave = async (newsData: any) => {
    if (!newsId) return;
    
    try {
      // Filter out fields that shouldn't be sent or are read-only
      const { id, created_at, updated_at, update_date, ...updateData } = newsData;
      
      // Clean up the data - ensure proper types and remove undefined values
      const cleanedData: any = {};
      
      if (updateData.title !== undefined) cleanedData.title = updateData.title;
      if (updateData.slug !== undefined) cleanedData.slug = updateData.slug;
      if (updateData.excerpt !== undefined) cleanedData.excerpt = updateData.excerpt;
      if (updateData.content !== undefined) cleanedData.content = updateData.content;
      if (updateData.author_id !== undefined) cleanedData.author_id = updateData.author_id || null;
      if (updateData.category_id !== undefined) cleanedData.category_id = updateData.category_id || null;
      if (updateData.featured_image !== undefined) cleanedData.featured_image = updateData.featured_image || null;
      if (updateData.featured_image_alt !== undefined) cleanedData.featured_image_alt = updateData.featured_image_alt || '';
      if (updateData.status !== undefined) cleanedData.status = updateData.status;
      if (updateData.schedule_date !== undefined) cleanedData.schedule_date = updateData.schedule_date || null;
      if (updateData.publish_date !== undefined) cleanedData.publish_date = updateData.publish_date || null;
      if (updateData.seo_title !== undefined) cleanedData.seo_title = updateData.seo_title || '';
      if (updateData.seo_description !== undefined) cleanedData.seo_description = updateData.seo_description || '';
      if (updateData.seo_keywords !== undefined) cleanedData.seo_keywords = updateData.seo_keywords || '';
      if (updateData.seo_graphs !== undefined) cleanedData.seo_graphs = updateData.seo_graphs || '';
      if (updateData.seo_schema !== undefined) cleanedData.seo_schema = updateData.seo_schema || '';
      if (updateData.schema_json !== undefined) cleanedData.schema_json = updateData.schema_json || '';
      if (updateData.tags !== undefined) cleanedData.tags = Array.isArray(updateData.tags) ? updateData.tags : [];
      if (updateData.co_authors !== undefined) cleanedData.co_authors = Array.isArray(updateData.co_authors) ? updateData.co_authors : [];
      if (updateData.estimated_reading_time !== undefined) cleanedData.estimated_reading_time = updateData.estimated_reading_time || 0;
      if (updateData.word_count !== undefined) cleanedData.word_count = updateData.word_count || 0;

      console.log('Saving news item with cleaned data:', cleanedData);
      
      const response = await fetch(`/api/admin/news/${newsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        console.error('Response status:', response.status);
        throw new Error(responseData.message || responseData.error || 'Failed to update news item');
      }

      console.log('News item updated successfully:', responseData);
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
