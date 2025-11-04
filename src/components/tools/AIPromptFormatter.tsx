"use client";

import React, { useState } from 'react';

interface FormatOptions {
  style: 'structured' | 'bullet' | 'numbered' | 'paragraph' | 'code';
  addHeaders: boolean;
  capitalizeHeaders: boolean;
  indentLevel: number;
  lineBreaks: boolean;
  highlightKeywords: boolean;
}

function formatPrompt(rawPrompt: string, options: FormatOptions): string {
  let formatted = rawPrompt.trim();
  
  if (!formatted) return '';

  // Split by common separators if they exist
  const separators = ['\n\n', '\n', '. ', '; ', '|'];
  let sections: string[] = [];
  
  // Try to detect structure
  if (formatted.includes('\n\n')) {
    sections = formatted.split('\n\n').filter(s => s.trim());
  } else if (formatted.includes('\n')) {
    sections = formatted.split('\n').filter(s => s.trim());
  } else if (formatted.includes('|')) {
    sections = formatted.split('|').filter(s => s.trim());
  } else {
    sections = formatted.split(/[.!?]\s+/).filter(s => s.trim());
  }

  // Clean and normalize sections
  sections = sections.map(s => s.trim()).filter(s => s.length > 0);

  switch (options.style) {
    case 'structured':
      return formatStructured(sections, options);
    case 'bullet':
      return formatBulletPoints(sections, options);
    case 'numbered':
      return formatNumbered(sections, options);
    case 'paragraph':
      return formatParagraph(sections, options);
    case 'code':
      return formatCode(sections, options);
    default:
      return formatted;
  }
}

function formatStructured(sections: string[], options: FormatOptions): string {
  let result = '';
  const indent = '  '.repeat(options.indentLevel);
  
  sections.forEach((section, index) => {
    const cleaned = cleanSection(section);
    
    // Detect headers (lines that are short and end with colon or are all caps)
    if (options.addHeaders && (cleaned.endsWith(':') || cleaned.length < 50)) {
      const header = options.capitalizeHeaders 
        ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase()
        : cleaned;
      result += `${index > 0 ? '\n' : ''}${header}\n${indent}`;
    } else {
      // Format as bullet or numbered sub-item
      const bullet = index + 1;
      result += `${index > 0 ? '\n' : ''}${indent}${bullet}. ${cleaned}`;
    }
  });
  
  return result;
}

function formatBulletPoints(sections: string[], options: FormatOptions): string {
  const indent = '  '.repeat(options.indentLevel);
  return sections
    .map((section, index) => {
      const cleaned = cleanSection(section);
      return `${indent}• ${cleaned}`;
    })
    .join('\n');
}

function formatNumbered(sections: string[], options: FormatOptions): string {
  const indent = '  '.repeat(options.indentLevel);
  return sections
    .map((section, index) => {
      const cleaned = cleanSection(section);
      return `${indent}${index + 1}. ${cleaned}`;
    })
    .join('\n');
}

function formatParagraph(sections: string[], options: FormatOptions): string {
  const separator = options.lineBreaks ? '\n\n' : ' ';
  return sections
    .map(section => cleanSection(section))
    .join(separator);
}

function formatCode(sections: string[], options: FormatOptions): string {
  const indent = '  '.repeat(options.indentLevel);
  return sections
    .map((section, index) => {
      const cleaned = cleanSection(section);
      return `${indent}${cleaned}`;
    })
    .join('\n');
}

function cleanSection(section: string): string {
  // Remove extra whitespace
  let cleaned = section.replace(/\s+/g, ' ').trim();
  
  // Remove common prefixes
  cleaned = cleaned.replace(/^[-•*]\s+/, '');
  cleaned = cleaned.replace(/^\d+[.)]\s+/, '');
  cleaned = cleaned.replace(/^>\s+/, '');
  
  // Capitalize first letter if needed
  if (cleaned.length > 0 && cleaned[0] === cleaned[0].toLowerCase()) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned;
}

function highlightKeywords(text: string): string {
  const keywords = [
    'AI', 'prompt', 'generate', 'create', 'design', 'write', 'analyze',
    'Act as', 'You are', 'Task:', 'Goal:', 'Requirements:', 'Output:',
    'Format:', 'Style:', 'Tone:', 'Target:', 'Audience:', 'Context:'
  ];
  
  let highlighted = text;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlighted = highlighted.replace(regex, `**${keyword}**`);
  });
  
  return highlighted;
}

