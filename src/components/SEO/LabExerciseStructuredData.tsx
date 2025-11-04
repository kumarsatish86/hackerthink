import React from 'react';

interface LabExerciseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  duration: number;
  prerequisites?: string;
  featured_image?: string;
  author_name?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface LabExerciseStructuredDataProps {
  exercise: LabExerciseData;
}

export default function LabExerciseStructuredData({ exercise }: LabExerciseStructuredDataProps) {
  // Generate structured data for LearningResource schema
  const learningResourceSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": exercise.title,
    "description": exercise.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/lab-exercises/${exercise.slug}`,
    "learningResourceType": "Hands-On Exercise",
    "educationalUse": "Exercise",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "Student"
    },
    "educationalLevel": exercise.difficulty || "Beginner",
    "timeRequired": exercise.duration ? `PT${exercise.duration}M` : "PT30M",
    ...(exercise.prerequisites && { "prerequisites": exercise.prerequisites }),
    ...(exercise.category && { "keywords": ["Linux", "Lab Exercise", exercise.category] }),
    ...(exercise.featured_image && {
      "image": {
        "@type": "ImageObject",
        "url": exercise.featured_image
      }
    }),
    "provider": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    ...(exercise.author_name && {
      "author": {
        "@type": "Person",
        "name": exercise.author_name
      }
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/lab-exercises/${exercise.slug}`
    },
    ...(exercise.created_at && { "dateCreated": exercise.created_at }),
    ...(exercise.updated_at && { "dateModified": exercise.updated_at })
  };

  // Generate CreativeWork schema
  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": exercise.title,
    "description": exercise.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/lab-exercises/${exercise.slug}`,
    "about": {
      "@type": "Thing",
      "name": "Linux System Administration"
    },
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "Student",
      "audienceType": "Linux Learners"
    },
    "inLanguage": "en",
    "isAccessibleForFree": true,
    "license": "https://creativecommons.org/licenses/by/4.0/",
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    ...(exercise.author_name && {
      "author": {
        "@type": "Person",
        "name": exercise.author_name
      }
    }),
    ...(exercise.created_at && { "dateCreated": exercise.created_at }),
    ...(exercise.updated_at && { "dateModified": exercise.updated_at })
  };

  // Generate HowTo schema for step-by-step instructions
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Complete: ${exercise.title}`,
    "description": exercise.description,
    "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/lab-exercises/${exercise.slug}`,
    "totalTime": exercise.duration ? `PT${exercise.duration}M` : "PT30M",
    "difficulty": exercise.difficulty || "Beginner",
    "supply": [
      {
        "@type": "HowToSupply",
        "name": "Linux Terminal Access"
      },
      {
        "@type": "HowToSupply", 
        "name": "Basic Linux Knowledge"
      }
    ],
    "tool": [
      {
        "@type": "HowToTool",
        "name": "Linux Terminal"
      }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Read the Exercise Description",
        "text": "Start by reading the exercise description and understanding the objectives."
      },
      {
        "@type": "HowToStep", 
        "name": "Follow Step-by-Step Instructions",
        "text": "Follow the detailed step-by-step instructions provided in the exercise."
      },
      {
        "@type": "HowToStep",
        "name": "Complete the Exercise",
        "text": "Execute the required commands and complete all the tasks outlined in the exercise."
      },
      {
        "@type": "HowToStep",
        "name": "Verify Your Solution",
        "text": "Check your work against the provided solution to ensure you've completed the exercise correctly."
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "HackerThink",
      "url": process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'
    },
    ...(exercise.author_name && {
      "author": {
        "@type": "Person",
        "name": exercise.author_name
      }
    })
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
        "name": "Lab Exercises",
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/lab-exercises`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": exercise.title,
        "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com'}/lab-exercises/${exercise.slug}`
      }
    ]
  };

  return (
    <>
      {/* LearningResource Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(learningResourceSchema, null, 2)
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
