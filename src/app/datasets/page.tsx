import { Metadata } from 'next';
import { FaDatabase } from 'react-icons/fa';
import DatasetsListClient from '@/components/datasets/DatasetsListClient';
import { DatasetsThemeProvider } from '@/components/datasets/DatasetsThemeProvider';
import '@/styles/ht-tokens.css';

export const metadata: Metadata = {
  title: 'AI Datasets - HackerThink',
  description: 'Browse, filter, and compare datasets — HuggingFace-style discovery',
};

export default function DatasetsPage() {
  return (
    <DatasetsThemeProvider>
      <div className="datasets-scope bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <FaDatabase className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">AI Datasets</h1>
                <p className="text-red-100 mt-1">
                  Browse, filter, and compare datasets — HuggingFace-style discovery
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DatasetsListClient />
        </div>
      </div>
    </DatasetsThemeProvider>
  );
}
