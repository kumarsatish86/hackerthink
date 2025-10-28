import React from 'react';

interface CommandData {
  id: number;
  title: string;
  slug: string;
  description: string;
  syntax: string;
  examples: string;
  options: string;
  notes: string;
  category: string;
  platform: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  created_at: string;
  updated_at: string;
}

interface CommandStructuredDataProps {
  command: CommandData;
}

export default function CommandStructuredData({ command }: CommandStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  
  // Generate structured data for SoftwareApplication schema
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": command.title,
    "description": command.description || command.seo_description,
    "url": `${baseUrl}/commands/${command.slug}`,
    "applicationCategory": "CommandLineTool",
    "operatingSystem": command.platform || "Linux",
    "softwareVersion": "1.0",
    "dateCreated": command.created_at,
    "dateModified": command.updated_at,
    "author": {
      "@type": "Person",
      "name": "LinuxConcept Team"
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
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "keywords": command.seo_keywords || `${command.title}, linux command, command line, terminal, ${command.category}`,
    "downloadUrl": `${baseUrl}/commands/${command.slug}`,
    "fileSize": command.syntax?.length || 0,
    "screenshot": `${baseUrl}/images/command-default.png`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "1",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "Command line interface",
      "Cross-platform compatibility",
      "Built-in help system",
      "Extensive documentation"
    ],
    "screenshot": `${baseUrl}/images/command-terminal.png`
  };

  // Generate structured data for WebApplication schema
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": `${command.title} Command Reference`,
    "description": command.description || command.seo_description,
    "url": `${baseUrl}/commands/${command.slug}`,
    "applicationCategory": "CommandLineTool",
    "operatingSystem": command.platform || "Linux",
    "browserRequirements": "Terminal or Command Line Interface",
    "dateCreated": command.created_at,
    "dateModified": command.updated_at,
    "author": {
      "@type": "Person",
      "name": "LinuxConcept Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": baseUrl
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "keywords": command.seo_keywords || `${command.title}, linux command, command line, terminal, ${command.category}`,
    "isAccessibleForFree": true,
    "audience": {
      "@type": "Audience",
      "audienceType": "System Administrators, Developers, Linux Users"
    }
  };

  // Generate structured data for HowTo schema
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to use the ${command.title} command`,
    "description": command.description || `Learn how to use the ${command.title} command in ${command.platform || 'Linux'}`,
    "image": `${baseUrl}/images/command-terminal.png`,
    "author": {
      "@type": "Person",
      "name": "LinuxConcept Team"
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
    "dateCreated": command.created_at,
    "dateModified": command.updated_at,
    "totalTime": "PT5M", // Estimated 5 minutes to learn
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "supply": [
      {
        "@type": "HowToSupply",
        "name": `${command.platform || 'Linux'} operating system`
      },
      {
        "@type": "HowToSupply",
        "name": "Terminal or command line interface"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": command.title
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Open Terminal",
        "text": "Open your terminal or command line interface",
        "url": `${baseUrl}/commands/${command.slug}#syntax`
      },
      {
        "@type": "HowToStep",
        "name": "Use Command Syntax",
        "text": command.syntax || `Use the ${command.title} command with proper syntax`,
        "url": `${baseUrl}/commands/${command.slug}#syntax`
      },
      {
        "@type": "HowToStep",
        "name": "View Examples",
        "text": "Follow the provided examples to understand usage",
        "url": `${baseUrl}/commands/${command.slug}#examples`
      }
    ]
  };

  // Generate structured data for CreativeWork schema
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": command.title,
    "description": command.description || command.seo_description,
    "url": `${baseUrl}/commands/${command.slug}`,
    "author": {
      "@type": "Person",
      "name": "LinuxConcept Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": baseUrl
    },
    "dateCreated": command.created_at,
    "dateModified": command.updated_at,
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "keywords": command.seo_keywords || `${command.title}, linux command, command line, terminal, ${command.category}`,
    "genre": "Command Reference",
    "about": {
      "@type": "Thing",
      "name": `${command.title} Command`,
      "description": `A ${command.category} command for ${command.platform || 'Linux'} systems`
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "System Administrators, Developers, Linux Users"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/commands/${command.slug}`
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
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Commands",
        "item": `${baseUrl}/commands`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": command.title,
        "item": `${baseUrl}/commands/${command.slug}`
      }
    ]
  };

  // Parse custom schema_json if available
  let customSchema = null;
  if (command.schema_json) {
    try {
      customSchema = JSON.parse(command.schema_json);
    } catch (error) {
      console.error('Error parsing custom schema_json:', error);
    }
  }

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
      
      {/* Custom Schema from admin */}
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
