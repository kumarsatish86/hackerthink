'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import roadmapService from '@/lib/services/roadmapService';

export default function RoadmapsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  
  // Pagination and bulk actions state
  const [selectedRoadmaps, setSelectedRoadmaps] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'title' | 'updated_at' | 'level' | 'is_published'>('updated_at');
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
        fetchRoadmaps();
      }
    }
  }, [status, session, router]);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const data = await roadmapService.getAllRoadmaps();
      setRoadmaps(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      setError('Failed to load roadmaps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id) => {
    if (actionInProgress) return;
    
    try {
      setActionInProgress(true);
      await roadmapService.toggleRoadmapPublishStatus(id);
      fetchRoadmaps();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      setError('Failed to update roadmap publish status.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (id) => {
    if (actionInProgress) return;
    
    if (window.confirm('Are you sure you want to delete this roadmap? This action cannot be undone.')) {
      try {
        setActionInProgress(true);
        await roadmapService.deleteRoadmap(id);
        fetchRoadmaps();
      } catch (error) {
        console.error('Error deleting roadmap:', error);
        setError('Failed to delete roadmap.');
      } finally {
        setActionInProgress(false);
      }
    }
  };

  // Bulk action functions
  const handleSelectAll = () => {
    if (selectedRoadmaps.length === filteredRoadmaps.length) {
      setSelectedRoadmaps([]);
    } else {
      setSelectedRoadmaps(filteredRoadmaps.map(roadmap => roadmap.id));
    }
  };

  const handleSelectRoadmap = (roadmapId: string) => {
    setSelectedRoadmaps(prev => 
      prev.includes(roadmapId) 
        ? prev.filter(id => id !== roadmapId)
        : [...prev, roadmapId]
    );
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRoadmaps.length === 0) return;

    try {
      setActionInProgress(true);
      const response = await fetch('/api/admin/roadmaps/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          roadmapIds: selectedRoadmaps,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} roadmaps`);
      }

      // Refresh roadmaps list
      await fetchRoadmaps();
      setSelectedRoadmaps([]);
    } catch (err) {
      console.error(`Error ${action}ing roadmaps:`, err);
      setError(`Failed to ${action} roadmaps. Please try again.`);
    } finally {
      setActionInProgress(false);
    }
  };

  // Filter and sort roadmaps
  const filteredRoadmaps = roadmaps
    .filter(roadmap => {
      const matchesSearch = roadmap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           roadmap.slug?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = filterLevel === 'all' || roadmap.level === filterLevel;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'published' && roadmap.is_published) ||
                           (filterStatus === 'draft' && !roadmap.is_published);
      
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
          aValue = a.level || '';
          bValue = b.level || '';
          break;
        case 'is_published':
          aValue = a.is_published ? 1 : 0;
          bValue = b.is_published ? 1 : 0;
          break;
        case 'updated_at':
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredRoadmaps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRoadmaps = filteredRoadmaps.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterLevel, filterStatus, sortBy, sortOrder]);

  if (loading && status !== 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Roadmaps</h1>
          <p className="text-gray-600">Manage learning paths for your users</p>
        </div>
        <Link
          href="/admin/content/roadmaps/new"
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Create New Roadmap
        </Link>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search roadmaps..."
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
              <option value="All Levels">All Levels</option>
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
                <option value="updated_at">Updated Date</option>
                <option value="title">Title</option>
                <option value="level">Level</option>
                <option value="is_published">Status</option>
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

      {/* Bulk Actions Bar */}
      {selectedRoadmaps.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-red-700">
                {selectedRoadmaps.length} roadmap{selectedRoadmaps.length === 1 ? '' : 's'} selected
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('publish')}
                disabled={actionInProgress}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Publish Selected
              </button>
              <button
                onClick={() => handleBulkAction('unpublish')}
                disabled={actionInProgress}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Unpublish Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={actionInProgress}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedRoadmaps([])}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedRoadmaps.length === paginatedRoadmaps.length && paginatedRoadmaps.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRoadmaps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No roadmaps found. Create your first roadmap to get started.
                  </td>
                </tr>
              ) : (
                paginatedRoadmaps.map((roadmap) => (
                  <tr key={roadmap.id} className={selectedRoadmaps.includes(roadmap.id) ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRoadmaps.includes(roadmap.id)}
                        onChange={() => handleSelectRoadmap(roadmap.id)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{roadmap.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{roadmap.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{roadmap.level || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        roadmap.is_published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {roadmap.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(roadmap.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/learning-roadmap/${roadmap.slug}`}
                          target="_blank"
                          className="inline-flex items-center p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full"
                          title="View roadmap"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/content/roadmaps/${roadmap.id}`}
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full"
                          title="Edit roadmap"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleTogglePublish(roadmap.id)}
                          className={`inline-flex items-center p-2 rounded-full hover:bg-opacity-20 ${
                            roadmap.is_published
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          disabled={actionInProgress}
                          title={roadmap.is_published ? 'Unpublish roadmap' : 'Publish roadmap'}
                        >
                          {roadmap.is_published ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(roadmap.id)}
                          className="inline-flex items-center p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full"
                          disabled={actionInProgress}
                          title="Delete roadmap"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {paginatedRoadmaps.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredRoadmaps.length)} of {filteredRoadmaps.length} results
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
        )}
      </div>
    </div>
  );
} 
