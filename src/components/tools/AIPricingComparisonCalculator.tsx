"use client";

import React, { useState } from 'react';

interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  inputPricePer1M: number; // Price per 1M input tokens
  outputPricePer1M: number; // Price per 1M output tokens
  description: string;
  icon: string;
  color: string;
}

const models: ModelPricing[] = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    inputPricePer1M: 10.00,
    outputPricePer1M: 30.00,
    description: 'Most capable model, advanced reasoning',
    icon: '🤖',
    color: 'blue'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    inputPricePer1M: 30.00,
    outputPricePer1M: 60.00,
    description: 'Original GPT-4 model',
    icon: '🤖',
    color: 'blue'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    inputPricePer1M: 0.50,
    outputPricePer1M: 1.50,
    description: 'Fast and cost-effective',
    icon: '⚡',
    color: 'green'
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    inputPricePer1M: 15.00,
    outputPricePer1M: 75.00,
    description: 'Most capable Claude model',
    icon: '🧠',
    color: 'purple'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    inputPricePer1M: 3.00,
    outputPricePer1M: 15.00,
    description: 'Balanced performance and cost',
    icon: '🧠',
    color: 'purple'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    inputPricePer1M: 0.25,
    outputPricePer1M: 1.25,
    description: 'Fast and cost-effective',
    icon: '⚡',
    color: 'green'
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    inputPricePer1M: 0.50,
    outputPricePer1M: 1.50,
    description: 'Google\'s advanced model',
    icon: '💎',
    color: 'cyan'
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'Google',
    inputPricePer1M: 0.25,
    outputPricePer1M: 0.25,
    description: 'Multimodal vision model',
    icon: '👁️',
    color: 'cyan'
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    inputPricePer1M: 2.00,
    outputPricePer1M: 6.00,
    description: 'European AI model',
    icon: '🇪🇺',
    color: 'indigo'
  },
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    provider: 'Mistral AI',
    inputPricePer1M: 0.50,
    outputPricePer1M: 1.50,
    description: 'Balanced performance',
    icon: '🇪🇺',
    color: 'indigo'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    provider: 'Meta',
    inputPricePer1M: 0.59,
    outputPricePer1M: 0.79,
    description: 'Open-source model (via API)',
    icon: '🦙',
    color: 'orange'
  },
  {
    id: 'llama-3-8b',
    name: 'Llama 3 8B',
    provider: 'Meta',
    inputPricePer1M: 0.05,
    outputPricePer1M: 0.05,
    description: 'Fast open-source model',
    icon: '🦙',
    color: 'orange'
  }
];

interface CalculationResult {
  model: ModelPricing;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costPer1MTotal: number;
}

function calculateCost(
  model: ModelPricing,
  inputTokens: number,
  outputTokens: number
): CalculationResult {
  const inputCost = (inputTokens / 1_000_000) * model.inputPricePer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputPricePer1M;
  const totalCost = inputCost + outputCost;
  const totalTokens = inputTokens + outputTokens;
  const costPer1MTotal = totalTokens > 0 ? (totalCost / totalTokens) * 1_000_000 : 0;

  return {
    model,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
    costPer1MTotal
  };
}

