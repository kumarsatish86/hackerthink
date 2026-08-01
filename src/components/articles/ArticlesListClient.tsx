'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaNewspaper,
  FaSearch,
  FaTimes,
  FaTh,
  FaList,
  FaEye,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaClock,
  FaUser,
} from 'react-icons/fa';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  created_at: string;
  author_name?: string;
  category?: string;
  reading_time?: number;
  featured_image?: string;
}

type SidebarTab = 'main' | 'topics' | 'other';

const ARTICLE_TOPICS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'analysis', label: 'Analysis', icon: '📊' },
  { id: 'insights', label: 'Insights', icon: '💡' },
  { id: 'trends', label: 'Trends', icon: '📈' },
  { id: 'industry', label: 'Industry', icon: '🏢' },
  { id: 'opinion', label: 'Opinion', icon: '✍️' },
  { id: 'machine-learning', label: 'Machine Learning', icon: '🧠' },
  { id: 'deep-learning', label: 'Deep Learning', icon: '🕸️' },
  { id: 'nlp', label: 'NLP', icon: '💬' },
  { id: 'ai-ethics', label: 'AI Ethics', icon: '⚖️' },
];

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

function topicLabel(id: string) {
  return ARTICLE_TOPICS.find((t) => t.id === id)?.label || id.replace(/-/g, ' ');
}

function inferTopic(article: Article): string {
  const explicit = (article.category || '').toLowerCase().replace(/\s+/g, '-');
  if (explicit && ARTICLE_TOPICS.some((t) => t.id === explicit)) return explicit;

  const haystack = `${article.title} ${article.excerpt || ''}`.toLowerCase();
  if (/ethic|safety|responsible/.test(haystack)) return 'ai-ethics';
  if (/nlp|language|llm|gpt|transformer/.test(haystack)) return 'nlp';
  if (/deep.?learning|neural|pytorch|tensorflow/.test(haystack)) return 'deep-learning';
  if (/machine.?learning|ml\b|model|parametric/.test(haystack)) return 'machine-learning';
  if (/trend|future|202\d/.test(haystack)) return 'trends';
  if (/industry|enterprise|business/.test(haystack)) return 'industry';
  if (/opinion|editorial|why we/.test(haystack)) return 'opinion';
  if (/research|paper|study/.test(haystack)) return 'research';
  if (/analysis|vs\.|compared|understanding/.test(haystack)) return 'analysis';
  return 'insights';
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ArticlesListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('main');
  const [topicSearch, setTopicSearch] = useState('');
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 12 });

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    (searchParams.get('topic') || '').split(',').filter(Boolean)
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    fetchArticles(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedTopics.length) params.set('topic', selectedTopics.join(','));
    params.set('sort', sortBy);
    if (page > 1) params.set('page', String(page));
    router.replace(`/articles?${params.toString()}`, { scroll: false });
  }, [search, selectedTopics, sortBy, page, router]);

  const fetchArticles = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/articles?page=${pageNum}&limit=24`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data.articles || []);
      setPagination(data.pagination || { total: 0, pages: 1, page: pageNum, limit: 24 });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTopics([]);
    setSortBy('newest');
    setPage(1);
  };

  const enriched = useMemo(
    () => articles.map((a) => ({ ...a, topic: inferTopic(a) })),
    [articles]
  );

  const filtered = useMemo(() => {
    let list = [...enriched];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt || '').toLowerCase().includes(q) ||
          (a.author_name || '').toLowerCase().includes(q)
      );
    }
    if (selectedTopics.length) {
      list = list.filter((a) => selectedTopics.includes(a.topic));
    }
    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [enriched, search, selectedTopics, sortBy]);

  const featured = filtered[0] || null;
  const rest = filtered.slice(1);

  const activeFilterCount = selectedTopics.length + (search ? 1 : 0);

  const filteredTopicOptions = useMemo(() => {
    const q = topicSearch.trim().toLowerCase();
    return ARTICLE_TOPICS.filter(
      (t) => !q || t.id.includes(q) || t.label.toLowerCase().includes(q)
    );
  }, [topicSearch]);

  const sidebar = (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {(
          [
            ['main', 'Main'],
            ['topics', 'Topics'],
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
        {sidebarTab === 'topics' && (
          <div className="mb-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Filter topics..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'topics') && (
          <FilterSection title="Topics" defaultOpen>
            <div className="flex flex-wrap gap-1.5">
              {filteredTopicOptions.map((topic) => (
                <Chip
                  key={topic.id}
                  active={selectedTopics.includes(topic.id)}
                  onClick={() => setSelectedTopics(toggleValue(selectedTopics, topic.id))}
                >
                  <span>{topic.icon}</span>
                  {topic.label}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'other') && (
          <FilterSection title="Tips" defaultOpen={sidebarTab === 'other'}>
            <p className="text-xs text-gray-600 leading-relaxed">
              Filter by topic, then open an article for the full write-up.
            </p>
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
    <div className="space-y-6">
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
                  placeholder="Search articles..."
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
                  <option value="newest">Newest</option>
                  <option value="title">Title</option>
                </select>
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
              'Loading articles...'
            ) : (
              <>
                Articles{' '}
                <span className="font-semibold text-gray-900">{filtered.length.toLocaleString()}</span>
              </>
            )}
          </p>

          {loading && articles.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaFilter className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No articles match these filters.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-red-600 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              {featured && (
                <Link
                  href={`/articles/${featured.slug}`}
                  className="block bg-white border border-gray-200 rounded-xl p-6 hover:border-red-300 hover:shadow-md transition-all"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                      Editor&apos;s Choice
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      {topicLabel(featured.topic)}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(featured.created_at)}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{featured.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {featured.excerpt || 'Read the full article on HackerThink.'}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <FaUser /> {featured.author_name || 'HackerThink'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                      <FaEye /> Read article
                    </span>
                  </div>
                </Link>
              )}

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col"
                    >
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {topicLabel(article.topic)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                        {article.excerpt || 'No excerpt available.'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1 truncate max-w-[50%]">
                          <FaUser /> {article.author_name || 'HackerThink'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <FaClock /> {formatDate(article.created_at)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {rest.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex gap-4"
                    >
                      <div className="w-14 h-14 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <FaNewspaper className="text-red-600 text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{article.title}</h3>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {article.excerpt || 'No excerpt available.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-100 rounded">{topicLabel(article.topic)}</span>
                          <span className="inline-flex items-center gap-1">
                            <FaUser /> {article.author_name || 'HackerThink'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page >= pagination.pages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
