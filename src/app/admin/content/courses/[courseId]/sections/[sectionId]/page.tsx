'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Tab } from '@headlessui/react';

interface Chapter {
  id: string;
  title: string;
  content_type: string;
  duration: number;
  is_free_preview: boolean;
  order_index: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  points: number;
  due_date: string | null;
  submission_type: string;
  order_index: number;
}

interface Section {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  chapters: Chapter[];
  quizzes: any[];
  assignments: Assignment[];
}

export default function SectionEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_index: 0
  });
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.has('tab')) {
      const tab = searchParams.get('tab');
      switch (tab) {
        case 'assignments':
          setSelectedTab(3);
          break;
        case 'quizzes':
          setSelectedTab(2);
          break;
        case 'chapters':
          setSelectedTab(1);
          break;
        default:
          setSelectedTab(0);
      }
    }
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchSectionDetails();
        fetchAssignments();
        fetchQuizzes();
      }
    }
  }, [status, session, router, courseId, sectionId, searchParams]);

  const fetchSectionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch section details');
      }
      
      const data = await response.json();
      setSection(data.section);
      setFormData({
        title: data.section.title,
        description: data.section.description || '',
        order_index: data.section.order_index
      });
    } catch (err) {
      console.error('Error fetching section details:', err);
      setError('Failed to load section details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/assignments`);
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments || []);
      } else {
        console.error('Failed to fetch assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/quizzes`);
      
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } else {
        console.error('Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update section');
      }
      
      const data = await response.json();
      setSection(prev => ({
        ...prev!,
        title: data.section.title,
        description: data.section.description,
        order_index: data.section.order_index
      }));
      
      // Show success notification
      alert('Section updated successfully');
    } catch (err) {
      console.error('Error updating section:', err);
      setError('Failed to update section. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chapter');
      }
      
      // Update the local state
      setSection(prev => ({
        ...prev!,
        chapters: prev!.chapters.filter(chapter => chapter.id !== chapterId)
      }));
      
      setDeleteChapterId(null);
    } catch (err) {
      console.error('Error deleting chapter:', err);
      setError('Failed to delete chapter. Please try again.');
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setAssignments(prevAssignments => prevAssignments.filter(a => a.id !== assignmentId));
        setDeleteAssignmentId(null);
      } else {
        console.error('Failed to delete assignment');
      }
    } catch (err) {
      console.error('Error deleting assignment:', err);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/sections/${sectionId}/quizzes/${quizId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setQuizzes(prevQuizzes => prevQuizzes.filter(q => q.id !== quizId));
        setDeleteQuizId(null);
      } else {
        console.error('Failed to delete quiz');
      }
    } catch (err) {
      console.error('Error deleting quiz:', err);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (!minutes) return 'Not set';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!section && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Section not found or you don't have permission to access it.</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link 
            href={`/admin/content/courses/${courseId}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Back to course
          </Link>
        </div>
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
            <span className="ml-2 text-gray-900 font-medium">Section Editor</span>
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Section</h1>
        <p className="text-gray-600">Manage section details and content</p>
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
        <Tab.Group>
          <Tab.List className="flex border-b border-gray-200">
            <Tab className={({ selected }) => 
              `py-4 px-6 text-sm font-medium outline-none ${
                selected 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Section Details
            </Tab>
            <Tab className={({ selected }) => 
              `py-4 px-6 text-sm font-medium outline-none ${
                selected 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Chapters
            </Tab>
            <Tab className={({ selected }) => 
              `py-4 px-6 text-sm font-medium outline-none ${
                selected 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Quizzes
            </Tab>
            <Tab className={({ selected }) => 
              `py-4 px-6 text-sm font-medium outline-none ${
                selected 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }>
              Assignments
            </Tab>
          </Tab.List>
          <Tab.Panels>
            {/* Section Details Panel */}
            <Tab.Panel className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Section Title <span className="text-red-500">*</span>
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
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                      className="mt-1 block w-48 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The order in which this section appears in the course
                    </p>
                  </div>
                  
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/content/courses/${courseId}`}
                      className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </form>
            </Tab.Panel>
            
            {/* Chapters Panel */}
            <Tab.Panel className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Chapters</h3>
                <Link
                  href={`/admin/content/courses/${courseId}/sections/${sectionId}/chapters/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Chapter
                </Link>
              </div>
              
              {section?.chapters && section.chapters.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {section.chapters.map((chapter, index) => (
                      <li key={chapter.id}>
                        <div className="px-4 py-4 flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <span className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md text-xs font-medium mr-2">
                                {chapter.order_index}
                              </span>
                              <h4 className="text-sm font-medium text-indigo-600 truncate">{chapter.title}</h4>
                              {chapter.is_free_preview && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                <span className="capitalize">{chapter.content_type}</span>
                                {chapter.duration > 0 && ` • ${formatDuration(chapter.duration)}`}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex shrink-0 items-center space-x-2">
                            <Link
                              href={`/admin/content/courses/${courseId}/sections/${sectionId}/chapters/${chapter.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Edit
                            </Link>
                            
                            {deleteChapterId === chapter.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteChapter(chapter.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteChapterId(null)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteChapterId(chapter.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No chapters</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new chapter.</p>
                  <div className="mt-6">
                    <Link
                      href={`/admin/content/courses/${courseId}/sections/${sectionId}/chapters/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Chapter
                    </Link>
                  </div>
                </div>
              )}
            </Tab.Panel>
            
            {/* Quizzes Panel */}
            <Tab.Panel className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Quizzes</h3>
                <Link
                  href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Quiz
                </Link>
              </div>
              
              {quizzes.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {quizzes.map((quiz) => (
                      <li key={quiz.id}>
                        <div className="px-4 py-4 flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <span className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md text-xs font-medium mr-2">
                                {quiz.order_index}
                              </span>
                              <h4 className="text-sm font-medium text-indigo-600 truncate">{quiz.title}</h4>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Pass: {quiz.passing_score}%
                              </span>
                              {quiz.time_limit > 0 && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Time: {quiz.time_limit} min
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                {quiz.description ? quiz.description.substring(0, 80) + (quiz.description.length > 80 ? '...' : '') : 'No description'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex shrink-0 items-center space-x-2">
                            <Link
                              href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quiz.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Edit
                            </Link>
                            <Link
                              href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/${quiz.id}/questions`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              Questions
                            </Link>
                            
                            {deleteQuizId === quiz.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteQuizId(null)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteQuizId(quiz.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new quiz.</p>
                  <div className="mt-6">
                    <Link
                      href={`/admin/content/courses/${courseId}/sections/${sectionId}/quizzes/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Quiz
                    </Link>
                  </div>
                </div>
              )}
            </Tab.Panel>
            
            {/* Assignments Panel */}
            <Tab.Panel className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Assignments</h3>
                <Link
                  href={`/admin/content/courses/${courseId}/sections/${sectionId}/assignments/new`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Assignment
                </Link>
              </div>
              
              {assignments.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {assignments.map((assignment) => (
                      <li key={assignment.id}>
                        <div className="px-4 py-4 flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center">
                              <span className="bg-gray-200 text-gray-700 py-1 px-2 rounded-md text-xs font-medium mr-2">
                                {assignment.order_index}
                              </span>
                              <h4 className="text-sm font-medium text-indigo-600 truncate">{assignment.title}</h4>
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {assignment.points} points
                              </span>
                              {assignment.due_date && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="truncate">
                                <span className="capitalize">{assignment.submission_type}</span> submission
                                {assignment.description && ` • ${assignment.description.substring(0, 50)}${assignment.description.length > 50 ? '...' : ''}`}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex shrink-0 items-center space-x-2">
                            <Link
                              href={`/admin/content/courses/${courseId}/sections/${sectionId}/assignments/${assignment.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Edit
                            </Link>
                            
                            {deleteAssignmentId === assignment.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteAssignment(assignment.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteAssignmentId(null)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteAssignmentId(assignment.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new assignment.</p>
                  <div className="mt-6">
                    <Link
                      href={`/admin/content/courses/${courseId}/sections/${sectionId}/assignments/new`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Assignment
                    </Link>
                  </div>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 