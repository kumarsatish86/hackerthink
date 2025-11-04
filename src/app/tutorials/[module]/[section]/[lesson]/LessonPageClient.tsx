'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaBook, FaPlay, FaClock, FaSignal, FaChevronLeft, FaChevronRight, FaCheckCircle, FaCircle, FaBookmark, FaShare, FaPrint } from 'react-icons/fa';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  estimated_time: number;
  difficulty_level: string;
  order_index: number;
  section_id: string;
  section_title: string;
  section_slug: string;
  module_id: string;
  module_title: string;
  module_slug: string;
  created_at: string;
  updated_at: string;
  reading_time?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  structured_data?: string;
}

interface Section {
  id: string;
  title: string;
  slug: string;
  lessons?: Lesson[];
}

interface Module {
  id: string;
  title: string;
  slug: string;
}

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  order_index: number;
  sections: Section[];
}

interface TutorialNavigation {
  success: boolean;
  data: Tutorial[];
  tutorials: Tutorial[];
}

export default function LessonPageClient() {
  const params = useParams();
  const { module: moduleSlug, section: sectionSlug, lesson: lessonSlug } = params;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [tutorialNavigation, setTutorialNavigation] = useState<TutorialNavigation | null>(null);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [sidebarScrollPosition, setSidebarScrollPosition] = useState(0);
  const [sidebarRef, setSidebarRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log('=== URL PARAMETERS DEBUG ===');
    console.log('Raw params:', params);
    console.log('moduleSlug:', moduleSlug);
    console.log('sectionSlug:', sectionSlug);
    console.log('lessonSlug:', lessonSlug);
    console.log('Full URL:', typeof window !== 'undefined' ? window.location.href : 'Server side');
    
    if (moduleSlug && sectionSlug && lessonSlug) {
      console.log('All parameters present, proceeding with API calls...');
      fetchLesson();
      fetchTutorialNavigation();
      
      // Simple test to verify API is working
      fetch('/api/tutorials/test-simple')
        .then(response => response.json())
        .then(data => console.log('Simple test API working:', data))
        .catch(error => console.error('Simple test API error:', error));
    } else {
      console.log('Missing parameters:', { moduleSlug, sectionSlug, lessonSlug });
    }
  }, [moduleSlug, sectionSlug, lessonSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Track reading progress
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(scrollPercent, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore sidebar scroll position from sessionStorage and auto-scroll to current lesson
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('tutorial-sidebar-scroll');
    if (savedPosition) {
      setSidebarScrollPosition(parseInt(savedPosition));
    }
    
    // Auto-scroll to current lesson after navigation loads
    if (tutorialNavigation && sidebarRef && lessonSlug) {
      setTimeout(() => {
        const currentLessonElement = sidebarRef.querySelector(`[data-lesson-slug="${lessonSlug}"]`);
        if (currentLessonElement) {
          currentLessonElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    }
  }, [tutorialNavigation, sidebarRef, lessonSlug]);

  // Save sidebar scroll position to sessionStorage
  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setSidebarScrollPosition(scrollTop);
    sessionStorage.setItem('tutorial-sidebar-scroll', scrollTop.toString());
  };

  const handleLessonClick = (lessonSlug: string) => {
    // Save current scroll position before navigation
    const currentScroll = document.querySelector('.sidebar-content')?.scrollTop || 0;
    sessionStorage.setItem('tutorial-sidebar-scroll', currentScroll.toString());
  };

  const fetchLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutorials/lessons/view/${lessonSlug}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          const lessonData = data.data;
          
          // Debug: Log structured data
          console.log('Tutorial Lesson Page - received data:', {
            hasStructuredData: !!lessonData.structured_data,
            structuredDataLength: lessonData.structured_data?.length || 0,
            structuredDataPreview: lessonData.structured_data?.substring(0, 100) + '...',
            allFields: Object.keys(lessonData)
          });
          
          setLesson(lessonData);
          
          // Set section and module info
          setSection({
            id: lessonData.section_id,
            title: lessonData.section_title,
            slug: lessonData.section_slug
          });
          
          setModule({
            id: lessonData.module_id,
            title: lessonData.module_title,
            slug: lessonData.module_slug
          });
        } else {
          setError('Lesson not found');
        }
      } else {
        setError('Failed to fetch lesson');
      }
    } catch (err) {
      setError('Error fetching lesson');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorialNavigation = async () => {
    try {
      setNavigationLoading(true);
      const response = await fetch('/api/tutorials/navigation');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tutorial Navigation data:', data);
        setTutorialNavigation(data);
      } else {
        setNavigationError('Failed to load navigation');
      }
    } catch (err) {
      setNavigationError('Error loading navigation');
      console.error('Navigation error:', err);
    } finally {
      setNavigationLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '🟢';
      case 'intermediate':
        return '🟡';
      case 'advanced':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading && !error) {
    return (
      <div className="full-height-page min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="full-height-page min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Lesson Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The requested lesson could not be found.'}</p>
          <a 
            href="/tutorials" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaBook className="mr-2" />
            Browse Tutorials
          </a>
        </div>
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007';

  return (
    <div className="full-height-page min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar Navigation - Fixed/Sticky */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <FaBook className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Tutorials</h1>
                <p className="text-sm text-slate-500">Linux Learning Hub</p>
              </div>
            </div>
            
            {/* Current Lesson Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-slate-600">Current Lesson:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(lesson.difficulty_level)}`}>
                  {getDifficultyIcon(lesson.difficulty_level)} {lesson.difficulty_level}
                </span>
              </div>
              <h2 className="font-semibold text-slate-800 text-sm leading-tight">{lesson.title}</h2>
              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center">
                  <FaClock className="mr-1" />
                  {lesson.reading_time || lesson.estimated_time} min
                </span>
                <span className="flex items-center">
                  <FaSignal className="mr-1" />
                  {lesson.difficulty_level}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Content */}
          <div 
            ref={setSidebarRef}
            className="flex-1 overflow-y-auto sidebar-content"
            onScroll={handleSidebarScroll}
            style={{ scrollTop: sidebarScrollPosition }}
          >
            {navigationLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-slate-500">Loading navigation...</p>
              </div>
            ) : navigationError ? (
              <div className="p-6 text-center">
                <p className="text-sm text-red-500">{navigationError}</p>
              </div>
            ) : tutorialNavigation ? (
              <div className="p-4">
                {/* Find the current tutorial based on module slug */}
                {(() => {
                  const currentTutorial = tutorialNavigation.data?.find(t => t.slug === moduleSlug) || 
                                         tutorialNavigation.tutorials?.find(t => t.slug === moduleSlug);
                  
                  if (!currentTutorial) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500">Tutorial not found</p>
                      </div>
                    );
                  }

                  return (
                    <>
                      {/* Tutorial Info */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded text-white text-xs flex items-center justify-center mr-2">
                            {currentTutorial.icon || '📚'}
                          </span>
                          {currentTutorial.title || 'Tutorial'}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">{currentTutorial.description || 'Linux tutorial content'}</p>
                      </div>

                      {/* Sections */}
                      {currentTutorial.sections?.map((section) => (
                  <div key={section.id} className="mb-6">
                    <h4 className="text-sm font-medium text-slate-700 mb-3 px-2">
                      {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.lessons?.map((sectionLesson) => (
                        <a
                          key={sectionLesson.id}
                          href={`/tutorials/${moduleSlug}/${section.slug}/${sectionLesson.slug}`}
                          onClick={() => handleLessonClick(sectionLesson.slug)}
                          data-lesson-slug={sectionLesson.slug}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                            sectionLesson.slug === lessonSlug
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-medium'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex-1 truncate">{sectionLesson.title}</span>
                            <div className="flex items-center space-x-2 ml-2">
                              {sectionLesson.slug === lessonSlug ? (
                                <FaCheckCircle className="text-blue-500 text-xs" />
                              ) : (
                                <FaCircle className="text-slate-300 text-xs" />
                              )}
                              <span className="text-xs text-slate-400">
                                {sectionLesson.estimated_time}m
                              </span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Lesson Header */}
          <div className="bg-white border-b border-slate-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(lesson.difficulty_level)}`}>
                    {getDifficultyIcon(lesson.difficulty_level)} {lesson.difficulty_level}
                  </span>
                  <span className="text-sm text-slate-500 flex items-center">
                    <FaClock className="mr-1" />
                    {lesson.reading_time || lesson.estimated_time} min read
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-3 leading-tight">
                  {lesson.title}
                </h1>
                {lesson.excerpt && (
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {lesson.excerpt}
                  </p>
                )}
              </div>
                    
              {/* Action Buttons */}
              <div className="flex items-center gap-3 ml-6">
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-lg border transition-all ${
                    isBookmarked 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
                >
                  <FaBookmark className={isBookmarked ? 'fill-current' : ''} />
                </button>
                <button className="p-3 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all" title="Share lesson">
                  <FaShare />
                </button>
                <button className="p-3 rounded-lg bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all" title="Print lesson">
                  <FaPrint />
                </button>
              </div>
            </div>
          </div>
          
          {/* Lesson Content */}
          <div className="flex-1 p-8">
            <div 
              className="lesson-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>

          {/* Navigation Controls - Fixed at bottom of content */}
          <div className="bg-white border-t border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <button 
                className="flex items-center px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all"
                title="Previous lesson"
              >
                <FaChevronLeft className="mr-2" />
                Previous
              </button>
              
              <div className="text-xs text-slate-400 text-center">
                Last updated: {new Date(lesson.updated_at).toLocaleDateString()} • Created: {new Date(lesson.created_at).toLocaleDateString()}
              </div>
              
              <button 
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                title="Next lesson"
              >
                Next
                <FaChevronRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
