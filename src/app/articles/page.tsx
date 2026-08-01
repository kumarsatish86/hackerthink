import { Metadata } from 'next';
import { Suspense } from 'react';
import { FaNewspaper } from 'react-icons/fa';
import ArticlesListClient from '@/components/articles/ArticlesListClient';

export const metadata: Metadata = {
  title: 'AI Articles - HackerThink',
  description: 'Browse, filter, and read in-depth AI articles and analysis',
};

function ArticlesListFallback() {
  return (
    <div className="flex justify-center items-center py-20 bg-white rounded-xl border border-gray-200">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-red-50 min-h-screen">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <FaNewspaper className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">AI Articles</h1>
              <p className="text-red-100 mt-1">
                Browse, filter, and read — same explorer pattern as Models, Datasets & Courses
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ArticlesListFallback />}>
          <ArticlesListClient />
        </Suspense>
      </div>
    </div>
  );
}
