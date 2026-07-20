"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type SeoSetting = {
  value: string;
  description?: string;
  id?: number;
};

function formatSettingLabel(key: string) {
  return key.replace(/_/g, ' ');
}

function SettingValue({ settingKey, value }: { settingKey: string; value: string }) {
  const raw = value ?? '';

  if (raw === 'true' || raw === 'false') {
    const on = raw === 'true';
    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
          on ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10'
        }`}
      >
        {raw}
      </span>
    );
  }

  if (
    settingKey === 'default_robots_txt' ||
    settingKey === 'ads_txt' ||
    settingKey === 'llms_txt' ||
    settingKey === 'security_txt' ||
    raw.includes('\n') ||
    raw.length > 120
  ) {
    return (
      <pre className="max-h-40 overflow-auto rounded-md bg-gray-50 p-3 text-xs leading-relaxed text-gray-700 whitespace-pre-wrap break-words font-mono border border-gray-100">
        {raw}
      </pre>
    );
  }

  if (settingKey === 'include_in_sitemap' || (raw.includes(',') && !raw.includes(' '))) {
    const parts = raw.split(',').map((p) => p.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5">
        {parts.map((part) => (
          <span
            key={part}
            className="inline-flex max-w-full items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 break-all"
          >
            {part}
          </span>
        ))}
      </div>
    );
  }

  return <span className="break-words text-sm text-gray-700">{raw}</span>;
}

export default function SEODashboardPage() {
  const [settings, setSettings] = useState<Record<string, SeoSetting> | null>(null);
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
    <div className="p-6 max-w-full min-w-0">
      <h1 className="text-2xl font-bold mb-6">SEO Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <Link
          href="/admin/seo/sitemap"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Sitemap</h2>
          <p className="text-gray-600">Manage your site&apos;s XML sitemap for better search engine indexing</p>
        </Link>

        <Link
          href="/admin/seo/robots"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Robots.txt</h2>
          <p className="text-gray-600">Configure crawl instructions for search engines</p>
        </Link>

        <Link
          href="/admin/seo/ads"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Ads.txt</h2>
          <p className="text-gray-600">Authorize digital ad sellers for your domain (IAB)</p>
        </Link>

        <Link
          href="/admin/seo/llms"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">llms.txt</h2>
          <p className="text-gray-600">Guide AI crawlers and LLM tools to your key content</p>
        </Link>

        <Link
          href="/admin/seo/security"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">security.txt</h2>
          <p className="text-gray-600">Publish security contact and vulnerability disclosure info</p>
        </Link>

        <Link
          href="/admin/seo/redirects"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Redirects</h2>
          <p className="text-gray-600">Manage URL redirects for maintaining link equity</p>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 min-w-0 overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Global SEO Settings</h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
          </div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : settings ? (
          <div className="space-y-4 min-w-0">
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[48%]" />
                  <col className="w-[30%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setting
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(settings).map(([key, setting]) => (
                    <tr key={key} className="align-top">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 break-words">
                        <span className="font-mono text-xs text-gray-800">{key}</span>
                        <div className="mt-1 text-xs font-normal text-gray-500 capitalize">
                          {formatSettingLabel(key)}
                        </div>
                      </td>
                      <td className="px-4 py-4 min-w-0">
                        <SettingValue settingKey={key} value={String(setting.value ?? '')} />
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 break-words">
                        {setting.description || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                onClick={() => {
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
