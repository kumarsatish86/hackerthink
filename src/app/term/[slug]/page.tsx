import React from 'react';
import { Metadata } from 'next';
import TermPageClient from './TermPageClient';
import TermStructuredData from '@/components/SEO/TermStructuredData';
import { TermData, RelatedTerm, TermPageProps } from '@/types/term';

// Fetch term data for metadata generation
async function getTermData(slug: string): Promise<{ term: TermData | null; relatedTerms: RelatedTerm[] }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3007'}/api/term/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return { term: null, relatedTerms: [] };
    }
    
    const data = await response.json();
    return {
      term: data.term,
      relatedTerms: data.relatedTerms || []
    };
  } catch (error) {
    console.error('Error fetching term data:', error);
    return { term: null, relatedTerms: [] };
  }
}

// Generate metadata for the term page
export async function generateMetadata({ params }: TermPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { term } = await getTermData(slug);
  
  if (!term) {
    return {
      title: 'Term Not Found | HackerThink Glossary',
      description: 'The requested term could not be found in our IT glossary.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const termUrl = `${baseUrl}/term/${term.slug}`;
  
  const title = `${term.term} - ${term.category} | HackerThink Glossary`;
  const description = term.definition.length > 160 
    ? `${term.definition.substring(0, 157)}...` 
    : term.definition;

  const keywords = [
    term.term.toLowerCase(),
    term.category.toLowerCase(),
    'IT terminology',
    'technical terms',
    'Linux concepts',
    'glossary',
    'definition',
    ...(term.related_terms?.map(rt => rt.term.toLowerCase()) || [])
  ].join(', ');

  return {
    title,
    description,
    keywords,
    authors: [{ name: "HackerThink Team" }],
    openGraph: {
      type: 'article',
      title,
      description,
      url: termUrl,
      images: [
        {
          url: `${baseUrl}/images/glossary-default.png`,
          width: 1200,
          height: 630,
          alt: `${term.term} - ${term.category} Definition`,
        },
      ],
      siteName: 'HackerThink',
      locale: 'en_US',
      publishedTime: term.created_at,
      modifiedTime: term.updated_at,
      section: 'Glossary',
      tags: [term.category, term.difficulty_level || 'Beginner'],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ainews',
      creator: '@ainews',
      title,
      description,
      images: [`${baseUrl}/images/glossary-default.png`],
    },
    alternates: {
      canonical: termUrl,
    },
    other: {
      'term:category': term.category,
      'term:difficulty': term.difficulty_level || 'Beginner',
      'term:created': term.created_at,
      'term:updated': term.updated_at,
      'term:related-count': term.related_terms?.length || 0,
    },
  };
}

export default async function TermPage({ params }: TermPageProps) {
  const { slug } = await params;
  const { term, relatedTerms } = await getTermData(slug);

  if (!term) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center items-center">
        <div className="text-center px-4 max-w-md">
          <div className="bg-red-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Term Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The term you're looking for might have been removed or is temporarily unavailable.
          </p>
          <a
            href="/term"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse Glossary
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <TermStructuredData term={term} />
      
      {/* Client Component for Interactive Features */}
      <TermPageClient term={term} relatedTerms={relatedTerms} />
    </>
  );
}
