"use client";

import React, { useState } from 'react';

interface Chunk {
  index: number;
  text: string;
  characterCount: number;
  estimatedTokens: number;
}

// Rough token estimation: ~4 characters per token (varies by language)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function chunkText(
  text: string,
  chunkSize: number,
  chunkType: 'characters' | 'tokens',
  overlap: number,
  chunkTypeUnit: 'characters' | 'tokens'
): Chunk[] {
  if (!text.trim()) return [];

  const chunks: Chunk[] = [];
  
  if (chunkType === 'characters') {
    // Character-based chunking
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunkText = text.slice(startIndex, endIndex);
      
      chunks.push({
        index: chunkIndex,
        text: chunkText,
        characterCount: chunkText.length,
        estimatedTokens: estimateTokens(chunkText),
      });
      
      // Move start index forward by (chunkSize - overlap) to create overlap
      const overlapSize = chunkTypeUnit === 'characters' ? overlap : Math.floor(overlap * 4);
      startIndex += chunkSize - overlapSize;
      chunkIndex++;
      
      // Prevent infinite loop if overlap >= chunkSize
      if (startIndex <= chunks[chunks.length - 1]?.text.length || overlapSize >= chunkSize) {
        if (endIndex >= text.length) break;
        startIndex = endIndex;
      }
    }
  } else {
    // Token-based chunking (approximate using character estimation)
    const estimatedCharsPerChunk = chunkSize * 4; // Rough estimate
    let startIndex = 0;
    let chunkIndex = 0;
    
    while (startIndex < text.length) {
      // Approximate chunk size in characters for tokens
      const endIndex = Math.min(startIndex + estimatedCharsPerChunk, text.length);
      let chunkText = text.slice(startIndex, endIndex);
      
      // Try to adjust to hit closer to target token count
      let tokens = estimateTokens(chunkText);
      if (tokens < chunkSize && endIndex < text.length) {
        // Try to extend a bit
        const extendBy = Math.min((chunkSize - tokens) * 4, text.length - endIndex);
        chunkText = text.slice(startIndex, endIndex + extendBy);
        tokens = estimateTokens(chunkText);
      }
      
      chunks.push({
        index: chunkIndex,
        text: chunkText,
        characterCount: chunkText.length,
        estimatedTokens: tokens,
      });
      
      // Move forward with overlap
      const overlapSize = chunkTypeUnit === 'characters' ? overlap : Math.floor(overlap * 4);
      startIndex += estimatedCharsPerChunk - overlapSize;
      chunkIndex++;
      
      if (startIndex >= text.length || overlapSize >= estimatedCharsPerChunk) {
        if (endIndex >= text.length) break;
        startIndex = endIndex;
      }
    }
  }
  
  return chunks;
}

