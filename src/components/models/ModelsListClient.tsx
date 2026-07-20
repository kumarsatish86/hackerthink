'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaBrain, FaDownload, FaStar, FaSearch, FaTimes, FaTh, FaList,
  FaEye, FaChartLine, FaFilter, FaChevronDown, FaChevronUp, FaBars
} from 'react-icons/fa';
import {
  HF_APPS,
  HF_LIBRARIES,
  HF_MISC,
  HF_MODEL_TREE,
  HF_PROVIDERS,
  HF_TASK_GROUPS,
} from '@/lib/huggingfaceTaxonomy';

interface AIModel {
  id: string;
  name: string;
  slug: string;
  developer?: string;
  description?: string;
  model_type?: string;
  parameters?: string;
  context_length?: number;
  architecture?: string;
  license?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  view_count?: number;
  logo_url?: string;
  created_at?: string;
  tags?: string[] | string;
  featured?: boolean;
}

type SidebarTab = 'main' | 'tasks' | 'libraries' | 'languages' | 'licenses' | 'other';

const PARAM_MARKERS = [
  { value: 0, label: '<1B' },
  { value: 6, label: '6B' },
  { value: 12, label: '12B' },
  { value: 32, label: '32B' },
  { value: 128, label: '128B' },
  { value: 500, label: '>500B' },
];
const PARAM_MAX = 500;

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
  action,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-3">
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-1 flex items-center justify-between text-sm font-semibold text-gray-800"
        >
          <span>{title}</span>
          {open ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
        </button>
        {action}
      </div>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}

