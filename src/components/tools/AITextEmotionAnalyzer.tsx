"use client";

import React, { useState } from 'react';

interface EmotionScore {
  name: string;
  score: number;
  percentage: number;
  color: string;
  icon: string;
  keywords: string[];
}

const emotionCategories: Record<string, { name: string; keywords: string[]; color: string; icon: string }> = {
  happy: {
    name: 'Happy',
    keywords: ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'love', 'loved', 'awesome', 'brilliant', 'excellent', 'perfect', 'smile', 'laugh', 'cheerful', 'delighted', 'pleased', 'glad', 'thrilled', 'ecstatic', '😊', '😄', '😁', '😃', '😍', '🥳', '🎉'],
    color: 'yellow',
    icon: '😊'
  },
  sad: {
    name: 'Sad',
    keywords: ['sad', 'unhappy', 'depressed', 'disappointed', 'down', 'upset', 'hurt', 'sorry', 'cry', 'tears', 'lonely', 'miserable', 'gloomy', 'sorrow', 'grief', 'melancholy', 'devastated', 'heartbroken', '😢', '😭', '😔', '😞', '😟'],
    color: 'blue',
    icon: '😢'
  },
  angry: {
    name: 'Angry',
    keywords: ['angry', 'mad', 'furious', 'rage', 'annoyed', 'frustrated', 'irritated', 'outraged', 'livid', 'fuming', 'hate', 'hated', 'disgusted', 'disgusting', 'terrible', 'awful', 'horrible', 'worst', '😠', '😡', '🤬', '😤', '💢'],
    color: 'red',
    icon: '😠'
  },
  fearful: {
    name: 'Fearful',
    keywords: ['afraid', 'scared', 'fear', 'worried', 'anxious', 'nervous', 'terrified', 'panic', 'concerned', 'dread', 'frightened', 'apprehensive', '😨', '😰', '😱', '😖', '😓'],
    color: 'purple',
    icon: '😨'
  },
  surprised: {
    name: 'Surprised',
    keywords: ['surprised', 'shocked', 'amazed', 'astonished', 'wow', 'incredible', 'unbelievable', 'stunned', '😲', '😮', '😯', '🤯', '😳'],
    color: 'orange',
    icon: '😲'
  },
  neutral: {
    name: 'Neutral',
    keywords: ['ok', 'okay', 'fine', 'alright', 'sure', 'maybe', 'perhaps', 'possibly', 'probably', '🤷', '😐', '😑'],
    color: 'gray',
    icon: '😐'
  },
  excited: {
    name: 'Excited',
    keywords: ['excited', 'excitement', 'thrilled', 'pumped', 'eager', 'enthusiastic', 'energized', 'motivated', 'inspired', '🎉', '🎊', '🔥', '💪', '🚀'],
    color: 'green',
    icon: '🎉'
  },
  grateful: {
    name: 'Grateful',
    keywords: ['thank', 'thanks', 'thankful', 'grateful', 'appreciate', 'appreciation', 'blessed', '🙏', '❤️', '💝'],
    color: 'pink',
    icon: '🙏'
  },
  confused: {
    name: 'Confused',
    keywords: ['confused', 'confusion', 'unclear', 'unclear', 'puzzled', 'bewildered', 'lost', '🤔', '😕', '😶'],
    color: 'indigo',
    icon: '🤔'
  },
  disgusted: {
    name: 'Disgusted',
    keywords: ['disgust', 'disgusting', 'gross', 'revolting', 'nasty', 'yuck', 'ew', '🤢', '🤮', '😷'],
    color: 'brown',
    icon: '🤢'
  }
};

