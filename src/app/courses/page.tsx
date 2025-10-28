'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  featured_image: string;
  level: string;
  duration: number;
  price: number;
  discount_price: number | null;
  author_name: string;
  is_featured: boolean;
  category?: string;
  rating?: number;
  students_count?: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Course categories
  const categories = [
    { id: 'machine-learning', name: 'Machine Learning', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'deep-learning', name: 'Deep Learning', icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
    { id: 'nlp', name: 'Natural Language Processing', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { id: 'computer-vision', name: 'Computer Vision', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'data-science', name: 'Data Science', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'ai-ethics', name: 'AI Ethics', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  // AI Learning paths data
  const learningPaths = [
    {
      id: 'ai-engineer',
      title: 'AI Engineer',
      description: 'Master AI development from fundamentals to production deployment',
      courses: 8,
      duration: '60 hours',
      icon: '🤖',
      color: 'from-purple-500 to-cyan-600'
    },
    {
      id: 'ml-scientist',
      title: 'Machine Learning Scientist',
      description: 'Learn advanced ML algorithms, research methods, and model optimization',
      courses: 10,
      duration: '80 hours',
      icon: '🧠',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'data-scientist',
      title: 'Data Scientist',
      description: 'Extract insights from data using statistical analysis and ML techniques',
      courses: 7,
      duration: '50 hours',
      icon: '📊',
      color: 'from-green-500 to-blue-600'
    },
    {
      id: 'ai-researcher',
      title: 'AI Researcher',
      description: 'Dive deep into cutting-edge AI research and develop novel algorithms',
      courses: 6,
      duration: '70 hours',
      icon: '🔬',
      color: 'from-red-500 to-pink-600'
    }
  ];

  // Featured AI instructors
  const instructors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      role: 'AI Research Scientist',
      courses: 15,
      students: 8500,
      rating: 4.9,
      image: '/images/instructors/sarah-chen.jpg',
      bio: 'Former Google AI researcher with 12+ years in machine learning and neural networks.',
      expertise: ['Deep Learning', 'Computer Vision', 'NLP']
    },
    {
      id: 2,
      name: 'Prof. Michael Rodriguez',
      role: 'Machine Learning Engineer',
      courses: 12,
      students: 6200,
      rating: 4.8,
      image: '/images/instructors/michael-rodriguez.jpg',
      bio: 'Stanford PhD, ex-Tesla AI team lead, specializing in autonomous systems.',
      expertise: ['Reinforcement Learning', 'Computer Vision', 'Robotics']
    },
    {
      id: 3,
      name: 'Dr. Emily Watson',
      role: 'Data Science Director',
      courses: 18,
      students: 12000,
      rating: 4.9,
      image: '/images/instructors/emily-watson.jpg',
      bio: 'Microsoft AI architect with expertise in large-scale ML systems and data engineering.',
      expertise: ['Data Engineering', 'MLOps', 'Statistical Analysis']
    }
  ];

  // Fetch courses from API
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use the public courses API endpoint
      const response = await fetch('/api/courses');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on selected criteria
  const filteredCourses = courses.filter(course => {
    // Filter by price type
    if (filter === 'free' && course.price !== 0) return false;
    if (filter === 'paid' && course.price === 0) return false;
    if (filter === 'featured' && !course.is_featured) return false;
    
    // Filter by level
    if (levelFilter !== 'all' && course.level !== levelFilter) return false;
    
    // Filter by category
    if (categoryFilter !== 'all' && course.category !== categoryFilter) return false;
    
    // Filter by search query
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !course.short_description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Format duration helper
  const formatDuration = (minutes: number): string => {
    if (!minutes) return 'Self-paced';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-purple-400 text-lg font-medium">Loading AI Courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-cyan-600/20 to-blue-700/30"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Futuristic Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full animate-ping opacity-20"></div>
              <svg className="w-12 h-12 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-tight">
              AI <span className="bg-gradient-to-r from-purple-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Courses</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Master artificial intelligence with cutting-edge courses designed by industry experts. 
              From machine learning fundamentals to advanced neural networks.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search AI courses, topics, or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">100+</div>
                <div className="text-purple-400 font-medium">AI Courses</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-purple-400 font-medium">Projects</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">25+</div>
                <div className="text-purple-400 font-medium">AI Experts</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-3xl font-bold text-white mb-2">50k+</div>
                <div className="text-purple-400 font-medium">Students</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Paths Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              AI Learning <span className="bg-gradient-to-r from-purple-400 to-cyan-500 bg-clip-text text-transparent">Paths</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Follow structured learning journeys designed by AI experts to master cutting-edge technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {learningPaths.map((path, index) => (
              <div key={path.id} className="group relative">
                {/* Hover Effect Background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${path.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700`}></div>
                
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-700 overflow-hidden h-full flex flex-col">
                  {/* Path Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-r ${path.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <span className="text-2xl">{path.icon}</span>
                  </div>
                  
                  {/* Path Info */}
                  <div className="space-y-4 text-center flex-grow">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {path.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {path.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {path.courses} courses
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {path.duration}
                      </span>
                    </div>
                    
                    <div className="pt-4 mt-auto">
                      <Link
                        href={`/learning-paths/${path.id}`}
                        className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${path.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                      >
                        <span className="mr-2">🚀</span>
                        Start Path
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Catalog Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Course <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Catalog</span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Explore our comprehensive collection of cutting-edge AI courses
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <Link
                href="/courses/all"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <span className="relative flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  View All Courses
                </span>
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-6 rounded-2xl">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-300 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  categoryFilter === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-600 text-white shadow-2xl'
                    : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                    categoryFilter === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-600 text-white shadow-2xl'
                      : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                    </svg>
                    {category.name}
                  </div>
                  {categoryFilter === category.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl blur opacity-30"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="mb-12 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price-filter" className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                <select
                  id="price-filter"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-gray-800">All Courses</option>
                  <option value="free" className="bg-gray-800">Free</option>
                  <option value="paid" className="bg-gray-800">Paid</option>
                  <option value="featured" className="bg-gray-800">Featured</option>
                </select>
              </div>

              <div>
                <label htmlFor="level-filter" className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                <select
                  id="level-filter"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-gray-800">All Levels</option>
                  <option value="Beginner" className="bg-gray-800">Beginner</option>
                  <option value="Intermediate" className="bg-gray-800">Intermediate</option>
                  <option value="Advanced" className="bg-gray-800">Advanced</option>
                </select>
              </div>

              <div>
                <label htmlFor="search-query" className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                <input
                  id="search-query"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div key={course.id} className="group relative">
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
                  
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-700 overflow-hidden flex flex-col h-full">
                    {/* Course Image/Header */}
                    <div className="relative h-48 mb-6 rounded-xl overflow-hidden">
                      {course.featured_image ? (
                        <img
                          src={course.featured_image}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 flex items-center justify-center p-4">
                          <h3 className="text-lg font-bold text-white text-center">{course.title}</h3>
                        </div>
                      )}
                      
                      {/* Level badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          course.level === 'Beginner' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                          course.level === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                      
                      {/* Featured badge */}
                      {course.is_featured && (
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            ⭐ Featured
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="text-xl font-bold text-white hover:text-purple-400 mb-3 transition-colors">
                          {course.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {course.short_description || 'Comprehensive AI course covering essential concepts and practical applications.'}
                      </p>
                      
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        <span className="inline-flex items-center mr-4">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {course.author_name || 'AI Expert'}
                        </span>
                        <span className="inline-flex items-center">
                          <svg className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatDuration(course.duration)}
                        </span>
                      </div>
                      
                      {course.rating && (
                        <div className="flex items-center mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg 
                              key={star} 
                              className={`h-4 w-4 ${star <= Math.round(course.rating || 0) ? 'text-yellow-400' : 'text-gray-600'}`} 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-400">{course.rating?.toFixed(1)}</span>
                          {course.students_count && (
                            <span className="ml-2 text-sm text-gray-500">({course.students_count} students)</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          {course.price === 0 ? (
                            <span className="text-green-400 font-semibold text-lg">Free</span>
                          ) : course.discount_price ? (
                            <div>
                              <span className="font-semibold text-purple-400 text-lg">${course.discount_price.toFixed(2)}</span>
                              <span className="ml-2 text-sm text-gray-500 line-through">${course.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="font-semibold text-purple-400 text-lg">${course.price.toFixed(2)}</span>
                          )}
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Courses Found</h3>
                <p className="text-gray-400 mb-8">
                  {filter !== 'all' || levelFilter !== 'all' || categoryFilter !== 'all' || searchQuery
                    ? 'Try changing your filter settings to find AI courses.' 
                    : 'Check back soon for new AI courses and learning paths.'}
                </p>
                <button
                  onClick={() => {
                    setFilter('all');
                    setLevelFilter('all');
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Featured AI Instructors Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              World-Class <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">AI Experts</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Learn from leading AI researchers, engineers, and industry pioneers who are shaping the future of artificial intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {instructors.map((instructor, index) => (
              <div key={instructor.id} className="group relative">
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
                
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-700 overflow-hidden">
                  {/* Instructor Avatar */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">
                        {instructor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full blur opacity-20 animate-pulse"></div>
                  </div>
                  
                  {/* Instructor Info */}
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {instructor.name}
                    </h3>
                    <p className="text-cyan-400 font-medium">{instructor.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">{instructor.bio}</p>
                    
                    {/* Expertise Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {instructor.expertise.map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-center space-x-8 text-sm text-gray-400 mb-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{instructor.courses}</div>
                        <div>Courses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">{instructor.students.toLocaleString()}</div>
                        <div>Students</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star} 
                          className={`h-5 w-5 ${star <= Math.round(instructor.rating) ? 'text-yellow-400' : 'text-gray-600'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm text-gray-400">{instructor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="relative">
              {/* Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-600/20 rounded-3xl blur-3xl"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
              
              {/* Main Content */}
              <div className="relative bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-full mb-8">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Master AI?
                </h2>
                <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of developers, researchers, and innovators who are building the future with AI. 
                  Start your journey today with our comprehensive courses and expert guidance.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link
                    href="/courses/featured"
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <span className="relative flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Explore Featured Courses
                    </span>
                  </Link>
                  <Link
                    href="/pricing"
                    className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-400 font-bold text-lg rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      View Pricing Plans
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 