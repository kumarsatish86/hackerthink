import React from 'react';

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

interface StructuredDataScriptProps {
  params: Promise<{ module: string; section: string; lesson: string }>;
}

// Function to fetch lesson data for structured data generation
async function getLessonData(moduleSlug: string, sectionSlug: string, lessonSlug: string): Promise<Lesson | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/tutorials/lessons/view/${lessonSlug}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching lesson data for structured data:', error);
    return null;
  }
}

export default async function StructuredDataScript({ params }: StructuredDataScriptProps) {
  const { module: moduleSlug, section: sectionSlug, lesson: lessonSlug } = await params;
  
  const lesson = await getLessonData(moduleSlug, sectionSlug, lessonSlug);
  
  if (!lesson) {
    return null;
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const metaTitle = lesson.meta_title || lesson.title;
  const metaDescription = lesson.meta_description || lesson.excerpt || lesson.content.substring(0, 160).replace(/<[^>]*>/g, '');
  const canonicalUrl = lesson.canonical_url || `${baseUrl}/tutorials/${moduleSlug}/${sectionSlug}/${lessonSlug}`;
  
  // Generate structured data
  const structuredData = [
    // Article Schema
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": metaTitle,
      "description": metaDescription,
      "image": lesson.og_image || `${baseUrl}/images/tutorial-default.jpg`,
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
      "datePublished": lesson.created_at,
      "dateModified": lesson.updated_at,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": canonicalUrl
      },
      "articleSection": "Tutorial",
      "keywords": lesson.meta_keywords || `${lesson.difficulty_level}, linux tutorial, ${lesson.title.toLowerCase()}`,
      "wordCount": lesson.content.replace(/<[^>]*>/g, '').split(' ').length,
      "timeRequired": `PT${lesson.reading_time || lesson.estimated_time}M`,
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
      "name": `${lesson.module_title} - ${lesson.title}`,
      "description": metaDescription,
      "provider": {
        "@type": "Organization",
        "name": "LinuxConcept",
        "url": baseUrl
      },
      "courseCode": lesson.slug,
      "educationalLevel": lesson.difficulty_level,
      "timeRequired": `PT${lesson.reading_time || lesson.estimated_time}M`,
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": canonicalUrl,
        "category": "Online Course"
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "name": lesson.title,
        "courseMode": "online",
        "inLanguage": "en-US",
        "url": canonicalUrl,
        "startDate": lesson.created_at,
        "endDate": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
                 "instructor": {
           "@type": "Person",
           "name": "LinuxConcept Team",
           "url": baseUrl
         },
        "courseWorkload": `PT${lesson.reading_time || lesson.estimated_time}M`
      },
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
          "name": lesson.module_title,
          "item": `${baseUrl}/tutorials/${moduleSlug}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": lesson.section_title,
          "item": `${baseUrl}/tutorials/${moduleSlug}/${sectionSlug}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": lesson.title,
          "item": canonicalUrl
        }
      ]
    },
    // HowTo Schema
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": lesson.title,
      "description": metaDescription,
      "image": lesson.og_image || `${baseUrl}/images/tutorial-default.jpg`,
      "totalTime": `PT${lesson.reading_time || lesson.estimated_time}M`,
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
  
  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}
    </>
  );
}
