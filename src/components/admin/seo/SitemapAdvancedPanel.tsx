'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  CHANGEFREQ_OPTIONS,
  PRIORITY_OPTIONS,
  SITEMAP_CONTENT_TYPES,
  SITEMAP_STATIC_PAGES,
  createDefaultSitemapConfig,
  summarizeSitemapConfig,
  type SitemapAdvancedConfig,
} from '@/lib/seo/sitemapConfig';

export default function SitemapAdvancedPanel() {
  const { status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<SitemapAdvancedConfig>(() => createDefaultSitemapConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [groupFilter, setGroupFilter] = useState<'All' | 'Core' | 'Learning' | 'AI' | 'Media' | 'Community'>(
    'All'
  );

  const summary = useMemo(() => summarizeSitemapConfig(config), [config]);
  const enabledCount = useMemo(
    () => SITEMAP_CONTENT_TYPES.filter((t) => config.types[t.id]?.enabled).length,
    [config]
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (status === 'authenticated') void load();
  }, [status, router]);

  const markDirty = (next: SitemapAdvancedConfig) => {
    setConfig(next);
    setIsDirty(true);
    setError(null);
    setSuccess(null);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/seo/sitemap');
      if (!res.ok) throw new Error('Failed to fetch sitemap settings');
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      } else if (data.sitemap_settings) {
        const next = createDefaultSitemapConfig(data.sitemap_settings.include_in_sitemap);
        setConfig({
          ...next,
          generate_sitemap: data.sitemap_settings.generate_sitemap !== 'false',
          sitemap_change_frequency:
            data.sitemap_settings.sitemap_change_frequency || next.sitemap_change_frequency,
          sitemap_priority: data.sitemap_settings.sitemap_priority || next.sitemap_priority,
        });
      }
      setIsDirty(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/seo/sitemap', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');
      setSuccess('Sitemap settings saved successfully');
      setIsDirty(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const setAllTypes = (enabled: boolean) => {
    const types = { ...config.types };
    for (const t of SITEMAP_CONTENT_TYPES) {
      types[t.id] = { ...types[t.id], enabled };
    }
    markDirty({ ...config, types });
  };

  const applyDefaultsToAll = () => {
    const types = { ...config.types };
    for (const t of SITEMAP_CONTENT_TYPES) {
      types[t.id] = {
        ...types[t.id],
        changefreq: config.sitemap_change_frequency,
        priority: config.sitemap_priority,
      };
    }
    markDirty({ ...config, types });
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  const types = SITEMAP_CONTENT_TYPES.filter((t) => groupFilter === 'All' || t.group === groupFilter);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 min-w-0 space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sitemap Settings</h1>
          <p className="text-gray-600">
            Advanced sitemap configuration — {enabledCount} content types enabled
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={saving || !isDirty}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !isDirty}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">{error}</div>}
      {success && <div className="bg-green-50 border-l-4 border-green-400 p-4 text-sm text-green-700">{success}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6 min-w-0">
          <section className="bg-white shadow rounded-lg p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Global options</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={config.generate_sitemap}
                onChange={(e) => markDirty({ ...config, generate_sitemap: e.target.checked })}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Generate sitemap.xml automatically
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="text-sm space-y-1">
                <span className="font-medium text-gray-700">Default change frequency</span>
                <select
                  value={config.sitemap_change_frequency}
                  onChange={(e) => markDirty({ ...config, sitemap_change_frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {CHANGEFREQ_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm space-y-1">
                <span className="font-medium text-gray-700">Default priority</span>
                <select
                  value={config.sitemap_priority}
                  onChange={(e) => markDirty({ ...config, sitemap_priority: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.include_homepage}
                  onChange={(e) => markDirty({ ...config, include_homepage: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Include homepage
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.include_lastmod}
                  onChange={(e) => markDirty({ ...config, include_lastmod: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Include lastmod
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.include_images}
                  onChange={(e) => markDirty({ ...config, include_images: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Include image entries (where supported)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.ping_search_engines}
                  onChange={(e) => markDirty({ ...config, ping_search_engines: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Ping search engines after publish
              </label>
            </div>
            <button type="button" className="text-sm text-red-600" onClick={applyDefaultsToAll}>
              Apply default changefreq/priority to all content types
            </button>
          </section>

          <section className="bg-white shadow rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-gray-900">Content types</h2>
              <div className="flex gap-2 text-xs">
                <button type="button" className="text-red-600" onClick={() => setAllTypes(true)}>
                  Select all
                </button>
                <button type="button" className="text-red-600" onClick={() => setAllTypes(false)}>
                  Deselect all
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Core', 'Learning', 'AI', 'Media', 'Community'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupFilter(g)}
                  className={`px-2.5 py-1 rounded-full text-xs border ${
                    groupFilter === g ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {types.map((t) => {
                const row = config.types[t.id] || {
                  enabled: false,
                  changefreq: t.defaultChangefreq,
                  priority: t.defaultPriority,
                };
                return (
                  <div
                    key={t.id}
                    className={`border rounded-lg p-4 ${row.enabled ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <label className="flex items-start gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={row.enabled}
                          onChange={(e) =>
                            markDirty({
                              ...config,
                              types: {
                                ...config.types,
                                [t.id]: { ...row, enabled: e.target.checked },
                              },
                            })
                          }
                          className="mt-1 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span>
                          <span className="font-medium text-gray-900">{t.label}</span>
                          <span className="ml-2 text-xs uppercase tracking-wide text-gray-400">{t.group}</span>
                          <span className="block text-xs text-gray-500">{t.description}</span>
                        </span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <select
                          disabled={!row.enabled}
                          value={row.changefreq}
                          onChange={(e) =>
                            markDirty({
                              ...config,
                              types: {
                                ...config.types,
                                [t.id]: { ...row, changefreq: e.target.value },
                              },
                            })
                          }
                          className="border border-gray-300 rounded-md text-sm px-2 py-1 disabled:bg-gray-50"
                        >
                          {CHANGEFREQ_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <select
                          disabled={!row.enabled}
                          value={row.priority}
                          onChange={(e) =>
                            markDirty({
                              ...config,
                              types: {
                                ...config.types,
                                [t.id]: { ...row, priority: e.target.value },
                              },
                            })
                          }
                          className="border border-gray-300 rounded-md text-sm px-2 py-1 disabled:bg-gray-50"
                        >
                          {PRIORITY_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white shadow rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-gray-900">Static pages</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.include_static_pages}
                  onChange={(e) => markDirty({ ...config, include_static_pages: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Include static pages
              </label>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${!config.include_static_pages ? 'opacity-50' : ''}`}>
              {SITEMAP_STATIC_PAGES.map((p) => (
                <label key={p.path} className="flex items-center gap-2 text-sm border border-gray-100 rounded-md px-3 py-2">
                  <input
                    type="checkbox"
                    disabled={!config.include_static_pages}
                    checked={config.static_pages.includes(p.path)}
                    onChange={(e) => {
                      const set = new Set(config.static_pages);
                      if (e.target.checked) set.add(p.path);
                      else set.delete(p.path);
                      markDirty({ ...config, static_pages: [...set] });
                    }}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span>
                    <span className="font-medium">{p.label}</span>
                    <span className="block font-mono text-xs text-gray-500">{p.path}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="bg-white shadow rounded-lg p-5 sticky top-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Config summary</h2>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-sm text-red-600">
                Open /sitemap.xml
              </a>
            </div>
            <pre className="max-h-[50vh] overflow-auto bg-gray-50 border border-gray-100 rounded-md p-4 text-xs font-mono whitespace-pre-wrap break-words">
              {summary}
            </pre>
            <p className="text-xs text-gray-500">
              XML sitemaps are generated dynamically from these settings. Per-type changefreq/priority are stored for
              future sitemap builders; content-type inclusion already drives live sitemap routes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
