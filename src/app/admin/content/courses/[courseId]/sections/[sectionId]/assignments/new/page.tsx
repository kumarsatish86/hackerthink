'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import DirectQuillEditor to prevent SSR issues
const DirectQuillEditor = dynamic(() => import('@/components/DirectQuillEditor'), { ssr: false });

interface Assignment {
  id: string;
  section_id: string;
  title: string;
  description: string;
  instructions: string;
  points: number;
  due_date: string;
  submission_type: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export default function NewAssignment() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    points: 10,
    due_date: '',
    submission_type: 'text',
    order_index: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        // For new assignment, set up default order index
        fetchNextOrderIndex();
      }
    }
  }, [status, session, router, courseId, sectionId]);

  const fetchNextOrderIndex = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/assignments`);
      
      if (response.ok) {
        const data = await response.json();
        const nextIndex = data.assignments?.length || 0;
        setFormData(prev => ({
          ...prev,
          order_index: nextIndex
        }));
      }
    } catch (err) {
      console.error('Error fetching assignments for order index:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Function to handle rich text editor content changes
  const handleInstructionsChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }
      
      const data = await response.json();
      
      // Redirect to the section page after creating the assignment
      router.push(`/admin/content/courses/${courseId}/sections/${sectionId}?tab=assignments`);
    } catch (err) {
      console.error('Error creating assignment:', err);
      setError('Failed to create assignment. Please try again.');
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
            <span className="ml-2 text-gray-900 font-medium">New Assignment</span>
          </li>
        </ol>
      </nav>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-900">Create New Assignment</h1>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Brief Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Brief description of the assignment.</p>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
                Instructions *
              </label>
              <div className="mt-1">
                <DirectQuillEditor
                  id="instructions"
                  value={formData.instructions}
                  onChange={handleInstructionsChange}
                  className="min-h-[250px]"
                  placeholder="Enter detailed instructions for students..."
                  advanced={true}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Detailed instructions for students on how to complete the assignment.</p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="points" className="block text-sm font-medium text-gray-700">
                Points *
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="points"
                  id="points"
                  min="0"
                  max="100"
                  value={formData.points}
                  onChange={handleInputChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="mt-1">
                <input
                  type="datetime-local"
                  name="due_date"
                  id="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="submission_type" className="block text-sm font-medium text-gray-700">
                Submission Type *
              </label>
              <div className="mt-1">
                <select
                  id="submission_type"
                  name="submission_type"
                  value={formData.submission_type}
                  onChange={handleInputChange}
                  required
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="text">Text Entry</option>
                  <option value="file">File Upload</option>
                  <option value="url">URL/Website Link</option>
                  <option value="code">Code Snippet</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="order_index" className="block text-sm font-medium text-gray-700">
                Display Order
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="order_index"
                  id="order_index"
                  min="0"
                  value={formData.order_index}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">Order in which this assignment appears in the section.</p>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <Link
                href={`/admin/content/courses/${courseId}/sections/${sectionId}?tab=assignments`}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 