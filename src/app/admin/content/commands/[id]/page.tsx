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

// Define command type
interface Command {
  id: number;
  title: string;
  slug: string;
  description: string;
  syntax: string;
  examples: string;
  options: string;
  notes: string;
  category: string;
  platform: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  created_at: string;
  updated_at: string;
}

export default function EditCommandPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [commandData, setCommandData] = useState<Command>({
    id: 0,
    title: '',
    slug: '',
    description: '',
    syntax: '',
    examples: '',
    options: '',
    notes: '',
    category: 'misc',
    platform: 'linux',
    icon: '',
    file_path: '',
    published: false,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    schema_json: '',
    created_at: '',
    updated_at: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Categories for dropdown
  const categories = [
    { id: 'file-management', name: 'File Management' },
    { id: 'user-management', name: 'User Management' },
    { id: 'process-management', name: 'Process Management' },
    { id: 'networking', name: 'Networking' },
    { id: 'permissions', name: 'Permissions' },
    { id: 'package-management', name: 'Package Management' },
    { id: 'system-management', name: 'System Management' },
    { id: 'misc', name: 'Miscellaneous' }
  ];
  
  // Platforms for dropdown
  const platforms = [
    { id: 'linux', name: 'Linux' },
    { id: 'unix', name: 'Unix' },
    { id: 'macos', name: 'macOS' },
    { id: 'all', name: 'All Platforms' }
  ];
  
  useEffect(() => {
    async function fetchCommand() {
      const commandId = params.id;
      
      // If this is the "new" page, skip fetching
      if (commandId === 'new') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/commands/${commandId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error(`Failed to fetch command: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCommandData(data.command);
      } catch (err) {
        console.error('Error fetching command:', err);
        setError('Failed to load command. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCommand();
  }, [params.id]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCommandData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle rich text editor changes
  const handleDescriptionChange = (value: string) => {
    setCommandData(prev => ({ ...prev, description: value }));
  };
  
  const handleSyntaxChange = (value: string) => {
    setCommandData(prev => ({ ...prev, syntax: value }));
  };
  
  const handleOptionsChange = (value: string) => {
    setCommandData(prev => ({ ...prev, options: value }));
  };
  
  const handleExamplesChange = (value: string) => {
    setCommandData(prev => ({ ...prev, examples: value }));
  };
  
  const handleNotesChange = (value: string) => {
    setCommandData(prev => ({ ...prev, notes: value }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCommandData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Generate slug from title
  const generateSlug = () => {
    const slug = commandData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    
    setCommandData(prev => ({ ...prev, slug }));
  };

  // Auto Generate SEO
  const handleAutoGenerateSEO = async () => {
    if (!commandData.title) {
      setSaveError('Please enter a title before generating SEO');
      return;
    }

    try {
      const response = await fetch('/api/admin/commands/auto-generate-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: commandData.title,
          description: commandData.description,
          category: commandData.category,
          platform: commandData.platform,
          type: 'command'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO data');
      }

      const seoData = await response.json();
      setCommandData(prev => ({
        ...prev,
        seo_title: seoData.seo_title,
        seo_description: seoData.seo_description,
        seo_keywords: seoData.seo_keywords,
        schema_json: seoData.schema_json
      }));
    } catch (error) {
      console.error('Error generating SEO data:', error);
      setSaveError('Failed to generate SEO data');
    }
  };
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    
    // Validate form
    if (!commandData.title || !commandData.slug) {
      setSaveError('Title and slug are required fields.');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const method = params.id === 'new' ? 'POST' : 'PUT';
      const url = params.id === 'new' 
        ? '/api/admin/commands' 
        : `/api/admin/commands/${params.id}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commandData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save command');
      }
      
      const data = await response.json();
      
      setSaveSuccess(true);
      
      // Redirect to command list page or stay on edit page for new command
      if (params.id === 'new') {
        startTransition(() => {
          router.push(`/admin/content/commands/${data.command.id}`);
        });
      }
    } catch (err: any) {
      console.error('Error saving command:', err);
      setSaveError(err.message || 'Failed to save command. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
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
        <Link 
          href="/admin/content/commands"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Back to Commands
        </Link>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {params.id === 'new' ? 'Add New Command' : `Edit Command: ${commandData.title}`}
        </h1>
        
        <div className="flex space-x-4">
          <Link 
            href="/admin/content/commands"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          
          {params.id !== 'new' && (
            <Link 
              href={`/commands/${commandData.slug}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
            >
              View
            </Link>
          )}
        </div>
      </div>
      
      {saveError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          </div>
        </div>
      )}
      
      {saveSuccess && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Command saved successfully.</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
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
                  value={commandData.title}
                  onChange={handleChange}
                  onBlur={() => {
                    if (!commandData.slug && commandData.title) {
                      generateSlug();
                    }
                  }}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="slug">
                  Slug *
                </label>
                <div className="flex">
                  <input 
                    type="text"
                    id="slug"
                    name="slug"
                    value={commandData.slug}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-l"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r border border-gray-300 border-l-0"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  URL-friendly name for the command (no spaces, lowercase)
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Description
              </label>
              <SimpleQuillEditor
                key="command-edit-description-editor"
                value={commandData.description}
                onChange={handleDescriptionChange}
                modules={modules}
                formats={formats}
              />
            </div>
          </div>
        </div>
        
        {/* Command Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Command Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="syntax">
                Syntax
              </label>
              <textarea
                id="syntax"
                name="syntax"
                value={commandData.syntax}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                placeholder="command [options] [arguments]"
              />
              <p className="text-xs text-gray-500 mt-1">
                The proper syntax for using this command
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="options">
                Options
              </label>
              <SimpleQuillEditor
                key="command-edit-options-editor"
                value={commandData.options}
                onChange={handleOptionsChange}
                modules={modules}
                formats={formats}
              />
              <p className="text-xs text-gray-500 mt-1">
                Explain the available options for this command
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="examples">
                Examples
              </label>
              <SimpleQuillEditor
                key="command-edit-examples-editor"
                value={commandData.examples}
                onChange={handleExamplesChange}
                modules={modules}
                formats={formats}
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide usage examples of the command
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                Notes
              </label>
              <SimpleQuillEditor
                key="command-edit-notes-editor"
                value={commandData.notes}
                onChange={handleNotesChange}
                modules={modules}
                formats={formats}
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional information, caveats, or warnings about the command
              </p>
            </div>
          </div>
        </div>
        
        {/* Technical Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Technical Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={commandData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="platform">
                  Platform
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={commandData.platform}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="icon">
                Icon
              </label>
              <input 
                type="text"
                id="icon"
                name="icon"
                value={commandData.icon}
                onChange={handleChange}
                placeholder="e.g., 🔍 or fa-search"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Emoji or Font Awesome icon for the command
              </p>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="file_path">
                File Path
              </label>
              <input 
                type="text"
                id="file_path"
                name="file_path"
                value={commandData.file_path}
                onChange={handleChange}
                placeholder="e.g., /public/content/commands/ls.html"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Path to HTML file with additional content (optional)
              </p>
            </div>
            
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="published"
                name="published"
                checked={commandData.published}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Published
              </label>
            </div>
          </div>
        </div>
        
        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">SEO Settings</h2>
              <button
                type="button"
                onClick={handleAutoGenerateSEO}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                Auto Generate SEO
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="seo_title">
                  SEO Title
                </label>
                <input 
                  type="text"
                  id="seo_title"
                  name="seo_title"
                  value={commandData.seo_title || ''}
                  onChange={handleChange}
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
                  value={commandData.seo_description || ''}
                  onChange={handleChange}
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
                  value={commandData.seo_keywords || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g., linux, command, file management"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated keywords for SEO
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="schema_json">
                  Schema Structure
                </label>
                <textarea 
                  id="schema_json"
                  name="schema_json"
                  value={commandData.schema_json || ''}
                  onChange={handleChange}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
                  placeholder="JSON-LD structured data will be generated automatically..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  JSON-LD structured data for search engines (auto-generated)
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link 
            href="/admin/content/commands"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Command'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 