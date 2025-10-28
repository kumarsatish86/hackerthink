import React from 'react';
import { Metadata } from 'next';
import RoadmapPageClient from './RoadmapPageClient';
import RoadmapStructuredData from '@/components/SEO/RoadmapStructuredData';
import { RoadmapData, RoadmapPageProps } from '@/types/roadmap';

// Fetch roadmap data for metadata generation
async function getRoadmapData(slug: string): Promise<RoadmapData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/learning-roadmap/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.roadmap || data;
  } catch (error) {
    console.error('Error fetching roadmap data:', error);
    return null;
  }
}

// Generate metadata for the roadmap page
export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmapData(slug);
  
  if (!roadmap) {
    return {
      title: 'Roadmap Not Found | LinuxConcept Learning Roadmaps',
      description: 'The requested learning roadmap could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const roadmapUrl = `${baseUrl}/learning-roadmap/${roadmap.slug}`;
  const imageUrl = roadmap.featured_image || `${baseUrl}/images/roadmap-default.png`;
  
  const title = roadmap.seo_title || `${roadmap.title} - Learning Roadmap | LinuxConcept`;
  const description = roadmap.seo_description || roadmap.description || 
    `Master ${roadmap.title} with our comprehensive learning roadmap. ${roadmap.level} level course with ${roadmap.modules?.length || 0} modules.`;

  const keywords = roadmap.seo_keywords ? roadmap.seo_keywords.split(',').map(k => k.trim()) : [
    roadmap.title.toLowerCase(),
    'learning roadmap',
    roadmap.level?.toLowerCase() || 'intermediate',
    'Linux',
    'career path',
    'professional development',
    'skill building',
    ...(roadmap.modules?.map(module => module.title.toLowerCase()) || [])
  ];

  return {
    title,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: "LinuxConcept Team" }],
    openGraph: {
      type: 'article',
      title,
      description,
      url: roadmapUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${roadmap.title} - Learning Roadmap`,
        },
      ],
      siteName: 'LinuxConcept',
      locale: 'en_US',
      publishedTime: roadmap.created_at,
      modifiedTime: roadmap.updated_at,
      section: 'Learning Roadmaps',
      tags: keywords.slice(0, 10), // Limit to first 10 keywords
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
      canonical: roadmapUrl,
    },
    other: {
      'roadmap:level': roadmap.level || 'intermediate',
      'roadmap:duration': roadmap.duration || 'varies',
      'roadmap:modules': roadmap.modules?.length || 0,
      'roadmap:prerequisites': roadmap.prerequisites?.length || 0,
      'roadmap:career-outcomes': roadmap.career_outcomes?.length || 0,
      'course:type': 'learning-roadmap',
      'course:provider': 'LinuxConcept',
      'course:free': 'true',
    },
  };
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { slug } = await params;
  const roadmap = await getRoadmapData(slug);

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex justify-center items-center">
        <div className="text-center px-4 max-w-md">
          <div className="bg-red-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Learning Roadmap Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The learning roadmap you're looking for might have been removed or is temporarily unavailable.
          </p>
          <a
            href="/learning-roadmap"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse Learning Roadmaps
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <RoadmapStructuredData roadmap={roadmap} />
      
      {/* Client Component for Interactive Features */}
      <RoadmapPageClient roadmap={roadmap} />
    </>
  );
}
