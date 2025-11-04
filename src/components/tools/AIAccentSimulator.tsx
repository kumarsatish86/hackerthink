"use client";

import React, { useState } from 'react';

interface Accent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  example: string;
}

const accents: Accent[] = [
  {
    id: 'us',
    name: 'American (US)',
    description: 'Standard American English pronunciation',
    icon: '🇺🇸',
    color: 'blue',
    example: 'Hello, how are you? → "Huh-LOH, how ar yoo?"'
  },
  {
    id: 'uk',
    name: 'British (UK)',
    description: 'Standard British English pronunciation',
    icon: '🇬🇧',
    color: 'red',
    example: 'Hello, how are you? → "HEH-loh, how ah yoo?"'
  },
  {
    id: 'australian',
    name: 'Australian',
    description: 'Australian English pronunciation',
    icon: '🇦🇺',
    color: 'green',
    example: 'Hello, how are you? → "Huh-LOH, how ah yew?"'
  },
  {
    id: 'indian',
    name: 'Indian',
    description: 'Indian English pronunciation',
    icon: '🇮🇳',
    color: 'orange',
    example: 'Hello, how are you? → "HEH-loh, how ar yoo?"'
  },
  {
    id: 'irish',
    name: 'Irish',
    description: 'Irish English pronunciation',
    icon: '🇮🇪',
    color: 'emerald',
    example: 'Hello, how are you? → "Huh-LOH, how ar yeh?"'
  },
  {
    id: 'scottish',
    name: 'Scottish',
    description: 'Scottish English pronunciation',
    icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    color: 'indigo',
    example: 'Hello, how are you? → "HEH-loh, hoo ar yoo?"'
  },
  {
    id: 'canadian',
    name: 'Canadian',
    description: 'Canadian English pronunciation',
    icon: '🇨🇦',
    color: 'red',
    example: 'Hello, how are you? → "Huh-LOH, how ar yoo?"'
  },
  {
    id: 'south-african',
    name: 'South African',
    description: 'South African English pronunciation',
    icon: '🇿🇦',
    color: 'yellow',
    example: 'Hello, how are you? → "Huh-LOH, how ah yoo?"'
  }
];

function convertToAccent(text: string, accentId: string): string {
  if (!text.trim()) return '';

  const lowerText = text.toLowerCase();
  let result = text;

  switch (accentId) {
    case 'us':
      // American: Flatter vowels, r's are pronounced
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAD-er';
          if (match.toLowerCase() === 'bottle') return 'BAH-dl';
          if (match.toLowerCase() === 'little') return 'LIH-dl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'huh-LOH';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ar';
          if (match.toLowerCase() === 'you') return 'yoo';
          return match;
        });
      break;

    case 'uk':
      // British: Non-rhotic, different vowel sounds
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAW-tuh';
          if (match.toLowerCase() === 'bottle') return 'BAH-tl';
          if (match.toLowerCase() === 'little') return 'LIH-tl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'HEH-loh';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ah';
          if (match.toLowerCase() === 'you') return 'yoo';
          return match;
        })
        .replace(/r(?=\s|$)/gi, '');
      break;

    case 'australian':
      // Australian: Rising intonation, different vowel sounds
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WOD-uh';
          if (match.toLowerCase() === 'bottle') return 'BAH-dl';
          if (match.toLowerCase() === 'little') return 'LIH-dl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'huh-LOH';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ah';
          if (match.toLowerCase() === 'you') return 'yew';
          return match;
        });
      break;

    case 'indian':
      // Indian: Rolled r's, different stress patterns
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAH-tur';
          if (match.toLowerCase() === 'bottle') return 'BAH-tul';
          if (match.toLowerCase() === 'little') return 'LIH-tul';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'HEH-loh';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ar';
          if (match.toLowerCase() === 'you') return 'yoo';
          return match;
        });
      break;

    case 'irish':
      // Irish: Different vowel sounds, rhotic
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAH-tur';
          if (match.toLowerCase() === 'bottle') return 'BAH-tl';
          if (match.toLowerCase() === 'little') return 'LIH-tl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'huh-LOH';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ar';
          if (match.toLowerCase() === 'you') return 'yeh';
          return match;
        });
      break;

    case 'scottish':
      // Scottish: Different vowel sounds, rolled r's
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAH-tur';
          if (match.toLowerCase() === 'bottle') return 'BAH-tl';
          if (match.toLowerCase() === 'little') return 'LIH-tl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'HEH-loh';
          if (match.toLowerCase() === 'how') return 'hoo';
          if (match.toLowerCase() === 'are') return 'ar';
          if (match.toLowerCase() === 'you') return 'yoo';
          return match;
        });
      break;

    case 'canadian':
      // Canadian: Similar to US but with some differences
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAD-er';
          if (match.toLowerCase() === 'bottle') return 'BAH-dl';
          if (match.toLowerCase() === 'little') return 'LIH-dl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOOT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'huh-LOH';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ar';
          if (match.toLowerCase() === 'you') return 'yoo';
          return match;
        });
      break;

    case 'south-african':
      // South African: Different vowel sounds
      result = text
        .replace(/\b(water|bottle|little)\b/gi, (match) => {
          if (match.toLowerCase() === 'water') return 'WAH-tuh';
          if (match.toLowerCase() === 'bottle') return 'BAH-tl';
          if (match.toLowerCase() === 'little') return 'LIH-tl';
          return match;
        })
        .replace(/\b(about|house|out)\b/gi, (match) => {
          if (match.toLowerCase() === 'about') return 'uh-BOWT';
          if (match.toLowerCase() === 'house') return 'hows';
          if (match.toLowerCase() === 'out') return 'owt';
          return match;
        })
        .replace(/\b(hello|how|are|you)\b/gi, (match) => {
          if (match.toLowerCase() === 'hello') return 'huh-LOH';
          if (match.toLowerCase() === 'how') return 'how';
          if (match.toLowerCase() === 'are') return 'ah';
          if (match.toLowerCase() === 'you') return 'yoo';
          return match;
        });
      break;

    default:
      result = text;
  }

  // Add phonetic markers for common patterns
  result = result.replace(/\b(the)\b/gi, (match) => {
    if (accentId === 'uk' || accentId === 'australian' || accentId === 'south-african') {
      return 'thuh';
    }
    return 'thuh';
  });

  return result;
}

