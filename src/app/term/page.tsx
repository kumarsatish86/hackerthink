'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Skip static generation for this page
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

interface Term {
  id: string;
  term: string;
  slug: string;
  definition: string;
  category: string;
  related_terms?: string[];
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface FiltersData {
  categories: string[];
  letters: string[];
}

// Search params client component
function SearchParamsHandler({ onParamsChange }: { 
  onParamsChange: (params: { 
    category: string; 
    letter: string; 
    search: string; 
    page: number 
  }) => void 
}) {
  const searchParams = useSearchParams();
  
  // Get query parameters
  const currentCategory = searchParams.get('category') || '';
  const currentLetter = searchParams.get('letter') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  useEffect(() => {
    onParamsChange({
      category: currentCategory,
      letter: currentLetter,
      search: currentSearch,
      page: currentPage
    });
  }, [searchParams, onParamsChange]);
  
  return null;
}

export default function GlossaryPage() {
  const router = useRouter();
  
  const [terms, setTerms] = useState<Term[]>([]);
  const [filters, setFilters] = useState<FiltersData>({
    categories: [],
    letters: []
  });
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 50
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  
  // Store current query parameters in state
  const [queryParams, setQueryParams] = useState({
    category: '',
    letter: '',
    search: '',
    page: 1
  });

  // Featured glossary categories
  const featuredCategories = [
    { name: 'Linux Commands', count: 120, icon: '⌨️' },
    { name: 'Networking', count: 85, icon: '🌐' },
    { name: 'Security', count: 75, icon: '🔒' },
    { name: 'Cloud Computing', count: 60, icon: '☁️' },
    { name: 'DevOps', count: 55, icon: '🔄' },
    { name: 'Containers', count: 50, icon: '📦' },
  ];

  // Popular terms
  const popularTerms = [
    'Kernel', 'Shell', 'SSH', 'DHCP', 'IP Address', 'DNS', 
    'Firewall', 'Docker', 'Kubernetes', 'Container', 'LVM',
    'Daemon', 'Process', 'VPN', 'NAT', 'Routing'
  ];

  const fetchTerms = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      let queryString = `?page=${queryParams.page}`;
      if (queryParams.category) queryString += `&category=${encodeURIComponent(queryParams.category)}`;
      if (queryParams.letter) queryString += `&letter=${encodeURIComponent(queryParams.letter)}`;
      if (queryParams.search) queryString += `&search=${encodeURIComponent(queryParams.search)}`;
      
      const response = await fetch(`/api/term${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch glossary terms');
      }
      
      const data = await response.json();
      setTerms(data.terms);
      setPagination(data.pagination);
      setFilters(data.filters);
    } catch (err) {
      console.error('Error fetching terms:', err);
      setError('Failed to load glossary terms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
    setSearchValue(queryParams.search);
  }, [queryParams]);

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams();
    if (category !== queryParams.category) params.set('category', category);
    if (queryParams.letter) params.set('letter', queryParams.letter);
    if (queryParams.search) params.set('search', queryParams.search);
    
    router.push(`/term?${params.toString()}`);
  };

  const handleLetterFilter = (letter: string) => {
    const params = new URLSearchParams();
    if (queryParams.category) params.set('category', queryParams.category);
    if (letter !== queryParams.letter) params.set('letter', letter);
    if (queryParams.search) params.set('search', queryParams.search);
    
    router.push(`/term?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchTerm = formData.get('search') as string;
    
    const params = new URLSearchParams();
    if (queryParams.category) params.set('category', queryParams.category);
    if (queryParams.letter) params.set('letter', queryParams.letter);
    if (searchTerm) params.set('search', searchTerm);
    
    router.push(`/term?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (queryParams.category) params.set('category', queryParams.category);
    if (queryParams.letter) params.set('letter', queryParams.letter);
    if (queryParams.search) params.set('search', queryParams.search);
    params.set('page', page.toString());
    
    router.push(`/term?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/term');
  };

  return (
    <div className="bg-white w-full overflow-hidden">
      {/* SearchParams with Suspense boundary */}
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsChange={setQueryParams} />
      </Suspense>
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 to-teal-800 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-full h-full opacity-20" 
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' }}>
          </div>
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-800 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            IT Terminology Glossary
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Clear explanations of technical terms and concepts in Linux, networking, and cloud technologies
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                name="search"
                id="hero-search"
                className="w-full py-4 pl-6 pr-20 text-gray-700 bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
                placeholder="Search IT terms..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white font-medium rounded-r-full hover:bg-blue-700 transition duration-200"
              >
                Search
              </button>
            </form>
          </div>
          
          {/* Popular Terms */}
          <div className="mt-10">
            <div className="text-blue-100 text-sm mb-3">Popular Terms:</div>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTerms.map((term, index) => (
                <Link 
                  key={index}
                  href={`/term?search=${encodeURIComponent(term)}`}
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Category Cards Section */}
      <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">Browse by Category</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive collection of IT terminology organized by topic
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => (
              <div 
                key={index} 
                onClick={() => handleCategoryFilter(category.name)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mr-4">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count} terms</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Explore {category.name.toLowerCase()} terminology and concepts
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar with filters */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Refine Your Search</h2>
                
                {/* Search form */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      id="sidebar-search"
                      className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                      placeholder="Search terms..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </form>
                
                {/* Categories filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {filters.categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`block text-sm truncate w-full text-left rounded-md py-1 px-2 hover:bg-gray-100 ${
                          category === queryParams.category
                            ? 'text-blue-600 font-medium bg-blue-50'
                            : 'text-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Alphabetical filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Browse by letter</h3>
                  <div className="flex flex-wrap gap-2">
                    {filters.letters.map((letter) => (
                      <button
                        key={letter}
                        onClick={() => handleLetterFilter(letter)}
                        className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md ${
                          letter === queryParams.letter
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-600'
                        }`}
                      >
                        {letter}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Clear filters */}
                {(queryParams.category || queryParams.letter || queryParams.search) && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
            
            {/* Main content */}
            <div className="lg:col-span-3">
              {/* Active filters display */}
              {(queryParams.category || queryParams.letter || queryParams.search) && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-700">Active filters:</span>
                  
                  {queryParams.category && (
                    <span className="inline-flex rounded-full items-center py-1 pl-3 pr-1 text-sm font-medium bg-blue-100 text-blue-800">
                      Category: {queryParams.category}
                      <button
                        type="button"
                        onClick={() => handleCategoryFilter('')}
                        className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  
                  {queryParams.letter && (
                    <span className="inline-flex rounded-full items-center py-1 pl-3 pr-1 text-sm font-medium bg-blue-100 text-blue-800">
                      Letter: {queryParams.letter}
                      <button
                        type="button"
                        onClick={() => handleLetterFilter('')}
                        className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                  
                  {queryParams.search && (
                    <span className="inline-flex rounded-full items-center py-1 pl-3 pr-1 text-sm font-medium bg-blue-100 text-blue-800">
                      Search: {queryParams.search}
                      <button
                        type="button"
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (queryParams.category) params.set('category', queryParams.category);
                          if (queryParams.letter) params.set('letter', queryParams.letter);
                          router.push(`/term?${params.toString()}`);
                        }}
                        className="flex-shrink-0 ml-0.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                      >
                        <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              )}
              
              {/* Terms list */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : terms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No terms found</h3>
                  <p className="mt-1 text-gray-500">
                    Try changing your search criteria or clear the filters to see all terms.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {terms.map((term) => (
                      <div key={term.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                        <Link href={`/term/${term.slug}`} className="block">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                                {term.term}
                              </h3>
                              <p className="text-sm text-blue-600 mb-2">{term.category}</p>
                              <p className="text-gray-600 text-sm md:text-base">
                                {term.definition.length > 200 
                                  ? `${term.definition.substring(0, 200)}...` 
                                  : term.definition
                                }
                              </p>
                              
                              {term.related_terms && term.related_terms.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {term.related_terms.map((relatedTerm, index) => (
                                    <Link 
                                      key={index}
                                      href={`/term?search=${encodeURIComponent(relatedTerm)}`}
                                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-md transition-colors duration-200"
                                    >
                                      {relatedTerm}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-4">
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                Read more
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Pagination */}
              {pagination.pages > 1 && !loading && !error && terms.length > 0 && (
                <div className="flex justify-center mt-8">
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Show limited page numbers with ellipsis if needed */}
                    {Array.from({ length: pagination.pages }).map((_, i) => {
                      const pageNumber = i + 1;
                      
                      // Always show first, last, current, and pages +/- 1 from current
                      if (
                        pageNumber === 1 ||
                        pageNumber === pagination.pages ||
                        (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              pagination.page === pageNumber
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                      
                      // Show ellipsis for gaps
                      if (
                        (pageNumber === 2 && pagination.page > 3) ||
                        (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                      ) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.pages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Download Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 md:grid md:grid-cols-5 gap-8 items-center">
              <div className="md:col-span-3">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Download Our IT Glossary</h2>
                <p className="mt-3 text-blue-100">
                  Get access to our comprehensive glossary of IT terms in PDF format for offline reference.
                  Perfect for study sessions and exam preparation.
                </p>
              </div>
              <div className="mt-8 md:mt-0 md:col-span-2">
                <form className="sm:flex">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-5 py-3 placeholder-gray-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white focus:outline-none rounded-md"
                    placeholder="Enter your email"
                  />
                  <button
                    type="submit"
                    className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto flex items-center justify-center py-3 px-5 rounded-md shadow bg-white text-blue-700 font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-700 focus:ring-white"
                  >
                    Download
                  </button>
                </form>
                <p className="mt-3 text-sm text-blue-100">
                  No spam ever. We'll only send you the PDF download link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contribute Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Help Us Improve Our Glossary</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Do you have expertise in IT terminology? We welcome contributions to make our glossary even better.
            </p>
            <div className="mt-8">
              <Link
                href="/contribute"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Suggest a Term
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 