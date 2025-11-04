"use client";

import React, { useState, useEffect } from 'react';

interface Model {
  name: string;
  displayName: string;
  inputCost: number; // per 1M tokens
  outputCost: number; // per 1M tokens
  description: string;
}

const models: Model[] = [
  {
    name: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    inputCost: 10.00,
    outputCost: 30.00,
    description: 'Most capable OpenAI model'
  },
  {
    name: 'gpt-4',
    displayName: 'GPT-4',
    inputCost: 30.00,
    outputCost: 60.00,
    description: 'Advanced reasoning capabilities'
  },
  {
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    inputCost: 0.50,
    outputCost: 1.50,
    description: 'Fast and affordable'
  },
  {
    name: 'claude-3-opus',
    displayName: 'Claude 3 Opus',
    inputCost: 15.00,
    outputCost: 75.00,
    description: 'Most capable Claude model'
  },
  {
    name: 'claude-3-sonnet',
    displayName: 'Claude 3 Sonnet',
    inputCost: 3.00,
    outputCost: 15.00,
    description: 'Balanced performance'
  },
  {
    name: 'claude-3-haiku',
    displayName: 'Claude 3 Haiku',
    inputCost: 0.25,
    outputCost: 1.25,
    description: 'Fastest Claude model'
  },
  {
    name: 'gemini-pro',
    displayName: 'Gemini Pro',
    inputCost: 0.50,
    outputCost: 1.50,
    description: 'Google\'s competitive model'
  },
  {
    name: 'llama-3-70b',
    displayName: 'Llama 3 70B',
    inputCost: 0.65,
    outputCost: 0.65,
    description: 'Open-source powerhouse'
  },
  {
    name: 'llama-3-8b',
    displayName: 'Llama 3 8B',
    inputCost: 0.05,
    outputCost: 0.05,
    description: 'Lightweight and fast'
  }
];

