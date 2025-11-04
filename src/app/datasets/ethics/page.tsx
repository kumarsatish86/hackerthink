import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaBalanceScale, FaShieldAlt } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Dataset Ethics & Bias - Responsible AI Dataset Use | HackerThink',
  description: 'Learn about ethical considerations in dataset collection and use. Understand bias, fairness, privacy, and responsible practices for AI datasets.',
  keywords: [
    'dataset ethics',
    'AI bias',
    'dataset bias',
    'fair datasets',
    'responsible AI',
    'dataset privacy',
    'dataset fairness'
  ].join(', '),
  openGraph: {
    title: 'Dataset Ethics & Bias - HackerThink',
    description: 'Understanding ethical considerations and bias in AI datasets.',
    type: 'website',
  },
  alternates: {
    canonical: '/datasets/ethics'
  }
};

export default function DatasetsEthicsPage() {
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
              <FaBalanceScale className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Dataset Ethics & Bias</h1>
              <p className="text-xl text-red-100">
                Understanding ethical considerations and responsible dataset use
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Ethical Considerations in Datasets</h2>
            <p className="text-gray-700 mb-4">
              Datasets are fundamental to AI development, but they can perpetuate bias, privacy violations, 
              and other ethical issues. Understanding these concerns is essential for responsible AI development.
            </p>
          </div>

          {/* Key Issues */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Key Ethical Issues</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FaShieldAlt className="text-red-600" />
                  Bias and Fairness
                </h3>
                <p className="text-gray-700 mb-2">
                  Datasets can reflect and amplify societal biases. Underrepresentation of certain groups, 
                  stereotyping, and skewed data distributions can lead to unfair AI systems.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Check for demographic representation in datasets</li>
                  <li>Evaluate potential sources of bias during collection</li>
                  <li>Consider intersectionality and multiple dimensions of bias</li>
                  <li>Test models for disparate impact across groups</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-xl font-bold mb-2">Privacy and Consent</h3>
                <p className="text-gray-700 mb-2">
                  Many datasets contain personal information collected without explicit consent or proper anonymization.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Ensure proper consent for data collection</li>
                  <li>Implement data anonymization and de-identification</li>
                  <li>Follow GDPR, CCPA, and other privacy regulations</li>
                  <li>Consider right to be forgotten and data deletion</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-xl font-bold mb-2">Copyright and Intellectual Property</h3>
                <p className="text-gray-700 mb-2">
                  Datasets may contain copyrighted material, and training on such data may raise legal questions.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Verify copyright status of data sources</li>
                  <li>Understand fair use and transformative use</li>
                  <li>Check licensing terms carefully</li>
                  <li>Consider implications of training on copyrighted works</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-bold mb-2">Data Quality and Transparency</h3>
                <p className="text-gray-700 mb-2">
                  Lack of transparency about dataset contents, collection methods, and limitations can lead to misuse.
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                  <li>Document data sources and collection methods</li>
                  <li>Disclose known limitations and biases</li>
                  <li>Provide dataset cards and documentation</li>
                  <li>Enable reproducibility and verification</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Best Practices for Ethical Dataset Use</h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">1. Evaluate Dataset Sources</h3>
                <p>Review how datasets were collected, whether consent was obtained, and what ethical review processes were followed.</p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">2. Test for Bias</h3>
                <p>Analyze datasets for potential biases before training. Test model outputs across different demographic groups and scenarios.</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-bold text-yellow-900 mb-2">3. Document and Disclose</h3>
                <p>Create comprehensive dataset documentation including collection methods, known biases, limitations, and intended use cases.</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-bold text-purple-900 mb-2">4. Respect Privacy</h3>
                <p>Implement appropriate privacy safeguards, respect data subject rights, and follow applicable regulations.</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-2">5. Consider Impact</h3>
                <p>Evaluate potential societal impacts of using datasets, especially for sensitive applications like hiring, lending, or criminal justice.</p>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Additional Resources</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Datasheets for Datasets:</strong> Framework for documenting dataset characteristics</li>
              <li><strong>Model Cards:</strong> Framework for documenting model characteristics and limitations</li>
              <li><strong>Fairness Indicators:</strong> Tools for evaluating fairness in ML systems</li>
              <li><strong>Algorithmic Auditing:</strong> Processes for evaluating AI systems for bias and fairness</li>
              <li><strong>Privacy-Preserving ML:</strong> Techniques like differential privacy and federated learning</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-2">Ethical Responsibility</h3>
            <p className="text-gray-700 text-sm">
              As AI practitioners, we have a responsibility to use datasets ethically and to consider the 
              broader impacts of our work. This includes actively working to reduce bias, protect privacy, 
              and ensure our systems benefit society equitably.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

