'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaGraduationCap,
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
  FaStar,
  FaUser,
} from 'react-icons/fa';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  featured_image?: string;
  level: string;
  duration: number;
  price: number;
  discount_price: number | null;
  author_name?: string;
  is_featured: boolean;
  category?: string;
  rating?: number;
  students_count?: number;
  lesson_count?: number;
  section_count?: number;
}

type SidebarTab = 'main' | 'topics' | 'levels' | 'pricing' | 'other';

const COURSE_TOPICS: Array<{ id: string; label: string; icon: string }> = [
  { id: 'machine-learning', label: 'Machine Learning', icon: '🧠' },
  { id: 'deep-learning', label: 'Deep Learning', icon: '🕸️' },
  { id: 'nlp', label: 'NLP', icon: '💬' },
  { id: 'computer-vision', label: 'Computer Vision', icon: '👁️' },
  { id: 'data-science', label: 'Data Science', icon: '📊' },
  { id: 'ai-ethics', label: 'AI Ethics', icon: '⚖️' },
  { id: 'mlops', label: 'MLOps', icon: '⚙️' },
  { id: 'general', label: 'General AI', icon: '🤖' },
];

const LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const LEARNING_PATHS = [
  { id: 'ai-engineer', title: 'AI Engineer', courses: 8, duration: '60h', icon: '🤖' },
  { id: 'ml-scientist', title: 'ML Scientist', courses: 10, duration: '80h', icon: '🧠' },
  { id: 'data-scientist', title: 'Data Scientist', courses: 7, duration: '50h', icon: '📊' },
  { id: 'ai-researcher', title: 'AI Researcher', courses: 6, duration: '70h', icon: '🔬' },
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

function formatDuration(minutes: number): string {
  if (!minutes) return 'Self-paced';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

function topicLabel(id: string) {
  return COURSE_TOPICS.find((t) => t.id === id)?.label || id.replace(/-/g, ' ');
}

export default function CoursesListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('main');
  const [topicSearch, setTopicSearch] = useState('');

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    (searchParams.get('topic') || '').split(',').filter(Boolean)
  );
  const [selectedLevels, setSelectedLevels] = useState<string[]>(
    (searchParams.get('level') || '').split(',').filter(Boolean)
  );
  const [pricing, setPricing] = useState(searchParams.get('pricing') || 'all');
  const [featuredOnly, setFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );

  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopics, selectedLevels, pricing, featuredOnly, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedTopics.length) params.set('topic', selectedTopics.join(','));
      if (selectedLevels.length) params.set('level', selectedLevels.join(','));
      if (pricing !== 'all') params.set('pricing', pricing);
      if (featuredOnly) params.set('featured', 'true');
      params.set('sort', sortBy);
      params.set('order', sortOrder);

      const response = await fetch(`/api/courses?${params.toString()}`);
      const data = await response.json();
      setCourses(data.courses || []);
      if (data.filterOptions) {
        setAvailableTopics(data.filterOptions.topics || []);
        setAvailableLevels(data.filterOptions.levels || []);
      }

      router.push(`/courses?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedTopics([]);
    setSelectedLevels([]);
    setPricing('all');
    setFeaturedOnly(false);
    setSortBy('newest');
    setSortOrder('desc');
  };

  const activeFilterCount =
    selectedTopics.length +
    selectedLevels.length +
    (pricing !== 'all' ? 1 : 0) +
    (featuredOnly ? 1 : 0) +
    (search ? 1 : 0);

  const filteredTopicOptions = useMemo(() => {
    const q = topicSearch.trim().toLowerCase();
    const source = availableTopics.length ? availableTopics : COURSE_TOPICS.map((t) => t.id);
    return source.filter((id) => {
      const label = topicLabel(id).toLowerCase();
      return !q || id.includes(q) || label.includes(q);
    });
  }, [topicSearch, availableTopics]);

  const sidebar = (
    <aside className="bg-white border border-gray-200 rounded-xl overflow-hidden h-fit lg:sticky lg:top-24">
      <div className="flex border-b border-gray-100 overflow-x-auto">
        {(
          [
            ['main', 'Main'],
            ['topics', 'Topics'],
            ['levels', 'Levels'],
            ['pricing', 'Pricing'],
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
          sidebarTab === 'topics' ? (
            <div className="flex flex-wrap gap-1.5">
              {filteredTopicOptions.map((id) => {
                const meta = COURSE_TOPICS.find((t) => t.id === id);
                return (
                  <Chip
                    key={id}
                    active={selectedTopics.includes(id)}
                    onClick={() => setSelectedTopics(toggleValue(selectedTopics, id))}
                  >
                    {meta?.icon ? <span>{meta.icon}</span> : null}
                    {topicLabel(id)}
                  </Chip>
                );
              })}
            </div>
          ) : (
            <FilterSection title="Topics" defaultOpen>
              <div className="flex flex-wrap gap-1.5">
                {COURSE_TOPICS.slice(0, 8).map((topic) => (
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
              <button
                type="button"
                onClick={() => setSidebarTab('topics')}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Browse all topics →
              </button>
            </FilterSection>
          )
        )}

        {(sidebarTab === 'main' || sidebarTab === 'levels') && (
          <FilterSection title="Level" defaultOpen={sidebarTab === 'levels'}>
            <div className="flex flex-wrap gap-1.5">
              {(availableLevels.length ? availableLevels : LEVELS.map((l) => l.id)).map((id) => (
                <Chip
                  key={id}
                  active={selectedLevels.includes(id)}
                  onClick={() => setSelectedLevels(toggleValue(selectedLevels, id))}
                >
                  {LEVELS.find((l) => l.id === id)?.label || id}
                </Chip>
              ))}
            </div>
          </FilterSection>
        )}

        {(sidebarTab === 'main' || sidebarTab === 'pricing') && (
          <FilterSection title="Pricing" defaultOpen={sidebarTab === 'pricing'}>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'free', label: 'Free' },
                { id: 'paid', label: 'Paid' },
              ].map((opt) => (
                <Chip key={opt.id} active={pricing === opt.id} onClick={() => setPricing(opt.id)}>
                  {opt.label}
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
                checked={featuredOnly}
                onChange={(e) => setFeaturedOnly(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              Featured only
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
    <div className="space-y-6">
      {/* Learning paths strip */}
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Learning paths</h2>
          <p className="text-sm text-gray-600">Structured journeys across the catalog</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LEARNING_PATHS.map((path) => (
            <Link
              key={path.id}
              href={`/learning-paths/${path.id}`}
              className="bg-white border border-gray-200 rounded-xl p-3 hover:border-red-300 hover:shadow-sm transition-all"
            >
              <div className="text-xl mb-1">{path.icon}</div>
              <div className="font-medium text-gray-900 text-sm">{path.title}</div>
              <div className="text-xs text-gray-500 mt-1">
                {path.courses} courses · {path.duration}
              </div>
            </Link>
          ))}
        </div>
      </section>

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
                  <option value="newest">Newest</option>
                  <option value="title">Name</option>
                  <option value="duration">Duration</option>
                  <option value="level">Level</option>
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
              'Loading courses...'
            ) : (
              <>
                Courses{' '}
                <span className="font-semibold text-gray-900">{courses.length.toLocaleString()}</span>
              </>
            )}
          </p>

          {loading && courses.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FaFilter className="mx-auto w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-600 mb-2">No courses match these filters.</p>
              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="text-red-600 hover:underline text-sm">
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-red-300 hover:shadow-md transition-all h-full flex flex-col"
                >
                  <div className="h-32 bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center">
                    {course.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.featured_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaGraduationCap className="text-red-400 text-3xl" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs capitalize">
                        {course.level || 'all levels'}
                      </span>
                      {course.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {topicLabel(course.category)}
                        </span>
                      )}
                      {course.is_featured && (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">Featured</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-3">
                      {course.short_description || 'No description available.'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1">
                        <FaClock /> {formatDuration(Number(course.duration) || 0)}
                      </span>
                      <span className="inline-flex items-center gap-1 truncate max-w-[40%]">
                        <FaUser /> {course.author_name || 'HackerThink'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <FaEye /> Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {course.featured_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={course.featured_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaGraduationCap className="text-red-600 text-xl" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                        <p className="text-sm text-gray-500">
                          {course.author_name || 'HackerThink'} · {course.level || 'all levels'}
                        </p>
                      </div>
                      {course.rating != null && (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                          <FaStar className="text-yellow-400" /> {Number(course.rating).toFixed(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {course.short_description || 'No description available.'}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                      {course.category && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded">{topicLabel(course.category)}</span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <FaClock /> {formatDuration(Number(course.duration) || 0)}
                      </span>
                      {course.lesson_count != null && <span>{course.lesson_count} lessons</span>}
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
