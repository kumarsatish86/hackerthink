"use client";

import React, { useState } from 'react';

type Precision = 'fp32' | 'fp16' | 'bf16' | 'q8_0' | 'q6_K' | 'q5_K_M' | 'q5_1' | 'q5_0' | 'q4_K_M' | 'q4_K_S' | 'q4_1' | 'q4_0' | 'q3_K_M' | 'q3_K_S' | 'q3_1' | 'q3_0' | 'q2_K' | 'q2_1' | 'q2_0' | 'q1_K_M' | 'q1_K_S' | 'q1_0' | 'iq4_xs' | 'iq3_xs' | 'iq2_xs';

interface Model {
  name: string;
  parameters: number; // in billions
  contextLength: number;
  family: string;
}

interface PrecisionInfo {
  name: string;
  multiplier: number; // bytes per parameter
  description: string;
  quality: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
}

const models: Model[] = [
  { name: 'Llama 3.3 8B', parameters: 8, contextLength: 131072, family: 'Meta' },
  { name: 'Llama 3.1 8B', parameters: 8, contextLength: 131072, family: 'Meta' },
  { name: 'Llama 3 8B', parameters: 8, contextLength: 131072, family: 'Meta' },
  { name: 'Llama 2 7B', parameters: 7, contextLength: 4096, family: 'Meta' },
  { name: 'Llama 2 13B', parameters: 13, contextLength: 4096, family: 'Meta' },
  { name: 'Llama 3.3 70B', parameters: 70, contextLength: 131072, family: 'Meta' },
  { name: 'Llama 3.1 70B', parameters: 70, contextLength: 131072, family: 'Meta' },
  { name: 'Llama 3 70B', parameters: 70, contextLength: 131072, family: 'Meta' },
  { name: 'Llama 2 70B', parameters: 70, contextLength: 4096, family: 'Meta' },
  
  { name: 'Mistral 7B', parameters: 7, contextLength: 8192, family: 'Mistral AI' },
  { name: 'Mistral Small (24B)', parameters: 24, contextLength: 32768, family: 'Mistral AI' },
  { name: 'Mixtral 8x7B', parameters: 47, contextLength: 32768, family: 'Mistral AI' },
  { name: 'Mistral Large', parameters: 123, contextLength: 32768, family: 'Mistral AI' },
  
  { name: 'Phi-3 Mini (3.8B)', parameters: 3.8, contextLength: 128000, family: 'Microsoft' },
  { name: 'Phi-3 Medium (14B)', parameters: 14, contextLength: 128000, family: 'Microsoft' },
  
  { name: 'Gemma 2B', parameters: 2, contextLength: 8192, family: 'Google' },
  { name: 'Gemma 7B', parameters: 7, contextLength: 8192, family: 'Google' },
  { name: 'Gemma 9B', parameters: 9, contextLength: 8192, family: 'Google' },
  
  { name: 'Qwen 2.5 7B', parameters: 7, contextLength: 32768, family: 'Alibaba' },
  { name: 'Qwen 2.5 14B', parameters: 14, contextLength: 32768, family: 'Alibaba' },
  { name: 'Qwen 2.5 32B', parameters: 32, contextLength: 32768, family: 'Alibaba' },
  { name: 'Qwen 2.5 72B', parameters: 72, contextLength: 32768, family: 'Alibaba' },
  
  { name: 'Yi 6B', parameters: 6, contextLength: 200000, family: '01-ai' },
  { name: 'Yi 34B', parameters: 34, contextLength: 200000, family: '01-ai' },
];

