'use client';

import React, { useState, useEffect } from 'react';
import { FaBrain, FaChartLine, FaDownload, FaEye, FaStar, FaCalendarAlt } from 'react-icons/fa';
import Link from 'next/link';

interface ModelStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
}

export default function ModelAnalyticsPage() {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/models?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      const models = data.models || [];

      const statsData: ModelStats = {
        total: models.length,
        published: models.filter((m: any) => m.status === 'published').length,
        draft: models.filter((m: any) => m.status === 'draft').length,
        archived: models.filter((m: any) => m.status === 'archived').length,
        totalViews: models.reduce((sum: number, m: any) => sum + (m.view_count || 0), 0),
        totalDownloads: models.reduce((sum: number, m: any) => sum + (m.download_count || 0), 0),
        averageRating: models.length > 0 
          ? models.reduce((sum: number, m: any) => sum + (m.rating || 0), 0) / models.length 
          : 0
      };

      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-20">Failed to load analytics</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/models" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
          ← Back to Models
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaBrain className="text-red-600" />
          Model Analytics
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Models</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <FaBrain className="text-4xl text-red-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.published}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%
              </p>
            </div>
            <FaChartLine className="text-4xl text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalViews.toLocaleString()}</p>
            </div>
            <FaEye className="text-4xl text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <FaDownload className="text-4xl text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Status Distribution</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Published</span>
                <span className="text-sm font-medium">{stats.published}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(stats.published / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Draft</span>
                <span className="text-sm font-medium">{stats.draft}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(stats.draft / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Archived</span>
                <span className="text-sm font-medium">{stats.archived}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gray-600 h-2 rounded-full" 
                  style={{ width: `${(stats.archived / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Overall Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Rating</span>
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-400" />
                <span className="font-bold">{stats.averageRating.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Views/Model</span>
              <span className="font-bold">
                {stats.total > 0 ? Math.round(stats.totalViews / stats.total) : 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Average Downloads/Model</span>
              <span className="font-bold">
                {stats.total > 0 ? Math.round(stats.totalDownloads / stats.total) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

