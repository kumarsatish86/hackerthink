'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

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

interface TutorialSidebarProps {
  navigation: any[];
  collapsed: boolean;
  onToggle: () => void;
}

const TutorialSidebar: React.FC<TutorialSidebarProps> = ({ navigation, collapsed, onToggle }) => {
  const params = useParams();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [currentModuleSections, setCurrentModuleSections] = useState<TutorialSection[]>([]);

  // Extract current module from URL path
  useEffect(() => {
    if (pathname && navigation.length > 0) {
      const pathParts = pathname.split('/');
      const moduleSlug = pathParts[2]; // /tutorials/[module]/...
      
      if (moduleSlug) {
        const module = navigation.find(m => m.slug === moduleSlug);
        if (module) {
          setCurrentModule(module);
          setCurrentModuleSections(module.sections || []);
          
          // Auto-expand sections that have lessons
          const sectionsWithLessons = new Set<string>();
          module.sections.forEach((section: TutorialSection) => {
            if (section.lessons && section.lessons.length > 0) {
              sectionsWithLessons.add(section.id);
            }
          });
          setExpandedSections(sectionsWithLessons);
        }
      }
    }
  }, [pathname, navigation]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const getSectionIcon = (sectionTitle: string) => {
    const title = sectionTitle.toLowerCase();
    if (title.includes('getting started') || title.includes('introduction')) return '🚀';
    if (title.includes('file') || title.includes('filesystem')) return '📁';
    if (title.includes('command') || title.includes('cli')) return '💻';
    if (title.includes('script') || title.includes('programming')) return '📝';
    if (title.includes('admin') || title.includes('system')) return '⚙️';
    if (title.includes('network') || title.includes('security')) return '🔒';
    if (title.includes('advanced') || title.includes('expert')) return '🎯';
    return '📚';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (collapsed) {
    return (
      <div className="h-full bg-white">
        <div className="p-4">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Expand Sidebar"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="h-full bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Tutorials</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="text-center text-gray-500">
          <p>Select a tutorial module to view sections</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Tutorials</h2>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Collapse Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Current Module Info */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">
                {currentModule.icon === 'linux' ? '🐧' : currentModule.icon === 'terminal' ? '💻' : '🖥️'}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-blue-900">{currentModule.title}</h3>
              <p className="text-xs text-blue-700">{currentModule.sections.length} sections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {currentModuleSections.map((section) => (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Section Header */}
              <div className="bg-gray-50 px-4 py-3">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between text-left hover:bg-gray-100 rounded transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">
                        {getSectionIcon(section.title)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{section.title}</h4>
                      <p className="text-xs text-gray-500">{section.lessons.length} lessons</p>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      expandedSections.has(section.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Section Description */}
              <div className="px-4 py-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                
                {/* Lessons List */}
                {expandedSections.has(section.id) && (
                  <div className="space-y-2">
                    {section.lessons.map((lesson) => {
                      const isActive = pathname.includes(lesson.slug);
                      return (
                        <Link
                          key={lesson.id}
                          href={`/tutorials/${currentModule.slug}/${section.slug}/${lesson.slug}`}
                          className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-900 border-l-2 border-blue-500'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{lesson.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty_level)}`}>
                                {lesson.difficulty_level.charAt(0).toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">{lesson.estimated_time}m</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back to Tutorials */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            href="/tutorials"
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Tutorials
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorialSidebar;
