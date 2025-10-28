'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface UsageExamplesDisplayProps {
  data: string;
}

const UsageExamplesDisplay: React.FC<UsageExamplesDisplayProps> = ({ data }) => {
  if (!data) {
    return null;
  }

  // Try to parse as HTML first
  if (data.includes('<') && data.includes('>')) {
    return (
      <div className="mt-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
        <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: data }} />
      </div>
    );
  }

  // If not HTML, try to split by numbered items
  const examples = data.split(/\d+\.\s+/).filter(Boolean);
  
  if (examples.length > 1) {
    return (
      <div className="mt-8 mb-10">
        <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
        <div className="space-y-4">
          {examples.map((example, index) => (
            <motion.div 
              key={index}
              className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-gray-700">{example.trim()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // If not parsed as numbered examples, just display as plain text
  return (
    <div className="mt-8 mb-10">
      <h2 className="text-xl font-semibold mb-4">Usage Examples</h2>
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6 shadow-sm">
        <div className="text-gray-700 whitespace-pre-line">{data}</div>
      </div>
    </div>
  );
};

export default UsageExamplesDisplay; 