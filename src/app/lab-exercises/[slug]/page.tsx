import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LabExerciseClient from './LabExerciseClient';
import LabExerciseStructuredData from '@/components/SEO/LabExerciseStructuredData';

interface LabExercise {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  instructions: string;
  solution?: string;
  difficulty: string;
  duration: number;
  prerequisites?: string;
  featured_image?: string;
  author_name?: string;
  category?: string;
  helpful_resources?: Array<{ title: string; url: string }>;
  terminal_simulation?: { title?: string; commands?: string };
  related_exercises?: Array<{ title: string; slug: string }>;
  sidebar_settings?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

async function getLabExercise(slug: string): Promise<LabExercise | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/lab-exercises/${slug}`, {
      cache: 'no-store'
    });
        
        if (!response.ok) {
      return null;
        }
        
        const data = await response.json();
    return data.lab_exercise;
  } catch (error) {
    console.error('Error fetching lab exercise data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getLabExercise(slug);
  
  if (!exercise) {
    return {
      title: 'Lab Exercise Not Found | LinuxConcept',
      description: 'The requested lab exercise could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const exerciseUrl = `${baseUrl}/lab-exercises/${exercise.slug}`;
  const imageUrl = exercise.featured_image || `${baseUrl}/images/lab-exercise-default.png`;
  
  const title = `${exercise.title} - Lab Exercise | LinuxConcept`;
  const description = exercise.description || `Complete this ${exercise.difficulty.toLowerCase()} level lab exercise to practice Linux skills.`;

  return {
    title,
    description,
    keywords: [
      'linux',
      'lab exercise',
      'hands-on',
      'practical',
      exercise.difficulty.toLowerCase(),
      'terminal',
      'command line',
      'system administration',
      ...(exercise.category ? [exercise.category.toLowerCase()] : [])
    ].join(', '),
    authors: [{ name: exercise.author_name || "LinuxConcept Team" }],
    openGraph: {
      type: 'article',
      title,
      description,
      url: exerciseUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${exercise.title} - Lab Exercise`,
        },
      ],
      siteName: 'LinuxConcept',
      locale: 'en_US',
      ...(exercise.created_at && { publishedTime: exercise.created_at }),
      ...(exercise.updated_at && { modifiedTime: exercise.updated_at }),
      section: 'Lab Exercises',
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
      canonical: exerciseUrl,
    },
  };
}

export default async function LabExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = await getLabExercise(slug);

  if (!exercise) {
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
              <h3 className="text-sm font-medium text-red-800">Lab Exercise Not Found</h3>
              <p className="text-sm text-red-700 mt-1">The requested lab exercise could not be found.</p>
          </div>
        </div>
      </div>
    </div>
    );
  }

  return (
    <>
      {/* Structured Data for SEO */}
      <LabExerciseStructuredData exercise={exercise} />
      
      {/* Client Component for Interactive Features */}
      <LabExerciseClient exercise={exercise} />
    </>
  );
} 