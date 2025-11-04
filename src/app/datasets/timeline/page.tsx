import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaCalendar } from 'react-icons/fa';
import DatasetsTimelineClient from '@/components/datasets/DatasetsTimelineClient';

export const metadata: Metadata = {
  title: 'AI Datasets Timeline - Major Dataset Releases 2018-2025 | HackerThink',
  description: 'Explore the timeline of major AI dataset releases from 2018 to present. Discover important datasets that shaped machine learning research and industry.',
  keywords: [
    'AI datasets timeline',
    'dataset releases',
    'dataset history',
    'major datasets',
    'dataset evolution',
    'machine learning datasets timeline'
  ].join(', '),
  openGraph: {
    title: 'AI Datasets Timeline - Major Releases | HackerThink',
    description: 'Explore the timeline of major AI dataset releases.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Datasets Timeline - HackerThink',
    description: 'Major AI dataset releases from 2018 to present.',
  },
  alternates: {
    canonical: '/datasets/timeline'
  }
};

export default function DatasetsTimelinePage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/datasets" className="inline-flex items-center text-red-100 hover:text-white mb-4 transition-colors">
            <FaArrowLeft className="mr-2" /> Back to All Datasets
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
              <FaCalendar className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Datasets Timeline</h1>
              <p className="text-xl text-red-100">
                Major dataset releases from 2018 to present
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DatasetsTimelineClient />
      </div>
    </div>
  );
}

