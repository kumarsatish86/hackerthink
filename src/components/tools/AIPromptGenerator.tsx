"use client";

import React, { useState } from 'react';

type PromptType = 
  | 'blog-post' 
  | 'ad-copy' 
  | 'youtube-script' 
  | 'study-notes' 
  | 'linkedin-post' 
  | 'email-newsletter'
  | 'product-description'
  | 'resume-section'
  | 'social-media-post'
  | 'research-paper';

interface PromptTemplate {
  type: PromptType;
  title: string;
  description: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
    required: boolean;
  }>;
  generatePrompt: (data: Record<string, string>) => string;
}

const promptTemplates: Record<PromptType, PromptTemplate> = {
  'blog-post': {
    type: 'blog-post',
    title: 'Blog Post Writer',
    description: 'Generate prompts to create comprehensive blog posts',
    fields: [
      { key: 'topic', label: 'Topic', placeholder: 'e.g., Linux file permissions', type: 'text', required: true },
      { key: 'target_audience', label: 'Target Audience', placeholder: 'e.g., Beginners, SysAdmins, Developers', type: 'text', required: true },
      { key: 'tone', label: 'Tone', placeholder: 'e.g., Professional, Friendly, Technical', type: 'text', required: true },
      { key: 'length', label: 'Length', placeholder: 'e.g., 1000 words, 1500 words', type: 'text', required: true },
      { key: 'key_points', label: 'Key Points to Cover', placeholder: 'List main points separated by commas', type: 'textarea', required: false },
    ],
    generatePrompt: (data) => `Act as an expert content writer with deep knowledge in ${data.topic}. Write a comprehensive blog post for ${data.target_audience} with a ${data.tone} tone, approximately ${data.length} long.

${data.key_points ? `Key points to cover:\n${data.key_points}\n` : ''}
Requirements:
- Engaging introduction that hooks the reader
- Well-structured with clear sections and subheadings
- Include practical examples and real-world use cases
- Write in a clear, ${data.tone} tone
- Conclude with actionable takeaways
- Optimize for SEO with natural keyword integration

Generate the complete blog post now.`
  },
  'ad-copy': {
    type: 'ad-copy',
    title: 'Advertising Copy',
    description: 'Create compelling ad copy for marketing campaigns',
    fields: [
      { key: 'product', label: 'Product/Service', placeholder: 'e.g., Linux Administration Course', type: 'text', required: true },
      { key: 'target_audience', label: 'Target Audience', placeholder: 'e.g., IT Professionals, Students', type: 'text', required: true },
      { key: 'platform', label: 'Platform', placeholder: 'e.g., Google Ads, Facebook, LinkedIn', type: 'text', required: true },
      { key: 'benefits', label: 'Key Benefits', placeholder: 'e.g., Save time, Increase productivity', type: 'textarea', required: true },
      { key: 'call_to_action', label: 'Call to Action', placeholder: 'e.g., Sign up today, Get started', type: 'text', required: true },
    ],
    generatePrompt: (data) => `Act as an expert copywriter specializing in ${data.platform} advertising. Create compelling ad copy for ${data.product} targeting ${data.target_audience}.

Product/Service: ${data.product}
Key Benefits:
${data.benefits}

Requirements:
- Attention-grabbing headline (under ${data.platform === 'Google Ads' ? '30' : '40'} characters)
- Compelling body copy that highlights benefits
- Clear and persuasive call-to-action: "${data.call_to_action}"
- Write multiple variations (3-5 versions)
- Optimize for conversion and engagement
- Maintain brand voice and tone

Generate the ad copy now.`
  },
  'youtube-script': {
    type: 'youtube-script',
    title: 'YouTube Video Script',
    description: 'Generate engaging YouTube video scripts',
    fields: [
      { key: 'topic', label: 'Video Topic', placeholder: 'e.g., Understanding Linux Permissions', type: 'text', required: true },
      { key: 'duration', label: 'Duration', placeholder: 'e.g., 5 minutes, 10 minutes', type: 'text', required: true },
      { key: 'style', label: 'Style', placeholder: 'e.g., Educational, Entertaining, Fast-paced', type: 'text', required: true },
      { key: 'target_audience', label: 'Target Audience', placeholder: 'e.g., Beginners, Advanced users', type: 'text', required: true },
      { key: 'learning_outcomes', label: 'Learning Outcomes', placeholder: 'What viewers will learn', type: 'textarea', required: true },
    ],
    generatePrompt: (data) => `Act as a professional YouTube script writer. Create a ${data.style} video script about "${data.topic}" that's approximately ${data.duration} long, designed for ${data.target_audience}.

Learning outcomes:
${data.learning_outcomes}

Requirements:
- Hook viewers in the first 15 seconds
- Clear structure: Introduction → Main Content → Conclusion
- Include engagement prompts ("Like and subscribe", "Comment below")
- Add time stamps for major sections
- Include relevant examples and demonstrations
- End with a strong call-to-action
- Maintain conversational ${data.style} tone

Generate the complete video script now.`
  },
  'study-notes': {
    type: 'study-notes',
    title: 'Study Notes Generator',
    description: 'Convert study materials into organized notes',
    fields: [
      { key: 'subject', label: 'Subject/Topic', placeholder: 'e.g., Linux System Administration', type: 'text', required: true },
      { key: 'material', label: 'Study Material', placeholder: 'Paste text, PDF content, or lecture notes', type: 'textarea', required: true },
      { key: 'format', label: 'Note Format', placeholder: 'e.g., Bullet points, Outline, Mind map', type: 'select', options: ['Bullet Points', 'Outline Form', 'Cornell Style', 'Concept Map'], required: true },
      { key: 'focus_areas', label: 'Focus Areas', placeholder: 'e.g., Commands, Concepts, Examples', type: 'text', required: false },
    ],
    generatePrompt: (data) => `Act as an expert study coach specializing in ${data.subject}. Transform the following study material into well-organized ${data.format} study notes:

Study Material:
${data.material}

${data.focus_areas ? `Focus areas: ${data.focus_areas}\n` : ''}
Requirements:
- Create clear, hierarchical structure
- Extract and highlight key concepts
- Define important terms and explain them simply
- Add practical examples where relevant
- Organize in a logical flow
- Make it scannable and easy to review
- Include summary section at the end

Generate the study notes now.`
  },
  'linkedin-post': {
    type: 'linkedin-post',
    title: 'LinkedIn Viral Post',
    description: 'Create engaging LinkedIn posts with high engagement potential',
    fields: [
      { key: 'topic', label: 'Post Topic', placeholder: 'e.g., Importance of Security in Linux', type: 'text', required: true },
      { key: 'post_type', label: 'Post Type', placeholder: 'e.g., Personal story, Industry insight, Tips', type: 'select', options: ['Personal Story', 'Industry Insight', 'Quick Tips', 'Behind the Scenes', 'Opinion Piece'], required: true },
      { key: 'hook', label: 'Attention Hook', placeholder: 'Opening sentence that grabs attention', type: 'textarea', required: true },
      { key: 'key_message', label: 'Key Message', placeholder: 'Main point or takeaway', type: 'textarea', required: true },
      { key: 'call_to_action', label: 'Call to Action', placeholder: 'e.g., Share your thoughts below', type: 'text', required: true },
    ],
    generatePrompt: (data) => `Act as a LinkedIn content expert. Create a viral-worthy LinkedIn ${data.post_type.toLowerCase()} about "${data.topic}".

Hook: ${data.hook}
Key Message: ${data.key_message}
Call to Action: ${data.call_to_action}

Requirements:
- Compelling hook in the first line
- 3-5 short paragraphs (LinkedIn post format)
- Use storytelling techniques
- Add relevant hashtags (5-8 hashtags)
- Include an engaging question to drive comments
- Optimize for maximum engagement (likes, comments, shares)
- Write in authentic, professional voice

Generate the LinkedIn post now.`
  },
  'email-newsletter': {
    type: 'email-newsletter',
    title: 'Email Newsletter',
    description: 'Create engaging email newsletter content',
    fields: [
      { key: 'subject_line', label: 'Newsletter Topic/Subject', placeholder: 'e.g., Weekly Linux Tips', type: 'text', required: true },
      { key: 'subscriber_type', label: 'Subscriber Type', placeholder: 'e.g., Tech enthusiasts, Students', type: 'text', required: true },
      { key: 'main_content', label: 'Main Content Points', placeholder: 'List key topics or news items', type: 'textarea', required: true },
      { key: 'tone', label: 'Tone', placeholder: 'e.g., Professional, Friendly, Casual', type: 'text', required: true },
      { key: 'closing_message', label: 'Closing Message', placeholder: 'e.g., Thanks for reading!', type: 'text', required: true },
    ],
    generatePrompt: (data) => `Act as an expert email marketer. Create a compelling email newsletter for ${data.subscriber_type} about ${data.subject_line}.

Main Content Points:
${data.main_content}

Requirements:
- Eye-catching subject line (under 60 characters)
- Engaging greeting
- Well-structured body with clear sections
- Write in a ${data.tone} tone
- Add a personalized touch
- Include clear call-to-action
- Professional closing: "${data.closing_message}"
- Optimize for email clients (mobile-friendly)

Generate the complete email newsletter now.`
  },
  'product-description': {
    type: 'product-description',
    title: 'Product Description',
    description: 'Write compelling product descriptions for e-commerce',
    fields: [
      { key: 'product_name', label: 'Product Name', placeholder: 'e.g., Linux Administration Guide', type: 'text', required: true },
      { key: 'category', label: 'Category', placeholder: 'e.g., Software, Book, Course', type: 'text', required: true },
      { key: 'features', label: 'Key Features', placeholder: 'List main features, one per line', type: 'textarea', required: true },
      { key: 'benefits', label: 'Customer Benefits', placeholder: 'What problems it solves', type: 'textarea', required: true },
      { key: 'target_customer', label: 'Target Customer', placeholder: 'e.g., IT Professionals, Students', type: 'text', required: true },
    ],
    generatePrompt: (data) => `Act as an expert copywriter specializing in product descriptions for e-commerce. Create a compelling product description for ${data.product_name}.

Category: ${data.category}
Key Features:
${data.features}

Customer Benefits:
${data.benefits}

Target Customer: ${data.target_customer}

Requirements:
- Attention-grabbing headline
- Clear feature list with benefits
- Problem-solving language
- Add social proof elements (where applicable)
- Include clear calls-to-action
- Optimize for SEO (natural keyword integration)
- Write in persuasive, benefit-focused tone

Generate the complete product description now.`
  },
  'resume-section': {
    type: 'resume-section',
    title: 'Resume Section Writer',
    description: 'Write professional resume sections and bullet points',
    fields: [
      { key: 'section_type', label: 'Section Type', placeholder: 'Select type', type: 'select', options: ['Work Experience', 'Skills', 'Projects', 'Achievements', 'Professional Summary'], required: true },
      { key: 'job_title', label: 'Job Title/Role', placeholder: 'e.g., Linux System Administrator', type: 'text', required: false },
      { key: 'company', label: 'Company/Context', placeholder: 'e.g., XYZ Corporation', type: 'text', required: false },
      { key: 'description', label: 'Responsibilities/Details', placeholder: 'Describe your role and accomplishments', type: 'textarea', required: true },
      { key: 'achievements', label: 'Key Achievements', placeholder: 'List major accomplishments', type: 'textarea', required: false },
    ],
    generatePrompt: (data) => {
      const sectionPrompt = {
        'Work Experience': `Act as a professional resume writer. Create ${data.section_type.toLowerCase()} bullets for ${data.job_title} at ${data.company || 'the company'}.

Responsibilities: ${data.description}
${data.achievements ? `\nAchievements: ${data.achievements}` : ''}

Requirements:
- 4-6 bullet points starting with action verbs
- Quantify results (numbers, percentages, impact)
- Use strong, achievement-focused language
- Show progression and value delivered
- Optimize for ATS (Applicant Tracking Systems)
- Professional tone

Generate the ${data.section_type.toLowerCase()} bullets now.`,

        'Skills': `Act as a professional resume writer. List and organize skills for a ${data.job_title || 'professional'} resume.

Context: ${data.description}
${data.achievements ? `\nKey technical skills: ${data.achievements}` : ''}

Requirements:
- Organize by category (Technical, Soft Skills, Tools)
- Use industry-standard terminology
- Prioritize most relevant skills
- Format for ATS optimization
- Professional presentation

Generate the skills section now.`,

        'Professional Summary': `Act as a professional resume writer. Create a professional summary for ${data.job_title || 'a professional'}.

Background: ${data.description}
${data.achievements ? `\nKey highlights: ${data.achievements}` : ''}

Requirements:
- 3-4 sentences summarizing career
- Highlight years of experience
- Emphasize key skills and achievements
- Professional and concise tone
- ATS-friendly language
- Compelling opening sentence

Generate the professional summary now.`
      };

      return sectionPrompt[data.section_type as keyof typeof sectionPrompt] || sectionPrompt['Work Experience'];
    }
  },
  'social-media-post': {
    type: 'social-media-post',
    title: 'Social Media Post',
    description: 'Create engaging social media content',
    fields: [
      { key: 'platform', label: 'Platform', placeholder: 'Select platform', type: 'select', options: ['Twitter', 'Instagram', 'Facebook', 'TikTok'], required: true },
      { key: 'topic', label: 'Post Topic', placeholder: 'e.g., Daily Linux Tip', type: 'text', required: true },
      { key: 'audience', label: 'Target Audience', placeholder: 'e.g., Developers, Tech enthusiasts', type: 'text', required: true },
      { key: 'message', label: 'Main Message', placeholder: 'What to communicate', type: 'textarea', required: true },
      { key: 'hashtags', label: 'Hashtags (optional)', placeholder: 'e.g., #Linux #Tech #Devops', type: 'text', required: false },
    ],
    generatePrompt: (data) => `Act as a social media expert. Create a ${data.platform} post about "${data.topic}" for ${data.audience}.

Main Message: ${data.message}
${data.hashtags ? `Hashtags to include: ${data.hashtags}` : ''}

Requirements:
- ${data.platform === 'Twitter' ? 'Under 280 characters' : data.platform === 'Instagram' ? 'Include engaging caption and relevant hashtags (5-10 hashtags)' : 'Engaging, shareable content'}
- Hook viewers in the first line
- Clear, concise message
- ${data.platform === 'Instagram' || data.platform === 'TikTok' ? 'Add emojis appropriately' : 'Professional tone'}
- Include call-to-action
- Optimize for maximum engagement

Generate the ${data.platform.toLowerCase()} post now.`
  },
  'research-paper': {
    type: 'research-paper',
    title: 'Research Paper Assistant',
    description: 'Generate prompts for academic research and writing',
    fields: [
      { key: 'topic', label: 'Research Topic', placeholder: 'e.g., Impact of Cloud Computing on IT Infrastructure', type: 'text', required: true },
      { key: 'discipline', label: 'Academic Discipline', placeholder: 'e.g., Computer Science, Information Systems', type: 'text', required: true },
      { key: 'research_question', label: 'Research Question', placeholder: 'What are you investigating?', type: 'textarea', required: true },
      { key: 'scope', label: 'Scope/Limitations', placeholder: 'e.g., Focus on Linux-based systems', type: 'text', required: false },
      { key: 'requirements', label: 'Special Requirements', placeholder: 'e.g., Cite 10 sources, APA format', type: 'textarea', required: false },
    ],
    generatePrompt: (data) => `Act as an academic writing assistant in ${data.discipline}. Help me develop a research framework for: "${data.topic}"

Research Question: ${data.research_question}
${data.scope ? `Scope/Limitations: ${data.scope}` : ''}
${data.requirements ? `\nSpecial Requirements: ${data.requirements}` : ''}

Requirements:
- Develop comprehensive research methodology
- Outline key sections (Introduction, Literature Review, Methodology, Results, Discussion, Conclusion)
- Identify relevant academic sources and databases
- Suggest theoretical frameworks
- Provide sample structure
- Follow academic writing standards for ${data.discipline}
- Include proper citation guidelines

Generate the research framework now.`
  }
};

