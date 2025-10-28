import React from 'react';
import { TermData, TermStructuredDataProps } from '@/types/term';

export default function TermStructuredData({ term }: TermStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const termUrl = `${baseUrl}/term/${term.slug}`;

  // Generate structured data for Article schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": term.term,
    "description": term.definition,
    "url": termUrl,
    "datePublished": term.created_at,
    "dateModified": term.updated_at,
    "author": {
      "@type": "Organization",
      "name": "LinuxConcept Team",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": termUrl
    },
    "articleSection": term.category,
    "keywords": [
      term.term,
      term.category,
      "IT terminology",
      "technical terms",
      "Linux concepts",
      "glossary",
      ...(term.related_terms?.map(rt => rt.term) || [])
    ].join(', '),
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "learningResourceType": "Definition",
    "educationalLevel": term.difficulty_level || "Beginner",
    "educationalUse": "Reference",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "student"
    }
  };

  // Generate structured data for WebPage schema
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `${term.term} - ${term.category} | LinuxConcept Glossary`,
    "description": term.definition,
    "url": termUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "LinuxConcept",
      "url": baseUrl
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Glossary",
          "item": `${baseUrl}/term`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": term.term,
          "item": termUrl
        }
      ]
    },
    "mainEntity": {
      "@type": "DefinedTerm",
      "name": term.term,
      "description": term.definition,
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "LinuxConcept IT Glossary",
        "description": "Comprehensive glossary of IT and Linux terminology"
      }
    }
  };

  // Generate structured data for DefinedTerm schema
  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": term.definition,
    "url": termUrl,
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "LinuxConcept IT Glossary",
      "description": "Comprehensive glossary of IT and Linux terminology",
      "url": `${baseUrl}/term`
    },
    "category": term.category,
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Difficulty Level",
        "value": term.difficulty_level || "Beginner"
      },
      {
        "@type": "PropertyValue",
        "name": "Category",
        "value": term.category
      }
    ],
    "relatedTerms": term.related_terms?.map(related => ({
      "@type": "DefinedTerm",
      "name": related.term,
      "url": `${baseUrl}/term/${related.slug}`
    })) || []
  };

  // Generate structured data for HowTo schema (if learning path exists)
  const howToSchema = term.learning_path ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to understand ${term.term}`,
    "description": `Learn about ${term.term} and its applications in ${term.category}`,
    "url": termUrl,
    "step": [
      {
        "@type": "HowToStep",
        "name": "Definition",
        "text": term.definition,
        "url": `${termUrl}#definition`
      },
      {
        "@type": "HowToStep",
        "name": "Examples",
        "text": "Review usage examples and practical applications",
        "url": `${termUrl}#examples`
      },
      {
        "@type": "HowToStep",
        "name": "Resources",
        "text": "Explore additional learning resources and documentation",
        "url": `${termUrl}#resources`
      }
    ],
    "totalTime": "PT5M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Basic IT knowledge"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Computer with internet access"
      }
    ]
  } : null;

  // Generate structured data for BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Glossary",
        "item": `${baseUrl}/term`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": term.term,
        "item": termUrl
      }
    ]
  };

  // Generate structured data for FAQPage schema (if knowledge test exists)
  const faqSchema = term.knowledge_test ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${term.term}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": term.definition
        }
      },
      {
        "@type": "Question",
        "name": `How is ${term.term} used in ${term.category}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": term.usage_examples || `Learn more about ${term.term} usage in our comprehensive guide.`
        }
      }
    ]
  } : null;

  return (
    <>
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema, null, 2)
        }}
      />
      
      {/* WebPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webPageSchema, null, 2)
        }}
      />
      
      {/* DefinedTerm Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(definedTermSchema, null, 2)
        }}
      />
      
      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema, null, 2)
        }}
      />
      
      {/* HowTo Schema (if learning path exists) */}
      {howToSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema, null, 2)
          }}
        />
      )}
      
      {/* FAQPage Schema (if knowledge test exists) */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema, null, 2)
          }}
        />
      )}
    </>
  );
}
