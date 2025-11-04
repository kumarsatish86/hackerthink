"use client";

import React, { useState } from 'react';

interface AIStartupIdea {
  title: string;
  elevatorPitch: string;
  targetMarket: string;
  keyFeatures: string[];
  revenueModel: string;
  competitiveAdvantage: string;
}

const industryTemplates: Record<string, any> = {
  'healthcare': {
    keywords: ['telemedicine', 'patient care', 'health monitoring', 'diagnostic', 'health records', 'medical AI'],
    marketSize: 'Multi-billion dollar healthcare market',
    trends: ['Remote healthcare', 'AI diagnostics', 'Personalized medicine', 'Health analytics']
  },
  'education': {
    keywords: ['online learning', 'personalized education', 'student analytics', 'adaptive learning', 'tutoring'],
    marketSize: 'Growing EdTech market',
    trends: ['Personalized learning', 'AI tutoring', 'Skill assessment', 'Virtual classrooms']
  },
  'finance': {
    keywords: ['fintech', 'financial planning', 'investment', 'fraud detection', 'banking', 'payment'],
    marketSize: 'Massive financial services market',
    trends: ['AI-powered investing', 'Fraud prevention', 'Personal finance', 'Cryptocurrency']
  },
  'ecommerce': {
    keywords: ['online retail', 'shopping', 'product recommendations', 'inventory', 'supply chain'],
    marketSize: 'Expanding e-commerce market',
    trends: ['AI recommendations', 'Inventory optimization', 'Customer service', 'Visual search']
  },
  'real-estate': {
    keywords: ['property', 'real estate', 'home buying', 'property management', 'valuation'],
    marketSize: 'Large real estate market',
    trends: ['Property valuation AI', 'Virtual tours', 'Market analysis', 'Property management']
  },
  'transportation': {
    keywords: ['logistics', 'delivery', 'route optimization', 'fleet management', 'autonomous'],
    marketSize: 'Huge logistics market',
    trends: ['Route optimization', 'Autonomous vehicles', 'Delivery drones', 'Fleet management']
  },
  'energy': {
    keywords: ['renewable energy', 'energy management', 'solar', 'wind', 'smart grid'],
    marketSize: 'Growing energy sector',
    trends: ['Renewable energy', 'Smart grids', 'Energy optimization', 'Carbon tracking']
  },
  'agriculture': {
    keywords: ['farming', 'crop monitoring', 'precision agriculture', 'livestock', 'supply chain'],
    marketSize: 'Critical agricultural sector',
    trends: ['Precision farming', 'Crop monitoring', 'Livestock management', 'Supply optimization']
  }
};

function generateStartupIdeas(topic: string, ideaType: string, count: number = 3): AIStartupIdea[] {
  const ideas: AIStartupIdea[] = [];
  const topicLower = topic.toLowerCase();
  
  // Determine industry context
  let industry = 'general';
  for (const [key, value] of Object.entries(industryTemplates)) {
    if (topicLower.includes(key) || value.keywords.some((k: string) => topicLower.includes(k))) {
      industry = key;
      break;
    }
  }
  
  const industryData = industryTemplates[industry] || industryTemplates['healthcare'];
  
  // Generate multiple ideas
  for (let i = 0; i < count; i++) {
    const ideaNumber = i + 1;
    
    // Generate different idea variations
    const ideaVariations = [
      {
        title: `AI-Powered ${topic} Assistant`,
        focus: 'automation',
        model: 'SaaS subscription'
      },
      {
        title: `${topic} Intelligence Platform`,
        focus: 'analytics',
        model: 'Freemium'
      },
      {
        title: `Smart ${topic} Solution`,
        focus: 'personalization',
        model: 'Pay-per-use'
      }
    ];
    
    const variation = ideaVariations[i % ideaVariations.length];
    
    const idea: AIStartupIdea = {
      title: `${variation.title}${ideaNumber > 1 ? ` v${ideaNumber}` : ''}`,
      elevatorPitch: `An AI-powered ${ideaType.toLowerCase()} that leverages machine learning to revolutionize how ${topic} professionals work. Our platform uses advanced algorithms to ${variation.focus === 'automation' ? 'automate repetitive tasks and streamline workflows' : variation.focus === 'analytics' ? 'provide deep insights and predictive analytics' : 'deliver personalized experiences tailored to each user'}, helping businesses save time and increase productivity by up to 40%.`,
      targetMarket: `${topic} professionals, ${industry === 'healthcare' ? 'healthcare providers' : industry === 'education' ? 'educational institutions' : industry === 'finance' ? 'financial advisors' : 'businesses'} looking to leverage AI technology`,
      keyFeatures: [
        `AI-powered ${variation.focus} engine`,
        `Real-time analytics and insights`,
        `Intuitive user interface`,
        `Integration with popular ${topic} tools`,
        `Scalable cloud infrastructure`
      ],
      revenueModel: variation.model,
      competitiveAdvantage: `Our proprietary AI algorithms are specifically trained on ${topic} data, providing more accurate and relevant results than generic AI solutions. We combine deep domain expertise with cutting-edge technology.`
    };
    
    ideas.push(idea);
  }
  
  return ideas;
}

