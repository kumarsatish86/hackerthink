'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import TipTapEditor from '@/components/TipTapEditor';

interface Term {
  id?: number;
  term: string;
  slug: string;
  definition: string;
  category: string;
  difficulty_level: string;
  learning_path?: string;
  quiz?: string;
  usage_examples?: string;
  related_terms?: string;
  additional_resources?: string;
  published?: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
}

// Main component that handles both the params issue and ReactQuill issue
export default function TermEditor({ params }: { params: { id: string } }) {
  // Using useParams hook to get the id parameter
  const routeParams = useParams();
  const id = routeParams.id as string;
  const isNew = id === 'new';
  
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [term, setTerm] = useState<Partial<Term>>({
    term: '',
    slug: '',
    definition: '',
    category: 'General',
    difficulty_level: 'Beginner',
    learning_path: '',
    quiz: '',
    usage_examples: '',
    related_terms: '',
    additional_resources: '',
    published: true,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    schema_json: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load term data
  useEffect(() => {
    const loadTerm = async () => {
      if (isNew) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/admin/terms/${id}`);
        if (response.ok) {
          const data = await response.json();
          setTerm({
            ...data.term,
            seo_title: data.term.seo_title || '',
            seo_description: data.term.seo_description || '',
            seo_keywords: data.term.seo_keywords || '',
            schema_json: data.term.schema_json || ''
          });
        } else {
          setError('Failed to load term');
        }
      } catch (err) {
        console.error('Error loading term:', err);
        setError('Failed to load term');
      } finally {
        setLoading(false);
      }
    };

    loadTerm();
  }, [id, isNew]);

  const handleAutoGenerateSEO = async () => {
    if (!term.term || !term.definition) {
      setError('Term name and definition are required to generate SEO content');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/terms/auto-generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          term: term.term,
          definition: term.definition,
          category: term.category
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO content');
      }

      const data = await response.json();
      setTerm(prev => ({
        ...prev,
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_keywords: data.seo_keywords || '',
        schema_json: data.schema_json || ''
      }));
      
      setSuccessMessage('SEO content generated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error generating SEO content:', err);
      setError('Failed to generate SEO content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    
    if (!term.term || !term.definition) {
      setError('Term name and definition are required');
      return;
    }
    
    try {
      setSaving(true);
      
      const url = isNew 
        ? '/api/admin/terms' 
        : `/api/admin/terms/${id}`;
      
      const method = isNew ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(term)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save term');
      }
      
      const data = await response.json();
      
      if (isNew) {
        // Redirect to edit page if new term was created
        router.push(`/admin/content/glossary/${data.term.id}`);
      } else {
        // Update term state and show success message
        setTerm(data.term);
        setSuccessMessage('Term saved successfully');
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error saving term:', err);
      setError(err instanceof Error ? err.message : 'Failed to save term. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin/content/glossary" className="text-indigo-600 hover:text-indigo-900">
          &larr; Back to Glossary
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {isNew ? 'Create New Term' : 'Edit Term'}
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-1">
                Term Name *
              </label>
              <input
                type="text"
                id="term"
                value={term.term || ''}
                onChange={(e) => setTerm(prev => ({ ...prev, term: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                value={term.slug || ''}
                onChange={(e) => setTerm(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={term.category || 'General'}
                onChange={(e) => setTerm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="General">General</option>
                {categories.map((cat) => (
                  <option key={cat.id || cat} value={cat.name || cat}>
                    {cat.name || cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                id="difficulty_level"
                value={term.difficulty_level || 'Beginner'}
                onChange={(e) => setTerm(prev => ({ ...prev, difficulty_level: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
              Definition *
            </label>
            <TipTapEditor
              content={term.definition || ''}
              onChange={(value) => setTerm(prev => ({ ...prev, definition: value }))}
              placeholder="Enter term definition..."
              height="300px"
            />
          </div>

          <div>
            <label htmlFor="learning_path" className="block text-sm font-medium text-gray-700 mb-1">
              Learning Path
            </label>
            <textarea
              id="learning_path"
              value={term.learning_path || ''}
              onChange={(e) => setTerm(prev => ({ ...prev, learning_path: e.target.value }))}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter learning path steps..."
            />
          </div>

          <div>
            <label htmlFor="quiz" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Questions
            </label>
            <textarea
              id="quiz"
              value={term.quiz || ''}
              onChange={(e) => setTerm(prev => ({ ...prev, quiz: e.target.value }))}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter quiz questions..."
            />
          </div>

          <div>
            <label htmlFor="usage_examples" className="block text-sm font-medium text-gray-700 mb-1">
              Usage Examples
            </label>
            <textarea
              id="usage_examples"
              value={term.usage_examples || ''}
              onChange={(e) => setTerm(prev => ({ ...prev, usage_examples: e.target.value }))}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter usage examples..."
            />
          </div>

          <div>
            <label htmlFor="related_terms" className="block text-sm font-medium text-gray-700 mb-1">
              Related Terms
            </label>
            <input
              type="text"
              id="related_terms"
              value={term.related_terms || ''}
              onChange={(e) => setTerm(prev => ({ ...prev, related_terms: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter related terms (comma-separated)..."
            />
          </div>

          <div>
            <label htmlFor="additional_resources" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Resources
            </label>
            <textarea
              id="additional_resources"
              value={term.additional_resources || ''}
              onChange={(e) => setTerm(prev => ({ ...prev, additional_resources: e.target.value }))}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter additional resources..."
            />
          </div>

          {/* SEO Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-700">AI SEO Generator</h4>
                <button
                  type="button"
                  onClick={handleAutoGenerateSEO}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Generating...' : 'Auto Generate SEO'}
                </button>
              </div>

              <div>
                <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seo_title"
                  value={term.seo_title || ''}
                  onChange={(e) => setTerm(prev => ({ ...prev, seo_title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter SEO title..."
                />
              </div>

              <div>
                <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  id="seo_description"
                  value={term.seo_description || ''}
                  onChange={(e) => setTerm(prev => ({ ...prev, seo_description: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter SEO description..."
                />
              </div>

              <div>
                <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  id="seo_keywords"
                  value={term.seo_keywords || ''}
                  onChange={(e) => setTerm(prev => ({ ...prev, seo_keywords: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter SEO keywords (comma-separated)..."
                />
              </div>

              <div>
                <label htmlFor="schema_json" className="block text-sm font-medium text-gray-700 mb-1">
                  Schema Structure
                </label>
                <textarea
                  id="schema_json"
                  value={term.schema_json || ''}
                  onChange={(e) => setTerm(prev => ({ ...prev, schema_json: e.target.value }))}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter JSON-LD schema structure..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Link
              href="/admin/content/glossary"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
                  {isNew ? 'Creating...' : 'Saving...'}
                </>
              ) : (
                <>{isNew ? 'Create Term' : 'Save Changes'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}