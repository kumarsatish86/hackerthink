'use client';

import { useState } from 'react';
import { FaBook, FaSearch } from 'react-icons/fa';

interface Term {
  term: string;
  definition: string;
  category: string;
}

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const terms: Term[] = [
    { term: 'Artificial Intelligence (AI)', definition: 'The simulation of human intelligence by machines, particularly computer systems.', category: 'General' },
    { term: 'Machine Learning (ML)', definition: 'A subset of AI that enables systems to learn from data without explicit programming.', category: 'AI' },
    { term: 'Neural Network', definition: 'A computing system inspired by biological neural networks, used in deep learning.', category: 'AI' },
    { term: 'Deep Learning', definition: 'A subset of machine learning using neural networks with multiple layers.', category: 'AI' },
    { term: 'Natural Language Processing (NLP)', definition: 'AI field focusing on interaction between computers and human language.', category: 'AI' },
    { term: 'Large Language Model (LLM)', definition: 'AI models trained on vast amounts of text data to understand and generate human language.', category: 'AI' },
    { term: 'Prompt Engineering', definition: 'Technique of crafting inputs to AI systems to achieve desired outputs.', category: 'AI' },
    { term: 'Transformer', definition: 'A deep learning model architecture that revolutionized NLP.', category: 'AI' },
    { term: 'GPT (Generative Pre-trained Transformer)', definition: 'A type of LLM developed by OpenAI, capable of text generation.', category: 'AI' },
    { term: 'Fine-tuning', definition: 'Training a pre-trained model on specific data to improve performance on particular tasks.', category: 'AI' },
    { term: 'Token', definition: 'The smallest unit of input/output in language models, often a word or subword.', category: 'AI' },
    { term: 'Embedding', definition: 'A numerical representation of text that captures semantic meaning.', category: 'AI' },
  ];

  const filteredTerms = terms.filter(term =>
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-b from-red-50 via-white to-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <FaBook className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            AI Glossary
          </h1>
          <p className="text-xl text-center text-red-100 max-w-3xl mx-auto">
            Definitions of key AI and technology terms
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Terms List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-4">
          {filteredTerms.map((term, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-600">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{term.term}</h3>
                  <p className="text-gray-700">{term.definition}</p>
                </div>
                <span className="ml-4 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                  {term.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

