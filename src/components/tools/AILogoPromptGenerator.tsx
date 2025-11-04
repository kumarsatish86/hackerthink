"use client";

import React, { useState } from 'react';

interface LogoPromptData {
  brandName: string;
  industry: string;
  style: string;
  colorScheme: string[];
  additionalElements: string[];
  mood: string;
  complexity: string;
}

const logoStyles = [
  'Minimalist',
  'Modern',
  'Vintage',
  'Corporate',
  'Creative',
  'Geometric',
  'Hand-drawn',
  'Abstract',
  'Typography-based',
  'Icon-based',
  '3D',
  'Gradient',
  'Flat Design',
  'Isometric',
  'Brutalist'
];

const colorSchemes = [
  'Monochrome',
  'Bold & Vibrant',
  'Pastel',
  'Dark & Moody',
  'Natural/Earth Tones',
  'Tech/Blue',
  'Warm Colors',
  'Cool Colors',
  'Rainbow',
  'Black & White',
  'Gold & Black',
  'Custom'
];

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Food & Beverage',
  'Fashion',
  'Real Estate',
  'Entertainment',
  'Sports',
  'Travel',
  'E-commerce',
  'Consulting',
  'Creative Agency',
  'Non-profit',
  'Other'
];

const moods = [
  'Professional',
  'Friendly',
  'Bold',
  'Elegant',
  'Playful',
  'Trustworthy',
  'Innovative',
  'Luxury',
  'Energetic',
  'Calm'
];

const complexityLevels = [
  'Simple (Icon only)',
  'Moderate (Icon + Text)',
  'Complex (Detailed illustration)',
  'Very Complex (Intricate design)'
];

function generateLogoPrompt(data: LogoPromptData, platform: string): string {
  const { brandName, industry, style, colorScheme, additionalElements, mood, complexity } = data;

  let prompt = '';

  switch (platform) {
    case 'midjourney':
      prompt = `logo design for "${brandName}", ${style.toLowerCase()} style, ${industry.toLowerCase()} industry, ${mood.toLowerCase()} mood, `;
      prompt += `color scheme: ${colorScheme.join(', ').toLowerCase()}, `;
      if (additionalElements.length > 0) {
        prompt += `incorporating ${additionalElements.join(', ').toLowerCase()}, `;
      }
      prompt += `${complexity.toLowerCase()}, `;
      prompt += `professional logo, clean design, vector style, high quality, --v 6 --style raw`;
      break;

    case 'leonardo':
      prompt = `Professional logo design for ${brandName}, ${style.toLowerCase()} ${industry.toLowerCase()} branding, `;
      prompt += `${mood.toLowerCase()} aesthetic, ${colorScheme.join(' and ').toLowerCase()} color palette, `;
      if (additionalElements.length > 0) {
        prompt += `with ${additionalElements.join(', ').toLowerCase()} elements, `;
      }
      prompt += `${complexity.toLowerCase()}, clean vector logo, scalable design, modern branding`;
      break;

    case 'dalle':
      prompt = `A ${style.toLowerCase()} logo design for a company called "${brandName}" in the ${industry.toLowerCase()} industry. `;
      prompt += `The logo should have a ${mood.toLowerCase()} feel with a ${colorScheme.join(' and ').toLowerCase()} color scheme. `;
      if (additionalElements.length > 0) {
        prompt += `Include ${additionalElements.join(', ').toLowerCase()}. `;
      }
      prompt += `The design should be ${complexity.toLowerCase()}, clean, professional, and suitable for a logo. `;
      prompt += `Vector style, simple background, high contrast`;
      break;

    case 'stable-diffusion':
      prompt = `logo, ${brandName}, ${style.toLowerCase()}, ${industry.toLowerCase()}, `;
      prompt += `${mood.toLowerCase()}, ${colorScheme.join(', ').toLowerCase()}, `;
      if (additionalElements.length > 0) {
        prompt += `${additionalElements.join(', ')}, `;
      }
      prompt += `${complexity.toLowerCase()}, professional, vector art, clean design, `;
      prompt += `high quality, minimalist, branding, icon, symbol, modern`;
      break;

    default:
      prompt = `Create a ${style.toLowerCase()} logo design for "${brandName}" in the ${industry.toLowerCase()} industry. `;
      prompt += `The logo should convey a ${mood.toLowerCase()} mood using a ${colorScheme.join(' and ').toLowerCase()} color palette. `;
      if (additionalElements.length > 0) {
        prompt += `Include elements like ${additionalElements.join(', ').toLowerCase()}. `;
      }
      prompt += `The design complexity should be ${complexity.toLowerCase()}. `;
      prompt += `Professional, clean, scalable vector logo suitable for branding.`;
  }

  return prompt.trim();
}

