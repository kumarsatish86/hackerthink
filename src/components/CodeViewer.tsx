'use client';

import React, { useState } from 'react';

interface CodeViewerProps {
  value: string;
  language?: string;
  className?: string;
}

/**
 * An enhanced component to display code content with syntax highlighting and copy functionality.
 * This is a lightweight alternative to a full editor when we only need to display code.
 */
const CodeViewer: React.FC<CodeViewerProps> = ({
  value,
  language,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Determine language-specific styling
  const getLangColor = (lang: string = '') => {
    const langLower = lang.toLowerCase();
    if (langLower === 'python') return 'bg-blue-600';
    if (langLower === 'bash' || langLower === 'shell') return 'bg-green-600';
    if (langLower === 'javascript' || langLower === 'js') return 'bg-yellow-500';
    if (langLower === 'output') return 'bg-gray-600';
    return 'bg-purple-600';
  };

  return (
    <div className={`code-viewer ${className} relative group shadow-lg`}>
      <div className={`${getLangColor(language)} text-white rounded-t-md p-3 text-sm font-mono flex items-center justify-between transition-all duration-300`}>
        <span className="flex items-center">
          {language === 'python' && (
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path fill="currentColor" d="M439.8 200.5c-7.7-30.9-22.3-54.2-53.4-54.2h-40.1v47.4c0 36.8-31.2 67.8-66.8 67.8H172.7c-29.2 0-53.4 25-53.4 54.3v101.8c0 29 25.2 46 53.4 54.3 33.8 9.9 66.3 11.7 106.8 0 26.9-7.8 53.4-23.5 53.4-54.3v-40.7H226.2v-13.6h160.2c31.1 0 42.6-21.7 53.4-54.2 11.2-33.5 10.7-65.7 0-108.6zM286.2 404c11.1 0 20.1 9.1 20.1 20.3 0 11.3-9 20.4-20.1 20.4-11 0-20.1-9.2-20.1-20.4.1-11.3 9.1-20.3 20.1-20.3zM167.8 248.1h106.8c29.7 0 53.4-24.5 53.4-54.3V91.9c0-29-24.4-50.7-53.4-55.6-35.8-5.9-74.7-5.6-106.8.1-45.2 8-53.4 24.7-53.4 55.6v40.7h106.9v13.6h-147c-31.1 0-58.3 18.7-66.8 54.2-9.8 40.7-10.2 66.1 0 108.6 7.6 31.6 25.7 54.2 56.8 54.2H101v-48.8c0-35.3 30.5-66.4 66.8-66.4zm-6.7-142.6c-11.1 0-20.1-9.1-20.1-20.3.1-11.3 9-20.4 20.1-20.4 11 0 20.1 9.2 20.1 20.4s-9 20.3-20.1 20.3z"/>
            </svg>
          )}
          {language === 'bash' && (
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path fill="currentColor" d="M439.8 200.5L419.7 240h-60.4c-9.5 0-17.6 3.8-23.2 11.4s-7.9 16.8-6 27.3l16.2 90h-30l-14-78c-1.4-7.8-5.5-13.9-12.1-18.2s-14.4-5.5-22.5-3.8l-16 3.5l3.8 21.5l16-3.5c3.8-1 6 2 6.6 4.4l14 78c1.4 7.8 5.5 13.9 12.1 18.2s14.4 6 22.5 3.8l30-6.7l3.3 19.5c2.2 11.9-3.5 22.3-14.5 25.7L205 449l4 22.8l140-26.3c9.5-1.9 17.6-6.2 23.2-12.8s8.4-16 7-26.5l-9.5-53l49.9-36.9c11.6-8.2 17.3-19.1 17.3-32.5c0-48.1-10.3-89.3-30.5-123.4zM112 368l-14.5-81.1c-2.2-10.5-8.5-17.8-18.5-22l-32.3-12.9l59.5-25.2c9.5-4 14.8-11.5 15.5-22.4l8.7-120c1.1-10.2-1.9-18.5-8.6-24.9S106.1 48 96 48H80c-8.2 0-15.9 3.5-21.1 9.6s-7.3 14.6-6 22.7l9.3 73.6l-60.2 25.5c-9.5 4-14.7 11.5-15.6 22.3S-9 222.2 2 232l63 56l14.5 81.6c1.9 10.7 8.2 18.2 18.7 22.5l32 12.9l-59 25.5c-9.3 4-14.4 11.6-15.3 22.5c-.4 10.8 3.7 19.1 12.3 24.9s19.6 8 32 6.7l89-9.3l47.1 37.6c8.2 6.6 18.3 9.3 30.1 8c11.8-1.3 20.9-6.9 27.4-16.9l18.7-33.3l-22.5-11.7L272 437.5c-1.5 2.7-5.3 4.8-11.5 5.4s-10.7-1.5-13.5-3.7L200 401.7c-5.5-4.4-12.6-6.4-19.7-5.4L80 408l25.7-11.3c4-1.3 6.4-3.5 7.9-6.5s1.3-7.1-.6-11.2L89.7 278.9c-2.5-5.9-7.3-10.5-13.3-13l-62.4-55.6l33.2-14c4-1.3 6.5-3.6 7.8-6.6s1.3-7.1-.6-11.3L35.5 71h50.6L77.6 188.8c-1.1 5.9 0 12.1 3.2 17.2s8.3 8.8 14.2 10.7l114 45.7c4 1.3 6.5 3.6 7.8 6.6c1.4 3 1.2 7.1-.8 11z"/>
            </svg>
          )}
          {language === 'javascript' && (
            <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path fill="currentColor" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM243.8 381.4c0 43.6-25.6 63.5-62.9 63.5-33.7 0-53.2-17.4-63.2-38.5l34.3-20.7c6.6 11.7 12.6 21.6 27.1 21.6 13.8 0 22.6-5.4 22.6-26.5V237.7h42.1v143.7zm99.6 63.5c-39.1 0-64.4-18.6-76.7-43l34.3-19.8c9 14.7 20.8 25.6 41.5 25.6 17.4 0 28.6-8.7 28.6-20.8 0-14.4-11.4-19.5-30.7-28l-10.5-4.5c-30.4-12.9-50.5-29.2-50.5-63.5 0-31.6 24.1-55.6 61.6-55.6 26.8 0 46 9.3 59.8 33.7L368 290c-7.2-12.9-15-18-27.1-18-12.3 0-20.1 7.8-20.1 18 0 12.6 7.8 17.7 25.9 25.6l10.5 4.5c35.8 15.3 55.9 31 55.9 66.2 0 37.8-29.8 58.6-69.7 58.6z"/>
            </svg>
          )}
          <span className="font-medium">{language || 'Code'}</span>
        </span>
        <button
          onClick={handleCopy}
          className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded transition-colors flex items-center"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-md overflow-x-auto font-mono text-sm whitespace-pre-wrap border border-gray-800 transition-all duration-300 max-h-[600px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <code>{value}</code>
      </pre>
    </div>
  );
};

export default CodeViewer; 