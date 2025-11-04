"use client";

import React, { useState } from 'react';

type StylePreset = {
  id: string;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  promptStructure: string;
};

const stylePresets: StylePreset[] = [
  {
    id: 'anime',
    name: 'Anime',
    icon: '🎨',
    description: 'Japanese animation style',
    keywords: ['anime style', 'manga art', 'cell shading', 'vibrant colors'],
    promptStructure: 'anime style, manga art, vibrant colors, cel shading, detailed character design, professional illustration, high quality, 4K'
  },
  {
    id: 'pixar',
    name: 'Pixar Style',
    icon: '🎬',
    description: '3D animated film style',
    keywords: ['3D animation', 'Pixar style', 'smooth textures', 'cute characters'],
    promptStructure: 'Pixar animation style, 3D rendered, smooth textures, professional lighting, vibrant colors, cinematic composition, high quality 3D modeling'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    icon: '🖌️',
    description: 'Soft watercolor painting',
    keywords: ['watercolor painting', 'soft gradients', 'organic flow', 'artistic'],
    promptStructure: 'watercolor painting, soft gradients, organic flow, artistic brushstrokes, beautiful color blending, professional art, high quality'
  },
  {
    id: 'dark-cinematic',
    name: 'Dark Cinematic',
    icon: '🎭',
    description: 'Moody, cinematic lighting',
    keywords: ['dark atmosphere', 'cinematic lighting', 'dramatic shadows', 'moody'],
    promptStructure: 'dark cinematic style, moody lighting, dramatic shadows, cinematic composition, professional photography, film noir atmosphere, high contrast, 8K'
  },
  {
    id: 'minimalist',
    name: 'Minimalist Flat',
    icon: '📐',
    description: 'Clean, flat design',
    keywords: ['minimalist', 'flat design', 'clean lines', 'simple colors'],
    promptStructure: 'minimalist flat design, clean lines, simple color palette, modern illustration, vector art style, professional graphic design, high quality'
  },
  {
    id: 'isometric',
    name: 'Isometric 3D',
    icon: '🔲',
    description: 'Isometric 3D illustration',
    keywords: ['isometric', '3D illustration', 'geometric', 'technical'],
    promptStructure: 'isometric 3D style, geometric illustration, technical drawing, professional 3D rendering, clean design, high quality'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    icon: '🌆',
    description: 'Neon-filled futuristic',
    keywords: ['cyberpunk', 'neon lights', 'futuristic', 'high tech'],
    promptStructure: 'cyberpunk style, neon lights, futuristic atmosphere, high tech elements, cinematic lighting, vibrant colors, detailed, 4K'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    icon: '📷',
    description: 'Retro, nostalgic feel',
    keywords: ['vintage', 'retro', 'nostalgic', 'classic'],
    promptStructure: 'vintage style, retro aesthetic, nostalgic atmosphere, classic photography, aged textures, high quality, professional'
  },
  {
    id: 'realistic',
    name: 'Photorealistic',
    icon: '📸',
    description: 'Ultra-realistic photography',
    keywords: ['photorealistic', '4K', 'professional photography', 'hyperdetailed'],
    promptStructure: 'photorealistic, ultra detailed, 4K quality, professional photography, perfect composition, sharp focus, high resolution'
  },
  {
    id: 'concept-art',
    name: 'Concept Art',
    icon: '🎨',
    description: 'Game/Film concept art',
    keywords: ['concept art', 'environment design', 'digital painting', 'professional'],
    promptStructure: 'concept art style, digital painting, professional illustration, detailed environment design, cinematic composition, high quality artwork'
  },
  {
    id: 'sketch',
    name: 'Pencil Sketch',
    icon: '✏️',
    description: 'Hand-drawn sketch style',
    keywords: ['pencil sketch', 'hand drawn', 'detailed lines', 'artistic'],
    promptStructure: 'pencil sketch style, hand drawn, detailed line work, professional art, high quality drawing, realistic shading'
  },
  {
    id: 'oils',
    name: 'Oil Painting',
    icon: '🖼️',
    description: 'Classical oil painting',
    keywords: ['oil painting', 'classical art', 'rich textures', 'masterpiece'],
    promptStructure: 'oil painting style, classical art, rich textures, professional masterpiece, detailed brushstrokes, museum quality, high resolution'
  },
  {
    id: 'cartoon',
    name: 'Cartoon',
    icon: '📺',
    description: 'Classic cartoon style',
    keywords: ['cartoon', 'animated', 'fun', 'colorful'],
    promptStructure: 'cartoon style, animated character design, fun colorful illustration, professional animation, high quality, 4K'
  },
  {
    id: 'holographic',
    name: 'Holographic',
    icon: '💎',
    description: 'Futuristic hologram effect',
    keywords: ['holographic', 'neon', 'translucent', 'sci-fi'],
    promptStructure: 'holographic style, translucent neon, sci-fi effect, futuristic design, glowing elements, cyber aesthetic, high quality'
  },
  {
    id: 'chibi',
    name: 'Chibi',
    icon: '😊',
    description: 'Super cute, small proportions',
    keywords: ['chibi', 'cute', 'kawaii', 'adorable'],
    promptStructure: 'chibi style, super cute, kawaii character design, adorable proportions, vibrant colors, professional illustration, high quality'
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    icon: '⚙️',
    description: 'Victorian mechanical style',
    keywords: ['steampunk', 'mechanical', 'brass', 'Victorian'],
    promptStructure: 'steampunk style, mechanical elements, brass and copper details, Victorian aesthetic, industrial design, detailed, professional art'
  },
  {
    id: 'lowpoly',
    name: 'Low Poly',
    icon: '🔺',
    description: 'Geometric polygon style',
    keywords: ['low poly', 'geometric', 'polygons', 'abstract'],
    promptStructure: 'low poly 3D style, geometric shapes, polygon art, abstract design, professional 3D modeling, clean render, high quality'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    icon: '🌸',
    description: 'Soft, pastel colors',
    keywords: ['pastel', 'soft colors', 'gentle', 'dreamy'],
    promptStructure: 'pastel style, soft gentle colors, dreamy atmosphere, delicate illustration, professional art, high quality'
  },
  {
    id: 'grunge',
    name: 'Grunge',
    icon: '🎸',
    description: 'Worn, distressed texture',
    keywords: ['grunge', 'distressed', 'textured', 'edgy'],
    promptStructure: 'grunge style, distressed textures, worn look, edgy design, gritty atmosphere, professional illustration, high quality'
  },
  {
    id: 'paper-cut',
    name: 'Paper Cut',
    icon: '✂️',
    description: 'Layered paper art',
    keywords: ['paper cut', 'layered', 'craft', 'dimension'],
    promptStructure: 'paper cut art style, layered paper design, dimensional craft style, professional illustration, high quality art'
  },
  {
    id: 'glitch',
    name: 'Glitch Art',
    icon: '📱',
    description: 'Digital glitch effects',
    keywords: ['glitch', 'digital', 'error', 'tech'],
    promptStructure: 'glitch art style, digital error effects, tech aesthetic, digital art, professional design, high quality'
  }
];

