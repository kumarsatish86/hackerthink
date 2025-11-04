import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { AIPromptGenerator, AIPromptGeneratorInfoSections } from '@/components/tools/AIPromptGenerator';
import { AIImagePromptStyler, AIImagePromptStylerInfoSections } from '@/components/tools/AIImagePromptStyler';
import { AICostCalculator, AICostCalculatorInfoSections } from '@/components/tools/AICostCalculator';
import { AIHeadlineGenerator, AIHeadlineGeneratorInfoSections } from '@/components/tools/AIHeadlineGenerator';
import { AIImageSizePlanner, AIImageSizePlannerInfoSections } from '@/components/tools/AIImageSizePlanner';
import { AIVoiceCloningLegalityChecker, AIVoiceCloningLegalityCheckerInfoSections } from '@/components/tools/AIVoiceCloningLegalityChecker';
import { AITextStyleAnalyzer, AITextStyleAnalyzerInfoSections } from '@/components/tools/AITextStyleAnalyzer';
import { AIComparisonMatrix, AIComparisonMatrixInfoSections } from '@/components/tools/AIComparisonMatrix';
import { AIRoadmapBuilder, AIRoadmapBuilderInfoSections } from '@/components/tools/AIRoadmapBuilder';
import { AIPolicyGenerator, AIPolicyGeneratorInfoSections } from '@/components/tools/AIPolicyGenerator';
import { AIEthicsRiskLabel, AIEthicsRiskLabelInfoSections } from '@/components/tools/AIEthicsRiskLabel';
import { RAGChunkingTool, RAGChunkingToolInfoSections } from '@/components/tools/RAGChunkingTool';
import { PromptCleanerTool, PromptCleanerToolInfoSections } from '@/components/tools/PromptCleanerTool';
import { AIROICalculator, AIROICalculatorInfoSections } from '@/components/tools/AIROICalculator';
import { AIModelHardwareEstimator, AIModelHardwareEstimatorInfoSections } from '@/components/tools/AIModelHardwareEstimator';
import { DatasetFinderTool, DatasetFinderToolInfoSections } from '@/components/tools/DatasetFinderTool';
import { DatasetLicenseChecker, DatasetLicenseCheckerInfoSections } from '@/components/tools/DatasetLicenseChecker';
import { DatasetTokenEstimator, DatasetTokenEstimatorInfoSections } from '@/components/tools/DatasetTokenEstimator';
import { DatasetSimilarityTool, DatasetSimilarityToolInfoSections } from '@/components/tools/DatasetSimilarityTool';
import { DatasetQualityScoreboard, DatasetQualityScoreboardInfoSections } from '@/components/tools/DatasetQualityScoreboard';
import { DatasetModelMatrix, DatasetModelMatrixInfoSections } from '@/components/tools/DatasetModelMatrix';
import { AIIdeaGenerator, AIIdeaGeneratorInfoSections } from '@/components/tools/AIIdeaGenerator';
import { AIPersonaCreator, AIPersonaCreatorInfoSections } from '@/components/tools/AIPersonaCreator';
import { AILogoPromptGenerator, AILogoPromptGeneratorInfoSections } from '@/components/tools/AILogoPromptGenerator';
import { AIPromptFormatter, AIPromptFormatterInfoSections } from '@/components/tools/AIPromptFormatter';
import { AIResumeCoverLetterGenerator, AIResumeCoverLetterGeneratorInfoSections } from '@/components/tools/AIResumeCoverLetterGenerator';
import { AIModelFinder, AIModelFinderInfoSections } from '@/components/tools/AIModelFinder';
import { AIChatStyleConverter, AIChatStyleConverterInfoSections } from '@/components/tools/AIChatStyleConverter';
import { AITextEmotionAnalyzer, AITextEmotionAnalyzerInfoSections } from '@/components/tools/AITextEmotionAnalyzer';
import { AIScriptToSceneVisualizer, AIScriptToSceneVisualizerInfoSections } from '@/components/tools/AIScriptToSceneVisualizer';
import { AIContentPlanner, AIContentPlannerInfoSections } from '@/components/tools/AIContentPlanner';
import { AIPricingComparisonCalculator, AIPricingComparisonCalculatorInfoSections } from '@/components/tools/AIPricingComparisonCalculator';
import { AIAccentSimulator, AIAccentSimulatorInfoSections } from '@/components/tools/AIAccentSimulator';
import { PromptPrivacyChecker, PromptPrivacyCheckerInfoSections } from '@/components/tools/PromptPrivacyChecker';
import { DatasetSizeStorageEstimator, DatasetSizeStorageEstimatorInfoSections } from '@/components/tools/DatasetSizeStorageEstimator';
import { AIWorkflowBlueprintBuilder, AIWorkflowBlueprintBuilderInfoSections } from '@/components/tools/AIWorkflowBlueprintBuilder';
import ToolStructuredData from '@/components/SEO/ToolStructuredData';

