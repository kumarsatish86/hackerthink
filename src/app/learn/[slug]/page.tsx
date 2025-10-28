'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Custom animation styles
import './animations.css';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  sections: CourseSection[];
}

interface CourseSection {
  id: string;
  title: string;
  description: string;
  chapters: CourseChapter[];
}

interface CourseChapter {
  id: string;
  title: string;
  content_type: string;
}

export default function LearnCoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  // Ref for course content section
  const courseContentRef = useRef<HTMLDivElement>(null);

  // State for FAQ accordion
  const [openFAQ, setOpenFAQ] = useState<number | null>(0); // First one open by default
  
  // Mock course progress (in a real app, this would come from an API)
  const [courseProgress, setCourseProgress] = useState({
    completed: 35,
    total: 100,
    lastActivity: new Date().toLocaleDateString(),
    streak: 4,
  });
  
  // Function to toggle FAQ items
  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Function to scroll to content
  const scrollToContent = () => {
    courseContentRef.current?.scrollIntoView({ 
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Course not found');
          }
          throw new Error('Failed to load course');
        }
        
        const data = await response.json();
        setCourse(data.course);
        
        // Set default active section and chapter if available
        if (data.course.sections && data.course.sections.length > 0) {
          setActiveSection(data.course.sections[0].id);
          
          if (data.course.sections[0].chapters && data.course.sections[0].chapters.length > 0) {
            setActiveChapter(data.course.sections[0].chapters[0].id);
          }
        }
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err.message || 'An error occurred while loading the course');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [slug]);

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Set first chapter of the section as active
    const section = course?.sections.find(s => s.id === sectionId);
    if (section && section.chapters && section.chapters.length > 0) {
      setActiveChapter(section.chapters[0].id);
    }
  };

  const handleChapterClick = (chapterId: string) => {
    setActiveChapter(chapterId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link href="/courses" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h1>
          <p className="text-gray-700 mb-6">Sorry, we couldn't find the course you're looking for.</p>
          <Link href="/courses" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Browse All Courses
          </Link>
        </div>
      </div>
    );
  }

  // Find active section and chapter
  const currentSection = course.sections.find(s => s.id === activeSection);
  const currentChapter = currentSection?.chapters.find(c => c.id === activeChapter);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Enhanced Animated Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-800 to-purple-700">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="animate-pulse opacity-10 absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="animate-pulse delay-300 opacity-10 absolute bottom-10 right-20 w-56 h-56 rounded-full bg-indigo-300"></div>
          <div className="animate-pulse delay-700 opacity-10 absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-300"></div>
          <div className="animate-bounce opacity-20 absolute bottom-20 left-1/3 w-16 h-16 rounded-full bg-indigo-200"></div>
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 py-16 z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              {/* Animated Title */}
              <div className="overflow-hidden">
                <h1 className="text-4xl md:text-5xl font-bold text-white animate-fade-in-up">
                  {course?.title}
                </h1>
              </div>
              
              {/* Animated Description */}
              <div className="overflow-hidden">
                <p className="text-xl text-indigo-100 animate-fade-in-up animation-delay-300">
                  {course?.description}
                </p>
              </div>
              
              {/* Stats/Info */}
              <div className="flex flex-wrap gap-4 mt-4 animate-fade-in-up animation-delay-500">
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
                  <svg className="h-5 w-5 mr-2 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-indigo-100">
                    {course?.sections?.length || 0} Sections
                  </span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center">
                  <svg className="h-5 w-5 mr-2 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-indigo-100">
                    {course?.sections?.reduce((total, section) => total + (section.chapters?.length || 0), 0) || 0} Chapters
                  </span>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="pt-2 animate-fade-in-up animation-delay-700">
                <button 
                  onClick={scrollToContent}
                  className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow hover:bg-indigo-50 transition transform hover:scale-105 flex items-center">
                  <span>Start Learning</span>
                  <svg className="ml-2 h-5 w-5 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl opacity-30 blur-xl transform rotate-6"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <div className="ml-4 h-4 w-1/2 bg-white/20 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-white/20 rounded w-full"></div>
                    ))}
                    <div className="h-4 bg-white/20 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8" ref={courseContentRef}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Course Navigation Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="font-medium text-gray-700">Course Content</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {course.sections.map((section) => (
                  <div key={section.id} className="p-0">
                    {/* Section Header */}
                    <button 
                      className={`w-full text-left p-4 font-medium ${activeSection === section.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      {section.title}
                    </button>
                    
                    {/* Chapter List */}
                    {activeSection === section.id && (
                      <div className="pl-4 pb-2">
                        {section.chapters.map((chapter) => (
                          <button
                            key={chapter.id}
                            className={`w-full text-left py-2 px-4 text-sm rounded-md ${activeChapter === chapter.id ? 'bg-indigo-100 text-indigo-800' : 'text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => handleChapterClick(chapter.id)}
                          >
                            <div className="flex items-center">
                              <span className="mr-2">
                                {chapter.content_type === 'video' ? (
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                )}
                              </span>
                              {chapter.title}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {currentChapter ? (
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{currentChapter.title}</h2>
                  
                  {/* Chapter Content - Replace with actual content from API */}
                  <div className="prose max-w-none">
                    <p>This is where the chapter content will be displayed. In a real implementation, this would show the actual content of the chapter, which could be text, video, or other types of content.</p>
                    
                    <p>For now, this is a placeholder. The content would be fetched from the API based on the selected chapter.</p>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="mt-8 border-t pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Your Progress</h3>
                      <div className="flex items-center">
                        <div className="flex items-center text-indigo-600 mr-4">
                          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">Last activity: {courseProgress.lastActivity}</span>
                        </div>
                        <div className="flex items-center text-indigo-600">
                          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-sm">{courseProgress.streak}-day streak!</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${courseProgress.completed}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">{courseProgress.completed}% complete</span>
                      <span className="text-sm text-gray-500">{courseProgress.completed}/{courseProgress.total} lessons</span>
                    </div>
                  </div>
                  
                  {/* Navigation Controls */}
                  <div className="mt-8 pt-4 flex justify-between">
                    <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Previous
                    </button>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Next
                      <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-gray-500">Select a chapter to start learning</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional engaging sections after the course content */}
      
      {/* Resources Section */}
      <section className="bg-gradient-to-r from-gray-50 to-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Additional Resources</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Enhance your learning experience with these carefully selected resources that complement your course material.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Resource Card 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="h-3 bg-indigo-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Reference Guides</h3>
                <p className="text-gray-600 mb-4">Access comprehensive reference materials and documentation to deepen your understanding.</p>
                <button className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center">
                  <span>View Guides</span>
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Resource Card 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="h-3 bg-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Video Tutorials</h3>
                <p className="text-gray-600 mb-4">Watch step-by-step video tutorials that demonstrate complex concepts visually.</p>
                <button className="text-purple-600 font-medium hover:text-purple-800 transition-colors flex items-center">
                  <span>Watch Videos</span>
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Resource Card 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="h-3 bg-blue-600"></div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Discussion Forum</h3>
                <p className="text-gray-600 mb-4">Join our community discussion forum to ask questions and share insights with peers.</p>
                <button className="text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center">
                  <span>Join Forum</span>
                  <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">What Students Are Saying</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Hear from other learners who have completed this course and applied their knowledge.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-lg p-6 relative animate-fade-in-up animation-delay-300">
              <div className="absolute -top-5 -left-5 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">"This course completely transformed my understanding of Linux concepts. The course materials are well-structured and the exercises are practical and engaging."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-full overflow-hidden mr-4">
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Sarah Johnson</p>
                  <p className="text-gray-500 text-sm">Software Developer</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-lg p-6 relative animate-fade-in-up animation-delay-500">
              <div className="absolute -top-5 -left-5 w-10 h-10 flex items-center justify-center bg-purple-600 text-white rounded-full shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">"As a system administrator, the practical examples in this course were immediately applicable to my daily work. I've already implemented several of the techniques taught here."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full overflow-hidden mr-4">
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Michael Chen</p>
                  <p className="text-gray-500 text-sm">System Administrator</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-lg p-6 relative animate-fade-in-up animation-delay-700">
              <div className="absolute -top-5 -left-5 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic">"I started with zero Linux knowledge and now I feel confident managing Linux systems. The instructors explain complex concepts in a way that's easy to understand and remember."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full overflow-hidden mr-4">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-teal-500"></div>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Elena Rodriguez</p>
                  <p className="text-gray-500 text-sm">IT Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about this course and your learning journey.</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button 
                onClick={() => toggleFAQ(0)} 
                className="w-full text-left px-6 py-4 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">What prerequisites are needed for this course?</h3>
                  <svg 
                    className={`w-5 h-5 text-indigo-600 transform transition-transform ${openFAQ === 0 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`transition-all duration-300 ${openFAQ === 0 ? 'max-h-40' : 'max-h-0 overflow-hidden'}`}>
                <div className="px-6 pb-4">
                  <p className="text-gray-600">This course is designed for beginners, so no prior Linux experience is required. Basic computer skills and familiarity with command-line interfaces would be helpful but not mandatory.</p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 2 */}
            <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button 
                onClick={() => toggleFAQ(1)} 
                className="w-full text-left px-6 py-4 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">How long do I have access to the course materials?</h3>
                  <svg 
                    className={`w-5 h-5 text-indigo-600 transform transition-transform ${openFAQ === 1 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`transition-all duration-300 ${openFAQ === 1 ? 'max-h-40' : 'max-h-0 overflow-hidden'}`}>
                <div className="px-6 pb-4">
                  <p className="text-gray-600">Once enrolled, you have lifetime access to all course materials. You can learn at your own pace and revisit the content whenever you need to refresh your knowledge.</p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 3 */}
            <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button 
                onClick={() => toggleFAQ(2)} 
                className="w-full text-left px-6 py-4 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Is there a certificate upon completion?</h3>
                  <svg 
                    className={`w-5 h-5 text-indigo-600 transform transition-transform ${openFAQ === 2 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`transition-all duration-300 ${openFAQ === 2 ? 'max-h-40' : 'max-h-0 overflow-hidden'}`}>
                <div className="px-6 pb-4">
                  <p className="text-gray-600">Yes, you'll receive a downloadable certificate of completion after finishing all course modules and passing the final assessment. This certificate can be added to your resume or LinkedIn profile.</p>
                </div>
              </div>
            </div>
            
            {/* FAQ Item 4 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <button 
                onClick={() => toggleFAQ(3)} 
                className="w-full text-left px-6 py-4 focus:outline-none"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">What support is available if I get stuck?</h3>
                  <svg 
                    className={`w-5 h-5 text-indigo-600 transform transition-transform ${openFAQ === 3 ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              <div className={`transition-all duration-300 ${openFAQ === 3 ? 'max-h-40' : 'max-h-0 overflow-hidden'}`}>
                <div className="px-6 pb-4">
                  <p className="text-gray-600">We provide multiple support channels including discussion forums where instructors and fellow students can help, direct messaging with course mentors, and regular Q&A sessions for complex topics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to continue your learning journey?</h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">Apply your new knowledge with our advanced courses and specialized workshops.</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg shadow hover:bg-indigo-50 transition transform hover:scale-105">
              Next Course
            </button>
            <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
              View All Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 