export function AIImagePromptStyler() {
  const [userInput, setUserInput] = useState<string>('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [showCopied, setShowCopied] = useState<boolean>(false);

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleGenerate = () => {
    if (!userInput.trim()) return;

    let prompt = userInput;

    // Add selected styles
    if (selectedStyles.length > 0) {
      const styleDescriptions = selectedStyles.map(id => {
        const style = stylePresets.find(s => s.id === id);
        return style?.promptStructure;
      }).filter(Boolean).join(', ');

      prompt += `, ${styleDescriptions}`;
    }

    // Add additional details
    if (additionalDetails.trim()) {
      prompt += `, ${additionalDetails}`;
    }

    // Add quality suffix
    prompt += ' --ar 16:9 --v 6';

    setGeneratedPrompt(prompt);
  };

  const handleCopy = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-purple-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#9333EA"/>
          <path d="M7 8L12 13L17 8" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        AI Image Prompt Styler
      </h2>

      <p className="text-gray-600 mb-6">
        Create perfect prompts for Midjourney, Stable Diffusion, Ideogram, and other AI image generators. 
        Mix styles and get polished, ready-to-use prompts.
      </p>

      {/* User Input */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-purple-700">
          Describe what you want to generate *
        </label>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="e.g., cyberpunk hacker girl, mountain sunset, minimalist logo design"
          className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
        />
      </div>

      {/* Style Presets */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-purple-700">
          Select Style Presets (Optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {stylePresets.map(preset => (
            <button
              key={preset.id}
              onClick={() => toggleStyle(preset.id)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedStyles.includes(preset.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{preset.icon}</span>
                <span className="font-semibold text-sm">{preset.name}</span>
              </div>
              <p className="text-xs text-gray-600">{preset.description}</p>
            </button>
          ))}
        </div>
        {selectedStyles.length > 0 && (
          <div className="mt-4 text-sm text-purple-700">
            ✓ {selectedStyles.length} style(s) selected
          </div>
        )}
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-purple-700">
          Additional Details (Optional)
        </label>
        <textarea
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          placeholder="e.g., dramatic lighting, high quality, professional photography, cinematic composition"
          className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-y"
          rows={3}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!userInput.trim()}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors mb-6 ${
          userInput.trim()
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Generate Perfect Prompt
      </button>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <div className="bg-purple-800 text-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-100">Your Generated Prompt</h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-sm transition-colors"
            >
              {showCopied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
          </div>
          <div className="bg-purple-900 rounded p-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            <strong>💡 Pro Tip:</strong> Copy this prompt and use it in Midjourney, Stable Diffusion, Ideogram, DALL-E, or any AI image generator!
          </div>
        </div>
      )}

      {/* CTA Section */}
      {generatedPrompt && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            🎨 Want to Generate This Image Online?
          </h3>
          <p className="text-blue-800 mb-4">
            Check out our list of <strong>FREE AI image generators</strong> (no signup required) to create your image right now!
          </p>
          <div className="flex gap-3">
            <a 
              href="https://ainews.com/tools/free-ai-image-generators"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              View FREE AI Image Generators →
            </a>
            <a 
              href="https://ainews.com/compare/midjourney-vs-dalle-vs-stable-diffusion"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-semibold transition-colors"
            >
              Compare AI Tools →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIImagePromptStylerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">What is AI Image Prompt Styling?</h2>
        <p className="text-gray-700 text-lg">
          AI Image Prompt Styling is the art of crafting perfect prompts for AI image generators like <strong>Midjourney</strong>, <strong>Stable Diffusion</strong>, <strong>Ideogram</strong>, and <strong>DALL-E</strong>. The quality and style of your generated images depend heavily on how you structure your prompts.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-3">
          This tool helps you create professional image prompts by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>1. Describe</strong> - Tell us what you want to generate</li>
          <li><strong>2. Style</strong> - Select from 20+ style presets (anime, cinematic, 3D, etc.)</li>
          <li><strong>3. Refine</strong> - Add additional details for lighting, quality, composition</li>
          <li><strong>4. Generate</strong> - Get a polished, ready-to-use prompt</li>
          <li><strong>5. Copy</strong> - Paste into your AI image generator of choice</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Available Styles (20 Presets)</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎨 Traditional Art</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Watercolor</li>
              <li>• Oil Painting</li>
              <li>• Pencil Sketch</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎬 Modern Styles</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Anime</li>
              <li>• Pixar 3D</li>
              <li>• Photorealistic</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🌆 Cinematic</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Dark Cinematic</li>
              <li>• Cyberpunk</li>
              <li>• Holographic</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">💼 Design Styles</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Minimalist Flat</li>
              <li>• Isometric 3D</li>
              <li>• Low Poly</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific</strong> about what you want to generate</li>
          <li><strong>Mix styles</strong> - Select multiple presets for unique combinations</li>
          <li><strong>Add details</strong> - Specify lighting, mood, composition, quality settings</li>
          <li><strong>Start simple</strong> - Begin with one style, then add more if needed</li>
          <li><strong>Iterate</strong> - Refine your prompt based on generated results</li>
          <li><strong>Try different models</strong> - Midjourney excels at artistic styles, DALL-E at photorealism</li>
        </ul>
      </section>

      <section className="mb-10 bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Why Prompt Engineering Matters</h2>
        <p className="text-gray-700 text-lg mb-3">
          The same concept can look drastically different based on your prompt structure. A well-crafted prompt with style presets produces:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Higher quality, more consistent outputs</li>
          <li>Better adherence to desired artistic styles</li>
          <li>More predictable and controllable results</li>
          <li>Professional-looking images suitable for commercial use</li>
        </ul>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Popular Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">💼 Business</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Logo design concepts</li>
              <li>• Marketing visuals</li>
              <li>• Product mockups</li>
              <li>• Social media graphics</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">🎨 Creative</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Character designs</li>
              <li>• Concept art</li>
              <li>• Book illustrations</li>
              <li>• Art projects</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">📚 Education</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Course materials</li>
              <li>• Presentation graphics</li>
              <li>• Study aids</li>
              <li>• Infographics</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">🎮 Gaming</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Game assets</li>
              <li>• Character art</li>
              <li>• Environment concepts</li>
              <li>• UI elements</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default AIImagePromptStyler;

