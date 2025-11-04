"use client";

import React, { useState } from 'react';

type ToolCategory = 'chat' | 'image' | 'code' | 'voice' | 'video';

interface AITool {
  id: string;
  name: string;
  fullName: string;
  category: ToolCategory;
  description: string;
  icon: string;
  pricing: {
    free: boolean;
    freeTier: string;
    paidStarting: string;
    pricingModel: string;
  };
  features: string[];
  pros: string[];
  cons: string[];
  limits: {
    context: string;
    rateLimit: string;
    fileSize?: string;
  };
  bestFor: string[];
  signupUrl: string;
  reviewUrl?: string;
  affiliate?: boolean;
}

const aiTools: Record<string, AITool> = {
  'chatgpt': {
    id: 'chatgpt',
    name: 'ChatGPT',
    fullName: 'ChatGPT (OpenAI)',
    category: 'chat',
    description: 'OpenAI\'s conversational AI assistant',
    icon: '🤖',
    pricing: {
      free: true,
      freeTier: 'GPT-3.5 access',
      paidStarting: '$20/month (GPT-4)',
      pricingModel: 'Subscription'
    },
    features: ['Multi-turn conversations', 'Code generation', 'Creative writing', 'Analysis', 'Web browsing (Pro)', 'Image generation (DALL-E)', 'File uploads'],
    pros: ['Most popular and widely used', 'Strong reasoning and coding abilities', 'Large knowledge base', 'Regular updates and improvements', 'Extensive plugin ecosystem', 'Good for general tasks'],
    cons: ['GPT-4 requires paid subscription', 'Can hallucinate facts', 'Rate limits on free tier', 'No real-time information without Plus', 'Can be verbose'],
    limits: {
      context: '128K tokens (GPT-4 Turbo)',
      rateLimit: '40 messages/3 hours (GPT-4)',
    },
    bestFor: ['General conversation', 'Coding assistance', 'Content creation', 'Research', 'Problem solving'],
    signupUrl: 'https://chat.openai.com',
    reviewUrl: '/reviews/chatgpt',
    affiliate: false
  },
  'claude': {
    id: 'claude',
    name: 'Claude',
    fullName: 'Claude (Anthropic)',
    category: 'chat',
    description: 'Anthropic\'s safe and helpful AI assistant',
    icon: '🧠',
    pricing: {
      free: true,
      freeTier: 'Claude 3 Haiku',
      paidStarting: '$20/month (Opus)',
      pricingModel: 'Subscription'
    },
    features: ['Long context windows', 'Code analysis', 'Document processing', 'Ethical AI focus', 'File uploads', 'API access'],
    pros: ['Excellent long context handling (200K tokens)', 'Strong ethical guidelines', 'Great at analysis and summarization', 'File upload support', 'Less likely to hallucinate', 'Good for technical writing'],
    cons: ['Less creative than ChatGPT', 'Smaller user base', 'Fewer integrations', 'Can be overly cautious', 'Less plugin ecosystem'],
    limits: {
      context: '200K tokens (Claude 3 Opus)',
      rateLimit: '50 messages/5 hours (Pro)',
    },
    bestFor: ['Document analysis', 'Long-form content', 'Ethical AI use', 'Technical writing', 'Research'],
    signupUrl: 'https://claude.ai',
    reviewUrl: '/reviews/claude',
    affiliate: false
  },
  'gemini': {
    id: 'gemini',
    name: 'Gemini',
    fullName: 'Gemini (Google)',
    category: 'chat',
    description: 'Google\'s multimodal AI assistant',
    icon: '💎',
    pricing: {
      free: true,
      freeTier: 'Gemini Pro',
      paidStarting: 'Free (Pro tier)',
      pricingModel: 'Freemium'
    },
    features: ['Multimodal (text, images, video)', 'Google integration', 'Real-time web search', 'Image generation', 'Code generation', 'Free access'],
    pros: ['Completely free to use', 'Excellent Google integration', 'Multimodal capabilities', 'Real-time information', 'Good coding support', 'No paywall'],
    cons: ['Less polished than competitors', 'Smaller community', 'Fewer advanced features', 'Less conversation memory', 'Can be inconsistent'],
    limits: {
      context: '32K tokens',
      rateLimit: '60 requests/minute',
    },
    bestFor: ['Free AI access', 'Google ecosystem users', 'Image understanding', 'Web research', 'Casual use'],
    signupUrl: 'https://gemini.google.com',
    reviewUrl: '/reviews/gemini',
    affiliate: false
  },
  'llama': {
    id: 'llama',
    name: 'Llama',
    fullName: 'Llama 3 (Meta)',
    category: 'chat',
    description: 'Meta\'s open-source AI model',
    icon: '🦙',
    pricing: {
      free: true,
      freeTier: 'Open source',
      paidStarting: 'Free (self-hosted)',
      pricingModel: 'Open Source'
    },
    features: ['Open source', 'Self-hostable', 'Commercial use allowed', 'API access', 'Fine-tuning support', 'Privacy-focused'],
    pros: ['Completely free and open', 'Full control and privacy', 'No usage restrictions', 'Can fine-tune', 'Commercial use', 'Strong performance'],
    cons: ['Requires technical setup', 'Hardware requirements', 'No managed service', 'Less polished UX', 'Limited support'],
    limits: {
      context: '128K tokens (Llama 3)',
      rateLimit: 'Self-managed',
    },
    bestFor: ['Developers', 'Privacy-conscious users', 'Custom deployments', 'Commercial projects', 'Fine-tuning'],
    signupUrl: 'https://llama.meta.com',
    reviewUrl: '/reviews/llama',
    affiliate: false
  },
  'midjourney': {
    id: 'midjourney',
    name: 'Midjourney',
    fullName: 'Midjourney',
    category: 'image',
    description: 'Premium AI image generator with artistic focus',
    icon: '🎨',
    pricing: {
      free: false,
      freeTier: 'Limited free trials',
      paidStarting: '$10/month',
      pricingModel: 'Subscription'
    },
    features: ['Artistic image generation', 'High quality outputs', 'Multiple aspect ratios', 'Style variations', 'Upscaling', 'Discord integration'],
    pros: ['Best artistic quality', 'Unique aesthetic style', 'Great for creative projects', 'Strong community', 'Consistent high quality', 'Regular updates'],
    cons: ['Requires Discord', 'Paid subscription only', 'No free tier', 'Less control over specifics', 'Slower generation', 'No API access'],
    limits: {
      context: 'N/A (Image generation)',
      rateLimit: 'Limited by subscription tier',
    },
    bestFor: ['Artistic projects', 'Creative professionals', 'Concept art', 'Marketing visuals', 'Social media'],
    signupUrl: 'https://midjourney.com',
    reviewUrl: '/reviews/midjourney',
    affiliate: true
  },
  'dalle': {
    id: 'dalle',
    name: 'DALL·E',
    fullName: 'DALL·E 3 (OpenAI)',
    category: 'image',
    description: 'OpenAI\'s photorealism-focused image generator',
    icon: '🖼️',
    pricing: {
      free: false,
      freeTier: '15 credits/month (ChatGPT Plus)',
      paidStarting: '$20/month (via ChatGPT Plus)',
      pricingModel: 'Subscription'
    },
    features: ['Photorealistic images', 'Text understanding', 'ChatGPT integration', 'Safety filters', 'Multiple sizes', 'API access'],
    pros: ['Excellent photorealism', 'Strong text understanding', 'Integrated with ChatGPT', 'Built-in safety', 'Consistent quality', 'Multiple resolutions'],
    cons: ['Requires ChatGPT Plus', 'Less artistic than Midjourney', 'Fewer style options', 'Safety filters can block requests', 'Limited generations'],
    limits: {
      context: 'Complex prompts',
      rateLimit: '15 credits/month (Plus)',
    },
    bestFor: ['Photorealistic images', 'Product mockups', 'Realistic scenes', 'Marketing materials', 'General use'],
    signupUrl: 'https://openai.com/dall-e-3',
    reviewUrl: '/reviews/dalle',
    affiliate: false
  },
  'stable-diffusion': {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    fullName: 'Stable Diffusion',
    category: 'image',
    description: 'Open-source AI image generator',
    icon: '🎭',
    pricing: {
      free: true,
      freeTier: 'Free (self-hosted)',
      paidStarting: 'Free',
      pricingModel: 'Open Source'
    },
    features: ['Open source', 'Self-hostable', 'Fine-tuning', 'ControlNet support', 'Multiple models', 'Commercial use'],
    pros: ['Completely free', 'Full control', 'Can run locally', 'No usage limits', 'Highly customizable', 'Active community'],
    cons: ['Requires setup', 'Hardware intensive', 'Quality varies', 'Less polished', 'Steeper learning curve'],
    limits: {
      context: 'Configurable',
      rateLimit: 'Self-managed',
    },
    bestFor: ['Developers', 'Hobbyists', 'Custom needs', 'Privacy', 'Experimentation'],
    signupUrl: 'https://stability.ai',
    reviewUrl: '/reviews/stable-diffusion',
    affiliate: false
  },
  'ideogram': {
    id: 'ideogram',
    name: 'Ideogram',
    fullName: 'Ideogram',
    category: 'image',
    description: 'Best text rendering in AI images',
    icon: '✍️',
    pricing: {
      free: true,
      freeTier: '25 prompts/day',
      paidStarting: '$8/month',
      pricingModel: 'Freemium'
    },
    features: ['Excellent text rendering', 'Logo generation', 'Typography', 'Multiple styles', 'Fast generation', 'Free tier'],
    pros: ['Best text in images', 'Great for logos', 'Free tier available', 'Fast generation', 'Good quality', 'Typography focus'],
    cons: ['Smaller community', 'Fewer features', 'Less artistic than Midjourney', 'Limited advanced controls'],
    limits: {
      context: 'N/A',
      rateLimit: '25/day (free)',
    },
    bestFor: ['Text-heavy images', 'Logo design', 'Typography', 'Marketing graphics', 'Brand assets'],
    signupUrl: 'https://ideogram.ai',
    reviewUrl: '/reviews/ideogram',
    affiliate: true
  }
};