const precisionInfo: Record<Precision, PrecisionInfo> = {
  fp32: { name: 'FP32 (Full Precision)', multiplier: 4, description: 'Highest quality, full 32-bit precision', quality: 'highest' },
  fp16: { name: 'FP16 (Half Precision)', multiplier: 2, description: 'High quality, 16-bit precision, standard for most inference', quality: 'high' },
  bf16: { name: 'BF16 (Brain Float)', multiplier: 2, description: 'Similar to FP16, used for training and some inference', quality: 'high' },
  q8_0: { name: 'Q8_0 (8-bit)', multiplier: 1.125, description: 'Very high quality quantized, minimal quality loss', quality: 'high' },
  q6_K: { name: 'Q6_K', multiplier: 0.875, description: 'High quality quantized, 6-bit with variable quantization', quality: 'high' },
  q5_K_M: { name: 'Q5_K_M (5-bit Medium)', multiplier: 0.768, description: 'High quality quantized, good balance', quality: 'medium' },
  q5_1: { name: 'Q5_1', multiplier: 0.689, description: 'Medium-high quality quantized', quality: 'medium' },
  q5_0: { name: 'Q5_0', multiplier: 0.689, description: 'Medium-high quality quantized', quality: 'medium' },
  q4_K_M: { name: 'Q4_K_M (4-bit Medium)', multiplier: 0.582, description: 'Good quality quantized, popular choice', quality: 'medium' },
  q4_K_S: { name: 'Q4_K_S (4-bit Small)', multiplier: 0.549, description: 'Medium quality quantized', quality: 'medium' },
  q4_1: { name: 'Q4_1', multiplier: 0.565, description: 'Medium quality quantized', quality: 'medium' },
  q4_0: { name: 'Q4_0', multiplier: 0.549, description: 'Medium quality quantized', quality: 'medium' },
  q3_K_M: { name: 'Q3_K_M (3-bit Medium)', multiplier: 0.415, description: 'Lower quality but very memory efficient', quality: 'low' },
  q3_K_S: { name: 'Q3_K_S (3-bit Small)', multiplier: 0.393, description: 'Lower quality, very memory efficient', quality: 'low' },
  q3_1: { name: 'Q3_1', multiplier: 0.393, description: 'Lower quality quantized', quality: 'low' },
  q3_0: { name: 'Q3_0', multiplier: 0.376, description: 'Lower quality quantized', quality: 'low' },
  q2_K: { name: 'Q2_K', multiplier: 0.297, description: 'Low quality but extremely memory efficient', quality: 'lowest' },
  q2_1: { name: 'Q2_1', multiplier: 0.282, description: 'Very low quality quantized', quality: 'lowest' },
  q2_0: { name: 'Q2_0', multiplier: 0.282, description: 'Very low quality quantized', quality: 'lowest' },
  q1_K_M: { name: 'Q1_K_M (1-bit Medium)', multiplier: 0.203, description: 'Ultra-low quality, extreme memory savings', quality: 'lowest' },
  q1_K_S: { name: 'Q1_K_S (1-bit Small)', multiplier: 0.197, description: 'Ultra-low quality, extreme memory savings', quality: 'lowest' },
  q1_0: { name: 'Q1_0', multiplier: 0.188, description: 'Ultra-low quality, extreme memory savings', quality: 'lowest' },
  iq4_xs: { name: 'IQ4_XS (Implicit Quant 4-bit)', multiplier: 0.504, description: 'Implicit quantization, good quality', quality: 'medium' },
  iq3_xs: { name: 'IQ3_XS (Implicit Quant 3-bit)', multiplier: 0.376, description: 'Implicit quantization, lower quality', quality: 'low' },
  iq2_xs: { name: 'IQ2_XS (Implicit Quant 2-bit)', multiplier: 0.282, description: 'Implicit quantization, very low quality', quality: 'lowest' },
};

function calculateVRAM(modelParams: number, precision: Precision, contextLength: number): {
  modelSize: number;
  contextMemory: number;
  overhead: number;
  totalVRAM: number;
} {
  const precisionMultiplier = precisionInfo[precision].multiplier;
  
  // Base model size in GB
  const modelSizeGB = (modelParams * 1e9 * precisionMultiplier) / (1024 ** 3);
  
  // Context memory (KV cache) - rough estimate: ~2 bytes per token per parameter for attention
  // This is a simplified calculation
  const tokensPerGB = modelParams * 1e9 * precisionMultiplier / (1024 ** 3);
  const contextMemoryGB = (contextLength * modelParams * 1e9 * 0.00002) / (1024 ** 3); // Simplified
  
  // Overhead (activations, temporary buffers, etc.) - typically 20-30% of model size
  const overheadGB = modelSizeGB * 0.25;
  
  // Total VRAM needed (with some safety margin)
  const totalVRAM = modelSizeGB + contextMemoryGB + overheadGB;
  
  return {
    modelSize: modelSizeGB,
    contextMemory: contextMemoryGB,
    overhead: overheadGB,
    totalVRAM: totalVRAM * 1.1, // 10% safety margin
  };
}

