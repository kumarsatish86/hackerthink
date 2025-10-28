import React from 'react';

interface ScriptData {
  id: string;
  title: string;
  slug: string;
  description: string;
  script_content: string;
  program_output: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  featured_image: string;
  meta_title: string;
  meta_description: string;
  published: boolean;
  is_multi_language: boolean;
  primary_language: string;
  available_languages: string[];
  variants?: Array<{
    language: string;
    script_content: string;
    program_output: string;
    file_extension: string;
  }>;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

interface ScriptStructuredDataProps {
  script: ScriptData;
}

export default function ScriptStructuredData({ script }: ScriptStructuredDataProps) {
  // Generate structured data for SoftwareApplication schema
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": script.title,
    "description": script.description || script.meta_description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}`,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": script.os_compatibility,
    "programmingLanguage": script.is_multi_language && script.available_languages 
      ? script.available_languages 
      : script.language,
    "softwareVersion": "1.0",
    "dateCreated": script.created_at,
    "dateModified": script.updated_at,
    "author": {
      "@type": "Person",
      "name": script.author_name || "LinuxConcept Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "keywords": script.tags?.join(', ') || '',
    "downloadUrl": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}`,
    "fileSize": script.script_content?.length || 0,
    "screenshot": script.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/script-default.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    // Add multi-language support
    ...(script.is_multi_language && script.variants && {
      "hasPart": script.variants.map((variant, index) => ({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": `${script.title} - ${variant.language}`,
        "description": script.description || script.meta_description,
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}?language=${variant.language}`,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": script.os_compatibility,
        "programmingLanguage": variant.language,
        "softwareVersion": "1.0",
        "dateCreated": script.created_at,
        "dateModified": script.updated_at,
        "author": {
          "@type": "Person",
          "name": script.author_name || "LinuxConcept Team"
        },
        "publisher": {
          "@type": "Organization",
          "name": "LinuxConcept",
          "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "keywords": script.tags?.join(', ') || '',
        "downloadUrl": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}?language=${variant.language}`,
        "fileSize": variant.script_content?.length || 0,
        "fileFormat": variant.file_extension,
        "screenshot": script.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/script-default.png`,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.5",
          "reviewCount": "1",
          "bestRating": "5",
          "worstRating": "1"
        }
      }))
    })
  };

  // Generate structured data for HowTo schema (if script has clear steps)
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${script.title}`,
    "description": script.description || `Learn how to use this ${script.language} script for ${script.script_type.toLowerCase()}`,
    "image": script.featured_image || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/images/script-default.png`,
    "author": {
      "@type": "Person",
      "name": script.author_name || "LinuxConcept Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "dateCreated": script.created_at,
    "dateModified": script.updated_at,
    "totalTime": "PT5M", // Estimated 5 minutes to understand and use
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Computer with " + script.os_compatibility + " operating system"
      },
      {
        "@type": "HowToSupply", 
        "name": script.language + " runtime environment"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Text editor or IDE"
      },
      {
        "@type": "HowToTool",
        "name": "Terminal or command line interface"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Download the script",
        "text": `Download the ${script.title} script file`,
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}`
      },
      {
        "@type": "HowToStep",
        "name": "Make script executable",
        "text": "Make the script file executable using chmod +x command"
      },
      {
        "@type": "HowToStep",
        "name": "Run the script",
        "text": "Execute the script in your terminal or command line"
      }
    ]
  };

  // Generate structured data for CreativeWork schema
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": script.title,
    "description": script.description || script.meta_description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}`,
    "author": {
      "@type": "Person",
      "name": script.author_name || "LinuxConcept Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    "dateCreated": script.created_at,
    "dateModified": script.updated_at,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "keywords": script.tags?.join(', ') || '',
    "genre": script.script_type,
    "about": {
      "@type": "Thing",
      "name": `${script.language} Script`,
      "description": `A ${script.difficulty.toLowerCase()} level ${script.language} script for ${script.script_type.toLowerCase()}`
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "System Administrators"
    }
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
        "name": "Scripts",
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": script.title,
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}`
      }
    ]
  };

  // Generate CollectionPage schema for multi-language scripts
  const collectionPageSchema = script.is_multi_language && script.variants ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${script.title} - Multi-Language Script Collection`,
    "description": `Collection of ${script.title} script implementations in multiple programming languages: ${script.available_languages?.join(', ')}`,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${script.title} Script Variants`,
      "numberOfItems": script.variants.length,
      "itemListElement": script.variants.map((variant, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": `${script.title} - ${variant.language}`,
        "description": `${script.title} implementation in ${variant.language}`,
        "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/scripts/${script.slug}?language=${variant.language}`
      }))
    }
  } : null;

  return (
    <>
      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema, null, 2)
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
      
      {/* CollectionPage Schema for Multi-Language Scripts */}
      {collectionPageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionPageSchema, null, 2)
          }}
        />
      )}
    </>
  );
}
