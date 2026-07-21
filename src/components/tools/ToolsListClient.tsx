'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaTools,
  FaSearch,
  FaTimes,
  FaTh,
  FaList,
  FaEye,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaExternalLinkAlt,
  FaUsers,
} from 'react-icons/fa';

interface Tool {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  platform: string;
  license: string;
  official_url: string;
  popularity: number;
  icon?: string;
  users_count?: number;
}

type SidebarTab = 'main' | 'categories' | 'platforms' | 'licenses' | 'other';

const TOOL_CATEGORIES: Array<{ id: string; label: string; icon: string }> = [
  { id: 'prompting', label: 'Prompting', icon: '✍️' },
  { id: 'nlp', label: 'NLP', icon: '💬' },
  { id: 'machine-learning', label: 'Machine Learning', icon: '🧠' },
  { id: 'computer-vision', label: 'Computer Vision', icon: '👁️' },
  { id: 'datasets', label: 'Datasets', icon: '📊' },
  { id: 'cost-planning', label: 'Cost & Planning', icon: '💰' },
  { id: 'automation', label: 'Automation', icon: '⚙️' },
  { id: 'development', label: 'Development', icon: '💻' },
  { id: 'security', label: 'Security & Ethics', icon: '🛡️' },
  { id: 'other', label: 'Other', icon: '🧰' },
];

const TOOL_PLATFORMS = [
  { id: 'web', label: 'Web' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'cross-platform', label: 'Cross Platform' },
  { id: 'linux', label: 'Linux' },
];

const TOOL_LICENSES = ['Open Source', 'MIT', 'Apache 2.0', 'API', 'Proprietary', 'Unknown'];

