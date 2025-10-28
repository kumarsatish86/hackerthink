"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SEODashboardPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSEOSettings() {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/seo/settings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch SEO settings');
        }
        
        const data = await response.json();
        setSettings(data.settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching SEO settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSEOSettings();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SEO Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/seo/sitemap" 
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Sitemap</h2>
          <p className="text-gray-600">Manage your site's XML sitemap for better search engine indexing</p>
        </Link>
        
        <Link href="/admin/seo/robots" 
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Robots.txt</h2>
          <p className="text-gray-600">Configure crawl instructions for search engines</p>
        </Link>
        
        <Link href="/admin/seo/redirects" 
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Redirects</h2>
          <p className="text-gray-600">Manage URL redirects for maintaining link equity</p>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Global SEO Settings</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : settings ? (
          <div className="space-y-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Setting</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(settings).map(([key, setting]: [string, any]) => (
                  <tr key={key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{setting.value}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{setting.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end mt-4">
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                onClick={() => {
                  // Implement settings edit functionality or navigation to edit page
                  alert('Edit functionality will be implemented here');
                }}
              >
                Edit Settings
              </button>
            </div>
          </div>
        ) : (
          <p>No settings found.</p>
        )}
      </div>
    </div>
  );
} 