'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
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

// Metadata should be in a separate layout file, not in a client component
// export const metadata = {
//   title: 'Edit Tool - Admin - HackerThink',
// };

// Define tool type
interface Tool {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  category?: string;
  platform?: string;
  license?: string;
  official_url?: string;
  popularity?: number;
  created_at: string;
  updated_at: string;
}

export default function EditToolPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toolData, setToolData] = useState<Tool | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [customCategory, setCustomCategory] = useState(false);
  
  React.useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/tools/${params.id}`, { 
          cache: 'no-store'
        });
        
        if (!res.ok) {
          if (res.status === 404) {
            setError('Tool not found');
            return;
          }
          throw new Error(`Failed to fetch tool: ${res.statusText}`);
        }
        
        const data = await res.json();
        setToolData(data.tool);
      } catch (error) {
        console.error(`Error fetching tool with ID ${params.id}:`, error);
        setError('Failed to load tool data');
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [params.id]);

  // Check if category is custom when data loads
  useEffect(() => {
    if (toolData) {
      const standardCategories = [
        'permissions', 'security', 'scheduling', 'networking',
        'file-management', 'system', 'development', 'misc'
      ];
      
      if (!standardCategories.includes(toolData.category || 'misc')) {
        setCustomCategory(true);
      }
    }
  }, [toolData]);

  const handleDescriptionChange = (content: string) => {
    if (toolData) {
      setToolData({
        ...toolData,
        description: content
      });
    }
  };

  const handleAutoGenerateSEO = async () => {
    if (!toolData) return;
    
    try {
      const response = await fetch('/api/admin/tools/auto-generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: toolData.title,
          description: toolData.description,
          category: toolData.category,
          platform: toolData.platform,
          type: 'tool'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate SEO data');
      }
      
      const seoData = await response.json();
      
      setToolData({
        ...toolData,
        seo_title: seoData.seo_title,
        seo_description: seoData.seo_description,
        seo_keywords: seoData.seo_keywords,
        schema_json: seoData.schema_json
      });
    } catch (error) {
      console.error('Error generating SEO data:', error);
      setError('Failed to generate SEO data');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!toolData) return;
    
    try {
      const response = await fetch(`/api/admin/tools/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tool');
      }
      
      // Redirect to the tools list page after successful update
      router.push('/admin/content/tools');
    } catch (error) {
      console.error('Error updating tool:', error);
      setError((error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !toolData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-500">
                {error || 'An error occurred while loading the tool.'}
              </p>
            </div>
          </div>
        </div>
        <Link href="/admin/content/tools" className="text-blue-600 hover:text-blue-800">
          Back to Tools
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Tool: {toolData.title}</h1>
        
        <div className="flex items-center">
          <Link 
            href={`/tools/${toolData.slug}`}
            target="_blank"
            className="text-green-600 hover:text-green-800 mr-4"
          >
            View Tool
          </Link>
          
          <Link 
            href="/admin/content/tools" 
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Tools
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={toolData.id} />
          
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
                  value={toolData.title}
                  onChange={(e) => setToolData({...toolData, title: e.target.value})}
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
                  value={toolData.slug}
                  onChange={(e) => setToolData({...toolData, slug: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
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
                key="tool-edit-description-editor"
                value={toolData.description}
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
                  value={toolData.icon}
                  onChange={(e) => setToolData({...toolData, icon: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
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
                  value={toolData.file_path}
                  onChange={(e) => setToolData({...toolData, file_path: e.target.value})}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
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
                  value={customCategory ? 'custom' : (toolData.category || 'misc')}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setCustomCategory(true);
                      setToolData({...toolData, category: toolData.category || ''});
                    } else {
                      setCustomCategory(false);
                      setToolData({...toolData, category: e.target.value});
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
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
                      value={toolData.category || ''}
                      onChange={(e) => setToolData({...toolData, category: e.target.value})}
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
                  value={toolData.platform || 'linux'}
                  onChange={(e) => setToolData({...toolData, platform: e.target.value})}
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
                  value={toolData.license || 'MIT'}
                  onChange={(e) => setToolData({...toolData, license: e.target.value})}
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
                  value={toolData.popularity || 5}
                  onChange={(e) => setToolData({...toolData, popularity: parseInt(e.target.value) || 5})}
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
                value={toolData.official_url || ''}
                onChange={(e) => setToolData({...toolData, official_url: e.target.value})}
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
                  checked={toolData.published}
                  onChange={(e) => setToolData({...toolData, published: e.target.checked})}
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
                  value={toolData.seo_title || ''}
                  onChange={(e) => setToolData({...toolData, seo_title: e.target.value})}
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
                  value={toolData.seo_description || ''}
                  onChange={(e) => setToolData({...toolData, seo_description: e.target.value})}
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
                  value={toolData.seo_keywords || ''}
                  onChange={(e) => setToolData({...toolData, seo_keywords: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
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
                  value={toolData.schema_json || ''}
                  onChange={(e) => setToolData({...toolData, schema_json: e.target.value})}
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
          
          <div className="flex justify-between">
            <Link
              href={`/admin/content/tools/${toolData.id}/delete`}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Delete Tool
            </Link>
            
            <div className="flex">
              <Link 
                href="/admin/content/tools"
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
              >
                Cancel
              </Link>
              
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                disabled={isPending}
              >
                {isPending ? 'Updating...' : 'Update Tool'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 