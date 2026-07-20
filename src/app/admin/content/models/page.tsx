'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBrain, FaCheckCircle, FaTimesCircle, FaStar, FaDownload, FaMagic, FaFileAlt } from 'react-icons/fa';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  description?: string;
  model_type?: string;
  parameters?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  rating: number;
  rating_count: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'rating' | 'view_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [bulkRegenerating, setBulkRegenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
  });

  useEffect(() => {
    fetchModels();
  }, [currentPage, itemsPerPage, statusFilter, typeFilter, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchModels();
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        status: statusFilter,
        model_type: typeFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/models?${params}`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      setModels(data.models || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedModels.length === 0) return;

    try {
      const response = await fetch('/api/admin/models/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedModels })
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedModels([]);
      fetchModels();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to perform bulk action');
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;

    try {
      // Use bulk endpoint to ensure consistent handling
      const response = await fetch('/api/admin/models/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: [id] })
      });

      if (!response.ok) throw new Error('Failed to delete model');
      fetchModels();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete model');
    }
  };

  const filteredModels = models;

  const bulkRegenerateDocs = async () => {
    if (!confirm('Regenerate AI docs (summary, quick facts, FAQs, install guides, usage examples, security notes) for the most recently updated models? This may take a while.')) return;
    try {
      setBulkRegenerating(true);
      const res = await fetch('/api/admin/models/regenerate-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 100 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate docs');
      alert(data.message || 'Docs regenerated');
    } catch (error: any) {
      alert(error.message || 'Failed to regenerate docs');
    } finally {
      setBulkRegenerating(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Models</h1>
          <p className="text-gray-600 mt-1">Manage AI models directory</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const res = await fetch('/api/admin/models/refresh-facets', { method: 'POST' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed');
                alert(data.message || 'Facets refreshed');
              } catch (e: any) {
                alert(e.message || 'Failed to refresh filter facets');
              }
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
          >
            Refresh Filter Tags
          </button>
          <button
            onClick={bulkRegenerateDocs}
            disabled={bulkRegenerating}
            className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FaMagic /> {bulkRegenerating ? 'Regenerating...' : 'Regenerate Docs'}
          </button>
          <Link
            href="/admin/content/models/create"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add New Model
          </Link>
          <Link
            href="/admin/content/models/import"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaDownload /> Import Model
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Models</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FaBrain className="text-4xl text-red-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.published}
              </p>
            </div>
            <FaCheckCircle className="text-4xl text-green-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.drafts}
              </p>
            </div>
            <FaTimesCircle className="text-4xl text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Featured</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.featured}
              </p>
            </div>
            <FaStar className="text-4xl text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search models..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value as any);
            }}
            className="border rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="created_at">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
            <option value="view_count">Sort by Views</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedModels.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Publish ({selectedModels.length})
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
            >
              Unpublish ({selectedModels.length})
            </button>
            <button
              onClick={() => handleBulkAction('feature')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
            >
              Feature ({selectedModels.length})
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Delete ({selectedModels.length})
            </button>
          </div>
        )}
      </div>

      {/* Models Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedModels.length === filteredModels.length && filteredModels.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedModels(filteredModels.map(m => m.id));
                    } else {
                      setSelectedModels([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Model</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Rating</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Views</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredModels.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No models found
                </td>
              </tr>
            ) : (
              filteredModels.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedModels.includes(model.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModels([...selectedModels, model.id]);
                        } else {
                          setSelectedModels(selectedModels.filter(id => id !== model.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <FaBrain className="text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{model.name}</div>
                        {model.developer && (
                          <div className="text-sm text-gray-500">{model.developer}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{model.model_type || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      model.status === 'published' ? 'bg-green-100 text-green-800' :
                      model.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {typeof model.rating === 'number' && !isNaN(model.rating) ? model.rating.toFixed(1) : 'N/A'} ({model.rating_count || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{model.view_count || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/content/models/${model.slug}`}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit core fields"
                      >
                        <FaEdit />
                      </Link>
                      <Link
                        href={`/admin/content/models/${model.slug}/edit`}
                        className="text-purple-600 hover:text-purple-800"
                        title="Edit docs"
                      >
                        <FaFileAlt />
                      </Link>
                      <Link
                        href={`/models/${model.slug}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800"
                        title="View public page"
                      >
                        <FaEye />
                      </Link>
                      <button
                        onClick={() => deleteModel(model.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-lg shadow px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">
              {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
            </span>
            –
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> models
          </p>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <span>Per page</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded-lg px-2 py-1.5 text-sm bg-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev || loading}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!pagination.hasNext || loading}
            className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

