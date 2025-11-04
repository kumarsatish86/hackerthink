'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import BasicEditor from '@/components/BasicEditor';
import ScriptSEOPreview from '@/components/SEO/ScriptSEOPreview';
import ScriptSEOForm from '@/components/SEO/ScriptSEOForm';
import SchemaPreview from '@/components/SEO/SchemaPreview';
import React from 'react';

interface ScriptVariant {
  id?: string;
  language: string;
  script_content: string;
  program_output: string;
  file_extension: string;
}

interface ScriptData {
  id: string;
  title: string;
  slug: string;
  description: string;
  script_content: string;
  program_output: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  featured_image: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
  is_multi_language: boolean;
  primary_language: string;
  available_languages: string[];
  variants: ScriptVariant[];
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export default function CreateScript() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScriptData>({
    id: '',
    title: '',
    slug: '',
    description: '',
    script_content: '',
    program_output: '',
    script_type: 'System Administration',
    language: 'Bash',
    os_compatibility: 'Linux',
    difficulty: 'Beginner',
    tags: [] as string[],
    featured_image: '',
    meta_title: '',
    meta_description: '',
    published: false,
    is_multi_language: false,
    primary_language: 'Bash',
    available_languages: ['Bash'],
    variants: [],
    author_id: '',
    author_name: '',
    created_at: '',
    updated_at: ''
  });

  // Function to generate a clean filename from script title
  const generateFileName = (title: string, language?: string) => {
    let cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (language) {
      cleanTitle = `${cleanTitle}-${language.toLowerCase()}`;
    }
    
    return cleanTitle;
  };

  // Predefined options for dropdowns
  const scriptTypes = [
    'System Administration',
    'Networking',
    'Security',
    'DevOps',
    'Automation',
    'Data Processing',
    'Web Development',
    'Database',
    'Utility',
    'Other'
  ];

  const languages = [
    'Bash',
    'Python',
    'JavaScript',
    'PHP',
    'Ruby',
    'Go',
    'Java',
    'C',
    'C++',
    'C#',
    'PowerShell',
    'SQL',
    'Other'
  ];

  const osSystems = [
    'Linux',
    'Windows',
    'macOS',
    'Unix',
    'Android',
    'iOS',
    'Cross-platform'
  ];

  const difficultyLevels = [
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  // Redirect if not authenticated 
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      };
      
      // Auto-generate slug when title changes
      if (name === 'title' && value) {
        const autoSlug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        newData.slug = autoSlug;
      }
      