function toggleValue(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors ${
        active
          ? 'bg-red-600 text-white border-red-600'
          : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
      }`}
    >
      {children}
    </button>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-sm font-semibold text-gray-800 mb-2"
      >
        <span>{title}</span>
        {open ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function categoryLabel(id: string) {
  return TOOL_CATEGORIES.find((c) => c.id === id)?.label || id.replace(/-/g, ' ');
}

export default function ToolsListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('main');
  const [categorySearch, setCategorySearch] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (searchParams.get('category') || '').split(',').filter(Boolean)
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    (searchParams.get('platform') || '').split(',').filter(Boolean)
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    (searchParams.get('license') || '').split(',').filter(Boolean)
  );
  const [popularOnly, setPopularOnly] = useState(searchParams.get('popular') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'asc'
  );

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);

  useEffect(() => {
    fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedPlatforms, selectedLicenses, popularOnly, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTools(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategories.length) params.set('category', selectedCategories.join(','));
      if (selectedPlatforms.length) params.set('platform', selectedPlatforms.join(','));
      if (selectedLicenses.length) params.set('license', selectedLicenses.join(','));
      if (popularOnly) params.set('popular', 'true');
      params.set('sort', sortBy);
      params.set('order', sortOrder);

      const response = await fetch(`/api/tools?${params.toString()}`);
      const data = await response.json();
      setTools(data.tools || []);
      if (data.filterOptions) {
        setAvailableCategories(data.filterOptions.categories || []);
        setAvailablePlatforms(data.filterOptions.platforms || []);
        setAvailableLicenses(data.filterOptions.licenses || []);
      }

      const newParams = new URLSearchParams(params);
      router.push(`/tools?${newParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedPlatforms([]);
    setSelectedLicenses([]);
    setPopularOnly(false);
    setSortBy('title');
    setSortOrder('asc');
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedPlatforms.length +
    selectedLicenses.length +
    (popularOnly ? 1 : 0) +
    (search ? 1 : 0);

  const filteredCategoryOptions = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    const source = availableCategories.length
      ? availableCategories
      : TOOL_CATEGORIES.map((c) => c.id);
    return source.filter((id) => {
      const label = categoryLabel(id).toLowerCase();
      return !q || id.includes(q) || label.includes(q);
    });
  }, [categorySearch, availableCategories]);

  const sidebar = (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {(
          [
            ['main', 'Main'],
            ['categories', 'Categories'],
            ['platforms', 'Platforms'],
            ['licenses', 'Licenses'],
            ['other', 'Other'],
          ] as Array<[SidebarTab, string]>
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSidebarTab(id)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap ${
              sidebarTab === id
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[75vh] overflow-y-auto">
        {sidebarTab === 'categories' && (
          <div className="mb-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                placeholder="Filter categories..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'categories') && (
          sidebarTab === 'categories' ? (
            <div className="flex flex-wrap gap-1.5">
              {filteredCategoryOptions.map((id) => {
                const meta = TOOL_CATEGORIES.find((c) => c.id === id);
                return (
                  <Chip
                    key={id}
                    active={selectedCategories.includes(id)}
                    onClick={() => setSelectedCategories(toggleValue(selectedCategories, id))}
                  >
                    {meta?.icon ? <span>{meta.icon}</span> : null}
                    {categoryLabel(id)}
                  </Chip>
                );
              })}
            </div>
          ) : (
            <FilterSection title="Categories" defaultOpen>
              <div className="flex flex-wrap gap-1.5">
                {TOOL_CATEGORIES.slice(0, 8).map((cat) => (
                  <Chip
                    key={cat.id}
                    active={selectedCategories.includes(cat.id)}
                    onClick={() => setSelectedCategories(toggleValue(selectedCategories, cat.id))}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </Chip>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSidebarTab('categories')}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Browse all categories →
              </button>
            </FilterSection>
          )
        )}

        {(sidebarTab === 'main' || sidebarTab === 'platforms') && (
          <FilterSection title="Platforms" defaultOpen={sidebarTab === 'platforms'}>
            <div className="flex flex-wrap gap-1.5">
              {(availablePlatforms.length
                ? availablePlatforms
                : TOOL_PLATFORMS.map((p) => p.id)
              ).map((id) => (
                <Chip
                  key={id}
                  active={selectedPlatforms.includes(id)}
                  onClick={() => setSelectedPlatforms(toggleValue(selectedPlatforms, id))}
                >
                  {TOOL_PLATFORMS.find((p) => p.id === id)?.label || id}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'licenses') && (
          <FilterSection title="Licenses" defaultOpen={sidebarTab === 'licenses'}>
            <div className="flex flex-wrap gap-1.5">
              {(availableLicenses.length ? availableLicenses : TOOL_LICENSES).map((license) => (
                <Chip
                  key={license}
                  active={selectedLicenses.includes(license)}
                  onClick={() => setSelectedLicenses(toggleValue(selectedLicenses, license))}
                >
                  {license}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'other') && (
          <FilterSection title="Shortcuts" defaultOpen={sidebarTab === 'other'}>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={popularOnly}
                onChange={(e) => setPopularOnly(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Popular only (85+)
            </label>
          </FilterSection>
        )}

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 w-full text-sm text-gray-600 hover:text-red-600 flex items-center justify-center gap-2 py-2 border border-dashed border-gray-200 rounded-lg"
          >
            <FaTimes /> Clear all filters ({activeFilterCount})
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="space-y-4">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm"
        >
          <FaBars />
          Filters
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
        {sidebarOpen && <div className="mt-3">{sidebar}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
        <div className="hidden lg:block">{sidebar}</div>

        <div className="space-y-4 min-w-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by name..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                >
                  <option value="title">Name</option>
                  <option value="popularity">Trending</option>
                  <option value="users">Most users</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg border ${
                    viewMode === 'grid'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <FaTh />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg border ${
                    viewMode === 'list'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            {loading ? (
              'Loading tools...'
            ) : (
              <>
                Tools <span className="font-semibold text-gray-900">{tools.length.toLocaleString()}</span>
              </>
            )}
          </p>

          {loading && tools.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaFilter className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No tools match these filters.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-red-600 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-lg">
                      {tool.icon || <FaTools className="text-red-600" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{tool.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{categoryLabel(tool.category)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                    {tool.description || 'No description available.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {tool.platform?.replace(/-/g, ' ') || 'web'}
                    </span>
                    {tool.license && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                        {tool.license}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1">
                      <FaUsers /> {(tool.users_count || 0).toLocaleString()}
                    </span>
                    <span>{tool.popularity || 0}% pop.</span>
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <FaEye /> Details
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">
                    {tool.icon || <FaTools className="text-red-600" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{tool.title}</h3>
                        <p className="text-sm text-gray-500">{categoryLabel(tool.category)}</p>
                      </div>
                      {tool.official_url && tool.official_url !== '#' && (
                        <span className="text-xs text-gray-400 inline-flex items-center gap-1 flex-shrink-0">
                          <FaExternalLinkAlt /> External
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {tool.description || 'No description available.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{tool.platform}</span>
                      {tool.license && <span>{tool.license}</span>}
                      <span className="inline-flex items-center gap-1 ml-auto">
                        <FaUsers /> {(tool.users_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
