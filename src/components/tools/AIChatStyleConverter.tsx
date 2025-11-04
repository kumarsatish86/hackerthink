"use client";

import React, { useState } from 'react';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  example: string;
}

const styleOptions: StyleOption[] = [
  {
    id: 'formal',
    name: 'Formal',
    description: 'Professional, business-like tone with proper grammar',
    icon: '👔',
    color: 'blue',
    example: 'I would like to request your assistance with this matter.'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed, friendly, everyday conversation style',
    icon: '😊',
    color: 'green',
    example: 'Hey! Can you help me out with this?'
  },
  {
    id: 'poetic',
    name: 'Poetic',
    description: 'Flowery, artistic, metaphorical language',
    icon: '🌹',
    color: 'purple',
    example: 'Like a gentle breeze through autumn leaves, your words dance...'
  },
  {
    id: 'sarcastic',
    name: 'Sarcastic',
    description: 'Witty, ironic, with a hint of humor',
    icon: '😏',
    color: 'orange',
    example: 'Oh, brilliant! Just what I needed. *eye roll*'
  },
  {
    id: 'concise',
    name: 'Concise',
    description: 'Short, direct, to the point',
    icon: '⚡',
    color: 'red',
    example: 'Help needed. ASAP.'
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    description: 'Energetic, excited, full of energy',
    icon: '🎉',
    color: 'yellow',
    example: 'OMG! This is AMAZING! I\'m so excited about this!!!'
  },
  {
    id: 'scientific',
    name: 'Scientific',
    description: 'Technical, precise, data-driven language',
    icon: '🔬',
    color: 'indigo',
    example: 'Based on empirical evidence and quantitative analysis...'
  },
  {
    id: 'humorous',
    name: 'Humorous',
    description: 'Funny, lighthearted, entertaining',
    icon: '😂',
    color: 'pink',
    example: 'Well, that\'s one way to do it! *chuckles*'
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'Theatrical, exaggerated, intense',
    icon: '🎭',
    color: 'rose',
    example: 'This is the MOST IMPORTANT moment of my ENTIRE EXISTENCE!'
  },
  {
    id: 'mysterious',
    name: 'Mysterious',
    description: 'Cryptic, enigmatic, intriguing',
    icon: '🔮',
    color: 'violet',
    example: 'Some secrets are best left untold... or are they?'
  },
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Warm, approachable, welcoming',
    icon: '🤗',
    color: 'teal',
    example: 'Hey there! I\'d love to help you with that. Let\'s figure this out together!'
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Business-appropriate, polished, corporate',
    icon: '💼',
    color: 'slate',
    example: 'I would appreciate the opportunity to discuss this matter further.'
  }
];

