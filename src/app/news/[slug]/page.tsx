'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaUser, FaTag, FaShareAlt, FaBookmark, FaEye } from 'react-icons/fa';
import CategoryNewsList from '@/components/news/CategoryNewsList';
import BreakingNewsList from '@/components/news/BreakingNewsList';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  featured_image_alt?: string;
  status: string;
  author_name?: string;
  category_name?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  publish_date?: string;
}

// Process article content to optimize images
const ArticleContent = ({ content }: { content: string }) => {
  const processedContent = useMemo(() => {
    if (typeof window === 'undefined') return content;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Process all images in the content
      const images = doc.querySelectorAll('img');
      images.forEach((img) => {
        // Add loading="lazy" to images that are not in the viewport
        img.setAttribute('loading', 'lazy');
        
        // Add width and height to prevent layout shift
        if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
          img.setAttribute('width', '800');
          img.setAttribute('height', '450');
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        }
        
        // Add decoding="async" for better performance
        img.setAttribute('decoding', 'async');
      });
      
      return doc.body.innerHTML;
    } catch (error) {
      console.error('Error processing article content:', error);
      return content;
    }
  }, [content]);

  return (
    <div 
      dangerouslySetInnerHTML={{ __html: processedContent }}
      className="text-gray-800 leading-relaxed"
    />
  );
};

// Category mapping: URL slug -> (categorySlug, categoryName)
const categoryMap: Record<string, { slug: string; name: string }> = {
  tech: { slug: 'technology', name: 'Tech' },
  business: { slug: 'business', name: 'Business' },
  research: { slug: 'research', name: 'Research' },
  opinion: { slug: 'opinion', name: 'Opinion' },
  world: { slug: 'global-news', name: 'World' },
};

export default function NewsArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  // Check if this is a breaking news page (shows today's news)
  const categoryLower = slug?.toLowerCase() || '';
  
  if (categoryLower === 'breaking') {
    return <BreakingNewsList />;
  }
  
  // Check if this is a category page
  const categoryInfo = categoryMap[categoryLower];
  
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);

  // If it's a category, render CategoryNewsList instead
  if (categoryInfo) {
    return (
      <CategoryNewsList
        categorySlug={categoryInfo.slug}
        categoryName={categoryInfo.name}
      />
    );
  }

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Article not found');
        } else {
          setError('Failed to load article');
        }
        return;
      }
      
      const data = await response.json();
      setArticle(data.news);
      
      // Fetch related articles
      if (data.news?.category_name) {
        fetchRelatedArticles(data.news.category_name, data.news.id);
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (category: string, currentId: string) => {
    try {
      // Defer related articles loading to improve initial page load
      setTimeout(async () => {
        const response = await fetch(`/api/news?category=${category}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          // Filter out current article
          const related = data.news.filter((article: NewsArticle) => article.id !== currentId);
          setRelatedArticles(related.slice(0, 3));
        }
      }, 100); // Small delay to let main content load first
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else if (typeof window !== 'undefined' && navigator.clipboard) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
          <p className="text-lg text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Article Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full">
              {/* Breadcrumb */}
              <nav className="flex mb-4 sm:mb-6 overflow-x-auto" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 min-w-max">
                  <li>
                    <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                      Home
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li>
                    <Link href="/news" className="text-gray-500 hover:text-gray-700 text-sm">
                      News
                    </Link>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li className="text-gray-900 font-medium text-sm truncate">{article.category_name || 'Article'}</li>
                </ol>
              </nav>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  <span>{formatDate(article.created_at)}</span>
                </div>
                {article.author_name && (
                  <div className="flex items-center">
                    <FaUser className="mr-2" />
                    <span>By {article.author_name}</span>
                  </div>
                )}
                {article.category_name && (
                  <div className="flex items-center">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      {article.category_name}
                    </span>
                  </div>
                )}
              </div>

              {/* Article Title */}
              <div className="relative w-full">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  {article.title}
                </h1>

                {/* Article Excerpt */}
                {article.excerpt && (
                  <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </div>
            
            {/* Newsletter Signup - Part of Hero Section */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-red-600 text-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-base sm:text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-xs sm:text-sm opacity-90 mb-4">
                  Get the latest AI news delivered to your inbox
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                  />
                  <button className="w-full bg-white text-red-600 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-xs opacity-75 mt-2">
                  Join 10,000+ AI professionals
                </p>
              </div>
            </div>
          </div>
          
          {/* Article Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-200 pt-4 sm:pt-6 mt-6 sm:mt-8">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {/* Social Share Icons */}
              <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                  title="Share on X (Twitter)"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                  </svg>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(article.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  title="Share on Telegram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="flex items-center justify-center w-8 h-8 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
                  title="Copy Link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              
              <button className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <FaBookmark className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
            
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <FaEye className="mr-1" />
              <span>Reading time: 5 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 w-full">
            {/* Featured Image */}
            {article.featured_image && (
              <div className="mb-6 sm:mb-8 relative w-full" style={{ aspectRatio: '16/9', minHeight: '200px' }}>
                <Image
                  src={article.featured_image}
                  alt={article.featured_image_alt || article.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                  className="object-cover rounded-lg shadow-lg"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
              <ArticleContent content={article.content} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                    >
                      <FaTag className="mr-1 text-xs" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 w-full">
            <div className="lg:sticky lg:top-8 space-y-4 sm:space-y-6">
              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Related Articles</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/news/${relatedArticle.slug}`}
                        className="block group"
                      >
                        <h4 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(relatedArticle.created_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