export function AIPromptGenerator() {
  const [selectedType, setSelectedType] = useState<PromptType>('blog-post');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  
  const currentTemplate = promptTemplates[selectedType];

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    const prompt = currentTemplate.generatePrompt(formData);
    setGeneratedPrompt(prompt);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    alert('Prompt copied to clipboard!');
  };

  const isFormValid = () => {
    return currentTemplate.fields.every(field => 
      !field.required || formData[field.key]
    );
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#9333EA"/>
          <path d="M2 17L12 22L22 17" stroke="#9333EA" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#9333EA" strokeWidth="2" fill="none"/>
        </svg>
        AI Prompt Generator
      </h2>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-purple-700">Select Use Case</label>
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value as PromptType);
            setFormData({});
            setGeneratedPrompt('');
          }}
          className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-purple-800 mb-4"
        >
          {Object.values(promptTemplates).map(template => (
            <option key={template.type} value={template.type}>{template.title}</option>
          ))}
        </select>

        <p className="text-sm text-gray-600 mb-4">{currentTemplate.description}</p>

        <div className="space-y-4">
          {currentTemplate.fields.map(field => (
            <div key={field.key}>
              <label className="block mb-2 font-medium text-purple-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-y min-h-[100px]"
                  rows={4}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-3 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={!isFormValid()}
          className={`w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
            isFormValid()
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Generate Perfect Prompt
        </button>
      </div>

      {generatedPrompt && (
        <div className="bg-purple-800 text-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-100">Your Generated Prompt</h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-sm transition-colors"
            >
              Copy Prompt
            </button>
          </div>
          <div className="bg-purple-900 rounded p-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
          </div>
          <div className="mt-4 text-sm text-purple-200">
            💡 <strong>Tip:</strong> Copy this prompt and paste it into ChatGPT, Claude, or any AI assistant for amazing results!
          </div>
        </div>
      )}
    </div>
  );
}

export function AIPromptGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">What is a Perfect Prompt?</h2>
        <p className="text-gray-700 text-lg">
          A <strong>perfect prompt</strong> is a well-crafted instruction that guides AI assistants to produce the exact output you need. The quality of your output depends heavily on how you prompt the AI.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-3">
          This tool helps you create professional prompts by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li>Selecting your use case from multiple templates</li>
          <li>Filling in specific details about your task</li>
          <li>Generating a polished, ready-to-use prompt</li>
          <li>Copying and pasting into your AI assistant</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Available Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">📝 Content Creation</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Blog Posts</li>
              <li>• Social Media Posts</li>
              <li>• Email Newsletters</li>
              <li>• LinkedIn Posts</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">📺 Media & Scripts</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• YouTube Scripts</li>
              <li>• Video Outlines</li>
              <li>• Presentation Content</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🎓 Education</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Study Notes</li>
              <li>• Research Papers</li>
              <li>• Assignment Help</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">💼 Professional</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Resume Sections</li>
              <li>• Product Descriptions</li>
              <li>• Ad Copy</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li>Be specific about your target audience and goals</li>
          <li>Provide context and background information</li>
          <li>Specify the desired tone and style</li>
          <li>Include examples of what you want (when relevant)</li>
          <li>Copy the generated prompt exactly into your AI assistant</li>
          <li>Iterate and refine based on results</li>
        </ul>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Why Use Structured Prompts?</h2>
        <p className="text-gray-700 text-lg">
          Structured prompts produce <strong>better, more consistent results</strong> compared to generic instructions. Our tool helps you think through all the variables that matter for your specific use case, ensuring you get exactly what you need from AI assistants.
        </p>
      </section>
    </>
  );
}

export default AIPromptGenerator;

