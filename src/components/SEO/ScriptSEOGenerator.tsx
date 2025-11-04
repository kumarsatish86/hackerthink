import React, { useState } from 'react';

interface ScriptData {
  title: string;
  description: string;
  script_content: string;
  script_type: string;
  language: string;
  os_compatibility: string;
  difficulty: string;
  tags: string[];
  is_multi_language: boolean;
  available_languages: string[];
}

interface GeneratedSEO {
  meta_title: string;
  meta_description: string;
  open_graph_title: string;
  open_graph_description: string;
  schema_keywords: string[];
  schema_categories: string[];
  schema_audience: string;
  schema_learning_resource_type: string;
}

interface ScriptSEOGeneratorProps {
  scriptData: ScriptData;
  onGenerate: (seoData: GeneratedSEO) => void;
  isGenerating?: boolean;
}

export default function ScriptSEOGenerator({ scriptData, onGenerate, isGenerating = false }: ScriptSEOGeneratorProps) {
  const [isLoading, setIsLoading] = useState(false);

  // AI-powered content analysis and generation
  const analyzeScriptContent = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    const comments = lines.filter(line => line.trim().startsWith('#') || line.trim().startsWith('//') || line.trim().startsWith('/*'));
    const functions = lines.filter(line => 
      line.includes('function') || 
      line.includes('def ') || 
      line.includes('class ') ||
      line.includes('()') ||
      line.includes('=>')
    );
    
    return {
      hasComments: comments.length > 0,
      hasFunctions: functions.length > 0,
      complexity: lines.length > 50 ? 'complex' : lines.length > 20 ? 'moderate' : 'simple',
      mainPurpose: extractMainPurpose(comments, content),
      keyFeatures: extractKeyFeatures(comments, content)
    };
  };

  // Get the best content to analyze (main content or primary language variant)
  const getContentToAnalyze = () => {
    if (scriptData.script_content && scriptData.script_content.trim()) {
      return scriptData.script_content;
    }
    
    // If multi-language, try to get the primary language variant
    if (scriptData.is_multi_language && scriptData.variants && scriptData.variants.length > 0) {
      const primaryVariant = scriptData.variants.find(v => v.language === scriptData.primary_language);
      if (primaryVariant && primaryVariant.script_content) {
        return primaryVariant.script_content;
      }
      
      // Fallback to first variant
      const firstVariant = scriptData.variants[0];
      if (firstVariant && firstVariant.script_content) {
        return firstVariant.script_content;
      }
    }
    
    return scriptData.script_content || '';
  };

  const extractMainPurpose = (comments: string[], content: string) => {
    // Look for common script purposes in comments
    const purposeKeywords = {
      'backup': ['backup', 'backup', 'archive', 'save'],
      'monitoring': ['monitor', 'check', 'status', 'health', 'watch'],
      'automation': ['automate', 'auto', 'schedule', 'cron'],
      'deployment': ['deploy', 'install', 'setup', 'configure'],
      'security': ['security', 'secure', 'encrypt', 'protect', 'firewall'],
      'data_processing': ['process', 'parse', 'convert', 'transform', 'analyze'],
      'system_management': ['system', 'service', 'daemon', 'process'],
      'networking': ['network', 'connection', 'port', 'socket', 'http'],
      'database': ['database', 'db', 'sql', 'query', 'table'],
      'file_management': ['file', 'directory', 'folder', 'copy', 'move', 'delete']
    };

    const allText = [...comments, content].join(' ').toLowerCase();
    
    for (const [purpose, keywords] of Object.entries(purposeKeywords)) {
      if (keywords.some(keyword => allText.includes(keyword))) {
        return purpose;
      }
    }
    
    return 'utility';
  };

  const extractKeyFeatures = (comments: string[], content: string) => {
    const features = [];
    const allText = [...comments, content].join(' ').toLowerCase();
    
    if (allText.includes('error') || allText.includes('exception')) features.push('error handling');
    if (allText.includes('log') || allText.includes('logging')) features.push('logging');
    if (allText.includes('config') || allText.includes('configuration')) features.push('configuration');
    if (allText.includes('validate') || allText.includes('validation')) features.push('validation');
    if (allText.includes('backup') || allText.includes('restore')) features.push('backup/restore');
    if (allText.includes('monitor') || allText.includes('watch')) features.push('monitoring');
    if (allText.includes('notify') || allText.includes('alert')) features.push('notifications');
    if (allText.includes('schedule') || allText.includes('cron')) features.push('scheduling');
    
    return features.slice(0, 5); // Limit to 5 key features
  };

  const generateSEOTitle = (scriptData: ScriptData, analysis: any) => {
    const { title, language, script_type, difficulty } = scriptData;
    const { mainPurpose, complexity } = analysis;
    
    const purposeMap = {
      'backup': 'Backup',
      'monitoring': 'Monitoring',
      'automation': 'Automation',
      'deployment': 'Deployment',
      'security': 'Security',
      'data_processing': 'Data Processing',
      'system_management': 'System Management',
      'networking': 'Networking',
      'database': 'Database',
      'file_management': 'File Management',
      'utility': 'Utility'
    };

    const purpose = purposeMap[mainPurpose] || 'Utility';
    const complexityText = complexity === 'complex' ? 'Advanced' : complexity === 'moderate' ? 'Intermediate' : 'Basic';
    
    // Generate multiple title options
    const titleOptions = [
      `${title} - ${purpose} ${language} Script | HackerThink`,
      `${purpose} Script in ${language} - ${title} | HackerThink`,
      `${title}: ${difficulty} Level ${language} ${purpose} Script`,
      `${language} ${purpose} Script: ${title} (${complexityText})`,
      `${title} - ${language} ${script_type} Script for ${purpose}`
    ];

    return titleOptions[0]; // Return the first (most optimized) option
  };

  const generateSEODescription = (scriptData: ScriptData, analysis: any) => {
    const { title, language, script_type, difficulty, os_compatibility, is_multi_language, available_languages } = scriptData;
    const { mainPurpose, keyFeatures, complexity } = analysis;
    
    const purposeMap = {
      'backup': 'backup and data protection',
      'monitoring': 'system monitoring and health checks',
      'automation': 'task automation and scheduling',
      'deployment': 'application deployment and configuration',
      'security': 'security and access control',
      'data_processing': 'data processing and analysis',
      'system_management': 'system administration and management',
      'file_management': 'file and directory management',
      'networking': 'network operations and connectivity',
      'database': 'database operations and management',
      'utility': 'system utilities and tools'
    };

    const purpose = purposeMap[mainPurpose] || 'system utilities';
    const featuresText = keyFeatures.length > 0 ? ` Features include ${keyFeatures.slice(0, 3).join(', ')}.` : '';
    const multiLangText = is_multi_language ? ` Available in ${available_languages.join(', ')}.` : '';
    
    const descriptions = [
      `Download and use this ${difficulty.toLowerCase()} level ${language} script for ${purpose}. Compatible with ${os_compatibility}.${featuresText}${multiLangText} Perfect for ${script_type.toLowerCase()} tasks.`,
      `Professional ${language} script for ${purpose}. ${difficulty} level implementation with comprehensive documentation.${featuresText} Works on ${os_compatibility}.${multiLangText}`,
      `Learn ${purpose} with this ${language} script. ${difficulty} level code with examples and best practices.${featuresText} Cross-platform support for ${os_compatibility}.${multiLangText}`,
      `Production-ready ${language} script for ${purpose}. Includes error handling, logging, and ${difficulty.toLowerCase()} level implementation.${featuresText} ${os_compatibility} compatible.${multiLangText}`
    ];

    return descriptions[0]; // Return the first (most optimized) option
  };

  const generateSchemaKeywords = (scriptData: ScriptData, analysis: any) => {
    const { language, script_type, os_compatibility, difficulty, tags } = scriptData;
    const { mainPurpose, keyFeatures } = analysis;
    
    const baseKeywords = [
      language.toLowerCase(),
      script_type.toLowerCase(),
      os_compatibility.toLowerCase(),
      difficulty.toLowerCase(),
      'script',
      'code',
      'programming',
      'linux',
      'automation',
      'devops'
    ];

    const purposeKeywords = {
      'backup': ['backup', 'data protection', 'archive'],
      'monitoring': ['monitoring', 'health check', 'system status'],
      'automation': ['automation', 'scheduling', 'cron'],
      'deployment': ['deployment', 'configuration', 'setup'],
      'security': ['security', 'access control', 'protection'],
      'data_processing': ['data processing', 'analysis', 'transformation'],
      'system_management': ['system administration', 'service management'],
      'file_management': ['file management', 'directory operations'],
      'networking': ['networking', 'connectivity', 'communication'],
      'database': ['database', 'sql', 'data management'],
      'utility': ['utility', 'tool', 'helper']
    };

    const purposeSpecific = purposeKeywords[mainPurpose] || ['utility', 'tool'];
    const featureKeywords = keyFeatures.map(f => f.replace(' ', '-'));
    
    return [...baseKeywords, ...purposeSpecific, ...featureKeywords, ...(tags || [])]
      .filter((keyword, index, arr) => arr.indexOf(keyword) === index) // Remove duplicates
      .slice(0, 15); // Limit to 15 keywords
  };

  const generateSchemaCategories = (scriptData: ScriptData, analysis: any) => {
    const { script_type, language } = scriptData;
    const { mainPurpose } = analysis;
    
    const categoryMap = {
      'backup': ['Data Management', 'System Administration', 'Backup Solutions'],
      'monitoring': ['System Monitoring', 'DevOps', 'Infrastructure'],
      'automation': ['Automation', 'DevOps', 'System Administration'],
      'deployment': ['DevOps', 'Deployment', 'Configuration Management'],
      'security': ['Security', 'System Administration', 'Access Control'],
      'data_processing': ['Data Processing', 'Analytics', 'Data Science'],
      'system_management': ['System Administration', 'DevOps', 'Infrastructure'],
      'file_management': ['File Management', 'System Administration', 'Utilities'],
      'networking': ['Networking', 'Infrastructure', 'Communication'],
      'database': ['Database', 'Data Management', 'Backend Development'],
      'utility': ['Utilities', 'System Administration', 'Tools']
    };

    return categoryMap[mainPurpose] || ['Utilities', 'System Administration', 'Tools'];
  };

  const generateSchemaAudience = (scriptData: ScriptData, analysis: any) => {
    const { difficulty } = scriptData;
    const { complexity } = analysis;
    
    if (difficulty === 'Beginner' || complexity === 'simple') {
      return 'Beginner developers, students, system administrators';
    } else if (difficulty === 'Intermediate' || complexity === 'moderate') {
      return 'Intermediate developers, DevOps engineers, system administrators';
    } else {
      return 'Advanced developers, senior DevOps engineers, system architects';
    }
  };

  const generateLearningResourceType = (scriptData: ScriptData, analysis: any) => {
    const { is_multi_language, available_languages } = scriptData;
    const { hasComments, hasFunctions } = analysis;
    
    if (is_multi_language && available_languages.length > 3) {
      return 'Multi-Language Code Collection';
    } else if (hasComments && hasFunctions) {
      return 'Comprehensive Code Tutorial';
    } else if (hasComments) {
      return 'Documented Code Example';
    } else {
      return 'Code Snippet';
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const contentToAnalyze = getContentToAnalyze();
      const analysis = analyzeScriptContent(contentToAnalyze);
      
      const generatedSEO: GeneratedSEO = {
        meta_title: generateSEOTitle(scriptData, analysis),
        meta_description: generateSEODescription(scriptData, analysis),
        open_graph_title: generateSEOTitle(scriptData, analysis),
        open_graph_description: generateSEODescription(scriptData, analysis),
        schema_keywords: generateSchemaKeywords(scriptData, analysis),
        schema_categories: generateSchemaCategories(scriptData, analysis),
        schema_audience: generateSchemaAudience(scriptData, analysis),
        schema_learning_resource_type: generateLearningResourceType(scriptData, analysis)
      };
      
      onGenerate(generatedSEO);
    } catch (error) {
      console.error('Error generating SEO content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-900">AI SEO Generator</h3>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || isGenerating || !scriptData.title || !getContentToAnalyze()}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Auto Generate SEO
            </>
          )}
        </button>
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <p>✨ Analyzes script content and generates optimized SEO metadata</p>
        <p>🎯 Creates title, description, keywords, and schema structure</p>
        <p>🚀 Supports multi-language scripts and advanced categorization</p>
      </div>
      
      {(!scriptData.title || !getContentToAnalyze()) && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ⚠️ Please add a title and script content to enable auto-generation
        </div>
      )}
    </div>
  );
}
