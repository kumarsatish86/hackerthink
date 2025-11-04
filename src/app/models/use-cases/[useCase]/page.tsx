import { Metadata } from 'next';
import Link from 'next/link';
import { FaBrain, FaArrowLeft, FaRocket } from 'react-icons/fa';
import ModelsUseCaseClient from '@/components/models/ModelsUseCaseClient';

export async function generateMetadata(
  { params }: { params: { useCase: string } }
): Promise<Metadata> {
  const useCaseName = params.useCase.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const useCaseLower = useCaseName.toLowerCase();
  
  return {
    title: `Best AI Models for ${useCaseName} - Top ${useCaseName} Models 2024 | HackerThink`,
    description: `Discover the best AI models optimized for ${useCaseName}. Compare ${useCaseLower} models, view benchmarks, and find the perfect model for your ${useCaseLower} use case. Expert reviews and detailed comparisons.`,
    keywords: [
      `best AI models for ${useCaseLower}`,
      `${useCaseName} AI models`,
      `${useCaseLower} models`,
      `top ${useCaseLower} AI`,
      `AI ${useCaseLower} tools`,
      `${useCaseLower} artificial intelligence`,
      `${useCaseLower} machine learning`,
      `${useCaseLower} comparison`,
      'AI model comparison',
      'best AI tools'
    ].join(', '),
    openGraph: {
      title: `Best AI Models for ${useCaseName} - HackerThink`,
      description: `Discover and compare the best AI models optimized for ${useCaseName}.`,
      type: 'website',
      images: [{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `Best AI Models for ${useCaseName}`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Best AI Models for ${useCaseName} - HackerThink`,
      description: `Compare top AI models optimized for ${useCaseName}.`,
    },
    alternates: {
      canonical: `/models/use-cases/${params.useCase}`
    }
  };
}

export default function ModelUseCasePage({ params }: { params: { useCase: string } }) {
  const useCaseName = params.useCase.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
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
              <FaRocket className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Models for {useCaseName}</h1>
              <p className="text-xl text-red-100">
                Discover AI models optimized for {useCaseName} use cases
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ModelsUseCaseClient useCase={params.useCase} />
      </div>
    </div>
  );
}

