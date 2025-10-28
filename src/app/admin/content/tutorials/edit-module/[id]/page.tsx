'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TutorialModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

interface TutorialSection {
  id: string;
  title: string;
  slug: string;
  description: string;
  module_id: string;
  order_index: number;
  is_active: boolean;
  lessons_count: number;
}

interface TutorialLesson {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
  is_active: boolean;
  section_id: string;
}

type ActiveTab = 'overview' | 'sections' | 'lessons';

export default function EditTutorialPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const moduleId = params.id as string;
  const tabFromUrl = searchParams.get('tab') as ActiveTab;
  
  const [activeTab, setActiveTab] = useState<ActiveTab>(tabFromUrl || 'overview');
  const [module, setModule] = useState<TutorialModule | null>(null);
  const [sections, setSections] = useState<TutorialSection[]>([]);
  const [lessons, setLessons] = useState<TutorialLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (moduleId) {
      fetchTutorialData();
    }
  }, [moduleId]);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl && ['overview', 'sections', 'lessons'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Remove the problematic useEffect that was causing infinite loops
  // useEffect(() => {
  //   if (activeTab === 'sections' || activeTab === 'lessons') {
  //     fetchSectionsAndLessons();
  //   }
  // }, [activeTab]);

  const fetchTutorialData = async () => {
    try {
      setLoading(true);
      
      // Fetch module data
      const moduleResponse = await fetch(`/api/admin/tutorials/${moduleId}`);
      if (moduleResponse.ok) {
        const moduleData = await moduleResponse.json();
              setModule(moduleData.tutorial);
      }

      // Fetch sections and lessons
      await fetchSectionsAndLessons();
    } catch (err) {
      setError('Error fetching tutorial data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Manual refresh triggered for tab:', activeTab);
    await fetchSectionsAndLessons();
  };

  const fetchSectionsAndLessons = async () => {
    try {
      console.log('Fetching sections and lessons for module:', moduleId);
      
      // Fetch sections for this module
      const sectionsResponse = await fetch(`/api/tutorials/sections`);
      console.log('Sections response status:', sectionsResponse.status);
      
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        console.log('Sections API response:', sectionsData);
        
        if (sectionsData.success) {
          const moduleSections = sectionsData.data.filter((s: TutorialSection) => 
            s.module_id === moduleId
          );
          console.log('Filtered sections for this module:', moduleSections);
          
          const sortedSections = moduleSections.sort((a: TutorialSection, b: TutorialSection) => a.order_index - b.order_index);
          console.log('Final sorted sections:', sortedSections);
          setSections(sortedSections);
          
          // Now fetch lessons after sections are loaded
          const lessonsResponse = await fetch(`/api/tutorials/lessons`);
          console.log('Lessons response status:', lessonsResponse.status);
          
          if (lessonsResponse.ok) {
            const lessonsData = await lessonsResponse.json();
            console.log('Lessons API response:', lessonsData);
            
            if (lessonsData.success) {
              // Get lessons that belong to sections of this module
              const moduleLessons = lessonsData.data.filter((l: TutorialLesson) => 
                sortedSections.some(s => s.id === l.section_id)
              );
              console.log('Filtered lessons for this module:', moduleLessons);
              
              const sortedLessons = moduleLessons.sort((a: TutorialLesson, b: TutorialLesson) => a.order_index - b.order_index);
              console.log('Final sorted lessons:', sortedLessons);
              setLessons(sortedLessons);
            }
          } else {
            console.error('Lessons API failed:', lessonsResponse.status, lessonsResponse.statusText);
          }
        } else {
          console.error('Sections API returned success: false:', sectionsData);
        }
      } else {
        console.error('Sections API failed:', sectionsResponse.status, sectionsResponse.statusText);
      }
    } catch (err) {
      console.error('Error fetching sections and lessons:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (module) {
      setModule({
        ...module,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      });
    }
  };

  const generateSlug = () => {
    if (module) {
      const slug = module.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setModule({ ...module, slug });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;
    
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutorials/${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(module),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh data after successful update
        fetchTutorialData();
        setError(null);
      } else {
        setError('Failed to update tutorial');
      }
    } catch (err) {
      setError('Error updating tutorial');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const getModuleIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      linux: '🐧',
      terminal: '💻',
      server: '🖥️',
      book: '📚',
      code: '💻',
      database: '🗄️',
      network: '🌐',
      security: '🔒'
    };
    return iconMap[icon] || '📚';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Tutorial Not Found</h2>
          <p className="text-gray-600 mb-4">The tutorial you're trying to edit doesn't exist.</p>
          <Link
            href="/admin/content/tutorials"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Tutorials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{getModuleIcon(module.icon)}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{module.title}</h1>
                <p className="text-gray-600 mt-1">Manage tutorial content and settings</p>
              </div>
            </div>
            <Link
              href="/admin/content/tutorials"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Tutorials
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sections'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sections ({sections.length})
            </button>
            <button
              onClick={() => setActiveTab('lessons')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lessons'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lessons ({lessons.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tutorial Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={module.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Linux Fundamentals"
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
                      value={module.slug}
                      onChange={handleInputChange}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., linux-fundamentals"
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
                    value={module.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of what this tutorial covers..."
                  />
                </div>

                {/* Icon */}
                <div>
                  <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <select
                    id="icon"
                    name="icon"
                    value={module.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="linux">🐧 Linux</option>
                    <option value="terminal">💻 Terminal</option>
                    <option value="server">🖥️ Server</option>
                    <option value="book">📚 Book</option>
                    <option value="code">💻 Code</option>
                    <option value="database">🗄️ Database</option>
                    <option value="network">🌐 Network</option>
                    <option value="security">🔒 Security</option>
                  </select>
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
                    value={module.order_index}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Lower numbers appear first in the list
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={module.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Tutorial is active
                  </label>
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
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sections Tab */}
          {activeTab === 'sections' && (
            <div className="p-6">
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Debug Info:</strong> Module ID: {moduleId} | Sections Count: {sections.length} | 
                <button onClick={handleRefresh} className="ml-2 text-blue-600 underline">Refresh Data</button>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Tutorial Sections</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRefresh}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  <Link
                    href={`/admin/content/tutorials/create-section?module_id=${moduleId}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    + Add Section
                  </Link>
                </div>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📚</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h4>
                  <p className="text-gray-600 mb-4">Create your first section to organize lessons</p>
                  <Link
                    href={`/admin/content/tutorials/create-section?module_id=${moduleId}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create First Section
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div key={section.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{section.title}</h4>
                          <p className="text-sm text-gray-500">{section.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {section.lessons_count} lessons
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              section.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {section.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/content/tutorials/edit-section/${section.id}`}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lessons Tab */}
          {activeTab === 'lessons' && (
            <div className="p-6">
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Debug Info:</strong> Module ID: {moduleId} | Lessons Count: {lessons.length} | 
                <button onClick={handleRefresh} className="ml-2 text-blue-600 underline">Refresh Data</button>
              </div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Tutorial Lessons</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleRefresh}
                    className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  <Link
                    href={`/admin/content/tutorials/create-lesson?module_id=${moduleId}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Add Lesson
                  </Link>
                </div>
              </div>

              {lessons.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📖</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h4>
                  <p className="text-gray-600 mb-4">Create your first lesson to start building content</p>
                  <Link
                    href={`/admin/content/tutorials/create-lesson?module_id=${moduleId}`}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create First Lesson
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                          <p className="text-sm text-gray-500">{lesson.excerpt}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(lesson.difficulty_level)}`}>
                              {lesson.difficulty_level.charAt(0).toUpperCase() + lesson.difficulty_level.slice(1)}
                            </span>
                            <span className="text-xs text-gray-500">{lesson.estimated_time} min</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              lesson.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {lesson.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/admin/content/tutorials/edit-lesson/${lesson.id}`}
                          className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </Link>
                        <button className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