export function AIAccentSimulator() {
  const [inputText, setInputText] = useState('');
  const [selectedAccents, setSelectedAccents] = useState<string[]>(['us', 'uk', 'australian', 'indian']);
  const [results, setResults] = useState<Record<string, string>>({});
  const [isConverting, setIsConverting] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleConvert = () => {
    if (!inputText.trim()) {
      alert('Please enter some text to convert');
      return;
    }

    if (selectedAccents.length === 0) {
      alert('Please select at least one accent');
      return;
    }

    setIsConverting(true);

    setTimeout(() => {
      const converted: Record<string, string> = {};
      selectedAccents.forEach(accentId => {
        converted[accentId] = convertToAccent(inputText, accentId);
      });
      setResults(converted);
      setIsConverting(false);
      setShowResults(true);
    }, 600);
  };

  const handleAccentToggle = (accentId: string) => {
    setSelectedAccents(prev => {
      if (prev.includes(accentId)) {
        return prev.filter(id => id !== accentId);
      } else {
        return [...prev, accentId];
      }
    });
  };

  const handleCopy = (accentId: string) => {
    const text = results[accentId];
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Converted text copied to clipboard!');
    }
  };

  const handleClear = () => {
    setInputText('');
    setSelectedAccents(['us', 'uk', 'australian', 'indian']);
    setResults({});
    setShowResults(false);
  };

  const handleLoadExample = () => {
    const examples = [
      'Hello, how are you doing today?',
      'I would like a bottle of water, please.',
      'The weather is beautiful outside.',
      'Can you help me with this project?',
      'That sounds absolutely fantastic!'
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInputText(randomExample);
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-orange-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" stroke="#C2410C" strokeWidth="2" fill="none"/>
        </svg>
        AI Accent Simulator (Text-based)
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-semibold text-orange-700">
              Enter Text to Convert
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
            placeholder="e.g., Hello, how are you doing today?"
            rows={4}
            className="w-full p-4 border-2 border-orange-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 resize-y"
          />
          <p className="text-xs text-gray-600 mt-2">
            {inputText.length} characters
          </p>
        </div>

        {/* Accent Selection */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold text-orange-700">
            Select Accents to Compare
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {accents.map(accent => (
              <button
                key={accent.id}
                onClick={() => handleAccentToggle(accent.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                  selectedAccents.includes(accent.id)
                    ? `border-${accent.color}-500 bg-${accent.color}-50`
                    : 'border-orange-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{accent.icon}</span>
                  <div>
                    <div className={`font-bold text-sm ${
                      selectedAccents.includes(accent.id) ? `text-${accent.color}-800` : 'text-gray-900'
                    }`}>
                      {accent.name}
                    </div>
                    <div className="text-xs text-gray-600">{accent.description}</div>
                  </div>
                </div>
                {selectedAccents.includes(accent.id) && (
                  <p className="text-xs text-gray-600 italic line-clamp-2">{accent.example}</p>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {selectedAccents.length} accent{selectedAccents.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <button
          onClick={handleConvert}
          disabled={!inputText.trim() || selectedAccents.length === 0 || isConverting}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            inputText.trim() && selectedAccents.length > 0 && !isConverting
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Convert to Accents
            </span>
          )}
        </button>
      </div>

      {showResults && Object.keys(results).length > 0 && (
        <div className="space-y-6">
          {/* Original Text */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Original Text</h3>
            <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">{inputText}</p>
          </div>

          {/* Accent Results */}
          <div className="grid md:grid-cols-2 gap-4">
            {selectedAccents.map(accentId => {
              const accent = accents.find(a => a.id === accentId);
              const result = results[accentId];
              if (!accent || !result) return null;

              return (
                <div
                  key={accentId}
                  className={`bg-white rounded-lg shadow-md p-6 border-2 border-${accent.color}-200`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{accent.icon}</span>
                      <div>
                        <h3 className={`text-lg font-bold text-${accent.color}-800`}>
                          {accent.name}
                        </h3>
                        <p className="text-xs text-gray-600">{accent.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(accentId)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Copy"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                      </svg>
                    </button>
                  </div>
                  <div className={`bg-${accent.color}-50 rounded-lg p-4 border border-${accent.color}-200`}>
                    <p className="text-gray-800 font-medium leading-relaxed">{result}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Phonetic representation (text-based)
                  </p>
                </div>
              );
            })}
          </div>

          {/* Share Section */}
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6 border-2 border-orange-200">
            <h3 className="text-lg font-bold text-orange-800 mb-2">Share Your Results</h3>
            <p className="text-sm text-gray-700 mb-4">
              Fun way to see how different accents might pronounce your text!
            </p>
            <button
              onClick={() => {
                const text = `Original: ${inputText}\n\n${selectedAccents.map(accentId => {
                  const accent = accents.find(a => a.id === accentId);
                  const result = results[accentId];
                  return `${accent?.icon} ${accent?.name}: ${result}`;
                }).join('\n')}\n\nTry it: https://ainews.com/tools/ai-accent-simulator`;
                navigator.clipboard.writeText(text);
                alert('Results copied to clipboard!');
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Copy All Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIAccentSimulatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">What is an AI Accent Simulator?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Accent Simulator</strong> is a fun, text-based tool that converts sentences into phonetic 
          representations showing how they might be pronounced in different accents. Enter a sentence and see how 
          it would sound phonetically in US, UK, Indian, Australian, Irish, Scottish, Canadian, or South African 
          accents. Perfect for fun conversations and viral content like "How would AI pronounce this?"
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Accent Simulator converts text by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Analyzing text:</strong> Understanding the words and phrases</li>
          <li><strong>Applying accent rules:</strong> Converting text to phonetic representations</li>
          <li><strong>Comparing accents:</strong> Showing how different accents would pronounce it</li>
          <li><strong>Displaying results:</strong> Presenting phonetic spellings side-by-side</li>
          <li><strong>Enabling sharing:</strong> Allowing you to copy and share results</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Supported Accents</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accents.map(accent => (
            <div key={accent.id} className={`bg-${accent.color}-50 p-4 rounded-lg border-2 border-${accent.color}-200`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{accent.icon}</span>
                <h3 className={`font-bold text-${accent.color}-800`}>{accent.name}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">{accent.description}</p>
              <p className="text-xs text-gray-600 italic">"{accent.example}"</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border-l-4 border-orange-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Fun & Entertaining:</strong> See how different accents would pronounce your text</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Viral Content:</strong> Perfect for social media and shareable content</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Educational:</strong> Learn about different accent patterns and pronunciations</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Quick Comparison:</strong> Compare multiple accents side-by-side</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Shareable:</strong> Copy and share results with friends</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Use clear text:</strong> Simple, clear sentences work best</li>
          <li><strong>Try different phrases:</strong> Experiment with various sentences</li>
          <li><strong>Compare multiple accents:</strong> Select several accents to see differences</li>
          <li><strong>Use examples:</strong> Try the example button for inspiration</li>
          <li><strong>Share results:</strong> Copy and share fun comparisons</li>
          <li><strong>Have fun:</strong> This tool is designed for entertainment and learning</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-orange-200">
            <h3 className="font-bold text-orange-800 mb-3">✅ Social Media</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Create viral content</li>
              <li>• Share fun comparisons</li>
              <li>• Engage with followers</li>
              <li>• Generate conversation</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3">✅ Education</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Learn accent differences</li>
              <li>• Understand pronunciation</li>
              <li>• Compare accents</li>
              <li>• Language learning</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-orange-100 to-red-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-orange-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Enter your text</strong> (e.g., "Hello, how are you doing today?")</li>
          <li><strong>Select accents</strong> to compare (US, UK, Australian, Indian, etc.)</li>
          <li><strong>Click "Convert to Accents"</strong> to see phonetic representations</li>
          <li><strong>Review results</strong> showing how each accent would pronounce it</li>
          <li><strong>Copy individual results</strong> or copy all for sharing</li>
          <li><strong>Share on social media</strong> for viral content!</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Note:</strong> This is a text-based phonetic representation tool. Results are approximations 
          for entertainment and educational purposes. Actual pronunciation may vary based on regional 
          variations within each accent.
        </p>
      </section>
    </>
  );
}

export default AIAccentSimulator;

