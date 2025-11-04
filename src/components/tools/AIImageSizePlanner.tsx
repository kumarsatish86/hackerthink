"use client";

import React, { useState } from 'react';

type Platform = 'youtube-thumbnail' | 'youtube-shorts' | 'instagram-reel' | 'instagram-post' | 'linkedin-banner' | 'linkedin-post' | 'twitter' | 'facebook' | 'tiktok' | 'pinterest';

interface PlatformSpec {
  id: Platform;
  name: string;
  category: string;
  aspectRatio: string;
  dimensions: string;
  width: number;
  height: number;
  safeZone: { width: number; height: number; x: number; y: number };
  recommendedFontSize: { min: number; max: number };
  tips: string[];
  commonFormats: string[];
}

const platforms: Record<Platform, PlatformSpec> = {
  'youtube-thumbnail': {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'Video',
    aspectRatio: '16:9',
    dimensions: '1280 × 720 pixels',
    width: 1280,
    height: 720,
    safeZone: { width: 1150, height: 640, x: 65, y: 40 },
    recommendedFontSize: { min: 72, max: 120 },
    tips: [
      'Use high contrast colors for better visibility at small sizes',
      'Place important text in the center or left third',
      'Avoid placing critical elements in bottom 25% (video title overlay)',
      'Keep file size under 2MB for faster loading',
      'Use bold, sans-serif fonts for readability'
    ],
    commonFormats: ['JPG', 'PNG', 'GIF (animated)']
  },
  'youtube-shorts': {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    category: 'Video',
    aspectRatio: '9:16',
    dimensions: '1080 × 1920 pixels',
    width: 1080,
    height: 1920,
    safeZone: { width: 972, height: 1728, x: 54, y: 96 },
    recommendedFontSize: { min: 60, max: 100 },
    tips: [
      'Place main content in center area (safe from UI overlays)',
      'Ensure content is readable in portrait mode',
      'Avoid placing text in top 15% (channel name area)',
      'Use vertical composition for maximum impact',
      'Minimum size: 640 × 1140 pixels'
    ],
    commonFormats: ['JPG', 'PNG']
  },
  'instagram-reel': {
    id: 'instagram-reel',
    name: 'Instagram Reel Cover',
    category: 'Social Media',
    aspectRatio: '9:16',
    dimensions: '1080 × 1920 pixels',
    width: 1080,
    height: 1920,
    safeZone: { width: 972, height: 1728, x: 54, y: 96 },
    recommendedFontSize: { min: 60, max: 100 },
    tips: [
      'First frame becomes the cover thumbnail',
      'Keep important content in center area',
      'Avoid Instagram UI elements (like button, comment area)',
      'Use vibrant colors to stand out in feed',
      'Ensure readability without zoom'
    ],
    commonFormats: ['JPG', 'PNG']
  },
  'instagram-post': {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: 'Social Media',
    aspectRatio: '1:1',
    dimensions: '1080 × 1080 pixels',
    width: 1080,
    height: 1080,
    safeZone: { width: 972, height: 972, x: 54, y: 54 },
    recommendedFontSize: { min: 48, max: 80 },
    tips: [
      'Square format works best in feed',
      'Safe zone extends to 810 × 810 (outer edges may be cropped)',
      'Use vibrant colors for engagement',
      'Consider using Instagram Stories (9:16) for more space',
      'Keep important elements centered'
    ],
    commonFormats: ['JPG', 'PNG']
  },
  'linkedin-banner': {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'Professional',
    aspectRatio: '45:11',
    dimensions: '1584 × 396 pixels',
    width: 1584,
    height: 396,
    safeZone: { width: 1350, height: 336, x: 117, y: 30 },
    recommendedFontSize: { min: 36, max: 56 },
    tips: [
      'Very wide format - use horizontal compositions',
      'Safe zone accounts for profile picture on left',
      'Keep text on right side (profile pic on left)',
      'Use professional, clean designs',
      'Maximum file size: 8MB, recommend under 4MB'
    ],
    commonFormats: ['JPG', 'PNG']
  },
  'linkedin-post': {
    id: 'linkedin-post',
    name: 'LinkedIn Post Image',
    category: 'Professional',
    aspectRatio: '1.91:1',
    dimensions: '1200 × 627 pixels',
    width: 1200,
    height: 627,
    safeZone: { width: 1080, height: 564, x: 60, y: 32 },
    recommendedFontSize: { min: 48, max: 72 },
    tips: [
      'Horizontal format for better engagement',
      'Professional tone works best',
      'Include captions or quotes for engagement',
      'Safe zone: 1080 × 564 area',
      'Use infographics and data visualizations'
    ],
    commonFormats: ['JPG', 'PNG']
  },
  'twitter': {
    id: 'twitter',
    name: 'Twitter / X Post',
    category: 'Social Media',
    aspectRatio: '16:9',
    dimensions: '1200 × 675 pixels',
    width: 1200,
    height: 675,
    safeZone: { width: 1080, height: 608, x: 60, y: 34 },
    recommendedFontSize: { min: 60, max: 100 },
    tips: [
      'Aspect ratio appears in timeline',
      'Keep important content in center',
      'Bold colors and high contrast work well',
      'Minimum size: 600 × 337 pixels',
      'Use GIF for animated content'
    ],
    commonFormats: ['JPG', 'PNG', 'GIF']
  },
  'facebook': {
    id: 'facebook',
    name: 'Facebook Post',
    category: 'Social Media',
    aspectRatio: '1.91:1',
    dimensions: '1200 × 630 pixels',
    width: 1200,
    height: 630,
    safeZone: { width: 1080, height: 567, x: 60, y: 32 },
    recommendedFontSize: { min: 48, max: 72 },
    tips: [
      'Standard feed post size',
      'Engages better than text-only posts',
      'Keep text to minimum (80% visual, 20% text rule)',
      'Safe zone: 1080 × 567 area',
      'Use call-to-action buttons when appropriate'
    ],
    commonFormats: ['JPG', 'PNG']
  },
  'tiktok': {
    id: 'tiktok',
    name: 'TikTok Video',
    category: 'Video',
    aspectRatio: '9:16',
    dimensions: '1080 × 1920 pixels',
    width: 1080,
    height: 1920,
    safeZone: { width: 972, height: 1728, x: 54, y: 96 },
    recommendedFontSize: { min: 60, max: 100 },
    tips: [
      'Vertical format optimized for mobile',
      'Most popular short-form video platform',
      'Keep captions in middle area',
      'Avoid bottom 20% (username/description area)',
      'Use trending colors and effects'
    ],
    commonFormats: ['MP4', 'MOV']
  },
  'pinterest': {
    id: 'pinterest',
    name: 'Pinterest Pin',
    category: 'Content Marketing',
    aspectRatio: '2:3',
    dimensions: '1000 × 1500 pixels',
    width: 1000,
    height: 1500,
    safeZone: { width: 900, height: 1350, x: 50, y: 75 },
    recommendedFontSize: { min: 54, max: 90 },
    tips: [
      'Vertical format works best',
      'Can be up to 2362 × 3543 pixels for rich pins',
      'Place text at top 20% for maximum visibility',
      'Use thin, tall designs for Pins',
      'High-quality images get more repins'
    ],
    commonFormats: ['JPG', 'PNG']
  }
};

