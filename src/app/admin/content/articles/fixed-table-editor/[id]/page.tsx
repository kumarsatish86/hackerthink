'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Import editor with dynamic import to avoid SSR issues
const TableEditor = dynamic(() => import('@/components/TableEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-md p-4 flex items-center justify-center bg-gray-50" style={{ minHeight: '400px' }}>
      <p className="text-gray-500">Loading editor...</p>
    </div>
  )
});

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published';
}

export default function FixedTableEditorPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  
  const [article, setArticle] = useState<Article>({
    id: '',
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft'
  });

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/articles/${articleId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        
        // Process data to fix any table structure issues
        let fixedContent = data.content;
        
        // If content has tables, fix the structure
        if (fixedContent && fixedContent.includes('<table')) {
          try {
            const response = await fetch('/api/fix-table-content', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: fixedContent })
            });
            
            if (response.ok) {
              const result = await response.json();
              fixedContent = result.content;
            }
          } catch (err) {
            console.error('Error fixing table content:', err);
            // Continue with original content if fixing fails
          }
        }
        
        setArticle({
          ...data,
          content: fixedContent
        });
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArticle(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content: string) => {
    setArticle(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Fix table structure one more time before saving
      let contentToSave = article.content;
      
      if (contentToSave && contentToSave.includes('<table')) {
        try {
          const response = await fetch('/api/fix-table-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: contentToSave })
          });
          
          if (response.ok) {
            const result = await response.json();
            contentToSave = result.content;
          }
        } catch (err) {
          console.error('Error fixing table content before save:', err);
          // Continue with original content if fixing fails
        }
      }
      
      const articleToSave = {
        ...article,
        content: contentToSave
      };
      
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleToSave)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      
      setSaveMessage('Article saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      setSaving(false);
      
    } catch (err) {
      console.error('Error saving article:', err);
      setError('Failed to save article. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fixed Table Editor</h1>
        <Link 
          href="/admin/content/articles"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Back to Articles
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {saveMessage && (
        <div className="bg-green-50 border border-green-300 text-green-700 p-4 rounded-md mb-6">
          {saveMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={article.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={article.slug}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Using Fixed Table Editor:</strong> This editor preserves table structure when editing and saving content.
                Use the TABLE button in the toolbar to insert properly structured tables.
              </p>
            </div>
            <TableEditor 
              value={article.content}
              onChange={handleContentChange}
              height="600px"
            />
          </div>
          
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={article.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={article.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/content/articles')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 