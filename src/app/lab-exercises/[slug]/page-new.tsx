import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LabExerciseStructuredData from './LabExerciseStructuredData';
import LabExerciseClient from './LabExerciseClient';

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
}

async function getLabExercise(slug: string): Promise<LabExercise | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/lab-exercises/${slug}`, {
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.lab_exercise;
  } catch (error) {
    console.error('Error fetching lab exercise:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getLabExercise(slug);
  
  if (!exercise) {
    return {
      title: 'Lab Exercise Not Found',
      description: 'The requested lab exercise could not be found.',
    };
  }

  return {
    title: `${exercise.title} - Lab Exercise | LinuxConcept`,
    description: exercise.description,
    openGraph: {
      title: `${exercise.title} - Lab Exercise`,
      description: exercise.description,
      type: 'article',
      url: `https://ainews.com/lab-exercises/${exercise.slug}`,
      images: exercise.featured_image ? [
        {
          url: exercise.featured_image,
          width: 1200,
          height: 630,
          alt: exercise.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${exercise.title} - Lab Exercise`,
      description: exercise.description,
      images: exercise.featured_image ? [exercise.featured_image] : [],
    },
    alternates: {
      canonical: `https://ainews.com/lab-exercises/${exercise.slug}`,
    },
  };
}

export default async function LabExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exercise = await getLabExercise(slug);
  
  if (!exercise) {
    notFound();
  }

  return (
    <>
      <LabExerciseStructuredData exercise={exercise} />
      <LabExerciseClient exercise={exercise} />
    </>
  );
}
