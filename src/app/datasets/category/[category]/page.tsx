import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft } from 'react-icons/fa';
import DatasetsCategoryClient from '@/components/datasets/DatasetsCategoryClient';

export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryLower = categoryName.toLowerCase();
  
  return {
    title: `${categoryName} Datasets - Best ${categoryName} Datasets 2025 | HackerThink`,
    description: `Discover the best ${categoryName} datasets with detailed information, download links, and use cases. Explore ${categoryLower} datasets from leading organizations. Find the perfect ${categoryLower} dataset for your machine learning project.`,
    keywords: [
      categoryName,
      `${categoryName} datasets`,
      `best ${categoryLower} datasets`,
      `${categoryLower} machine learning`,
      `${categoryLower} data`,
      `download ${categoryLower} dataset`,
      'machine learning datasets',
      'AI datasets',
      'dataset comparison'
    ].join(', '),
    openGraph: {
      title: `${categoryName} Datasets - HackerThink`,
      description: `Explore the best ${categoryName} datasets with detailed information and download links.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} Datasets - HackerThink`,
      description: `Discover the best ${categoryName} datasets with detailed information.`,
    },
    alternates: {
      canonical: `/datasets/category/${params.category}`
    }
  };
}

export default function DatasetCategoryPage({ params }: { params: { category: string } }) {
  const categoryName = params.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
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
              <FaDatabase className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {categoryName} Datasets
              </h1>
              <p className="text-xl text-red-100">
                Explore datasets specialized for {params.category.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DatasetsCategoryClient category={params.category} />
      </div>
    </div>
  );
}

