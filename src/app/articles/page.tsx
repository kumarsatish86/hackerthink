'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  author_name: string;
  category?: string;
  reading_time?: number;
  like_count?: number;
}

interface PaginationData {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // AI Article Categories
  const categories = [
    { id: 'research', name: 'Research' },
    { id: 'analysis', name: 'Analysis' },
    { id: 'insights', name: 'Insights' },
    { id: 'trends', name: 'Trends' },
    { id: 'industry', name: 'Industry' },
    { id: 'opinion', name: 'Opinion' }
  ];

  // Popular AI Topics
  const popularTopics = [
    'Machine Learning',
    'Deep Learning',
    'Natural Language Processing',
    'Computer Vision',
    'Neural Networks',
    'TensorFlow',
    'PyTorch',
    'OpenAI API',
    'AI Ethics',
    'Model Training'
  ];
  
  // Featured AI Authors
  const featuredAuthors = [
    {
      name: 'Dr. Sarah Chen',
      role: 'AI Research Scientist',
      articles: 32,
      bio: 'Leading researcher in machine learning and neural networks with 10+ years of experience.',
      image: '/images/authors/sarah.jpg'
    },
    {
      name: 'Alex Rodriguez',
      role: 'AI Developer & Educator',
      articles: 28,
      bio: 'Expert in AI development, creating practical tutorials and guides for developers.',
      image: '/images/authors/alex.jpg'
    },
    {
      name: 'Emily Watson',
      role: 'AI Ethics Specialist',
      articles: 24,
      bio: 'Focused on responsible AI development and ethical implications of AI technology.',
      image: '/images/authors/emily.jpg'
    }
  ];

  const fetchArticles = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/articles?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      setArticles(data.articles);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handlePageChange = (page: number) => {
    fetchArticles(page);
  };

