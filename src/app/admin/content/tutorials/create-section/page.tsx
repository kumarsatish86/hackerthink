'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  category_name: string;
}

export default function CreateSectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorialIdFromUrl = searchParams.get('tutorial_id');
  
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    tutorial_id: tutorialIdFromUrl || '',
    order_index: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutorials();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { tutorialIdFromUrl, tutorialsLength: tutorials.length });
    if (tutorialIdFromUrl && tutorials.length > 0) {
      // Find the tutorial in the list to ensure it exists
      const tutorialExists = tutorials.find(t => t.id === tutorialIdFromUrl);
      if (tutorialExists) {
        setFormData(prev => ({ ...prev, tutorial_id: tutorialIdFromUrl }));
        console.log(`✅ Auto-selected tutorial: ${tutorialExists.title} (ID: ${tutorialIdFromUrl})`);
      } else {
        console.warn(`⚠️ Tutorial ID from URL not found in tutorials list: ${tutorialIdFromUrl}`);
        console.log('Available tutorial IDs:', tutorials.map(t => t.id));
      }
    } else if (tutorialIdFromUrl && tutorials.length === 0) {
      console.log('⏳ Waiting for tutorials to load...');
    } else if (!tutorialIdFromUrl) {
      console.log('ℹ️ No tutorial ID from URL');
    }
  }, [tutorialIdFromUrl, tutorials]);

  const fetchTutorials = async () => {
    try {
      setTutorialsLoading(true);
      console.log('🔍 Fetching tutorials from /api/tutorials...');
      const response = await fetch('/api/tutorials');
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Raw API response:', data);
        console.log('📦 Data type:', typeof data);
        console.log('📦 Data keys:', Object.keys(data));
        
        // Fix: API returns { tutorials: [...] } not { success: true, data: [...] }
        if (data.tutorials) {
          console.log(`✅ Found ${data.tutorials.length} tutorials:`, data.tutorials.map(t => ({ id: t.id, title: t.title })));
          setTutorials(data.tutorials);
          
          // If no tutorial_id from URL, select first tutorial by default
          if (!tutorialIdFromUrl && data.tutorials.length > 0) {
            console.log('✅ Auto-selecting first tutorial:', data.tutorials[0].title);
            setFormData(prev => ({ ...prev, tutorial_id: data.tutorials[0].id }));
          }
        } else {
          console.warn('⚠️ No tutorials key found in response');
          console.log('Available keys:', Object.keys(data));
        }
      } else {
        console.error('❌ Failed to fetch tutorials:', response.status);
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
      }
    } catch (err) {
      console.error('❌ Error fetching tutorials:', err);
    } finally {
      setTutorialsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tutorials/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Fix: Check for both success and data properties
        if (data.success || data.section) {
          // Redirect back to the edit tutorial page if we came from there
          if (tutorialIdFromUrl) {
            router.push(`/admin/content/tutorials/edit-tutorial/${tutorialIdFromUrl}?tab=sections`);
          } else {
            router.push('/admin/content/tutorials');
          }
        } else {
          setError(data.message || 'Failed to create section');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to create section');
      }
    } catch (err) {
      setError('Error creating section');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBackUrl = () => {
    if (tutorialIdFromUrl) {
      return `/admin/content/tutorials/edit-tutorial/${tutorialIdFromUrl}?tab=sections`;
    }
    return '/admin/content/tutorials';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Tutorial Section</h1>
              <p className="text-gray-600 mt-2">Add a new section to organize lessons within a tutorial</p>
            </div>
            <Link
              href={getBackUrl()}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6">
          {tutorialsLoading ? (
            <div className="space-y-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tutorial Selection */}
            <div>
              <label htmlFor="tutorial_id" className="block text-sm font-medium text-gray-700 mb-2">
                Tutorial *
                {tutorialsLoading && (
                  <span className="ml-2 text-sm text-gray-500">(Loading...)</span>
                )}
              </label>
              <select
                id="tutorial_id"
                name="tutorial_id"
                value={formData.tutorial_id}
                onChange={handleInputChange}
                required
                disabled={tutorialsLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {tutorialsLoading ? 'Loading tutorials...' : 'Select a tutorial'}
                </option>
                {!tutorialsLoading && tutorials.map((tutorial) => (
                  <option key={tutorial.id} value={tutorial.id}>
                    {tutorial.title}
                  </option>
                ))}
              </select>
              {tutorialsLoading ? (
                <p className="text-sm text-blue-500 mt-1">Loading available tutorials...</p>
              ) : tutorials.length === 0 ? (
                <p className="text-sm text-red-500 mt-1">No tutorials available. Please create a tutorial first.</p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  {tutorialIdFromUrl 
                    ? `Creating section for: ${tutorials.find(t => t.id === tutorialIdFromUrl)?.title || 'Selected tutorial'}`
                    : 'Choose the tutorial this section belongs to'
                  }
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Section Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Getting Started"
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., getting-started"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Generate
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                URL-friendly version of the title (auto-generated)
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of what this section covers..."
              />
            </div>

            {/* Order Index */}
            <div>
              <label htmlFor="order_index" className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                id="order_index"
                name="order_index"
                value={formData.order_index}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Lower numbers appear first in the section list
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href={getBackUrl()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