export function AIImageSizePlanner() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('youtube-thumbnail');
  const [showVisualizer, setShowVisualizer] = useState(true);

  const currentPlatform = platforms[selectedPlatform];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="#4f46e5"/>
          <path d="M8 8h8v8H8z" fill="white"/>
        </svg>
        AI Image Size Planner
      </h2>

      <p className="text-gray-600 mb-6">
        Get exact dimensions, safe zones, and specifications for every social media platform. 
        Perfect for content creators designing thumbnails, banners, and social media graphics.
      </p>

      {/* Platform Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-indigo-700">
          Select Platform
        </label>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(platforms).map(platform => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedPlatform === platform.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm">{platform.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{platform.category}</div>
                </div>
                <span className={selectedPlatform === platform.id ? 'text-indigo-600' : 'text-gray-400'}>
                  {selectedPlatform === platform.id ? '✓' : '○'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Dimensions & Specifications</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Aspect Ratio</span>
                <span className="font-semibold text-indigo-600">{currentPlatform.aspectRatio}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Dimensions</span>
                <span className="font-semibold text-indigo-600">{currentPlatform.dimensions}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Width</span>
                <span className="font-semibold text-gray-900">{currentPlatform.width}px</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Height</span>
                <span className="font-semibold text-gray-900">{currentPlatform.height}px</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Safe Zone</span>
                <span className="font-semibold text-blue-600">
                  {currentPlatform.safeZone.width} × {currentPlatform.safeZone.height}px
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-700">Font Size Range</span>
                <span className="font-semibold text-green-600">
                  {currentPlatform.recommendedFontSize.min}-{currentPlatform.recommendedFontSize.max}px
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium text-gray-700">Formats</span>
                <span className="font-semibold text-gray-900">
                  {currentPlatform.commonFormats.join(', ')}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Design Tips</h3>
            <ul className="space-y-2">
              {currentPlatform.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span className="text-gray-700 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      {showVisualizer && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Visual Preview</h3>
            <button
              onClick={() => setShowVisualizer(!showVisualizer)}
              className="text-sm text-indigo-600 hover:underline"
            >
              {showVisualizer ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
            <div className="relative border-4 border-gray-400" style={{ width: '300px', height: `${300 * (currentPlatform.height / currentPlatform.width)}px` }}>
              {/* Full canvas */}
              <div className="absolute inset-0 bg-blue-500 opacity-20"></div>
              
              {/* Safe zone */}
              <div 
                className="absolute border-2 border-yellow-400 border-dashed bg-yellow-200 opacity-30"
                style={{
                  left: `${(currentPlatform.safeZone.x / currentPlatform.width) * 100}%`,
                  top: `${(currentPlatform.safeZone.y / currentPlatform.height) * 100}%`,
                  width: `${(currentPlatform.safeZone.width / currentPlatform.width) * 100}%`,
                  height: `${(currentPlatform.safeZone.height / currentPlatform.height) * 100}%`
                }}
              ></div>
              
              {/* Labels */}
              <div className="absolute top-1 left-1 text-xs font-bold text-gray-700 bg-white px-1 rounded">
                Full Area
              </div>
              <div 
                className="absolute text-xs font-bold text-yellow-700 bg-yellow-100 px-1 rounded"
                style={{
                  left: `${(currentPlatform.safeZone.x / currentPlatform.width) * 100}%`,
                  top: `${(currentPlatform.safeZone.y / currentPlatform.height) * 100}%`
                }}
              >
                Safe Zone
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Blue = Full image area | Yellow = Safe zone for important content
          </p>
        </div>
      )}

      {/* CTA to Image Prompt Styler */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-purple-900 mb-2">
              🎨 Need to Create This Image?
            </h3>
            <p className="text-purple-700">
              Generate the perfect AI image with our <strong>AI Image Prompt Styler</strong> tool.
              Select styles like anime, 3D, cyberpunk, and more!
            </p>
          </div>
          <a 
            href="/tools/ai-image-prompt-styler"
            className="ml-4 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            Generate Image →
          </a>
        </div>
      </div>
    </div>
  );
}