export function AIComparisonMatrix() {
  const [tool1, setTool1] = useState<string>('chatgpt');
  const [tool2, setTool2] = useState<string>('claude');
  const [category, setCategory] = useState<ToolCategory | 'all'>('all');

  const getToolsByCategory = () => {
    if (category === 'all') {
      return Object.values(aiTools);
    }
    return Object.values(aiTools).filter(tool => tool.category === category);
  };

  const selectedTool1 = aiTools[tool1];
  const selectedTool2 = aiTools[tool2];
  const availableTools = getToolsByCategory();

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="2" fill="#9333EA"/>
          <path d="M8 8h8v8H8z" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        AI Comparison Matrix
      </h2>

      <p className="text-gray-600 mb-6">
        Compare AI tools side-by-side. Compare features, pricing, pros, cons, and limits to find the best AI tool 
        for your needs. Perfect for "X vs Y" comparisons.
      </p>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-purple-700">
          Filter by Category
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              category === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => setCategory('chat')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              category === 'chat' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            💬 Chat/Text
          </button>
          <button
            onClick={() => setCategory('image')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              category === 'image' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎨 Image
          </button>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block mb-4 font-medium text-purple-700">
            Select First Tool
          </label>
          <select
            value={tool1}
            onChange={(e) => setTool1(e.target.value)}
            className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          >
            {availableTools.map(tool => (
              <option key={tool.id} value={tool.id}>
                {tool.icon} {tool.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <label className="block mb-4 font-medium text-purple-700">
            Select Second Tool
          </label>
          <select
            value={tool2}
            onChange={(e) => setTool2(e.target.value)}
            className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          >
            {availableTools.filter(t => t.id !== tool1).map(tool => (
              <option key={tool.id} value={tool.id}>
                {tool.icon} {tool.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Table */}
      {selectedTool1 && selectedTool2 && (
        <div className="space-y-6">
          {/* Header Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center border-2 border-purple-200">
              <div className="text-4xl mb-2">{selectedTool1.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTool1.fullName}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedTool1.description}</p>
              <div className="flex gap-2 justify-center">
                <a
                  href={selectedTool1.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Try Now →
                </a>
                {selectedTool1.reviewUrl && (
                  <a
                    href={selectedTool1.reviewUrl}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-purple-700 border-2 border-purple-600 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Review
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 text-center border-2 border-purple-200">
              <div className="text-4xl mb-2">{selectedTool2.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedTool2.fullName}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedTool2.description}</p>
              <div className="flex gap-2 justify-center">
                <a
                  href={selectedTool2.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Try Now →
                </a>
                {selectedTool2.reviewUrl && (
                  <a
                    href={selectedTool2.reviewUrl}
                    className="px-4 py-2 bg-white hover:bg-gray-50 text-purple-700 border-2 border-purple-600 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Review
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">💰 Pricing Comparison</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700 mb-2">{selectedTool1.name}</div>
                <div className="text-sm space-y-1">
                  <div>Free Tier: {selectedTool1.pricing.freeTier}</div>
                  <div>Paid Starting: {selectedTool1.pricing.paidStarting}</div>
                  <div>Model: {selectedTool1.pricing.pricingModel}</div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">{selectedTool2.name}</div>
                <div className="text-sm space-y-1">
                  <div>Free Tier: {selectedTool2.pricing.freeTier}</div>
                  <div>Paid Starting: {selectedTool2.pricing.paidStarting}</div>
                  <div>Model: {selectedTool2.pricing.pricingModel}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">⭐ Features</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-purple-700 mb-2">{selectedTool1.name}</div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                  {selectedTool1.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-purple-700 mb-2">{selectedTool2.name}</div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
                  {selectedTool2.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pros Comparison */}
          <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-bold mb-4 text-green-900">✅ Pros</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-green-800 mb-2">{selectedTool1.name}</div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-green-700">
                  {selectedTool1.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-green-800 mb-2">{selectedTool2.name}</div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-green-700">
                  {selectedTool2.pros.map((pro, index) => (
                    <li key={index}>{pro}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cons Comparison */}
          <div className="bg-red-50 rounded-lg shadow p-6 border-l-4 border-red-500">
            <h3 className="text-lg font-bold mb-4 text-red-900">❌ Cons</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-red-800 mb-2">{selectedTool1.name}</div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-red-700">
                  {selectedTool1.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold text-red-800 mb-2">{selectedTool2.name}</div>
                <ul className="list-disc pl-6 space-y-1 text-sm text-red-700">
                  {selectedTool2.cons.map((con, index) => (
                    <li key={index}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Limits Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">📊 Limits & Constraints</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-gray-700 mb-2">{selectedTool1.name}</div>
                <div className="text-sm space-y-2 text-gray-700">
                  <div><strong>Context:</strong> {selectedTool1.limits.context}</div>
                  <div><strong>Rate Limit:</strong> {selectedTool1.limits.rateLimit}</div>
                  {selectedTool1.limits.fileSize && (
                    <div><strong>File Size:</strong> {selectedTool1.limits.fileSize}</div>
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">{selectedTool2.name}</div>
                <div className="text-sm space-y-2 text-gray-700">
                  <div><strong>Context:</strong> {selectedTool2.limits.context}</div>
                  <div><strong>Rate Limit:</strong> {selectedTool2.limits.rateLimit}</div>
                  {selectedTool2.limits.fileSize && (
                    <div><strong>File Size:</strong> {selectedTool2.limits.fileSize}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Best For Comparison */}
          <div className="bg-blue-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold mb-4 text-blue-900">🎯 Best For</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-semibold text-blue-800 mb-2">{selectedTool1.name}</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTool1.bestFor.map((use, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-blue-800 mb-2">{selectedTool2.name}</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTool2.bestFor.map((use, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {use}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIComparisonMatrixInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Why Compare AI Tools?</h2>
        <p className="text-gray-700 text-lg">
          With so many AI tools available, choosing the right one can be overwhelming. Our comparison matrix helps 
          you make informed decisions by showing side-by-side comparisons of features, pricing, strengths, and 
          weaknesses. Find the perfect AI tool for your specific needs.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">What We Compare</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">💰 Pricing</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Free tier availability</li>
              <li>• Paid pricing models</li>
              <li>• Subscription vs one-time</li>
              <li>• Value comparison</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">⭐ Features</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Core capabilities</li>
              <li>• Unique features</li>
              <li>• Integration options</li>
              <li>• API availability</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">✅ Pros & ❌ Cons</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Strengths of each tool</li>
              <li>• Limitations and drawbacks</li>
              <li>• Real-world usage insights</li>
              <li>• Community feedback</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">📊 Limits</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Context window sizes</li>
              <li>• Rate limits</li>
              <li>• Usage restrictions</li>
              <li>• File size limits</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Popular Comparisons</h2>
        <p className="text-gray-700 text-lg mb-3">
          Some of the most searched AI tool comparisons include:
        </p>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="bg-white border rounded-lg p-3">
            <strong className="text-purple-700">💬 Chat AI:</strong> ChatGPT vs Claude vs Gemini
          </div>
          <div className="bg-white border rounded-lg p-3">
            <strong className="text-purple-700">🎨 Image AI:</strong> Midjourney vs DALL-E vs Stable Diffusion
          </div>
          <div className="bg-white border rounded-lg p-3">
            <strong className="text-purple-700">🆓 Free Options:</strong> Gemini vs Llama vs ChatGPT Free
          </div>
          <div className="bg-white border rounded-lg p-3">
            <strong className="text-purple-700">💼 Enterprise:</strong> ChatGPT Enterprise vs Claude Pro
          </div>
        </div>
      </section>

      <section className="mb-10 bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-purple-800">How to Use This Tool</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li><strong>Filter by category</strong> - Narrow down to Chat, Image, or All Tools</li>
          <li><strong>Select two tools</strong> - Choose the AI tools you want to compare</li>
          <li><strong>Review comparison</strong> - Check pricing, features, pros, cons, and limits</li>
          <li><strong>Click "Try Now"</strong> - Sign up for the tool that fits your needs</li>
          <li><strong>Read reviews</strong> - Get detailed insights from our expert reviews</li>
        </ol>
      </section>
    </>
  );
}

export default AIComparisonMatrix;
