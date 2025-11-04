import { Metadata } from 'next';
import Link from 'next/link';
import { FaBrain, FaArrowLeft, FaCalendar } from 'react-icons/fa';
import ModelsTimelineClient from '@/components/models/ModelsTimelineClient';

export const metadata: Metadata = {
  title: 'AI Models Timeline - Evolution of AI Models 2017-2024 | HackerThink',
  description: 'Explore the complete timeline of major AI model releases from 2017 to present. Discover the evolution of artificial intelligence models, breakthrough releases, and key milestones in AI development. Visualize the history of transformer models, LLMs, and generative AI.',
  keywords: [
    'AI models timeline',
    'model release history',
    'AI model evolution',
    'major model releases',
    'AI history timeline',
    'transformer model timeline',
    'LLM release history',
    'generative AI timeline',
    'AI breakthroughs timeline',
    'model release dates'
  ].join(', '),
  openGraph: {
    title: 'AI Models Timeline - Evolution 2017-2024 | HackerThink',
    description: 'Explore the timeline of major AI model releases and key milestones in AI development.',
    type: 'website',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'AI Models Timeline'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Models Timeline - HackerThink',
    description: 'Explore the evolution of AI models from 2017 to present.',
  },
  alternates: {
    canonical: '/models/timeline'
  }
};

export default function ModelsTimelinePage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/models" className="inline-flex items-center text-red-100 hover:text-white mb-4 transition-colors">
            <FaArrowLeft className="mr-2" /> Back to All Models
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
              <FaCalendar className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Models Timeline</h1>
              <p className="text-xl text-red-100">
                Major model releases from 2017 to present
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ModelsTimelineClient />
      </div>
    </div>
  );
}

