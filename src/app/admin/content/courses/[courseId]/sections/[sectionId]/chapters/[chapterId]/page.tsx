'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import DirectQuillEditor to prevent SSR issues
const DirectQuillEditor = dynamic(() => import('@/components/DirectQuillEditor'), { ssr: false });

interface Chapter {
  id: string;
  section_id: string;
  title: string;
  content: string;
  content_type: string;
  video_url: string;
  duration: number;
  is_free_preview: boolean;
  order_index: number;
}

export default function ChapterEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const chapterId = params.chapterId as string;
  const isNewChapter = chapterId === 'new';

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(!isNewChapter);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    content_type: 'text',
    video_url: '',
    duration: 0,
    is_free_preview: false,
    order_index: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (!isNewChapter) {
        fetchChapterDetails();
      } else {
        // For new chapter, set up default order index
        fetchNextOrderIndex();
      }
    }
  }, [status, session, router, courseId, sectionId, chapterId, isNewChapter]);

  const fetchChapterDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching chapter: courseId=${courseId}, sectionId=${sectionId}, chapterId=${chapterId}`);
      
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch chapter details. Status: ${response.status}, Response:`, errorText);
        throw new Error(`Failed to fetch chapter details. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Chapter data retrieved successfully:', data);
      setChapter(data.chapter);
      setFormData({
        title: data.chapter.title,
        content: data.chapter.content || '',
        content_type: data.chapter.content_type || 'text',
        video_url: data.chapter.video_url || '',
        duration: data.chapter.duration || 0,
        is_free_preview: data.chapter.is_free_preview || false,
        order_index: data.chapter.order_index
      });
    } catch (err) {
      console.error('Error fetching chapter details:', err);
      setError('Failed to load chapter details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextOrderIndex = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/chapters`);
      
      if (response.ok) {
        const data = await response.json();
        const nextIndex = data.chapters?.length || 0;
        setFormData(prev => ({
          ...prev,
          order_index: nextIndex
        }));
      }
    } catch (err) {
      console.error('Error fetching chapters for order index:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Function to handle quill editor content changes
  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const method = isNewChapter ? 'POST' : 'PUT';
      const url = isNewChapter 
        ? `/api/admin/courses/${courseId}/sections/${sectionId}/chapters` 
        : `/api/admin/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isNewChapter ? 'create' : 'update'} chapter`);
      }
      
      const data = await response.json();
      
      if (isNewChapter) {
        // Redirect to the edit page for the new chapter
        router.push(`/admin/content/courses/${courseId}/sections/${sectionId}/chapters/${data.chapter.id}`);
      } else {
        setChapter(data.chapter);
        // Show success notification
        alert('Chapter updated successfully');
      }
    } catch (err) {
      console.error(`Error ${isNewChapter ? 'creating' : 'updating'} chapter:`, err);
      setError(`Failed to ${isNewChapter ? 'create' : 'update'} chapter. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/admin/content/courses" className="hover:text-gray-700">
              Courses
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href={`/admin/content/courses/${courseId}`} className="ml-2 hover:text-gray-700">
              Course Details
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <Link href={`/admin/content/courses/${courseId}/sections/${sectionId}`} className="ml-2 hover:text-gray-700">
              Section Editor
            </Link>
          </li>
          <li className="flex items-center">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-gray-900 font-medium">
              {isNewChapter ? 'New Chapter' : 'Chapter Editor'}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNewChapter ? 'Create New Chapter' : 'Edit Chapter'}
        </h1>
        <p className="text-gray-600">
          {isNewChapter 
            ? 'Add a new chapter to this section' 
            : 'Update chapter content and settings'}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
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

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Chapter Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="content_type" className="block text-sm font-medium text-gray-700">
                  Content Type
                </label>
                <select
                  id="content_type"
                  name="content_type"
                  value={formData.content_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="external_resource">External Resource</option>
                </select>
              </div>
              
              {formData.content_type === 'video' && (
                <div>
                  <label htmlFor="video_url" className="block text-sm font-medium text-gray-700">
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="video_url"
                    id="video_url"
                    value={formData.video_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/video"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the URL of the video (YouTube, Vimeo, etc.)
                  </p>
                </div>
              )}
              
              {(formData.content_type === 'text' || formData.content_type === 'external_resource') && (
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <div className="mt-1">
                    <DirectQuillEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      className="min-h-[300px]"
                      advanced={true}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex space-x-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    id="duration"
                    min="0"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="order_index" className="block text-sm font-medium text-gray-700">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order_index"
                    id="order_index"
                    min="0"
                    value={formData.order_index}
                    onChange={handleInputChange}
                    className="mt-1 block w-32 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_free_preview"
                    name="is_free_preview"
                    type="checkbox"
                    checked={formData.is_free_preview}
                    onChange={handleInputChange}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="is_free_preview" className="font-medium text-gray-700">Free Preview</label>
                  <p className="text-gray-500">Make this chapter available as a free preview for non-enrolled students</p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link
                  href={`/admin/content/courses/${courseId}/sections/${sectionId}`}
                  className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (isNewChapter ? 'Create Chapter' : 'Save Changes')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 