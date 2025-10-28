import React from 'react';
import { Metadata } from 'next';
import RoadmapListPageClient from './RoadmapListPageClient';
import { RoadmapCategory, RoadmapListItem } from '@/types/roadmap';

// Fetch roadmap data from API
async function getRoadmapData(): Promise<{ categories: RoadmapCategory[], featuredRoadmaps: RoadmapListItem[] }> {
  try {
    // Try to fetch from API first, fall back to mock data if needed
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/roadmaps`, {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const roadmaps = await response.json();
        
        // Convert database roadmaps to the expected format
        const featuredRoadmaps: RoadmapListItem[] = roadmaps.map((roadmap: any) => ({
          id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description,
          level: roadmap.level || 'all-levels',
          timeToComplete: roadmap.duration || 'Varies',
          tags: [], // You might want to add tags to the database
          slug: roadmap.slug
        }));

        // For now, create categories based on the roadmaps we have
        const categories: RoadmapCategory[] = [
          {
            id: 'all-roadmaps',
            title: 'All Learning Roadmaps',
            description: 'Complete learning journeys for mastering Linux and DevOps skills',
            icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
            roadmaps: featuredRoadmaps
          }
        ];

        return { categories, featuredRoadmaps };
      }
    } catch (apiError) {
      console.log('API fetch failed, using fallback data:', apiError);
    }

    // Fallback to mock data if API fails
    const categories: RoadmapCategory[] = [
    {
      id: 'career-paths',
      title: 'Career Paths',
      description: 'Complete learning journeys to build skills for specific Linux-related careers',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      roadmaps: [
        {
          id: 'linux-admin',
          title: 'Linux System Administrator',
          description: 'Master Linux system administration from basics to advanced server management',
          level: 'all-levels',
          timeToComplete: '6-12 months',
          tags: ['system-admin', 'server-management', 'shell-scripting'],
          slug: 'linux-admin'
        },
        {
          id: 'devops-engineer',
          title: 'DevOps Engineer',
          description: 'Learn CI/CD, infrastructure as code, and container orchestration',
          level: 'intermediate',
          timeToComplete: '8-14 months',
            tags: ['devops', 'ci-cd', 'docker', 'kubernetes'],
          slug: 'devops-engineer'
        },
        {
            id: 'cloud-architect',
            title: 'Cloud Solutions Architect',
            description: 'Design and implement scalable cloud infrastructure solutions',
          level: 'advanced',
          timeToComplete: '10-16 months',
            tags: ['cloud', 'aws', 'azure', 'architecture'],
            slug: 'cloud-architect'
        }
      ]
    },
    {
        id: 'technical-skills',
        title: 'Technical Skills',
        description: 'Focused learning paths for specific technical competencies',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      roadmaps: [
        {
          id: 'shell-scripting',
          title: 'Shell Scripting Mastery',
            description: 'From basic commands to advanced automation scripts',
            level: 'beginner',
            timeToComplete: '3-6 months',
            tags: ['bash', 'scripting', 'automation'],
          slug: 'shell-scripting'
        },
        {
            id: 'container-tech',
            title: 'Container Technologies',
            description: 'Docker, Kubernetes, and container orchestration',
          level: 'intermediate',
            timeToComplete: '4-8 months',
            tags: ['docker', 'kubernetes', 'containers'],
            slug: 'container-tech'
        }
      ]
    },
    {
      id: 'certifications',
        title: 'Certification Prep',
        description: 'Structured preparation for industry-recognized Linux certifications',
        icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      roadmaps: [
        {
            id: 'lpic-1',
            title: 'LPIC-1 Certification',
            description: 'Linux Professional Institute Certification Level 1 preparation',
          level: 'beginner',
            timeToComplete: '4-6 months',
            tags: ['lpic', 'certification', 'linux-basics'],
            slug: 'lpic-1'
          },
          {
            id: 'rhcsa',
            title: 'Red Hat RHCSA',
            description: 'Red Hat Certified System Administrator preparation',
          level: 'intermediate',
            timeToComplete: '6-9 months',
            tags: ['rhcsa', 'redhat', 'certification'],
            slug: 'rhcsa'
          }
        ]
      }
    ];

    const featuredRoadmaps: RoadmapListItem[] = [
      {
        id: 'linux-admin',
        title: 'Linux System Administrator',
        description: 'Master Linux system administration from basics to advanced server management',
        level: 'all-levels',
        timeToComplete: '6-12 months',
        tags: ['system-admin', 'server-management', 'shell-scripting'],
        slug: 'linux-admin'
      },
      {
        id: 'devops-engineer',
        title: 'DevOps Engineer',
        description: 'Learn CI/CD, infrastructure as code, and container orchestration',
          level: 'intermediate',
        timeToComplete: '8-14 months',
        tags: ['devops', 'ci-cd', 'docker', 'kubernetes'],
        slug: 'devops-engineer'
      },
      {
        id: 'cloud-architect',
        title: 'Cloud Solutions Architect',
        description: 'Design and implement scalable cloud infrastructure solutions',
          level: 'advanced',
        timeToComplete: '10-16 months',
        tags: ['cloud', 'aws', 'azure', 'architecture'],
        slug: 'cloud-architect'
      },
      {
        id: 'shell-scripting',
        title: 'Shell Scripting Mastery',
        description: 'From basic commands to advanced automation scripts',
          level: 'beginner',
        timeToComplete: '3-6 months',
        tags: ['bash', 'scripting', 'automation'],
        slug: 'shell-scripting'
      },
      {
        id: 'container-tech',
        title: 'Container Technologies',
        description: 'Docker, Kubernetes, and container orchestration',
          level: 'intermediate',
        timeToComplete: '4-8 months',
        tags: ['docker', 'kubernetes', 'containers'],
        slug: 'container-tech'
      },
      {
        id: 'lpic-1',
        title: 'LPIC-1 Certification',
        description: 'Linux Professional Institute Certification Level 1 preparation',
        level: 'beginner',
        timeToComplete: '4-6 months',
        tags: ['lpic', 'certification', 'linux-basics'],
        slug: 'lpic-1'
      },
      {
        id: 'rhcsa',
        title: 'Red Hat RHCSA',
        description: 'Red Hat Certified System Administrator preparation',
        level: 'intermediate',
        timeToComplete: '6-9 months',
        tags: ['rhcsa', 'redhat', 'certification'],
        slug: 'rhcsa'
      },
      {
        id: 'network-admin',
        title: 'Linux Network Administrator',
        description: 'Master network configuration, security, and troubleshooting on Linux systems',
          level: 'intermediate',
        timeToComplete: '5-8 months',
        tags: ['networking', 'security', 'troubleshooting'],
        slug: 'network-admin'
      },
      {
        id: 'security-specialist',
        title: 'Linux Security Specialist',
        description: 'Advanced security hardening, monitoring, and incident response',
        level: 'advanced',
        timeToComplete: '6-10 months',
        tags: ['security', 'hardening', 'monitoring', 'incident-response'],
        slug: 'security-specialist'
      }
    ];

    return { categories, featuredRoadmaps };
  } catch (error) {
    console.error('Error fetching roadmap data:', error);
    return { categories: [], featuredRoadmaps: [] };
  }
}

// Generate metadata for the learning roadmaps page
export async function generateMetadata(): Promise<Metadata> {
  const title = 'Learning Roadmaps - Master Linux & DevOps Skills | LinuxConcept';
  const description = 'Structured learning paths to master Linux administration, DevOps, cloud technologies, and more. Start your journey with our comprehensive roadmaps designed by industry experts.';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
  const pageUrl = `${baseUrl}/learning-roadmap`;

  return {
    title,
    description,
    keywords: [
      'linux learning roadmap',
      'devops career path',
      'system administrator training',
      'cloud architect certification',
      'linux professional development',
      'IT career guidance',
      'technical skill building',
      'linux certification prep',
      'devops learning path',
      'container technology training'
    ].join(', '),
    authors: [{ name: "LinuxConcept Team" }],
    openGraph: {
      type: 'website',
      title,
      description,
      url: pageUrl,
      images: [
        {
          url: `${baseUrl}/images/learning-roadmaps-og.png`,
          width: 1200,
          height: 630,
          alt: 'LinuxConcept Learning Roadmaps',
        },
      ],
      siteName: 'LinuxConcept',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ainews',
      creator: '@ainews',
      title,
      description,
      images: [`${baseUrl}/images/learning-roadmaps-og.png`],
    },
    alternates: {
      canonical: pageUrl,
    },
    other: {
      'page:type': 'learning-roadmaps',
      'content:categories': '3',
      'content:roadmaps': '7',
      'education:provider': 'LinuxConcept',
      'education:free': 'true',
    },
  };
}

export default async function LearningRoadmapPage() {
  const { categories, featuredRoadmaps } = await getRoadmapData();

  return (
    <>
      {/* Client Component for Interactive Features */}
      <RoadmapListPageClient 
        categories={categories} 
        featuredRoadmaps={featuredRoadmaps} 
      />
    </>
  );
}