export function AIPromptFormatter() {
  const [rawPrompt, setRawPrompt] = useState('');
  const [formattedPrompt, setFormattedPrompt] = useState('');
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    style: 'structured',
    addHeaders: true,
    capitalizeHeaders: true,
    indentLevel: 0,
    lineBreaks: true,
    highlightKeywords: false
  });
  const [isFormatting, setIsFormatting] = useState(false);

  const handleFormat = () => {
    if (!rawPrompt.trim()) {
      alert('Please enter a prompt to format');
      return;
    }

    setIsFormatting(true);
    
    setTimeout(() => {
      let formatted = formatPrompt(rawPrompt, formatOptions);
      
      if (formatOptions.highlightKeywords) {
        formatted = highlightKeywords(formatted);
      }
      
      setFormattedPrompt(formatted);
      setIsFormatting(false);
    }, 300);
  };

  const handleCopy = () => {
    if (formattedPrompt) {
      // Remove markdown formatting for plain text copy
      const plainText = formattedPrompt.replace(/\*\*/g, '');
      navigator.clipboard.writeText(plainText);
      alert('Formatted prompt copied to clipboard!');
    }
  };

  const handleCopyMarkdown = () => {
    if (formattedPrompt) {
      navigator.clipboard.writeText(formattedPrompt);
      alert('Formatted prompt (with markdown) copied to clipboard!');
    }
  };

  const handleOptionChange = (key: keyof FormatOptions, value: any) => {
    setFormatOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExample = () => {
    const example = `Act as an expert content writer. Write a blog post about AI technology. The post should be 1000 words long. Include an introduction, main content sections, and conclusion. Use a professional tone. Target audience is tech professionals.`;
    setRawPrompt(example);
  };

  const handleClear = () => {
    setRawPrompt('');
    setFormattedPrompt('');
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-violet-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#6D28D9" strokeWidth="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="#6D28D9" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#6D28D9" strokeWidth="2" fill="none"/>
        </svg>
        AI Prompt Formatter / Beautifier
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Format Options */}
        <div className="mb-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
          <h3 className="font-semibold text-violet-800 mb-4">Formatting Options</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-violet-700">
                Format Style
              </label>
              <select
                value={formatOptions.style}
                onChange={(e) => handleOptionChange('style', e.target.value as any)}
                className="w-full p-2 border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm"
              >
                <option value="structured">Structured</option>
                <option value="bullet">Bullet Points</option>
                <option value="numbered">Numbered List</option>
                <option value="paragraph">Paragraph</option>
                <option value="code">Code Format</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-violet-700">
                Indent Level
              </label>
              <select
                value={formatOptions.indentLevel}
                onChange={(e) => handleOptionChange('indentLevel', parseInt(e.target.value))}
                className="w-full p-2 border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-sm"
              >
                <option value="0">No Indent</option>
                <option value="1">1 Level</option>
                <option value="2">2 Levels</option>
                <option value="3">3 Levels</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center gap-2 text-sm text-violet-700">
                <input
                  type="checkbox"
                  checked={formatOptions.addHeaders}
                  onChange={(e) => handleOptionChange('addHeaders', e.target.checked)}
                  className="w-4 h-4 text-violet-600 border-violet-300 rounded focus:ring-violet-500"
                />
                Add Headers
              </label>
              <label className="flex items-center gap-2 text-sm text-violet-700">
                <input
                  type="checkbox"
                  checked={formatOptions.highlightKeywords}
                  onChange={(e) => handleOptionChange('highlightKeywords', e.target.checked)}
                  className="w-4 h-4 text-violet-600 border-violet-300 rounded focus:ring-violet-500"
                />
                Highlight Keywords
              </label>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-semibold text-violet-700">
              Enter Your Prompt (Raw/Unformatted)
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleExample}
                className="px-3 py-1 bg-violet-100 text-violet-700 rounded text-sm hover:bg-violet-200 transition-colors"
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
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            placeholder="Paste your messy, unformatted prompt here..."
            rows={8}
            className="w-full p-4 border-2 border-violet-200 rounded-lg focus:border-violet-500 focus:ring-2 focus:ring-violet-200 resize-y font-mono text-sm"
          />
          <p className="text-xs text-gray-600 mt-2">
            {rawPrompt.length} characters
          </p>
        </div>

        <button
          onClick={handleFormat}
          disabled={!rawPrompt.trim() || isFormatting}
          className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-all transform ${
            rawPrompt.trim() && !isFormatting
              ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 hover:scale-105 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isFormatting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Formatting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
              </svg>
              Format & Beautify Prompt
            </span>
          )}
        </button>
      </div>

      {formattedPrompt && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-violet-800">Formatted Prompt</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy Plain Text
              </button>
              <button
                onClick={handleCopyMarkdown}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy with Markdown
              </button>
            </div>
          </div>

          <div className="bg-violet-50 rounded-lg p-4 border-2 border-violet-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed overflow-x-auto">
              {formattedPrompt}
            </pre>
          </div>

          <div className="mt-4 p-3 bg-violet-100 rounded-lg">
            <p className="text-sm text-violet-800">
              <strong>Character Count:</strong> {formattedPrompt.replace(/\*\*/g, '').length} characters
            </p>
            <p className="text-sm text-violet-800 mt-1">
              <strong>Line Count:</strong> {formattedPrompt.split('\n').length} lines
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIPromptFormatterInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-violet-800">What is an AI Prompt Formatter?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Prompt Formatter</strong> is a tool that takes messy, unformatted prompts and transforms them into 
          well-structured, readable formats. Whether you have a long paragraph prompt, a wall of text, or an unstructured 
          prompt, this tool reformats it with proper bullet points, syntax highlighting, clean structure, and organized 
          sections—making your prompts more professional and easier to use.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-violet-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Prompt Formatter beautifies your prompts by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Detecting structure:</strong> Automatically identifies sections, lists, and key elements</li>
          <li><strong>Applying formatting:</strong> Converts to structured, bullet points, numbered lists, or paragraph format</li>
          <li><strong>Adding headers:</strong> Optionally adds section headers for better organization</li>
          <li><strong>Highlighting keywords:</strong> Emphasizes important terms and commands</li>
          <li><strong>Cleaning up:</strong> Removes extra whitespace and normalizes formatting</li>
          <li><strong>Indenting:</strong> Adds proper indentation for hierarchical structure</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-violet-800">Format Styles Available</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-violet-50 p-5 rounded-lg border-2 border-violet-200">
            <h3 className="font-bold text-violet-800 mb-3">📋 Structured Format</h3>
            <p className="text-gray-700 mb-3">Organized with headers and numbered/bulleted sections</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Best for complex prompts</li>
              <li>• Includes headers and sub-items</li>
              <li>• Hierarchical organization</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">• Bullet Points</h3>
            <p className="text-gray-700 mb-3">Clean bullet point list format</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Great for requirements</li>
              <li>• Easy to scan</li>
              <li>• Simple and clean</li>
            </ul>
          </div>

          <div className="bg-fuchsia-50 p-5 rounded-lg border-2 border-fuchsia-200">
            <h3 className="font-bold text-fuchsia-800 mb-3">1. Numbered List</h3>
            <p className="text-gray-700 mb-3">Sequential numbered format</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Perfect for step-by-step</li>
              <li>• Ordered instructions</li>
              <li>• Clear sequence</li>
            </ul>
          </div>

          <div className="bg-pink-50 p-5 rounded-lg border-2 border-pink-200">
            <h3 className="font-bold text-pink-800 mb-3">📝 Paragraph Format</h3>
            <p className="text-gray-700 mb-3">Flowing paragraph structure</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Natural reading flow</li>
              <li>• Continuous narrative</li>
              <li>• Professional prose</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-violet-800">Why Format Your Prompts?</h2>
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-lg border-l-4 border-violet-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Better Readability:</strong> Formatted prompts are easier to read and understand</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Professional Appearance:</strong> Clean formatting makes prompts look more polished</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Easier Editing:</strong> Structured format makes it simple to modify specific sections</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Better Organization:</strong> Headers and sections help organize complex prompts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Sharing Ready:</strong> Formatted prompts are perfect for sharing with teams or clients</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Paste raw text:</strong> Don't pre-format—paste your messy prompt as-is</li>
          <li><strong>Choose appropriate style:</strong> Select format style that matches your prompt type</li>
          <li><strong>Use headers:</strong> Enable headers for complex prompts with multiple sections</li>
          <li><strong>Adjust indentation:</strong> Use indentation levels to show hierarchy</li>
          <li><strong>Highlight keywords:</strong> Enable keyword highlighting for important terms</li>
          <li><strong>Test different formats:</strong> Try multiple format styles to see what works best</li>
          <li><strong>Review and refine:</strong> Always review formatted output and make manual adjustments if needed</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-violet-800">Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-violet-200">
            <h3 className="font-bold text-violet-800 mb-3">✅ For Prompt Engineers</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Format complex multi-part prompts</li>
              <li>• Organize requirements and constraints</li>
              <li>• Create shareable, professional prompts</li>
              <li>• Standardize prompt structure</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">✅ For Developers</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Format API prompt instructions</li>
              <li>• Clean up user-generated prompts</li>
              <li>• Standardize prompt formats</li>
              <li>• Create documentation-ready prompts</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-violet-100 to-purple-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-violet-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Paste your prompt</strong> into the input field (or use the example)</li>
          <li><strong>Select format options</strong> (style, indentation, headers, etc.)</li>
          <li><strong>Click "Format & Beautify"</strong> to transform your prompt</li>
          <li><strong>Review the formatted output</strong> and make adjustments if needed</li>
          <li><strong>Copy the formatted prompt</strong> (plain text or with markdown)</li>
          <li><strong>Use in your AI tools</strong> or share with your team</li>
        </ol>
      </section>
    </>
  );
}

export default AIPromptFormatter;

