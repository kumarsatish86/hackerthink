'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBox, FaGlobe, FaRocket, FaBrain, FaChartLine, FaCog, FaLightbulb, FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import AnalyticsCards, { AnalyticsIcons } from '@/components/admin/AnalyticsCards';

interface Product {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  logo_alt?: string;
  short_description?: string;
  full_description?: string;
  pricing_type: 'free' | 'freemium' | 'paid' | 'enterprise';
  pricing_details?: any;
  website_url?: string;
  demo_url?: string;
  documentation_url?: string;
  github_url?: string;
  integrations: string[];
  pros: string[];
  cons: string[];
  features: string[];
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  rating: number;
  review_count: number;
  view_count: number;
  click_count: number;
  company_name?: string;
  company_size?: string;
  founded_year?: number;
  headquarters?: string;
  social_links?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: any;
  launch_date?: string;
  last_updated?: string;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  updated_by_name?: string;
}

const ProductsPage = () => {
  console.log('🚀 [PRODUCTS PAGE] Component rendering...');
  
  // Use useRef to prevent unnecessary re-renders and track component lifecycle
  const componentMounted = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pricingTypeFilter, setPricingTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'name' | 'rating' | 'view_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Product categories
  const categories = [
    { id: 'ai-models', name: 'AI Models', icon: FaBrain },
    { id: 'developer-tools', name: 'Developer Tools', icon: FaCog },
    { id: 'productivity', name: 'Productivity', icon: FaChartLine },
    { id: 'startups', name: 'Startups', icon: FaRocket },
    { id: 'research', name: 'Research', icon: FaLightbulb },
    { id: 'global', name: 'Global', icon: FaGlobe }
  ];

  // Analytics data
  const analyticsData = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: AnalyticsIcons.box,
      color: 'blue' as const
    },
    {
      title: 'Published',
      value: products.filter(p => p.status === 'published').length.toString(),
      change: '+8%',
      changeType: 'positive' as const,
      icon: AnalyticsIcons.globe,
      color: 'green' as const
    },
    {
      title: 'Drafts',
      value: products.filter(p => p.status === 'draft').length.toString(),
      change: '+3%',
      changeType: 'positive' as const,
      icon: AnalyticsIcons.edit,
      color: 'yellow' as const
    },
    {
      title: 'Featured',
      value: products.filter(p => p.featured).length.toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: AnalyticsIcons.star,
      color: 'purple' as const
    }
  ];

  // Fetch products data
  const fetchData = async () => {
    try {
      console.log('🔄 [PRODUCTS PAGE] Starting to fetch products data...');
      setLoading(true);
      const response = await fetch('/api/admin/products');
      
      console.log('📡 [PRODUCTS PAGE] API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ [PRODUCTS PAGE] Products fetched successfully, count:', data.products?.length || 0);
      
      console.log('📝 [PRODUCTS PAGE] Setting products data:', data.products?.length || 0, 'items');
      console.log('🔍 [PRODUCTS PAGE] Component mounted check:', componentMounted.current);
      
      if (componentMounted.current) {
        setProducts(data.products || []);
        setTotalItems(data.products?.length || 0);
        setError(null);
        setLastFetchTime(Date.now());
        console.log('✅ [PRODUCTS PAGE] Products state updated');
      } else {
        console.log('⚠️ [PRODUCTS PAGE] Component unmounted, skipping state update');
      }
    } catch (err) {
      console.error('❌ [PRODUCTS PAGE] Error fetching products:', err);
      if (componentMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      }
    } finally {
      console.log('🔄 [PRODUCTS PAGE] Setting loading to false, component mounted:', componentMounted.current);
      if (componentMounted.current) {
        setLoading(false);
      }
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('🚀 [PRODUCTS PAGE] Component mounted, starting data fetch...');
    componentMounted.current = true;
    fetchData();

    return () => {
      console.log('🧹 [PRODUCTS PAGE] Component unmounting, cleaning up...');
      componentMounted.current = false;
    };
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.categories.includes(categoryFilter);
      const matchesPricingType = pricingTypeFilter === 'all' || item.pricing_type === pricingTypeFilter;
      const matchesFeatured = featuredFilter === 'all' || 
        (featuredFilter === 'true' && item.featured) || 
        (featuredFilter === 'false' && !item.featured);
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPricingType && matchesFeatured;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'view_count':
          aValue = a.view_count || 0;
          bValue = b.view_count || 0;
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination logic
  const totalFilteredItems = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, pricingTypeFilter, featuredFilter, sortBy, sortOrder]);

  // Get unique categories and pricing types for filter dropdowns
  const uniqueCategories = Array.from(new Set(products.flatMap(item => item.categories))).sort();
  const pricingTypes = ['free', 'freemium', 'paid', 'enterprise'];

  // Handle delete
  const handleDelete = async (product: Product) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      // Remove from local state
      setProducts(prev => prev.filter(item => item.id !== product.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      setIsDeleting(true);
      const deletePromises = selectedItems.map(id =>
        fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
      );

      await Promise.all(deletePromises);
      
      // Remove from local state
      setProducts(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    } catch (err) {
      console.error('Error bulk deleting products:', err);
      alert('Failed to delete selected products');
    } finally {
      setIsDeleting(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get pricing type badge color
  const getPricingBadgeColor = (pricingType: string) => {
    switch (pricingType) {
      case 'free':
        return 'bg-green-100 text-green-800';
      case 'freemium':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-purple-100 text-purple-800';
      case 'enterprise':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  console.log('🔍 [PRODUCTS PAGE] Loading state check - loading:', loading, 'products.length:', products.length);
  
  if (loading && products.length === 0) {
    console.log('⏳ [PRODUCTS PAGE] Showing loading spinner...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  console.log('🎯 [PRODUCTS PAGE] Rendering main content, products count:', products.length);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Create and manage AI tools and products directory with comprehensive details</p>
        </div>
        <Link
          href="/admin/content/products/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Product
        </Link>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards cards={analyticsData} loading={loading} />

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
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
            {lastFetchTime && (
              <div className="text-xs text-gray-500 mb-2">
                Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
              </div>
            )}
            
            {/* Active filters indicator */}
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || pricingTypeFilter !== 'all' || featuredFilter !== 'all') && (
              <div className="text-xs text-blue-600 mb-2">
                Active filters: {[
                  searchTerm && `Search: "${searchTerm}"`,
                  statusFilter !== 'all' && `Status: ${statusFilter}`,
                  categoryFilter !== 'all' && `Category: ${categoryFilter}`,
                  pricingTypeFilter !== 'all' && `Pricing: ${pricingTypeFilter}`,
                  featuredFilter !== 'all' && `Featured: ${featuredFilter}`
                ].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchData();
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
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || pricingTypeFilter !== 'all' || featuredFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setPricingTypeFilter('all');
                  setFeaturedFilter('all');
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
                placeholder="Search by name, description, company..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Pricing Type Filter */}
          <div>
            <label htmlFor="pricing-filter" className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
            <select
              id="pricing-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={pricingTypeFilter}
              onChange={(e) => setPricingTypeFilter(e.target.value)}
            >
              <option value="all">All Pricing</option>
              {pricingTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label htmlFor="featured-filter" className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
            <select
              id="featured-filter"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              id="sort-by"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
              <option value="view_count">Views</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              id="sort-order"
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">
              {selectedItems.length} item(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedItems([])}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {paginatedProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(paginatedProducts.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
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
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, product.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== product.id));
                          }
                        }}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.logo_url ? (
                            <img className="h-10 w-10 rounded-lg object-cover" src={product.logo_url} alt={product.logo_alt || product.name} />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <FaBox className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                            {product.featured && (
                              <FaStar className="inline-block ml-1 h-3 w-3 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.short_description}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.categories.slice(0, 2).map((category, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {category}
                              </span>
                            ))}
                            {product.categories.length > 2 && (
                              <span className="text-xs text-gray-500">+{product.categories.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.company_name || 'Unknown'}</div>
                      {product.company_size && (
                        <div className="text-sm text-gray-500">{product.company_size}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPricingBadgeColor(product.pricing_type)}`}>
                        {product.pricing_type.charAt(0).toUpperCase() + product.pricing_type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaStar className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {typeof product.rating === 'number' && !isNaN(product.rating) ? product.rating.toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">({product.review_count || 0})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.view_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            // Handle publish/unpublish
                            console.log('Toggle publish status for:', product.id);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title={product.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {product.status === 'published' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m-9-6h14M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/content/products/${product.id}`}
                          className="text-red-600 hover:text-red-900"
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setItemToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || pricingTypeFilter !== 'all' || featuredFilter !== 'all'
                ? 'No products match your current filters.'
                : 'Get started by creating a new product.'}
            </p>
            <div className="mt-6">
              <Link
                href="/admin/content/products/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaPlus className="mr-2 h-4 w-4" />
                Create Product
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {paginatedProducts.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <label htmlFor="items-per-page" className="text-sm font-medium text-gray-700 mr-2">
                  Show:
                </label>
                <select
                  id="items-per-page"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
                <span className="text-sm text-gray-700 ml-2">per page</span>
              </div>
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, totalFilteredItems)}</span> of{' '}
                <span className="font-medium">{totalFilteredItems}</span> results
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex space-x-1">
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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Product</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleDelete(itemToDelete)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

