'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  level: string;
  duration: number;
  price: number;
  discount_price: number | null;
  author_name: string;
  section_count: number;
  chapter_count: number;
  lesson_count: number;
  is_featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Separate component that uses useSearchParams
function CoursesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'all';
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination and bulk actions state
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'title' | 'created_at' | 'level' | 'published'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchCourses();
      }
    }
  }, [status, session, router]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update course status');
      }
      
      // Update the local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === id 
            ? { ...course, published: !currentStatus } 
            : course
        )
      );
    } catch (err) {
      console.error('Error updating course status:', err);
      setError('Failed to update course status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeaturedToggle = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_featured: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }
      
      // Update the local state
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.id === id 
            ? { ...course, is_featured: !currentStatus } 
            : course
        )
      );
    } catch (err) {
      console.error('Error updating featured status:', err);
      setError('Failed to update featured status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete course');
      }
      
      // Remove from local state
      setCourses(prevCourses => prevCourses.filter(course => course.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError('Failed to delete course. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk action functions
  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.id));
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCourses.length === 0) return;

    try {
      setActionLoading(true);
      const response = await fetch('/api/admin/courses/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          courseIds: selectedCourses,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} courses`);
      }

      // Refresh courses list
      await fetchCourses();
      setSelectedCourses([]);
    } catch (err) {
      console.error(`Error ${action}ing courses:`, err);
      setError(`Failed to ${action} courses. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.author_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'published' && course.published) ||
                           (filterStatus === 'draft' && !course.published);
      
      return matchesSearch && matchesLevel && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'published':
          aValue = a.published ? 1 : 0;
          bValue = b.published ? 1 : 0;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLevel, filterStatus, sortBy, sortOrder]);

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

  // Get page title based on the current tab
  const getPageTitle = () => {
    switch (tab) {
      case 'lessons':
        return 'Course Lessons';
      case 'assignments':
        return 'Course Assignments';
      case 'quizzes':
        return 'Course Quizzes';
      default:
        return 'Course Management';
    }
  };

  // Get page description based on the current tab
  const getPageDescription = () => {
    switch (tab) {
      case 'lessons':
        return 'Manage all lessons across courses';
      case 'assignments':
        return 'Manage all assignments across courses';
      case 'quizzes':
        return 'Manage all quizzes across courses';
      default:
        return 'Create and manage your courses';
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // Return component UI
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600">{getPageDescription()}</p>
        </div>
        {tab === 'all' && (
          <Link
            href="/admin/content/courses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Course
          </Link>
        )}
      </div>

      {/* Tab navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <Link
            href="/admin/content/courses"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              tab === 'all' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Courses
          </Link>
          <Link
            href="/admin/content/courses?tab=lessons"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              tab === 'lessons' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lessons
          </Link>
          <Link
            href="/admin/content/courses?tab=assignments"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              tab === 'assignments' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Assignments
          </Link>
          <Link
            href="/admin/content/courses?tab=quizzes"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              tab === 'quizzes' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Quizzes
          </Link>
        </nav>
      </div>

      {/* Search and Filters */}
      {tab === 'all' && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses..."
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                id="level-filter"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <div className="flex">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 p-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="created_at">Created Date</option>
                  <option value="title">Title</option>
                  <option value="level">Level</option>
                  <option value="published">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r bg-gray-50 hover:bg-gray-100 focus:ring-2 focus:ring-red-500"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {tab === 'all' && selectedCourses.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-red-700">
                {selectedCourses.length} course{selectedCourses.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('publish')}
                disabled={actionLoading}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Publish Selected
              </button>
              <button
                onClick={() => handleBulkAction('unpublish')}
                disabled={actionLoading}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Unpublish Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={actionLoading}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedCourses([])}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Render different content based on the tab */}
      {tab === 'all' && (
        // Courses table with pagination
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {paginatedCourses.length > 0 ? (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCourses.length === paginatedCourses.length && paginatedCourses.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                </div>
              </div>
              
              {/* Courses List */}
              <ul className="divide-y divide-gray-200">
                {paginatedCourses.map((course) => (
                <li key={course.id} className={selectedCourses.includes(course.id) ? 'bg-red-50' : ''}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course.id)}
                        onChange={() => handleSelectCourse(course.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        {/* Course Status Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.published ? 'Published' : 'Draft'}
                          </span>
                          
                          {course.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            course.level === 'Beginner' ? 'bg-blue-100 text-blue-800' : 
                            course.level === 'Intermediate' ? 'bg-orange-100 text-orange-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                        
                        {/* Course Title */}
                        <Link href={`/admin/content/courses/${course.id}`}>
                          <h3 className="text-lg font-medium text-red-600 truncate hover:underline">
                            {course.title}
                          </h3>
                        </Link>
                        
                        {/* Course Description */}
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {course.short_description || 'No description provided'}
                        </p>
                        
                        {/* Course Stats */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            <span>{course.author_name || 'Unknown author'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            <span>{course.section_count} {course.section_count === 1 ? 'section' : 'sections'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                            <span>{course.chapter_count} {course.chapter_count === 1 ? 'chapter' : 'chapters'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <span>
                              {course.price > 0 ? (
                                <>
                                  {course.discount_price ? (
                                    <span>
                                      <span className="line-through">${course.price.toFixed(2)}</span>
                                      {' '}
                                      <span className="font-medium text-green-600">${course.discount_price.toFixed(2)}</span>
                                    </span>
                                  ) : (
                                    <span>${course.price.toFixed(2)}</span>
                                  )}
                                </>
                              ) : (
                                <span>Free</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handlePublishToggle(course.id, course.published)}
                          disabled={actionLoading}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                            course.published
                              ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50`}
                        >
                          {course.published ? 'Unpublish' : 'Publish'}
                        </button>
                        
                        <button
                          onClick={() => handleFeaturedToggle(course.id, course.is_featured)}
                          disabled={actionLoading}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${
                            course.is_featured
                              ? 'text-purple-700 bg-purple-100 hover:bg-purple-200'
                              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50`}
                        >
                          {course.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        
                        <Link
                          href={`/admin/content/courses/${course.id}`}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Edit
                        </Link>
                        
                        {deleteConfirm === course.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(course.id)}
                              disabled={actionLoading}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(course.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              </ul>
              
              {/* Pagination Controls */}
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} results
                    </span>
                    <div className="ml-4 flex items-center">
                      <label htmlFor="items-per-page" className="text-sm text-gray-700 mr-2">
                        Rows per page:
                      </label>
                      <select
                        id="items-per-page"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                        className="p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm border rounded ${
                              currentPage === pageNum
                                ? 'bg-red-600 text-white border-red-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
              <div className="mt-6">
                <Link
                  href="/admin/content/courses/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Course
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'lessons' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Course Lessons Overview</h3>
            <p className="mt-2 text-sm text-gray-500">
              Select a course to manage its lessons:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/admin/content/courses/${course.id}?tab=curriculum`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h4 className="font-medium text-red-600">{course.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.lesson_count || 0} {course.lesson_count === 1 ? 'lesson' : 'lessons'} · {course.section_count || 0} {course.section_count === 1 ? 'section' : 'sections'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'assignments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Course Assignments Overview</h3>
            <p className="mt-2 text-sm text-gray-500">
              Select a course to manage its assignments:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/admin/content/courses/${course.id}?tab=assignments`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h4 className="font-medium text-red-600">{course.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.section_count || 0} {course.section_count === 1 ? 'section' : 'sections'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'quizzes' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900">Course Quizzes Overview</h3>
            <p className="mt-2 text-sm text-gray-500">
              Select a course to manage its quizzes:
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map(course => (
                <Link
                  key={course.id}
                  href={`/admin/content/courses/${course.id}?tab=quizzes`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <h4 className="font-medium text-red-600">{course.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    {course.section_count || 0} {course.section_count === 1 ? 'section' : 'sections'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          {/* ... existing modal code ... */}
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function CoursesManagement() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="ml-3 text-lg text-gray-700">Loading courses...</p>
        </div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}
