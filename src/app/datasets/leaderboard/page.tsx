import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaTrophy } from 'react-icons/fa';
import DatasetsLeaderboardClient from '@/components/datasets/DatasetsLeaderboardClient';

export const metadata: Metadata = {
  title: 'AI Datasets Leaderboard 2025 - Top Datasets Ranked | HackerThink',
  description: 'Discover the top-performing AI datasets ranked by downloads, ratings, and usage. Compare the best datasets across different categories and find the most popular datasets for your machine learning project.',
  keywords: [
    'AI datasets leaderboard',
    'best datasets 2025',
    'top datasets',
    'most downloaded datasets',
    'dataset rankings',
    'popular datasets',
    'top rated datasets',
    'dataset comparison leaderboard'
  ].join(', '),
  openGraph: {
    title: 'AI Datasets Leaderboard - Top Datasets by Popularity | HackerThink',
    description: 'Compare the top-performing AI datasets ranked by downloads and ratings.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Datasets Leaderboard - HackerThink',
    description: 'Top-performing AI datasets ranked by popularity.',
  },
  alternates: {
    canonical: '/datasets/leaderboard'
  }
};

export default function DatasetsLeaderboardPage() {
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
              <FaTrophy className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Datasets Leaderboard</h1>
              <p className="text-xl text-red-100">
                Top datasets ranked by downloads, ratings, and usage
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DatasetsLeaderboardClient />
      </div>
    </div>
  );
}