export function AIPricingComparisonCalculator() {
  const [selectedModels, setSelectedModels] = useState<string[]>(['gpt-4-turbo', 'claude-3-sonnet', 'gemini-pro']);
  const [inputTokens, setInputTokens] = useState<number>(1000000);
  const [outputTokens, setOutputTokens] = useState<number>(500000);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleModelToggle = (modelId: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId);
      } else {
        return [...prev, modelId];
      }
    });
  };

  const handleCalculate = () => {
    if (selectedModels.length === 0) {
      alert('Please select at least one model');
      return;
    }

    const calculations = selectedModels
      .map(modelId => {
        const model = models.find(m => m.id === modelId);
        if (!model) return null;
        return calculateCost(model, inputTokens, outputTokens);
      })
      .filter((result): result is CalculationResult => result !== null)
      .sort((a, b) => a.totalCost - b.totalCost);

    setResults(calculations);
    setShowResults(true);
  };

  const handleClear = () => {
    setSelectedModels(['gpt-4-turbo', 'claude-3-sonnet', 'gemini-pro']);
    setInputTokens(1000000);
    setOutputTokens(500000);
    setResults([]);
    setShowResults(false);
  };

  const handleLoadExample = () => {
    setInputTokens(5000000);
    setOutputTokens(2000000);
  };

  const totalTokens = inputTokens + outputTokens;

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="#1E40AF" strokeWidth="2" fill="none"/>
        </svg>
        AI Pricing Comparison Calculator
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Token Usage Input */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-blue-700">
            Token Usage (per month)
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm text-gray-600">Input Tokens</label>
              <input
                type="number"
                value={inputTokens}
                onChange={(e) => setInputTokens(parseInt(e.target.value) || 0)}
                placeholder="1000000"
                className="w-full p-4 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-600">Output Tokens</label>
              <input
                type="number"
                value={outputTokens}
                onChange={(e) => setOutputTokens(parseInt(e.target.value) || 0)}
                placeholder="500000"
                className="w-full p-4 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <p className="text-xs text-gray-600">
              Total: {totalTokens.toLocaleString()} tokens
            </p>
            <button
              onClick={handleLoadExample}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Load Example
            </button>
          </div>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold text-blue-700">
            Select Models to Compare
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2 border-2 border-blue-100 rounded-lg">
            {models.map(model => (
              <button
                key={model.id}
                onClick={() => handleModelToggle(model.id)}
                className={`p-3 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedModels.includes(model.id)
                    ? `border-${model.color}-500 bg-${model.color}-50`
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{model.icon}</span>
                  <div>
                    <div className="font-bold text-sm text-gray-900">{model.name}</div>
                    <div className="text-xs text-gray-600">{model.provider}</div>
                  </div>
                </div>
                {selectedModels.includes(model.id) && (
                  <div className="text-xs text-gray-700 line-clamp-2">{model.description}</div>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCalculate}
            disabled={selectedModels.length === 0 || inputTokens === 0 || outputTokens === 0}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
              selectedModels.length > 0 && inputTokens > 0 && outputTokens > 0
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
              Calculate & Compare Costs
            </span>
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {showResults && results.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">Cost Comparison Summary</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Tokens</p>
                <p className="text-2xl font-bold text-blue-800">{totalTokens.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Cheapest Model</p>
                <p className="text-lg font-bold text-green-800">{results[0].model.name}</p>
                <p className="text-sm text-gray-600">${results[0].totalCost.toFixed(2)}/month</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Most Expensive</p>
                <p className="text-lg font-bold text-red-800">{results[results.length - 1].model.name}</p>
                <p className="text-sm text-gray-600">${results[results.length - 1].totalCost.toFixed(2)}/month</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Average Cost</p>
                <p className="text-2xl font-bold text-purple-800">
                  ${(results.reduce((sum, r) => sum + r.totalCost, 0) / results.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-blue-800 mb-4">Detailed Cost Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Model</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Input Cost</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Output Cost</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Total Cost</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Cost per 1M Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr
                      key={result.model.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === 0 ? 'bg-green-50' : index === results.length - 1 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{result.model.icon}</span>
                          <div>
                            <div className="font-semibold text-gray-900">{result.model.name}</div>
                            <div className="text-xs text-gray-600">{result.model.provider}</div>
                          </div>
                          {index === 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">
                              Cheapest
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right p-3 text-gray-700">
                        ${result.inputCost.toFixed(2)}
                        <div className="text-xs text-gray-500">
                          ${result.model.inputPricePer1M}/1M tokens
                        </div>
                      </td>
                      <td className="text-right p-3 text-gray-700">
                        ${result.outputCost.toFixed(2)}
                        <div className="text-xs text-gray-500">
                          ${result.model.outputPricePer1M}/1M tokens
                        </div>
                      </td>
                      <td className="text-right p-3">
                        <span className="font-bold text-blue-800 text-lg">
                          ${result.totalCost.toFixed(2)}
                        </span>
                        <div className="text-xs text-gray-500">per month</div>
                      </td>
                      <td className="text-right p-3">
                        <span className="font-bold text-purple-800">
                          ${result.costPer1MTotal.toFixed(2)}
                        </span>
                        <div className="text-xs text-gray-500">per 1M tokens</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Savings */}
          {results.length > 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Cost Savings Analysis</h3>
              <div className="space-y-3">
                {results.map((result, index) => {
                  if (index === 0) return null;
                  const cheapest = results[0];
                  const savings = result.totalCost - cheapest.totalCost;
                  const savingsPercent = ((savings / result.totalCost) * 100).toFixed(1);
                  
                  return (
                    <div key={result.model.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-900">{result.model.name}</span>
                          <span className="text-gray-600"> vs </span>
                          <span className="font-semibold text-green-800">{cheapest.model.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-red-800 text-lg">
                            ${savings.toFixed(2)}/month
                          </span>
                          <div className="text-sm text-gray-600">
                            {savingsPercent}% more expensive
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AIPricingComparisonCalculatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">What is an AI Pricing Comparison Calculator?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Pricing Comparison Calculator</strong> is a tool that helps developers and businesses 
          compare API costs across different AI models. Select models (GPT, Claude, Gemini, Mistral, etc.) and 
          enter your monthly token usage, then instantly see cost comparisons with detailed breakdowns. Perfect 
          for developers who want to quickly see "cost per 1M tokens" and find the most cost-effective model for 
          their use case.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Pricing Comparison Calculator:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Model Selection:</strong> Choose from 12+ popular AI models (GPT, Claude, Gemini, etc.)</li>
          <li><strong>Token Usage:</strong> Enter your monthly input and output token usage</li>
          <li><strong>Cost Calculation:</strong> Calculates costs based on each model's pricing</li>
          <li><strong>Comparison:</strong> Compares costs across selected models side-by-side</li>
          <li><strong>Cost per 1M Tokens:</strong> Shows normalized pricing for easy comparison</li>
          <li><strong>Savings Analysis:</strong> Highlights cost differences and savings opportunities</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Supported Models</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map(model => (
            <div key={model.id} className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{model.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{model.name}</h3>
                  <p className="text-xs text-gray-600">{model.provider}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{model.description}</p>
              <div className="text-xs text-gray-600">
                <div>Input: ${model.inputPricePer1M}/1M tokens</div>
                <div>Output: ${model.outputPricePer1M}/1M tokens</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Save Time:</strong> Quickly compare costs across multiple AI models</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Find Best Value:</strong> Identify the most cost-effective model for your usage</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Budget Planning:</strong> Estimate monthly API costs accurately</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Cost per 1M Tokens:</strong> See normalized pricing for easy comparison</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Make Informed Decisions:</strong> Choose the right model based on cost and performance</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Estimate accurately:</strong> Use your actual token usage for accurate cost estimates</li>
          <li><strong>Compare multiple models:</strong> Select several models to see cost differences</li>
          <li><strong>Consider input/output ratio:</strong> Some models have different pricing for input vs output</li>
          <li><strong>Check pricing updates:</strong> AI model pricing changes frequently - verify current rates</li>
          <li><strong>Factor in performance:</strong> Cheapest isn't always best - consider quality and speed</li>
          <li><strong>Plan for scale:</strong> Test with different usage levels to see cost scaling</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">✅ Developers</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Compare API costs quickly</li>
              <li>• Find cost-effective models</li>
              <li>• Budget for API usage</li>
              <li>• Make informed decisions</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-800 mb-3">✅ Businesses</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Estimate monthly costs</li>
              <li>• Compare vendor pricing</li>
              <li>• Optimize AI spending</li>
              <li>• Plan budgets</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Enter token usage</strong> (input and output tokens per month)</li>
          <li><strong>Select models</strong> to compare (GPT, Claude, Gemini, etc.)</li>
          <li><strong>Click "Calculate & Compare Costs"</strong> to see results</li>
          <li><strong>Review cost breakdown</strong> for each model</li>
          <li><strong>Compare "Cost per 1M Tokens"</strong> for normalized pricing</li>
          <li><strong>Check savings analysis</strong> to see cost differences</li>
          <li><strong>Make informed decision</strong> based on cost and performance</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Note:</strong> Pricing is based on publicly available API rates. Actual pricing may vary based on 
          volume discounts, usage tiers, and provider-specific terms. Always verify current pricing with the provider.
        </p>
      </section>
    </>
  );
}

export default AIPricingComparisonCalculator;

