'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CourseModule {
  id: string;
  title: string;
  description: string;
  position: number;
  lesson_count: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  prerequisites: string;
  learning_objectives: string[];
  level: string;
  duration: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  author_name: string;
}

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  const tabs = [
    { id: 'details', label: 'Course Details' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'assignments', label: 'Assignments' },
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchCourse();
        fetchModules();
      }
    }
  }, [status, session, router, params.courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${params.courseId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Course not found');
        }
        throw new Error('Failed to fetch course');
      }
      
      const data = await response.json();
      setCourse(data.course);
    } catch (err: any) {
      console.error('Error fetching course:', err);
      setError(err.message || 'Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.courseId}/sections`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      
      const data = await response.json();
      setModules(data.sections || []);
    } catch (err) {
      console.error('Error fetching modules:', err);
      // We don't set the main error state here to avoid blocking the UI
    }
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newModule.title) {
      return;
    }
    
    try {
      console.log("Submitting module with data:", newModule);
      console.log("Course ID:", params.courseId);
      
      const response = await fetch(`/api/admin/courses/${params.courseId}/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModule),
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || 'Failed to create module');
      }
      
      const data = await response.json();
      console.log("Success response:", data);
      
      // Check if the section object exists in the response
      if (data && data.section) {
        setModules([...modules, data.section]);
        setNewModule({ title: '', description: '' });
        setIsModuleModalOpen(false);
      } else {
        console.error("Invalid response format:", data);
        alert('Received invalid response format from server');
      }
    } catch (err) {
      console.error('Error creating module:', err);
      alert('Failed to create module. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="max-w-max mx-auto">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-indigo-600 sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  {error || 'Course not found'}
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Please check the URL or go back to courses.
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link
                  href="/admin/content/courses"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go back to courses
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center">
              <Link
                href="/admin/content/courses"
                className="mr-2 text-indigo-600 hover:text-indigo-900"
              >
                Courses
              </Link>
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">{course.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{course.title}</h1>
          </div>
          <div className="flex space-x-2">
            <button
              className={`px-4 py-2 border rounded-md ${
                course.published
                  ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100'
                  : 'border-yellow-500 text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
              }`}
            >
              {course.published ? 'Published' : 'Draft'}
            </button>
            <Link
              href={`/courses/${course.slug}`}
              target="_blank"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Preview
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'details' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Course Information</h2>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Title</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.title}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Slug</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.slug}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Level</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.level}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Author</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.author_name || 'Unknown'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.short_description || 'No description provided'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Prerequisites</dt>
                <dd className="mt-1 text-sm text-gray-900">{course.prerequisites || 'None'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Learning Objectives</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {course.learning_objectives && course.learning_objectives.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {course.learning_objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  ) : (
                    'None specified'
                  )}
                </dd>
              </div>
              
              <div className="sm:col-span-2 mt-4">
                <Link
                  href={`/admin/content/courses/${course.id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit Course Details
                </Link>
              </div>
            </dl>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Course Curriculum</h2>
              <button
                onClick={() => setIsModuleModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Module
              </button>
            </div>

            {modules.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {modules.map((module) => (
                    <li key={module.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <Link
                                href={`/admin/content/courses/${course.id}/sections/${module.id}`}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
                              >
                                {module.title}
                              </Link>
                              {module.description && (
                                <p className="text-sm text-gray-500">{module.description}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {module.lesson_count} {module.lesson_count === 1 ? 'lesson' : 'lessons'}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/admin/content/courses/${course.id}/sections/${module.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Manage
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No modules</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new module.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsModuleModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Module
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="text-center py-6">
              <h3 className="text-sm font-medium text-gray-900">Quizzes Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Quizzes are created within course modules.
              </p>
              <div className="mt-6">
                {modules.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Select a module to add or manage quizzes:</p>
                    <div className="space-y-2">
                      {modules.map((module) => (
                        <Link
                          key={module.id}
                          href={`/admin/content/courses/${course.id}/sections/${module.id}?tab=quizzes`}
                          className="block text-left px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {module.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">You need to create modules first.</p>
                    <button
                      onClick={() => {
                        setActiveTab('curriculum');
                        setIsModuleModalOpen(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Module
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="text-center py-6">
              <h3 className="text-sm font-medium text-gray-900">Assignments Management</h3>
              <p className="mt-1 text-sm text-gray-500">
                Assignments are created within course modules.
              </p>
              <div className="mt-6">
                {modules.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Select a module to add or manage assignments:</p>
                    <div className="space-y-2">
                      {modules.map((module) => (
                        <Link
                          key={module.id}
                          href={`/admin/content/courses/${course.id}/sections/${module.id}?tab=assignments`}
                          className="block text-left px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {module.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">You need to create modules first.</p>
                    <button
                      onClick={() => {
                        setActiveTab('curriculum');
                        setIsModuleModalOpen(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create Module
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Module Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Module
            </h3>
            <form onSubmit={handleModuleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    color: '#333'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    backgroundColor: '#4f46e5',
                    color: 'white'
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}