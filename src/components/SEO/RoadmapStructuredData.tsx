import React from 'react';
import { RoadmapData, RoadmapStructuredDataProps } from '@/types/roadmap';

export default function RoadmapStructuredData({ roadmap }: RoadmapStructuredDataProps) {
  // Generate structured data for LearningResource schema
  const learningResourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": roadmap.title,
    "description": roadmap.seo_description || roadmap.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`,
    "image": roadmap.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/roadmap-default.png`,
    "provider": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "educationalLevel": roadmap.level || "Intermediate",
    "learningResourceType": "Course",
    "timeRequired": roadmap.duration || "P30D", // 30 days default
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "keywords": roadmap.seo_keywords || `${roadmap.title}, learning roadmap, ${roadmap.level || 'intermediate'} level`,
    "audience": {
      "@type": "Audience",
      "audienceType": "Students, Professionals, System Administrators"
    },
    "teaches": Array.isArray(roadmap.modules) ? roadmap.modules.map(module => ({
      "@type": "Thing",
      "name": module.title,
      "description": module.description
    })) : [],
    "coursePrerequisites": Array.isArray(roadmap.prerequisites) ? roadmap.prerequisites.map(prereq => ({
      "@type": "Thing",
      "name": prereq.title,
      "description": prereq.description,
      "url": prereq.link
    })) : [],
    "about": {
      "@type": "Thing",
      "name": "Linux System Administration",
      "description": "Comprehensive learning path for Linux system administration skills"
    },
    "dateCreated": roadmap.created_at,
    "dateModified": roadmap.updated_at,
    "version": "1.0"
  };

  // Generate structured data for Course schema
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": roadmap.title,
    "description": roadmap.seo_description || roadmap.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`,
    "image": roadmap.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/roadmap-default.png`,
    "provider": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "courseMode": "online",
    "educationalLevel": roadmap.level || "Intermediate",
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`,
      "category": "Online Course",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
    },
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": roadmap.duration || "PT40H",
      "courseSchedule": {
        "@type": "Schedule",
        "scheduleTimezone": "UTC",
        "repeatFrequency": "Daily",
        "repeatCount": 365,
        "startTime": "00:00",
        "endTime": "23:59"
      },
      "instructor": {
        "@type": "Person",
        "name": "HackerThink Team"
      }
    },
    "syllabusSections": Array.isArray(roadmap.modules) ? roadmap.modules.map((module, index) => ({
      "@type": "Syllabus",
      "name": `Module ${index + 1}: ${module.title}`,
      "description": module.description,
      "timeRequired": module.duration || "P7D",
      "educationalLevel": module.level || roadmap.level || "Intermediate"
    })) : [],
    "coursePrerequisites": Array.isArray(roadmap.prerequisites) ? roadmap.prerequisites.map(prereq => ({
      "@type": "Course",
      "name": prereq.title,
      "description": prereq.description
    })) : [],
    "keywords": roadmap.seo_keywords || `${roadmap.title}, learning roadmap, ${roadmap.level || 'intermediate'} level`,
    "about": {
      "@type": "Thing",
      "name": "Linux System Administration",
      "description": "Comprehensive learning path for Linux system administration skills"
    },
    "dateCreated": roadmap.created_at,
    "dateModified": roadmap.updated_at
  };

  // Generate structured data for HowTo schema (learning path)
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Learn ${roadmap.title}`,
    "description": `Complete learning path for ${roadmap.title} - ${roadmap.description}`,
    "image": roadmap.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/roadmap-default.png`,
    "author": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "dateCreated": roadmap.created_at,
    "dateModified": roadmap.updated_at,
    "totalTime": roadmap.duration || "P30D",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Computer with Linux operating system"
      },
      {
        "@type": "HowToSupply",
        "name": "Internet connection for accessing resources"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Terminal or command line interface"
      },
      {
        "@type": "HowToTool",
        "name": "Text editor (vim, nano, or VS Code)"
      }
    ],
    "step": Array.isArray(roadmap.modules) ? roadmap.modules.map((module, index) => ({
      "@type": "HowToStep",
      "name": `Module ${index + 1}: ${module.title}`,
      "text": module.description || `Complete the ${module.title} module`,
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}#module-${module.id}`,
      "image": roadmap.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/roadmap-default.png`
    })) : []
  };

  // Generate structured data for CreativeWork schema
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": roadmap.title,
    "description": roadmap.seo_description || roadmap.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`,
    "image": roadmap.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/roadmap-default.png`,
    "author": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "dateCreated": roadmap.created_at,
    "dateModified": roadmap.updated_at,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "keywords": roadmap.seo_keywords || `${roadmap.title}, learning roadmap, ${roadmap.level || 'intermediate'} level`,
    "genre": "Educational Content",
    "about": {
      "@type": "Thing",
      "name": "Linux System Administration",
      "description": "Comprehensive learning path for Linux system administration skills"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Students, Professionals, System Administrators"
    },
    "hasPart": Array.isArray(roadmap.modules) ? roadmap.modules.map(module => ({
      "@type": "CreativeWork",
      "name": module.title,
      "description": module.description,
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}#module-${module.id}`
    })) : []
  };

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Learning Roadmaps",
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": roadmap.title,
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`
      }
    ]
  };

  // Generate CollectionPage schema for modules
  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${roadmap.title} - Learning Modules`,
    "description": `Collection of learning modules for ${roadmap.title} roadmap`,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${roadmap.title} Learning Modules`,
      "numberOfItems": Array.isArray(roadmap.modules) ? roadmap.modules.length : 0,
      "itemListElement": Array.isArray(roadmap.modules) ? roadmap.modules.map((module, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": module.title,
        "description": module.description,
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}#module-${module.id}`
      })) : []
    }
  };

  // Generate WebPage schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": roadmap.seo_title || roadmap.title,
    "description": roadmap.seo_description || roadmap.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`,
    "image": roadmap.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/roadmap-default.png`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "about": {
      "@type": "LearningResource",
      "name": roadmap.title,
      "description": roadmap.description
    },
    "mainEntity": {
      "@type": "LearningResource",
      "name": roadmap.title,
      "description": roadmap.description
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Learning Roadmaps",
          "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": roadmap.title,
          "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/learning-roadmap/${roadmap.slug}`
        }
      ]
    },
    "dateCreated": roadmap.created_at,
    "dateModified": roadmap.updated_at,
    "inLanguage": "en"
  };

  // Parse custom schema if provided
  let customSchema = null;
  try {
    customSchema = roadmap.schema_json ? JSON.parse(roadmap.schema_json) : null;
  } catch (error) {
    console.warn('Failed to parse custom schema JSON:', error);
  }

  return (
    <>
      {/* LearningResource Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(learningResourceSchema, null, 2)
        }}
      />
      
      {/* Course Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(courseSchema, null, 2)
        }}
      />
      
      {/* HowTo Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema, null, 2)
        }}
      />
      
      {/* CreativeWork Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(creativeWorkSchema, null, 2)
        }}
      />
      
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2)
        }}
      />
      
      {/* CollectionPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema, null, 2)
        }}
      />
      
      {/* WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema, null, 2)
        }}
      />
      
      {/* Custom Schema (if provided) */}
      {customSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(customSchema, null, 2)
          }}
        />
      )}
    </>
  );
}