export function AIImageSizePlannerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Why Image Dimensions Matter</h2>
        <p className="text-gray-700 text-lg">
          Each social media platform has <strong>specific image requirements</strong> that affect how your content appears. 
          Using the wrong dimensions can result in cropped, distorted, or unprofessional-looking images. Our planner 
          ensures your graphics look perfect on every platform.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">What is a Safe Zone?</h2>
        <p className="text-gray-700 text-lg mb-3">
          The <strong>safe zone</strong> is the area where your content will definitely be visible. 
          Elements placed outside this zone may be cropped by platform UI elements, profile pictures, or overlays.
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li>Keep <strong>important text</strong> within the safe zone</li>
          <li>Place <strong>faces and key visuals</strong> in the safe area</li>
          <li>Avoid putting <strong>call-to-action buttons</strong> near edges</li>
          <li>Use safe zone for <strong>logo placement</strong></li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Platform-Specific Guidelines</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">🎬 Video Platforms</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>YouTube:</strong> 16:9 for thumbnails, 9:16 for Shorts</li>
              <li>• <strong>TikTok:</strong> Optimize for mobile vertical viewing</li>
              <li>• <strong>Instagram Reels:</strong> First frame is the cover</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">📱 Social Media</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Instagram:</strong> Square (1:1) for posts</li>
              <li>• <strong>Twitter/X:</strong> Landscape 16:9 works best</li>
              <li>• <strong>Facebook:</strong> Horizontal 1.91:1 optimal</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">💼 Professional</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>LinkedIn Banner:</strong> Very wide 45:11 format</li>
              <li>• <strong>LinkedIn Post:</strong> Professional 1.91:1</li>
            </ul>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">📌 Marketing</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Pinterest:</strong> Vertical 2:3 ratio preferred</li>
              <li>• <strong>Blog Images:</strong> Check individual requirements</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Font Size Recommendations</h2>
        <p className="text-gray-700 text-lg mb-3">
          Font sizes are platform-dependent. Larger platforms can accommodate bigger text, while compact formats 
          require smaller fonts:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Large formats</strong> (1280px+): Use 72-120px fonts for maximum impact</li>
          <li><strong>Medium formats</strong> (1000-1200px): Use 48-80px fonts for balance</li>
          <li><strong>Compact formats</strong> (&lt;1000px): Use 36-60px fonts for readability</li>
          <li><strong>Always test</strong> font sizes at actual platform size to ensure readability</li>
        </ul>
      </section>

      <section className="mb-10 bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Optimization Tips</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><strong>File format:</strong> Use JPG for photos, PNG for graphics with transparency</li>
          <li><strong>File size:</strong> Compress images without losing quality (aim for under 2MB)</li>
          <li><strong>Color space:</strong> Use sRGB for web consistency</li>
          <li><strong>Text contrast:</strong> Maintain at least 4.5:1 ratio for accessibility</li>
          <li><strong>Mobile-first:</strong> Test on actual device screens</li>
        </ul>
      </section>
    </>
  );
}

export default AIImageSizePlanner;

