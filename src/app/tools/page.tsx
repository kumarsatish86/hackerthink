'use client';

import { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';

// Define tool type
interface Tool {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  platform: string;
  license: string;
  official_url: string;
  popularity: number;
  icon?: string;
  users_count?: number;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Tool Categories
  const categories = [
    { id: 'all', name: 'All Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'machine-learning', name: 'Machine Learning', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'nlp', name: 'Natural Language Processing', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
    { id: 'computer-vision', name: 'Computer Vision', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'data-analysis', name: 'Data Analysis', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'automation', name: 'Automation', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    { id: 'development', name: 'Development', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' }
  ];
  
  // Popular AI Tools
  const popularTools = [
    'TensorFlow', 'PyTorch', 'OpenAI API', 'Hugging Face', 'Scikit-learn',
    'Pandas', 'NumPy', 'Jupyter', 'Streamlit', 'Gradio'
  ];
  
  // Featured AI Tools
  const featuredTools = [
    {
      id: 1,
      title: 'OpenAI GPT API',
      description: 'Access powerful language models for text generation, completion, and conversation',
      category: 'nlp',
      platform: 'cloud',
      license: 'API',
      popularity: 98,
      users_count: 50000,
      icon: '🤖'
    },
    {
      id: 2,
      title: 'TensorFlow',
      description: 'End-to-end open source machine learning platform for research and production',
      category: 'machine-learning',
      platform: 'cross-platform',
      license: 'Apache 2.0',
      popularity: 95,
      users_count: 100000,
      icon: '🧠'
    },
    {
      id: 3,
      title: 'Hugging Face Transformers',
      description: 'State-of-the-art Natural Language Processing for PyTorch and TensorFlow',
      category: 'nlp',
      platform: 'python',
      license: 'Apache 2.0',
      popularity: 92,
      users_count: 75000,
      icon: '🤗'
    }
  ];
  
  useEffect(() => {
    // Fetch tools from API instead of using mock data
    async function fetchTools() {
      try {
        setLoading(true);
        const response = await fetch('/api/tools');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tools: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Map the data to match our Tool interface
        const formattedTools = data.tools.map((tool: any) => ({
          id: tool.id.toString(),
          title: tool.title,
          slug: tool.slug,
          description: tool.description,
          category: tool.category || 'other',
          platform: tool.platform || 'cross-platform',
          license: tool.license || 'Unknown',
          official_url: tool.official_url || '#',
          popularity: tool.popularity || 75,
          icon: tool.icon,
          users_count: tool.users_count || undefined
        }));
        
        setTools(formattedTools);
        setError(null);
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTools();
  }, []);
  
  const platforms = [
    { id: 'all', name: 'All Platforms' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'cloud', name: 'Cloud' },
    { id: 'cross-platform', name: 'Cross Platform' }
  ];
  
  const filteredTools = tools.filter(tool => {
    // Apply category filter
    if (categoryFilter !== 'all' && tool.category !== categoryFilter) return false;
    
    // Apply platform filter
    if (platformFilter !== 'all' && tool.platform !== platformFilter) return false;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'machine-learning':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'nlp':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'computer-vision':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'data-analysis':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'automation':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'development':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const getPopularityBadge = (popularity: number): ReactElement => {
    let color = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    let label = 'Normal';
    
    if (popularity >= 95) {
      color = 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      label = 'Very Popular';
    } else if (popularity >= 85) {
      color = 'bg-green-500/20 text-green-400 border-green-500/30';
      label = 'Popular';
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
        {label}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-purple-400 text-lg font-medium">Loading AI Tools...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Tools</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
          >
            Retry
          </button>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-white mb-8 leading-tight">
              AI <span className="bg-gradient-to-r from-purple-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">Tools</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Discover cutting-edge AI tools and frameworks that power the future of technology. 
              From machine learning to natural language processing, find the perfect tools for your AI projects.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <span className="relative flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explore Tools
                </span>
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-400 font-bold text-lg rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105">
                <span className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Browse Categories
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">AI Tool Categories</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Explore tools by category and find the perfect solution for your AI needs</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
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
      </div>

      {/* Featured Tools */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured AI Tools</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Hand-picked tools that are revolutionizing the AI landscape</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredTools.map((tool, index) => (
              <div key={tool.id} className="group relative">
                {/* Hover Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
                
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-700 overflow-hidden">
                  {/* Tool Icon */}
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">{tool.icon}</span>
                  </div>
                  
                  {/* Tool Info */}
                  <div className="space-y-4 text-center">
                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(tool.category)}`}>
                        {tool.category.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      {tool.title}
                    </h3>
                    
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {tool.users_count?.toLocaleString()} users
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {tool.license}
                      </span>
                    </div>
                    
                    <div className="pt-4">
                      <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105">
                        <span className="flex items-center">
                          <span className="mr-2">🚀</span>
                          Explore Tool
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search AI tools by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-4 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label htmlFor="platform-filter" className="block text-sm font-medium text-gray-300 mb-2">Platform</label>
                <select
                  id="platform-filter"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="block w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id} className="bg-gray-800">{platform.name}</option>
                  ))}
                </select>
              </div>
              
              {(categoryFilter !== 'all' || platformFilter !== 'all' || searchQuery) && (
                <div className="flex items-end ml-auto">
                  <button
                    onClick={() => {
                      setCategoryFilter('all');
                      setPlatformFilter('all');
                      setSearchQuery('');
                    }}
                    className="inline-flex items-center px-4 py-3 border border-white/20 shadow-sm text-sm leading-4 font-medium rounded-xl text-gray-300 bg-white/10 hover:bg-white/20 focus:outline-none transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool) => (
                <div key={tool.id} className="group relative">
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-700"></div>
                  
                  <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-700 overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(tool.category)}`}>
                        {tool.category.replace('-', ' ')}
                      </span>
                      {getPopularityBadge(tool.popularity)}
                    </div>
                    
                    <Link href={`/tools/${tool.slug}`}>
                      <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors duration-200">
                        {tool.title}
                      </h3>
                    </Link>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-400 mb-4">
                      <span className="inline-flex items-center mr-4">
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {tool.license}
                      </span>
                      <span className="inline-flex items-center">
                        <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {tool.platform.replace('-', ' ')}
                      </span>
                    </div>
                    
                    {tool.users_count && (
                      <div className="text-sm text-gray-400 mb-4">
                        <span className="inline-flex items-center">
                          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {tool.users_count.toLocaleString()} users
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <a
                        href={tool.official_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-purple-400 inline-flex items-center transition-colors"
                      >
                        Official Website
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                      
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
                      >
                        View Details
                      </Link>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Tools Found</h3>
                <p className="text-gray-400 mb-8">
                  Try changing your filter settings or search query to find AI tools.
                </p>
                <button
                  onClick={() => {
                    setCategoryFilter('all');
                    setPlatformFilter('all');
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

      {/* Popular Topics */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trending AI Tools</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Explore the most popular AI tools and frameworks</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {popularTools.map((tool, index) => (
              <div
                key={index}
                className="group relative px-6 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <span className="text-gray-300 group-hover:text-purple-400 transition-colors font-medium">
                  {tool}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Build with AI?
                </h2>
                <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of developers, researchers, and innovators who are using these powerful AI tools 
                  to create the next generation of intelligent applications.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-600 text-white font-bold text-lg rounded-xl hover:from-purple-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <span className="relative flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Explore All Tools
                    </span>
                  </button>
                  <button className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-400 font-bold text-lg rounded-xl hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105">
                    <span className="flex items-center">
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Learn More
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}