function ParamRangeSlider({
  minB,
  maxB,
  onChange,
}: {
  minB: number;
  maxB: number;
  onChange: (min: number, max: number) => void;
}) {
  const clamp = (n: number) => Math.min(PARAM_MAX, Math.max(0, n));

  return (
    <div className="space-y-3 pt-1">
      <div className="relative h-8">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-red-100 rounded-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-red-600 rounded-full"
          style={{
            left: `${(minB / PARAM_MAX) * 100}%`,
            right: `${100 - (maxB / PARAM_MAX) * 100}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={PARAM_MAX}
          step={1}
          value={minB}
          onChange={(e) => {
            const next = clamp(Number(e.target.value));
            onChange(Math.min(next, maxB), maxB);
          }}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-red-700 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-red-700"
        />
        <input
          type="range"
          min={0}
          max={PARAM_MAX}
          step={1}
          value={maxB}
          onChange={(e) => {
            const next = clamp(Number(e.target.value));
            onChange(minB, Math.max(next, minB));
          }}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-red-700 [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-red-700"
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 px-0.5">
        {PARAM_MARKERS.map((m) => (
          <button
            key={m.value}
            type="button"
            className="hover:text-gray-800"
            onClick={() => {
              if (m.value === 0) onChange(0, maxB);
              else if (m.value === PARAM_MAX) onChange(minB, PARAM_MAX);
              else if (Math.abs(m.value - minB) <= Math.abs(m.value - maxB)) onChange(m.value, Math.max(m.value, maxB));
              else onChange(Math.min(minB, m.value), m.value);
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-600">
        Selected: <span className="font-medium text-gray-900">{minB === 0 ? '<1' : `${minB}`}B</span>
        {' – '}
        <span className="font-medium text-gray-900">{maxB >= PARAM_MAX ? '>500' : `${maxB}`}B</span>
      </div>
    </div>
  );
}

export default function ModelsListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('main');
  const [taskSearch, setTaskSearch] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTasks, setSelectedTasks] = useState<string[]>(
    (searchParams.get('model_type') || '').split(',').filter(Boolean)
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    (searchParams.get('license') || '').split(',').filter(Boolean)
  );
  const [selectedLibraries, setSelectedLibraries] = useState<string[]>(
    (searchParams.get('library') || '').split(',').filter(Boolean)
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    (searchParams.get('language') || '').split(',').filter(Boolean)
  );
  const [selectedModelTree, setSelectedModelTree] = useState<string[]>(
    (searchParams.get('model_tree') || '').split(',').filter(Boolean)
  );
  const [selectedApps, setSelectedApps] = useState<string[]>(
    (searchParams.get('app') || '').split(',').filter(Boolean)
  );
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    (searchParams.get('provider') || '').split(',').filter(Boolean)
  );
  const [selectedMisc, setSelectedMisc] = useState<string[]>(
    (searchParams.get('misc') || '').split(',').filter(Boolean)
  );
  const [selectedOrg, setSelectedOrg] = useState(searchParams.get('organization') || '');
  const [minParamsB, setMinParamsB] = useState(Number(searchParams.get('min_params_b') || 0));
  const [maxParamsB, setMaxParamsB] = useState(Number(searchParams.get('max_params_b') || PARAM_MAX));
  const [selectedArchitecture, setSelectedArchitecture] = useState(searchParams.get('architecture') || '');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'downloads');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<string[]>([]);
  const [availableLibraries, setAvailableLibraries] = useState<string[]>(HF_LIBRARIES);
  const [availableArchitectures, setAvailableArchitectures] = useState<string[]>([]);

  const formatRating = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n.toFixed(1) : 'N/A';
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const filteredTaskGroups = useMemo(() => {
    const q = taskSearch.trim().toLowerCase();
    return HF_TASK_GROUPS.map((group) => ({
      ...group,
      tasks: group.tasks.filter((t) => {
        const inDb = availableTypes.length === 0 || availableTypes.some((x) => x.toLowerCase().includes(t.id));
        const matchesSearch =
          !q ||
          t.id.includes(q) ||
          t.label.toLowerCase().includes(q) ||
          group.label.toLowerCase().includes(q);
        return matchesSearch && (availableTypes.length === 0 || inDb || true);
      }),
    })).filter((g) => g.tasks.length > 0);
  }, [taskSearch, availableTypes]);

  useEffect(() => {
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTasks,
    selectedLicenses,
    selectedLibraries,
    selectedLanguages,
    selectedModelTree,
    selectedApps,
    selectedProviders,
    selectedMisc,
    selectedOrg,
    minParamsB,
    maxParamsB,
    selectedArchitecture,
    featuredOnly,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => fetchModels(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', 'published');
      params.set('limit', '100');
      if (search) params.set('search', search);
      if (selectedTasks.length) params.set('model_type', selectedTasks.join(','));
      if (selectedLicenses.length) params.set('license', selectedLicenses.join(','));
      if (selectedLibraries.length) params.set('library', selectedLibraries.join(','));
      if (selectedLanguages.length) params.set('language', selectedLanguages.join(','));
      if (selectedModelTree.length) params.set('model_tree', selectedModelTree.join(','));
      if (selectedApps.length) params.set('app', selectedApps.join(','));
      if (selectedProviders.length) params.set('provider', selectedProviders.join(','));
      if (selectedMisc.length) params.set('misc', selectedMisc.join(','));
      if (selectedOrg) params.set('organization', selectedOrg);
      if (minParamsB > 0) params.set('min_params_b', String(minParamsB));
      if (maxParamsB < PARAM_MAX) params.set('max_params_b', String(maxParamsB));
      if (selectedArchitecture) params.set('architecture', selectedArchitecture);
      if (featuredOnly) params.set('featured', 'true');
      params.set('sort', sortBy);
      params.set('order', sortOrder);

      const response = await fetch(`/api/models?${params.toString()}`);
      const data = await response.json();

      setModels(data.models || []);
      if (data.filterOptions) {
        setAvailableTypes(data.filterOptions.modelTypes || []);
        setAvailableLicenses(data.filterOptions.licenses || []);
        setAvailableOrgs(data.filterOptions.organizations || []);
        setAvailableLibraries(
          data.filterOptions.libraries?.length ? data.filterOptions.libraries : HF_LIBRARIES
        );
        setAvailableArchitectures(data.filterOptions.architectures || []);
      }

      const newParams = new URLSearchParams(params);
      newParams.delete('status');
      newParams.delete('limit');
      router.push(`/models?${newParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTasks([]);
    setSelectedLicenses([]);
    setSelectedLibraries([]);
    setSelectedLanguages([]);
    setSelectedModelTree([]);
    setSelectedApps([]);
    setSelectedProviders([]);
    setSelectedMisc([]);
    setSelectedOrg('');
    setMinParamsB(0);
    setMaxParamsB(PARAM_MAX);
    setSelectedArchitecture('');
    setFeaturedOnly(false);
    setSortBy('downloads');
    setSortOrder('desc');
  };

  const activeFilterCount =
    selectedTasks.length +
    selectedLicenses.length +
    selectedLibraries.length +
    selectedLanguages.length +
    selectedModelTree.length +
    selectedApps.length +
    selectedProviders.length +
    selectedMisc.length +
    (selectedOrg ? 1 : 0) +
    (minParamsB > 0 || maxParamsB < PARAM_MAX ? 1 : 0) +
    (selectedArchitecture ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (search ? 1 : 0);

  const sidebar = (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {([
          ['main', 'Main'],
          ['tasks', 'Tasks'],
          ['libraries', 'Libraries'],
          ['languages', 'Languages'],
          ['licenses', 'Licenses'],
          ['other', 'Other'],
        ] as Array<[SidebarTab, string]>).map(([id, label]) => (
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
        {sidebarTab === 'tasks' && (
          <div className="mb-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Filter Tasks by name"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'tasks') && (
          sidebarTab === 'tasks' ? (
            <div className="space-y-4">
              {filteredTaskGroups.map((group) => (
                <div key={group.id}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    {group.label}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tasks.map((task) => (
                      <Chip
                        key={task.id}
                        active={selectedTasks.includes(task.id)}
                        onClick={() => setSelectedTasks(toggleValue(selectedTasks, task.id))}
                      >
                        <span>{task.icon}</span>
                        {task.label}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FilterSection title="Tasks" defaultOpen>
              <div className="flex flex-wrap gap-1.5">
                {HF_TASK_GROUPS.flatMap((g) => g.tasks).slice(0, 12).map((task) => (
                  <Chip
                    key={task.id}
                    active={selectedTasks.includes(task.id)}
                    onClick={() => setSelectedTasks(toggleValue(selectedTasks, task.id))}
                  >
                    <span>{task.icon}</span>
                    {task.label}
                  </Chip>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setSidebarTab('tasks')}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Browse all tasks →
              </button>
            </FilterSection>
          )
        )}

        {sidebarTab === 'main' && (
          <FilterSection title="Parameters">
            <ParamRangeSlider
              minB={minParamsB}
              maxB={maxParamsB}
              onChange={(min, max) => {
                setMinParamsB(min);
                setMaxParamsB(max);
              }}
            />
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'libraries') && (
          <FilterSection title="Libraries">
            <div className="flex flex-wrap gap-1.5">
              {(availableLibraries.length ? availableLibraries : HF_LIBRARIES).map((lib) => (
                <Chip
                  key={lib}
                  active={selectedLibraries.includes(lib)}
                  onClick={() => setSelectedLibraries(toggleValue(selectedLibraries, lib))}
                >
                  {lib}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'languages') && (
          <FilterSection title="Languages" defaultOpen={sidebarTab === 'languages'}>
            <div className="flex flex-wrap gap-1.5">
              {['en', 'zh', 'multilingual', 'es', 'fr', 'de', 'ja', 'ko', 'ru', 'ar', 'hi', 'pt'].map((lang) => (
                <Chip
                  key={lang}
                  active={selectedLanguages.includes(lang)}
                  onClick={() => setSelectedLanguages(toggleValue(selectedLanguages, lang))}
                >
                  {lang}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'licenses') && (
          <FilterSection title="Licenses">
            <div className="flex flex-wrap gap-1.5">
              {(availableLicenses.length ? availableLicenses : ['apache-2.0', 'mit', 'llama2', 'openrail']).map(
                (license) => (
                  <Chip
                    key={license}
                    active={selectedLicenses.includes(license)}
                    onClick={() => setSelectedLicenses(toggleValue(selectedLicenses, license))}
                  >
                    {license}
                  </Chip>
                )
              )}
            </div>
          </FilterSection>
        )}

        {sidebarTab === 'other' && (
          <>
            <FilterSection title="Model Tree">
              <div className="flex flex-wrap gap-1.5">
                {HF_MODEL_TREE.map((item) => (
                  <Chip
                    key={item.id}
                    active={selectedModelTree.includes(item.id)}
                    onClick={() => setSelectedModelTree(toggleValue(selectedModelTree, item.id))}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Apps">
              <div className="flex flex-wrap gap-1.5">
                {HF_APPS.map((app) => (
                  <Chip
                    key={app}
                    active={selectedApps.includes(app)}
                    onClick={() => setSelectedApps(toggleValue(selectedApps, app))}
                  >
                    {app}
                  </Chip>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Inference Providers"
              action={
                <button
                  type="button"
                  className="text-[11px] text-red-600"
                  onClick={() => setSelectedProviders([...HF_PROVIDERS])}
                >
                  Select all
                </button>
              }
            >
              <div className="flex flex-wrap gap-1.5">
                {HF_PROVIDERS.map((provider) => (
                  <Chip
                    key={provider}
                    active={selectedProviders.includes(provider)}
                    onClick={() => setSelectedProviders(toggleValue(selectedProviders, provider))}
                  >
                    {provider}
                  </Chip>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Misc">
              <div className="flex flex-wrap gap-1.5">
                {HF_MISC.map((item) => (
                  <Chip
                    key={item}
                    active={selectedMisc.includes(item)}
                    onClick={() => setSelectedMisc(toggleValue(selectedMisc, item))}
                  >
                    {item.replace(/_/g, ' ')}
                  </Chip>
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'other') && sidebarTab !== 'other' && (
          <>
            <FilterSection title="Organization" defaultOpen={false}>
              <input
                type="text"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                list="org-options"
                placeholder="Filter by organization..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <datalist id="org-options">
                {availableOrgs.map((org) => (
                  <option key={org} value={org} />
                ))}
              </datalist>
            </FilterSection>

            {availableArchitectures.length > 0 && (
              <FilterSection title="Architecture" defaultOpen={false}>
                <div className="flex flex-wrap gap-1.5">
                  {availableArchitectures.slice(0, 16).map((arch) => (
                    <Chip
                      key={arch}
                      active={selectedArchitecture === arch}
                      onClick={() =>
                        setSelectedArchitecture(selectedArchitecture === arch ? '' : arch)
                      }
                    >
                      {arch}
                    </Chip>
                  ))}
                </div>
              </FilterSection>
            )}

            <FilterSection title="Other shortcuts" defaultOpen={false}>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Featured only
              </label>
              <button
                type="button"
                onClick={() => setSidebarTab('other')}
                className="text-xs text-red-600"
              >
                Open Model Tree / Apps / Providers →
              </button>
            </FilterSection>
          </>
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
                  <option value="downloads">Trending</option>
                  <option value="created_at">Newest</option>
                  <option value="rating">Top rated</option>
                  <option value="name">Name</option>
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

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              {loading ? 'Loading models...' : (
                <>Models <span className="font-semibold text-gray-900">{models.length.toLocaleString()}</span></>
              )}
            </p>
            <Link
              href="/models/compare"
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              <FaChartLine />
              Compare
            </Link>
          </div>

          {loading && models.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaFilter className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No models match these filters.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-red-600 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      {model.logo_url ? (
                        <img src={model.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <FaBrain className="text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{model.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{model.developer || 'Unknown org'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                    {model.description && model.description !== 'No description available'
                      ? model.description
                      : 'No description available'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {model.model_type || 'general'}
                    </span>
                    {model.parameters && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                        {model.parameters}
                      </span>
                    )}
                    {model.license && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                        {model.license}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1">
                      <FaDownload /> {formatNumber(model.download_count || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FaStar className="text-yellow-400" /> {formatRating(model.rating)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-red-600">
                      <FaEye /> Details
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {models.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    {model.logo_url ? (
                      <img src={model.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <FaBrain className="text-red-600 text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{model.name}</h3>
                        <p className="text-sm text-gray-500">{model.developer}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                        <FaStar className="text-yellow-400" /> {formatRating(model.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {model.description && model.description !== 'No description available'
                        ? model.description
                        : 'No description available'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">{model.model_type || 'general'}</span>
                      {model.parameters && <span>{model.parameters}</span>}
                      {model.license && <span>{model.license}</span>}
                      <span className="inline-flex items-center gap-1 ml-auto">
                        <FaDownload /> {formatNumber(model.download_count || 0)}
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
