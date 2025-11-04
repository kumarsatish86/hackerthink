import { Metadata } from 'next';
import Link from 'next/link';
import { FaBrain, FaArrowLeft, FaTrophy, FaChartLine } from 'react-icons/fa';
import ModelsLeaderboardClient from '@/components/models/ModelsLeaderboardClient';

export const metadata: Metadata = {
  title: 'AI Models Leaderboard 2024 - Top Models Ranked by Benchmarks | HackerThink',
  description: 'Discover the top-performing AI models ranked by benchmarks and performance metrics. Compare the best AI models across MMLU, GSM8K, HumanEval, and more. Find the highest-rated models for your specific use case.',
  keywords: [
    'AI models leaderboard',
    'best AI models 2024',
    'top AI models',
    'model benchmarks',
    'AI model rankings',
    'best performing AI models',
    'top rated AI models',
    'model comparison leaderboard',
    'AI model performance metrics',
    'benchmark rankings'
  ].join(', '),
  openGraph: {
    title: 'AI Models Leaderboard - Top Models by Benchmarks | HackerThink',
    description: 'Compare the top-performing AI models ranked by benchmarks and performance metrics.',
    type: 'website',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'AI Models Leaderboard'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Models Leaderboard - HackerThink',
    description: 'Top-performing AI models ranked by benchmarks.',
  },
  alternates: {
    canonical: '/models/leaderboard'
  }
};

export default function ModelsLeaderboardPage() {
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
              <FaTrophy className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">AI Models Leaderboard</h1>
              <p className="text-xl text-red-100">
                Top-performing models ranked by benchmarks and performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ModelsLeaderboardClient />
      </div>
    </div>
  );
}