      return newData;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    
    setFormData(prev => ({
      ...prev,
      tags: tags
    }));
  };

  const handleScriptContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      script_content: value
    }));
  };

  const handleProgramOutputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      program_output: value
    }));
  };

  const handleMultiLanguageToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_multi_language: checked,
      primary_language: checked ? prev.language : '',
      available_languages: checked ? [prev.language] : [],
      variants: checked ? [{
        language: prev.language,
        script_content: prev.script_content,
        program_output: prev.program_output,
        file_extension: getFileExtension(prev.language)
      }] : []
    }));
  };

  const addLanguageVariant = () => {
    const newLanguage = languages.find(lang => 
      !formData.variants.some(v => v.language === lang)
    );
    
    if (newLanguage) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, {
          language: newLanguage,
          script_content: '',
          program_output: '',
          file_extension: getFileExtension(newLanguage)
        }],
        available_languages: [...prev.available_languages, newLanguage]
      }));
    }
  };

  const removeLanguageVariant = (index: number) => {
    setFormData(prev => {
      const newVariants = prev.variants.filter((_, i) => i !== index);
      const removedLanguage = prev.variants[index].language;
      const newAvailableLanguages = prev.available_languages.filter(lang => lang !== removedLanguage);
      
      return {
        ...prev,
        variants: newVariants,
        available_languages: newAvailableLanguages
      };
    });
  };

  const updateVariant = (index: number, field: keyof ScriptVariant, value: string) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title) {
        throw new Error('Title is required');
      }

      if (!formData.script_content && !formData.is_multi_language) {
        throw new Error('Script content is required');
      }

      if (formData.is_multi_language && formData.variants.length === 0) {
        throw new Error('At least one language variant is required for multi-language scripts');
      }

      if (!formData.script_type) {
        throw new Error('Script type is required');
      }

      if (!formData.language) {
        throw new Error('Programming language is required');
      }

      // Create the script
      const response = await fetch('/api/admin/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("API error response:", result);
        throw new Error(result.message || 'Failed to create script');
      }

      // Redirect to the scripts list page
      router.push('/admin/content/scripts');
    } catch (err) {
      setError((err as Error).message);
      console.error("Error submitting form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  function getFileExtension(language: string): string {
    const extensions: { [key: string]: string } = {
      'bash': 'sh',
      'python': 'py',
      'javascript': 'js',
      'php': 'php',
      'ruby': 'rb',
      'go': 'go',
      'java': 'java',
      'c': 'c',
      'c++': 'cpp',
      'c#': 'cs',
      'powershell': 'ps1',
      'sql': 'sql'
    };
    return extensions[language.toLowerCase()] || 'txt';
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Script</h1>
          <p className="text-gray-600">Add a new script or code example</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href="/admin/content/scripts"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
            />
            {formData.title && (
              <p className="mt-1 text-xs text-gray-500">
                📁 Download filename will be: "{generateFileName(formData.title)}.{getFileExtension(formData.language)}"
              </p>
            )}
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug (leave empty to auto-generate)
            </label>
            <div className="relative">
              <input
                type="text"
                name="slug"
                id="slug"
                value={formData.slug || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="auto-generated-from-title"
              />
              {formData.title && formData.slug && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            {formData.title && formData.slug && (
              <p className="mt-1 text-xs text-gray-500">
                ✓ Auto-generated from title: "{formData.slug}"
              </p>
            )}
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Programming Language <span className="text-red-500">*</span>
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="script_type" className="block text-sm font-medium text-gray-700">
              Script Type <span className="text-red-500">*</span>
            </label>
            <select
              id="script_type"
              name="script_type"
              value={formData.script_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              required
            >
              {scriptTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              {difficultyLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="os_compatibility" className="block text-sm font-medium text-gray-700">
              OS Compatibility
            </label>
            <select
              id="os_compatibility"
              name="os_compatibility"
              value={formData.os_compatibility || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            >
              {osSystems.map(os => (
                <option key={os} value={os}>{os}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              id="tags"
              value={formData.tags ? formData.tags.join(', ') : ''}
              onChange={handleTagsChange}
              placeholder="bash, linux, automation"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            />
          </div>

          <div className="col-span-2">
            <div className="flex items-center">
              <input
                id="is_multi_language"
                name="is_multi_language"
                type="checkbox"
                checked={formData.is_multi_language}
                onChange={(e) => handleMultiLanguageToggle(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="is_multi_language" className="ml-2 block text-sm text-gray-900">
                Multi-Language Script (Available in multiple programming languages)
              </label>
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex items-center">
              <input
                id="published"
                name="published"
                type="checkbox"
                checked={formData.published}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                Published
              </label>
            </div>
          </div>

          {/* Multi-Language Variants Section */}
          {formData.is_multi_language && (
            <div className="col-span-2">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Language Variants</h3>
                  <button
                    type="button"
                    onClick={addLanguageVariant}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Language
                  </button>
                </div>

                {formData.variants.map((variant, index) => (
                  <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        {variant.language} Variant
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeLanguageVariant(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <select
                          value={variant.language}
                          onChange={(e) => updateVariant(index, 'language', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        >
                          {languages.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          File Extension
                        </label>
                        <input
                          type="text"
                          value={variant.file_extension}
                          onChange={(e) => updateVariant(index, 'file_extension', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Script Content <span className="text-red-500">*</span>
                      </label>
                      <BasicEditor
                        id={`variant-${index}-content`}
                        name={`Variant ${index} Content`}
                        value={variant.script_content}
                        onChange={(value) => updateVariant(index, 'script_content', value)}
                        placeholder={`#!/bin/bash\n# Enter your ${variant.language} script content here...`}
                        minHeight="200px"
                        isCode={true}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program Output (optional)
                      </label>
                      <BasicEditor
                        id={`variant-${index}-output`}
                        name={`Variant ${index} Output`}
                        value={variant.program_output}
                        onChange={(value) => updateVariant(index, 'program_output', value)}
                        placeholder="Example output when the script is executed..."
                        minHeight="150px"
                        isCode={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Single Language Script Content */}
          {!formData.is_multi_language && (
            <>
              <div className="col-span-2">
                <label htmlFor="script_content" className="block text-sm font-medium text-gray-700">
                  Script Content <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <BasicEditor
                    id="script_content"
                    name="Script Content"
                    value={formData.script_content}
                    onChange={handleScriptContentChange}
                    placeholder="#!/bin/bash
# Enter your script content here..."
                    minHeight="400px"
                    isCode={true}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter the script code here. Make sure to include proper comments and documentation.</p>
              </div>

              <div className="col-span-2">
                <label htmlFor="program_output" className="block text-sm font-medium text-gray-700">
                  Program Output (optional)
                </label>
                <div className="mt-1">
                  <BasicEditor
                    id="program_output"
                    name="Program Output"
                    value={formData.program_output || ''}
                    onChange={handleProgramOutputChange}
                    placeholder="Example output when the script is executed..."
                    minHeight="300px"
                    isCode={true}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Provide an example of what the script outputs when executed.</p>
              </div>
            </>
          )}

          {/* SEO Section */}
          <div className="col-span-2">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                SEO & Meta Data
              </h3>
              <ScriptSEOForm
                scriptData={formData}
                onUpdate={(field, value) => {
                  setFormData(prev => ({ ...prev, [field]: value }));
                }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <button
            type="button"
            onClick={() => router.push('/admin/content/scripts')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Script'}
          </button>
        </div>
      </form>
        </div>
        
        {/* SEO Preview Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Preview</h3>
            <ScriptSEOPreview
              title={formData.title}
              description={formData.description}
              slug={formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || ''}
              language={formData.language}
              scriptType={formData.script_type}
              difficulty={formData.difficulty}
              tags={formData.tags}
              featuredImage={formData.featured_image}
              isMultiLanguage={formData.is_multi_language}
              availableLanguages={formData.available_languages}
            />
          </div>
          
          {/* Schema Structure Preview */}
          <div className="bg-white shadow rounded-lg">
            <SchemaPreview scriptData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
