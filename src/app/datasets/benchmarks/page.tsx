import { Metadata } from 'next';
import Link from 'next/link';
import { FaDatabase, FaArrowLeft, FaChartLine } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Datasets Used in Benchmarks - HackerThink',
  description: 'Discover datasets used in AI benchmarks and evaluations. Learn about standard benchmark datasets used to evaluate model performance.',
  keywords: [
    'benchmark datasets',
    'evaluation datasets',
    'standard datasets',
    'AI benchmarks',
    'ML benchmarks',
    'test datasets'
  ].join(', '),
  openGraph: {
    title: 'Datasets Used in Benchmarks - HackerThink',
    description: 'Explore datasets used in AI benchmarks and evaluations.',
    type: 'website',
  },
  alternates: {
    canonical: '/datasets/benchmarks'
  }
};

export default function DatasetsBenchmarksPage() {
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
              <FaChartLine className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Benchmark Datasets</h1>
              <p className="text-xl text-red-100">
                Datasets used in AI benchmarks and evaluations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold mb-4">About Benchmark Datasets</h2>
            <p className="text-gray-700 mb-4">
              Benchmark datasets are standardized datasets used to evaluate and compare the performance of AI models. 
              These datasets provide a common ground for researchers and practitioners to measure model capabilities 
              across various tasks and domains.
            </p>
            
            <h3 className="text-xl font-bold mt-6 mb-3">Common Benchmark Categories</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Language Understanding:</strong> GLUE, SuperGLUE, SQuAD, RACE</li>
              <li><strong>Language Generation:</strong> WikiText, Penn Treebank, Common Crawl</li>
              <li><strong>Computer Vision:</strong> ImageNet, COCO, CIFAR-10/100</li>
              <li><strong>Code Generation:</strong> HumanEval, MBPP, APPS</li>
              <li><strong>Reasoning:</strong> GSM8K, MATH, ARC, HellaSwag</li>
              <li><strong>Multimodal:</strong> VQAv2, MS-COCO, Conceptual Captions</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">Finding Benchmark Datasets</h3>
            <p className="text-gray-700 mb-4">
              You can browse our dataset collection and filter by domain or type to find benchmark datasets. 
              Many datasets used in research papers and model evaluations are available in our catalog.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-800">
                <strong>Note:</strong> Benchmark datasets are essential for reproducible research. When comparing models, 
                ensure you're using the same evaluation datasets and splits for fair comparison.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

