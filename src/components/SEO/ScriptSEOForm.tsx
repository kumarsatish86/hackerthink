import React, { useState, useEffect } from 'react';
import ScriptSEOGenerator from './ScriptSEOGenerator';

interface ScriptData {
  title: string;
  description: string;
  script_content: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  featured_image: string;
  is_multi_language: boolean;
  available_languages: string[];
}

interface ScriptSEOFormProps {
  scriptData: ScriptData;
  onUpdate: (field: string, value: any) => void;
}

export default function ScriptSEOForm({ scriptData, onUpdate }: ScriptSEOFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const handleGenerate = (seoData: any) => {
    setGeneratedData(seoData);
    
    // Auto-populate the form with generated data
    onUpdate('meta_title', seoData.meta_title);
    onUpdate('meta_description', seoData.meta_description);
    
    // Update tags if they're empty or minimal
    if (!scriptData.tags || scriptData.tags.length < 3) {
      onUpdate('tags', seoData.schema_keywords.slice(0, 8));
    }
  };

  const handleApplyGenerated = (field: string) => {
    if (generatedData) {
      switch (field) {
        case 'meta_title':
          onUpdate('meta_title', generatedData.meta_title);
          break;
        case 'meta_description':
          onUpdate('meta_description', generatedData.meta_description);
          break;
        case 'tags':
          onUpdate('tags', generatedData.schema_keywords.slice(0, 8));
          break;
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* AI SEO Generator */}
      <ScriptSEOGenerator
        scriptData={scriptData}
        onGenerate={handleGenerate}
      />

      {/* Generated Data Preview */}
      {generatedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Generated SEO Content
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-green-700 mb-1">Meta Title</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 text-sm text-gray-700 bg-white p-2 rounded border">
                  {generatedData.meta_title}
                </div>
                <button
                  onClick={() => handleApplyGenerated('meta_title')}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-green-700 mb-1">Meta Description</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 text-sm text-gray-700 bg-white p-2 rounded border">
                  {generatedData.meta_description}
                </div>
                <button
                  onClick={() => handleApplyGenerated('meta_description')}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-green-700 mb-1">Keywords</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex flex-wrap gap-1">
                  {generatedData.schema_keywords.slice(0, 8).map((keyword: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {keyword}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleApplyGenerated('tags')}
                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic SEO Fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <input
            type="text"
            id="meta_title"
            value={scriptData.meta_title || ''}
            onChange={(e) => onUpdate('meta_title', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter SEO-optimized title (30-60 characters)"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Length: {scriptData.meta_title?.length || 0}/60</span>
            <span className={scriptData.meta_title && scriptData.meta_title.length >= 30 && scriptData.meta_title.length <= 60 ? 'text-green-600' : 'text-yellow-600'}>
              {scriptData.meta_title && scriptData.meta_title.length >= 30 && scriptData.meta_title.length <= 60 ? '✓ Optimal' : '⚠ Needs adjustment'}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <textarea
            id="meta_description"
            rows={3}
            value={scriptData.meta_description || ''}
            onChange={(e) => onUpdate('meta_description', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter SEO-optimized description (120-160 characters)"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>Length: {scriptData.meta_description?.length || 0}/160</span>
            <span className={scriptData.meta_description && scriptData.meta_description.length >= 120 && scriptData.meta_description.length <= 160 ? 'text-green-600' : 'text-yellow-600'}>
              {scriptData.meta_description && scriptData.meta_description.length >= 120 && scriptData.meta_description.length <= 160 ? '✓ Optimal' : '⚠ Needs adjustment'}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">
            Featured Image URL
          </label>
          <input
            type="url"
            id="featured_image"
            value={scriptData.featured_image || ''}
            onChange={(e) => onUpdate('featured_image', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://example.com/image.jpg"
          />
          <p className="mt-1 text-xs text-gray-500">Used for social media previews and rich snippets (1200x630px recommended)</p>
        </div>
      </div>

      {/* Advanced SEO Options */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <svg className={`w-4 h-4 mr-2 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced SEO Options
        </button>
        
        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schema.org Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {generatedData?.schema_categories?.map((category: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                {generatedData?.schema_audience || 'Not generated yet'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Resource Type
              </label>
              <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                {generatedData?.schema_learning_resource_type || 'Not generated yet'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEO Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SEO Tips
        </h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Include your target language and script type in the title</li>
          <li>• Use action words like "Download", "Learn", "Create" in descriptions</li>
          <li>• Add relevant keywords that users might search for</li>
          <li>• Include difficulty level and OS compatibility in descriptions</li>
          <li>• Use a high-quality featured image for better social sharing</li>
        </ul>
      </div>
    </div>
  );
}
