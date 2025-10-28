import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Roadmaps | LinuxConcept',
  description: 'Comprehensive learning roadmaps for Linux system administration, DevOps, and cloud technologies. Structured learning paths with modules, prerequisites, and career outcomes.',
  keywords: 'Linux learning roadmaps, system administration, DevOps, cloud computing, learning paths, structured education',
  openGraph: {
    title: 'Learning Roadmaps | LinuxConcept',
    description: 'Comprehensive learning roadmaps for Linux system administration, DevOps, and cloud technologies.',
    type: 'website',
    url: 'https://ainews.com/learning-roadmap',
    images: [
      {
        url: 'https://ainews.com/images/roadmap-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LinuxConcept Learning Roadmaps'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learning Roadmaps | LinuxConcept',
    description: 'Comprehensive learning roadmaps for Linux system administration, DevOps, and cloud technologies.',
    images: ['https://ainews.com/images/roadmap-og-image.jpg']
  },
  alternates: {
    canonical: 'https://ainews.com/learning-roadmap'
  }
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
