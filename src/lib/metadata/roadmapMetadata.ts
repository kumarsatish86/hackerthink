import { Metadata } from 'next';

interface RoadmapData {
  id: string;
  title: string;
  slug: string;
  description: string;
  level?: string;
  duration?: string;
  featured_image?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  modules?: Array<{
    id: string;
    title: string;
    description?: string;
    duration?: string;
    level?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

export function generateRoadmapMetadata(roadmap: RoadmapData): Metadata {
  const title = roadmap.seo_title || `${roadmap.title} Learning Roadmap | LinuxConcept`;
  const description = roadmap.seo_description || roadmap.description;
  const keywords = roadmap.seo_keywords || `${roadmap.title}, learning roadmap, ${roadmap.level || 'intermediate'} level, Linux system administration, DevOps, cloud computing`;
  const image = roadmap.featured_image || 'https://ainews.com/images/roadmap-default.png';
  const url = `https://ainews.com/learning-roadmap/${roadmap.slug}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${roadmap.title} Learning Roadmap`
        }
      ],
      publishedTime: roadmap.created_at,
      modifiedTime: roadmap.updated_at,
      authors: ['LinuxConcept Team'],
      section: 'Learning Roadmaps',
      tags: keywords.split(', ').map(tag => tag.trim())
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@ainews',
      site: '@ainews'
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'article:author': 'LinuxConcept Team',
      'article:section': 'Learning Roadmaps',
      'article:tag': keywords,
      'article:published_time': roadmap.created_at,
      'article:modified_time': roadmap.updated_at,
      'og:site_name': 'LinuxConcept',
      'og:type': 'article',
      'og:locale': 'en_US',
      'og:updated_time': roadmap.updated_at,
      'twitter:label1': 'Level',
      'twitter:data1': roadmap.level || 'Intermediate',
      'twitter:label2': 'Duration',
      'twitter:data2': roadmap.duration || 'Self-paced',
      'twitter:label3': 'Modules',
      'twitter:data3': roadmap.modules?.length?.toString() || '0'
    }
  };
}
