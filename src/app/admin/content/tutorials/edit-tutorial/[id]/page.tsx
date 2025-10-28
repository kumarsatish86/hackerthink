'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaPlus, FaEdit, FaTrash, FaEye, FaRedo } from 'react-icons/fa';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  category_id: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
}

interface TutorialSection {
  id: string;
  title: string;
  slug: string;
  description: string;
  tutorial_id: string;
  order_index: number;
  is_active: boolean;
  lessons_count: number;
}

interface TutorialLesson {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  section_id: string;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
  is_active: boolean;
}

const EditTutorialPage = () => {
  const router = useRouter();
  const params = useParams();
  const tutorialId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'sections' | 'lessons'>('overview');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<TutorialSection[]>([]);
  const [lessons, setLessons] = useState<TutorialLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null); // Track which item is being deleted
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'linux',
    order_index: 1,
    is_active: true,
    category_id: ''
  });

  useEffect(() => {
    if (tutorialId) {
      fetchTutorialData();
    }
  }, [tutorialId]);

  useEffect(() => {
    if ((activeTab === 'sections' || activeTab === 'lessons') && tutorial) {
      fetchSectionsAndLessons();
    }
  }, [activeTab, tutorial]);

  const fetchTutorialData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/admin/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);
      }

      // Fetch tutorial
      const tutorialResponse = await fetch(`/api/admin/tutorials/${tutorialId}`);
      if (tutorialResponse.ok) {
        const tutorialData = await tutorialResponse.json();
        setTutorial(tutorialData.tutorial);
        setFormData({
          title: tutorialData.tutorial.title,
          slug: tutorialData.tutorial.slug,
          description: tutorialData.tutorial.description,
          icon: tutorialData.tutorial.icon,
          order_index: tutorialData.tutorial.order_index,
          is_active: tutorialData.tutorial.is_active,
          category_id: tutorialData.tutorial.category_id
        });
      } else {
        throw new Error('Failed to fetch tutorial');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionsAndLessons = async () => {
    if (!tutorial) return;
    
    try {
      // Fetch sections for this tutorial
      const sectionsResponse = await fetch(`/api/tutorials/sections`);
      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        const tutorialSections = sectionsData.sections.filter((section: any) => 
          section.tutorial_id === tutorial.id
        );
        setSections(tutorialSections);
      }

      // Fetch all lessons and filter by this tutorial's sections
      const lessonsResponse = await fetch('/api/tutorials/lessons');
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        const tutorialLessons = lessonsData.lessons.filter((lesson: any) => 
          sections.some(section => section.id === lesson.section_id)
        );
        setLessons(tutorialLessons);
      }
    } catch (err) {
      console.error('Error fetching sections and lessons:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.category_id) {
      setError('Title, slug, and category are required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tutorials/${tutorialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setTutorial(result.tutorial);
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update tutorial');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tutorial? This action cannot be undone.')) {
      try {
        setDeleting('tutorial');
        const response = await fetch(`/api/admin/tutorials/${tutorialId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          router.push('/admin/content/tutorials');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete tutorial');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete tutorial');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the lesson "${lessonTitle}"? This action cannot be undone.`)) {
      try {
        setError(null);
        setDeleting(`lesson-${lessonId}`);
        
        const response = await fetch(`/api/tutorials/lessons/${lessonId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete lesson');
        }
        
        // Remove the lesson from the local state
        setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
        
        // Refresh sections and lessons to update counts
        await fetchSectionsAndLessons();
        
      } catch (err) {
        console.error('Error deleting lesson:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete lesson');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleDeleteSection = async (sectionId: string, sectionTitle: string) => {
    if (window.confirm(`Are you sure you want to delete the section "${sectionTitle}"? This action cannot be undone.`)) {
      try {
        setError(null);
        setDeleting(`section-${sectionId}`);
        
        const response = await fetch(`/api/tutorials/sections/${sectionId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete section');
        }
        
        // Remove the section from the local state
        setSections(prevSections => prevSections.filter(section => section.id !== sectionId));
        
        // Refresh sections and lessons to update counts
        await fetchSectionsAndLessons();
        
      } catch (err) {
        console.error('Error deleting section:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete section');
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800">Tutorial not found</h3>
            <div className="mt-2 text-sm text-red-700">
              The tutorial you're looking for doesn't exist or has been deleted.
            </div>
            <Link
              href="/admin/content/tutorials"
              className="mt-3 text-sm font-medium text-red-800 hover:text-red-900 underline"
            >
              Back to Tutorials
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/content/tutorials"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Tutorial</h1>
                <p className="mt-2 text-gray-600">
                  {tutorial.title} - {tutorial.category_name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDelete}
                disabled={deleting === 'tutorial'}
                className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting === 'tutorial' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash className="mr-2 h-4 w-4" />
                    Delete Tutorial
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sections', label: 'Sections' },
              { id: 'lessons', label: 'Lessons' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tutorial Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <select
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="linux">Linux</option>
                  <option value="code">Code</option>
                  <option value="server">Server</option>
                  <option value="security">Security</option>
                  <option value="devops">DevOps</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Tutorial is active
                </label>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
              <Link
                href={`/admin/content/tutorials/create-section?tutorial_id=${tutorialId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Section
              </Link>
            </div>

            {sections.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500 mb-4">No sections found for this tutorial.</p>
                <Link
                  href={`/admin/content/tutorials/create-section?tutorial_id=${tutorialId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Create First Section
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lessons
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sections.map((section) => (
                        <tr key={section.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{section.title}</div>
                              <div className="text-sm text-gray-500">{section.slug}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.lessons_count} lessons
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {section.order_index}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              section.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {section.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/admin/content/tutorials/edit-section/${section.id}`}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteSection(section.id, section.title)}
                                className={`${
                                  section.lessons_count > 0 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : deleting === `section-${section.id}`
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-900'
                                }`}
                                title={
                                  section.lessons_count > 0 
                                    ? `Cannot delete section with ${section.lessons_count} lesson(s). Delete lessons first.`
                                    : deleting === `section-${section.id}`
                                    ? 'Deleting...'
                                    : 'Delete section'
                                }
                                disabled={section.lessons_count > 0 || deleting === `section-${section.id}`}
                              >
                                {deleting === `section-${section.id}` ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                ) : (
                                  <FaTrash className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Lessons</h2>
              <Link
                href={`/admin/content/tutorials/create-lesson?tutorial_id=${tutorialId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Add Lesson
              </Link>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500 mb-4">No lessons found for this tutorial.</p>
                <Link
                  href={`/admin/content/tutorials/create-lesson?tutorial_id=${tutorialId}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <FaPlus className="mr-2 h-4 w-4" />
                  Create First Lesson
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lesson
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Section
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Difficulty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {lessons.map((lesson) => (
                        <tr key={lesson.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                              <div className="text-sm text-gray-500">{lesson.slug}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {sections.find(s => s.id === lesson.section_id)?.title || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lesson.estimated_time} min
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="capitalize">{lesson.difficulty_level}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {lesson.order_index}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              lesson.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {lesson.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/admin/content/tutorials/edit-lesson/${lesson.id}`}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                className={`${
                                  deleting === `lesson-${lesson.id}`
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600 hover:text-red-900'
                                }`}
                                title={
                                  deleting === `lesson-${lesson.id}`
                                    ? 'Deleting...'
                                    : 'Delete lesson'
                                }
                                disabled={deleting === `lesson-${lesson.id}`}
                              >
                                {deleting === `lesson-${lesson.id}` ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                ) : (
                                  <FaTrash className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Info */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Debug Information</h3>
            <button
              onClick={fetchSectionsAndLessons}
              className="text-gray-500 hover:text-gray-700"
              title="Refresh data"
            >
              <FaRedo className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Tutorial ID: {tutorialId}</div>
            <div>Sections: {sections.length}</div>
            <div>Lessons: {lessons.length}</div>
            <div>Active Tab: {activeTab}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTutorialPage;
