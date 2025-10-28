import React, { useState, useEffect } from 'react';

interface ScriptSEOPreviewProps {
  title: string;
  description: string;
  slug: string;
  language: string;
  scriptType: string;
  difficulty: string;
  tags: string[];
  featuredImage?: string;
  isMultiLanguage?: boolean;
  availableLanguages?: string[];
}

export default function ScriptSEOPreview({
  title,
  description,
  slug,
  language,
  scriptType,
  difficulty,
  tags,
  featuredImage,
  isMultiLanguage = false,
  availableLanguages = []
}: ScriptSEOPreviewProps) {
  const [previewData, setPreviewData] = useState({
    googleTitle: '',
    googleDescription: '',
    googleUrl: '',
    socialTitle: '',
    socialDescription: '',
    socialImage: ''
  });

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ainews.com';
    const scriptUrl = `${baseUrl}/scripts/${slug}`;
    const imageUrl = featuredImage || `${baseUrl}/images/script-default.png`;
    
    // Generate SEO-optimized title and description
    const seoTitle = title || `Untitled ${language} Script`;
    const seoDescription = description || 
      `Download and use this ${language} script for ${scriptType.toLowerCase()}. ${difficulty} level script with comprehensive documentation and examples.`;
    
    // Google Search Result Preview
    const googleTitle = seoTitle.length > 60 ? `${seoTitle.substring(0, 57)}...` : seoTitle;
    const googleDescription = seoDescription.length > 160 ? `${seoDescription.substring(0, 157)}...` : seoDescription;
    
    // Social Media Preview
    const socialTitle = seoTitle.length > 70 ? `${seoTitle.substring(0, 67)}...` : seoTitle;
    const socialDescription = seoDescription.length > 200 ? `${seoDescription.substring(0, 197)}...` : seoDescription;
    
    setPreviewData({
      googleTitle,
      googleDescription,
      googleUrl: scriptUrl,
      socialTitle,
      socialDescription,
      socialImage: imageUrl
    });
  }, [title, description, slug, language, scriptType, difficulty, featuredImage]);

  return (
    <div className="space-y-6">
      {/* Google Search Result Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Google Search Result Preview
        </h3>
        
        <div className="space-y-2">
          <div className="text-blue-600 text-lg leading-tight hover:underline cursor-pointer">
            {previewData.googleTitle}
          </div>
          <div className="text-green-700 text-sm">
            {previewData.googleUrl}
          </div>
          <div className="text-gray-600 text-sm leading-relaxed">
            {previewData.googleDescription}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Social Media Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v3z" />
          </svg>
          Social Media Preview (Facebook/Twitter)
        </h3>
        
        <div className="border border-gray-300 rounded-lg overflow-hidden max-w-md">
          {previewData.socialImage && (
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <img 
                src={previewData.socialImage} 
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="p-3">
            <div className="text-blue-600 text-sm font-medium mb-1">
              ainews.com
            </div>
            <div className="text-gray-900 font-semibold text-base leading-tight mb-1">
              {previewData.socialTitle}
            </div>
            <div className="text-gray-600 text-sm leading-relaxed">
              {previewData.socialDescription}
            </div>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {language}
              </span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                {difficulty}
              </span>
              {isMultiLanguage && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Multi-Language
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SEO Score Indicator */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          SEO Analysis
        </h3>
        
        <div className="space-y-3">
          {/* Title Analysis */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Title Length</span>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${title.length >= 30 && title.length <= 60 ? 'text-green-600' : 'text-yellow-600'}`}>
                {title.length}/60
              </span>
              {title.length >= 30 && title.length <= 60 ? (
                <svg className="w-4 h-4 ml-1 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-1 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Description Analysis */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Description Length</span>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${description.length >= 120 && description.length <= 160 ? 'text-green-600' : 'text-yellow-600'}`}>
                {description.length}/160
              </span>
              {description.length >= 120 && description.length <= 160 ? (
                <svg className="w-4 h-4 ml-1 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-1 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Keywords Analysis */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Keywords</span>
            <div className="flex items-center">
              <span className={`text-sm font-medium ${tags.length >= 3 ? 'text-green-600' : 'text-yellow-600'}`}>
                {tags.length} tags
              </span>
              {tags.length >= 3 ? (
                <svg className="w-4 h-4 ml-1 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 ml-1 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
            </div>
          </div>
          
          {/* Multi-language Analysis */}
          {isMultiLanguage && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Multi-Language</span>
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-600">
                  {availableLanguages.length} languages
                </span>
                <svg className="w-4 h-4 ml-1 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Structured Data Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Structured Data Preview
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-3 text-xs font-mono overflow-x-auto">
          <div className="text-gray-600 mb-2">Schema.org Types:</div>
          <div className="space-y-1">
            <div className="text-blue-600">• SoftwareApplication</div>
            <div className="text-green-600">• HowTo</div>
            <div className="text-purple-600">• CreativeWork</div>
            <div className="text-orange-600">• BreadcrumbList</div>
            {isMultiLanguage && (
              <div className="text-pink-600">• CollectionPage</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