export function AILogoPromptGenerator() {
  const [logoData, setLogoData] = useState<LogoPromptData>({
    brandName: '',
    industry: '',
    style: '',
    colorScheme: [],
    additionalElements: [],
    mood: '',
    complexity: ''
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>('midjourney');
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [customColor, setCustomColor] = useState('');

  const handleInputChange = (field: keyof LogoPromptData, value: any) => {
    setLogoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorToggle = (color: string) => {
    setLogoData(prev => {
      const colors = [...prev.colorScheme];
      const index = colors.indexOf(color);
      if (index > -1) {
        colors.splice(index, 1);
      } else {
        colors.push(color);
      }
      return {
        ...prev,
        colorScheme: colors
      };
    });
  };

  const handleAddElement = () => {
    if (customColor.trim()) {
      setLogoData(prev => ({
        ...prev,
        additionalElements: [...prev.additionalElements, customColor.trim()]
      }));
      setCustomColor('');
    }
  };

  const handleRemoveElement = (index: number) => {
    setLogoData(prev => {
      const elements = [...prev.additionalElements];
      elements.splice(index, 1);
      return {
        ...prev,
        additionalElements: elements
      };
    });
  };

  const handleGenerate = () => {
    if (!logoData.brandName || !logoData.style || logoData.colorScheme.length === 0) {
      alert('Please fill in at least Brand Name, Style, and select at least one color scheme');
      return;
    }

    setIsGenerating(true);

    // Generate prompts for all platforms
    setTimeout(() => {
      const prompts: Record<string, string> = {};
      const platforms = ['midjourney', 'leonardo', 'dalle', 'stable-diffusion'];
      
      platforms.forEach(platform => {
        prompts[platform] = generateLogoPrompt(logoData, platform);
      });

      setGeneratedPrompts(prompts);
      setIsGenerating(false);
    }, 1000);
  };

  const handleCopy = (platform: string) => {
    if (generatedPrompts[platform]) {
      navigator.clipboard.writeText(generatedPrompts[platform]);
      alert(`${platform.charAt(0).toUpperCase() + platform.slice(1)} prompt copied!`);
    }
  };

  const handleCopyAll = () => {
    const allPrompts = Object.entries(generatedPrompts)
      .map(([platform, prompt]) => `${platform.toUpperCase()}:\n${prompt}\n\n`)
      .join('---\n\n');
    
    navigator.clipboard.writeText(allPrompts);
    alert('All prompts copied to clipboard!');
  };

  const isFormValid = () => {
    return logoData.brandName.trim() !== '' && 
           logoData.style !== '' && 
           logoData.colorScheme.length > 0;
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-orange-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#9A3412" strokeWidth="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="#9A3412" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#9A3412" strokeWidth="2" fill="none"/>
        </svg>
        AI Logo Prompt Generator
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-6">
          {/* Brand Name */}
          <div>
            <label className="block mb-2 font-semibold text-orange-700">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={logoData.brandName}
              onChange={(e) => handleInputChange('brandName', e.target.value)}
              placeholder="e.g., TechFlow, DesignStudio, InnovateCo"
              className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          {/* Industry & Style */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-orange-700">
                Industry
              </label>
              <select
                value={logoData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-orange-700">
                Logo Style <span className="text-red-500">*</span>
              </label>
              <select
                value={logoData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
                className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select Style</option>
                {logoStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block mb-2 font-semibold text-orange-700">
              Color Scheme <span className="text-red-500">*</span> (Select one or more)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {colorSchemes.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorToggle(color)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                    logoData.colorScheme.includes(color)
                      ? 'bg-orange-500 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-orange-200 hover:border-orange-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
            {logoData.colorScheme.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {logoData.colorScheme.join(', ')}
              </p>
            )}
          </div>

          {/* Mood & Complexity */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-orange-700">
                Mood/Aesthetic
              </label>
              <select
                value={logoData.mood}
                onChange={(e) => handleInputChange('mood', e.target.value)}
                className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select Mood</option>
                {moods.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-orange-700">
                Complexity Level
              </label>
              <select
                value={logoData.complexity}
                onChange={(e) => handleInputChange('complexity', e.target.value)}
                className="w-full p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              >
                <option value="">Select Complexity</option>
                {complexityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Elements */}
          <div>
            <label className="block mb-2 font-semibold text-orange-700">
              Additional Elements (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="e.g., mountains, stars, arrows, geometric shapes"
                className="flex-1 p-3 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddElement()}
              />
              <button
                onClick={handleAddElement}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add
              </button>
            </div>
            {logoData.additionalElements.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {logoData.additionalElements.map((element, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                  >
                    {element}
                    <button
                      onClick={() => handleRemoveElement(index)}
                      className="text-orange-600 hover:text-orange-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
              isFormValid() && !isGenerating
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Prompts...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                </svg>
                Generate Logo Prompts
              </span>
            )}
          </button>
        </div>
      </div>

      {Object.keys(generatedPrompts).length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-orange-800">
              Generated Prompts
            </h3>
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy All
            </button>
          </div>

          {Object.entries(generatedPrompts).map(([platform, prompt]) => (
            <div
              key={platform}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-orange-100 hover:border-orange-300 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-bold uppercase">
                      {platform}
                    </span>
                    <h4 className="text-xl font-bold text-gray-900">
                      {platform === 'midjourney' ? 'Midjourney' :
                       platform === 'leonardo' ? 'Leonardo.ai' :
                       platform === 'dalle' ? 'DALL-E' :
                       platform === 'stable-diffusion' ? 'Stable Diffusion' : platform}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(platform)}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{prompt}</pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AILogoPromptGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">What is an AI Logo Prompt Generator?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Logo Prompt Generator</strong> is a specialized tool that creates optimized prompts for generating 
          logos using AI image generators like Midjourney, Leonardo.ai, DALL-E, and Stable Diffusion. By entering your 
          brand name, preferred style, color scheme, and other design elements, the tool generates platform-specific prompts 
          that help AI create professional logo designs tailored to your brand.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Logo Prompt Generator creates optimized prompts by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Collecting brand information:</strong> Brand name, industry, and design preferences</li>
          <li><strong>Analyzing style requirements:</strong> Logo style, color scheme, mood, and complexity</li>
          <li><strong>Optimizing for platforms:</strong> Generating prompts tailored to each AI image generator</li>
          <li><strong>Including best practices:</strong> Adding platform-specific parameters and formatting</li>
          <li><strong>Providing multiple options:</strong> Generating prompts for all major AI platforms</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Supported AI Platforms</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-orange-50 p-5 rounded-lg border-2 border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Midjourney
            </h3>
            <p className="text-gray-700 mb-3">Optimized prompts with version parameters and style flags</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Includes --v 6 and --style raw</li>
              <li>• Optimized for logo generation</li>
              <li>• Vector-style formatting</li>
            </ul>
          </div>

          <div className="bg-red-50 p-5 rounded-lg border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🖼️</span>
              Leonardo.ai
            </h3>
            <p className="text-gray-700 mb-3">Professional logo prompts with branding focus</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Branding-optimized language</li>
              <li>• Scalable design emphasis</li>
              <li>• Modern aesthetics included</li>
            </ul>
          </div>

          <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
            <h3 className="font-bold text-pink-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              DALL-E
            </h3>
            <p className="text-gray-700 mb-3">Clear, descriptive prompts for OpenAI's DALL-E</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Natural language format</li>
              <li>• Detailed descriptions</li>
              <li>• Background specifications</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-5 rounded-lg border-2 border-amber-200">
            <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Stable Diffusion
            </h3>
            <p className="text-gray-700 mb-3">Tag-based prompts optimized for Stable Diffusion</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Comma-separated tags</li>
              <li>• Quality modifiers</li>
              <li>• Style keywords</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Logo Styles Available</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {logoStyles.map(style => (
            <div key={style} className="bg-white p-3 rounded-lg border border-orange-200 text-sm text-gray-700">
              • {style}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Why Use AI for Logo Generation?</h2>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-l-4 border-orange-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Cost-Effective:</strong> Generate multiple logo concepts quickly without hiring a designer</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Fast Iteration:</strong> Create and refine multiple logo variations in minutes</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Unlimited Variations:</strong> Generate as many concepts as you need</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Platform-Optimized:</strong> Get prompts tailored to your preferred AI tool</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Professional Results:</strong> Create logos suitable for branding and business use</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific:</strong> Provide detailed brand information and design preferences</li>
          <li><strong>Choose appropriate style:</strong> Match logo style to your brand personality</li>
          <li><strong>Select colors carefully:</strong> Color scheme greatly impacts logo perception</li>
          <li><strong>Test multiple platforms:</strong> Different AI tools may produce different results</li>
          <li><strong>Iterate and refine:</strong> Use generated prompts as starting points and refine based on results</li>
          <li><strong>Consider simplicity:</strong> Simple logos often work better than complex designs</li>
          <li><strong>Vector-ready:</strong> Specify vector style for scalability</li>
          <li><strong>Add negative prompts:</strong> In some platforms, specify what you don't want (e.g., "no text, no background")</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">What Makes a Great Logo Prompt?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3">✅ Essential Elements</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Brand name clearly stated</li>
              <li>• Specific style description</li>
              <li>• Color scheme defined</li>
              <li>• Industry context</li>
              <li>• Complexity level specified</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3">🎯 Best Practices</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Use platform-specific formatting</li>
              <li>• Include quality modifiers</li>
              <li>• Specify vector/scalable design</li>
              <li>• Add mood/aesthetic descriptors</li>
              <li>• Test and refine prompts</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">How to Use Generated Prompts</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Copy the prompt</strong> for your preferred AI platform</li>
          <li><strong>Open your AI image generator</strong> (Midjourney, Leonardo.ai, DALL-E, etc.)</li>
          <li><strong>Paste the prompt</strong> into the generation interface</li>
          <li><strong>Adjust if needed</strong> based on your specific requirements</li>
          <li><strong>Generate multiple variations</strong> to find the best result</li>
          <li><strong>Refine and iterate</strong> by modifying the prompt based on results</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Save successful prompts for future reference and create variations by tweaking specific elements like colors or style.
        </p>
      </section>
    </>
  );
}

export default AILogoPromptGenerator;

