'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEdit, FaEye, FaEyeSlash, FaTrash, FaCheck } from 'react-icons/fa';
import ToolActionButtons from './components/ToolActionButtons';
import AnalyticsCards, { AnalyticsIcons } from '@/components/admin/AnalyticsCards';

// Define tool type
interface Tool {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTools, setSelectedTools] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [analytics, setAnalytics] = useState({
    total: 0,
    published: 0,
    draft: 0,
    thisMonth: 0,
    interactive: 0,
    categories: 0
  });

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      setLoading(true);
      // Use relative URL to avoid CORS issues - API calls should be to the same domain
      const res = await fetch('/api/admin/tools', { 
        cache: 'no-store'
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch tools');
      }
      
      const data = await res.json();
      const toolsData = data.tools || [];
      setTools(toolsData);
      
      // Calculate analytics
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const analytics = {
        total: toolsData.length,
        published: toolsData.filter((tool: Tool) => tool.published).length,
        draft: toolsData.filter((tool: Tool) => !tool.published).length,
        thisMonth: toolsData.filter((tool: Tool) => {
          const toolDate = new Date(tool.created_at);
          return toolDate.getMonth() === currentMonth && toolDate.getFullYear() === currentYear;
        }).length,
        interactive: toolsData.filter((tool: Tool) => tool.title.toLowerCase().includes('calculator') || tool.title.toLowerCase().includes('generator')).length,
        categories: new Set(toolsData.map((tool: Tool) => tool.title.split(' ')[0]).filter(Boolean)).size
      };
      
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching tools for admin:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter tools based on search term
  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredTools.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTools = filteredTools.slice(startIndex, endIndex);

  // Handle row selection
  const handleSelectTool = (toolId: number) => {
    const newSelected = new Set(selectedTools);
    if (newSelected.has(toolId)) {
      newSelected.delete(toolId);
    } else {
      newSelected.add(toolId);
    }
    setSelectedTools(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedTools.size === currentTools.length) {
      setSelectedTools(new Set());
    } else {
      setSelectedTools(new Set(currentTools.map(tool => tool.id)));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedTools.size === 0) return;

    try {
      // Use relative URL to avoid CORS issues
      const response = await fetch('/api/admin/tools/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          toolIds: Array.from(selectedTools)
        })
      });

      if (response.ok) {
        // Refresh tools and clear selection
        await fetchTools();
        setSelectedTools(new Set());
        setBulkAction('');
        alert(`Bulk action "${bulkAction}" completed successfully!`);
      } else {
        alert('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Error performing bulk action');
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedTools(new Set()); // Clear selection when changing pages
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
    setSelectedTools(new Set()); // Clear selection
  };

  // Handle toggle publish
  const handleTogglePublish = async (toolId: number, currentPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/tools/${toolId}/toggle-publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !currentPublished })
      });

      if (response.ok) {
        await fetchTools();
        alert(`Tool "${currentPublished ? 'Unpublished' : 'Published'}" successfully!`);
      } else {
        alert('Failed to toggle publish status');
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      alert('Error toggling publish status');
    }
  };

  // Handle delete tool
  const handleDeleteTool = async (toolId: number, toolTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${toolTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tools/${toolId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchTools();
        setSelectedTools(new Set()); // Clear selection if the deleted tool was selected
        alert(`Tool "${toolTitle}" deleted successfully!`);
      } else {
        alert('Failed to delete tool');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      alert('Error deleting tool');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tools Management</h1>
          <p className="text-gray-600">Manage your Linux tools and utilities</p>
        </div>
        
        <Link 
          href="/admin/content/tools/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Tool
        </Link>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCards
        loading={loading}
        cards={[
          {
            title: 'Total Tools',
            value: analytics.total,
            icon: AnalyticsIcons.tools,
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
            title: 'Interactive',
            value: analytics.interactive,
            icon: AnalyticsIcons.trending,
            color: 'indigo'
          },
          {
            title: 'Categories',
            value: analytics.categories,
            icon: AnalyticsIcons.categories,
            color: 'pink'
          }
        ]}
      />

      {/* Search and Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Tools</label>
            <input
              type="text"
              placeholder="Search by title, slug, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Bulk Actions */}
          {selectedTools.size > 0 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Actions</label>
              <div className="flex gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  <option value="publish">Publish Selected</option>
                  <option value="unpublish">Unpublish Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {tools.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No tools found. Create your first tool!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-12 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedTools.size === currentTools.length && currentTools.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Path
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTools.map((tool: Tool) => {
                    const updatedAt = new Date(tool.updated_at).toLocaleDateString();
                    
                    return (
                      <tr key={tool.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedTools.has(tool.id)}
                            onChange={() => handleSelectTool(tool.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {tool.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tool.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tool.file_path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            tool.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {tool.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {updatedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 flex flex-wrap">
                          {/* Edit Button */}
                          <Link
                            href={`/admin/content/tools/${tool.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                            title="Edit Tool"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          
                          {/* Preview Button */}
                          <Link
                            href={`/tools/${tool.slug}`}
                            target="_blank"
                            className="inline-flex items-center justify-center w-8 h-8 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
                            title="Preview Tool"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          
                          {/* Publish/Unpublish Button */}
                          <button
                            onClick={() => handleTogglePublish(tool.id, tool.published)}
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 ${
                              tool.published 
                                ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                            }`}
                            title={tool.published ? 'Unpublish Tool' : 'Publish Tool'}
                          >
                            {tool.published ? (
                              <FaEyeSlash className="w-4 h-4" />
                            ) : (
                              <FaCheck className="w-4 h-4" />
                            )}
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteTool(tool.id, tool.title)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
                            title="Delete Tool"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex items-center space-x-4">
                {/* Rows per page selector */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>500</option>
                  </select>
                  <span className="text-sm text-gray-700">rows</span>
                </div>

                {/* Results info */}
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTools.length)} of {filteredTools.length} results
                </div>
              </div>

              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
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
                        className={`px-3 py-1 border rounded-md text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 