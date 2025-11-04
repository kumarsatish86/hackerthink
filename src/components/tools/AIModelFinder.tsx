"use client";

import React, { useState } from 'react';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  type: 'open-source' | 'commercial' | 'both';
  category: string[];
  description: string;
  strengths: string[];
  useCases: string[];
  pricing: string;
  website?: string;
  popularity: number;
}

const models: AIModel[] = [
  {
    id: 'gpt-4',
    name: 'GPT-4 / GPT-4 Turbo',
    provider: 'OpenAI',
    type: 'commercial',
    category: ['text-generation', 'code', 'analysis', 'chat'],
    description: 'Most capable OpenAI model, excelling at complex reasoning, creative writing, and following nuanced instructions.',
    strengths: ['Advanced reasoning', 'Long context (128k tokens)', 'Multimodal capabilities', 'Code generation'],
    useCases: ['Complex analysis', 'Creative writing', 'Code assistance', 'Business applications'],
    pricing: 'Pay-per-use',
    website: 'https://openai.com',
    popularity: 10
  },
  {
    id: 'gpt-3.5',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    type: 'commercial',
    category: ['text-generation', 'code', 'chat'],
    description: 'Fast and cost-effective model for most text generation tasks.',
    strengths: ['Fast response', 'Cost-effective', 'Good for general tasks', 'API access'],
    useCases: ['General chat', 'Text generation', 'Simple code', 'Content creation'],
    pricing: 'Pay-per-use (cheaper than GPT-4)',
    website: 'https://openai.com',
    popularity: 9
  },
  {
    id: 'claude-3',
    name: 'Claude 3 (Opus, Sonnet, Haiku)',
    provider: 'Anthropic',
    type: 'commercial',
    category: ['text-generation', 'analysis', 'chat'],
    description: 'Excellent at following instructions, safety-focused, and strong at analysis tasks.',
    strengths: ['Instruction following', 'Safety focus', 'Long context (200k tokens)', 'Analysis'],
    useCases: ['Document analysis', 'Content writing', 'Ethical AI applications', 'Research'],
    pricing: 'Pay-per-use',
    website: 'https://anthropic.com',
    popularity: 9
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    type: 'commercial',
    category: ['text-generation', 'code', 'chat'],
    description: 'European AI model competing with GPT-4, strong at multilingual tasks.',
    strengths: ['Multilingual', 'Code generation', 'Competitive performance', 'European compliance'],
    useCases: ['Multilingual applications', 'Code generation', 'European projects', 'Business tools'],
    pricing: 'Pay-per-use',
    website: 'https://mistral.ai',
    popularity: 8
  },
  {
    id: 'llama-3',
    name: 'Llama 3',
    provider: 'Meta',
    type: 'open-source',
    category: ['text-generation', 'code', 'chat'],
    description: 'Open-source model with strong performance, free for commercial use.',
    strengths: ['Open-source', 'Free commercial use', 'Good performance', 'Customizable'],
    useCases: ['Self-hosted applications', 'Custom fine-tuning', 'Privacy-focused apps', 'Budget projects'],
    pricing: 'Free (self-hosted)',
    website: 'https://ai.meta.com',
    popularity: 9
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    type: 'commercial',
    category: ['text-generation', 'multimodal', 'chat'],
    description: 'Google\'s advanced multimodal model, strong at combining text and images.',
    strengths: ['Multimodal', 'Image understanding', 'Google integration', 'Free tier available'],
    useCases: ['Multimodal applications', 'Google Workspace integration', 'Image analysis', 'Content creation'],
    pricing: 'Free tier + Pay-per-use',
    website: 'https://gemini.google.com',
    popularity: 8
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    type: 'commercial',
    category: ['image-generation'],
    description: 'Advanced image generation model with excellent prompt understanding.',
    strengths: ['High quality images', 'Prompt understanding', 'Safety features', 'Photorealistic'],
    useCases: ['Marketing visuals', 'Product images', 'Creative projects', 'Social media'],
    pricing: 'Pay-per-image',
    website: 'https://openai.com',
    popularity: 9
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    type: 'commercial',
    category: ['image-generation'],
    description: 'Artistic image generation with distinctive aesthetic style.',
    strengths: ['Artistic style', 'High quality', 'Creative images', 'Community features'],
    useCases: ['Art creation', 'Design inspiration', 'Creative projects', 'Concept art'],
    pricing: 'Subscription',
    website: 'https://midjourney.com',
    popularity: 9
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    provider: 'Stability AI',
    type: 'open-source',
    category: ['image-generation'],
    description: 'Open-source image generation model, free to use and customize.',
    strengths: ['Open-source', 'Free', 'Customizable', 'Self-hostable'],
    useCases: ['Custom image generation', 'Privacy-focused apps', 'Budget projects', 'Fine-tuning'],
    pricing: 'Free (self-hosted)',
    website: 'https://stability.ai',
    popularity: 8
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    type: 'commercial',
    category: ['voice', 'text-to-speech'],
    description: 'Best-in-class text-to-speech with natural, human-like voices.',
    strengths: ['Natural voices', 'Emotion control', 'Multiple languages', 'Voice cloning'],
    useCases: ['Audiobooks', 'Voiceovers', 'Podcasts', 'Accessibility'],
    pricing: 'Subscription + Pay-per-use',
    website: 'https://elevenlabs.io',
    popularity: 8
  },
  {
    id: 'codex',
    name: 'GPT-4 / Codex for Code',
    provider: 'OpenAI',
    type: 'commercial',
    category: ['code'],
    description: 'Specialized code generation and assistance model.',
    strengths: ['Code generation', 'Code explanation', 'Debugging', 'Multiple languages'],
    useCases: ['Code assistance', 'Code generation', 'Documentation', 'Learning programming'],
    pricing: 'Pay-per-use',
    website: 'https://openai.com',
    popularity: 9
  },
  {
    id: 'claude-code',
    name: 'Claude for Code',
    provider: 'Anthropic',
    type: 'commercial',
    category: ['code'],
    description: 'Strong code generation and analysis with focus on safety.',
    strengths: ['Code generation', 'Code review', 'Documentation', 'Safe coding'],
    useCases: ['Code review', 'Code generation', 'Technical documentation', 'Refactoring'],
    pricing: 'Pay-per-use',
    website: 'https://anthropic.com',
    popularity: 8
  },
  {
    id: 'mistral-coder',
    name: 'Mistral Code',
    provider: 'Mistral AI',
    type: 'open-source',
    category: ['code'],
    description: 'Open-source code generation model.',
    strengths: ['Open-source', 'Code specialized', 'Free', 'Customizable'],
    useCases: ['Self-hosted coding tools', 'Custom code assistants', 'Privacy-focused development'],
    pricing: 'Free (self-hosted)',
    website: 'https://mistral.ai',
    popularity: 7
  },
  {
    id: 'gemini-code',
    name: 'Gemini for Code',
    provider: 'Google',
    type: 'commercial',
    category: ['code'],
    description: 'Google\'s code generation and assistance model.',
    strengths: ['Code generation', 'Google integration', 'Free tier', 'Multiple languages'],
    useCases: ['Code assistance', 'Google Workspace integration', 'Learning', 'Development'],
    pricing: 'Free tier + Pay-per-use',
    website: 'https://gemini.google.com',
    popularity: 7
  }
];

