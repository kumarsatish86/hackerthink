'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [siteSettings, setSiteSettings] = useState<{
    logo_path?: string;
    site_name?: string;
  }>({
    logo_path: '',
    site_name: 'HackerThink'
  });
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [breakingNews, setBreakingNews] = useState<Array<{ title: string; slug: string; sourceType?: string }>>([]);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch site settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        // Use the dynamic fetch helper
        const { fetchSiteSettings } = await import('@/lib/dynamicConfig');
        const settings = await fetchSiteSettings(['logo_path', 'site_name']);
        
        setSiteSettings({
          logo_path: settings.logo_path || '',
          site_name: settings.site_name || 'HackerThink'
        });
      } catch (error) {
        console.error('Error fetching site settings:', error);
      }
    }
    
    fetchSettings();
  }, []);

  // Fetch breaking news for ticker
  useEffect(() => {
    async function fetchBreakingNews() {
      try {
        const response = await fetch('/api/home');
        if (response.ok) {
          const data = await response.json();
          // Get the latest 3-5 breaking news items (top story + breaking news)
          const breakingItems = [
            ...(data.topStory ? [data.topStory] : []),
            ...(data.breakingNews || []).slice(0, 4)
          ].slice(0, 5);
          
          setBreakingNews(breakingItems.map((item: any) => ({
            title: item.title,
            slug: item.slug,
            sourceType: item.sourceType || 'article'
          })));
        }
      } catch (error) {
        console.error('Error fetching breaking news:', error);
        // Fallback to empty array or default headlines
        setBreakingNews([]);
      }
    }
    
    fetchBreakingNews();
  }, []);

  const navigation = [
    { name: 'Breaking', href: '/news/breaking', isBreaking: true },
    { name: 'Tech', href: '/news/tech' },
    { name: 'Business', href: '/news/business' },
    { name: 'Research', href: '/news/research' },
    { name: 'Opinion', href: '/news/opinion' },
    { name: 'World', href: '/news/world' },
    { name: 'Articles', href: '/articles' },
    { name: 'More', href: '#', isDropdown: true },
  ];

  const moreItems = [
    { name: 'AI Tools', href: '/tools' },
    { name: 'AI Courses', href: '/courses' },
    { name: 'Quizzes', href: '/quizzes' },
    { name: 'Tutorials', href: '/tutorials' },
    { name: 'AI Models', href: '/models' },
    { name: 'Datasets', href: '/datasets' },
    { name: 'AI Commands', href: '/commands' },
    { name: 'Community', href: '/community' },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-black text-white py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-3">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-red-600 px-1.5 py-0.5 text-xs font-bold">LIVE</span>
              <span>AI News Wire</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-black bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                HackerThink
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8 hidden md:flex md:items-center">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="relative w-full"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search AI news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    e.preventDefault();
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
              />
            </form>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Subscribe Button */}
            <Link
              href="/subscribe"
              className="hidden md:inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
            >
              Subscribe
            </Link>
            
            {session ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center focus:outline-none"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Open user menu</span>
                  <span className="text-sm text-gray-700 mr-2 hidden md:block">{session.user?.name}</span>
                  {session.user?.image ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={session.user.image}
                      alt=""
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                      {session.user?.name?.[0]}
                    </div>
                  )}
                </button>
                
                {/* Dropdown menu */}
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {session.user?.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        signOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-1.5 text-sm font-medium"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        
          {/* Navigation Bar */}
          <div className="border-t border-gray-200">
            <div className="flex justify-center">
              <div className="hidden md:flex md:items-center md:space-x-8 py-2">
              {navigation.map((item) => (
                item.isDropdown ? (
                  <div key={item.name} className="relative flex items-center h-full" ref={moreDropdownRef}>
                    <button
                      onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                      className={`${
                        moreItems.some(moreItem => pathname === moreItem.href)
                          ? 'border-red-500 text-gray-900'
                          : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                      } inline-flex items-center px-4 py-1 text-sm font-medium`}
                      aria-expanded={isMoreDropdownOpen}
                      aria-haspopup="true"
                    >
                      {item.name}
                      <svg 
                        className={`ml-1 h-4 w-4 transition-transform ${isMoreDropdownOpen ? 'transform rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* More dropdown menu */}
                    {isMoreDropdownOpen && (
                      <div className="origin-top-right absolute right-0 top-full mt-1 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                        {moreItems.map((moreItem) => (
                          <Link
                            key={moreItem.name}
                            href={moreItem.href}
                            className={`${
                              pathname === moreItem.href
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            } block px-4 py-2 text-sm`}
                            onClick={() => setIsMoreDropdownOpen(false)}
                          >
                            {moreItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'border-red-500 text-gray-900'
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    } inline-flex items-center px-4 py-1 text-sm font-medium ${
                      item.isBreaking ? 'text-red-600 font-bold' : ''
                    }`}
                  >
                    {item.name}
                    {item.isBreaking && (
                      <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </Link>
                )
              ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Breaking News Ticker */}
      {breakingNews.length > 0 && (
        <div className="bg-red-600 text-white py-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <span className="bg-red-700 px-2 py-1 text-xs font-bold mr-3">BREAKING</span>
              <div className="flex-1 overflow-hidden relative">
                <div className="animate-marquee whitespace-nowrap text-sm">
                  {/* Duplicate content for seamless loop */}
                  {[...breakingNews, ...breakingNews].map((news, index) => (
                    <Link
                      key={index}
                      href={news.sourceType === 'news' ? `/news/${news.slug}` : `/articles/${news.slug}`}
                      className="mr-8 hover:underline inline-block"
                    >
                      {news.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-200">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setIsMenuOpen(false);
                }
              }}
              className="relative"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search AI news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm"
              />
            </form>
          </div>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              !item.isDropdown ? (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    item.isBreaking ? 'text-red-600 font-bold' : ''
                  }`}
                >
                  {item.name}
                  {item.isBreaking && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
                  )}
                </Link>
              ) : (
                <div key={item.name}>
                  <button
                    onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                    className={`${
                      moreItems.some(moreItem => pathname === moreItem.href)
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                    } w-full flex justify-between items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  >
                    {item.name}
                    <svg 
                      className={`h-5 w-5 transition-transform ${isMoreDropdownOpen ? 'transform rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMoreDropdownOpen && (
                    <div className="pl-4">
                      {moreItems.map((moreItem) => (
                        <Link
                          key={moreItem.name}
                          href={moreItem.href}
                          className={`${
                            pathname === moreItem.href
                              ? 'bg-red-50 border-red-500 text-red-700'
                              : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                          } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                        >
                          {moreItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session ? (
              <div className="space-y-1">
                <div className="flex items-center px-4 py-2">
                  {session.user?.image ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={session.user.image}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                      {session.user?.name?.[0]}
                    </div>
                  )}
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{session.user?.name}</div>
                    <div className="text-sm font-medium text-gray-500">{session.user?.email}</div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  href="/auth/signin"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}