'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaLinux, FaCode, FaServer, FaShieldAlt, FaRocket, FaBook } from 'react-icons/fa';
import AnalyticsCards from '@/components/admin/AnalyticsCards';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  category_name: string;
  category_slug: string;
  sections_count: number;
  lessons_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order_index: number;
}

const TutorialsPage = () => {
  // Use useRef to prevent unnecessary re-renders and track component lifecycle
  const componentMounted = useRef(false);
  const componentUnmounted = useRef(false);
  const listenersSetup = useRef(false);

  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [filteredTutorials, setFilteredTutorials] = useState<Tutorial[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<keyof Tutorial>('order_index');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Bulk actions state
  const [selectedTutorials, setSelectedTutorials] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Prevent unnecessary reloads when switching tabs
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Only fetch tutorials once on initial load
  useEffect(() => {
    if (!isInitialized && !componentMounted.current) {
      console.log('Component mounting, fetching tutorials for the first time');
      componentMounted.current = true;
      fetchData();
      setIsInitialized(true);
      setLastFetchTime(Date.now());
    }
  }, [isInitialized]);

  // Handle tab visibility changes without reloading
  useEffect(() => {
    if (!isInitialized || componentUnmounted.current) return;

    if (listenersSetup.current) {
      return;
    }

    const handleVisibilityChange = () => {
      if (componentUnmounted.current) return;
      if (!document.hidden) {
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        const fiveMinutes = 5 * 60 * 1000;
        if (timeSinceLastFetch > fiveMinutes) {
          fetchData();
          setLastFetchTime(Date.now());
        }
      }
    };

    const handleFocus = () => {
      if (componentUnmounted.current) return;
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const tenMinutes = 10 * 60 * 1000;
      if (timeSinceLastFetch > tenMinutes) {
    fetchData();
        setLastFetchTime(Date.now());
      }
    };

    listenersSetup.current = true;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      listenersSetup.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isInitialized]);

  // Cleanup effect to track component unmounting
  useEffect(() => {
    return () => {
      componentUnmounted.current = true;
    };
  }, []);

  const fetchData = async (filters?: {
    search?: string;
    status?: string;
    category?: string;
  }) => {
    if (componentUnmounted.current) return;

    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/admin/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

      // Fetch tutorials
      const tutorialsUrl = `/api/tutorials${params.toString() ? `?${params.toString()}` : ''}`;
      const tutorialsResponse = await fetch(tutorialsUrl);
      
      if (tutorialsResponse.ok) {
        const tutorialsData = await tutorialsResponse.json();
        const tutorialsArray = tutorialsData.tutorials || [];
        setTutorials(tutorialsArray);
        setFilteredTutorials(tutorialsArray);
      } else {
        throw new Error('Failed to fetch tutorials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Function to apply server-side filters
  const applyServerFilters = () => {
    fetchData({
      search: searchTerm,
      status: filterStatus,
      category: filterCategory
    });
  };

  // Apply filters and sorting
  useEffect(() => {
    if (componentUnmounted.current) return;

    let result = [...tutorials];

    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        tutorial =>
          tutorial.title.toLowerCase().includes(lowerSearchTerm) ||
          tutorial.description?.toLowerCase().includes(lowerSearchTerm) ||
          tutorial.category_name?.toLowerCase().includes(lowerSearchTerm) ||
          tutorial.author_name?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(tutorial =>
        (filterStatus === 'active' && tutorial.is_active) ||
        (filterStatus === 'inactive' && !tutorial.is_active)
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      result = result.filter(tutorial => tutorial.category_slug === filterCategory);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;

      let comparison;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (aValue === null || aValue === undefined) {
        comparison = -1;
      } else if (bValue === null || bValue === undefined) {
        comparison = 1;
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredTutorials(result);
  }, [tutorials, searchTerm, filterStatus, filterCategory, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTutorials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTutorials = filteredTutorials.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    if (componentUnmounted.current) return;
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTutorials(new Set());
      setSelectAll(false);
    } else {
      setSelectedTutorials(new Set(currentTutorials.map(tutorial => tutorial.id)));
      setSelectAll(true);
    }
  };

  const handleSelectTutorial = (tutorialId: string) => {
    const newSelected = new Set(selectedTutorials);
    if (newSelected.has(tutorialId)) {
      newSelected.delete(tutorialId);
    } else {
      newSelected.add(tutorialId);
    }
    setSelectedTutorials(newSelected);
    setSelectAll(newSelected.size === currentTutorials.length && currentTutorials.length > 0);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedTutorials.size === 0) return;

    try {
      setBulkActionLoading(true);

      switch (bulkAction) {
        case 'activate':
          await Promise.all(
            Array.from(selectedTutorials).map(id =>
              fetch(`/api/admin/tutorials/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: true })
              })
            )
          );
          break;
        case 'deactivate':
          await Promise.all(
            Array.from(selectedTutorials).map(id =>
              fetch(`/api/admin/tutorials/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: false })
              })
            )
          );
          break;
        case 'delete':
          await Promise.all(
            Array.from(selectedTutorials).map(id =>
              fetch(`/api/admin/tutorials/${id}`, { method: 'DELETE' })
            )
          );
          break;
      }

      await fetchData();
      setSelectedTutorials(new Set());
      setSelectAll(false);
      setBulkAction('');

    } catch (error) {
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSortChange = (field: keyof Tutorial) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/tutorials/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tutorial status');
      }

      setTutorials(prevTutorials =>
        prevTutorials.map(tutorial =>
          tutorial.id === id
            ? { ...tutorial, is_active: !currentStatus }
            : tutorial
        )
      );
    } catch (err) {
      setError('Failed to update tutorial status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/tutorials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tutorial');
      }

      setTutorials(prevTutorials => prevTutorials.filter(tutorial => tutorial.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete tutorial. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'linux': <FaLinux className="text-green-600" />,
      'code': <FaCode className="text-blue-600" />,
      'server': <FaServer className="text-red-600" />,
      'security': <FaShieldAlt className="text-red-600" />,
      'devops': <FaRocket className="text-orange-600" />,
    };
    return iconMap[iconName] || <FaBook className="text-red-600" />;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate analytics
  const totalTutorials = tutorials.length;
  const activeTutorials = tutorials.filter(t => t.is_active).length;
  const inactiveTutorials = tutorials.filter(t => !t.is_active).length;
  const tutorialsThisMonth = tutorials.filter(t => {
    const tutorialDate = new Date(t.created_at);
    const now = new Date();
    return tutorialDate.getMonth() === now.getMonth() && tutorialDate.getFullYear() === now.getFullYear();
  }).length;
  // Debug the data to see what we're working with
  console.log('Tutorial data for analytics:', tutorials.map(t => ({
    title: t.title,
    sections_count: t.sections_count,
    lessons_count: t.lessons_count,
    sections_type: typeof t.sections_count,
    lessons_type: typeof t.lessons_count
  })));

  const totalSections = tutorials.reduce((sum, t) => {
    const sectionCount = parseInt(String(t.sections_count || '0'), 10) || 0;
    console.log(`Adding sections for ${t.title}: ${sectionCount} (original: ${t.sections_count})`);
    return sum + sectionCount;
  }, 0);
  
  const totalLessons = tutorials.reduce((sum, t) => {
    const lessonCount = parseInt(String(t.lessons_count || '0'), 10) || 0;
    console.log(`Adding lessons for ${t.title}: ${lessonCount} (original: ${t.lessons_count})`);
    return sum + lessonCount;
  }, 0);

  console.log('Final totals:', { totalSections, totalLessons });

  const analyticsData = [
    { 
      title: 'Total Tutorials', 
      value: totalTutorials, 
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ), 
      color: 'red' as const
    },
    { 
      title: 'Active', 
      value: activeTutorials, 
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ), 
      color: 'green' as const
    },
    { 
      title: 'Inactive', 
      value: inactiveTutorials, 
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      ), 
      color: 'yellow' as const
    },
    { 
      title: 'This Month', 
      value: tutorialsThisMonth, 
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      color: 'red' as const
    },
    { 
      title: 'Total Sections', 
      value: totalSections, 
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H3a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" />
        </svg>
      ), 
      color: 'blue' as const
    },
    { 
      title: 'Total Lessons', 
      value: totalLessons, 
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ), 
      color: 'pink' as const
    },
  ];

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Tutorial Management</h1>
          <p className="text-gray-600">Create and manage your tutorial modules with categories, sections, and lessons</p>
            </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
              setLastFetchTime(Date.now());
            }}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            title={`Last refreshed: ${lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}`}
          >
            <svg className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
            <Link
              href="/admin/content/tutorials/create-tutorial"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Create Tutorial
            </Link>
          </div>
        </div>

      {/* Analytics Cards */}
      <AnalyticsCards cards={analyticsData} loading={loading} />

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

      {/* Search and filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="mb-4 md:mb-0 w-full md:w-1/3">
            {lastFetchTime > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
              </div>
            )}
            {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
              <div className="text-xs text-blue-600 mb-2">
                Active filters: {[
                  searchTerm && `Search: "${searchTerm}"`,
                  filterStatus !== 'all' && `Status: ${filterStatus}`,
                  filterCategory !== 'all' && `Category: ${categories.find(c => c.slug === filterCategory)?.name || filterCategory}`
                ].filter(Boolean).join(', ')}
              </div>
            )}
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Search tutorials by title, description, category..."
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (!e.target.value || e.target.value.length > 2) {
                    const delaySearch = setTimeout(() => {
                      applyServerFilters();
                    }, 500);
                    return () => clearTimeout(delaySearch);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-w-[120px] justify-center"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {isFilterOpen ? 'Hide Filters' : 'More Filters'}
            </button>

            {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('all');
                  applyServerFilters();
                }}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 min-w-[80px] justify-center"
                title="Clear all filters"
              >
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="filterCategory"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setTimeout(() => applyServerFilters(), 100);
                }}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTutorials.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <span className="text-sm font-medium text-blue-800">
                {selectedTutorials.size} tutorial{selectedTutorials.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="">Choose action...</option>
                <option value="activate">Activate</option>
                <option value="deactivate">Deactivate</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkActionLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkActionLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Apply
              </button>
              <button
                onClick={() => {
                  setSelectedTutorials(new Set());
                  setSelectAll(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorials table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredTutorials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Icon
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('title')}
                    >
                      Title
                      {sortField === 'title' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('category_name')}
                    >
                      Category
                      {sortField === 'category_name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('order_index')}
                    >
                      Order
                      {sortField === 'order_index' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('created_at')}
                    >
                      Created
                      {sortField === 'created_at' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTutorials.map((tutorial) => (
                  <tr key={tutorial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTutorials.has(tutorial.id)}
                        onChange={() => handleSelectTutorial(tutorial.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl">
                      {getIconComponent(tutorial.icon)}
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-md">
                        <div className="text-sm font-medium text-red-600 hover:underline">
                          <Link href={`/admin/content/tutorials/edit-tutorial/${tutorial.id}`}>
                            {tutorial.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {tutorial.description || 'No description provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {tutorial.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{tutorial.sections_count || 0} sections</span>
                        <span>{tutorial.lessons_count || 0} lessons</span>
                    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tutorial.order_index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(tutorial.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tutorial.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tutorial.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handleStatusToggle(tutorial.id, tutorial.is_active)}
                          disabled={actionLoading}
                          className={`inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm ${
                            tutorial.is_active
                              ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50`}
                          title={tutorial.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {tutorial.is_active ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-9-6h14M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                    <Link
                      href={`/admin/content/tutorials/edit-tutorial/${tutorial.id}`}
                          className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Edit Tutorial"
                    >
                      <FaEdit className="h-4 w-4" />
                    </Link>

                        <Link
                          href={`/tutorials/${tutorial.slug}`}
                          target="_blank"
                          className="inline-flex items-center p-2 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="View Tutorial"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>

                        {deleteConfirm === tutorial.id ? (
                          <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleDelete(tutorial.id)}
                              disabled={actionLoading}
                              className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              title="Confirm Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="inline-flex items-center p-2 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              title="Cancel"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(tutorial.id)}
                            className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Delete Tutorial"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                        )}
                  </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        ) : (
          <div className="text-center py-12">
            {filteredTutorials.length === 0 && (searchTerm || filterStatus !== 'all' || filterCategory !== 'all') ? (
              <>
                <FaLinux className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tutorials found with current filters</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              </>
            ) : (
              <>
                <FaLinux className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tutorials</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first tutorial module.</p>
                <div className="mt-6">
            <Link
              href="/admin/content/tutorials/create-tutorial"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaPlus className="mr-2 h-4 w-4" />
              Create Tutorial
            </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Pagination and Results Summary */}
      {filteredTutorials.length > 0 && (
        <div className="mt-6 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-200 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 sm:mb-0">
            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="block w-24 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>

            {/* Results summary */}
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTutorials.length)} of {filteredTutorials.length} tutorials
            </div>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center space-x-2">
              {/* Previous page button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === currentPage
                          ? 'z-10 bg-red-50 border-red-500 text-red-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next page button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default TutorialsPage;

