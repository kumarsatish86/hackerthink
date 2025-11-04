import { Metadata } from 'next';
import { FaDatabase } from 'react-icons/fa';
import DatasetsListClient from '@/components/datasets/DatasetsListClient';

export const metadata: Metadata = {
  title: 'Datasets - HackerThink',
  description: 'Explore curated datasets for AI research and development',
};

export default function DatasetsPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaDatabase className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            AI Datasets Hub
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Discover curated datasets for machine learning and AI research
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">500+</div>
            <div className="text-gray-600">Datasets</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">50K+</div>
            <div className="text-gray-600">Downloads</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">100+</div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[
              { slug: 'text', name: 'Text', icon: '📝' },
              { slug: 'image', name: 'Image', icon: '🖼️' },
              { slug: 'audio', name: 'Audio', icon: '🔊' },
              { slug: 'video', name: 'Video', icon: '🎥' },
              { slug: 'multimodal', name: 'Multimodal', icon: '🔀' },
              { slug: 'tabular', name: 'Tabular', icon: '📊' },
              { slug: 'time-series', name: 'Time Series', icon: '📈' },
              { slug: 'graph', name: 'Graph', icon: '🕸️' },
              { slug: 'code', name: 'Code', icon: '💻' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/datasets/category/${cat.slug}`}
                className="flex flex-col items-center p-4 border rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group"
              >
                <span className="text-3xl mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 text-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Datasets List */}
        <DatasetsListClient />
      </div>
    </div>
  );
}
