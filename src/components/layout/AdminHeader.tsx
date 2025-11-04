'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminHeader() {
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to generate a title based on the current path
  const getPageTitle = () => {
    const path = pathname || '';
    
    if (path.includes('/admin/dashboard')) return 'Dashboard';
    
    // Roadmaps
    if (path.includes('/admin/content/roadmaps/new')) return 'Create New Roadmap';
    if (path.includes('/admin/content/roadmaps') && path.includes('/admin/content/roadmaps/')) return 'Edit Roadmap';
    if (path.includes('/admin/content/roadmaps')) return 'Learning Roadmaps';
    
    // Content Management
    if (path.includes('/admin/content/articles')) return 'Articles';
    if (path.includes('/admin/content/courses')) return 'Courses';
    if (path.includes('/admin/content/glossary')) return 'Glossary';
    if (path.includes('/admin/content/tools')) return 'Tools';
    if (path.includes('/admin/content/web-stories')) return 'Web Stories';
    if (path.includes('/admin/content/lab-exercises')) return 'Lab Exercises';
    if (path.includes('/admin/content/scripts')) return 'Scripts';
    if (path.includes('/admin/content/commands')) return 'Commands';
    if (path.includes('/admin/content/interviews')) {
      if (path.includes('/admin/content/interviews/guests')) return 'Guest Management';
      if (path.includes('/admin/content/interviews/new') || (path.includes('/admin/content/interviews/') && path !== '/admin/content/interviews')) return 'Edit Interview';
      return 'Interviews';
    }
    
    // Administration
    if (path.includes('/admin/users')) return 'Users';
    if (path.includes('/admin/roles')) return 'Roles';
    if (path.includes('/admin/media')) return 'Media';
    if (path.includes('/admin/comments')) return 'Comments';
    if (path.includes('/admin/integrations')) return 'Integrations';
    if (path.includes('/admin/settings')) return 'Settings';
    if (path.includes('/admin/seo')) return 'SEO';
    
    return 'Admin Panel';
  };

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      await update();
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
        
        <div className="flex items-center space-x-3">
          {/* Session Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${session ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">
              {session ? 'Session Active' : 'No Session'}
            </span>
          </div>
          
          {/* Session Refresh Button */}
          <button
            onClick={handleRefreshSession}
            disabled={isRefreshing}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Session"
          >
            {isRefreshing ? 'Refreshing...' : '🔄'}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center text-gray-700 focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                {session?.user?.name?.charAt(0) || 'A'}
              </div>
              <span className="ml-2 hidden md:inline-block">{session?.user?.name}</span>
              <svg 
                className="ml-1 h-5 w-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  href="/admin/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View Site
                </Link>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/auth/signin' });
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 