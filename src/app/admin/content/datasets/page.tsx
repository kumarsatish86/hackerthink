'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaEye, FaDatabase, FaCheckCircle, FaTimesCircle, FaStar, FaDownload } from 'react-icons/fa';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  description?: string;
  dataset_type?: string;
  format?: string;
  size?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  rating: number;
  rating_count: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminDatasetsPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'rating' | 'download_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchDatasets();
  }, [currentPage, statusFilter, typeFilter, sortBy, sortOrder]);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder,
        status: statusFilter,
        dataset_type: typeFilter,
        search: searchTerm
      });

      const response = await fetch(`/api/admin/datasets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch datasets');
      
      const data = await response.json();
      setDatasets(data.datasets || []);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedDatasets.length === 0) return;

    try {
      const response = await fetch('/api/admin/datasets/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: selectedDatasets })
      });

      if (!response.ok) throw new Error('Bulk action failed');
      
      setSelectedDatasets([]);
      fetchDatasets();
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Failed to perform bulk action');
    }
  };

  const deleteDataset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/datasets/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to delete dataset';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Dataset deleted:', result.message);
      fetchDatasets();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete dataset');
    }
  };

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = !searchTerm || 
      dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dataset.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dataset.status === statusFilter;
    const matchesType = typeFilter === 'all' || dataset.dataset_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Datasets</h1>
          <p className="text-gray-600 mt-1">Manage AI datasets directory</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/content/datasets/create"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add New Dataset
          </Link>
          <Link
            href="/admin/content/datasets/import"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaDownload /> Import Dataset
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Datasets</p>
              <p className="text-2xl font-bold text-gray-900">{datasets.length}</p>
            </div>
            <FaDatabase className="text-4xl text-red-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">
                {datasets.filter(d => d.status === 'published').length}
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
                {datasets.filter(d => d.status === 'draft').length}
              </p>
            </div>
            <FaTimesCircle className="text-4xl text-yellow-600 opacity-50" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-blue-600">
                {datasets.reduce((sum, d) => sum + (d.download_count || 0), 0)}
              </p>
            </div>
            <FaDownload className="text-4xl text-blue-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
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
            <option value="download_count">Sort by Downloads</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedDatasets.length > 0 && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => handleBulkAction('publish')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Publish ({selectedDatasets.length})
            </button>
            <button
              onClick={() => handleBulkAction('unpublish')}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700"
            >
              Unpublish ({selectedDatasets.length})
            </button>
            <button
              onClick={() => handleBulkAction('feature')}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700"
            >
              Feature ({selectedDatasets.length})
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Delete ({selectedDatasets.length})
            </button>
          </div>
        )}
      </div>

      {/* Datasets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedDatasets.length === filteredDatasets.length && filteredDatasets.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDatasets(filteredDatasets.map(d => d.id));
                    } else {
                      setSelectedDatasets([]);
                    }
                  }}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dataset</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Size</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Downloads</th>
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
            ) : filteredDatasets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No datasets found
                </td>
              </tr>
            ) : (
              filteredDatasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedDatasets.includes(dataset.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDatasets([...selectedDatasets, dataset.id]);
                        } else {
                          setSelectedDatasets(selectedDatasets.filter(id => id !== dataset.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaDatabase className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{dataset.name}</div>
                        {dataset.provider && (
                          <div className="text-sm text-gray-500">{dataset.provider}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dataset.dataset_type || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{dataset.size || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      dataset.status === 'published' ? 'bg-green-100 text-green-800' :
                      dataset.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dataset.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <FaDownload className="text-gray-400" />
                      <span className="text-sm text-gray-600">{dataset.download_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/content/datasets/${dataset.slug}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </Link>
                      <Link
                        href={`/datasets/${dataset.slug}`}
                        target="_blank"
                        className="text-green-600 hover:text-green-800"
                      >
                        <FaEye />
                      </Link>
                      <button
                        onClick={() => deleteDataset(dataset.id)}
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
    </div>
  );
}