  // Mock featured article while waiting for real implementation
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  
  // Filter articles based on selected category and search query
  const filteredArticles = articles.filter(article => {
    if (categoryFilter !== 'all' && article.category !== categoryFilter) return false;
    
    if (searchQuery && !article.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 text-sm font-medium rounded-full mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Latest AI Insights
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              AI <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">Articles</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
              Discover cutting-edge AI research, industry insights, and expert analysis from the world's leading AI professionals
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20">
                  <div className="flex items-center p-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search articles, research, insights..."
                        className="block w-full pl-14 pr-4 py-4 text-lg bg-transparent placeholder-gray-500 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button className="ml-4 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Topics Section */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Topics</h2>
            <p className="text-lg text-gray-600">Explore the most discussed AI topics</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {popularTopics.map((topic, index) => (
              <a 
                key={index} 
                href={`/articles?topic=${encodeURIComponent(topic)}`}
                className="group relative px-6 py-3 bg-white/70 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
              >
                <span className="relative z-10">{topic}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            ))}
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        </div>
      )}
      
      {!loading && !error && (
        <>
          {/* Featured Article Section */}
          {featuredArticle && (
            <div className="relative py-20">
              {/* Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              </div>
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-full mb-4 shadow-lg">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Featured Article
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Editor's Choice</h2>
                  <p className="text-lg text-gray-600">Handpicked by our editorial team</p>
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-2xl border border-white/20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                      <div className="lg:col-span-2">
                        <div className="flex items-center text-sm text-gray-600 mb-6">
                          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-xs font-medium mr-4 shadow-lg">
                            {featuredArticle.category || 'Article'}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(featuredArticle.created_at).toLocaleDateString()}
                          </span>
                          <span className="mx-3">•</span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {featuredArticle.reading_time || '15'} min read
                          </span>
                        </div>
                        <Link href={`/articles/${featuredArticle.slug}`}>
                          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 hover:text-red-600 transition-colors leading-tight">
                            {featuredArticle.title}
                          </h3>
                        </Link>
                        <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                          {featuredArticle.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-semibold shadow-lg">
                              {featuredArticle.author_name?.charAt(0) || 'A'}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{featuredArticle.author_name}</p>
                              <p className="text-sm text-gray-600">AI Research Expert</p>
                            </div>
                          </div>
                          <Link 
                            href={`/articles/${featuredArticle.slug}`}
                            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            Read Article
                            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-lg border border-red-200">
                          <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">In-Depth Analysis</h4>
                            <p className="text-gray-600 leading-relaxed">
                              Comprehensive insights and expert perspectives on the latest AI developments
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Articles Section */}
          <div className="relative py-20">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    categoryFilter === 'all' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                      : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-red-50 border border-white/20 shadow-md hover:shadow-lg'
                  }`}
                >
                  All Articles
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setCategoryFilter(category.id)}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                      categoryFilter === category.id 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                        : 'bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-red-50 border border-white/20 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
              
              {/* Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.length > 0 ? filteredArticles.slice(featuredArticle ? 1 : 0).map((article, index) => (
                  <div key={article.id} className="group relative">
                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-3xl blur opacity-0 group-hover:opacity-25 transition duration-700"></div>
                    
                    <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 overflow-hidden border border-white/30 group-hover:scale-105 group-hover:-translate-y-2">
                      {/* Article Image/Visual Header */}
                      <div className="relative h-48 overflow-hidden">
                        {/* Dynamic Background based on category */}
                        <div className={`absolute inset-0 ${
                          article.category === 'Research' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                          article.category === 'Analysis' ? 'bg-gradient-to-br from-green-500 to-green-700' :
                          article.category === 'Insights' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                          article.category === 'Trends' ? 'bg-gradient-to-br from-orange-500 to-orange-700' :
                          article.category === 'Industry' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700' :
                          article.category === 'Opinion' ? 'bg-gradient-to-br from-pink-500 to-pink-700' :
                          'bg-gradient-to-br from-red-500 to-red-700'
                        }`}>
                          {/* Pattern Overlay */}
                          <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                          }}></div>
                          
                          {/* Floating Elements */}
                          <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-sm"></div>
                          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/15 rounded-full blur-sm"></div>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 rounded-full blur-sm"></div>
                        </div>
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            {article.category || 'Article'}
                          </span>
                        </div>
                        
                        {/* Reading Time */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-black/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {article.reading_time || '8'} min
                          </span>
                        </div>
                        
                        {/* Central Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {article.category === 'Research' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              ) : article.category === 'Analysis' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              ) : article.category === 'Insights' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              ) : article.category === 'Trends' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                              ) : article.category === 'Industry' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              ) : article.category === 'Opinion' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              )}
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      {/* Article Content */}
                      <div className="p-6">
                        <Link href={`/articles/${article.slug}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-red-600 transition-colors line-clamp-2 leading-tight group-hover:text-red-600">
                            {article.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        
                        {/* Author and Date */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                              {article.author_name?.charAt(0) || 'A'}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{article.author_name}</p>
                              <p className="text-xs text-gray-500 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(article.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <Link 
                            href={`/articles/${article.slug}`}
                            className="group/btn inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
                          >
                            Read
                            <svg className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-20">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Found</h3>
                      <p className="text-gray-600 mb-8">
                        We're working on adding more AI articles. Check back soon for the latest insights and research.
                      </p>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">AI Research</h4>
                            <p className="text-sm text-gray-600">Latest breakthroughs and discoveries</p>
                          </div>
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Industry Analysis</h4>
                            <p className="text-sm text-gray-600">Market trends and insights</p>
                          </div>
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Expert Opinions</h4>
                            <p className="text-sm text-gray-600">Thought leadership and perspectives</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <Link 
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Back to Homepage
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {articles.length > 0 && pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {[...Array(pagination.pages)].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                            pagination.page === page
                              ? 'text-red-600 bg-red-50 border-red-500 z-10'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.page === pagination.pages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
          
          {/* Featured Authors Section */}
          <div className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900">Meet Our AI Experts</h2>
                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                  Learn from our team of AI developers, researchers, and educators
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredAuthors.map((author, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="h-48 bg-red-100 flex items-center justify-center">
                      <div className="h-32 w-32 rounded-full bg-red-200 flex items-center justify-center text-red-600 font-bold text-2xl">
                        {author.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{author.name}</h3>
                      <p className="text-red-600 font-medium mb-3">{author.role}</p>
                      <p className="text-gray-600 mb-4">{author.bio}</p>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{author.articles} Articles</span>
                        <Link href={`/authors/${author.name.toLowerCase().replace(' ', '-')}`} className="text-red-600 hover:text-red-800 font-medium">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Newsletter Section - Full Width */}
          <div className="relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-red-400/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full mix-blend-multiply filter blur-3xl"></div>
            </div>
            
            <div className="relative py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                    Stay Updated with <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">AI Articles</span>
                  </h2>
                  
                  {/* Description */}
                  <p className="text-xl md:text-2xl text-red-100 max-w-4xl mx-auto mb-12 leading-relaxed">
                    Get the latest AI articles, research insights, and industry analysis delivered straight to your inbox. 
                    Join thousands of AI enthusiasts who trust us for cutting-edge content.
                  </p>
                  
                  {/* Enhanced Form */}
                  <div className="max-w-2xl mx-auto">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur opacity-50 group-hover:opacity-70 transition duration-500"></div>
                      <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20">
                        <form className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                              <svg className="h-6 w-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                            </div>
                            <input
                              type="email"
                              placeholder="Enter your email address"
                              className="w-full pl-14 pr-6 py-4 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-lg"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-8 py-4 bg-gradient-to-r from-white to-gray-100 text-red-700 font-bold text-lg rounded-xl hover:from-gray-100 hover:to-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Subscribe Now
                          </button>
                        </form>
                      </div>
                    </div>
                    
                    {/* Trust Indicators */}
                    <div className="mt-8 flex flex-wrap justify-center items-center gap-8 text-white/80">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">No spam, ever</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm">Secure & private</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm">Unsubscribe anytime</span>
                      </div>
                    </div>
                    
                    {/* Privacy Policy */}
                    <p className="mt-6 text-sm text-white/70">
                      We care about your data. Read our{' '}
                      <a href="/privacy-policy" className="text-white font-medium underline hover:text-yellow-300 transition-colors">
                        Privacy Policy
                      </a>
                      {' '}and{' '}
                      <a href="/terms-of-service" className="text-white font-medium underline hover:text-yellow-300 transition-colors">
                        Terms of Service
                      </a>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 