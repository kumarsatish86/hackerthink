'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCommandPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Basic submit logic
  };

  const handleAutoGenerateSEO = async () => {
    try {
      const form = document.querySelector('form') as HTMLFormElement;
      if (!form) return;
      const formData = new FormData(form);
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      const platform = formData.get('platform') as string;
      
      const response = await fetch('/api/admin/commands/auto-generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          platform,
          type: 'command'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate SEO data');
      }
      
      const seoData = await response.json();
      
      // Update form fields with generated SEO data
      const seoTitleField = document.getElementById('seo_title') as HTMLInputElement;
      const seoDescriptionField = document.getElementById('seo_description') as HTMLTextAreaElement;
      const seoKeywordsField = document.getElementById('seo_keywords') as HTMLInputElement;
      const schemaJsonField = document.getElementById('schema_json') as HTMLTextAreaElement;
      
      if (seoTitleField) seoTitleField.value = seoData.seo_title || '';
      if (seoDescriptionField) seoDescriptionField.value = seoData.seo_description || '';
      if (seoKeywordsField) seoKeywordsField.value = seoData.seo_keywords || '';
      if (schemaJsonField) schemaJsonField.value = seoData.schema_json || '';
    } catch (error) {
      console.error('Error generating SEO data:', error);
      setError('Failed to generate SEO data');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Create New Command</h1>
        
        <Link 
          href="/admin/content/commands" 
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
        >
          Back to Commands
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Title *
              </label>
              <input 
                type="text"
                id="title"
                name="title"
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., ls command"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="slug">
                Slug *
              </label>
              <input 
                type="text"
                id="slug"
                name="slug"
                required
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., ls-command"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description *
            </label>
            <textarea 
              id="description"
              name="description"
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Brief description of what the command does"
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Command'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