function convertTextStyle(text: string, style: StyleOption): string {
  if (!text.trim()) return '';

  // This is a client-side conversion simulation
  // In a real implementation, this would call an API
  
  const conversions: Record<string, (text: string) => string> = {
    formal: (t) => {
      return t
        .replace(/\b(can't|cannot)\b/gi, 'is unable to')
        .replace(/\b(won't|will not)\b/gi, 'shall not')
        .replace(/\b(don't|do not)\b/gi, 'does not')
        .replace(/\b(you're|you are)\b/gi, 'one is')
        .replace(/\b(you)\b/gi, 'one')
        .replace(/\b(gonna|going to)\b/gi, 'intending to')
        + ' I trust this meets with your approval.';
    },
    casual: (t) => {
      return t
        .replace(/\b(cannot)\b/gi, "can't")
        .replace(/\b(shall not)\b/gi, "won't")
        .replace(/\b(does not)\b/gi, "doesn't")
        .replace(/\b(one)\b/gi, 'you')
        .replace(/\b(please)\b/gi, 'pls')
        + ' Hope that helps!';
    },
    poetic: (t) => {
      const poeticStart = 'Like a gentle whisper in the wind, ';
      const poeticEnd = ' Such is the nature of our shared understanding.';
      return poeticStart + t.toLowerCase() + poeticEnd;
    },
    sarcastic: (t) => {
      return t
        .replace(/\./g, '... *obviously*')
        .replace(/\b(please|thank you)\b/gi, '*sigh* sure')
        + ' *eye roll*';
    },
    concise: (t) => {
      // Remove filler words and shorten
      return t
        .replace(/\b(very|really|quite|rather|pretty|extremely)\b/gi, '')
        .replace(/\b(please|kindly|thank you|thanks)\b/gi, '')
        .replace(/\b(I would like to|I want to|I need to)\b/gi, 'Need')
        .replace(/\b(can you|could you|would you)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    },
    enthusiastic: (t) => {
      return 'OMG! ' + t.toUpperCase().replace(/\./g, '!!!') + ' This is SO AMAZING!!! 🎉🎉🎉';
    },
    scientific: (t) => {
      return 'Based on empirical analysis and quantitative assessment, ' + t 
        + ' Further research indicates that this hypothesis warrants additional investigation.';
    },
    humorous: (t) => {
      return t + ' *chuckles* Well, that\'s one way to put it! 😂';
    },
    dramatic: (t) => {
      return t.toUpperCase() + ' This is THE MOST IMPORTANT thing you\'ve EVER heard!!! *dramatic pause*';
    },
    mysterious: (t) => {
      return 'The shadows whisper... ' + t + ' But some secrets are better left untold. 🔮';
    },
    friendly: (t) => {
      return 'Hey there! ' + t + ' Hope that helps! Let me know if you need anything else! 😊';
    },
    professional: (t) => {
      return 'I would like to take this opportunity to address the following: ' + t 
        + ' I trust this meets your requirements and look forward to your feedback.';
    }
  };

  const converter = conversions[style.id];
  if (converter) {
    return converter(text);
  }

  return text;
}

export function AIChatStyleConverter() {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [convertedText, setConvertedText] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [showExample, setShowExample] = useState(false);

  const handleConvert = () => {
    if (!inputText.trim()) {
      alert('Please enter some text to convert');
      return;
    }

    if (!selectedStyle) {
      alert('Please select a style');
      return;
    }

    setIsConverting(true);

    setTimeout(() => {
      const style = styleOptions.find(s => s.id === selectedStyle);
      if (style) {
        const converted = convertTextStyle(inputText, style);
        setConvertedText(converted);
      }
      setIsConverting(false);
    }, 500);
  };

  const handleCopy = () => {
    if (convertedText) {
      navigator.clipboard.writeText(convertedText);
      alert('Converted text copied to clipboard!');
    }
  };

  const handleClear = () => {
    setInputText('');
    setConvertedText('');
    setSelectedStyle('');
  };

  const handleLoadExample = () => {
    const example = 'Can you help me understand how artificial intelligence works?';
    setInputText(example);
  };

  const selectedStyleOption = styleOptions.find(s => s.id === selectedStyle);

  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-orange-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 9h8M8 13h6m-5 4h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v9a2 2 0 002 2z" stroke="#C2410C" strokeWidth="2" fill="none"/>
        </svg>
        AI Chat Style Converter
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-semibold text-orange-700">
              Enter Your Text
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLoadExample}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
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
            placeholder="Paste or type any text here..."
            rows={6}
            className="w-full p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-y"
          />
          <p className="text-xs text-gray-600 mt-2">
            {inputText.length} characters
          </p>
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold text-orange-700">
            Select AI Personality / Style
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {styleOptions.map(style => (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyle(style.id);
                  setShowExample(false);
                }}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedStyle === style.id
                    ? `border-${style.color}-500 bg-${style.color}-50`
                    : 'border-orange-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{style.icon}</span>
                  <span className={`font-bold text-sm ${
                    selectedStyle === style.id ? `text-${style.color}-800` : 'text-gray-800'
                  }`}>
                    {style.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{style.description}</p>
                {selectedStyle === style.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExample(!showExample);
                    }}
                    className="mt-2 text-xs text-orange-600 hover:text-orange-800"
                  >
                    {showExample ? 'Hide' : 'Show'} Example
                  </button>
                )}
              </button>
            ))}
          </div>

          {selectedStyle && showExample && selectedStyleOption && (
            <div className={`mt-4 p-4 bg-${selectedStyleOption.color}-50 border-2 border-${selectedStyleOption.color}-200 rounded-lg`}>
              <p className="text-sm font-semibold text-gray-700 mb-2">Example:</p>
              <p className="text-sm text-gray-800 italic">"{selectedStyleOption.example}"</p>
            </div>
          )}
        </div>

        <button
          onClick={handleConvert}
          disabled={!inputText.trim() || !selectedStyle || isConverting}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            inputText.trim() && selectedStyle && !isConverting
              ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 hover:scale-105 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isConverting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Converting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 9h8M8 13h6m-5 4h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v9a2 2 0 002 2z"/>
              </svg>
              Convert to {selectedStyleOption?.name || 'Selected Style'}
            </span>
          )}
        </button>
      </div>

      {convertedText && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-orange-800">
                Converted Text ({selectedStyleOption?.name || 'Selected Style'})
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedStyleOption?.description}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy
            </button>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{convertedText}</p>
          </div>

          <div className="mt-4 p-3 bg-orange-100 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Character Count:</strong> {convertedText.length} characters
            </p>
          </div>
        </div>
      )}

      {/* Comparison Section */}
      {convertedText && inputText && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-orange-800 mb-4">Before vs After</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Original Text</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-800 text-sm">{inputText}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                {selectedStyleOption?.icon} {selectedStyleOption?.name} Version
              </h4>
              <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
                <p className="text-gray-800 text-sm">{convertedText}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIChatStyleConverterInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">What is an AI Chat Style Converter?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Chat Style Converter</strong> is a fun and viral tool that rewrites any text in different AI 
          personality styles. Paste any text and transform it into formal, poetic, sarcastic, concise, or any other 
          personality style. Perfect for creating shareable content like "ChatGPT vs SarcasticGPT" comparisons that 
          go viral on social media platforms like X (Twitter) and Threads.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Chat Style Converter transforms text by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Analyzing input text:</strong> Understanding the original message and context</li>
          <li><strong>Applying style rules:</strong> Converting text according to selected personality</li>
          <li><strong>Maintaining meaning:</strong> Preserving the core message while changing tone</li>
          <li><strong>Adding personality:</strong> Injecting style-specific language and expressions</li>
          <li><strong>Creating comparisons:</strong> Showing before/after side-by-side for easy sharing</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Available AI Personalities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {styleOptions.map(style => (
            <div key={style.id} className={`bg-${style.color}-50 p-5 rounded-lg border-2 border-${style.color}-200`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{style.icon}</span>
                <h3 className={`font-bold text-${style.color}-800`}>{style.name}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">{style.description}</p>
              <p className="text-xs text-gray-600 italic">"{style.example}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Why This Tool Goes Viral</h2>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-l-4 border-orange-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Entertainment Value:</strong> Fun comparisons like "ChatGPT vs SarcasticGPT" are highly shareable</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Social Media Ready:</strong> Perfect for X (Twitter), Threads, and other platforms</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Viral Format:</strong> Before/after comparisons naturally encourage sharing</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Relatable Content:</strong> Everyone can relate to different communication styles</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Quick Results:</strong> Instant conversions make it easy to create multiple variations</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Start with clear text:</strong> Well-written input produces better style conversions</li>
          <li><strong>Try multiple styles:</strong> Convert the same text to different styles for comparison</li>
          <li><strong>Use for content creation:</strong> Great for generating social media posts in different tones</li>
          <li><strong>Share comparisons:</strong> Before/after screenshots are perfect for social media</li>
          <li><strong>Experiment:</strong> Try different types of text (formal, casual, technical) with each style</li>
          <li><strong>Have fun:</strong> This tool is designed for entertainment and creative expression</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Popular Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3">✅ Social Media Content</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Create viral "ChatGPT vs SarcasticGPT" posts</li>
              <li>• Generate funny style comparisons</li>
              <li>• Entertain your followers with conversions</li>
              <li>• Share before/after screenshots</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3">✅ Content Creation</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Rewrite content in different tones</li>
              <li>• Generate multiple style variations</li>
              <li>• Create engaging social media posts</li>
              <li>• Experiment with communication styles</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Enter your text</strong> (or use the example button)</li>
          <li><strong>Select a personality style</strong> from the available options</li>
          <li><strong>Click "Convert"</strong> to transform your text</li>
          <li><strong>View the converted text</strong> and compare with original</li>
          <li><strong>Copy the result</strong> for sharing or use</li>
          <li><strong>Try different styles</strong> on the same text for fun comparisons</li>
          <li><strong>Share on social media</strong> for viral content!</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Create side-by-side comparisons of the same text in different styles (like "ChatGPT vs SarcasticGPT") and share them on X or Threads for maximum engagement!
        </p>
      </section>
    </>
  );
}

export default AIChatStyleConverter;

