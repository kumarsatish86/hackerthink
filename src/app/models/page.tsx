import { Metadata } from 'next';
import { FaBrain } from 'react-icons/fa';
import ModelsListClient from '@/components/models/ModelsListClient';

export const metadata: Metadata = {
  title: 'AI Models - HackerThink',
  description: 'Explore the latest AI models and their capabilities',
};

export default function ModelsPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaBrain className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            AI Models Directory
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Explore the latest AI models, their capabilities, and benchmarks
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Quick Links */}
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { slug: 'text-generation', name: 'Text Generation', icon: '📝' },
              { slug: 'vision', name: 'Vision', icon: '👁️' },
              { slug: 'multimodal', name: 'Multimodal', icon: '🔀' },
              { slug: 'audio', name: 'Audio', icon: '🔊' },
              { slug: 'nlp', name: 'NLP', icon: '💬' },
              { slug: 'code', name: 'Code', icon: '💻' },
              { slug: 'embeddings', name: 'Embeddings', icon: '🔗' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/models/category/${cat.slug}`}
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

        {/* Models List */}
        <ModelsListClient />
      </div>
    </div>
  );
}
