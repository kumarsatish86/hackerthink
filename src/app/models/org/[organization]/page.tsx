import { Metadata } from 'next';
import Link from 'next/link';
import { FaBrain, FaArrowLeft, FaBuilding } from 'react-icons/fa';
import ModelsOrganizationClient from '@/components/models/ModelsOrganizationClient';

export async function generateMetadata(
  { params }: { params: { organization: string } }
): Promise<Metadata> {
  const orgName = params.organization.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const orgLower = orgName.toLowerCase();
  
  return {
    title: `${orgName} AI Models - All ${orgName} Models Listed | HackerThink`,
    description: `Explore all AI models developed by ${orgName}. Browse ${orgLower}'s contributions to artificial intelligence, machine learning, and deep learning. Compare ${orgLower} models, view benchmarks, and find the perfect model for your needs.`,
    keywords: [
      orgName,
      `${orgName} AI models`,
      `${orgName} machine learning`,
      `${orgLower} artificial intelligence`,
      `${orgLower} models`,
      `${orgLower} research`,
      'AI research organization',
      'machine learning company',
      'AI model developer'
    ].join(', '),
    openGraph: {
      title: `${orgName} AI Models - HackerThink`,
      description: `Explore all AI models developed by ${orgName}. Compare benchmarks and reviews.`,
      type: 'website',
      images: [{
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${orgName} AI Models`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${orgName} AI Models - HackerThink`,
      description: `Browse all AI models developed by ${orgName}.`,
    },
    alternates: {
      canonical: `/models/org/${params.organization}`
    }
  };
}

export default function ModelOrganizationPage({ params }: { params: { organization: string } }) {
  const orgName = params.organization.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
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
              <FaBuilding className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{orgName} Models</h1>
              <p className="text-xl text-red-100">
                Explore AI models developed by {orgName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ModelsOrganizationClient organization={params.organization} />
      </div>
    </div>
  );
}

