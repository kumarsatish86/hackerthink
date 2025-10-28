import Script from 'next/script';

interface StructuredDataProps {
  data: Record<string, any>;
}

/**
 * Component to add JSON-LD structured data to a page
 */
export const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

/**
 * Generate structured data for tools
 */
export const generateToolStructuredData = (tool: {
  title: string;
  description: string;
  slug: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.title,
    "description": tool.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Linux",
    "url": `https://ainews.com/tools/${tool.slug}`,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": "https://ainews.com"
    }
  };
};

/**
 * Generate structured data for glossary terms
 */
export const generateTermStructuredData = (term: {
  term: string;
  definition: string;
  slug: string;
  category?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.term,
    "description": term.definition,
    "url": `https://ainews.com/term/${term.slug}`,
    ...(term.category && { "termCode": term.category }),
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "name": "Linux Glossary",
      "url": "https://ainews.com/term"
    }
  };
};

/**
 * Generate structured data for Linux commands
 */
export const generateCommandStructuredData = (command: {
  title: string;
  description: string;
  slug: string;
  syntax?: string;
  examples?: string;
  category?: string;
  platform?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "name": command.title,
    "headline": `${command.title} - Linux Command Reference`,
    "description": command.description,
    "url": `https://ainews.com/commands/${command.slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ainews.com/commands/${command.slug}`
    },
    "keywords": [command.title, "Linux command", command.category || "command line", "CLI", "terminal", "Linux", "Unix"],
    "articleSection": "Linux Commands",
    "operatingSystem": command.platform || "Linux",
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": "https://ainews.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ainews.com/images/logo.png"
      }
    },
    "educationalUse": "reference",
    "teaches": `How to use the ${command.title} command in Linux`
  };
};

/**
 * Generate structured data for scripts
 */
export const generateScriptStructuredData = (script: {
  title: string;
  description: string;
  slug: string;
  language?: string;
  script_type?: string;
  difficulty?: string;
  tags?: string[];
  author_name?: string;
  created_at?: string;
  updated_at?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": script.title,
    "description": script.description,
    "url": `https://ainews.com/scripts/${script.slug}`,
    "codeRepository": `https://ainews.com/scripts/${script.slug}`,
    "programmingLanguage": {
      "@type": "ComputerLanguage",
      "name": script.language || "Shell Script"
    },
    "runtimePlatform": "Linux",
    "keywords": script.tags ? script.tags.join(", ") : script.script_type,
    "author": {
      "@type": "Person",
      "name": script.author_name || "LinuxConcept"
    },
    "dateCreated": script.created_at,
    "dateModified": script.updated_at,
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": "https://ainews.com"
    },
    "educationalUse": script.script_type || "script",
    "proficiencyLevel": script.difficulty || "Beginner"
  };
};

/**
 * Generate structured data for lab exercises
 */
