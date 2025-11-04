'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaMicrophone, FaCalendarAlt, FaUser, FaEye, FaFilter } from 'react-icons/fa';

interface Interview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  featured_image_alt?: string;
  interview_type: string;
  featured: boolean;
  view_count: number;
  publish_date: string;
  created_at: string;
  guest_name: string;
  guest_slug: string;
  guest_photo?: string;
  guest_title?: string;
  guest_company?: string;
  category_name?: string;
  category_slug?: string;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchInterviews();
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [pagination.page, categoryFilter, typeFilter, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/interviews/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort: sortBy,
      });
      
      if (categoryFilter) params.append('category', categoryFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/interviews?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }
      
      const data = await response.json();
      setInterviews(data.interviews || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      console.error('Error fetching interviews:', err);
      setError('Failed to load interviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      text: 'bg-purple-100 text-purple-800',
      video: 'bg-red-100 text-red-800',
      podcast: 'bg-orange-100 text-orange-800',
      mixed: 'bg-indigo-100 text-indigo-800'
    };
    return badges[type as keyof typeof badges] || badges.text;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Interviews</h1>
              <p className="text-lg text-gray-600">
                Exclusive conversations with AI experts, researchers, founders, and innovators
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaFilter /> Filters
            </button>
          </div>

          {/* Filters */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden'} md:block`}>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search interviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.slug}>
                    {category.name} ({category.interview_count || 0})
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="all">All Types</option>
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="podcast">Podcast</option>
                <option value="mixed">Mixed</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-4 py-2"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="oldest">Oldest</option>
                <option value="publish_date">Publish Date</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-12">
            <FaMicrophone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
            <p className="text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <>
            {/* Interview Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {interviews.map((interview) => (
                <Link
                  key={interview.id}
                  href={`/interviews/${interview.slug}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  {interview.featured_image && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={interview.featured_image}
                        alt={interview.featured_image_alt || interview.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {interview.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadge(interview.interview_type)}`}>
                        {interview.interview_type}
                      </span>
                      {interview.category_name && (
                        <span className="text-xs text-gray-500">
                          {interview.category_name}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {interview.title}
                    </h2>
                    
                    {interview.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {interview.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {interview.guest_photo ? (
                          <Image
                            src={interview.guest_photo}
                            alt={interview.guest_name}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <FaUser className="text-gray-400" />
                        )}
                        <span>{interview.guest_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaEye className="text-gray-400" />
                        <span>{interview.view_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>{formatDate(interview.publish_date)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

