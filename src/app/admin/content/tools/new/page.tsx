'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';

// Define toolbar options for the editor
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'script',
  'indent',
  'align',
  'link', 'image', 'video',
  'blockquote', 'code-block'
];

export default function NewToolPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState(false);
  
  useEffect(() => {
    // Add custom CSS to improve ReactQuill styling
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-container {
        min-height: 200px;
        font-size: 16px;
      }
      
      .ql-editor {
        min-height: 200px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .ql-toolbar {
        background-color: white;
        border-top-left-radius: 0.375rem;
        border-top-right-radius: 0.375rem;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  
  const handleDescriptionChange = (content: string) => {
    setDescription(content);
  };

  const handleAutoGenerateSEO = async () => {
    try {
      const form = document.querySelector('form') as HTMLFormElement;
      if (!form) return;
      
      const formData = new FormData(form);
      const title = formData.get('title') as string;
      const category = formData.get('category') as string;
      const platform = formData.get('platform') as string;
      
      const response = await fetch('/api/admin/tools/auto-generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          category,
          platform,
          type: 'tool'
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
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Handle custom category if selected
      let categoryValue = formData.get('category') as string;
      if (categoryValue === 'custom') {
        const customCategoryValue = formData.get('custom_category') as string;
        if (customCategoryValue && customCategoryValue.trim()) {
          categoryValue = customCategoryValue.trim();
        } else {
          categoryValue = 'misc'; // Default to misc if custom is empty
        }
      }
      
      const toolData = {
        title: formData.get('title'),
        slug: formData.get('slug'),
        description: description, // Use the state from editor
        icon: formData.get('icon'),
        file_path: formData.get('file_path'),
        published: formData.get('published') === 'true',
        seo_title: formData.get('seo_title'),
        seo_description: formData.get('seo_description'),
        seo_keywords: formData.get('seo_keywords'),
        category: categoryValue,
        platform: formData.get('platform'),
        license: formData.get('license'),
        official_url: formData.get('official_url'),
        popularity: parseInt(formData.get('popularity') as string) || 5
      };
      
      const response = await fetch(`/api/admin/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tool');
      }
      
      // Redirect to the tools list page after successful creation
      router.push('/admin/content/tools');
    } catch (error) {
      console.error('Error creating tool:', error);
      setError((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Tool</h1>
        
        <Link 
          href="/admin/content/tools" 
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Tools
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="e.g., chmod-calculator"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly name for the tool (no spaces, lowercase)
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Description
              </label>
              <SimpleQuillEditor
                key="tool-description-editor"
                value={description}
                onChange={handleDescriptionChange}
                modules={modules}
                formats={formats}
              />
            </div>
          </div>
          
          {/* Technical Settings */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Technical Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="icon">
                  Icon
                </label>
                <input 
                  type="text"
                  id="icon"
                  name="icon"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., file-lock"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Icon name to display (file-lock, calendar-clock, etc.)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="file_path">
                  File Path *
                </label>
                <input 
                  type="text"
                  id="file_path"
                  name="file_path"
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., /tools/chmod-calculator.html"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Path to the HTML file containing the tool
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full p-2 border border-gray-300 rounded"
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setCustomCategory(true);
                    } else {
                      setCustomCategory(false);
                    }
                  }}
                >
                  <option value="permissions">Permissions</option>
                  <option value="security">Security</option>
                  <option value="scheduling">Scheduling</option>
                  <option value="networking">Networking</option>
                  <option value="file-management">File Management</option>
                  <option value="system">System</option>
                  <option value="development">Development</option>
                  <option value="misc">Miscellaneous</option>
                  <option value="custom">Other (Custom)</option>
                </select>
                
                {customCategory && (
                  <div className="mt-2">
                    <input
                      type="text"
                      id="custom_category"
                      name="custom_category"
                      placeholder="Enter custom category"
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="platform">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="linux">Linux</option>
                  <option value="cross-platform">Cross-Platform</option>
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="license">
                  License
                </label>
                <select
                  id="license"
                  name="license"
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="MIT">MIT</option>
                  <option value="GPL-3.0">GPL-3.0</option>
                  <option value="Apache-2.0">Apache-2.0</option>
                  <option value="BSD-3-Clause">BSD-3-Clause</option>
                  <option value="Proprietary">Proprietary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="popularity">
                  Popularity (1-10)
                </label>
                <input 
                  type="number"
                  id="popularity"
                  name="popularity"
                  min="1"
                  max="10"
                  defaultValue="5"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="official_url">
                Official URL
              </label>
              <input 
                type="url"
                id="official_url"
                name="official_url"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., https://ainews.com/tools/chmod-calculator"
              />
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <input 
                  type="checkbox"
                  id="published"
                  name="published"
                  value="true"
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700" htmlFor="published">
                  Published (visible to users)
                </label>
              </div>
            </div>
          </div>
          
          {/* SEO Settings */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="seo_title">
                  SEO Title
                </label>
                <input 
                  type="text"
                  id="seo_title"
                  name="seo_title"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="seo_description">
                  SEO Description
                </label>
                <textarea 
                  id="seo_description"
                  name="seo_description"
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="seo_keywords">
                  SEO Keywords
                </label>
                <input 
                  type="text"
                  id="seo_keywords"
                  name="seo_keywords"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., linux, chmod, file permissions, calculator"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of keywords
                </p>
              </div>

              {/* AI SEO Generator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h3 className="text-sm font-medium text-blue-900">AI SEO Generator</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSEO}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Auto Generate SEO
                  </button>
                </div>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Analyzes tool content and generates optimized SEO metadata</li>
                  <li>• Creates title, description, keywords, and schema structure</li>
                  <li>• Supports technical tools and advanced categorization</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="schema_json">
                  Schema Structure
                </label>
                <textarea 
                  id="schema_json"
                  name="schema_json"
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                  placeholder="JSON schema structure will be generated automatically..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This field will be automatically populated when you click "Auto Generate SEO"
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Link 
              href="/admin/content/tools"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
            >
              Cancel
            </Link>
            
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Tool'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 