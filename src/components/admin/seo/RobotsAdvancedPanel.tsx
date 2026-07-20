'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ROBOTS_ALLOW_PRESETS,
  ROBOTS_BOTS,
  ROBOTS_PATH_PRESETS,
  createDefaultRobotsConfig,
  generateRobotsTxt,
  togglePath,
  type BotPolicy,
  type RobotsBotId,
  type RobotsConfig,
} from '@/lib/seo/robotsConfig';

const POLICY_OPTIONS: { value: BotPolicy; label: string }[] = [
  { value: 'inherit', label: 'Inherit (*)' },
  { value: 'allow', label: 'Allow' },
  { value: 'block', label: 'Block' },
];

export default function RobotsAdvancedPanel() {
  const { status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<RobotsConfig>(() => createDefaultRobotsConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [customDisallow, setCustomDisallow] = useState('');
  const [botFilter, setBotFilter] = useState<'All' | 'Search' | 'AI' | 'Social' | 'Other'>('All');

  const preview = useMemo(() => generateRobotsTxt(config), [config]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (status === 'authenticated') void load();
  }, [status, router]);

  const markDirty = (next: RobotsConfig) => {
    setConfig(next);
    setIsDirty(true);
    setError(null);
    setSuccess(null);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/seo/robots');
      if (!res.ok) throw new Error('Failed to fetch robots.txt config');
      const data = await res.json();
      if (data.config) {
        setConfig({ ...createDefaultRobotsConfig(), ...data.config });
      } else if (data.robots_txt) {
        setConfig({
          ...createDefaultRobotsConfig(),
          mode: 'raw',
          rawContent: data.robots_txt,
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
      setError(null);
      const robots_txt = generateRobotsTxt(config);
      const res = await fetch('/api/admin/seo/robots', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robots_txt, config }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');
      setSuccess('robots.txt saved successfully');
      setIsDirty(false);
      setConfig((c) => ({ ...c, rawContent: robots_txt }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const setAllBots = (policy: BotPolicy) => {
    const bots = { ...config.bots };
    for (const b of ROBOTS_BOTS) bots[b.id] = policy;
    markDirty({ ...config, bots });
  };

  const setBot = (id: RobotsBotId, policy: BotPolicy) => {
    markDirty({ ...config, bots: { ...config.bots, [id]: policy } });
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  const filteredBots = ROBOTS_BOTS.filter((b) => botFilter === 'All' || b.category === botFilter);
  const pathGroups = [...new Set(ROBOTS_PATH_PRESETS.map((p) => p.group))];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 min-w-0 space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit robots.txt</h1>
          <p className="text-gray-600">Advanced builder for crawler rules, AI bots, and sitemap discovery</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => markDirty({ ...config, mode: 'builder' })}
              className={`px-3 py-2 text-sm ${config.mode === 'builder' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Builder
            </button>
            <button
              type="button"
              onClick={() =>
                markDirty({
                  ...config,
                  mode: 'raw',
                  rawContent: config.mode === 'raw' ? config.rawContent : preview,
                })
              }
              className={`px-3 py-2 text-sm border-l border-gray-300 ${config.mode === 'raw' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
            >
              Raw
            </button>
          </div>
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

      {config.mode === 'raw' ? (
        <div className="bg-white shadow rounded-lg p-6">
          <textarea
            value={config.rawContent}
            onChange={(e) => markDirty({ ...config, rawContent: e.target.value })}
            className="w-full h-[32rem] font-mono text-sm border border-gray-300 rounded-lg p-3"
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-6 min-w-0">
            <section className="bg-white shadow rounded-lg p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Global defaults (User-agent: *)</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.allowRoot}
                  onChange={(e) => markDirty({ ...config, allowRoot: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Allow entire site (`Allow: /`)
              </label>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Allow paths</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ROBOTS_ALLOW_PRESETS.map((p) => (
                    <label key={p.path} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={config.allowPaths.includes(p.path)}
                        onChange={(e) =>
                          markDirty({
                            ...config,
                            allowPaths: togglePath(config.allowPaths, p.path, e.target.checked),
                          })
                        }
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">Disallow paths</div>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() =>
                      markDirty({
                        ...config,
                        disallowPaths: ROBOTS_PATH_PRESETS.map((p) => p.path),
                      })
                    }
                  >
                    Select all presets
                  </button>
                </div>
                {pathGroups.map((group) => (
                  <div key={group} className="mb-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{group}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ROBOTS_PATH_PRESETS.filter((p) => p.group === group).map((p) => (
                        <label key={p.path} className="flex items-start gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={config.disallowPaths.includes(p.path)}
                            onChange={(e) =>
                              markDirty({
                                ...config,
                                disallowPaths: togglePath(config.disallowPaths, p.path, e.target.checked),
                              })
                            }
                            className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span>
                            <span className="font-medium">{p.label}</span>
                            <span className="block font-mono text-xs text-gray-500">{p.path}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <input
                    value={customDisallow}
                    onChange={(e) => setCustomDisallow(e.target.value)}
                    placeholder="/custom-path/"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md"
                    onClick={() => {
                      const path = customDisallow.trim();
                      if (!path) return;
                      markDirty({
                        ...config,
                        disallowPaths: togglePath(config.disallowPaths, path, true),
                      });
                      setCustomDisallow('');
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm space-y-1">
                  <span className="font-medium text-gray-700">Crawl-delay (optional)</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={config.crawlDelay ?? ''}
                    onChange={(e) =>
                      markDirty({
                        ...config,
                        crawlDelay: e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g. 10"
                  />
                </label>
              </div>
            </section>

            <section className="bg-white shadow rounded-lg p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-gray-900">Bot-specific policies</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button type="button" className="text-red-600" onClick={() => setAllBots('inherit')}>
                    All inherit
                  </button>
                  <button type="button" className="text-red-600" onClick={() => setAllBots('allow')}>
                    Allow all listed
                  </button>
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => {
                      const bots = { ...config.bots };
                      for (const b of ROBOTS_BOTS) {
                        bots[b.id] = b.category === 'AI' ? 'block' : 'inherit';
                      }
                      markDirty({ ...config, bots });
                    }}
                  >
                    Block AI crawlers
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['All', 'Search', 'AI', 'Social', 'Other'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setBotFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-xs border ${
                      botFilter === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filteredBots.map((bot) => (
                  <div
                    key={bot.id}
                    className="flex flex-wrap items-center justify-between gap-2 border border-gray-100 rounded-md px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900">{bot.label}</div>
                      <div className="text-xs text-gray-500">
                        {bot.category} · {bot.description}
                      </div>
                    </div>
                    <select
                      value={config.bots[bot.id] || 'inherit'}
                      onChange={(e) => setBot(bot.id, e.target.value as BotPolicy)}
                      className="border border-gray-300 rounded-md text-sm px-2 py-1"
                    >
                      {POLICY_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => {
                  const bots = { ...config.bots };
                  for (const b of ROBOTS_BOTS) {
                    if (b.category === 'AI') bots[b.id] = 'block';
                  }
                  markDirty({ ...config, bots });
                }}
              >
                Quick action: block all AI crawlers
              </button>
            </section>

            <section className="bg-white shadow rounded-lg p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Discovery & host</h2>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeSitemap}
                  onChange={(e) => markDirty({ ...config, includeSitemap: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Include Sitemap directive
              </label>
              <input
                value={config.sitemapUrl}
                onChange={(e) => markDirty({ ...config, sitemapUrl: e.target.value })}
                disabled={!config.includeSitemap}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono disabled:bg-gray-50"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.includeHost}
                  onChange={(e) => markDirty({ ...config, includeHost: e.target.checked })}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Include Host directive (Yandex)
              </label>
              <input
                value={config.host}
                onChange={(e) => markDirty({ ...config, host: e.target.value })}
                disabled={!config.includeHost}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono disabled:bg-gray-50"
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Custom rules (appended)</label>
                <textarea
                  value={config.customRules}
                  onChange={(e) => markDirty({ ...config, customRules: e.target.value })}
                  rows={4}
                  className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                  placeholder="# Extra user-agent blocks, clean-param, etc."
                />
              </div>
            </section>
          </div>

          <div className="min-w-0">
            <div className="bg-white shadow rounded-lg p-5 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Live preview</h2>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-sm text-red-600">
                  Open /robots.txt
                </a>
              </div>
              <pre className="max-h-[70vh] overflow-auto bg-gray-50 border border-gray-100 rounded-md p-4 text-xs font-mono whitespace-pre-wrap break-words">
                {preview}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
