"use client";

import React, { useState } from 'react';

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  tool?: string;
  prompt?: string;
  color: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  steps: WorkflowStep[];
}

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'Create blog posts, articles, and social media content',
    category: 'Content',
    icon: '✍️',
    steps: [
      {
        id: 1,
        title: 'Research & Outline',
        description: 'Research topic and create outline',
        icon: '🔍',
        tool: 'Claude / GPT-4',
        prompt: 'Research the topic "[TOPIC]" and create a detailed outline with key points and subtopics.',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Draft Content',
        description: 'Write first draft based on outline',
        icon: '📝',
        tool: 'GPT-4 / Claude',
        prompt: 'Write a comprehensive article based on this outline: [OUTLINE]. Include engaging introduction, detailed body sections, and strong conclusion.',
        color: 'green'
      },
      {
        id: 3,
        title: 'Edit & Refine',
        description: 'Improve clarity, tone, and flow',
        icon: '✏️',
        tool: 'Claude',
        prompt: 'Edit and refine this content: [DRAFT]. Improve clarity, tone, and flow. Ensure it\'s engaging and well-structured.',
        color: 'purple'
      },
      {
        id: 4,
        title: 'SEO Optimization',
        description: 'Add keywords and optimize for search',
        icon: '🎯',
        tool: 'GPT-4',
        prompt: 'Optimize this content for SEO: [CONTENT]. Add relevant keywords, meta descriptions, and improve search engine visibility.',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Create Visuals',
        description: 'Generate images and graphics',
        icon: '🎨',
        tool: 'DALL-E / Midjourney',
        prompt: 'Create a visual for this content: [CONTENT]. Design an engaging image that represents the main topic.',
        color: 'pink'
      },
      {
        id: 6,
        title: 'Final Review',
        description: 'Review and publish',
        icon: '✅',
        tool: 'Human Review',
        prompt: 'Review the final content for accuracy, completeness, and brand alignment.',
        color: 'teal'
      }
    ]
  },
  {
    id: 'research',
    name: 'Research & Analysis',
    description: 'Conduct research and analyze information',
    category: 'Research',
    icon: '🔬',
    steps: [
      {
        id: 1,
        title: 'Define Research Question',
        description: 'Clarify research objectives',
        icon: '❓',
        tool: 'GPT-4',
        prompt: 'Help me define a clear research question for: [TOPIC]. What are the key aspects I should investigate?',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Gather Sources',
        description: 'Find relevant information sources',
        icon: '📚',
        tool: 'Perplexity / ChatGPT',
        prompt: 'Find credible sources and information about: [RESEARCH_QUESTION]. Include academic papers, articles, and expert opinions.',
        color: 'green'
      },
      {
        id: 3,
        title: 'Extract Key Information',
        description: 'Summarize and extract important data',
        icon: '📊',
        tool: 'Claude',
        prompt: 'Analyze these sources: [SOURCES]. Extract key information, facts, and insights relevant to: [RESEARCH_QUESTION].',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Analyze & Synthesize',
        description: 'Combine insights and identify patterns',
        icon: '🧠',
        tool: 'GPT-4',
        prompt: 'Synthesize this information: [DATA]. Identify patterns, trends, and key insights. Provide analysis and conclusions.',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Create Report',
        description: 'Compile findings into structured report',
        icon: '📄',
        tool: 'Claude',
        prompt: 'Create a comprehensive research report based on: [ANALYSIS]. Include executive summary, findings, and recommendations.',
        color: 'pink'
      },
      {
        id: 6,
        title: 'Visualize Data',
        description: 'Create charts and visualizations',
        icon: '📈',
        tool: 'Data Visualization Tools',
        prompt: 'Create visualizations for this research data: [DATA]. Include charts, graphs, and infographics.',
        color: 'teal'
      }
    ]
  },
  {
    id: 'coding',
    name: 'Coding & Development',
    description: 'Build applications and write code',
    category: 'Development',
    icon: '💻',
    steps: [
      {
        id: 1,
        title: 'Define Requirements',
        description: 'Clarify project requirements',
        icon: '📋',
        tool: 'GPT-4',
        prompt: 'Help me define requirements for: [PROJECT]. What features, functionality, and technical specs should I consider?',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Design Architecture',
        description: 'Plan system structure and components',
        icon: '🏗️',
        tool: 'Claude',
        prompt: 'Design the architecture for: [PROJECT]. Suggest tech stack, database design, API structure, and component organization.',
        color: 'green'
      },
      {
        id: 3,
        title: 'Generate Code',
        description: 'Write code for components',
        icon: '⚙️',
        tool: 'GPT-4 / GitHub Copilot',
        prompt: 'Generate code for: [COMPONENT]. Use [LANGUAGE] and follow best practices. Include comments and error handling.',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Review & Test',
        description: 'Test code and identify issues',
        icon: '🧪',
        tool: 'GPT-4',
        prompt: 'Review this code: [CODE]. Identify bugs, suggest improvements, and write unit tests.',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Refactor & Optimize',
        description: 'Improve code quality and performance',
        icon: '⚡',
        tool: 'Claude',
        prompt: 'Refactor and optimize this code: [CODE]. Improve performance, readability, and maintainability.',
        color: 'pink'
      },
      {
        id: 6,
        title: 'Documentation',
        description: 'Create documentation and comments',
        icon: '📖',
        tool: 'GPT-4',
        prompt: 'Create documentation for: [CODE]. Include API docs, usage examples, and code comments.',
        color: 'teal'
      }
    ]
  },
  {
    id: 'social-media',
    name: 'Social Media Management',
    description: 'Create and schedule social media content',
    category: 'Marketing',
    icon: '📱',
    steps: [
      {
        id: 1,
        title: 'Content Planning',
        description: 'Plan content calendar and themes',
        icon: '📅',
        tool: 'GPT-4',
        prompt: 'Create a 30-day content calendar for [BRAND]. Include themes, topics, and posting schedule.',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Write Posts',
        description: 'Create engaging social media posts',
        icon: '✍️',
        tool: 'Claude',
        prompt: 'Write engaging social media posts for: [TOPIC]. Make them authentic, engaging, and optimized for [PLATFORM].',
        color: 'green'
      },
      {
        id: 3,
        title: 'Create Visuals',
        description: 'Design images and graphics',
        icon: '🎨',
        tool: 'DALL-E / Canva',
        prompt: 'Create social media visuals for: [POST]. Design images that are eye-catching and on-brand.',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Add Hashtags',
        description: 'Generate relevant hashtags',
        icon: '🏷️',
        tool: 'GPT-4',
        prompt: 'Generate relevant hashtags for: [POST]. Include trending and niche hashtags for maximum reach.',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Schedule Posts',
        description: 'Schedule content for optimal timing',
        icon: '⏰',
        tool: 'Scheduling Tools',
        prompt: 'Schedule these posts for optimal engagement times on [PLATFORM].',
        color: 'pink'
      },
      {
        id: 6,
        title: 'Analyze Performance',
        description: 'Track metrics and engagement',
        icon: '📊',
        tool: 'Analytics Tools',
        prompt: 'Analyze social media performance. Identify top-performing content and optimization opportunities.',
        color: 'teal'
      }
    ]
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    description: 'Create and send email campaigns',
    category: 'Marketing',
    icon: '📧',
    steps: [
      {
        id: 1,
        title: 'Define Campaign Goals',
        description: 'Set objectives and target audience',
        icon: '🎯',
        tool: 'GPT-4',
        prompt: 'Help me define goals and target audience for: [CAMPAIGN]. What metrics should I track?',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Write Email Copy',
        description: 'Create compelling email content',
        icon: '✍️',
        tool: 'Claude',
        prompt: 'Write email copy for: [CAMPAIGN]. Include engaging subject line, body, and call-to-action.',
        color: 'green'
      },
      {
        id: 3,
        title: 'Design Template',
        description: 'Create email template and layout',
        icon: '🎨',
        tool: 'Design Tools',
        prompt: 'Design an email template for: [CAMPAIGN]. Make it responsive, on-brand, and conversion-focused.',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Segment Audience',
        description: 'Segment subscribers by preferences',
        icon: '👥',
        tool: 'GPT-4',
        prompt: 'Suggest audience segments for: [CAMPAIGN]. How should I personalize content for different segments?',
        color: 'orange'
      },
      {
        id: 5,
        title: 'A/B Test',
        description: 'Test subject lines and content',
        icon: '🧪',
        tool: 'Email Platform',
        prompt: 'Set up A/B tests for subject lines and email content to optimize open rates.',
        color: 'pink'
      },
      {
        id: 6,
        title: 'Send & Analyze',
        description: 'Send campaign and track results',
        icon: '📈',
        tool: 'Analytics',
        prompt: 'Analyze email campaign performance. Track open rates, click-through rates, and conversions.',
        color: 'teal'
      }
    ]
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze data and generate insights',
    category: 'Analytics',
    icon: '📊',
    steps: [
      {
        id: 1,
        title: 'Prepare Data',
        description: 'Clean and prepare dataset',
        icon: '🧹',
        tool: 'Python / R',
        prompt: 'Clean and prepare this dataset: [DATA]. Handle missing values, outliers, and format issues.',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Explore Data',
        description: 'Explore patterns and relationships',
        icon: '🔍',
        tool: 'GPT-4',
        prompt: 'Analyze this dataset: [DATA]. Identify patterns, correlations, and interesting insights.',
        color: 'green'
      },
      {
        id: 3,
        title: 'Generate Insights',
        description: 'Extract key insights and findings',
        icon: '💡',
        tool: 'Claude',
        prompt: 'Generate insights from: [ANALYSIS]. What are the key findings and business implications?',
        color: 'purple'
      },
      {
        id: 4,
        title: 'Create Visualizations',
        description: 'Build charts and dashboards',
        icon: '📈',
        tool: 'Tableau / Python',
        prompt: 'Create visualizations for: [DATA]. Design charts and dashboards that clearly communicate insights.',
        color: 'orange'
      },
      {
        id: 5,
        title: 'Write Report',
        description: 'Compile findings into report',
        icon: '📄',
        tool: 'GPT-4',
        prompt: 'Write a data analysis report based on: [INSIGHTS]. Include executive summary, findings, and recommendations.',
        color: 'pink'
      },
      {
        id: 6,
        title: 'Present Findings',
        description: 'Create presentation and share',
        icon: '📽️',
        tool: 'Presentation Tools',
        prompt: 'Create a presentation for: [REPORT]. Make it visual, engaging, and actionable.',
        color: 'teal'
      }
    ]
  }
];

export function AIWorkflowBlueprintBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [workflow, setWorkflow] = useState<WorkflowTemplate | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setWorkflow(template);
      setShowWorkflow(true);
    }
  };

  const handleClear = () => {
    setSelectedTemplate('');
    setWorkflow(null);
    setShowWorkflow(false);
  };

  const handleCopy = () => {
    if (!workflow) return;
    
    const text = `${workflow.name} Workflow\n\n${workflow.steps.map(step => 
      `${step.id}. ${step.title} (${step.tool || 'Manual'})\n   ${step.description}\n   Prompt: ${step.prompt || 'N/A'}\n`
    ).join('\n')}`;
    
    navigator.clipboard.writeText(text);
    alert('Workflow copied to clipboard!');
  };

  const selectedTemplateData = workflowTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-indigo-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#4F46E5" strokeWidth="2" fill="none"/>
        </svg>
        AI Workflow Blueprint Builder
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Template Selection */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold text-indigo-700">
            Select Task Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {workflowTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${
                  selectedTemplate === template.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-indigo-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-4xl mb-2">{template.icon}</div>
                <div className={`font-bold text-sm mb-1 ${
                  selectedTemplate === template.id ? 'text-indigo-800' : 'text-gray-900'
                }`}>
                  {template.name}
                </div>
                <div className="text-xs text-gray-600">{template.category}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedTemplate && (
          <div className="flex gap-3">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {showWorkflow && workflow && (
        <div className="space-y-6">
          {/* Workflow Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{workflow.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-indigo-800">{workflow.name} Workflow</h3>
                    <p className="text-gray-600">{workflow.description}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy Workflow
              </button>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500"
              >
                <div className="flex items-start gap-4">
                  {/* Step Number & Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-${step.color}-100 flex items-center justify-center border-4 border-${step.color}-300`}>
                    <div className="text-center">
                      <div className="text-2xl">{step.icon}</div>
                      <div className={`text-xs font-bold text-${step.color}-800 mt-1`}>
                        Step {step.id}
                      </div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{step.title}</h4>
                      {step.tool && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                          {step.tool}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{step.description}</p>
                    {step.prompt && (
                      <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-300">
                        <p className="text-sm font-semibold text-gray-700 mb-1">💬 AI Prompt:</p>
                        <p className="text-sm text-gray-800 font-mono">{step.prompt}</p>
                      </div>
                    )}
                  </div>

                  {/* Arrow (if not last step) */}
                  {index < workflow.steps.length - 1 && (
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                        <path d="M12 5v14M19 12l-7 7-7-7"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Summary */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-6 border-2 border-indigo-200">
            <h4 className="text-lg font-bold text-indigo-800 mb-3">📋 Workflow Summary</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Steps</p>
                <p className="text-2xl font-bold text-indigo-800">{workflow.steps.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">AI Tools Used</p>
                <p className="text-2xl font-bold text-purple-800">
                  {new Set(workflow.steps.filter(s => s.tool).map(s => s.tool)).size}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Estimated Time</p>
                <p className="text-2xl font-bold text-pink-800">
                  {workflow.steps.length * 15}-{workflow.steps.length * 30} min
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIWorkflowBlueprintBuilderInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">What is an AI Workflow Blueprint Builder?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Workflow Blueprint Builder</strong> is a visual tool that generates step-by-step AI workflows 
          for different tasks. Select a task type (content creation, research, coding, social media, email marketing, 
          data analysis) and the tool creates a visual workflow blueprint with icons, step descriptions, and AI prompts. 
          Perfect for people who love "visual automation" style guides and want to understand how to automate tasks with AI.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Workflow Blueprint Builder:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Task Selection:</strong> Choose from 6 different task types</li>
          <li><strong>Visual Workflow:</strong> Generates step-by-step workflow with icons and descriptions</li>
          <li><strong>AI Prompts:</strong> Includes ready-to-use prompts for each step</li>
          <li><strong>Tool Recommendations:</strong> Suggests best AI tools for each step</li>
          <li><strong>Visual Display:</strong> Shows workflow in an easy-to-follow visual format</li>
          <li><strong>Export Functionality:</strong> Copy workflow for sharing or documentation</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Available Workflow Templates</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowTemplates.map(template => (
            <div key={template.id} className="bg-white p-5 rounded-lg border-2 border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <h3 className="font-bold text-indigo-800">{template.name}</h3>
                  <p className="text-xs text-gray-600">{template.category}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3">{template.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>{template.steps.length} steps</span>
                <span>•</span>
                <span>{template.steps.length * 15}-{template.steps.length * 30} min</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-l-4 border-indigo-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Visual Automation Guides:</strong> See step-by-step workflows visually</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Ready-to-Use Prompts:</strong> Get AI prompts for each workflow step</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Tool Recommendations:</strong> Know which AI tools to use for each step</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Shareable Content:</strong> Copy and share workflows with your team</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Learn Automation:</strong> Understand how to automate tasks with AI</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Choose the right template:</strong> Select the workflow that matches your task</li>
          <li><strong>Customize prompts:</strong> Adapt the provided prompts to your specific needs</li>
          <li><strong>Follow the sequence:</strong> Workflows are designed to be followed in order</li>
          <li><strong>Use recommended tools:</strong> Each step suggests the best AI tool for that task</li>
          <li><strong>Save workflows:</strong> Copy and save workflows for future reference</li>
          <li><strong>Share with team:</strong> Use workflows to standardize processes across your team</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-800 mb-3">✅ Content Creators</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Visual workflow guides</li>
              <li>• Automation templates</li>
              <li>• Step-by-step processes</li>
              <li>• Shareable workflows</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">✅ Teams</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Standardize processes</li>
              <li>• Onboarding guides</li>
              <li>• Best practices</li>
              <li>• Documentation</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Select a task type</strong> (Content Creation, Research, Coding, etc.)</li>
          <li><strong>View the workflow</strong> with step-by-step instructions</li>
          <li><strong>Review AI prompts</strong> for each step</li>
          <li><strong>Follow the workflow</strong> in sequence for best results</li>
          <li><strong>Customize prompts</strong> to fit your specific needs</li>
          <li><strong>Copy workflow</strong> to share or save for later</li>
          <li><strong>Use recommended tools</strong> for each step</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Save workflows you use frequently and customize them for your specific needs. 
          These workflows are designed as starting points that you can adapt to your workflow.
        </p>
      </section>
    </>
  );
}

export default AIWorkflowBlueprintBuilder;

