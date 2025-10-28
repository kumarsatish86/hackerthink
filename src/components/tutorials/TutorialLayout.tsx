'use client';

import React, { useState, useEffect } from 'react';
import TutorialSidebar from './TutorialSidebar';
import TutorialContent from './TutorialContent';
import TutorialAdSidebar from './TutorialAdSidebar';

interface TutorialModule {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  sections: TutorialSection[];
}

interface TutorialSection {
  id: string;
  title: string;
  slug: string;
  description: string;
  order_index: number;
  lessons: TutorialLesson[];
}

interface TutorialLesson {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
}

interface TutorialLayoutProps {
  children?: React.ReactNode;
}

const TutorialLayout: React.FC<TutorialLayoutProps> = ({ children }) => {
  const [navigation, setNavigation] = useState<TutorialModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tutorials/navigation');
      const data = await response.json();
      
      if (data.success) {
        setNavigation(data.data);
      } else {
        setError('Failed to fetch tutorial navigation');
      }
    } catch (err) {
      setError('Error fetching tutorial navigation');
      console.error('Error fetching navigation:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Tutorials</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchNavigation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Tutorial Navigation */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0`}>
        <TutorialSidebar 
          navigation={navigation}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">Linux Tutorials</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {/* Removed module count since sidebar now shows only current module */}
              </div>
            </div>
          </div>
        </div>

        {/* Content and Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Tutorial Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children || (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Linux Tutorials</h2>
                <p className="text-gray-600 mb-6">
                  Select a tutorial from the left sidebar to get started with learning Linux.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {navigation.map((module) => (
                    <div key={module.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-lg font-bold">
                            {module.icon === 'linux' ? '🐧' : module.icon === 'terminal' ? '💻' : '🖥️'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{module.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                      <div className="text-xs text-gray-500">
                        {module.sections.length} sections • {module.sections.reduce((acc, section) => acc + section.lessons.length, 0)} lessons
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Ads */}
          <div className="w-80 bg-gray-50 border-l overflow-y-auto p-4 flex-shrink-0">
            <TutorialAdSidebar location="tutorial_sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialLayout;