function getGPURecommendations(totalVRAM: number): string[] {
  const recommendations: string[] = [];
  
  if (totalVRAM <= 8) {
    recommendations.push('RTX 3060 12GB, RTX 4060 Ti 16GB');
  } else if (totalVRAM <= 16) {
    recommendations.push('RTX 3080 10GB, RTX 4060 Ti 16GB, RTX 4070');
  } else if (totalVRAM <= 24) {
    recommendations.push('RTX 3090 24GB, RTX 4090 24GB, RTX 4070 Ti Super 16GB');
  } else if (totalVRAM <= 48) {
    recommendations.push('A100 40GB, A6000 48GB, RTX 6000 Ada 48GB');
  } else if (totalVRAM <= 80) {
    recommendations.push('A100 80GB, H100 (when available)');
  } else {
    recommendations.push('Multiple GPUs required, or cloud inference (H100, A100 clusters)');
  }
  
  return recommendations;
}

export function AIModelHardwareEstimator() {
  const [selectedModel, setSelectedModel] = useState<string>('Llama 3.3 8B');
  const [selectedPrecision, setSelectedPrecision] = useState<Precision>('q4_K_M');
  const [customVRAM, setCustomVRAM] = useState<number>(24);

  const model = models.find(m => m.name === selectedModel) || models[0];
  const vram = calculateVRAM(model.parameters, selectedPrecision, model.contextLength);
  const recommendations = getGPURecommendations(vram.totalVRAM);
  const canRun = customVRAM >= vram.totalVRAM;

  const formatGB = (gb: number) => {
    if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="#0891B2" strokeWidth="2" fill="none"/>
          <path d="M6 8h12M6 12h8M6 16h12" stroke="#0891B2" strokeWidth="2"/>
        </svg>
        AI Model Size vs Hardware Estimator
      </h2>

      <p className="text-gray-600 mb-6">
        Estimate VRAM requirements for running local AI models. Select a model and quantization 
        precision to see if your GPU can handle it. Answers questions like "Can I run Llama 70B on 24 GB VRAM?"
      </p>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Model Selection */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Select AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 border rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              {models.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name} ({m.parameters}B params, {m.contextLength.toLocaleString()} ctx)
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {model.family} • {model.parameters}B parameters
            </p>
          </div>

          {/* Precision Selection */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Select Precision/Quantization
            </label>
            <select
              value={selectedPrecision}
              onChange={(e) => setSelectedPrecision(e.target.value as Precision)}
              className="w-full p-3 border rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            >
              {Object.entries(precisionInfo).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name} - {info.description}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Quality: {precisionInfo[selectedPrecision].quality} • {precisionInfo[selectedPrecision].multiplier}x multiplier
            </p>
          </div>
        </div>

        {/* Your GPU VRAM */}
        <div className="mt-6">
          <label className="block mb-2 font-medium text-gray-700">
            Your GPU VRAM (GB)
          </label>
          <input
            type="number"
            value={customVRAM}
            onChange={(e) => setCustomVRAM(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full p-3 border rounded-lg focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
            min="0"
            step="1"
            placeholder="24"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your GPU's VRAM to check if you can run this model
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Compatibility Check */}
        <div className={`rounded-lg p-6 mb-6 border-l-4 ${
          canRun 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xl font-bold ${
              canRun ? 'text-green-900' : 'text-red-900'
            }`}>
              {canRun ? '✅ Compatible' : '❌ Insufficient VRAM'}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              canRun 
                ? 'bg-green-200 text-green-900' 
                : 'bg-red-200 text-red-900'
            }`}>
              {customVRAM} GB GPU
            </span>
          </div>
          <p className={
            canRun ? 'text-green-800' : 'text-red-800'
          }>
            {canRun 
              ? `Your GPU has enough VRAM! You can run ${selectedModel} with ${precisionInfo[selectedPrecision].name}.`
              : `You need at least ${formatGB(vram.totalVRAM)} VRAM. Your ${customVRAM} GB GPU is insufficient. Consider a larger GPU, lower precision, or a smaller model.`
            }
          </p>
        </div>

        {/* VRAM Breakdown */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 VRAM Breakdown</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
              <div className="text-sm text-gray-600 mb-1">Model Size</div>
              <div className="text-2xl font-bold text-cyan-700">{formatGB(vram.modelSize)}</div>
              <div className="text-xs text-gray-500 mt-1">
                {model.parameters}B params × {precisionInfo[selectedPrecision].multiplier}x precision
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Context Memory</div>
              <div className="text-2xl font-bold text-blue-700">{formatGB(vram.contextMemory)}</div>
              <div className="text-xs text-gray-500 mt-1">
                KV cache for {model.contextLength.toLocaleString()} token context
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-gray-600 mb-1">Overhead</div>
              <div className="text-2xl font-bold text-purple-700">{formatGB(vram.overhead)}</div>
              <div className="text-xs text-gray-500 mt-1">
                Activations, temporary buffers, safety margin
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-500">
              <div className="text-sm text-gray-600 mb-1">Total VRAM Required</div>
              <div className="text-2xl font-bold text-green-700">{formatGB(vram.totalVRAM)}</div>
              <div className="text-xs text-gray-500 mt-1">
                Minimum recommended for stable operation
              </div>
            </div>
          </div>
        </div>

        {/* GPU Recommendations */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Recommended GPUs:</h4>
          <p className="text-sm text-gray-700">
            {recommendations.join(', ')}
          </p>
        </div>
      </div>

      {/* Model Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">ℹ️ Model Information</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Model Family:</span>
            <span className="font-semibold ml-2">{model.family}</span>
          </div>
          <div>
            <span className="text-gray-600">Parameters:</span>
            <span className="font-semibold ml-2">{model.parameters}B</span>
          </div>
          <div>
            <span className="text-gray-600">Context Length:</span>
            <span className="font-semibold ml-2">{model.contextLength.toLocaleString()} tokens</span>
          </div>
          <div>
            <span className="text-gray-600">Precision:</span>
            <span className="font-semibold ml-2">{precisionInfo[selectedPrecision].name}</span>
          </div>
          <div>
            <span className="text-gray-600">Quality Level:</span>
            <span className="font-semibold ml-2 capitalize">{precisionInfo[selectedPrecision].quality}</span>
          </div>
          <div>
            <span className="text-gray-600">Size Multiplier:</span>
            <span className="font-semibold ml-2">{precisionInfo[selectedPrecision].multiplier}x</span>
          </div>
        </div>
      </div>

      {/* Internal Link to Guide */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🔒 Learn More About Running Local AI Safely</h3>
        <p className="mb-4 text-cyan-50">
          Ready to run models locally? Check out our comprehensive guide on setting up local AI 
          inference, optimizing performance, and ensuring safe deployment.
        </p>
        <a
          href="/guides/how-to-run-local-ai-safely"
          className="inline-block px-6 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Read Safety Guide →
        </a>
      </div>
    </div>
  );
}

export function AIModelHardwareEstimatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Why This Calculator Matters</h2>
        <p className="text-gray-700 text-lg">
          One of the most common questions when running local AI models is: "Can my GPU handle this?" 
          Understanding VRAM requirements is crucial before downloading large model files. This calculator 
          helps you determine if your hardware can run a specific model with your chosen quantization, 
          preventing wasted downloads and configuration time.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Understanding VRAM Requirements</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">📦 Model Size</h3>
            <p className="text-sm text-gray-700">
              The base model weights stored in memory. Calculated as: parameters × precision multiplier. 
              Larger models and higher precision require more VRAM.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🧠 Context Memory</h3>
            <p className="text-sm text-gray-700">
              KV cache for attention mechanism. Increases with longer context windows. Models like 
              Llama 3 with 131K context need significant memory for long conversations.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">⚙️ Overhead</h3>
            <p className="text-sm text-gray-700">
              Activations, temporary buffers, and safety margins. Typically 20-30% of model size. 
              Higher during generation due to temporary computation states.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">🎯 Total VRAM</h3>
            <p className="text-sm text-gray-700">
              Sum of all components plus safety margin. This is the minimum VRAM needed for stable 
              operation. Having 10-20% more is recommended.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Understanding Quantization</h2>
        <div className="space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Full Precision (FP32/FP16)</h3>
            <p className="text-sm text-gray-700">
              Highest quality but largest size. FP32 uses 4 bytes per parameter, FP16 uses 2 bytes. 
              Best for research, fine-tuning, and when quality is paramount.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">8-bit Quantization (Q8_0)</h3>
            <p className="text-sm text-gray-700">
              Very high quality with ~50% size reduction. Minimal quality loss, excellent for 
              production inference when you have sufficient VRAM.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">4-bit Quantization (Q4_K_M)</h3>
            <p className="text-sm text-gray-700">
              Popular balance between quality and size. ~75% reduction with acceptable quality loss. 
              Most common choice for consumer GPUs.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Lower Bit Quantization (Q2, Q3)</h3>
            <p className="text-sm text-gray-700">
              Extreme compression with significant quality loss. Only use when absolutely necessary 
              for small GPUs. Quality degradation is noticeable.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Common Scenarios</h2>
        <div className="space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">💻 "Can I run Llama 70B on 24GB VRAM?"</h3>
            <p className="text-sm text-gray-700">
              <strong>Answer:</strong> Yes, but only with Q4_K_M or lower precision. FP16 would need ~140GB VRAM. 
              Q4_K_M requires ~41GB, so 24GB won't work. You'd need Q2_K or lower, which sacrifices quality.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🎮 "RTX 3090 (24GB) Setup"</h3>
            <p className="text-sm text-gray-700">
              <strong>Answer:</strong> Great for Llama 3 8B (FP16: ~16GB), Llama 13B (Q4_K_M: ~9GB), or 
              Mixtral 8x7B (Q4_K_M: ~27GB might be tight). Can handle most 7-13B models at high quality.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🔥 "RTX 4090 (24GB) Setup"</h3>
            <p className="text-sm text-gray-700">
              <strong>Answer:</strong> Similar VRAM to 3090 but much faster. Can run Llama 3 70B at Q4_K_M 
              (needs streaming or offloading), or comfortably run smaller models at higher precision.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">💪 "Enterprise/Cloud Setup"</h3>
            <p className="text-sm text-gray-700">
              <strong>Answer:</strong> A100 40GB/80GB or H100 can run even large models at FP16. Multiple GPUs 
              allow running massive models or batching multiple requests.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Optimization Tips</h2>
        <ul className="text-gray-700 space-y-2">
          <li><strong>Use CPU Offloading:</strong> Tools like llama.cpp allow offloading layers to system RAM, enabling larger models on smaller GPUs</li>
          <li><strong>Context Window:</strong> Shorter context saves memory. Use streaming for long conversations instead of full context</li>
          <li><strong>Batch Size:</strong> Running multiple instances increases VRAM needs. Consider sequential processing</li>
          <li><strong>Mixed Precision:</strong> Some frameworks support mixed precision inference, using FP16 for most operations while keeping FP32 for critical parts</li>
          <li><strong>Model Alternatives:</strong> Consider smaller models that perform similarly (e.g., Mistral 7B often outperforms larger models)</li>
          <li><strong>Cloud Inference:</strong> For very large models, cloud inference (OpenRouter, Together AI) may be more cost-effective than expensive GPUs</li>
        </ul>
      </section>
    </>
  );
}

export default AIModelHardwareEstimator;

