"use client";

import React, { useState } from 'react';

interface AnalysisResult {
  humanScore: number;
  aiScore: number;
  assessment: string;
  indicators: {
    label: string;
    value: string;
    level: 'low' | 'medium' | 'high';
    tip?: string;
  }[];
  recommendations: string[];
}

export function AITextStyleAnalyzer() {
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const calculateMetrics = (input: string): AnalysisResult => {
    const words = input.split(/\s+/).filter(w => w.length > 0);
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Average sentence length
    const avgSentenceLength = words.length / sentences.length || 0;
    
    // Average word length
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length || 0;
    
    // Check for AI-like patterns
    const aiConnectors = ['furthermore', 'moreover', 'additionally', 'consequently', 'subsequently', 'therefore', 'thus', 'hence', 'indeed', 'notably'];
    const aiConnectorCount = words.filter(w => aiConnectors.includes(w.toLowerCase().replace(/[.,!?]/g, ''))).length;
    const connectorRatio = aiConnectorCount / sentences.length;
    
    // Variability (check for repetitive patterns)
    const wordVariety = new Set(words.map(w => w.toLowerCase())).size / words.length;
    
    // Formal language indicators
    const formalWords = ['utilize', 'facilitate', 'substantial', 'implement', 'enhance', 'optimize', 'leverage', 'robust'];
    const formalWordCount = words.filter(w => formalWords.includes(w.toLowerCase())).length;
    
    // First person usage
    const firstPersonCount = (input.match(/\b(I|me|my|we|us|our)\b/gi) || []).length;
    const firstPersonRatio = firstPersonCount / words.length;
    
    // Personal anecdotes or specifics
    const specificMarkers = (input.match(/\d+/g) || []).length; // Numbers
    const questionMarks = (input.match(/\?/g) || []).length;
    const exclamations = (input.match(/!/g) || []).length;
    
    // Calculate scores
    let humanScore = 50; // Start neutral
    const indicators: any[] = [];
    
    // Sentence length analysis
    if (avgSentenceLength < 12) {
      indicators.push({ label: 'Sentence Length', value: `${avgSentenceLength.toFixed(1)} words (short)`, level: 'low' as const, tip: 'Short sentences can appear robotic. Vary your sentence length.' });
    } else if (avgSentenceLength > 20) {
      indicators.push({ label: 'Sentence Length', value: `${avgSentenceLength.toFixed(1)} words (long)`, level: 'medium' as const, tip: 'Very long sentences can be overwhelming. Mix with shorter ones.' });
    } else {
      indicators.push({ label: 'Sentence Length', value: `${avgSentenceLength.toFixed(1)} words (balanced)`, level: 'low' as const });
      humanScore += 10;
    }
    
    // Word variety
    if (wordVariety < 0.3) {
      indicators.push({ label: 'Word Variety', value: `${(wordVariety * 100).toFixed(1)}% unique`, level: 'high' as const, tip: 'Low word variety can indicate AI. Use more varied vocabulary.' });
    } else if (wordVariety > 0.5) {
      indicators.push({ label: 'Word Variety', value: `${(wordVariety * 100).toFixed(1)}% unique`, level: 'low' as const });
      humanScore += 15;
    } else {
      indicators.push({ label: 'Word Variety', value: `${(wordVariety * 100).toFixed(1)}% unique`, level: 'medium' as const });
    }
    
    // AI connector usage
    if (connectorRatio > 0.3) {
      indicators.push({ label: 'Formal Connectors', value: `${connectorRatio.toFixed(2)} per sentence`, level: 'high' as const, tip: 'Overuse of formal connectors (furthermore, moreover) is common in AI writing.' });
    } else if (connectorRatio > 0.1) {
      indicators.push({ label: 'Formal Connectors', value: `${connectorRatio.toFixed(2)} per sentence`, level: 'medium' as const, tip: 'Consider using fewer formal connectors.' });
    } else {
      indicators.push({ label: 'Formal Connectors', value: `${connectorRatio.toFixed(2)} per sentence`, level: 'low' as const });
      humanScore += 10;
    }
    
    // Formal language
    if (formalWordCount > 5) {
      indicators.push({ label: 'Formal Language', value: `${formalWordCount} formal words`, level: 'medium' as const, tip: 'Too many formal words can sound corporate or AI-generated.' });
    } else {
      indicators.push({ label: 'Formal Language', value: `${formalWordCount} formal words`, level: 'low' as const });
      humanScore += 10;
    }
    
    // First person usage
    if (firstPersonRatio > 0.02) {
      indicators.push({ label: 'Personal Voice', value: `${firstPersonRatio.toFixed(3)} ratio`, level: 'low' as const });
      humanScore += 15;
    } else {
      indicators.push({ label: 'Personal Voice', value: `${firstPersonRatio.toFixed(3)} ratio (low)`, level: 'medium' as const, tip: 'Adding personal pronouns (I, me, we) makes writing more human.' });
    }
    
    // Specific details
    const specificity = (specificMarkers + questionMarks + exclamations) / sentences.length;
    if (specificity > 1) {
      indicators.push({ label: 'Specific Details', value: `${specificity.toFixed(1)} per sentence`, level: 'low' as const });
      humanScore += 10;
    } else {
      indicators.push({ label: 'Specific Details', value: `${specificity.toFixed(1)} per sentence (low)`, level: 'medium' as const, tip: 'Add numbers, dates, or specific examples to make it more human.' });
    }
    
    // Overall assessment
    const aiScore = 100 - humanScore;
    let assessment: string;
    if (humanScore >= 70) {
      assessment = 'Likely Human-Written';
    } else if (humanScore >= 50) {
      assessment = 'Mixed Style - Partially AI-Influenced';
    } else {
      assessment = 'Shows AI Writing Characteristics';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (firstPersonRatio < 0.01) {
      recommendations.push("Add personal pronouns ('I', 'me', 'we') to make it more conversational");
    }
    
    if (connectorRatio > 0.2) {
      recommendations.push("Reduce formal connectors like 'furthermore' and 'moreover' - use simpler transitions");
    }
    
    if (specificMarkers < 3 && sentences.length > 10) {
      recommendations.push("Add specific numbers, dates, or concrete details to make it more authentic");
    }
    
    if (wordVariety < 0.3) {
      recommendations.push("Increase vocabulary variety - avoid repeating the same phrases");
    }
    
    if (formalWordCount > 5) {
      recommendations.push("Replace formal corporate language ('utilize', 'facilitate') with everyday words");
    }
    
    if (avgSentenceLength > 20) {
      recommendations.push("Break up overly long sentences into shorter, punchier ones");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Your writing shows good human characteristics. Keep your authentic voice!");
    }
    
    return {
      humanScore,
      aiScore,
      assessment,
      indicators,
      recommendations
    };
  };

  const handleAnalyze = () => {
    if (!text.trim() || text.trim().split(/\s+/).length < 10) {
      alert('Please enter at least 10 words for analysis.');
      return;
    }
    
    const result = calculateMetrics(text);
    setAnalysis(result);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="#0891b2"/>
          <path d="M7 10h10M7 14h8" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        AI Text Style Analyzer
      </h2>

      <p className="text-gray-600 mb-6">
        Analyze writing style for common AI writing patterns. Get tips to make your writing more authentic, 
        conversational, and distinctly human. <strong>Note: This is a heuristic analysis, not a perfect detector.</strong>
      </p>

      {/* Disclaimer */}
      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded">
        <p className="text-sm text-blue-800">
          <strong>Disclaimer:</strong> This tool analyzes writing style using heuristics and pattern recognition. 
          It does not guarantee accuracy in AI detection. Use it as a guide to improve your writing style, not as a 
          definitive test. Both humans and AI can write in various styles.
        </p>
      </div>

      {/* Text Input */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-cyan-700">
          Paste Your Text Here
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text to analyze (minimum 10 words required)..."
          className="w-full p-4 border rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 resize-y min-h-[200px]"
          rows={10}
        />
        <p className="text-sm text-gray-500 mt-2">
          Word count: {text.trim().split(/\s+/).filter(w => w.length > 0).length} | 
          Sentences: {text.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
        </p>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={text.trim().split(/\s+/).length < 10}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors mb-6 ${
          text.trim().split(/\s+/).length >= 10
            ? 'bg-cyan-600 hover:bg-cyan-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Analyze Writing Style
      </button>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Human Style Score</div>
              <div className="text-4xl font-bold text-green-600">{analysis.humanScore}%</div>
              <div className="h-2 bg-gray-200 rounded-full mt-4">
                <div 
                  className="h-2 bg-green-500 rounded-full"
                  style={{ width: `${analysis.humanScore}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">AI Pattern Score</div>
              <div className="text-4xl font-bold text-red-600">{analysis.aiScore}%</div>
              <div className="h-2 bg-gray-200 rounded-full mt-4">
                <div 
                  className="h-2 bg-red-500 rounded-full"
                  style={{ width: `${analysis.aiScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${
            analysis.humanScore >= 70 ? 'border-green-500' : 
            analysis.humanScore >= 50 ? 'border-yellow-500' : 'border-red-500'
          }`}>
            <h3 className="text-lg font-bold mb-2 text-gray-900">
              Assessment: {analysis.assessment}
            </h3>
            <p className="text-gray-600">
              Based on heuristics analysis of writing style patterns. This is not a perfect AI detector, but rather 
              an assessment of writing characteristics.
            </p>
          </div>

          {/* Detailed Indicators */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">Writing Style Indicators</h3>
            <div className="space-y-3">
              {analysis.indicators.map((indicator, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{indicator.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{indicator.value}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLevelColor(indicator.level)}`}>
                      {indicator.level.toUpperCase()}
                    </span>
                  </div>
                  {indicator.tip && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      💡 {indicator.tip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-cyan-900">💡 Recommendations to Humanize Your Writing</h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-cyan-600 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Additional Tips */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900">General Tips for More Human Writing</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold mb-2 text-cyan-700">✅ Add Personal Touches</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Include personal anecdotes or stories</li>
                  <li>Use first-person voice ("I noticed...", "We found...")</li>
                  <li>Add your unique opinions and perspectives</li>
                  <li>Reference your experiences</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-cyan-700">✅ Be Specific</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Include specific numbers, dates, or facts</li>
                  <li>Name concrete examples</li>
                  <li>Add relevant statistics or data</li>
                  <li>Reference real people or places</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-cyan-700">✅ Vary Your Style</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Mix sentence lengths</li>
                  <li>Use varied vocabulary</li>
                  <li>Include rhetorical questions</li>
                  <li>Add conversational elements</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-cyan-700">✅ Be Authentic</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Avoid overly formal or corporate language</li>
                  <li>Use contractions naturally</li>
                  <li>Show personality in your writing</li>
                  <li>Write like you speak (with polish)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      {analysis && analysis.aiScore > 50 && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-purple-900 mb-2">
            ✨ Need to Humanize Your Writing?
          </h3>
          <p className="text-purple-700 mb-4">
            Learn professional techniques to make AI-assisted writing undetectable and authentically human. 
            Includes manual humanization tricks, style guides, and real examples.
          </p>
          <a 
            href="/guides/humanize-ai-writing"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            Get Humanization Guide →
          </a>
        </div>
      )}
    </div>
  );
}

export function AITextStyleAnalyzerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">How Does AI Text Style Analysis Work?</h2>
        <p className="text-gray-700 text-lg">
          This tool analyzes writing style using heuristics and pattern recognition to identify common AI 
          writing characteristics. It examines sentence structure, word variety, formality, and other stylistic 
          markers. <strong>This is not a perfect detector</strong> - it provides guidance to improve writing authenticity.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">What We Analyze</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">📏 Structure</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Average sentence length</li>
              <li>• Sentence variety</li>
              <li>• Paragraph structure</li>
              <li>• Word length patterns</li>
            </ul>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">📝 Language Patterns</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Formal connector usage</li>
              <li>• Word variety and repetition</li>
              <li>• Corporate language markers</li>
              <li>• Transition words</li>
            </ul>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">💬 Human Elements</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• First-person usage</li>
              <li>• Personal pronouns</li>
              <li>• Specific details and numbers</li>
              <li>• Varied punctuation</li>
            </ul>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">🎯 Authenticity Markers</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Contractions</li>
              <li>• Personal opinions</li>
              <li>• Real-world references</li>
              <li>• Natural flow</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Understanding Your Score</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>70-100% Human Score:</strong> Writing shows strong human characteristics with varied style, personal voice, and authentic elements</li>
          <li><strong>50-69% Human Score:</strong> Mixed style - shows some AI-influenced patterns but has human elements</li>
          <li><strong>Below 50% Human Score:</strong> Shows strong AI writing characteristics - consider humanizing further</li>
        </ul>
        <p className="text-gray-600 italic mt-4">
          Remember: Both humans and AI can write in various styles. Use this tool as a writing improvement guide, 
          not as a definitive test.
        </p>
      </section>

      <section className="mb-10 bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Why This Matters</h2>
        <p className="text-gray-700 text-lg mb-3">
          Authentic human writing has unique characteristics that are difficult for AI to fully replicate:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><strong>Personal voice</strong> - Your unique perspective and experiences</li>
          <li><strong>Natural flow</strong> - Imperfect, varied, and spontaneous</li>
          <li><strong>Emotional nuance</strong> - Subtle feelings and personal connections</li>
          <li><strong>Concrete details</strong> - Specific examples from real life</li>
          <li><strong>Authentic opinions</strong> - Your genuine thoughts and beliefs</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Common Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-cyan-900 mb-2">👨‍🎓 Students</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ensuring original work integrity</li>
              <li>• Understanding writing style</li>
              <li>• Improving academic writing</li>
              <li>• Meeting authenticity requirements</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-900 mb-2">✍️ Content Writers</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Maintaining authentic voice</li>
              <li>• Balancing AI assistance with personal style</li>
              <li>• Creating human-optimized content</li>
              <li>• Meeting client requirements</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-900 mb-2">📝 Bloggers</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Developing unique writing style</li>
              <li>• Engaging with personal voice</li>
              <li>• Standing out from AI content</li>
              <li>• Building audience trust</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-cyan-900 mb-2">💼 Professionals</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Humanizing business communications</li>
              <li>• Maintaining professional authenticity</li>
              <li>• Creating relatable content</li>
              <li>• Building personal brand</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export default AITextStyleAnalyzer;

