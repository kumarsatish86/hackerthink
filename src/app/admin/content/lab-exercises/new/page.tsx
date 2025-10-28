'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import StepsEditor from '@/components/StepsEditor';
import TipTapEditor from '@/components/TipTapEditor';
import ScriptSEOGenerator from '@/components/SEO/ScriptSEOGenerator';

// Import the Editor component with dynamic loading to prevent SSR issues
const Editor = dynamic(() => import('@/components/Editor'), { ssr: false });

export default function NewLabExercise() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seoData, setSeoData] = useState({
    meta_title: '',
    meta_description: '',
    schema_json: ''
  });
  const [authors, setAuthors] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    instructions: '',
    solution: '',
    difficulty: 'Beginner',
    duration: 30,
    prerequisites: '',
    related_course_id: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    schema_json: '',
    published: false,
    author_id: '',
    helpful_resources: [],
    terminal_simulation: {},
    related_exercises: [],
    sidebar_settings: {}
  });

  // Fetch authors on component mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          // Filter for users with roles that can be authors (admin, author)
          const authorUsers = data.users.filter((user: any) => 
            user.role === 'admin' || user.role === 'author'
          );
          setAuthors(authorUsers.map((user: any) => ({
            id: user.id,
            name: user.name
          })));
        }
      } catch (err) {
        console.error('Error fetching authors:', err);
      }
    };

    if (status === 'authenticated') {
      fetchAuthors();
    }
  }, [status]);

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
      if (name === 'title' && value && !prev.slug) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        
        newData.slug = slug;
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

  const handleContentChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  }, []);

  const handleInstructionsChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: value
    }));
  }, []);

  const handleSolutionChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      solution: value
    }));
  }, []);

  const handleSEOGenerate = (generatedData: { 
    meta_title: string; 
    meta_description: string; 
    open_graph_title: string;
    open_graph_description: string;
    schema_keywords: string[];
    schema_categories: string[];
    schema_audience: string;
    schema_learning_resource_type: string;
  }) => {
    // Create a basic schema for lab exercises
    const schemaJson = {
      "@context": "https://schema.org",
      "@type": "LearningResource",
      "name": generatedData.meta_title,
      "description": generatedData.meta_description,
      "learningResourceType": generatedData.schema_learning_resource_type || "Lab Exercise",
      "educationalLevel": formData.difficulty,
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": generatedData.schema_audience || "student"
      },
      "keywords": generatedData.schema_keywords.join(", "),
      "about": generatedData.schema_categories.join(", "),
      "timeRequired": `PT${formData.duration}M`,
      "inLanguage": "en"
    };

    const seoData = {
      meta_title: generatedData.meta_title,
      meta_description: generatedData.meta_description,
      schema_json: JSON.stringify(schemaJson, null, 2)
    };

    setSeoData(seoData);
    setFormData(prev => ({
      ...prev,
      meta_title: generatedData.meta_title,
      meta_description: generatedData.meta_description,
      schema_json: seoData.schema_json
    }));
  };

  const handleSEOChange = (field: string, value: string) => {
    setSeoData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Debug information
    console.log("Current session:", session);
    console.log("User role:", session?.user?.role);

    try {
      // Validate required fields
      if (!formData.title) {
        throw new Error('Title is required');
      }

      if (!formData.content) {
        throw new Error('Content is required');
      }

      if (!formData.instructions) {
        throw new Error('Instructions are required');
      }

      // Submit the form data
      const response = await fetch('/api/admin/lab-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("API error response:", result);
        throw new Error(result.message || 'Failed to create lab exercise');
      }

      // Redirect to the lab exercises list page
      router.push('/admin/content/lab-exercises');
    } catch (err) {
      setError((err as Error).message);
      console.error("Error submitting form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Lab Exercise</h1>
          <p className="text-gray-600">Add a new lab exercise to your platform</p>
        </div>
        <Link
          href="/admin/content/lab-exercises"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </Link>
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

      <form onSubmit={handleSubmit} className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Row 1: Title and Slug */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
              Slug (leave empty to auto-generate)
            </label>
            <input
              type="text"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {formData.title && !formData.slug && (
              <p className="mt-1 text-xs text-gray-500">
                💡 Slug will be auto-generated from title
              </p>
            )}
            {formData.slug && (
              <p className="mt-1 text-xs text-green-600">
                ✅ Slug: {formData.slug}
              </p>
            )}
          </div>

          {/* Row 2: Difficulty Level and Duration */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              id="duration"
              min="1"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Row 3: Description and Prerequisites */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700">
              Prerequisites
            </label>
            <textarea
              id="prerequisites"
              name="prerequisites"
              rows={3}
              value={formData.prerequisites}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter prerequisites, one per line..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter each prerequisite on a separate line for better formatting
            </p>
          </div>

          <div>
            <label htmlFor="related_course_id" className="block text-sm font-medium text-gray-700">
              Related Course ID (optional)
            </label>
            <input
              type="text"
              name="related_course_id"
              id="related_course_id"
              value={formData.related_course_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="author_id" className="block text-sm font-medium text-gray-700">
              Author <span className="text-red-500">*</span>
            </label>
            <select
              id="author_id"
              name="author_id"
              value={formData.author_id}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select an author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
              Featured Image URL
            </label>
            <input
              type="text"
              name="featured_image"
              id="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="col-span-2">
            <h3 className="text-lg font-medium leading-6 text-gray-900 my-4">Content <span className="text-red-500">*</span></h3>
            <TipTapEditor
              content={formData.content}
                onChange={handleContentChange} 
                placeholder="Enter the content for this lab exercise..."
              height="400px"
              />
          </div>

          <div className="col-span-2">
            <h3 className="text-lg font-medium leading-6 text-gray-900 my-4">Instructions <span className="text-red-500">*</span></h3>
            <div className="border border-gray-300 rounded-md">
              <StepsEditor 
                value={formData.instructions} 
                onChange={handleInstructionsChange} 
                placeholder="Enter step-by-step instructions for this lab exercise..."
              />
            </div>
          </div>

          <div className="col-span-2">
            <h3 className="text-lg font-medium leading-6 text-gray-900 my-4">Solution</h3>
            <TipTapEditor
              content={formData.solution}
                onChange={handleSolutionChange} 
                placeholder="Enter the solution for this lab exercise (optional)..."
              height="400px"
            />
          </div>

          {/* Sidebar Configuration Section */}
          <div className="col-span-2">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sidebar Configuration</h3>
              <p className="text-sm text-gray-600 mb-6">Configure the sidebar components that will appear on the public lab exercise page.</p>
              
              <div className="space-y-8">
                {/* Helpful Resources */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Helpful Resources</h4>
                  <div className="space-y-3">
                    {formData.helpful_resources.map((resource, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Resource title"
                          value={resource.title || ''}
                          onChange={(e) => {
                            const newResources = [...formData.helpful_resources];
                            newResources[index] = { ...resource, title: e.target.value };
                            setFormData({ ...formData, helpful_resources: newResources });
                          }}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <input
                          type="url"
                          placeholder="URL"
                          value={resource.url || ''}
                          onChange={(e) => {
                            const newResources = [...formData.helpful_resources];
                            newResources[index] = { ...resource, url: e.target.value };
                            setFormData({ ...formData, helpful_resources: newResources });
                          }}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newResources = formData.helpful_resources.filter((_, i) => i !== index);
                            setFormData({ ...formData, helpful_resources: newResources });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          helpful_resources: [...formData.helpful_resources, { title: '', url: '' }]
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Resource
                    </button>
                  </div>
                </div>

                {/* Terminal Simulation */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Terminal Simulation</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terminal Title
                      </label>
                      <input
                        type="text"
                        value={formData.terminal_simulation.title || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            terminal_simulation: { ...formData.terminal_simulation, title: e.target.value }
                          });
                        }}
                        placeholder="e.g., Terminal, Command Line, etc."
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terminal Commands (one per line)
                      </label>
                      <textarea
                        rows={6}
                        value={formData.terminal_simulation.commands || ''}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            terminal_simulation: { ...formData.terminal_simulation, commands: e.target.value }
                          });
                        }}
                        placeholder="Enter terminal commands, one per line:&#10;$ ls -la&#10;total 32&#10;drwxr-xr-x 5 user staff 160 Mar 10 14:23 .&#10;drwxr-xr-x 3 user staff 96 Mar 10 14:22 ..&#10;-rw-r--r-- 1 user staff 108 Mar 10 14:23 script.sh&#10;$ chmod +x script.sh&#10;$ ./script.sh&#10;Hello, World!"
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Related Exercises */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Related Exercises</h4>
                  <div className="space-y-3">
                    {formData.related_exercises.map((exercise, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input
                          type="text"
                          placeholder="Exercise title"
                          value={exercise.title || ''}
                          onChange={(e) => {
                            const newExercises = [...formData.related_exercises];
                            newExercises[index] = { ...exercise, title: e.target.value };
                            setFormData({ ...formData, related_exercises: newExercises });
                          }}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Slug"
                          value={exercise.slug || ''}
                          onChange={(e) => {
                            const newExercises = [...formData.related_exercises];
                            newExercises[index] = { ...exercise, slug: e.target.value };
                            setFormData({ ...formData, related_exercises: newExercises });
                          }}
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newExercises = formData.related_exercises.filter((_, i) => i !== index);
                            setFormData({ ...formData, related_exercises: newExercises });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          related_exercises: [...formData.related_exercises, { title: '', slug: '' }]
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      + Add Related Exercise
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="col-span-2">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              
              {/* Auto Generate SEO Button */}
              <div className="mb-6">
                <ScriptSEOGenerator
                  scriptData={{
                    title: formData.title,
                    description: formData.description,
                    script_content: formData.content,
                    script_type: 'lab-exercise',
                    language: 'text',
                    os_compatibility: 'any',
                    difficulty: formData.difficulty,
                    tags: [],
                    is_multi_language: false,
                    available_languages: ['text']
                  }}
                  onGenerate={handleSEOGenerate}
                  contentToAnalyze={() => {
                    return `${formData.title}\n\n${formData.description}\n\n${formData.content}`;
                  }}
                  disabled={!formData.title || !formData.content}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
              <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                Meta Title
              </label>
              <input
                type="text"
                name="meta_title"
                id="meta_title"
                    value={seoData.meta_title}
                    onChange={(e) => handleSEOChange('meta_title', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter meta title for SEO..."
              />
            </div>
            
                <div>
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                rows={3}
                    value={seoData.meta_description}
                    onChange={(e) => handleSEOChange('meta_description', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter meta description for SEO..."
              />
            </div>
            
                {/* Schema JSON */}
            <div>
              <label htmlFor="schema_json" className="block text-sm font-medium text-gray-700">
                    Schema Structure
              </label>
              <textarea
                id="schema_json"
                name="schema_json"
                    rows={8}
                    value={seoData.schema_json}
                    onChange={(e) => handleSEOChange('schema_json', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                    placeholder="Schema JSON will be generated automatically when you click 'Auto Generate SEO'..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 This field will be automatically populated when you click "Auto Generate SEO"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="relative flex items-start pt-4">
              <div className="flex items-center h-5">
                <input
                  id="published"
                  name="published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={handleCheckboxChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="published" className="font-medium text-gray-700">Publish immediately</label>
                <p className="text-gray-500">If unchecked, this lab exercise will be saved as a draft.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Lab Exercise'}
          </button>
        </div>
      </form>
    </div>
  );
} 