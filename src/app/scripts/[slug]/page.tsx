import React from 'react';
import { Metadata } from 'next';
import ScriptPageClient from './ScriptPageClient';
import ScriptStructuredData from '@/components/SEO/ScriptStructuredData';

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
  variants: Array<{
    id: string;
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

// Fetch script data for metadata generation
async function getScriptData(slug: string): Promise<ScriptData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/scripts/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.script;
  } catch (error) {
    console.error('Error fetching script data:', error);
    return null;
  }
}

// Generate metadata for the script page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const script = await getScriptData(slug);
  
  if (!script) {
    return {
      title: 'Script Not Found | HackerThink',
      description: 'The requested script could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const scriptUrl = `${baseUrl}/scripts/${script.slug}`;
  const imageUrl = script.featured_image || `${baseUrl}/images/script-default.png`;
  
  const title = script.meta_title || `${script.title} - ${script.language} Script | HackerThink`;
  const description = script.meta_description || script.description || 
    `Download and use this ${script.language} script for ${script.script_type.toLowerCase()}. ${script.difficulty} level script compatible with ${script.os_compatibility}.`;

  return {
    title,
    description,
    keywords: [
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
    ].join(', '),
    authors: [{ name: script.author_name || "HackerThink Team" }],
    openGraph: {
      type: 'article',
      title,
      description,
      url: scriptUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${script.title} - ${script.language} Script`,
        },
      ],
      siteName: 'HackerThink',
      locale: 'en_US',
      publishedTime: script.created_at,
      modifiedTime: script.updated_at,
      section: 'Scripts',
      tags: script.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ainews',
      creator: '@ainews',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: scriptUrl,
    },
    other: {
      'script:language': script.language,
      'script:type': script.script_type,
      'script:difficulty': script.difficulty,
      'script:os': script.os_compatibility,
      'script:file-size': script.script_content?.length || 0,
      ...(script.is_multi_language && {
        'script:multi-language': 'true',
        'script:languages': script.available_languages?.join(',') || script.language,
        'script:primary-language': script.primary_language,
      }),
    },
  };
}

export default async function ScriptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const script = await getScriptData(slug);

  if (!script) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Script Not Found</h3>
              <p className="text-sm text-red-700 mt-1">The requested script could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <ScriptStructuredData script={script} />
      
      {/* Client Component for Interactive Features */}
      <ScriptPageClient script={script} />
    </>
  );
}