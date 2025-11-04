'use client';

import React from 'react';
import Head from 'next/head';

interface LessonMetaTagsProps {
  lesson: {
    title: string;
    excerpt: string;
    content: string;
    slug: string;
    estimated_time: number;
    difficulty_level: string;
    created_at: string;
    updated_at: string;
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
    reading_time?: number;
    structured_data?: string;
  };
  module: {
    title: string;
    slug: string;
  };
  section: {
    title: string;
    slug: string;
  };
  baseUrl: string;
}

const LessonMetaTags: React.FC<LessonMetaTagsProps> = ({
  lesson,
  module,
  section,
  baseUrl
}) => {
  // Default values if SEO fields are not set
  const metaTitle = lesson.meta_title || lesson.title;
  const metaDescription = lesson.meta_description || lesson.excerpt || lesson.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const metaKeywords = lesson.meta_keywords || `${lesson.difficulty_level}, linux tutorial, ${lesson.title.toLowerCase()}`;
  const canonicalUrl = lesson.canonical_url || `${baseUrl}/tutorials/${module.slug}/${section.slug}/${lesson.slug}`;
  
  // Social media defaults
  const ogTitle = lesson.og_title || lesson.title;
  const ogDescription = lesson.og_description || lesson.excerpt || lesson.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const ogImage = lesson.og_image || `${baseUrl}/images/tutorial-default.jpg`;
  
  const twitterTitle = lesson.twitter_title || lesson.title;
  const twitterDescription = lesson.twitter_description || lesson.excerpt || lesson.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const twitterImage = lesson.twitter_image || `${baseUrl}/images/tutorial-default.jpg`;
  
  const readingTime = lesson.reading_time || lesson.estimated_time;
  const wordCount = lesson.content.replace(/<[^>]*>/g, '').split(' ').length;

  // Use stored structured data if available, otherwise generate it
  let structuredData;
  
  console.log('LessonMetaTags - structured_data field:', {
    hasStructuredData: !!lesson.structured_data,
    structuredDataLength: lesson.structured_data?.length || 0,
    structuredDataPreview: lesson.structured_data?.substring(0, 100) + '...'
  });
  
  if (lesson.structured_data) {
    try {
      structuredData = JSON.parse(lesson.structured_data);
      console.log('LessonMetaTags - Successfully parsed stored structured data');
    } catch (error) {
      console.error('Error parsing stored structured data:', error);
      structuredData = null;
    }
  } else {
    console.log('LessonMetaTags - No stored structured data, will generate fallback');
  }
  
  // Fallback to generating structured data if not available or invalid
  if (!structuredData) {
    structuredData = [
      // Article Schema
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": metaTitle,
        "description": metaDescription,
        "image": ogImage,
        "author": {
          "@type": "Organization",
          "name": "HackerThink",
          "url": baseUrl
        },
        "publisher": {
          "@type": "Organization",
          "name": "HackerThink",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/logo.png`,
            "width": 200,
            "height": 200
          }
        },
        "datePublished": lesson.created_at,
        "dateModified": lesson.updated_at,
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
        "name": `${module.title} - ${lesson.title}`,
        "description": metaDescription,
        "provider": {
          "@type": "Organization",
          "name": "HackerThink",
          "url": baseUrl
        },
        "courseCode": lesson.slug,
        "educationalLevel": lesson.difficulty_level,
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
            "name": module.title,
            "item": `${baseUrl}/tutorials/${module.slug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": section.title,
            "item": `${baseUrl}/tutorials/${module.slug}/${section.slug}`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": lesson.title,
            "item": canonicalUrl
          }
        ]
      },
      // HowTo Schema (if applicable)
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": lesson.title,
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
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="author" content="HackerThink" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="HackerThink" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:site" content="@ainews" />
      
      {/* Additional Meta Tags */}
      <meta name="article:published_time" content={lesson.created_at} />
      <meta name="article:modified_time" content={lesson.updated_at} />
      <meta name="article:section" content="Tutorial" />
      <meta name="article:tag" content={metaKeywords} />
      
      {/* Reading Time and Difficulty */}
      <meta name="reading-time" content={readingTime.toString()} />
      <meta name="difficulty-level" content={lesson.difficulty_level} />
      <meta name="word-count" content={wordCount.toString()} />
      
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      ))}
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Head>
  );
};

export default LessonMetaTags;
