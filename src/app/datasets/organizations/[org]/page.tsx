import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaUsers } from 'react-icons/fa';
import DatasetsOrganizationClient from '@/components/datasets/DatasetsOrganizationClient';

export async function generateMetadata(
  { params }: { params: { org: string } }
): Promise<Metadata> {
  const orgName = decodeURIComponent(params.org).replace(/-/g, ' ');
  
  return {
    title: `${orgName} Datasets - HackerThink`,
    description: `Discover datasets developed by ${orgName}. Explore ${orgName.toLowerCase()} datasets with detailed information and download links.`,
    openGraph: {
      title: `${orgName} Datasets - HackerThink`,
      description: `Explore datasets developed by ${orgName}.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${orgName} Datasets - HackerThink`,
    },
  };
}

export default function DatasetsOrganizationPage({ params }: { params: { org: string } }) {
  const orgName = decodeURIComponent(params.org).replace(/-/g, ' ');
  
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
              <FaUsers className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {orgName} Datasets
              </h1>
              <p className="text-xl text-red-100">
                Datasets developed by {orgName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <DatasetsOrganizationClient organization={orgName} />
      </div>
    </div>
  );
}