const taskCategories = [
  { id: 'text-generation', name: 'Text Generation', icon: '📝' },
  { id: 'image-generation', name: 'Image Generation', icon: '🎨' },
  { id: 'code', name: 'Code Generation', icon: '💻' },
  { id: 'voice', name: 'Voice / TTS', icon: '🎤' },
  { id: 'analysis', name: 'Analysis & Research', icon: '🔍' },
  { id: 'chat', name: 'Chat & Conversation', icon: '💬' },
  { id: 'multimodal', name: 'Multimodal', icon: '🖼️' }
];

export function AIModelFinder() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'open-source' | 'commercial'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  const filteredModels = models.filter(model => {
    // Category filter
    if (selectedCategory && !model.category.includes(selectedCategory)) {
      return false;
    }

    // Type filter
    if (selectedType !== 'all' && model.type !== selectedType) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query) ||
        model.strengths.some(s => s.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Sort by popularity (highest first)
  const sortedModels = [...filteredModels].sort((a, b) => b.popularity - a.popularity);

  const handleModelClick = (model: AIModel) => {
    setSelectedModel(model);
  };

  const handleClearSelection = () => {
    setSelectedModel(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#1E293B" strokeWidth="2" fill="none"/>
        </svg>
        AI Model Finder / Recommender
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Search */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-slate-700">
            Search Models
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model name, provider, or feature..."
            className="w-full p-3 border-2 border-slate-200 rounded-lg focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {/* Task Categories */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-slate-700">
            Select Task Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setSelectedCategory('')}
              className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === ''
                  ? 'bg-slate-600 text-white border-slate-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Tasks
            </button>
            {taskCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-slate-600 text-white border-slate-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-xs">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-slate-700">
            Model Type
          </label>
          <div className="flex gap-3">
            {(['all', 'open-source', 'commercial'] as const).map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedType === type
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type === 'all' ? 'All Types' : type === 'open-source' ? 'Open Source' : 'Commercial'}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Found <strong>{sortedModels.length}</strong> model{sortedModels.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Model Cards */}
      {selectedModel ? (
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedModel.type === 'open-source'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {selectedModel.type === 'open-source' ? 'Open Source' : 'Commercial'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900">{selectedModel.name}</h3>
              </div>
              <p className="text-slate-600">by {selectedModel.provider}</p>
            </div>
            <button
              onClick={handleClearSelection}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Back to List
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
              <p className="text-gray-700">{selectedModel.description}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Strengths</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {selectedModel.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Use Cases</h4>
              <div className="flex flex-wrap gap-2">
                {selectedModel.useCases.map((useCase, index) => (
                  <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Pricing</h4>
                <p className="text-gray-700">{selectedModel.pricing}</p>
              </div>
              {selectedModel.website && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Website</h4>
                  <a
                    href={selectedModel.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {selectedModel.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedModels.map(model => (
            <div
              key={model.id}
              onClick={() => handleModelClick(model)}
              className="bg-white rounded-xl shadow-md p-6 border-2 border-slate-200 hover:border-slate-400 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      model.type === 'open-source'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {model.type === 'open-source' ? 'Open' : 'Commercial'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{model.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600">{model.provider}</p>
                </div>
                <div className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs text-slate-600">{model.popularity}/10</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3 line-clamp-2">{model.description}</p>

              <div className="flex flex-wrap gap-1 mb-3">
                {model.category.slice(0, 3).map(cat => {
                  const categoryInfo = taskCategories.find(c => c.id === cat);
                  return (
                    <span key={cat} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                      {categoryInfo?.icon} {categoryInfo?.name || cat}
                    </span>
                  );
                })}
                {model.category.length > 3 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">
                    +{model.category.length - 3}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-500">
                {model.pricing}
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedModels.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 text-lg">No models found matching your criteria.</p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export function AIModelFinderInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">What is an AI Model Finder?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Model Finder</strong> is a tool that helps you discover and compare AI models based on your specific 
          task requirements. With the growing number of AI models available (GPT, Claude, Mistral, DALL-E, Midjourney, etc.), 
          it can be confusing to choose the right one. This tool recommends the best open-source or commercial models for 
          tasks like text generation, image creation, code assistance, voice synthesis, and more.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Model Finder helps you navigate the AI landscape by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Task-based filtering:</strong> Select your task type (text, image, code, voice, etc.)</li>
          <li><strong>Type filtering:</strong> Filter by open-source or commercial models</li>
          <li><strong>Search functionality:</strong> Search by model name, provider, or features</li>
          <li><strong>Detailed comparisons:</strong> View model strengths, use cases, and pricing</li>
          <li><strong>Popularity ranking:</strong> See which models are most popular and trusted</li>
          <li><strong>Provider information:</strong> Learn about each model's provider and website</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Supported Task Categories</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {taskCategories.map(category => (
            <div key={category.id} className="bg-white p-5 rounded-lg border-2 border-slate-200">
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-bold text-slate-800 mb-2">{category.name}</h3>
              <p className="text-sm text-gray-700">
                Find models specialized for {category.name.toLowerCase()} tasks
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Popular Models Overview</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">🏆 Commercial Models</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• <strong>GPT-4:</strong> Most capable, advanced reasoning</li>
              <li>• <strong>Claude 3:</strong> Safety-focused, excellent instruction following</li>
              <li>• <strong>Gemini Pro:</strong> Multimodal, Google integration</li>
              <li>• <strong>DALL-E 3:</strong> Best image generation quality</li>
              <li>• <strong>Midjourney:</strong> Artistic image generation</li>
            </ul>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-3">🔓 Open-Source Models</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• <strong>Llama 3:</strong> Meta's open-source model</li>
              <li>• <strong>Stable Diffusion:</strong> Open-source image generation</li>
              <li>• <strong>Mistral Code:</strong> Open-source code generation</li>
              <li>• <strong>Custom Models:</strong> Self-hostable and customizable</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Why Use an AI Model Finder?</h2>
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-lg border-l-4 border-slate-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Save Time:</strong> Quickly find the right model for your specific task</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Compare Options:</strong> See open-source vs commercial models side-by-side</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Understand Differences:</strong> Learn strengths and use cases of each model</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Make Informed Decisions:</strong> Choose based on pricing, features, and requirements</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Discover New Models:</strong> Find models you might not have known about</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Choosing the Right Model</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Consider your task:</strong> Different models excel at different tasks</li>
          <li><strong>Budget matters:</strong> Open-source models are free but require hosting</li>
          <li><strong>Privacy requirements:</strong> Self-hosted open-source models offer more privacy</li>
          <li><strong>Performance needs:</strong> Commercial models often offer better performance</li>
          <li><strong>Integration needs:</strong> Consider API availability and platform integration</li>
          <li><strong>Try multiple models:</strong> Test different models to see which works best for you</li>
          <li><strong>Check updates:</strong> AI models are constantly improving - check for latest versions</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Open-Source vs Commercial</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-3">✅ Open-Source Advantages</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Free to use</li>
              <li>• Fully customizable</li>
              <li>• Privacy-focused (self-hosted)</li>
              <li>• No usage limits</li>
              <li>• Community support</li>
              <li>• Requires technical setup</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">✅ Commercial Advantages</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Easy to use (API access)</li>
              <li>• High performance</li>
              <li>• Regular updates</li>
              <li>• Support and documentation</li>
              <li>• No infrastructure needed</li>
              <li>• Pay-per-use pricing</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default AIModelFinder;

