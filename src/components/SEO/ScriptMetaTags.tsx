import Head from 'next/head';
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

interface ScriptMetaTagsProps {
  script: ScriptData;
}

export default function ScriptMetaTags({ script }: ScriptMetaTagsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const scriptUrl = `${baseUrl}/scripts/${script.slug}`;
  const imageUrl = script.featured_image || `${baseUrl}/images/script-default.png`;
  
  // Generate title and description
  const title = script.meta_title || `${script.title} - ${script.language} Script | LinuxConcept`;
  const description = script.meta_description || script.description || 
    `Download and use this ${script.language} script for ${script.script_type.toLowerCase()}. ${script.difficulty} level script compatible with ${script.os_compatibility}.`;

  // Generate keywords
  const keywords = [
    script.language.toLowerCase(),
    script.script_type.toLowerCase(),
    script.os_compatibility.toLowerCase(),
    script.difficulty.toLowerCase(),
    'script',
    'code',
    'programming',
    'linux',
    'automation',
    'devops',
    ...(script.tags || [])
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={script.author_name || "LinuxConcept Team"} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={scriptUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={scriptUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${script.title} - ${script.language} Script`} />
      <meta property="og:site_name" content="LinuxConcept" />
      <meta property="og:locale" content="en_US" />
      <meta property="article:author" content={script.author_name || "LinuxConcept Team"} />
      <meta property="article:published_time" content={script.created_at} />
      <meta property="article:modified_time" content={script.updated_at} />
      <meta property="article:section" content="Scripts" />
      <meta property="article:tag" content={script.tags?.join(',') || ''} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@ainews" />
      <meta name="twitter:creator" content="@ainews" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${script.title} - ${script.language} Script`} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#4F46E5" />
      <meta name="msapplication-TileColor" content="#4F46E5" />
      <meta name="application-name" content="LinuxConcept Scripts" />
      
      {/* Language and Region */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Script-specific meta tags */}
      <meta name="script:language" content={script.language} />
      <meta name="script:type" content={script.script_type} />
      <meta name="script:difficulty" content={script.difficulty} />
      <meta name="script:os" content={script.os_compatibility} />
      <meta name="script:file-size" content={script.script_content?.length || 0} />
      
      {/* Multi-language script meta tags */}
      {script.is_multi_language && (
        <>
          <meta name="script:multi-language" content="true" />
          <meta name="script:languages" content={script.available_languages?.join(',') || script.language} />
          <meta name="script:primary-language" content={script.primary_language} />
        </>
      )}
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": script.title,
            "description": description,
            "url": scriptUrl,
            "image": imageUrl,
            "author": {
              "@type": "Person",
              "name": script.author_name || "LinuxConcept Team"
            },
            "publisher": {
              "@type": "Organization",
              "name": "LinuxConcept",
              "url": baseUrl
            },
            "dateCreated": script.created_at,
            "dateModified": script.updated_at,
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": script.os_compatibility,
            "programmingLanguage": script.language,
            "keywords": keywords,
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "availability": "https://schema.org/InStock"
            }
          }, null, 2)
        }}
      />
    </Head>
  );
}
