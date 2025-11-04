import React from 'react';

interface ToolData {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  category?: string;
  platform?: string;
  license?: string;
  official_url?: string;
  popularity?: number;
  created_at?: string;
  updated_at?: string;
}

interface ToolStructuredDataProps {
  tool: ToolData;
}

export default function ToolStructuredData({ tool }: ToolStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const toolUrl = `${baseUrl}/tools/${tool.slug}`;
  const imageUrl = `${baseUrl}/images/tool-default.png`;

  // SoftwareApplication Schema
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.title,
    "description": tool.description || tool.seo_description,
    "url": toolUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": tool.platform || "Linux",
    "softwareVersion": "1.0",
    "dateCreated": tool.created_at,
    "dateModified": tool.updated_at,
    "author": {
      "@type": "Person",
      "name": "HackerThink Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "keywords": tool.seo_keywords || tool.category || "linux tool",
    "downloadUrl": toolUrl,
    "screenshot": imageUrl,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Interactive tool interface",
      "Real-time calculations",
      "Command generation",
      "Educational content"
    ],
    "browserRequirements": "Modern web browser with JavaScript enabled",
    "softwareRequirements": "Linux operating system",
    "permissions": "No special permissions required",
    "isAccessibleForFree": true,
    "license": tool.license || "MIT"
  };

  // HowTo Schema (for tool usage)
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use ${tool.title}`,
    "description": tool.description || `Learn how to use this Linux tool for ${tool.category || 'system administration'}`,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": "HackerThink Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": baseUrl
    },
    "dateCreated": tool.created_at,
    "dateModified": tool.updated_at,
    "totalTime": "PT5M", // Estimated 5 minutes to understand and use
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
        "name": "Web browser with JavaScript enabled"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Web browser"
      },
      {
        "@type": "HowToTool",
        "name": "Terminal or command line interface (for generated commands)"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Access the tool",
        "text": `Navigate to ${toolUrl} to access the ${tool.title} tool`,
        "url": toolUrl
      },
      {
        "@type": "HowToStep",
        "name": "Configure parameters",
        "text": "Use the interactive interface to configure the tool parameters according to your needs"
      },
      {
        "@type": "HowToStep",
        "name": "Generate output",
        "text": "Review the generated commands, configurations, or results provided by the tool"
      },
      {
        "@type": "HowToStep",
        "name": "Apply results",
        "text": "Copy and use the generated commands or configurations in your Linux system"
      }
    ]
  };

  // CreativeWork Schema
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": tool.title,
    "description": tool.description || tool.seo_description,
    "url": toolUrl,
    "author": {
      "@type": "Person",
      "name": "HackerThink Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": baseUrl
    },
    "dateCreated": tool.created_at,
    "dateModified": tool.updated_at,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": tool.license || "https://creativecommons.org/licenses/by/4.0/",
    "keywords": tool.seo_keywords || tool.category || "linux tool",
    "genre": tool.category || "System Administration Tool",
    "about": {
      "@type": "Thing",
      "name": "Linux System Administration",
      "description": `A ${tool.category || 'system administration'} tool for Linux users`
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "System Administrators"
    },
    "educationalUse": "Tool",
    "learningResourceType": "Interactive Tool"
  };

  // BreadcrumbList Schema
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
        "name": "Tools",
        "item": `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": tool.title,
        "item": toolUrl
      }
    ]
  };

  // WebApplication Schema (alternative to SoftwareApplication)
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": tool.title,
    "description": tool.description || tool.seo_description,
    "url": toolUrl,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": tool.platform || "Linux",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "dateCreated": tool.created_at,
    "dateModified": tool.updated_at,
    "author": {
      "@type": "Person",
      "name": "HackerThink Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "keywords": tool.seo_keywords || tool.category || "linux tool",
    "screenshot": imageUrl,
    "isAccessibleForFree": true,
    "license": tool.license || "MIT"
  };

  return (
    <>
      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema, null, 2)
        }}
      />
      
      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema, null, 2)
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
    </>
  );
}
