'use client';

import React, { useState, useEffect } from 'react';

interface LessonSEOFormProps {
  lessonData: {
    title: string;
    excerpt: string;
    content: string;
    estimated_time: number;
    difficulty_level: string;
  };
  seoData: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
    reading_time: number;
  };
  onSEOChange: (seoData: any) => void;
}

const LessonSEOForm: React.FC<LessonSEOFormProps> = ({
  lessonData,
  seoData,
  onSEOChange
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [seoScore, setSeoScore] = useState(0);

  // Calculate SEO score based on various factors
  useEffect(() => {
    let score = 0;
    
    if (seoData.meta_title && seoData.meta_title.length > 0) score += 15;
    if (seoData.meta_title && seoData.meta_title.length <= 60) score += 10;
    if (seoData.meta_description && seoData.meta_description.length > 0) score += 15;
    if (seoData.meta_description && seoData.meta_description.length <= 160) score += 10;
    if (seoData.meta_keywords && seoData.meta_keywords.length > 0) score += 10;
    if (seoData.og_title && seoData.og_title.length > 0) score += 10;
    if (seoData.og_description && seoData.og_description.length > 0) score += 10;
    if (seoData.og_image && seoData.og_image.length > 0) score += 10;
    if (seoData.reading_time && seoData.reading_time > 0) score += 10;
    
    setSeoScore(Math.min(score, 100));
  }, [seoData]);

  const handleInputChange = (field: string, value: string | number) => {
    const newSeoData = { ...seoData, [field]: value };
    onSEOChange(newSeoData);
  };

  const generateStructuredData = () => {
    const baseUrl = "https://ainews.com";
    const metaTitle = seoData.meta_title || lessonData.title;
    const metaDescription = seoData.meta_description || lessonData.excerpt || lessonData.content.substring(0, 160).replace(/<[^>]*>/g, '');
    const metaKeywords = seoData.meta_keywords || `${lessonData.difficulty_level}, linux tutorial, ${lessonData.title.toLowerCase()}`;
    const canonicalUrl = seoData.canonical_url || "";
    const ogImage = seoData.og_image || `${baseUrl}/images/tutorial-default.jpg`;
    const readingTime = seoData.reading_time || lessonData.estimated_time;
    const wordCount = lessonData.content.replace(/<[^>]*>/g, '').split(' ').length;

    const structuredData = [
      // Article Schema
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": metaTitle,
        "description": metaDescription,
        "image": ogImage,
        "author": {
          "@type": "Organization",
          "name": "LinuxConcept",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "LinuxConcept",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`,
            "width": 200,
            "height": 200
          }
        },
        "datePublished": new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        "articleSection": "Tutorial",
        "keywords": metaKeywords,
        "wordCount": wordCount,
        "timeRequired": `PT${readingTime}M`,
        "inLanguage": "en-US",
        "isAccessibleForFree": true,
        "about": [
          {
            "@type": "Thing",
            "name": "Linux"
          },
          {
            "@type": "Thing",
            "name": "System Administration"
          }
        ],
        "audience": {
          "@type": "Audience",
          "audienceType": "Students and Professionals"
        }
      },
      // Course Schema
      {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": `Tutorial - ${lessonData.title}`,
        "description": metaDescription,
        "provider": {
          "@type": "Organization",
          "name": "LinuxConcept",
          "url": baseUrl
        },
        "courseCode": lessonData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        "educationalLevel": lessonData.difficulty_level,
        "timeRequired": `PT${readingTime}M`,
        "inLanguage": "en-US",
        "isAccessibleForFree": true,
        "teaches": [
          {
            "@type": "DefinedTerm",
            "name": "Linux System Administration"
          }
        ],
        "about": [
          {
            "@type": "Thing",
            "name": "Linux"
          }
        ]
      },
      // BreadcrumbList Schema
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Tutorials",
            "item": `${baseUrl}/tutorials`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Tutorial Module",
            "item": `${baseUrl}/tutorials/module`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "Tutorial Section",
            "item": `${baseUrl}/tutorials/module/section`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": lessonData.title,
            "item": canonicalUrl
          }
        ]
      },
      // HowTo Schema
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": lessonData.title,
        "description": metaDescription,
        "image": ogImage,
        "totalTime": `PT${readingTime}M`,
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "USD",
          "value": "0"
        },
        "supply": [],
        "tool": [],
        "step": [
          {
            "@type": "HowToStep",
            "name": "Read the tutorial",
            "text": "Follow along with this comprehensive tutorial to learn about Linux concepts and best practices.",
            "url": canonicalUrl
          }
        ]
      }
    ];

    return JSON.stringify(structuredData, null, 2);
  };

  const autoGenerateSEO = () => {
    const newSeoData = {
      meta_title: lessonData.title,
      meta_description: lessonData.excerpt || lessonData.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      meta_keywords: `${lessonData.difficulty_level}, linux tutorial, ${lessonData.title.toLowerCase()}`,
      canonical_url: "",
      og_title: lessonData.title,
      og_description: lessonData.excerpt || lessonData.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      og_image: "",
      twitter_title: lessonData.title,
      twitter_description: lessonData.excerpt || lessonData.content.substring(0, 160).replace(/<[^>]*>/g, ''),
      twitter_image: "",
      reading_time: lessonData.estimated_time
    };
    
    onSEOChange(newSeoData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">SEO & Meta Settings</h3>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={autoGenerateSEO}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Auto-Generate SEO
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">SEO Score:</span>
            <div className="w-16 h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  seoScore >= 80 ? 'bg-blue-600' : 
                  seoScore >= 60 ? 'bg-blue-500' : 
                  'bg-blue-400'
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
            <span className="text-sm font-medium">{seoScore}/100</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['basic', 'social', 'advanced'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Basic SEO Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={seoData.meta_title}
              onChange={(e) => handleInputChange('meta_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meta title (max 60 characters)"
              maxLength={60}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Used for search engine results</span>
              <span>{seoData.meta_title.length}/60</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              value={seoData.meta_description}
              onChange={(e) => handleInputChange('meta_description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meta description (max 160 characters)"
              maxLength={160}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Used for search engine snippets</span>
              <span>{seoData.meta_description.length}/160</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              value={seoData.meta_keywords}
              onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter keywords separated by commas"
            />
            <div className="text-xs text-gray-500 mt-1">
              Keywords help search engines understand your content
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canonical URL
            </label>
            <input
              type="url"
              value={seoData.canonical_url}
              onChange={(e) => handleInputChange('canonical_url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/canonical-url"
            />
            <div className="text-xs text-gray-500 mt-1">
              Prevents duplicate content issues
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reading Time (minutes)
            </label>
            <input
              type="number"
              value={seoData.reading_time}
              onChange={(e) => handleInputChange('reading_time', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="15"
              min="1"
              max="300"
            />
            <div className="text-xs text-gray-500 mt-1">
              Estimated time to read the lesson
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">Open Graph (Facebook, LinkedIn)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Title
                </label>
                <input
                  type="text"
                  value={seoData.og_title}
                  onChange={(e) => handleInputChange('og_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title for social media sharing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Description
                </label>
                <textarea
                  value={seoData.og_description}
                  onChange={(e) => handleInputChange('og_description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description for social media sharing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OG Image URL
                </label>
                <input
                  type="url"
                  value={seoData.og_image}
                  onChange={(e) => handleInputChange('og_image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <div className="bg-sky-50 p-4 rounded-md">
            <h4 className="font-medium text-sky-900 mb-2">Twitter Cards</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter Title
                </label>
                <input
                  type="text"
                  value={seoData.twitter_title}
                  onChange={(e) => handleInputChange('twitter_title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title for Twitter sharing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter Description
                </label>
                <textarea
                  value={seoData.twitter_description}
                  onChange={(e) => handleInputChange('twitter_description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description for Twitter sharing"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter Image URL
                </label>
                <input
                  type="url"
                  value={seoData.twitter_image}
                  onChange={(e) => handleInputChange('twitter_image', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/twitter-image.jpg"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Structured Data (JSON-LD)
            </label>
            <textarea
              value={generateStructuredData()}
              readOnly
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              This structured data is automatically generated and will be included in your lesson page
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="font-medium text-yellow-900 mb-2">SEO Tips</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Meta titles should be 50-60 characters long</li>
              <li>• Meta descriptions should be 150-160 characters long</li>
              <li>• Use relevant keywords naturally in your content</li>
              <li>• Include a compelling call-to-action in descriptions</li>
              <li>• Use high-quality images for social media sharing</li>
              <li>• Keep content fresh and updated regularly</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonSEOForm;