// Define tool type
interface Tool {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  file_path: string;
  published: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  category?: string;
  platform?: string;
  license?: string;
  official_url?: string;
  popularity?: number;
  created_at?: string;
  updated_at?: string;
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  if (!tool) {
    return {
      title: 'Tool Not Found - HackerThink',
      description: 'The requested tool could not be found.',
    };
  }
  
  return {
    title: tool.seo_title || `${tool.title} - Linux Tools`,
    description: tool.seo_description || tool.description,
    keywords: tool.seo_keywords,
  };
}

async function getTool(slug: string): Promise<Tool | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3007' 
        : 'https://ainews.com');
    
    const res = await fetch(`${baseUrl}/api/tools/${slug}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch tool: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.tool;
  } catch (error) {
    console.error(`Error fetching tool with slug "${slug}":`, error);
    return null;
  }
}

async function getToolHtml(filePath: string): Promise<string> {
  try {
    // In production, we'd fetch the HTML file from a storage service or CDN
    // For this example, we'll simulate HTML content based on the tool
      return `<div class="p-4 bg-yellow-100 text-yellow-800 rounded">Tool content not available.</div>`;
  } catch (error) {
    console.error(`Error fetching HTML for tool at path "${filePath}":`, error);
    return `<div class="p-4 bg-red-100 text-red-800 rounded">Error loading tool content. Please try again later.</div>`;
  }
}

// Function to get related tools
async function getRelatedTools(currentSlug: string): Promise<any[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3007' 
        : 'https://ainews.com');
    
    // Here we would normally query by category or tags
    // For now, we'll just get a few random tools excluding the current one
    const res = await fetch(`${baseUrl}/api/tools?limit=6&exclude=${currentSlug}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch related tools: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return data.tools || [];
  } catch (error) {
    console.error(`Error fetching related tools:`, error);
    return [];
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getTool(slug);
  
  console.log("Tool fetched:", tool); // Debug log
  
  if (!tool) {
    notFound();
  }
  
  // Get related tools
  const relatedTools = await getRelatedTools(slug);
  
  // Normalize file_path for more consistent checking
  const normalizedPath = tool.file_path.replace(/^\/tools\//, '');
  
  // Render AI Prompt Generator tool
  if (tool.slug === 'ai-prompt-generator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIPromptGenerator />
        <AIPromptGeneratorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Image Prompt Styler tool
  if (tool.slug === 'ai-image-prompt-styler') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIImagePromptStyler />
        <AIImagePromptStylerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Cost Calculator tool
  if (tool.slug === 'ai-cost-calculator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AICostCalculator />
        <AICostCalculatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Headline Generator tool
  if (tool.slug === 'ai-headline-generator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIHeadlineGenerator />
        <AIHeadlineGeneratorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Image Size Planner tool
  if (tool.slug === 'ai-image-size-planner') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIImageSizePlanner />
        <AIImageSizePlannerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Voice Cloning Legality Checker tool
  if (tool.slug === 'ai-voice-cloning-legality-checker') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIVoiceCloningLegalityChecker />
        <AIVoiceCloningLegalityCheckerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Text Style Analyzer tool
  if (tool.slug === 'ai-text-style-analyzer') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AITextStyleAnalyzer />
        <AITextStyleAnalyzerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Comparison Matrix tool
  if (tool.slug === 'ai-comparison-matrix') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIComparisonMatrix />
        <AIComparisonMatrixInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Roadmap Builder tool
  if (tool.slug === 'ai-roadmap-builder') {
            return (
              <div className="max-w-5xl mx-auto px-4 py-8">
                <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
              </div>
        
        <AIRoadmapBuilder />
        <AIRoadmapBuilderInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
              </div>
            );
          }

  // Render AI Policy Generator tool
  if (tool.slug === 'ai-policy-generator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIPolicyGenerator />
        <AIPolicyGeneratorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Ethics Risk Label tool
  if (tool.slug === 'ai-ethics-risk-label') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <AIEthicsRiskLabel />
        <AIEthicsRiskLabelInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render RAG Chunking Tool
  if (tool.slug === 'rag-chunking-tool') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <RAGChunkingTool />
        <RAGChunkingToolInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render Prompt Cleaner Tool
  if (tool.slug === 'prompt-cleaner') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
      </div>
        
        <PromptCleanerTool />
        <PromptCleanerToolInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
                  </div>
                );
              }

  // Render AI ROI Calculator tool
  if (tool.slug === 'ai-roi-calculator') {
                return (
                  <div className="max-w-5xl mx-auto px-4 py-8">
                    <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
                  </div>
        
        <AIROICalculator />
        <AIROICalculatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Render AI Model Hardware Estimator tool
  if (tool.slug === 'ai-model-hardware-estimator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIModelHardwareEstimator />
        <AIModelHardwareEstimatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset Finder Tool
  if (tool.slug === 'dataset-finder') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetFinderTool />
        <DatasetFinderToolInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset License Checker
  if (tool.slug === 'dataset-license-checker') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetLicenseChecker />
        <DatasetLicenseCheckerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset Token Estimator
  if (tool.slug === 'dataset-token-estimator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetTokenEstimator />
        <DatasetTokenEstimatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset Similarity Tool
  if (tool.slug === 'dataset-similarity') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetSimilarityTool />
        <DatasetSimilarityToolInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset Quality Scoreboard
  if (tool.slug === 'dataset-quality-scoreboard') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetQualityScoreboard />
        <DatasetQualityScoreboardInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset-Model Matrix
  if (tool.slug === 'dataset-model-matrix') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetModelMatrix />
        <DatasetModelMatrixInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Idea Generator
  if (tool.slug === 'ai-idea-generator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIIdeaGenerator />
        <AIIdeaGeneratorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Persona Creator
  if (tool.slug === 'ai-persona-creator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIPersonaCreator />
        <AIPersonaCreatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Logo Prompt Generator
  if (tool.slug === 'ai-logo-prompt-generator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AILogoPromptGenerator />
        <AILogoPromptGeneratorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Prompt Formatter
  if (tool.slug === 'ai-prompt-formatter' || tool.slug === 'ai-prompt-beautifier') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIPromptFormatter />
        <AIPromptFormatterInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Resume / Cover Letter Prompt Generator
  if (tool.slug === 'ai-resume-cover-letter-generator' || tool.slug === 'ai-resume-generator' || tool.slug === 'ai-cover-letter-generator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIResumeCoverLetterGenerator />
        <AIResumeCoverLetterGeneratorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Model Finder
  if (tool.slug === 'ai-model-finder' || tool.slug === 'ai-model-recommender') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIModelFinder />
        <AIModelFinderInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Chat Style Converter
  if (tool.slug === 'ai-chat-style-converter') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIChatStyleConverter />
        <AIChatStyleConverterInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Text Emotion Analyzer
  if (tool.slug === 'ai-text-emotion-analyzer') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AITextEmotionAnalyzer />
        <AITextEmotionAnalyzerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Script-to-Scene Visualizer
  if (tool.slug === 'ai-script-to-scene-visualizer') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIScriptToSceneVisualizer />
        <AIScriptToSceneVisualizerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Content Planner
  if (tool.slug === 'ai-content-planner' || tool.slug === 'content-planner-30-day') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIContentPlanner />
        <AIContentPlannerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Pricing Comparison Calculator
  if (tool.slug === 'ai-pricing-comparison-calculator' || tool.slug === 'ai-pricing-calculator') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIPricingComparisonCalculator />
        <AIPricingComparisonCalculatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Accent Simulator
  if (tool.slug === 'ai-accent-simulator') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIAccentSimulator />
        <AIAccentSimulatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Prompt Privacy Checker
  if (tool.slug === 'prompt-privacy-checker' || tool.slug === 'privacy-checker') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <PromptPrivacyChecker />
        <PromptPrivacyCheckerInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Dataset Size & Storage Estimator
  if (tool.slug === 'dataset-size-storage-estimator' || tool.slug === 'dataset-estimator') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <DatasetSizeStorageEstimator />
        <DatasetSizeStorageEstimatorInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render AI Workflow Blueprint Builder
  if (tool.slug === 'ai-workflow-blueprint-builder' || tool.slug === 'workflow-builder') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <ToolStructuredData tool={tool} />
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{tool.title}</h1>
          <p className="text-xl text-gray-600">
            {tool.description}
          </p>
        </div>
        
        <AIWorkflowBlueprintBuilder />
        <AIWorkflowBlueprintBuilderInfoSections />
        
        {relatedTools.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Related Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTools.slice(0, 6).map((relatedTool: any, index: number) => {
                // Rotate through gradient colors for visual variety
                const gradients = [
                  { bg: 'from-purple-500 to-pink-500', border: 'border-purple-400', text: 'text-purple-700', button: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' },
                  { bg: 'from-blue-500 to-cyan-500', border: 'border-blue-400', text: 'text-blue-700', button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700' },
                  { bg: 'from-indigo-500 to-purple-500', border: 'border-indigo-400', text: 'text-indigo-700', button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' },
                  { bg: 'from-emerald-500 to-teal-500', border: 'border-emerald-400', text: 'text-emerald-700', button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700' },
                  { bg: 'from-orange-500 to-red-500', border: 'border-orange-400', text: 'text-orange-700', button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700' },
                  { bg: 'from-violet-500 to-purple-500', border: 'border-violet-400', text: 'text-violet-700', button: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700' },
                ];
                const colorScheme = gradients[index % gradients.length];
                
                // Truncate description to 30-50 characters
                const truncateDescription = (text: string, maxLength: number = 45) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };
                const shortDescription = truncateDescription(relatedTool.description || '');
                
                // Different icons based on tool type
                const getIcon = (title: string) => {
                  const lowerTitle = title.toLowerCase();
                  if (lowerTitle.includes('calculator') || lowerTitle.includes('cost') || lowerTitle.includes('savings')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('generator') || lowerTitle.includes('creator')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('analyzer') || lowerTitle.includes('checker')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('comparison') || lowerTitle.includes('matrix')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    );
                  } else if (lowerTitle.includes('planner') || lowerTitle.includes('builder')) {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    );
                  } else {
                    return (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    );
                  }
                };
                
                return (
                  <a
                    key={relatedTool.id}
                    href={`/tools/${relatedTool.slug}`}
                    className="group relative block cursor-pointer"
                  >
                    {/* Enhanced glow effect on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}></div>
                    
                    {/* Modern card with gradient border */}
                    <div className={`relative bg-white rounded-2xl p-8 border-2 ${colorScheme.border} hover:border-opacity-100 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 h-full flex flex-col`}>
                      {/* Large icon with gradient background */}
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r ${colorScheme.bg} shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                          {getIcon(relatedTool.title)}
                        </div>
                      </div>
                      
                      {/* Big, bold title */}
                      <h3 className={`font-extrabold text-2xl ${colorScheme.text} mb-4 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${colorScheme.bg} transition-all duration-500`}>
                        {relatedTool.title}
                      </h3>
                      
                      {/* Short description (30-50 characters) */}
                      <p className="text-base text-gray-600 leading-relaxed mb-6 flex-grow min-h-[3rem]">
                        {shortDescription}
                      </p>
                      
                      {/* Modern CTA Button */}
                      <div className="mt-auto pt-6 border-t-2 border-gray-100">
                        <div className={`inline-flex items-center justify-center w-full px-6 py-4 rounded-xl ${colorScheme.button} text-white font-bold text-base shadow-xl transform group-hover:scale-105 group-hover:shadow-2xl transition-all duration-300`}>
                          <span className="mr-2">Try Now</span>
                          <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Default rendering for other tools
  console.log("Rendering default tool HTML:", tool.file_path); // Debug log
  const htmlContent = await getToolHtml(tool.file_path);
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{tool.title}</h1>
      
      {tool.description && (
        <p className="text-lg text-gray-600 mb-8">{tool.description}</p>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
} 

