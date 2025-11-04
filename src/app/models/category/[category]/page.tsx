import { Metadata } from 'next';
import Link from 'next/link';
import { FaBrain, FaArrowLeft } from 'react-icons/fa';
import ModelsCategoryClient from '@/components/models/ModelsCategoryClient';

export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryLower = categoryName.toLowerCase();
  
  return {
    title: `${categoryName} AI Models - Best ${categoryName} Models 2024 | HackerThink`,
    description: `Discover the best ${categoryName} AI models with detailed comparisons, benchmarks, and reviews. Explore ${categoryLower} models from leading organizations. Find the perfect ${categoryLower} model for your project.`,
    keywords: [
      categoryName,
      `${categoryName} AI models`,
      `best ${categoryLower} models`,
      `${categoryLower} artificial intelligence`,
      `top ${categoryLower} models`,
      `${categoryLower} machine learning models`,
      'AI models comparison',
      'machine learning',
      'artificial intelligence'
    ].join(', '),
    openGraph: {
      title: `${categoryName} AI Models - HackerThink`,
      description: `Explore the best ${categoryName} AI models with detailed comparisons and benchmarks.`,
      type: 'website',
      images: [{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${categoryName} AI Models`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} AI Models - HackerThink`,
      description: `Discover the best ${categoryName} AI models with detailed comparisons.`,
    },
    alternates: {
      canonical: `/models/category/${params.category}`
    }
  };
}

export default function ModelCategoryPage({ params }: { params: { category: string } }) {
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
              <FaBrain className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Models
              </h1>
              <p className="text-xl text-red-100">
                Explore AI models specialized for {params.category.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ModelsCategoryClient category={params.category} />
      </div>
    </div>
  );
}