export function RAGChunkingTool() {
  const [text, setText] = useState('');
  const [chunkSize, setChunkSize] = useState(500);
  const [chunkType, setChunkType] = useState<'characters' | 'tokens'>('characters');
  const [overlap, setOverlap] = useState(50);
  const [overlapType, setOverlapType] = useState<'characters' | 'tokens'>('characters');
  const [chunks, setChunks] = useState<Chunk[]>([]);

  const handleChunk = () => {
    if (!text.trim()) {
      alert('Please enter some text to chunk.');
      return;
    }
    
    const result = chunkText(text, chunkSize, chunkType, overlap, overlapType);
    setChunks(result);
  };

  const handleExportJSON = () => {
    if (chunks.length === 0) {
      alert('Please generate chunks first.');
      return;
    }

    const exportData = {
      metadata: {
        originalLength: text.length,
        originalTokens: estimateTokens(text),
        chunkSize,
        chunkType,
        overlap,
        overlapType,
        totalChunks: chunks.length,
        createdAt: new Date().toISOString(),
      },
      chunks: chunks.map(chunk => ({
        index: chunk.index,
        text: chunk.text,
        characterCount: chunk.characterCount,
        estimatedTokens: chunk.estimatedTokens,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-chunks-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    if (chunks.length === 0) {
      alert('Please generate chunks first.');
      return;
    }

    let markdown = `# RAG Text Chunks\n\n`;
    markdown += `**Metadata:**\n`;
    markdown += `- Original Length: ${text.length} characters\n`;
    markdown += `- Estimated Tokens: ${estimateTokens(text)}\n`;
    markdown += `- Chunk Size: ${chunkSize} ${chunkType}\n`;
    markdown += `- Overlap: ${overlap} ${overlapType}\n`;
    markdown += `- Total Chunks: ${chunks.length}\n\n`;
    markdown += `---\n\n`;

    chunks.forEach((chunk) => {
      markdown += `## Chunk ${chunk.index + 1}\n\n`;
      markdown += `*Characters: ${chunk.characterCount} | Estimated Tokens: ${chunk.estimatedTokens}*\n\n`;
      markdown += `${chunk.text}\n\n`;
      markdown += `---\n\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-chunks-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportTextList = () => {
    if (chunks.length === 0) {
      alert('Please generate chunks first.');
      return;
    }

    let textList = chunks.map((chunk, idx) => 
      `=== CHUNK ${idx + 1} (${chunk.characterCount} chars, ~${chunk.estimatedTokens} tokens) ===\n\n${chunk.text}\n\n`
    ).join('\n');

    const blob = new Blob([textList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rag-chunks-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalCharacters = text.length;
  const totalEstimatedTokens = estimateTokens(text);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#4C1D95" strokeWidth="2" fill="none"/>
          <path d="M14 2v6h6" stroke="#4C1D95" strokeWidth="2" fill="none"/>
          <path d="M16 13H8" stroke="#4C1D95" strokeWidth="2"/>
          <path d="M16 17H8" stroke="#4C1D95" strokeWidth="2"/>
          <path d="M10 9H8" stroke="#4C1D95" strokeWidth="2"/>
        </svg>
        RAG Chunking / Text Splitter Tool
      </h2>

      <p className="text-gray-600 mb-6">
        Split long documents into smaller chunks optimized for RAG (Retrieval-Augmented Generation) 
        ingestion. Perfect for building chatbots on PDFs, document Q&A systems, and vector database 
        preparation. Export chunks as JSON, Markdown, or plain text.
      </p>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-gray-700">
          Paste your document text:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your long document here... (PDF text, articles, transcripts, etc.)"
          className="w-full p-4 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 h-48 resize-none font-mono text-sm"
        />
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>Characters: {totalCharacters.toLocaleString()} | Estimated Tokens: ~{totalEstimatedTokens.toLocaleString()}</span>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Chunking Configuration</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Chunk Size */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Chunk Size
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value) || 500))}
                className="flex-1 p-2 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                min="1"
              />
              <select
                value={chunkType}
                onChange={(e) => setChunkType(e.target.value as 'characters' | 'tokens')}
                className="p-2 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="characters">Characters</option>
                <option value="tokens">Tokens</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Recommended: 500-1000 characters or 150-300 tokens
            </p>
          </div>

          {/* Overlap */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Overlap (Sliding Window)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={overlap}
                onChange={(e) => setOverlap(Math.max(0, parseInt(e.target.value) || 50))}
                className="flex-1 p-2 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                min="0"
              />
              <select
                value={overlapType}
                onChange={(e) => setOverlapType(e.target.value as 'characters' | 'tokens')}
                className="p2 border rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              >
                <option value="characters">Characters</option>
                <option value="tokens">Tokens</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Overlap helps preserve context. 10-20% of chunk size recommended
            </p>
          </div>
        </div>

        <button
          onClick={handleChunk}
          disabled={!text.trim()}
          className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Generate Chunks
        </button>
      </div>

      {/* Results Section */}
      {chunks.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Generated Chunks: {chunks.length}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total characters: {chunks.reduce((sum, c) => sum + c.characterCount, 0).toLocaleString()} | 
                Estimated tokens: ~{chunks.reduce((sum, c) => sum + c.estimatedTokens, 0).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                📄 Export JSON
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm"
              >
                📝 Export MD
              </button>
              <button
                onClick={handleExportTextList}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
              >
                📋 Export TXT
              </button>
            </div>
          </div>

          {/* Chunks Preview */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
            {chunks.map((chunk) => (
              <div key={chunk.index} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-indigo-700">
                    Chunk {chunk.index + 1}
                  </span>
                  <span className="text-xs text-gray-500">
                    {chunk.characterCount} chars | ~{chunk.estimatedTokens} tokens
                  </span>
                </div>
                <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                  {chunk.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 RAG Chunking Best Practices</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>Chunk Size:</strong> 500-1000 characters (150-300 tokens) works well for most LLMs. 
            Larger chunks (1500-2000 chars) for longer context models.
          </li>
          <li>
            <strong>Overlap:</strong> 10-20% overlap helps preserve context and prevents splitting 
            important sentences in the middle. Essential for maintaining semantic meaning.
          </li>
          <li>
            <strong>Token Estimation:</strong> Roughly 4 characters per token (varies by language). 
            Use actual tokenizers (tiktoken, etc.) for production accuracy.
          </li>
          <li>
            <strong>Sentence Boundaries:</strong> For better quality, consider splitting at sentence 
            or paragraph boundaries rather than fixed sizes (future enhancement).
          </li>
          <li>
            <strong>Metadata:</strong> Include chunk index, source document info, and character 
            positions for better retrieval tracking.
          </li>
        </ul>
      </div>
    </div>
  );
}

export function RAGChunkingToolInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">What is RAG Chunking?</h2>
        <p className="text-gray-700 text-lg">
          RAG (Retrieval-Augmented Generation) requires splitting large documents into smaller, 
          manageable chunks that can be embedded into vectors and retrieved during question-answering. 
          Effective chunking is crucial for building accurate document Q&A systems, chatbots, and 
          knowledge bases powered by LLMs.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Why Use This Tool?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">🎯 Perfect Chunk Sizes</h3>
            <p className="text-sm text-gray-700">
              Optimize chunk sizes for your LLM's context window. Balance between too small 
              (loses context) and too large (inefficient retrieval).
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">🔄 Context Overlap</h3>
            <p className="text-sm text-gray-700">
              Sliding window overlap ensures important context isn't lost at chunk boundaries. 
              Critical for maintaining semantic meaning.
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">📤 Export Formats</h3>
            <p className="text-sm text-gray-700">
              Export as JSON for programmatic use, Markdown for documentation, or plain text 
              for simple integrations.
            </p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">⚡ No Backend Required</h3>
            <p className="text-sm text-gray-700">
              All processing happens in your browser. Your documents never leave your device. 
              Perfect for sensitive or confidential content.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Use Cases</h2>
        <div className="space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">📚 Document Q&A Systems</h3>
            <p className="text-sm text-gray-700">
              Build chatbots that answer questions about PDFs, research papers, documentation, 
              or legal documents. Chunk documents for vector database ingestion.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">💼 Knowledge Bases</h3>
            <p className="text-sm text-gray-700">
              Create searchable knowledge bases from company documentation, wikis, or training 
              materials. Enable semantic search over large text corpora.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🤖 AI Agents</h3>
            <p className="text-sm text-gray-700">
              Prepare documents for RAG-powered AI agents that need context from large document sets. 
              Essential for agentic workflows and autonomous systems.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🔍 Vector Database Preparation</h3>
            <p className="text-sm text-gray-700">
              Prepare text chunks for embedding generation and storage in vector databases like 
              Pinecone, Weaviate, Qdrant, or Chroma. Optimize for retrieval accuracy.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Technical Details</h2>
        <div className="space-y-3 text-gray-700">
          <div>
            <h3 className="font-semibold mb-1">Token Estimation</h3>
            <p className="text-sm">
              Uses rough estimation of ~4 characters per token (varies by language and content). 
              For production, use actual tokenizers like <code className="bg-gray-100 px-1 rounded">tiktoken</code> 
              (OpenAI), <code className="bg-gray-100 px-1 rounded">sentencepiece</code> (Google), or 
              <code className="bg-gray-100 px-1 rounded">transformers</code> (HuggingFace) for accuracy.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Export Format: JSON</h3>
            <p className="text-sm">
              JSON export includes metadata (chunk size, overlap, timestamps) and array of chunks 
              with indices, text, character counts, and token estimates. Perfect for programmatic 
              processing and API integration.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Export Format: Markdown</h3>
            <p className="text-sm">
              Human-readable markdown format with headers, metadata table, and formatted chunk content. 
              Great for documentation, reviews, or manual inspection of chunks.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Privacy & Security</h3>
            <p className="text-sm">
              All processing occurs client-side in your browser using JavaScript and the Blob API. 
              No data is sent to servers. Your documents remain private and secure.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Next Steps After Chunking</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Generate Embeddings:</strong> Use embedding models (OpenAI, Cohere, Sentence-BERT) 
            to convert chunks into vectors.
          </li>
          <li>
            <strong>Store in Vector DB:</strong> Upload vectors to Pinecone, Weaviate, Qdrant, or 
            similar vector databases.
          </li>
          <li>
            <strong>Build Retrieval:</strong> Implement semantic search to find relevant chunks for 
            user queries.
          </li>
          <li>
            <strong>RAG Pipeline:</strong> Combine retrieved chunks with LLM prompts for 
            context-aware responses.
          </li>
        </ol>
      </section>
    </>
  );
}

export default RAGChunkingTool;

