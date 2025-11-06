'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Article {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  category: string;
  categorySlug?: string;
  author: string;
  time: string;
  sourceType?: 'article' | 'news'; // Track if it's from articles or news table
}

interface HomePageData {
  topStory: Article | null;
  breakingNews: Article[];
  latestNews: Article[];
  techNews: Article[];
  businessNews: Article[];
  researchNews: Article[];
  opinionNews: Article[];
  worldNews: Article[];
  trendingTopics: string[];
  quickNews: Article[];
}

export default function Home() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/home');
      
      if (!response.ok) {
        throw new Error('Failed to fetch home page data');
      }
      
      const homeData = await response.json();
      setData(homeData);
    } catch (err) {
      console.error('Error fetching home page data:', err);
      setError('Failed to load home page content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-red-600 mb-4">{error || 'No data available'}</p>
          <button
            onClick={fetchHomePageData}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    topStory,
    breakingNews,
    latestNews,
    techNews,
    businessNews,
    researchNews,
    opinionNews,
    worldNews,
    trendingTopics,
    quickNews,
  } = data;

  // Helper function to get article/news URL
  const getArticleUrl = (item: Article) => {
    return item.sourceType === 'news' ? `/news/${item.slug}` : `/articles/${item.slug}`;
  };

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('breaking') || categoryLower.includes('tech')) {
      return 'bg-red-600 text-white';
    } else if (categoryLower.includes('research')) {
      return 'bg-blue-600 text-white';
    } else if (categoryLower.includes('business') || categoryLower.includes('funding')) {
      return 'bg-green-600 text-white';
    } else if (categoryLower.includes('opinion') || categoryLower.includes('editorial')) {
      return 'bg-orange-600 text-white';
    } else if (categoryLower.includes('policy')) {
      return 'bg-purple-600 text-white';
    }
    return 'bg-gray-600 text-white';
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Main News Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main News Column */}
          <div className="lg:col-span-3">
            {/* Top Story */}
            {topStory && (
              <div className="mb-8 border-b border-gray-200 pb-8">
                <div className="flex items-center mb-4">
                  <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold mr-3">TOP STORY</span>
                  <span className="text-sm text-gray-500">{topStory.time}</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  <Link href={topStory.sourceType === 'news' ? `/news/${topStory.slug}` : `/articles/${topStory.slug}`} className="hover:text-red-600">
                    {topStory.title}
                  </Link>
                </h1>
                <p className="text-lg text-gray-700 mb-4">{topStory.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By {topStory.author}</span>
                  <span className="mx-2">•</span>
                  <span>{topStory.time}</span>
                </div>
              </div>
            )}

            {/* Breaking News Grid */}
            {breakingNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {breakingNews.map((news) => (
                  <div key={news.id} className="border-b border-gray-100 pb-6">
                    <div className="flex items-center mb-2">
                      <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                        {news.category}
                      </span>
                      <span className="text-sm text-gray-500">{news.time}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      <Link href={news.sourceType === 'news' ? `/news/${news.slug}` : `/articles/${news.slug}`} className="hover:text-red-600">
                        {news.title}
                      </Link>
                    </h2>
                    <p className="text-gray-700 text-sm">{news.excerpt}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tech News Hero Section */}
            {techNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Tech News</h2>
                
                {/* Featured Tech Story */}
                {techNews[0] && (
                  <div className="mb-6 border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-blue-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                      <span className="text-sm text-gray-500">{techNews[0].time}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      <Link href={getArticleUrl(techNews[0])} className="hover:text-red-600">
                        {techNews[0].title}
                      </Link>
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">{techNews[0].excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {techNews[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{techNews[0].time}</span>
                    </div>
                  </div>
                )}
                
                {/* Secondary Tech Stories */}
                {techNews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {techNews.slice(1).map((news) => (
                      <div key={news.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                            {news.category}
                          </span>
                          <span className="text-sm text-gray-500">{news.time}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <Link href={getArticleUrl(news)} className="hover:text-red-600">
                            {news.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 text-sm">{news.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
                
            {/* Business News Hero Section */}
            {businessNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Business</h2>
                
                {/* Featured Business Story */}
                {businessNews[0] && (
                  <div className="mb-6 border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                      <span className="text-sm text-gray-500">{businessNews[0].time}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      <Link href={getArticleUrl(businessNews[0])} className="hover:text-red-600">
                        {businessNews[0].title}
                      </Link>
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">{businessNews[0].excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {businessNews[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{businessNews[0].time}</span>
                    </div>
                  </div>
                )}

                {/* Secondary Business Stories */}
                {businessNews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {businessNews.slice(1).map((news) => (
                      <div key={news.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                            {news.category}
                          </span>
                          <span className="text-sm text-gray-500">{news.time}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <Link href={getArticleUrl(news)} className="hover:text-red-600">
                            {news.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 text-sm">{news.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Research News Hero Section */}
            {researchNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Research</h2>
                
                {/* Featured Research Story */}
                {researchNews[0] && (
                  <div className="mb-6 border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-green-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                      <span className="text-sm text-gray-500">{researchNews[0].time}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      <Link href={getArticleUrl(researchNews[0])} className="hover:text-red-600">
                        {researchNews[0].title}
                      </Link>
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">{researchNews[0].excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {researchNews[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{researchNews[0].time}</span>
                    </div>
                  </div>
                )}

                {/* Secondary Research Stories */}
                {researchNews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {researchNews.slice(1).map((news) => (
                      <div key={news.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                            {news.category}
                          </span>
                          <span className="text-sm text-gray-500">{news.time}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <Link href={getArticleUrl(news)} className="hover:text-red-600">
                            {news.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 text-sm">{news.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
                
            {/* Opinion Hero Section */}
            {opinionNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Opinion</h2>
                
                {/* Featured Opinion Story */}
                {opinionNews[0] && (
                  <div className="mb-6 border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-orange-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                      <span className="text-sm text-gray-500">{opinionNews[0].time}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      <Link href={getArticleUrl(opinionNews[0])} className="hover:text-red-600">
                        {opinionNews[0].title}
                      </Link>
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">{opinionNews[0].excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {opinionNews[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{opinionNews[0].time}</span>
                    </div>
                  </div>
                )}

                {/* Secondary Opinion Stories */}
                {opinionNews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {opinionNews.slice(1).map((news) => (
                      <div key={news.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                            {news.category}
                          </span>
                          <span className="text-sm text-gray-500">{news.time}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <Link href={getArticleUrl(news)} className="hover:text-red-600">
                            {news.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 text-sm mb-2">{news.excerpt}</p>
                        <p className="text-xs text-gray-500">By {news.author}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
      
            {/* World News Hero Section */}
            {worldNews.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">World</h2>
                
                {/* Featured World Story */}
                {worldNews[0] && (
                  <div className="mb-6 border-b border-gray-200 pb-6">
                    <div className="flex items-center mb-4">
                      <span className="bg-red-600 text-white px-2 py-1 text-xs font-bold mr-3">FEATURED</span>
                      <span className="text-sm text-gray-500">{worldNews[0].time}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      <Link href={getArticleUrl(worldNews[0])} className="hover:text-red-600">
                        {worldNews[0].title}
                      </Link>
                    </h1>
                    <p className="text-lg text-gray-700 mb-4">{worldNews[0].excerpt}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>By {worldNews[0].author}</span>
                      <span className="mx-2">•</span>
                      <span>{worldNews[0].time}</span>
                    </div>
                  </div>
                )}
          
                {/* Secondary World Stories */}
                {worldNews.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {worldNews.slice(1).map((news) => (
                      <div key={news.id} className="border-b border-gray-100 pb-4">
                        <div className="flex items-center mb-2">
                          <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                            {news.category}
                          </span>
                          <span className="text-sm text-gray-500">{news.time}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          <Link href={getArticleUrl(news)} className="hover:text-red-600">
                            {news.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 text-sm">{news.excerpt}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Latest News Feed */}
            {latestNews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-2">Latest News</h2>
                <div className="space-y-4">
                  {latestNews.map((news) => (
                    <div key={news.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className={`px-2 py-1 text-xs font-bold mr-2 ${getCategoryColor(news.category)}`}>
                              {news.category}
                            </span>
                            <span className="text-sm text-gray-500">{news.time}</span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            <Link href={`/articles/${news.slug}`} className="hover:text-red-600">
                              {news.title}
                            </Link>
                          </h3>
                          <p className="text-gray-700 text-sm">{news.excerpt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
      
          {/* News Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Market Watch */}
              <div className="bg-gray-50 p-4 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Market Watch</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Stocks</span>
                    <span className="text-sm text-green-600">+2.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tech Sector</span>
                    <span className="text-sm text-green-600">+1.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Crypto AI</span>
                    <span className="text-sm text-red-600">-0.5%</span>
                  </div>
                </div>
              </div>
                
              {/* Trending Now */}
              {trendingTopics.length > 0 && (
                <div className="bg-gray-50 p-4 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Trending Now</h3>
                  <div className="space-y-3">
                    {trendingTopics.slice(0, 5).map((topic, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-sm font-bold text-gray-400 mr-2">{index + 1}</span>
                        <Link
                          href={`/search?q=${encodeURIComponent(topic)}`}
                          className="text-sm text-gray-700 hover:text-red-600"
                        >
                          {topic}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
      
              {/* Quick News */}
              {quickNews.length > 0 && (
                <div className="bg-gray-50 p-4 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Quick News</h3>
                  <div className="space-y-3">
                    {quickNews.map((news, index) => (
                      <div key={news.id} className="text-sm">
                        <span className="text-gray-500">{news.time}</span>
                        <p className="text-gray-700 mt-1">{news.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
      
              {/* Newsletter */}
              <div className="bg-red-600 text-white p-4">
                <h3 className="text-lg font-bold mb-2">Newsletter</h3>
                <p className="text-sm opacity-90 mb-4">Get breaking AI news delivered to your inbox</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded text-gray-900 text-sm"
                  />
                  <button className="w-full bg-white text-red-600 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition-colors">
                    Subscribe
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
