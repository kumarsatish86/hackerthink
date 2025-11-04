import { Metadata } from 'next';
import Link from 'next/link';
import { FaBrain, FaArrowLeft, FaChartLine } from 'react-icons/fa';
import StaticComparisonClient from '@/components/models/StaticComparisonClient';

export async function generateMetadata(
  { params }: { params: { modelA: string; modelB: string } }
): Promise<Metadata> {
  const modelAName = params.modelA.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const modelBName = params.modelB.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const modelALower = modelAName.toLowerCase();
  const modelBLower = modelBName.toLowerCase();
  
  return {
    title: `${modelAName} vs ${modelBName} - Detailed Model Comparison | HackerThink`,
    description: `Comprehensive comparison of ${modelAName} vs ${modelBName}. Compare features, benchmarks, performance, pricing, use cases, and more. Find which model is better for your needs with our detailed side-by-side analysis.`,
    keywords: [
      `${modelAName} vs ${modelBName}`,
      `${modelALower} vs ${modelBLower} comparison`,
      `compare ${modelALower} ${modelBLower}`,
      `${modelAName} comparison`,
      `${modelBName} comparison`,
      'AI model comparison',
      'model vs model',
      'AI model benchmarks',
      `${modelALower} review`,
      `${modelBLower} review`,
      'best AI model'
    ].join(', '),
    openGraph: {
      title: `${modelAName} vs ${modelBName} - Model Comparison | HackerThink`,
      description: `Detailed side-by-side comparison of ${modelAName} and ${modelBName}. Compare features, benchmarks, and performance.`,
      type: 'article',
      images: [{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${modelAName} vs ${modelBName} Comparison`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${modelAName} vs ${modelBName} - HackerThink`,
      description: `Compare ${modelAName} and ${modelBName} side-by-side.`,
    },
    alternates: {
      canonical: `/models/compare/${params.modelA}-vs-${params.modelB}`
    }
  };
}

export default function StaticComparisonPage({ params }: { params: { modelA: string; modelB: string } }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/models/compare" className="inline-flex items-center text-red-100 hover:text-white mb-4 transition-colors">
            <FaArrowLeft className="mr-2" /> Back to Comparison Tool
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
              <FaChartLine className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {params.modelA.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} vs{' '}
                {params.modelB.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p className="text-xl text-red-100">
                Detailed side-by-side comparison
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StaticComparisonClient modelASlug={params.modelA} modelBSlug={params.modelB} />
      </div>
    </div>
  );
}

