import { generateLabExerciseStructuredData } from '@/components/SEO/StructuredData';

interface LabExerciseStructuredDataProps {
  exercise: {
    title: string;
    description: string;
    slug: string;
    difficulty?: string;
    duration?: number;
    prerequisites?: string;
    author_name?: string;
    category?: string;
    featured_image?: string;
  };
}

export default function LabExerciseStructuredData({ exercise }: LabExerciseStructuredDataProps) {
  const structuredData = generateLabExerciseStructuredData({
    title: exercise.title,
    description: exercise.description,
    slug: exercise.slug,
    difficulty: exercise.difficulty,
    duration: exercise.duration,
    prerequisites: exercise.prerequisites,
    author_name: exercise.author_name,
    category: exercise.category,
    featured_image: exercise.featured_image
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
