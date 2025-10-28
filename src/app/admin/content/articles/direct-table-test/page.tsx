'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import TipTapEditor to prevent SSR issues
const TipTapEditor = dynamic(
  () => import('../../../../../components/TipTapEditor'), 
  { ssr: false }
);

export default function DirectTableTest() {
  const [content, setContent] = useState('<p>This is a test for the direct table editor.</p>');
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">TipTap Table Editor Test</h1>
      <p className="mb-4">This is a simplified test page for the TipTap table editor.</p>
      
      <div className="border border-gray-300 rounded-md">
        <TipTapEditor
          value={content}
          onChange={setContent}
          advanced={true}
          showToolbar={true}
          showMenuBar={true}
        />
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-2">Content:</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-40">
          {content}
        </pre>
      </div>
    </div>
  );
} 