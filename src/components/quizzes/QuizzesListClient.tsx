'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaClipboardList,
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
  FaQuestionCircle,
} from 'react-icons/fa';
import type { Quiz, QuizCategory } from '@/types/quiz';

type SidebarTab = 'main' | 'categories' | 'levels' | 'other';

const LEVELS = [
  { id: 'Beginner', label: 'Beginner' },
  { id: 'Intermediate', label: 'Intermediate' },
  { id: 'Advanced', label: 'Advanced' },
];

const TOPIC_PRESETS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'machine-learning', label: 'Machine Learning', icon: '🧠' },
  { id: 'deep-learning', label: 'Deep Learning', icon: '🕸️' },
  { id: 'nlp', label: 'NLP', icon: '💬' },
  { id: 'computer-vision', label: 'Computer Vision', icon: '👁️' },
  { id: 'data-science', label: 'Data Science', icon: '📊' },
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

function difficultyClass(difficulty?: string) {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-50 text-green-700';
    case 'Intermediate':
      return 'bg-yellow-50 text-yellow-700';
    case 'Advanced':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export default function QuizzesListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<QuizCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('main');
  const [categorySearch, setCategorySearch] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    (searchParams.get('category') || '').split(',').filter(Boolean)
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    (searchParams.get('level') || '').split(',').filter(Boolean)
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchQuizzes(1);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchQuizzes(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedLevels, sortBy, sortOrder, page]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/quizzes/categories');
      if (!response.ok) return;
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Failed to load quiz categories:', err);
    }
  };

  const fetchQuizzes = async (pageNum = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pageNum));
      params.set('limit', '12');
      if (search) params.set('search', search);
      if (selectedLevels.length === 1) params.set('difficulty', selectedLevels[0]);
      if (selectedCategories.length === 1) params.set('category', selectedCategories[0]);
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);

      const response = await fetch(`/api/quizzes?${params.toString()}`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch quizzes');
      }

      let list: Quiz[] = data.quizzes || [];

      // Client-side multi-select when API only supports one value
      if (selectedLevels.length > 1) {
        list = list.filter((q) => q.difficulty && selectedLevels.includes(q.difficulty));
      }
      if (selectedCategories.length > 1) {
        list = list.filter((q) =>
          (q.category_names || []).some((name) => {
            const cat = categories.find((c) => c.name === name);
            return cat && selectedCategories.includes(cat.slug);
          })
        );
      }

      setQuizzes(list);
      setPagination({
        total: data.pagination?.total || list.length,
        page: data.pagination?.page || pageNum,
        limit: data.pagination?.limit || 12,
        pages: data.pagination?.pages || 1,
      });
      if (list.length === 0 && data.message) {
        setError(data.message);
      } else {
        setError(null);
      }

      const urlParams = new URLSearchParams();
      if (search) urlParams.set('search', search);
      if (selectedCategories.length) urlParams.set('category', selectedCategories.join(','));
      if (selectedLevels.length) urlParams.set('level', selectedLevels.join(','));
      urlParams.set('sort', sortBy);
      urlParams.set('order', sortOrder);
      if (pageNum > 1) urlParams.set('page', String(pageNum));
      router.replace(`/quizzes?${urlParams.toString()}`, { scroll: false });
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setQuizzes([]);
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSortBy('created_at');
    setSortOrder('desc');
    setPage(1);
  };

  const activeFilterCount =
    selectedCategories.length + selectedLevels.length + (search ? 1 : 0);

  const filteredCategoryOptions = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    const source =
      categories.length > 0
        ? categories
        : TOPIC_PRESETS.map((t) => ({ id: 0, name: t.label, slug: t.id, quiz_count: 0 }));
    return source.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, categorySearch]);

  const sidebar = (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {(
          [
            ['main', 'Main'],
            ['categories', 'Topics'],
            ['levels', 'Levels'],
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
                placeholder="Filter topics..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
          </div>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'categories') && (
          <FilterSection title="Categories" defaultOpen>
            <div className="flex flex-wrap gap-1.5">
              {filteredCategoryOptions.map((cat) => {
                const preset = TOPIC_PRESETS.find((t) => t.id === cat.slug);
                return (
                  <Chip
                    key={cat.slug}
                    active={selectedCategories.includes(cat.slug)}
                    onClick={() => {
                      setSelectedCategories(toggleValue(selectedCategories, cat.slug));
                      setPage(1);
                    }}
                  >
                    {preset?.icon ? <span>{preset.icon}</span> : null}
                    {cat.name}
                    {typeof cat.quiz_count === 'number' && cat.quiz_count > 0
                      ? ` (${cat.quiz_count})`
                      : ''}
                  </Chip>
                );
              })}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'levels') && (
          <FilterSection title="Difficulty" defaultOpen>
            <div className="flex flex-wrap gap-1.5">
              {LEVELS.map((level) => (
                <Chip
                  key={level.id}
                  active={selectedLevels.includes(level.id)}
                  onClick={() => {
                    setSelectedLevels(toggleValue(selectedLevels, level.id));
                    setPage(1);
                  }}
                >
                  {level.label}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'other') && (
          <FilterSection title="Tips" defaultOpen={sidebarTab === 'other'}>
            <p className="text-xs text-gray-600 leading-relaxed">
              Filter by topic and difficulty, then open a quiz to start practicing.
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
                  placeholder="Search quizzes..."
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
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm"
                >
                  <option value="created_at">Newest</option>
                  <option value="title">Title</option>
                  <option value="difficulty">Difficulty</option>
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
              'Loading quizzes...'
            ) : (
              <>
                Quizzes{' '}
                <span className="font-semibold text-gray-900">
                  {(pagination.total || quizzes.length).toLocaleString()}
                </span>
              </>
            )}
          </p>

          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">Quiz catalog is empty or unavailable</p>
              <p className="mt-1 text-amber-800">
                {error}. Publish quizzes from admin once the quiz schema is set up.
              </p>
            </div>
          )}

          {loading && quizzes.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
            </div>
          ) : quizzes.length === 0 && !error ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaFilter className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No quizzes match these filters.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-red-600 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : quizzes.length === 0 ? null : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="h-28 bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center">
                    <FaClipboardList className="text-red-400 text-3xl" />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {quiz.difficulty && (
                        <span className={`px-2 py-0.5 rounded text-xs ${difficultyClass(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                      )}
                      {(quiz.category_names || []).slice(0, 1).map((name) => (
                        <span key={name} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {name}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                      {quiz.description || 'Test your knowledge with this quiz.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1">
                        <FaQuestionCircle /> {quiz.question_count || 0} Qs
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FaClock /> {quiz.estimated_time || '—'} min
                      </span>
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <FaEye /> Take quiz
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz.id}
                  href={`/quizzes/${quiz.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FaClipboardList className="text-red-600 text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{quiz.title}</h3>
                        <p className="text-sm text-gray-500">
                          {quiz.difficulty || 'All levels'}
                          {(quiz.category_names || [])[0] ? ` · ${quiz.category_names![0]}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {quiz.question_count || 0} questions
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {quiz.description || 'Test your knowledge with this quiz.'}
                    </p>
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
        </div>
      </div>
    </div>
  );
}
