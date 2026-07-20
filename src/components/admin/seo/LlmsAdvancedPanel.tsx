'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  LLMS_LINK_CATALOG,
  createDefaultLlmsConfig,
  generateLlmsTxt,
  type LlmsConfig,
} from '@/lib/seo/llmsConfig';

export default function LlmsAdvancedPanel() {
  const { status } = useSession();
  const router = useRouter();
  const [config, setConfig] = useState<LlmsConfig>(() => createDefaultLlmsConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customPath, setCustomPath] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customSection, setCustomSection] = useState<'main' | 'optional' | 'docs'>('main');

  const preview = useMemo(() => generateLlmsTxt(config), [config]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (status === 'authenticated') void load();
  }, [status, router]);

  const markDirty = (next: LlmsConfig) => {
    setConfig(next);
    setIsDirty(true);
    setError(null);
    setSuccess(null);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/seo/llms');
      if (!res.ok) throw new Error('Failed to fetch llms.txt config');
      const data = await res.json();
      if (data.config) {
        setConfig({ ...createDefaultLlmsConfig(), ...data.config });
      } else if (data.llms_txt) {
        setConfig({
          ...createDefaultLlmsConfig(),
          mode: 'raw',
          rawContent: data.llms_txt,
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
      const llms_txt = generateLlmsTxt(config);
      const res = await fetch('/api/admin/seo/llms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llms_txt, config }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to save');
      setSuccess('llms.txt saved successfully');
      setIsDirty(false);
      setConfig((c) => ({ ...c, rawContent: llms_txt }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleLink = (id: string, enabled: boolean) => {
    const set = new Set(config.enabledLinkIds);
    if (enabled) set.add(id);
    else set.delete(id);
    markDirty({ ...config, enabledLinkIds: [...set] });
  };

  const setSectionLinks = (section: 'main' | 'optional' | 'docs', enabled: boolean) => {
    const ids = LLMS_LINK_CATALOG.filter((l) => l.section === section).map((l) => l.id);
    const set = new Set(config.enabledLinkIds);
    for (const id of ids) {
      if (enabled) set.add(id);
      else set.delete(id);
    }
    markDirty({ ...config, enabledLinkIds: [...set] });
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  const sections: { key: 'main' | 'optional' | 'docs'; title: string; enabled?: boolean }[] = [
    { key: 'main', title: 'Main links' },
    { key: 'optional', title: 'Optional links', enabled: config.includeOptional },
    { key: 'docs', title: 'Docs / reference links', enabled: config.includeDocs },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 min-w-0 space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit llms.txt</h1>
          <p className="text-gray-600">Build an LLM-friendly site map by selecting sections and pages</p>
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
              <h2 className="font-semibold text-gray-900">Site identity</h2>
              <label className="block text-sm space-y-1">
                <span className="font-medium text-gray-700">Site name</span>
                <input
                  value={config.siteName}
                  onChange={(e) => markDirty({ ...config, siteName: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </label>
              <label className="block text-sm space-y-1">
                <span className="font-medium text-gray-700">Tagline / summary</span>
                <textarea
                  value={config.tagline}
                  onChange={(e) => markDirty({ ...config, tagline: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.includeOptional}
                    onChange={(e) => markDirty({ ...config, includeOptional: e.target.checked })}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Include Optional section
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={config.includeDocs}
                    onChange={(e) => markDirty({ ...config, includeDocs: e.target.checked })}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  Include Docs section
                </label>
              </div>
            </section>

            {sections.map((section) => {
              const links = LLMS_LINK_CATALOG.filter((l) => l.section === section.key);
              const disabled = section.enabled === false;
              return (
                <section
                  key={section.key}
                  className={`bg-white shadow rounded-lg p-5 space-y-3 ${disabled ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-gray-900">{section.title}</h2>
                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        disabled={disabled}
                        className="text-red-600 disabled:opacity-40"
                        onClick={() => setSectionLinks(section.key, true)}
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        className="text-red-600 disabled:opacity-40"
                        onClick={() => setSectionLinks(section.key, false)}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {links.map((link) => (
                      <label
                        key={link.id}
                        className="flex items-start gap-2 border border-gray-100 rounded-md px-3 py-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          disabled={disabled}
                          checked={config.enabledLinkIds.includes(link.id)}
                          onChange={(e) => toggleLink(link.id, e.target.checked)}
                          className="mt-0.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span>
                          <span className="font-medium text-gray-900">{link.title}</span>
                          <span className="block text-xs text-gray-500 font-mono">{link.path}</span>
                          <span className="block text-xs text-gray-500">{link.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              );
            })}

            <section className="bg-white shadow rounded-lg p-5 space-y-3">
              <h2 className="font-semibold text-gray-900">Custom links</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Title"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  placeholder="/path"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
                />
                <input
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Description"
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm sm:col-span-2"
                />
                <select
                  value={customSection}
                  onChange={(e) => setCustomSection(e.target.value as typeof customSection)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="main">Main</option>
                  <option value="optional">Optional</option>
                  <option value="docs">Docs</option>
                </select>
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  onClick={() => {
                    if (!customTitle.trim() || !customPath.trim()) return;
                    markDirty({
                      ...config,
                      customLinks: [
                        ...config.customLinks,
                        {
                          title: customTitle.trim(),
                          path: customPath.trim(),
                          description: customDesc.trim() || customTitle.trim(),
                          section: customSection,
                        },
                      ],
                    });
                    setCustomTitle('');
                    setCustomPath('');
                    setCustomDesc('');
                  }}
                >
                  Add custom link
                </button>
              </div>
              {config.customLinks.length > 0 && (
                <ul className="space-y-2">
                  {config.customLinks.map((link, idx) => (
                    <li
                      key={`${link.path}-${idx}`}
                      className="flex items-center justify-between gap-2 text-sm border border-gray-100 rounded-md px-3 py-2"
                    >
                      <span>
                        <span className="font-medium">{link.title}</span>
                        <span className="text-gray-500"> · {link.section} · </span>
                        <span className="font-mono text-xs">{link.path}</span>
                      </span>
                      <button
                        type="button"
                        className="text-xs text-red-600"
                        onClick={() =>
                          markDirty({
                            ...config,
                            customLinks: config.customLinks.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className="block text-sm space-y-1">
                <span className="font-medium text-gray-700">Extra markdown (appended)</span>
                <textarea
                  value={config.extraMarkdown}
                  onChange={(e) => markDirty({ ...config, extraMarkdown: e.target.value })}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 font-mono text-sm"
                  placeholder="## Notes&#10;- Extra guidance for LLMs"
                />
              </label>
            </section>
          </div>

          <div className="min-w-0">
            <div className="bg-white shadow rounded-lg p-5 sticky top-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Live preview</h2>
                <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="text-sm text-red-600">
                  Open /llms.txt
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
