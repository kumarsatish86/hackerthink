'use client';

import React, { useState, useEffect } from 'react';
import { FaDatabase, FaChartLine, FaDownload, FaEye, FaStar } from 'react-icons/fa';
import Link from 'next/link';

interface DatasetStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
  averageQuality?: number;
  averageFreshness?: number;
  averagePopularity?: number;
}

export default function DatasetAnalyticsPage() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [topDownloads, setTopDownloads] = useState<
    { name: string; slug: string; download_count: number }[]
  >([]);
  const [byType, setByType] = useState<{ dataset_type: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/datasets/analytics');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      const s = data.stats || {};
      setStats({
        total: Number(s.total) || 0,
        published: Number(s.published) || 0,
        draft: Number(s.draft) || 0,
        archived: Number(s.archived) || 0,
        totalViews: Number(s.total_views) || 0,
        totalDownloads: Number(s.total_downloads) || 0,
        averageRating: Number(s.average_rating) || 0,
        averageQuality: Number(s.average_quality) || 0,
        averageFreshness: Number(s.average_freshness) || 0,
        averagePopularity: Number(s.average_popularity) || 0,
      });
      setTopDownloads(data.topDownloads || []);
      setByType(data.byType || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-20">Failed to load analytics</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/datasets" className="mb-4 inline-block text-blue-600 hover:text-blue-800">
          ← Back to Datasets
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FaDatabase className="text-blue-600" />
          Dataset Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-500">Live SQL aggregates from the datasets catalog</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Datasets</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FaDatabase className="text-4xl text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.published}</p>
            </div>
            <FaChartLine className="text-4xl text-green-600 opacity-50" />
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Downloads</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <FaDownload className="text-4xl text-purple-600 opacity-50" />
          </div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
            </div>
            <FaStar className="text-4xl text-yellow-600 opacity-50" />
          </div>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Avg quality</p>
          <p className="text-2xl font-bold">{(stats.averageQuality || 0).toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Avg freshness</p>
          <p className="text-2xl font-bold">{(stats.averageFreshness || 0).toFixed(1)}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-600">Avg popularity</p>
          <p className="text-2xl font-bold">{(stats.averagePopularity || 0).toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <FaEye /> Top downloads
          </h3>
          <ul className="space-y-2">
            {topDownloads.map((d) => (
              <li key={d.slug} className="flex justify-between text-sm">
                <Link href={`/datasets/${d.slug}`} className="text-blue-600 hover:underline">
                  {d.name}
                </Link>
                <span className="tabular-nums text-gray-600">{d.download_count?.toLocaleString?.() ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-xl font-bold">By type</h3>
          <ul className="space-y-2">
            {byType.map((t) => (
              <li key={t.dataset_type} className="flex justify-between text-sm">
                <span>{t.dataset_type}</span>
                <span className="font-medium">{t.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
