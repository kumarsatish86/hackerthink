'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaDatabase,
  FaDownload,
  FaStar,
  FaSearch,
  FaTimes,
  FaTh,
  FaList,
  FaEye,
  FaChartLine,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaBars,
} from 'react-icons/fa';
import {
  DATASET_ETHICS,
  DATASET_FORMATS,
  DATASET_LANGUAGES,
  DATASET_MODALITIES,
} from '@/lib/datasets/datasetTaxonomy';

interface Dataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  description?: string;
  dataset_type?: string;
  modality?: string;
  format?: string;
  size?: string;
  rating: number;
  rating_count: number;
  download_count: number;
  logo_url?: string;
  domain?: string;
  license?: string;
  language?: string;
  languages?: string[];
}

type SidebarTab = 'main' | 'types' | 'formats' | 'languages' | 'licenses' | 'other';

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

export default function DatasetsListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('main');
  const [typeSearch, setTypeSearch] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    (searchParams.get('dataset_type') || '').split(',').filter(Boolean)
  );
  const [selectedModalities, setSelectedModalities] = useState<string[]>(
    (searchParams.get('modality') || '').split(',').filter(Boolean)
  );
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    (searchParams.get('domain') || '').split(',').filter(Boolean)
  );
  const [selectedFormats, setSelectedFormats] = useState<string[]>(
    (searchParams.get('format') || '').split(',').filter(Boolean)
  );
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>(
    (searchParams.get('license') || '').split(',').filter(Boolean)
  );
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    (searchParams.get('language') || '').split(',').filter(Boolean)
  );
  const [selectedEthics, setSelectedEthics] = useState<string[]>(
    (searchParams.get('ethics') || '').split(',').filter(Boolean)
  );
  const [selectedOrg, setSelectedOrg] = useState(searchParams.get('organization') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'downloads');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );

  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<string[]>([]);
  const [availableFormats, setAvailableFormats] = useState<string[]>(DATASET_FORMATS);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableOrgs, setAvailableOrgs] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

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

  const filteredTypes = useMemo(() => {
    const q = typeSearch.trim().toLowerCase();
    const source = availableTypes.length ? availableTypes : DATASET_MODALITIES.map((m) => m.id);
    return source.filter((t) => !q || t.toLowerCase().includes(q));
  }, [typeSearch, availableTypes]);

  useEffect(() => {
    fetchDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTypes,
    selectedModalities,
    selectedDomains,
    selectedFormats,
    selectedLicenses,
    selectedLanguages,
    selectedEthics,
    selectedOrg,
    selectedYear,
    featuredOnly,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDatasets(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', 'published');
      params.set('limit', '100');
      if (search) params.set('search', search);
      if (selectedTypes.length) params.set('dataset_type', selectedTypes.join(','));
      if (selectedModalities.length) params.set('modality', selectedModalities.join(','));
      if (selectedDomains.length) params.set('domain', selectedDomains.join(','));
      if (selectedFormats.length) params.set('format', selectedFormats.join(','));
      if (selectedLicenses.length) params.set('license', selectedLicenses.join(','));
      if (selectedLanguages.length) params.set('language', selectedLanguages.join(','));
      if (selectedEthics.length) params.set('ethics', selectedEthics.join(','));
      if (selectedOrg) params.set('organization', selectedOrg);
      if (selectedYear) params.set('year', selectedYear);
      if (featuredOnly) params.set('featured', 'true');
      params.set('sort', sortBy);
      params.set('order', sortOrder);

      const response = await fetch(`/api/datasets?${params.toString()}`);
      const data = await response.json();

      setDatasets(data.datasets || []);
      setTotal(data.total || 0);
      if (data.filterOptions) {
        setAvailableTypes(data.filterOptions.datasetTypes || []);
        setAvailableDomains(data.filterOptions.domains || []);
        setAvailableLicenses(data.filterOptions.licenses || []);
        setAvailableFormats(
          data.filterOptions.formats?.length ? data.filterOptions.formats : DATASET_FORMATS
        );
        setAvailableYears(data.filterOptions.years || []);
        setAvailableOrgs(data.filterOptions.organizations || []);
      }

      const newParams = new URLSearchParams(params);
      newParams.delete('status');
      newParams.delete('limit');
      router.push(`/datasets?${newParams.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTypes([]);
    setSelectedModalities([]);
    setSelectedDomains([]);
    setSelectedFormats([]);
    setSelectedLicenses([]);
    setSelectedLanguages([]);
    setSelectedEthics([]);
    setSelectedOrg('');
    setSelectedYear('');
    setFeaturedOnly(false);
    setSortBy('downloads');
    setSortOrder('desc');
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedModalities.length +
    selectedDomains.length +
    selectedFormats.length +
    selectedLicenses.length +
    selectedLanguages.length +
    selectedEthics.length +
    (selectedOrg ? 1 : 0) +
    (selectedYear ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (search ? 1 : 0);

  const sidebar = (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {(
          [
            ['main', 'Main'],
            ['types', 'Types'],
            ['formats', 'Formats'],
            ['languages', 'Languages'],
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
        {sidebarTab === 'types' && (
          <div className="mb-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={typeSearch}
                onChange={(e) => setTypeSearch(e.target.value)}
                placeholder="Filter types by name"
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'types') && (
          sidebarTab === 'types' ? (
            <div className="flex flex-wrap gap-1.5">
              {filteredTypes.map((type) => (
                <Chip
                  key={type}
                  active={selectedTypes.includes(type)}
                  onClick={() => setSelectedTypes(toggleValue(selectedTypes, type))}
                >
                  {type}
                </Chip>
              ))}
              {!filteredTypes.length && (
                <p className="text-xs text-gray-500">No types match this filter.</p>
              )}
            </div>
          ) : (
            <>
              <FilterSection title="Modality" defaultOpen>
                <div className="flex flex-wrap gap-1.5">
                  {DATASET_MODALITIES.map((mod) => (
                    <Chip
                      key={mod.id}
                      active={selectedModalities.includes(mod.id)}
                      onClick={() => setSelectedModalities(toggleValue(selectedModalities, mod.id))}
                    >
                      <span>{mod.icon}</span>
                      {mod.label}
                    </Chip>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Types">
                <div className="flex flex-wrap gap-1.5">
                  {(availableTypes.length ? availableTypes : DATASET_MODALITIES.map((m) => m.id))
                    .slice(0, 12)
                    .map((type) => (
                      <Chip
                        key={type}
                        active={selectedTypes.includes(type)}
                        onClick={() => setSelectedTypes(toggleValue(selectedTypes, type))}
                      >
                        {type}
                      </Chip>
                    ))}
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarTab('types')}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Browse all types →
                </button>
              </FilterSection>
            </>
          )
        )}

        {(sidebarTab === 'main' || sidebarTab === 'formats') && (
          <FilterSection title="Formats" defaultOpen={sidebarTab === 'formats'}>
            <div className="flex flex-wrap gap-1.5">
              {(availableFormats.length ? availableFormats : DATASET_FORMATS).map((fmt) => (
                <Chip
                  key={fmt}
                  active={selectedFormats.includes(fmt)}
                  onClick={() => setSelectedFormats(toggleValue(selectedFormats, fmt))}
                >
                  {fmt}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'languages') && (
          <FilterSection title="Languages" defaultOpen={sidebarTab === 'languages'}>
            <div className="flex flex-wrap gap-1.5">
              {DATASET_LANGUAGES.map((lang) => (
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
          <FilterSection title="Licenses" defaultOpen={sidebarTab === 'licenses'}>
            <div className="flex flex-wrap gap-1.5">
              {(availableLicenses.length
                ? availableLicenses
                : ['apache-2.0', 'mit', 'cc-by-4.0', 'cc0-1.0', 'unknown']
              ).map((license) => (
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

        {sidebarTab === 'other' && (
          <>
            <FilterSection title="Domain">
              <div className="flex flex-wrap gap-1.5">
                {(availableDomains.length ? availableDomains : ['nlp', 'vision', 'audio', 'general'])
                  .slice(0, 20)
                  .map((domain) => (
                    <Chip
                      key={domain}
                      active={selectedDomains.includes(domain)}
                      onClick={() => setSelectedDomains(toggleValue(selectedDomains, domain))}
                    >
                      {domain}
                    </Chip>
                  ))}
              </div>
            </FilterSection>

            <FilterSection title="Ethics & licensing">
              <div className="flex flex-wrap gap-1.5">
                {DATASET_ETHICS.map((item) => (
                  <Chip
                    key={item.id}
                    active={selectedEthics.includes(item.id)}
                    onClick={() => setSelectedEthics(toggleValue(selectedEthics, item.id))}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Release year" defaultOpen={false}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Any year</option>
                {availableYears.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
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
                list="dataset-org-options"
                placeholder="Filter by organization..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <datalist id="dataset-org-options">
                {availableOrgs.map((org) => (
                  <option key={org} value={org} />
                ))}
              </datalist>
            </FilterSection>

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
                Open Domains / Ethics / Year →
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
                  <option value="quality_score">Quality</option>
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
              {loading ? (
                'Loading datasets...'
              ) : (
                <>
                  Datasets{' '}
                  <span className="font-semibold text-gray-900">
                    {(total || datasets.length).toLocaleString()}
                  </span>
                </>
              )}
            </p>
            <Link
              href="/datasets/compare"
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              <FaChartLine />
              Compare
            </Link>
          </div>

          {loading && datasets.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
            </div>
          ) : datasets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaFilter className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No datasets match these filters.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-red-600 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {datasets.map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      {dataset.logo_url ? (
                        <img src={dataset.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <FaDatabase className="text-red-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{dataset.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{dataset.provider || 'Unknown org'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                    {dataset.description || 'No description available.'}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                      {dataset.modality || dataset.dataset_type || 'general'}
                    </span>
                    {dataset.size && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                        {dataset.size}
                      </span>
                    )}
                    {dataset.license && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                        {dataset.license}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1">
                      <FaDownload /> {formatNumber(dataset.download_count || 0)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FaStar className="text-yellow-400" /> {formatRating(dataset.rating)}
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
              {datasets.map((dataset) => (
                <Link
                  key={dataset.id}
                  href={`/datasets/${dataset.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex gap-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    {dataset.logo_url ? (
                      <img src={dataset.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <FaDatabase className="text-red-600 text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{dataset.name}</h3>
                        <p className="text-sm text-gray-500">{dataset.provider}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                        <FaStar className="text-yellow-400" /> {formatRating(dataset.rating)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {dataset.description || 'No description available.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {dataset.modality || dataset.dataset_type || 'general'}
                      </span>
                      {dataset.format && <span>{dataset.format}</span>}
                      {dataset.license && <span>{dataset.license}</span>}
                      <span className="inline-flex items-center gap-1 ml-auto">
                        <FaDownload /> {formatNumber(dataset.download_count || 0)}
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
