'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AnalyticsCards, { AnalyticsIcons } from '@/components/admin/AnalyticsCards';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: string;
  author_name: string;
  featured_image: string;
  meta_title: string;
  meta_description: string;
  schema_json: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  category_id?: string;
  category_name?: string;
  tags?: string[];
}

export default function ArticlesManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use useRef to prevent unnecessary re-renders and track component lifecycle
  const componentMounted = useRef(false);
  const componentUnmounted = useRef(false);
  const listenersSetup = useRef(false);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState({
    total: 0,
    published: 0,
    draft: 0,
    thisMonth: 0,
    categories: 0,
    authors: 0
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Article>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Ensure itemsPerPage is never less than 10
  useEffect(() => {
    if (itemsPerPage < 10) {
      console.log('Fixing itemsPerPage from', itemsPerPage, 'to 10');
      setItemsPerPage(10);
    }
  }, [itemsPerPage]);

  // Initialize itemsPerPage properly
  useEffect(() => {
    console.log('Initializing itemsPerPage to 10');
    setItemsPerPage(10);
  }, []);
  
  // Bulk actions state
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Prevent unnecessary reloads when switching tabs
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Only fetch articles once on initial load
  useEffect(() => {
    console.log('Auth effect triggered:', { status, isInitialized, componentMounted: componentMounted.current });
    
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (!isInitialized && !componentMounted.current) {
        console.log('Component mounting, fetching articles for the first time');
        componentMounted.current = true;
        fetchArticles();
        setIsInitialized(true);
        setLastFetchTime(Date.now());
      } else if (isInitialized && componentMounted.current) {
        console.log('Component already initialized, no need to fetch articles');
      } else if (isInitialized && !componentMounted.current) {
        console.log('Component re-rendering but already initialized, restoring mounted state');
        componentMounted.current = true;
      }
    }
  }, [status, session, router, isInitialized]);
  
  // Handle tab visibility changes without reloading
  useEffect(() => {
    // Only set up event listeners if component is initialized and not already set up
    if (!isInitialized || componentUnmounted.current) return;
    
    // Check if listeners are already set up
    if (listenersSetup.current) {
      console.log('Event listeners already set up, skipping');
      return;
    }
    
    const handleVisibilityChange = () => {
      // Prevent running if component is unmounted
      if (componentUnmounted.current) {
        console.log('Visibility change event but component unmounted, ignoring');
        return;
      }
      
      if (!document.hidden) {
        // Only refresh if it's been more than 5 minutes since last fetch
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeSinceLastFetch > fiveMinutes) {
          console.log('Tab became visible, refreshing data after 5+ minutes');
          fetchArticles();
          setLastFetchTime(Date.now());
        } else {
          console.log('Tab became visible, but no refresh needed (last fetch was', Math.round(timeSinceLastFetch / 1000), 'seconds ago)');
        }
      }
    };

    const handleFocus = () => {
      // Prevent running if component is unmounted
      if (componentUnmounted.current) {
        console.log('Focus event but component unmounted, ignoring');
        return;
      }
      
      // Only refresh if it's been more than 10 minutes since last fetch
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      const tenMinutes = 10 * 60 * 1000;
      
      if (timeSinceLastFetch > tenMinutes) {
        console.log('Window focused, refreshing data after 10+ minutes');
        fetchArticles();
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
  }, [isInitialized]); // Remove lastFetchTime from dependencies
  
  // Cleanup effect to track component unmounting
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up');
      componentUnmounted.current = true;
    };
  }, []);
  
  // Function to apply server-side filters
  const applyServerFilters = () => {
    console.log('Applying server filters:', { searchTerm, filterStatus, filterCategory, filterTag });
    
    // Always call fetchArticles with current filters, even if empty
    fetchArticles({
      search: searchTerm,
      status: filterStatus,
      category: filterCategory,
      tag: filterTag
    });
  };

  const fetchArticles = async (filters?: { 
    search?: string; 
    status?: string; 
    category?: string; 
    tag?: string 
  }) => {
    // Prevent fetching if component is unmounted
    if (componentUnmounted.current) {
      console.log('fetchArticles called but component is unmounted, skipping');
      return;
    }
    
    try {
      console.log('fetchArticles called with filters:', filters);
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.tag) params.append('tag', filters.tag);
      
      // Make request with query parameters
      const url = `/api/admin/articles${params.toString() ? `?${params.toString()}` : ''}`;
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch articles');
      }
      
      const data = await response.json();
      console.log('Articles fetched successfully, count:', data.articles?.length || 0);
      setArticles(data.articles || []);
      setFilteredArticles(data.articles || []);
      
      // Calculate analytics
      const articlesData = data.articles || [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const analytics = {
        total: articlesData.length,
        published: articlesData.filter(article => article.published).length,
        draft: articlesData.filter(article => !article.published).length,
        thisMonth: articlesData.filter(article => {
          const articleDate = new Date(article.created_at);
          return articleDate.getMonth() === currentMonth && articleDate.getFullYear() === currentYear;
        }).length,
        categories: new Set(articlesData.map(article => article.category_name).filter(Boolean)).size,
        authors: new Set(articlesData.map(article => article.author_name).filter(Boolean)).size
      };
      
      setAnalytics(analytics);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    // Prevent running if component is unmounted
    if (componentUnmounted.current) {
      console.log('Filter effect triggered but component unmounted, skipping');
      return;
    }
    
    console.log('Applying client-side filters:', { 
      articlesCount: articles.length, 
      searchTerm, 
      filterStatus, 
      filterCategory, 
      filterTag 
    });
    
    let result = [...articles];
    
    // Apply search term filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        article => 
          article.title.toLowerCase().includes(lowerSearchTerm) ||
          article.slug.toLowerCase().includes(lowerSearchTerm) ||
          article.excerpt?.toLowerCase().includes(lowerSearchTerm) ||
          article.author_name?.toLowerCase().includes(lowerSearchTerm) ||
          article.content?.toLowerCase().includes(lowerSearchTerm) ||
          article.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      );
      console.log('After search filter:', result.length, 'articles');
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(article => 
        (filterStatus === 'published' && article.published) || 
        (filterStatus === 'draft' && !article.published)
      );
      console.log('After status filter:', result.length, 'articles');
    }
    
    // Apply category filter if available
    if (filterCategory) {
      result = result.filter(article => article.category_name === filterCategory);
      console.log('After category filter:', result.length, 'articles');
    }
    
    // Apply tag filter if available
    if (filterTag) {
      result = result.filter(article => 
        article.tags && article.tags.includes(filterTag)
      );
      console.log('After tag filter:', result.length, 'articles');
    }
    
    // Apply author filter if available
    if (filterAuthor) {
      result = result.filter(article => article.author_name === filterAuthor);
      console.log('After author filter:', result.length, 'articles');
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
    
    console.log('Final filtered articles:', result.length);
    setFilteredArticles(result);
  }, [articles, searchTerm, filterStatus, filterCategory, filterTag, filterAuthor, sortField, sortDirection]);

  // Get unique categories and tags for filter dropdowns
  // Get unique categories, tags, and authors for filter dropdowns
  const uniqueCategories = Array.from(new Set(articles.map(article => article.category_name).filter(Boolean))).sort();
  const uniqueTags = Array.from(new Set(articles.flatMap(article => article.tags || []))).sort();
  const uniqueAuthors = Array.from(new Set(articles.map(article => article.author_name).filter(Boolean))).sort();

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    // Prevent running if component is unmounted
    if (componentUnmounted.current) {
      console.log('Pagination reset effect triggered but component unmounted, skipping');
      return;
    }
    
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, filterTag]);

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
      setSelectedArticles(new Set());
      setSelectAll(false);
    } else {
      setSelectedArticles(new Set(currentArticles.map(article => article.id)));
      setSelectAll(true);
    }
  };

  const handleSelectArticle = (articleId: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(articleId)) {
      newSelected.delete(articleId);
    } else {
      newSelected.add(articleId);
    }
    setSelectedArticles(newSelected);
    setSelectAll(newSelected.size === currentArticles.length);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedArticles.size === 0) return;

    try {
      setBulkActionLoading(true);
      
      switch (bulkAction) {
        case 'publish':
          await Promise.all(
            Array.from(selectedArticles).map(id => 
              fetch(`/api/admin/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'published', published: true })
              })
            )
          );
          break;
        case 'unpublish':
          await Promise.all(
            Array.from(selectedArticles).map(id => 
              fetch(`/api/admin/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'draft', published: false })
              })
            )
          );
          break;
        case 'delete':
          await Promise.all(
            Array.from(selectedArticles).map(id => 
              fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
            )
          );
          break;
      }
      
      // Refresh articles and clear selection
      await fetchArticles();
      setSelectedArticles(new Set());
      setSelectAll(false);
      setBulkAction('');
      
    } catch (error) {
      console.error('Bulk action error:', error);
      setError('Failed to perform bulk action. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleSortChange = (field: keyof Article) => {
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
      
      // Send both status and published fields to ensure proper handling
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          // The backend expects status as a string field
          status: !currentStatus ? 'published' : 'draft',
          // Also include the published boolean for direct handling
          published: !currentStatus 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update article status');
      }
      
      // Update the local state
      setArticles(prevArticles => 
        prevArticles.map(article => 
          article.id === id 
            ? { ...article, published: !currentStatus } 
            : article
        )
      );
    } catch (err) {
      console.error('Error updating article status:', err);
      setError('Failed to update article status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      
      // Remove from local state
      setArticles(prevArticles => prevArticles.filter(article => article.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article. Please try again.');
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
          <h1 className="text-2xl font-bold text-gray-900">Articles Management</h1>
          <p className="text-gray-600">Create and manage your articles</p>
        </div>
        <Link
          href="/admin/content/articles/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards
        loading={loading && status !== 'loading'}
        cards={[
          {
            title: 'Total Articles',
            value: analytics.total,
            icon: AnalyticsIcons.total,
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
            color: 'indigo'
          },
          {
            title: 'Authors',
            value: analytics.authors,
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
            {(searchTerm || filterStatus !== 'all' || filterCategory || filterTag || filterAuthor) && (
              <div className="text-xs text-blue-600 mb-2">
                Active filters: {[
                  searchTerm && `Search: "${searchTerm}"`,
                  filterStatus !== 'all' && `Status: ${filterStatus}`,
                  filterCategory && `Category: ${filterCategory}`,
                  filterTag && `Tag: ${filterTag}`,
                  filterAuthor && `Author: ${filterAuthor}`
                ].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                console.log('Manual refresh requested');
                fetchArticles();
                setLastFetchTime(Date.now());
              }}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            
            {/* Clear filters button */}
            {(searchTerm || filterStatus !== 'all' || filterCategory || filterTag || filterAuthor) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterCategory('');
                  setFilterTag('');
                  setFilterAuthor('');
                  console.log('Clearing all filters');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by title, content, author..."
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  // Don't trigger search on every keystroke
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

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status-filter"
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
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
            <select
              id="tag-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterTag}
              onChange={(e) => {
                setFilterTag(e.target.value);
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="">All Tags</option>
              {uniqueTags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <label htmlFor="author-filter" className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <select
              id="author-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filterAuthor}
              onChange={(e) => {
                setFilterAuthor(e.target.value);
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="">All Authors</option>
              {uniqueAuthors.map((author, index) => (
                <option key={index} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort-by"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={sortField}
              onChange={(e) => {
                setSortField(e.target.value as keyof Article);
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="title">Title</option>
              <option value="author_name">Author</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              id="sort-order"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={sortDirection}
              onChange={(e) => {
                setSortDirection(e.target.value as 'asc' | 'desc');
                setTimeout(() => applyServerFilters(), 100);
              }}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedArticles.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <span className="text-sm font-medium text-blue-800">
                {selectedArticles.size} article{selectedArticles.size !== 1 ? 's' : ''} selected
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
                  setSelectedArticles(new Set());
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

      {/* Articles table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredArticles.length > 0 ? (
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
                {currentArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedArticles.has(article.id)}
                        onChange={() => handleSelectArticle(article.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {article.featured_image && (
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img 
                              className="h-10 w-10 rounded-md object-cover" 
                              src={article.featured_image} 
                              alt=""
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="max-w-md">
                          <div className="text-sm font-medium text-indigo-600 hover:underline">
                            <Link href={`/admin/content/articles/${article.id}`}>
                              {article.title}
                            </Link>
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {article.slug}
                          </div>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {article.tags.map((tag, idx) => (
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
                      {article.author_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {article.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <button
                          onClick={() => handlePublishToggle(article.id, article.published)}
                          disabled={actionLoading}
                          className={`inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm ${
                            article.published
                              ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200'
                              : 'text-green-700 bg-green-100 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                          title={article.published ? 'Unpublish' : 'Publish'}
                        >
                          {article.published ? (
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
                          href={`/admin/content/articles/${article.id}`}
                          className="inline-flex items-center p-2 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        
                        {article.published && (
                          <Link
                            href={`/articles/${article.slug}`}
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
                        
                        {deleteConfirm === article.id ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDelete(article.id)}
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
                            onClick={() => setDeleteConfirm(article.id)}
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
            {filteredArticles.length === 0 ? (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No articles</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new article.</p>
                <div className="mt-6">
                  <Link
                    href="/admin/content/articles/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Article
                  </Link>
                </div>
              </>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No articles on this page</h3>
                <p className="mt-1 text-sm text-gray-500">Try changing the page or filters.</p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination and Results Summary */}
      {filteredArticles.length > 0 && (
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
              {/* Debug info */}
              <span className="text-xs text-gray-500">(State: {itemsPerPage})</span>
            </div>
            
            {/* Results summary */}
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
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