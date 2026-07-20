import { Metadata } from 'next';
import { FaBrain } from 'react-icons/fa';
import ModelsListClient from '@/components/models/ModelsListClient';
import { ModelsThemeProvider } from '@/components/models/ModelsThemeProvider';
import '@/styles/models.css';

export const metadata: Metadata = {
  title: 'AI Models - HackerThink',
  description: 'Explore the latest AI models and their capabilities',
};

export default function ModelsPage() {
  return (
    <ModelsThemeProvider>
      <div className="models-scope bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
        {/* Compact hero */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <FaBrain className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">AI Models</h1>
                <p className="text-red-100 mt-1">
                  Browse, filter, and compare models — HuggingFace-style discovery
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ModelsListClient />
        </div>
      </div>
    </ModelsThemeProvider>
  );
}