export function AIIdeaGenerator() {
  const [topic, setTopic] = useState('');
  const [ideaType, setIdeaType] = useState('Startup');
  const [generatedIdeas, setGeneratedIdeas] = useState<AIStartupIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideaCount, setIdeaCount] = useState(3);

  const handleGenerate = () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation (in real app, this would call an API)
    setTimeout(() => {
      const ideas = generateStartupIdeas(topic, ideaType, ideaCount);
      setGeneratedIdeas(ideas);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopyIdea = (idea: AIStartupIdea) => {
    const ideaText = `
${idea.title}

Elevator Pitch:
${idea.elevatorPitch}

Target Market:
${idea.targetMarket}

Key Features:
${idea.keyFeatures.map(f => `• ${f}`).join('\n')}

Revenue Model:
${idea.revenueModel}

Competitive Advantage:
${idea.competitiveAdvantage}
    `.trim();
    
    navigator.clipboard.writeText(ideaText);
    alert('Idea copied to clipboard!');
  };

  const handleCopyAll = () => {
    const allIdeas = generatedIdeas.map((idea, index) => `
${index + 1}. ${idea.title}

Elevator Pitch:
${idea.elevatorPitch}

Target Market:
${idea.targetMarket}

Key Features:
${idea.keyFeatures.map(f => `• ${f}`).join('\n')}

Revenue Model:
${idea.revenueModel}

Competitive Advantage:
${idea.competitiveAdvantage}
---
    `).join('\n');
    
    navigator.clipboard.writeText(allIdeas);
    alert('All ideas copied to clipboard!');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-indigo-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4F46E5"/>
          <path d="M2 17L12 22L22 17" stroke="#4F46E5" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#4F46E5" strokeWidth="2" fill="none"/>
        </svg>
        AI Idea Generator
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-indigo-700">
              Topic/Industry <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., healthcare, education, finance, e-commerce"
              className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-gray-800"
            />
            <p className="text-sm text-gray-600 mt-2">
              Enter the industry or topic you want AI startup ideas for
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-indigo-700">
                Idea Type
              </label>
              <select
                value={ideaType}
                onChange={(e) => setIdeaType(e.target.value)}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="Startup">Startup</option>
                <option value="App">App</option>
                <option value="Project">Project</option>
                <option value="SaaS">SaaS Product</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-indigo-700">
                Number of Ideas
              </label>
              <select
                value={ideaCount}
                onChange={(e) => setIdeaCount(Number(e.target.value))}
                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="1">1 Idea</option>
                <option value="3">3 Ideas</option>
                <option value="5">5 Ideas</option>
                <option value="10">10 Ideas</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
              topic.trim() && !isGenerating
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Ideas...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                Generate AI {ideaType} Ideas
              </span>
            )}
          </button>
        </div>
      </div>

      {generatedIdeas.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-indigo-800">
              Generated {ideaType} Ideas ({generatedIdeas.length})
            </h3>
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy All
            </button>
          </div>

          {generatedIdeas.map((idea, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                      Idea #{index + 1}
                    </span>
                    <h4 className="text-2xl font-bold text-gray-900">{idea.title}</h4>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyIdea(idea)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                    </svg>
                    Elevator Pitch
                  </h5>
                  <p className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg">
                    {idea.elevatorPitch}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                      </svg>
                      Target Market
                    </h5>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg">
                      {idea.targetMarket}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="2" x2="12" y2="22"/>
                        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                      </svg>
                      Revenue Model
                    </h5>
                    <p className="text-gray-700 bg-purple-50 p-3 rounded-lg font-semibold">
                      {idea.revenueModel}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Key Features
                  </h5>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {idea.keyFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700 bg-pink-50 p-3 rounded-lg">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    Competitive Advantage
                  </h5>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    {idea.competitiveAdvantage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AIIdeaGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">What is an AI Idea Generator?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Idea Generator</strong> is a powerful tool that helps entrepreneurs, innovators, and creators discover 
          unique startup ideas, app concepts, and project opportunities. By simply entering a topic or industry, our AI 
          analyzes market trends, identifies opportunities, and generates comprehensive startup ideas complete with elevator 
          pitches, target markets, revenue models, and competitive advantages.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Idea Generator uses advanced algorithms to create startup ideas by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Analyzing your topic:</strong> Understanding the industry and market context</li>
          <li><strong>Identifying opportunities:</strong> Finding gaps and unmet needs</li>
          <li><strong>Generating comprehensive ideas:</strong> Creating complete startup concepts with all essential elements</li>
          <li><strong>Providing actionable insights:</strong> Including elevator pitches, target markets, and revenue models</li>
          <li><strong>Highlighting competitive advantages:</strong> Explaining what makes each idea unique</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Supported Industries</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="font-bold text-indigo-800 mb-2">🏥 Healthcare</h3>
            <p className="text-sm text-gray-700">Telemedicine, diagnostics, health monitoring</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2">🎓 Education</h3>
            <p className="text-sm text-gray-700">Online learning, personalized education, tutoring</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
            <h3 className="font-bold text-pink-800 mb-2">💰 Finance</h3>
            <p className="text-sm text-gray-700">Fintech, investing, fraud detection</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-2">🛒 E-commerce</h3>
            <p className="text-sm text-gray-700">Retail, recommendations, supply chain</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-bold text-green-800 mb-2">🏠 Real Estate</h3>
            <p className="text-sm text-gray-700">Property management, valuation, virtual tours</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2">🚚 Transportation</h3>
            <p className="text-sm text-gray-700">Logistics, route optimization, delivery</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-bold text-orange-800 mb-2">⚡ Energy</h3>
            <p className="text-sm text-gray-700">Renewable energy, smart grids, optimization</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <h3 className="font-bold text-teal-800 mb-2">🌾 Agriculture</h3>
            <p className="text-sm text-gray-700">Precision farming, crop monitoring</p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Why Use AI for Idea Generation?</h2>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-l-4 border-indigo-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Speed:</strong> Generate multiple ideas in seconds instead of hours of brainstorming</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Market Insights:</strong> AI analyzes current trends and market opportunities</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Comprehensive Concepts:</strong> Each idea includes pitch, market, features, and revenue model</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Unbiased Exploration:</strong> Discover ideas you might not have considered</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Actionable Output:</strong> Get ready-to-use ideas with all essential business elements</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific:</strong> Enter detailed topics like "healthcare telemedicine" instead of just "healthcare"</li>
          <li><strong>Explore multiple ideas:</strong> Generate 5-10 ideas to find the best opportunities</li>
          <li><strong>Combine ideas:</strong> Merge concepts from different generated ideas</li>
          <li><strong>Validate market demand:</strong> Research if there's actual demand for your idea</li>
          <li><strong>Refine and iterate:</strong> Use generated ideas as starting points for further development</li>
          <li><strong>Consider your expertise:</strong> Choose ideas that align with your skills and interests</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">What Makes a Great Startup Idea?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-800 mb-3">✅ Essential Elements</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Solves a real problem</li>
              <li>• Clear target market</li>
              <li>• Viable revenue model</li>
              <li>• Competitive advantage</li>
              <li>• Scalable business model</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">🚀 Success Factors</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Addresses market gap</li>
              <li>• Uses AI/technology advantage</li>
              <li>• Strong differentiation</li>
              <li>• Clear value proposition</li>
              <li>• Feasible MVP development</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default AIIdeaGenerator;

