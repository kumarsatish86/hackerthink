'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NewsEditor from '../NewsEditor';

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

export default function CreateNewsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch categories and authors
    const fetchData = async () => {
      try {
        // Fetch categories (you'll need to create this API endpoint)
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (newsData: any) => {
    try {
      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      });

      if (!response.ok) {
        throw new Error('Failed to create news item');
      }

      const result = await response.json();
      router.push('/admin/content/news');
    } catch (error) {
      console.error('Error creating news item:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <NewsEditor
      onSave={handleSave}
      categories={categories}
      authors={authors}
    />
  );
}

