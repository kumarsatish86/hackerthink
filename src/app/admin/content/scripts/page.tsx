'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnalyticsCards, { AnalyticsIcons } from '@/components/admin/AnalyticsCards';
import BulkSEOGenerator from '@/components/SEO/BulkSEOGenerator';

interface Script {
  id: string;
  title: string;
  slug: string;
  description: string;
  script_content: string;
  program_output: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  featured_image: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export default function ScriptsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use useRef to prevent unnecessary re-renders and track component lifecycle
  const componentMounted = useRef(false);
  const componentUnmounted = useRef(false);
  const listenersSetup = useRef(false);
  
  const [scripts, setScripts] = useState<Script[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showBulkSEO, setShowBulkSEO] = useState(false);
  const [analytics, setAnalytics] = useState({
    total: 0,
    published: 0,
    draft: 0,
    thisMonth: 0,
    languages: 0,
    difficulty: { beginner: 0, intermediate: 0, advanced: 0 }
  });
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Script>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Bulk actions state
  const [selectedScripts, setSelectedScripts] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Prevent unnecessary reloads when switching tabs
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Only fetch scripts once on initial load
  useEffect(() => {
    console.log('Auth effect triggered:', { status, isInitialized, componentMounted: componentMounted.current });
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (!isInitialized && !componentMounted.current) {
        console.log('Component mounting, fetching scripts for the first time');
        componentMounted.current = true;
        fetchScripts();
        setIsInitialized(true);
        setLastFetchTime(Date.now());
      } else if (isInitialized && componentMounted.current) {
        console.log('Component already initialized, no need to fetch scripts');
      } else if (isInitialized && !componentMounted.current) {
        console.log('Component re-rendering but already initialized, restoring mounted state');
        componentMounted.current = true;
      }
    }
  }, [status, session, router, isInitialized]);

  // Handle tab visibility changes without reloading
  useEffect(() => {
    if (!isInitialized || componentUnmounted.current) return;
    
    if (listenersSetup.current) {
      console.log('Event listeners already set up, skipping');
      return;
    }
    
    const handleVisibilityChange = () => {
      if (componentUnmounted.current) {
        console.log('Visibility change event but component unmounted, ignoring');
        return;
      }
      
      if (!document.hidden) {
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceLastFetch > fiveMinutes) {
          console.log('Tab became visible, refreshing data after 5+ minutes');
          fetchScripts();
          setLastFetchTime(Date.now());
        } else {
          console.log('Tab became visible, but no refresh needed (last fetch was', Math.round(timeSinceLastFetch / 1000), 'seconds ago)');
        }
      }
    };

    const handleFocus = () => {
      if (componentUnmounted.current) {
        console.log('Focus event but component unmounted, ignoring');
        return;
      }
      
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const tenMinutes = 10 * 60 * 1000;
      
      if (timeSinceLastFetch > tenMinutes) {
        console.log('Window focused, refreshing data after 10+ minutes');
      fetchScripts();
        setLastFetchTime(Date.now());
      } else {
        console.log('Window focused, but no refresh needed (last fetch was', Math.round(timeSinceLastFetch / 1000), 'seconds ago)');
      }
    };

    console.log('Setting up tab/window event listeners');
    listenersSetup.current = true;
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      console.log('Cleaning up tab/window event listeners');
      listenersSetup.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isInitialized]);
  
  // Cleanup effect to track component unmounting
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up');
      componentUnmounted.current = true;
    };
  }, []);

  const fetchScripts = async (filters?: { 
    search?: string; 
    status?: string; 
    language?: string; 
    difficulty?: string;
    type?: string;
  }) => {
    if (componentUnmounted.current) {
      console.log('fetchScripts called but component is unmounted, skipping');
      return;
    }
    
    try {
      console.log('fetchScripts called with filters:', filters);
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.language) params.append('language', filters.language);
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);
      if (filters?.type) params.append('type', filters.type);
      
      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      params.append('t', timestamp.toString());
      
      const url = `/api/admin/scripts${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch scripts');
      }
      
      const data = await response.json();
      console.log('Scripts data:', data);
      
      // Convert id to string if it's a number (from Postgres sequence)
      const scriptsData = (data.scripts || []).map((script: any) => ({
        ...script,
        id: String(script.id) // Ensure id is a string for consistent handling
      }));
      
      console.log('Scripts fetched successfully, count:', scriptsData.length);
      setScripts(scriptsData);
      setFilteredScripts(scriptsData);
      
      // Calculate analytics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const analytics = {
        total: scriptsData.length,
        published: scriptsData.filter((script: Script) => script.published).length,
        draft: scriptsData.filter((script: Script) => !script.published).length,
        thisMonth: scriptsData.filter((script: Script) => {
          const scriptDate = new Date(script.created_at);
          return scriptDate.getMonth() === currentMonth && scriptDate.getFullYear() === currentYear;
        }).length,
        languages: new Set(scriptsData.map((script: Script) => script.language).filter(Boolean)).size,
        difficulty: {
          beginner: scriptsData.filter((script: Script) => script.difficulty === 'beginner').length,
          intermediate: scriptsData.filter((script: Script) => script.difficulty === 'intermediate').length,
          advanced: scriptsData.filter((script: Script) => script.difficulty === 'advanced').length,
        }
      };
      
      setAnalytics(analytics);
    } catch (err) {
      console.error('Error fetching scripts:', err);
      setError('Failed to load scripts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to apply server-side filters
  const applyServerFilters = () => {
    console.log('Applying server filters:', { searchTerm, filterStatus, filterLanguage, filterDifficulty, filterType });
    
    fetchScripts({
      search: searchTerm,
      status: filterStatus,
      language: filterLanguage,
      difficulty: filterDifficulty,
      type: filterType
    });
  };

  // Apply filters and sorting
  useEffect(() => {
    if (componentUnmounted.current) {
      console.log('Filter effect triggered but component unmounted, skipping');
      return;
    }
    
    console.log('Applying client-side filters:', { 
      scriptsCount: scripts.length, 
      searchTerm, 
      filterStatus, 
      filterLanguage,
      filterDifficulty,
      filterType
    });
    
    let result = [...scripts];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        script => 
          script.title.toLowerCase().includes(lowerSearchTerm) ||
          script.slug.toLowerCase().includes(lowerSearchTerm) ||
          script.description?.toLowerCase().includes(lowerSearchTerm) ||
          script.author_name?.toLowerCase().includes(lowerSearchTerm) ||
          script.script_content?.toLowerCase().includes(lowerSearchTerm) ||
          script.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
      console.log('After search filter:', result.length, 'scripts');
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(script => 
        (filterStatus === 'published' && script.published) || 
        (filterStatus === 'draft' && !script.published)
      );
      console.log('After status filter:', result.length, 'scripts');
    }
    
    // Apply language filter if available
    if (filterLanguage) {
      result = result.filter(script => script.language === filterLanguage);
      console.log('After language filter:', result.length, 'scripts');
    }
    
    // Apply difficulty filter if available
    if (filterDifficulty) {
      result = result.filter(script => script.difficulty === filterDifficulty);
      console.log('After difficulty filter:', result.length, 'scripts');
    }

    // Apply type filter if available
    if (filterType) {
      result = result.filter(script => script.script_type === filterType);
      console.log('After type filter:', result.length, 'scripts');
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      // Handle different types of fields
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
    
    console.log('Final filtered scripts:', result.length);
    setFilteredScripts(result);
  }, [scripts, searchTerm, filterStatus, filterLanguage, filterDifficulty, filterType, sortField, sortDirection]);

  // Get unique values for filter dropdowns
  const uniqueLanguages = Array.from(new Set(scripts.map(script => script.language).filter(Boolean)));
  const uniqueDifficulties = Array.from(new Set(scripts.map(script => script.difficulty).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(scripts.map(script => script.script_type).filter(Boolean)));

  // Pagination logic
  const totalPages = Math.ceil(filteredScripts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentScripts = filteredScripts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    if (componentUnmounted.current) {
      console.log('Pagination reset effect triggered but component unmounted, skipping');
      return;
    }
    
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterLanguage, filterDifficulty, filterType]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    console.log('Changing items per page from', itemsPerPage, 'to', newItemsPerPage);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedScripts(new Set());
      setSelectAll(false);
    } else {
      setSelectedScripts(new Set(currentScripts.map(script => script.id)));
      setSelectAll(true);
    }
  };

  const handleSelectScript = (scriptId: string) => {
    const newSelected = new Set(selectedScripts);
    if (newSelected.has(scriptId)) {
      newSelected.delete(scriptId);
    } else {
      newSelected.add(scriptId);
    }
    setSelectedScripts(newSelected);
    setSelectAll(newSelected.size === currentScripts.length);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedScripts.size === 0) return;

    try {
      setBulkActionLoading(true);
      
      switch (bulkAction) {
        case 'publish':
          await Promise.all(
            Array.from(selectedScripts).map(id => 
              fetch(`/api/admin/scripts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: true })
              })
            )
          );
          break;
        case 'unpublish':
          await Promise.all(
            Array.from(selectedScripts).map(id => 
              fetch(`/api/admin/scripts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ published: false })
              })
            )
          );
          break;
        case 'delete':
          await Promise.all(
            Array.from(selectedScripts).map(id => 
              fetch(`/api/admin/scripts/${id}`, { method: 'DELETE' })
            )
          );
          break;
      }
      
      // Refresh scripts and clear selection
      await fetchScripts();
      setSelectedScripts(new Set());
      setSelectAll(false);
      setBulkAction('');
      
    } catch (error) {
      console.error('Bulk action error:', error);
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSortChange = (field: keyof Script) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePublishToggle = async (id: string, currentStatus: boolean) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/scripts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update script status');
      }
      
      // Update the local state
      setScripts(prevScripts => 
        prevScripts.map(script => 
          script.id === id 
            ? { ...script, published: !currentStatus } 
            : script
        )
      );
    } catch (err) {
      console.error('Error updating script status:', err);
      setError('Failed to update script status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/scripts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete script');
      }
      
      // Remove from local state
      setScripts(prevScripts => prevScripts.filter(script => script.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting script:', err);
      setError('Failed to delete script. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkSEOUpdate = async (updates: { [key: string]: { meta_title: string; meta_description: string; tags: string[] } }) => {
    try {
      setActionLoading(true);
      
      // Update each script individually
      for (const [scriptId, seoData] of Object.entries(updates)) {
        const response = await fetch(`/api/admin/scripts/${scriptId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(seoData),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update script ${scriptId}`);
        }
      }
      
      // Refresh the scripts list
      await fetchScripts();
      setShowBulkSEO(false);
    } catch (err) {
      console.error('Error updating scripts:', err);
      setError('Failed to update scripts. Please try again.');
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scripts Management</h1>
          <p className="text-gray-600">Create and manage your scripts and code examples</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkSEO(!showBulkSEO)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {showBulkSEO ? 'Hide' : 'Bulk SEO'}
          </button>
          <Link
            href="/admin/content/scripts/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Script
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards
        loading={loading && status !== 'loading'}
        cards={[
          {
            title: 'Total Scripts',
            value: analytics.total,
            icon: AnalyticsIcons.scripts,
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
            title: 'Languages',
            value: analytics.languages,
            icon: AnalyticsIcons.tools,
            color: 'indigo'
          },
          {
            title: 'Advanced',
            value: analytics.difficulty.advanced,
            icon: AnalyticsIcons.trending,
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

      {/* Bulk SEO Generator */}
      {showBulkSEO && (
        <div className="mb-6">
          <BulkSEOGenerator
            scripts={scripts}
            onBulkUpdate={handleBulkSEOUpdate}
          />
        </div>
      )}

      {/* Search and filter section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="mb-4 md:mb-0 w-full md:w-1/3">
            {/* Last refresh indicator */}
            {lastFetchTime > 0 && (
              <div className="text-xs text-gray-500 mb-2">
                Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
              </div>
            )}
            
            {/* Active filters indicator */}
            {(searchTerm || filterStatus !== 'all' || filterLanguage || filterDifficulty || filterType) && (
              <div className="text-xs text-blue-600 mb-2">
                Active filters: {[
                  searchTerm && `Search: "${searchTerm}"`,
                  filterStatus !== 'all' && `Status: ${filterStatus}`,
                  filterLanguage && `Language: ${filterLanguage}`,
                  filterDifficulty && `Difficulty: ${filterDifficulty}`,
                  filterType && `Type: ${filterType}`
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search scripts by title, content, author..."
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
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-[120px] justify-center"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {isFilterOpen ? 'Hide Filters' : 'More Filters'}
            </button>
            
            {/* Clear filters button */}
            {(searchTerm || filterStatus !== 'all' || filterLanguage || filterDifficulty || filterType) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterLanguage('');
                  setFilterDifficulty('');
                  setFilterType('');
                  console.log('Clearing all filters');
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
            
            <button
              type="button"
              onClick={() => {
                console.log('Manual refresh requested');
                fetchScripts();
                setLastFetchTime(Date.now());
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-w-[100px] justify-center"
              disabled={loading}
              title={`Last refreshed: ${lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}`}
            >
              <svg className={`-ml-1 mr-2 h-5 w-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {isFilterOpen && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filterLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="filterLanguage"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterLanguage}
                onChange={(e) => {
                  setFilterLanguage(e.target.value);
                  setTimeout(() => applyServerFilters(), 100);
                }}
              >
                <option value="">All Languages</option>
                {uniqueLanguages.map((language, index) => (
                  <option key={index} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filterDifficulty" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                id="filterDifficulty"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterDifficulty}
                onChange={(e) => {
                  setFilterDifficulty(e.target.value);
                  setTimeout(() => applyServerFilters(), 100);
                }}
              >
                <option value="">All Difficulties</option>
                {uniqueDifficulties.map((difficulty, index) => (
                  <option key={index} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="filterType"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setTimeout(() => applyServerFilters(), 100);
                }}
              >
                <option value="">All Types</option>
                {uniqueTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedScripts.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <span className="text-sm font-medium text-blue-800">
                {selectedScripts.size} script{selectedScripts.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                  setSelectedScripts(new Set());
                  setSelectAll(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scripts table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredScripts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                      onClick={() => handleSortChange('author_name')}
                    >
                      Author
                      {sortField === 'author_name' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('language')}
                    >
                      Language
                      {sortField === 'language' && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center hover:text-gray-700"
                      onClick={() => handleSortChange('difficulty')}
                    >
                      Difficulty
                      {sortField === 'difficulty' && (
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
                {currentScripts.map((script) => (
                  <tr key={script.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedScripts.has(script.id)}
                        onChange={() => handleSelectScript(script.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="max-w-md">
                          <div className="text-sm font-medium text-indigo-600 hover:underline">
                            <Link href={`/admin/content/scripts/${script.id}`}>
                              {script.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {script.slug}
                          </div>
                          {script.tags && script.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {script.tags.slice(0, 3).map((tag, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                                >
                                  {tag}
                                </span>
                              ))}
                              {script.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{script.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {script.author_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {script.language}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        script.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        script.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {script.difficulty?.charAt(0).toUpperCase() + script.difficulty?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(script.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        script.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {script.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                    <button
                      onClick={() => handlePublishToggle(script.id, script.published)}
                      disabled={actionLoading}
                          className={`inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm ${
                        script.published
                          ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                          : 'text-green-700 bg-green-100 hover:bg-green-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                          title={script.published ? 'Unpublish' : 'Publish'}
                        >
                          {script.published ? (
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
                      href={`/admin/content/scripts/${script.id}`}
                          className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="Edit"
                    >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                    </Link>
                        
                        {script.published && (
                          <Link
                            href={`/scripts/${script.slug}`}
                            target="_blank"
                            className="inline-flex items-center p-2 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            title="View"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}
                    
                    {deleteConfirm === script.id ? (
                          <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDelete(script.id)}
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
                              className="inline-flex items-center p-2 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              title="Cancel"
                        >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(script.id)}
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
            {filteredScripts.length === 0 ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scripts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new script.</p>
            <div className="mt-6">
              <Link
                href="/admin/content/scripts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Script
              </Link>
            </div>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scripts on this page</h3>
                <p className="mt-1 text-sm text-gray-500">Try changing the page or filters.</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination and Results Summary */}
      {filteredScripts.length > 0 && (
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
                className="block w-24 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
              Showing {startIndex + 1} to {Math.min(endIndex, filteredScripts.length)} of {filteredScripts.length} scripts
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
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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