'use client';

import { FaEnvelope, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';

export default function NewsletterArchivePage() {
  const newsletters = [
    { date: 'October 28, 2025', subject: 'Weekly AI Roundup - GPT-5 and Beyond', issue: '#245' },
    { date: 'October 21, 2025', subject: 'AI Ethics in 2025: New Guidelines', issue: '#244' },
    { date: 'October 14, 2025', subject: 'Machine Learning Trends This Month', issue: '#243' },
    { date: 'October 7, 2025', subject: 'Deep Learning Breakthroughs', issue: '#242' },
  ];

  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaEnvelope className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Newsletter Archive
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Browse past issues of the HackerThink newsletter
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4">
          {newsletters.map((newsletter, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaCalendarAlt className="mr-2" />
                    <span>{newsletter.date}</span>
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      {newsletter.issue}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{newsletter.subject}</h3>
                </div>
                <FaArrowRight className="text-red-600 w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Newsletter Archive Coming Soon
          </h3>
          <p className="text-gray-600">
            We're building a comprehensive archive of all past newsletters. This feature will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}

