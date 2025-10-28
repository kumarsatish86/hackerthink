'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LessonSEOForm from '../../../../../components/tutorials/LessonSEOForm';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  category_name: string;
}

interface TutorialSection {
  id: string;
  title: string;
  slug: string;
  tutorial_id: string;
}

export default function CreateLessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorialIdFromUrl = searchParams.get('tutorial_id');
  
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [sections, setSections] = useState<TutorialSection[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tutorial_id: tutorialIdFromUrl || '',
    section_id: '',
    estimated_time: 15,
    difficulty_level: 'beginner',
    order_index: 1,
    is_active: true
  });
  
  const [seoData, setSeoData] = useState({
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    reading_time: 15
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTutorials();
  }, []);

  useEffect(() => {
    if (tutorialIdFromUrl && tutorials.length > 0) {
      setFormData(prev => ({ ...prev, tutorial_id: tutorialIdFromUrl }));
    }
  }, [tutorialIdFromUrl, tutorials]);

  useEffect(() => {
    if (formData.tutorial_id) {
      fetchSections();
    }
  }, [formData.tutorial_id]);

  const fetchTutorials = async () => {
    try {
      const response = await fetch('/api/tutorials');
      if (response.ok) {
        const data = await response.json();
        setTutorials(data.tutorials);
        // If no tutorial_id from URL, select first tutorial by default
        if (!tutorialIdFromUrl && data.tutorials.length > 0) {
          setFormData(prev => ({ ...prev, tutorial_id: data.tutorials[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching tutorials:', err);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/tutorials/sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data.sections);
      }
    } catch (err) {
      console.error('Error fetching sections:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSEOChange = (newSeoData: any) => {
    setSeoData(newSeoData);
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
      // Generate structured data
      const baseUrl = "https://ainews.com";
      const metaTitle = seoData.meta_title || formData.title;
      const metaDescription = seoData.meta_description || formData.excerpt || formData.content.substring(0, 160).replace(/<[^>]*>/g, '');
      const metaKeywords = seoData.meta_keywords || `${formData.difficulty_level}, linux tutorial, ${formData.title.toLowerCase()}`;
      const canonicalUrl = seoData.canonical_url || "";
      const ogImage = seoData.og_image || `${baseUrl}/images/tutorial-default.jpg`;
      const readingTime = seoData.reading_time || formData.estimated_time;
      const wordCount = formData.content.replace(/<[^>]*>/g, '').split(' ').length;

      const structuredData = [
        // Article Schema
        {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": metaTitle,
          "description": metaDescription,
          "image": ogImage,
          "author": {
            "@type": "Organization",
            "name": "LinuxConcept",
            "url": baseUrl
          },
          "publisher": {
            "@type": "Organization",
            "name": "LinuxConcept",
            "url": baseUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`,
              "width": 200,
              "height": 200
            }
          },
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          },
          "articleSection": "Tutorial",
          "keywords": metaKeywords,
          "wordCount": wordCount,
          "timeRequired": `PT${readingTime}M`,
          "inLanguage": "en-US",
          "isAccessibleForFree": true,
          "about": [
            {
              "@type": "Thing",
              "name": "Linux"
            },
            {
              "@type": "Thing",
              "name": "System Administration"
            }
          ],
          "audience": {
            "@type": "Audience",
            "audienceType": "Students and Professionals"
          }
        },
        // Course Schema
        {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": `Tutorial - ${formData.title}`,
          "description": metaDescription,
          "provider": {
            "@type": "Organization",
            "name": "LinuxConcept",
            "url": baseUrl
          },
          "courseCode": formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          "educationalLevel": formData.difficulty_level,
          "timeRequired": `PT${readingTime}M`,
          "inLanguage": "en-US",
          "isAccessibleForFree": true,
          "teaches": [
            {
              "@type": "DefinedTerm",
              "name": "Linux System Administration"
            }
          ],
          "about": [
            {
              "@type": "Thing",
              "name": "Linux"
            }
          ]
        },
        // BreadcrumbList Schema
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Tutorials",
              "item": `${baseUrl}/tutorials`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Tutorial Module",
              "item": `${baseUrl}/tutorials/module`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Tutorial Section",
              "item": `${baseUrl}/tutorials/module/section`
            },
            {
              "@type": "ListItem",
              "position": 4,
              "name": formData.title,
              "item": canonicalUrl
            }
          ]
        },
        // HowTo Schema
        {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": formData.title,
          "description": metaDescription,
          "image": ogImage,
          "totalTime": `PT${readingTime}M`,
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": "0"
          },
          "supply": [],
          "tool": [],
          "step": [
            {
              "@type": "HowToStep",
              "name": "Read the tutorial",
              "text": "Follow along with this comprehensive tutorial to learn about Linux concepts and best practices.",
              "url": canonicalUrl
            }
          ]
        }
      ];

      // Combine form data with SEO data and structured data
      const lessonData = {
        ...formData,
        ...seoData,
        structured_data: JSON.stringify(structuredData)
      };
      
      const response = await fetch('/api/tutorials/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonData),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect back to the edit tutorial page if we came from there
        if (tutorialIdFromUrl) {
          router.push(`/admin/content/tutorials/edit-tutorial/${tutorialIdFromUrl}?tab=lessons`);
        } else {
          router.push('/admin/content/tutorials');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create lesson');
      }
    } catch (err) {
      setError('Error creating lesson');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBackUrl = () => {
    if (tutorialIdFromUrl) {
      return `/admin/content/tutorials/edit-tutorial/${tutorialIdFromUrl}?tab=lessons`;
    }
    return '/admin/content/tutorials';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Tutorial Lesson</h1>
              <p className="text-gray-600 mt-2">Add a new lesson with content and metadata</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Active Status */}
            <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-blue-900">
                Lesson is active (published and visible to users)
              </label>
            </div>

            {/* Tutorial and Section Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="tutorial_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Tutorial *
                </label>
                <select
                  id="tutorial_id"
                  name="tutorial_id"
                  value={formData.tutorial_id}
                  onChange={(e) => {
                    const tutorialId = e.target.value;
                    setFormData(prev => ({ 
                      ...prev, 
                      tutorial_id: tutorialId,
                      section_id: '' // Reset section when tutorial changes
                    }));
                  }}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a tutorial</option>
                  {tutorials.map((tutorial) => (
                    <option key={tutorial.id} value={tutorial.id}>
                      {tutorial.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="section_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  id="section_id"
                  name="section_id"
                  value={formData.section_id}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.tutorial_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a section</option>
                  {sections
                    .filter(section => section.tutorial_id === formData.tutorial_id)
                    .map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                </select>
                {!formData.tutorial_id && (
                  <p className="text-sm text-gray-500 mt-1">Please select a tutorial first</p>
                )}
              </div>
            </div>

            {/* Title and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., What is Linux?"
                />
              </div>

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
                    placeholder="e.g., what-is-linux"
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
            </div>

            {/* Difficulty Level, Estimated Time, and Display Order */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty_level"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="estimated_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Time (minutes)
                </label>
                <input
                  type="number"
                  id="estimated_time"
                  name="estimated_time"
                  value={formData.estimated_time}
                  onChange={handleInputChange}
                  min="1"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
                  Lower numbers appear first in the lesson list
                </p>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Short description for navigation..."
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Content *
              </label>
              <SimpleQuillEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                height="600px"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use the rich text editor above to format your content. The editor supports headings, lists, links, images, and more.
              </p>
            </div>

            {/* SEO Form */}
            <LessonSEOForm
              lessonData={formData}
              seoData={seoData}
              onSEOChange={handleSEOChange}
            />

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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Lesson'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