export function AICostCalculator() {
  const [text, setText] = useState<string>('');
  const [words, setWords] = useState<number>(0);
  const [characters, setCharacters] = useState<number>(0);
  const [charactersNoSpaces, setCharactersNoSpaces] = useState<number>(0);
  const [estimatedTokens, setEstimatedTokens] = useState<number>(0);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-3.5-turbo', 'claude-3-haiku']);
  const [outputRatio, setOutputRatio] = useState<number>(0.3); // Default: assume 30% output tokens

  useEffect(() => {
    // Update counts when text changes
    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, '').length;
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    
    // Estimate tokens (rough: 1 token ≈ 4 characters, or use word-based approximation)
    // OpenAI approximation: 1 word ≈ 1.3 tokens, 1 token ≈ 4 characters
    const tokenEstimate = Math.ceil(charCount / 4);
    
    setWords(wordCount);
    setCharacters(charCount);
    setCharactersNoSpaces(charNoSpaceCount);
    setEstimatedTokens(tokenEstimate);
  }, [text]);

  const calculateCost = (model: Model): { inputCost: number; outputCost: number; totalCost: number } => {
    const inputTokens = estimatedTokens * (1 - outputRatio);
    const outputTokens = estimatedTokens * outputRatio;
    
    const inputCostUSD = (inputTokens / 1000000) * model.inputCost;
    const outputCostUSD = (outputTokens / 1000000) * model.outputCost;
    const totalCostUSD = inputCostUSD + outputCostUSD;

    return {
      inputCost: inputCostUSD,
      outputCost: outputCostUSD,
      totalCost: totalCostUSD
    };
  };

  const handleModelToggle = (modelName: string) => {
    setSelectedModels(prev => 
      prev.includes(modelName)
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#059669"/>
          <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        AI Cost Calculator
      </h2>

      <p className="text-gray-600 mb-6">
        Calculate token usage and estimated costs for your text across multiple AI models. 
        Perfect for budgeting AI API expenses, analyzing documents, and cost comparison.
      </p>

      {/* Text Input */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-emerald-700">
          Paste or Type Your Text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here to analyze token usage and costs..."
          className="w-full p-4 border rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-y min-h-[200px] font-mono text-sm"
          rows={10}
        />
      </div>

      {/* Text Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{words.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Words</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{characters.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Characters</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-emerald-600">{(charactersNoSpaces).toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">No Spaces</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{estimatedTokens.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Est. Tokens</div>
        </div>
      </div>

      {/* Output Ratio Slider */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-emerald-700">
          Output Token Ratio: {(outputRatio * 100).toFixed(0)}% (Average AI responses are 30% of input)
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={outputRatio}
          onChange={(e) => setOutputRatio(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>0% (Input Only)</span>
          <span>50%</span>
          <span>100% (Output Only)</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Adjust this slider to estimate how much the AI will output vs. your input. 
          For most conversations, 30% is a good baseline.
        </p>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-emerald-700">
          Select AI Models to Compare (Select 1-9 models)
        </label>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {models.map(model => (
            <button
              key={model.name}
              onClick={() => handleModelToggle(model.name)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedModels.includes(model.name)
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-semibold text-sm">{model.displayName}</div>
                  <div className="text-xs text-gray-600">{model.description}</div>
                </div>
                <span className={selectedModels.includes(model.name) ? 'text-emerald-600' : 'text-gray-400'}>
                  {selectedModels.includes(model.name) ? '✓' : '○'}
                </span>
              </div>
            </button>
          ))}
        </div>
        {selectedModels.length === 0 && (
          <p className="text-sm text-red-600 mt-4">⚠️ Please select at least one model to see costs</p>
        )}
      </div>

      {/* Cost Estimates */}
      {selectedModels.length > 0 && estimatedTokens > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-900">Estimated Costs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="p-3 font-semibold text-gray-900">Model</th>
                  <th className="p-3 font-semibold text-gray-900">Input Cost</th>
                  <th className="p-3 font-semibold text-gray-900">Output Cost</th>
                  <th className="p-3 font-semibold text-gray-900">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {selectedModels.map(modelName => {
                  const model = models.find(m => m.name === modelName);
                  if (!model) return null;
                  
                  const costs = calculateCost(model);
                  return (
                    <tr key={model.name} className="border-b border-gray-100">
                      <td className="p-3 font-medium">{model.displayName}</td>
                      <td className="p-3 text-emerald-600">${costs.inputCost.toFixed(4)}</td>
                      <td className="p-3 text-purple-600">${costs.outputCost.toFixed(4)}</td>
                      <td className="p-3 font-bold text-gray-900">${costs.totalCost.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Cheapest:</div>
                <div className="text-lg font-bold text-emerald-700">
                  {(() => {
                    const costs = selectedModels.map(modelName => {
                      const model = models.find(m => m.name === modelName);
                      return model ? { name: model.displayName, cost: calculateCost(model).totalCost } : null;
                    }).filter(Boolean).sort((a: any, b: any) => a.cost - b.cost)[0];
                    return costs ? `${costs.name}: $${costs.cost.toFixed(4)}` : 'N/A';
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Most Expensive:</div>
                <div className="text-lg font-bold text-purple-700">
                  {(() => {
                    const costs = selectedModels.map(modelName => {
                      const model = models.find(m => m.name === modelName);
                      return model ? { name: model.displayName, cost: calculateCost(model).totalCost } : null;
                    }).filter(Boolean).sort((a: any, b: any) => b.cost - a.cost)[0];
                    return costs ? `${costs.name}: $${costs.cost.toFixed(4)}` : 'N/A';
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Est. Tokens:</div>
                <div className="text-lg font-bold text-gray-900">{estimatedTokens.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AICostCalculatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">What is Token Counting?</h2>
        <p className="text-gray-700 text-lg">
          <strong>Tokens</strong> are the basic units of text that AI models process. They're not exactly words or characters - 
          one token typically equals 3-4 characters or roughly 0.75 words. Understanding token usage is crucial for 
          budgeting AI API costs and optimizing prompts.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">How Token Counting Works</h2>
        <p className="text-gray-700 text-lg mb-3">
          Our calculator estimates token usage using these approximations:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>1 token ≈ 4 characters</strong> - A rough but reliable estimate</li>
          <li><strong>1 token ≈ 0.75 words</strong> - Word-based approximation</li>
          <li><strong>Tokens include punctuation</strong> - Spaces and special characters count</li>
          <li><strong>Output ratio matters</strong> - AI responses consume tokens too</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Cost Comparison - AI Models</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">💰 Budget-Friendly</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Llama 3 8B: $0.05/1M</li>
              <li>• Claude 3 Haiku: $0.25/1M</li>
              <li>• GPT-3.5 Turbo: $0.50/1M</li>
            </ul>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">⚡ Balanced</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Claude 3 Sonnet: $3/1M</li>
              <li>• Llama 3 70B: $0.65/1M</li>
              <li>• Gemini Pro: $0.50/1M</li>
            </ul>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">🚀 Premium</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• GPT-4 Turbo: $10/1M</li>
              <li>• Claude 3 Opus: $15/1M</li>
              <li>• GPT-4: $30/1M</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Tips for Cost Optimization</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Shorten prompts</strong> - Remove unnecessary context for low-cost operations</li>
          <li><strong>Use cheaper models</strong> - GPT-3.5/Claude Haiku for simple tasks</li>
          <li><strong>Batch requests</strong> - Process multiple items in one API call</li>
          <li><strong>Cache responses</strong> - Reuse similar outputs to save tokens</li>
          <li><strong>Monitor usage</strong> - Track token consumption to identify costly operations</li>
          <li><strong>Set limits</strong> - Use max_tokens parameter to control output length</li>
        </ul>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Popular Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">📝 Content & Writing</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Blog post analysis</li>
              <li>• Article summarization</li>
              <li>• Content rewriting</li>
              <li>• Translation services</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">💼 Business & Enterprise</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Document processing</li>
              <li>• Email automation</li>
              <li>• Report generation</li>
              <li>• Data extraction</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">🔍 Research & Analysis</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Paper analysis</li>
              <li>• Code review</li>
              <li>• Literature review</li>
              <li>• Data interpretation</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">🎓 Education</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Student feedback</li>
              <li>• Essay grading</li>
              <li>• Course material</li>
              <li>• Quiz generation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Understanding API Pricing</h2>
        <p className="text-gray-700 text-lg mb-3">
          AI model pricing typically charges per million tokens for both input and output:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><strong>Input tokens</strong> - What you send to the AI (your prompt)</li>
          <li><strong>Output tokens</strong> - What the AI generates (its response)</li>
          <li><strong>Output is usually 2-5x more expensive</strong> - Generating content costs more than reading it</li>
          <li><strong>All models offer different pricing</strong> - Compare before committing to one</li>
        </ul>
      </section>
    </>
  );
}

export default AICostCalculator;

