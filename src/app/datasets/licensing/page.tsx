import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaGavel, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Dataset Licensing Guide - Commercial Use & Legal Information | HackerThink',
  description: 'Comprehensive guide to dataset licensing for machine learning. Understand commercial use rights, open source licenses, and legal considerations for AI datasets.',
  keywords: [
    'dataset licensing',
    'commercial use datasets',
    'open source datasets',
    'dataset legal',
    'dataset copyright',
    'dataset license guide'
  ].join(', '),
  openGraph: {
    title: 'Dataset Licensing Guide - HackerThink',
    description: 'Understand dataset licensing and commercial use rights.',
    type: 'website',
  },
  alternates: {
    canonical: '/datasets/licensing'
  }
};

export default function DatasetsLicensingPage() {
  const licenses = [
    {
      name: 'MIT License',
      commercial: true,
      description: 'Permissive license allowing commercial use, modification, and distribution. Very popular for open-source datasets.',
      icon: '✅'
    },
    {
      name: 'Apache 2.0',
      commercial: true,
      description: 'Allows commercial use with patent grant. More comprehensive than MIT with explicit patent rights.',
      icon: '✅'
    },
    {
      name: 'CC-BY (Creative Commons Attribution)',
      commercial: true,
      description: 'Allows commercial use with attribution requirement. Must credit the original creators.',
      icon: '✅'
    },
    {
      name: 'CC-BY-SA (Creative Commons Attribution-ShareAlike)',
      commercial: true,
      description: 'Allows commercial use but derivatives must use the same license (ShareAlike).',
      icon: '✅'
    },
    {
      name: 'CC-BY-NC (Creative Commons Non-Commercial)',
      commercial: false,
      description: 'Allows use but NOT for commercial purposes. Research and educational use only.',
      icon: '❌'
    },
    {
      name: 'CC0 (Public Domain)',
      commercial: true,
      description: 'Public domain dedication. No restrictions on commercial use.',
      icon: '✅'
    },
    {
      name: 'Proprietary / Custom',
      commercial: 'varies',
      description: 'Each proprietary license has its own terms. Check the specific license agreement carefully.',
      icon: '⚠️'
    },
    {
      name: 'ODbL (Open Database License)',
      commercial: true,
      description: 'Allows commercial use with attribution and ShareAlike requirements for database contents.',
      icon: '✅'
    }
  ];

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
              <FaGavel className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Dataset Licensing Guide</h1>
              <p className="text-xl text-red-100">
                Understanding licenses for commercial use and legal compliance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Understanding Dataset Licenses</h2>
            <p className="text-gray-700 mb-4">
              Dataset licenses define how you can use, modify, and distribute datasets. Understanding these licenses 
              is crucial for legal compliance, especially when using datasets in commercial applications.
            </p>
            <p className="text-gray-700">
              <strong>Important:</strong> Always review the specific license terms for any dataset you plan to use. 
              When in doubt, consult with a legal professional.
            </p>
          </div>

          {/* Common Licenses */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Common Dataset Licenses</h2>
            <div className="space-y-6">
              {licenses.map((license) => (
                <div key={license.name} className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">{license.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{license.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-gray-600">Commercial Use:</span>
                        {license.commercial === true && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            <FaCheckCircle /> Allowed
                          </span>
                        )}
                        {license.commercial === false && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                            <FaTimesCircle /> Not Allowed
                          </span>
                        )}
                        {license.commercial === 'varies' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                            ⚠️ Check License
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mt-2">{license.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Always check the license</strong> before using a dataset, especially for commercial purposes</li>
              <li><strong>Maintain attribution</strong> when required by the license (CC-BY, CC-BY-SA, etc.)</li>
              <li><strong>Document your usage</strong> and keep records of licenses for datasets you use</li>
              <li><strong>Respect ShareAlike clauses</strong> - if you modify and redistribute, use the same license</li>
              <li><strong>Be cautious with proprietary licenses</strong> - read terms carefully and consult legal if needed</li>
              <li><strong>Consider data sources</strong> - some licenses may restrict training models on the data</li>
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-bold text-yellow-900 mb-2">Legal Disclaimer</h3>
            <p className="text-yellow-800 text-sm">
              This guide is for informational purposes only and does not constitute legal advice. 
              Always consult with a qualified legal professional for specific licensing questions 
              related to your use case. License interpretations can vary by jurisdiction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

