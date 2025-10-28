'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import TipTapEditor to prevent SSR issues
const TipTapEditor = dynamic(() => import('../../../../components/TipTapEditor'), { ssr: false });

const ExampleTableEditor = () => {
  const [content, setContent] = useState('<p>Try adding a table to this content!</p>');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">TipTap Editor with Table Support</h1>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-2">
          This editor has been enhanced with table support using TipTap. You can use the table button in the toolbar to:
        </p>
        <ul className="list-disc pl-5 mb-4 text-gray-700">
          <li>Insert a table</li>
          <li>Add/delete rows and columns</li>
          <li>Merge/unmerge cells</li>
          <li>Delete the entire table</li>
        </ul>
      </div>
      
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <TipTapEditor
          value={content}
          onChange={setContent}
          advanced={true}
          placeholder="Start writing with tables..."
          className="min-h-[400px]"
          showToolbar={true}
          showMenuBar={true}
        />
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Editor Output</h2>
        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm">{content}</pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Implementation Notes</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-gray-800 mb-2">This editor implements TipTap with the following extensions:</p>
          <ul className="list-disc pl-5 text-gray-800">
            <li>@tiptap/extension-table (table functionality)</li>
            <li>@tiptap/extension-table-row (table rows)</li>
            <li>@tiptap/extension-table-cell (table cells)</li>
            <li>@tiptap/extension-table-header (table headers)</li>
          </ul>
          <p className="mt-4 text-gray-800">
            To implement tables in your own TipTap editor, make sure to:
          </p>
          <ol className="list-decimal pl-5 text-gray-800">
            <li>Add the table extensions to your editor</li>
            <li>Include table controls in your toolbar</li>
            <li>Configure table HTML attributes for styling</li>
            <li>Enable table commands for user interaction</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ExampleTableEditor; 