export const generateLabExerciseStructuredData = (labExercise: {
  title: string;
  description: string;
  slug: string;
  difficulty?: string;
  duration?: number;
  prerequisites?: string;
  author_name?: string;
  category?: string;
  featured_image?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": labExercise.title,
    "description": labExercise.description,
    "url": `https://ainews.com/lab-exercises/${labExercise.slug}`,
    "learningResourceType": "Hands-On Exercise",
    "educationalUse": "Exercise",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "Student"
    },
    "educationalLevel": labExercise.difficulty || "Beginner",
    "timeRequired": labExercise.duration ? `PT${labExercise.duration}M` : "PT30M",
    ...(labExercise.prerequisites && { "prerequisites": labExercise.prerequisites }),
    ...(labExercise.category && { "keywords": ["Linux", "Lab Exercise", labExercise.category] }),
    ...(labExercise.featured_image && {
      "image": {
        "@type": "ImageObject",
        "url": labExercise.featured_image
      }
    }),
    "provider": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": "https://ainews.com"
    },
    ...(labExercise.author_name && {
      "author": {
        "@type": "Person",
        "name": labExercise.author_name
      }
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ainews.com/lab-exercises/${labExercise.slug}`
    }
  };
};

/**
 * Generate structured data for web stories
 */
export const generateWebStoryStructuredData = (story: {
  title: string;
  slug: string;
  cover_image?: string;
  slides_count?: number;
  date_published?: string;
  date_modified?: string;
  author_name?: string;
  description?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story.title,
    "description": story.description || `${story.title} - Web Story by LinuxConcept`,
    "url": `https://ainews.com/stories/${story.slug}`,
    ...(story.date_published && { "datePublished": story.date_published }),
    ...(story.date_modified && { "dateModified": story.date_modified }),
    ...(story.cover_image && {
      "image": {
        "@type": "ImageObject",
        "url": story.cover_image
      }
    }),
    "publisher": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": "https://ainews.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ainews.com/images/logo.png"
      }
    },
    ...(story.author_name && {
      "author": {
        "@type": "Person",
        "name": story.author_name
      }
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ainews.com/stories/${story.slug}`
    },
    "articleBody": `Interactive web story with ${story.slides_count || 'multiple'} slides about Linux concepts and tutorials.`,
    "articleSection": "Web Stories",
    "isAccessibleForFree": true
  };
};

/**
 * Generate structured data for courses
 */
export const generateCourseStructuredData = (course: {
  title: string;
  description: string;
  slug: string;
  author_name?: string;
  level?: string;
  price?: number;
  discount_price?: number | null;
  duration?: number;
  featured_image?: string;
  requirements?: string;
  what_will_learn?: string;
  sections_count?: number;
  total_chapters?: number;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "url": `https://ainews.com/courses/${course.slug}`,
    ...(course.author_name && {
      "provider": {
        "@type": "Organization",
        "name": "LinuxConcept",
        "sameAs": "https://ainews.com"
      },
      "instructor": {
        "@type": "Person",
        "name": course.author_name
      }
    }),
    ...(course.level && { "educationalLevel": course.level }),
    ...(course.price !== undefined && {
      "offers": {
        "@type": "Offer",
        "price": course.discount_price !== null ? course.discount_price : course.price,
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }),
    ...(course.duration && { "timeRequired": `PT${course.duration}M` }),
    ...(course.featured_image && {
      "image": {
        "@type": "ImageObject",
        "url": course.featured_image
      }
    }),
    ...(course.requirements && { "coursePrerequisites": course.requirements }),
    ...(course.what_will_learn && { "teaches": course.what_will_learn }),
    ...(course.sections_count && { "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": "Flexible",
      ...(course.total_chapters && { "numberOfLessons": course.total_chapters })
    }}),
    "inLanguage": "en",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ainews.com/courses/${course.slug}`
    }
  };
};

/**
 * Generate structured data for learning roadmaps
 */
export const generateRoadmapStructuredData = (roadmap: {
  title: string;
  description: string;
  slug: string;
  level?: string;
  duration?: string;
  modules?: Array<{
    title: string;
    description?: string;
    duration?: string;
    level?: string;
  }>;
  featured_image?: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "name": roadmap.title,
    "description": roadmap.description,
    "url": `https://ainews.com/learning-roadmap/${roadmap.slug}`,
    "learningResourceType": "Career Path",
    "educationalUse": "Path",
    "audience": {
      "@type": "EducationalAudience",
      "educationalRole": "Student"
    },
    ...(roadmap.level && { "educationalLevel": roadmap.level }),
    ...(roadmap.duration && { "timeRequired": roadmap.duration }),
    ...(roadmap.featured_image && {
      "image": {
        "@type": "ImageObject",
        "url": roadmap.featured_image
      }
    }),
    "provider": {
      "@type": "Organization",
      "name": "LinuxConcept",
      "url": "https://ainews.com"
    },
    ...(roadmap.modules && roadmap.modules.length > 0 && {
      "hasPart": roadmap.modules.map((module, index) => ({
        "@type": "LearningResource",
        "position": index + 1,
        "name": module.title,
        "description": module.description || `Module ${index + 1} of ${roadmap.title}`,
        ...(module.level && { "educationalLevel": module.level }),
        ...(module.duration && { "timeRequired": module.duration })
      }))
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://ainews.com/learning-roadmap/${roadmap.slug}`
    }
  };
}; 