function analyzeEmotions(text: string): EmotionScore[] {
  if (!text.trim()) return [];

  const lowerText = text.toLowerCase();
  const scores: EmotionScore[] = [];
  let totalScore = 0;

  // Count keywords for each emotion
  Object.entries(emotionCategories).forEach(([id, emotion]) => {
    let score = 0;
    const foundKeywords: string[] = [];

    emotion.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b|${keyword}`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) {
        score += matches.length;
        foundKeywords.push(keyword);
      }
    });

    if (score > 0) {
      totalScore += score;
      scores.push({
        name: emotion.name,
        score,
        percentage: 0, // Will calculate after
        color: emotion.color,
        icon: emotion.icon,
        keywords: foundKeywords
      });
    }
  });

  // Calculate percentages
  if (totalScore > 0) {
    scores.forEach(score => {
      score.percentage = Math.round((score.score / totalScore) * 100);
    });
  }

  // Sort by score (highest first)
  scores.sort((a, b) => b.score - a.score);

  // If no emotions detected, return neutral
  if (scores.length === 0) {
    return [{
      name: 'Neutral',
      score: 0,
      percentage: 100,
      color: 'gray',
      icon: '😐',
      keywords: []
    }];
  }

  return scores;
}

function getDominantEmotion(scores: EmotionScore[]): EmotionScore | null {
  if (scores.length === 0) return null;
  return scores[0];
}

function getToneDescription(scores: EmotionScore[]): string {
  const dominant = getDominantEmotion(scores);
  if (!dominant) return 'Neutral';

  if (dominant.percentage >= 60) {
    return `Strongly ${dominant.name.toLowerCase()}`;
  } else if (dominant.percentage >= 40) {
    return `Moderately ${dominant.name.toLowerCase()}`;
  } else {
    return `Mixed emotions (primarily ${dominant.name.toLowerCase()})`;
  }
}

export function AITextEmotionAnalyzer() {
  const [inputText, setInputText] = useState('');
  const [emotionScores, setEmotionScores] = useState<EmotionScore[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      const scores = analyzeEmotions(inputText);
      setEmotionScores(scores);
      setIsAnalyzing(false);
      setShowDetails(true);
    }, 500);
  };

  const handleClear = () => {
    setInputText('');
    setEmotionScores([]);
    setShowDetails(false);
  };

  const handleLoadExample = () => {
    const examples = [
      'I am so happy and excited about this amazing opportunity! This is fantastic news! 🎉',
      'I feel really sad and disappointed about what happened. This is so upsetting.',
      'I am absolutely furious and angry about this situation! This is terrible!',
      'Thank you so much for your help. I really appreciate it! 🙏'
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInputText(randomExample);
  };

  const dominantEmotion = getDominantEmotion(emotionScores);
  const toneDescription = getToneDescription(emotionScores);

  return (
    <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-pink-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke="#BE185D" strokeWidth="2" fill="none"/>
        </svg>
        AI Text Emotion Analyzer (Heuristic)
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-semibold text-pink-700">
              Enter Text to Analyze
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLoadExample}
                className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-sm hover:bg-pink-200 transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste comments, emails, social media posts, or any text to analyze emotions..."
            rows={8}
            className="w-full p-4 border-2 border-pink-200 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 resize-y"
          />
          <p className="text-xs text-gray-600 mt-2">
            {inputText.length} characters
          </p>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!inputText.trim() || isAnalyzing}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            inputText.trim() && !isAnalyzing
              ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 hover:scale-105 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing Emotions...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Analyze Emotions
            </span>
          )}
        </button>
      </div>

      {showDetails && emotionScores.length > 0 && (
        <div className="space-y-6">
          {/* Dominant Emotion Card */}
          {dominantEmotion && (
            <div className={`${
              dominantEmotion.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              dominantEmotion.color === 'blue' ? 'bg-blue-50 border-blue-200' :
              dominantEmotion.color === 'red' ? 'bg-red-50 border-red-200' :
              dominantEmotion.color === 'purple' ? 'bg-purple-50 border-purple-200' :
              dominantEmotion.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              dominantEmotion.color === 'green' ? 'bg-green-50 border-green-200' :
              dominantEmotion.color === 'pink' ? 'bg-pink-50 border-pink-200' :
              dominantEmotion.color === 'indigo' ? 'bg-indigo-50 border-indigo-200' :
              dominantEmotion.color === 'brown' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'
            } rounded-xl shadow-lg p-6 border-2`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{dominantEmotion.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Dominant Emotion: {dominantEmotion.name}</h3>
                  <p className="text-lg text-gray-600">{toneDescription}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`${
                    dominantEmotion.color === 'yellow' ? 'bg-yellow-500' :
                    dominantEmotion.color === 'blue' ? 'bg-blue-500' :
                    dominantEmotion.color === 'red' ? 'bg-red-500' :
                    dominantEmotion.color === 'purple' ? 'bg-purple-500' :
                    dominantEmotion.color === 'orange' ? 'bg-orange-500' :
                    dominantEmotion.color === 'green' ? 'bg-green-500' :
                    dominantEmotion.color === 'pink' ? 'bg-pink-500' :
                    dominantEmotion.color === 'indigo' ? 'bg-indigo-500' :
                    dominantEmotion.color === 'brown' ? 'bg-amber-500' :
                    'bg-gray-500'
                  } h-4 rounded-full transition-all`}
                  style={{ width: `${dominantEmotion.percentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {dominantEmotion.percentage}% confidence | {dominantEmotion.score} keyword{dominantEmotion.score !== 1 ? 's' : ''} detected
              </p>
            </div>
          )}

          {/* All Emotions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-pink-800 mb-4">Emotion Breakdown</h3>
            <div className="space-y-4">
              {emotionScores.map((emotion, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emotion.icon}</span>
                      <span className="font-bold text-gray-900">{emotion.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{emotion.percentage}%</span>
                      <span className="text-sm text-gray-600 ml-2">({emotion.score} keywords)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${
                        emotion.color === 'yellow' ? 'bg-yellow-500' :
                        emotion.color === 'blue' ? 'bg-blue-500' :
                        emotion.color === 'red' ? 'bg-red-500' :
                        emotion.color === 'purple' ? 'bg-purple-500' :
                        emotion.color === 'orange' ? 'bg-orange-500' :
                        emotion.color === 'green' ? 'bg-green-500' :
                        emotion.color === 'pink' ? 'bg-pink-500' :
                        emotion.color === 'indigo' ? 'bg-indigo-500' :
                        emotion.color === 'brown' ? 'bg-amber-500' :
                        'bg-gray-500'
                      } h-3 rounded-full transition-all`}
                      style={{ width: `${emotion.percentage}%` }}
                    ></div>
                  </div>
                  {emotion.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {emotion.keywords.slice(0, 5).map((keyword, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {keyword}
                        </span>
                      ))}
                      {emotion.keywords.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{emotion.keywords.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-pink-800 mb-4">Analysis Summary</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Dominant Emotion</p>
                <p className="text-lg font-bold text-gray-900">
                  {dominantEmotion?.icon} {dominantEmotion?.name}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overall Tone</p>
                <p className="text-lg font-bold text-gray-900">{toneDescription}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Emotions Detected</p>
                <p className="text-lg font-bold text-gray-900">{emotionScores.length} different emotion{emotionScores.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-6 border-2 border-pink-200">
            <h3 className="text-lg font-bold text-pink-800 mb-2">Share Your Analysis</h3>
            <p className="text-sm text-gray-700 mb-4">
              Perfect for analyzing comments, emails, or social media posts!
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const text = `Emotion Analysis Results:\nDominant: ${dominantEmotion?.icon} ${dominantEmotion?.name} (${dominantEmotion?.percentage}%)\nTone: ${toneDescription}\n\nTry it: https://ainews.com/tools/ai-text-emotion-analyzer`;
                  navigator.clipboard.writeText(text);
                  alert('Analysis summary copied to clipboard!');
                }}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Copy Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AITextEmotionAnalyzerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-pink-800">What is an AI Text Emotion Analyzer?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Text Emotion Analyzer</strong> is a heuristic tool that analyzes text to detect emotional tones 
          and sentiment. Using keyword-based analysis, it counts emotional keywords and categorizes text into different 
          emotion categories (happy, sad, angry, fearful, surprised, etc.). Perfect for creators analyzing comments, 
          emails, or social media posts to understand the emotional tone of their audience.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-pink-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Text Emotion Analyzer uses heuristic keyword analysis to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Scan for keywords:</strong> Analyzes text for emotional keywords and emojis</li>
          <li><strong>Count matches:</strong> Counts occurrences of emotion-related words</li>
          <li><strong>Calculate scores:</strong> Assigns scores and percentages to each emotion</li>
          <li><strong>Identify dominant emotion:</strong> Determines the primary emotion detected</li>
          <li><strong>Provide breakdown:</strong> Shows all detected emotions with visualizations</li>
          <li><strong>Generate summary:</strong> Creates a tone description and analysis summary</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-pink-800">Emotions Detected</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(emotionCategories).map(([id, emotion]) => (
            <div key={id} className={`${
              emotion.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              emotion.color === 'blue' ? 'bg-blue-50 border-blue-200' :
              emotion.color === 'red' ? 'bg-red-50 border-red-200' :
              emotion.color === 'purple' ? 'bg-purple-50 border-purple-200' :
              emotion.color === 'orange' ? 'bg-orange-50 border-orange-200' :
              emotion.color === 'green' ? 'bg-green-50 border-green-200' :
              emotion.color === 'pink' ? 'bg-pink-50 border-pink-200' :
              emotion.color === 'indigo' ? 'bg-indigo-50 border-indigo-200' :
              emotion.color === 'brown' ? 'bg-amber-50 border-amber-200' :
              'bg-gray-50 border-gray-200'
            } p-4 rounded-lg border-2`}>
              <div className="text-3xl mb-2">{emotion.icon}</div>
              <h3 className={`font-bold mb-2 ${
                emotion.color === 'yellow' ? 'text-yellow-800' :
                emotion.color === 'blue' ? 'text-blue-800' :
                emotion.color === 'red' ? 'text-red-800' :
                emotion.color === 'purple' ? 'text-purple-800' :
                emotion.color === 'orange' ? 'text-orange-800' :
                emotion.color === 'green' ? 'text-green-800' :
                emotion.color === 'pink' ? 'text-pink-800' :
                emotion.color === 'indigo' ? 'text-indigo-800' :
                emotion.color === 'brown' ? 'text-amber-800' :
                'text-gray-800'
              }`}>{emotion.name}</h3>
              <p className="text-xs text-gray-700">
                {emotion.keywords.length} keywords
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-pink-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-lg border-l-4 border-pink-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Analyze Comments:</strong> Understand the emotional tone of user comments on your content</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Email Analysis:</strong> Analyze email tone before responding to ensure appropriate tone</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Social Media:</strong> Analyze posts and comments to understand audience sentiment</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Content Creation:</strong> Understand emotional impact of your content</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Quick Insights:</strong> Get instant emotion analysis without complex AI APIs</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Use longer text:</strong> More text provides better emotion detection accuracy</li>
          <li><strong>Include context:</strong> Context helps identify emotional keywords better</li>
          <li><strong>Check multiple emotions:</strong> Text often contains mixed emotions</li>
          <li><strong>Review keywords:</strong> See which keywords triggered each emotion</li>
          <li><strong>Use for trends:</strong> Analyze multiple comments to see overall sentiment</li>
          <li><strong>Compare results:</strong> Analyze different versions of text to see tone changes</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-pink-800">Popular Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-pink-200">
            <h3 className="font-bold text-pink-800 mb-3">✅ For Content Creators</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Analyze comment sentiment</li>
              <li>• Understand audience emotions</li>
              <li>• Identify happy vs angry responses</li>
              <li>• Track emotional trends</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-rose-200">
            <h3 className="font-bold text-rose-800 mb-3">✅ For Business</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Analyze customer emails</li>
              <li>• Understand feedback tone</li>
              <li>• Identify urgent vs positive emails</li>
              <li>• Sentiment analysis</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-pink-100 to-rose-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-pink-800">How It Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          This tool uses <strong>heuristic keyword analysis</strong>, meaning it:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li>Scans text for emotion-related keywords (happy, sad, angry, etc.)</li>
          <li>Counts occurrences of each keyword category</li>
          <li>Calculates percentages based on total matches</li>
          <li>Identifies the dominant emotion</li>
          <li>Shows visual breakdown of all detected emotions</li>
        </ul>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Note:</strong> This is a simple heuristic analysis based on keyword matching. For more advanced 
          sentiment analysis, consider using AI models with natural language understanding.
        </p>
      </section>
    </>
  );
}

export default AITextEmotionAnalyzer;

