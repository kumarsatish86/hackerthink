'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnalyticsCards, { AnalyticsIcons } from '@/components/admin/AnalyticsCards';

interface Interview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  featured: boolean;
  interview_type: string;
  guest_name: string;
  guest_slug: string;
  interviewer_name: string;
  category_name: string;
  view_count: number;
  publish_date: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export default function InterviewsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const componentMounted = useRef(false);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [filteredInterviews, setFilteredInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    total: 0,
    published: 0,
    draft: 0,
    thisMonth: 0,
    categories: 0,
    guests: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterGuest, setFilterGuest] = useState('');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Interview>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Bulk actions state
  const [selectedInterviews, setSelectedInterviews] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (!isInitialized && !componentMounted.current) {
        componentMounted.current = true;
        fetchInterviews();
        setIsInitialized(true);
        setLastFetchTime(Date.now());
      }
    }
  }, [status, session, router, isInitialized]);
  
  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/interviews');
      
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      
      const data = await response.json();
      setInterviews(data.interviews || []);
      setFilteredInterviews(data.interviews || []);
      
      // Calculate analytics
      const interviewsData = data.interviews || [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const analyticsData = {
        total: interviewsData.length,
        published: interviewsData.filter((i: Interview) => i.status === 'published').length,
        draft: interviewsData.filter((i: Interview) => i.status === 'draft').length,
        thisMonth: interviewsData.filter((i: Interview) => {
          const interviewDate = new Date(i.created_at);
          return interviewDate.getMonth() === currentMonth && interviewDate.getFullYear() === currentYear;
        }).length,
        categories: new Set(interviewsData.map((i: Interview) => i.category_name).filter(Boolean)).size,
        guests: new Set(interviewsData.map((i: Interview) => i.guest_name).filter(Boolean)).size
      };
      
      setAnalytics(analyticsData);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let result = [...interviews];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        interview => 
          interview.title.toLowerCase().includes(lowerSearchTerm) ||
          interview.slug.toLowerCase().includes(lowerSearchTerm) ||
          interview.excerpt?.toLowerCase().includes(lowerSearchTerm) ||
          interview.guest_name?.toLowerCase().includes(lowerSearchTerm) ||
          interview.category_name?.toLowerCase().includes(lowerSearchTerm) ||
          interview.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(interview => interview.status === filterStatus);
    }
    
    // Apply category filter
    if (filterCategory) {
      result = result.filter(interview => interview.category_name === filterCategory);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(interview => interview.interview_type === filterType);
    }
    
    // Apply guest filter
    if (filterGuest) {
      result = result.filter(interview => interview.guest_name === filterGuest);
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
    
    setFilteredInterviews(result);
  }, [interviews, searchTerm, filterStatus, filterCategory, filterType, filterGuest, sortField, sortDirection]);

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(interviews.map(i => i.category_name).filter(Boolean))).sort();
  const uniqueGuests = Array.from(new Set(interviews.map(i => i.guest_name).filter(Boolean))).sort();
  const uniqueTypes = Array.from(new Set(interviews.map(i => i.interview_type).filter(Boolean))).sort();

  // Pagination logic
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInterviews = filteredInterviews.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, filterType, filterGuest]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInterviews(new Set());
      setSelectAll(false);
    } else {
      setSelectedInterviews(new Set(currentInterviews.map(i => i.id)));
      setSelectAll(true);
    }
  };

  const handleSelectInterview = (interviewId: string) => {
    const newSelected = new Set(selectedInterviews);
    if (newSelected.has(interviewId)) {
      newSelected.delete(interviewId);
    } else {
      newSelected.add(interviewId);
    }
    setSelectedInterviews(newSelected);
    setSelectAll(newSelected.size === currentInterviews.length);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedInterviews.size === 0) return;

    try {
      setBulkActionLoading(true);
      
      switch (bulkAction) {
        case 'publish':
          await Promise.all(
            Array.from(selectedInterviews).map(id => 
              fetch(`/api/admin/interviews/${id}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: true })
              })
            )
          );
          break;
        case 'unpublish':
          await Promise.all(
            Array.from(selectedInterviews).map(id => 
              fetch(`/api/admin/interviews/${id}/publish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: false })
              })
            )
          );
          break;
        case 'delete':
          await Promise.all(
            Array.from(selectedInterviews).map(id => 
              fetch(`/api/admin/interviews/${id}`, { method: 'DELETE' })
            )
          );
          break;
      }
      
      await fetchInterviews();
      setSelectedInterviews(new Set());
      setSelectAll(false);
      setBulkAction('');
      
    } catch (error) {
      console.error('Bulk action error:', error);
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSortChange = (field: keyof Interview) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: string) => {
    try {
      setActionLoading(true);
      
      const response = await fetch(`/api/admin/interviews/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: currentStatus !== 'published' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update interview status');
      }
      
      await fetchInterviews();
    } catch (error) {
      console.error('Error updating interview status:', error);
      setError('Failed to update interview status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/interviews/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }
      
      await fetchInterviews();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting interview:', error);
      setError('Failed to delete interview');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && status !== 'loading') {
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
          <h1 className="text-2xl font-bold text-gray-900">Interviews Management</h1>
          <p className="text-gray-600">Create and manage your interviews</p>
        </div>
        <Link
          href="/admin/content/interviews/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Interview
        </Link>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards
        loading={loading && status !== 'loading'}
        cards={[
          {
            title: 'Total Interviews',
            value: analytics.total,
            icon: AnalyticsIcons.microphone,
            color: 'blue'
          },
          {
            title: 'Published',
            value: analytics.published,
            icon: AnalyticsIcons.published,
            color: 'green'
          },
          {
            title: 'Draft',
            value: analytics.draft,
            icon: AnalyticsIcons.draft,
            color: 'yellow'
          },
          {
            title: 'This Month',
            value: analytics.thisMonth,
            icon: AnalyticsIcons.calendar,
            color: 'purple'
          },
          {
            title: 'Categories',
            value: analytics.categories,
            icon: AnalyticsIcons.categories,
            color: 'red'
          },
          {
            title: 'Guests',
            value: analytics.guests,
            icon: AnalyticsIcons.users,
            color: 'pink'
          }
        ]}
      />

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
      
      {/* Enhanced Search and Filter Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        {/* Header with last update and active filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            {/* Last refresh indicator */}
            {lastFetchTime > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
              </div>
            )}
            
            {/* Active filters indicator */}
            {(searchTerm || filterStatus !== 'all' || filterCategory || filterType !== 'all' || filterGuest) && (
              <div className="text-xs text-blue-600 mb-2">
                Active filters: {[
                  searchTerm && `Search: "${searchTerm}"`,
                  filterStatus !== 'all' && `Status: ${filterStatus}`,
                  filterCategory && `Category: ${filterCategory}`,
                  filterType !== 'all' && `Type: ${filterType}`,
                  filterGuest && `Guest: ${filterGuest}`
                ].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                fetchInterviews();
                setLastFetchTime(Date.now());
              }}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            {/* Clear filters button */}
            {(searchTerm || filterStatus !== 'all' || filterCategory || filterType !== 'all' || filterGuest) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('');
                  setFilterType('all');
                  setFilterGuest('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
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
                placeholder="Search by title, guest, content..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              id="type-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Guest Filter */}
          <div>
            <label htmlFor="guest-filter" className="block text-sm font-medium text-gray-700 mb-1">Guest</label>
            <select
              id="guest-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={filterGuest}
              onChange={(e) => setFilterGuest(e.target.value)}
            >
              <option value="">All Guests</option>
              {uniqueGuests.map((guest, index) => (
                <option key={index} value={guest}>
                  {guest}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort-by"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as keyof Interview)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="title">Title</option>
              <option value="guest_name">Guest</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              id="sort-order"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedInterviews.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <span className="text-sm font-medium text-blue-800">
                {selectedInterviews.size} interview{selectedInterviews.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="">Choose action...</option>
                <option value="publish">Publish</option>
                <option value="unpublish">Unpublish</option>
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
                  setSelectedInterviews(new Set());
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

      {/* Interviews table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredInterviews.length > 0 ? (
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
                      onClick={() => handleSortChange('guest_name')}
                    >
                      Guest
                      {sortField === 'guest_name' && (
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
                    <button 
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('updated_at')}
                    >
                      Updated
                      {sortField === 'updated_at' && (
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
                {currentInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedInterviews.has(interview.id)}
                        onChange={() => handleSelectInterview(interview.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="max-w-md">
                          <div className="text-sm font-medium text-red-600 hover:underline">
                            <Link href={`/admin/content/interviews/${interview.id}`}>
                              {interview.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {interview.slug}
                          </div>
                          {interview.tags && interview.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {interview.tags.map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interview.guest_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {interview.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(interview.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(interview.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        interview.status === 'published' ? 'bg-green-100 text-green-800' : 
                        interview.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interview.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handlePublishToggle(interview.id, interview.status)}
                          disabled={actionLoading}
                          className={`inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm ${
                            interview.status === 'published'
                              ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50`}
                          title={interview.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {interview.status === 'published' ? (
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
                          href={`/admin/content/interviews/${interview.id}`}
                          className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        
                        {interview.status === 'published' && (
                          <Link
                            href={`/interviews/${interview.slug}`}
                            target="_blank"
                            className="inline-flex items-center p-2 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="View"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}
                        
                        {deleteConfirm === interview.id ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDelete(interview.id)}
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
                            onClick={() => setDeleteConfirm(interview.id)}
                            className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
            {filteredInterviews.length === 0 ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new interview.</p>
                <div className="mt-6">
                  <Link
                    href="/admin/content/interviews/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Interview
                  </Link>
                </div>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No interviews on this page</h3>
                <p className="mt-1 text-sm text-gray-500">Try changing the page or filters.</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination and Results Summary */}
      {filteredInterviews.length > 0 && (
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
                <option value={500}>500</option>
              </select>
              <span className="text-sm text-gray-700">per page</span>
            </div>
            
            {/* Results summary */}
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredInterviews.length)} of {filteredInterviews.length} interviews
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
}
