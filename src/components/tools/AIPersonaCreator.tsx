"use client";

import React, { useState } from 'react';

interface PersonaAttributes {
  name: string;
  role: string;
  background: string;
  expertise: string[];
  goals: string[];
  tone: string;
  style: string;
  communicationStyle: string;
  personality: string[];
  specialties: string[];
  limitations: string[];
}

const personaTemplates: Record<string, Partial<PersonaAttributes>> = {
  'tech-mentor': {
    role: 'Tech Mentor',
    background: 'Experienced software engineer and tech educator with 10+ years of industry experience',
    expertise: ['Software Development', 'System Architecture', 'Code Review', 'Career Guidance'],
    tone: 'Supportive and encouraging',
    style: 'Educational and practical',
    communicationStyle: 'Clear explanations with examples',
    personality: ['Patient', 'Knowledgeable', 'Encouraging', 'Practical'],
    specialties: ['Programming', 'Technical Interviews', 'Career Growth', 'Best Practices'],
    limitations: ['Cannot provide financial advice', 'Focuses on technical topics only']
  },
  'investor-advisor': {
    role: 'Investor Advisor',
    background: 'Seasoned venture capitalist and angel investor with 15+ years of investment experience',
    expertise: ['Startup Valuation', 'Funding Strategies', 'Market Analysis', 'Pitch Reviews'],
    tone: 'Professional and analytical',
    style: 'Data-driven and strategic',
    communicationStyle: 'Direct feedback with actionable insights',
    personality: ['Analytical', 'Strategic', 'Results-oriented', 'Honest'],
    specialties: ['Fundraising', 'Business Models', 'Market Positioning', 'Growth Strategies'],
    limitations: ['Not providing legal or tax advice', 'Opinions based on general market trends']
  },
  'business-consultant': {
    role: 'Business Consultant',
    background: 'Strategic business consultant specializing in growth and optimization',
    expertise: ['Business Strategy', 'Operations', 'Marketing', 'Sales'],
    tone: 'Professional and solution-focused',
    style: 'Strategic and actionable',
    communicationStyle: 'Clear recommendations with implementation steps',
    personality: ['Strategic', 'Problem-solving', 'Action-oriented', 'Results-driven'],
    specialties: ['Business Planning', 'Process Optimization', 'Market Entry', 'Scaling'],
    limitations: ['General advice only', 'Not providing legal or financial services']
  },
  'creative-director': {
    role: 'Creative Director',
    background: 'Award-winning creative director with expertise in brand identity and design',
    expertise: ['Brand Strategy', 'Visual Design', 'Content Creation', 'Creative Direction'],
    tone: 'Inspiring and visionary',
    style: 'Creative and innovative',
    communicationStyle: 'Visual thinking with conceptual explanations',
    personality: ['Creative', 'Innovative', 'Visionary', 'Collaborative'],
    specialties: ['Brand Identity', 'Visual Design', 'Content Strategy', 'Creative Campaigns'],
    limitations: ['Not providing technical implementation', 'Focuses on creative concepts']
  }
};

function generatePersonaPrompt(attributes: PersonaAttributes): string {
  const prompt = `You are ${attributes.name}, ${attributes.role}.

BACKGROUND:
${attributes.background}

EXPERTISE AREAS:
${attributes.expertise.map(e => `• ${e}`).join('\n')}

SPECIALTIES:
${attributes.specialties.map(s => `• ${s}`).join('\n')}

GOALS AND OBJECTIVES:
${attributes.goals.map(g => `• ${g}`).join('\n')}

COMMUNICATION STYLE:
• Tone: ${attributes.tone}
• Style: ${attributes.style}
• Approach: ${attributes.communicationStyle}

PERSONALITY TRAITS:
${attributes.personality.map(p => `• ${p}`).join('\n')}

LIMITATIONS:
${attributes.limitations.map(l => `• ${l}`).join('\n')}

HOW TO INTERACT:
- Always stay in character as ${attributes.name}
- Provide responses that align with your expertise and background
- Use your ${attributes.tone} tone and ${attributes.style} style
- Focus on your specialties: ${attributes.specialties.join(', ')}
- Acknowledge your limitations when asked about topics outside your expertise
- Be helpful, accurate, and maintain your persona throughout the conversation

Remember: You are ${attributes.name}, ${attributes.role}. Every response should reflect your background, expertise, and personality.`;

  return prompt;
}

export function AIPersonaCreator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [personaAttributes, setPersonaAttributes] = useState<PersonaAttributes>({
    name: '',
    role: '',
    background: '',
    expertise: [''],
    goals: [''],
    tone: 'Professional',
    style: 'Clear and concise',
    communicationStyle: 'Direct and helpful',
    personality: ['Professional', 'Helpful'],
    specialties: [''],
    limitations: ['']
  });
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTemplateSelect = (templateKey: string) => {
    if (templateKey === 'custom') {
      setSelectedTemplate('custom');
      return;
    }

    const template = personaTemplates[templateKey];
    if (template) {
      setSelectedTemplate(templateKey);
      setPersonaAttributes({
        name: template.role || '',
        role: template.role || '',
        background: template.background || '',
        expertise: template.expertise || [''],
        goals: ['Help users achieve their goals', 'Provide expert guidance'],
        tone: template.tone || 'Professional',
        style: template.style || 'Clear and concise',
        communicationStyle: template.communicationStyle || 'Direct and helpful',
        personality: template.personality || ['Professional'],
        specialties: template.specialties || [''],
        limitations: template.limitations || ['']
      });
    }
  };

  const handleAttributeChange = (field: keyof PersonaAttributes, value: any) => {
    setPersonaAttributes(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof PersonaAttributes, index: number, value: string) => {
    setPersonaAttributes(prev => {
      const arr = [...(prev[field] as string[])];
      arr[index] = value;
      return {
        ...prev,
        [field]: arr
      };
    });
  };

  const addArrayItem = (field: keyof PersonaAttributes) => {
    setPersonaAttributes(prev => {
      const arr = [...(prev[field] as string[])];
      arr.push('');
      return {
        ...prev,
        [field]: arr
      };
    });
  };

  const removeArrayItem = (field: keyof PersonaAttributes, index: number) => {
    setPersonaAttributes(prev => {
      const arr = [...(prev[field] as string[])];
      if (arr.length > 1) {
        arr.splice(index, 1);
      }
      return {
        ...prev,
        [field]: arr
      };
    });
  };

  const handleGenerate = () => {
    if (!personaAttributes.name || !personaAttributes.role) {
      alert('Please enter at least a name and role for the persona');
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const prompt = generatePersonaPrompt(personaAttributes);
      setGeneratedPrompt(prompt);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      alert('Persona prompt copied to clipboard!');
    }
  };

  const isFormValid = () => {
    return personaAttributes.name.trim() !== '' && personaAttributes.role.trim() !== '';
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-emerald-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#047857" strokeWidth="2" fill="none"/>
          <circle cx="12" cy="7" r="4" stroke="#047857" strokeWidth="2" fill="none"/>
        </svg>
        AI Persona Creator
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-emerald-700">
            Choose a Template (Optional)
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          >
            <option value="custom">Custom Persona (Start from scratch)</option>
            <option value="tech-mentor">Tech Mentor</option>
            <option value="investor-advisor">Investor Advisor</option>
            <option value="business-consultant">Business Consultant</option>
            <option value="creative-director">Creative Director</option>
          </select>
          <p className="text-sm text-gray-600 mt-2">
            Select a template to pre-fill common persona attributes, or start custom
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-emerald-700">
                Persona Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={personaAttributes.name}
                onChange={(e) => handleAttributeChange('name', e.target.value)}
                placeholder="e.g., Alex, Tech Mentor, Sarah"
                className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-emerald-700">
                Role/Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={personaAttributes.role}
                onChange={(e) => handleAttributeChange('role', e.target.value)}
                placeholder="e.g., Tech Mentor, Investor Advisor, Business Consultant"
                className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block mb-2 font-semibold text-emerald-700">
              Background
            </label>
            <textarea
              value={personaAttributes.background}
              onChange={(e) => handleAttributeChange('background', e.target.value)}
              placeholder="Describe the persona's background, experience, and credentials..."
              rows={3}
              className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 resize-y"
            />
          </div>

          {/* Expertise Areas */}
          <div>
            <label className="block mb-2 font-semibold text-emerald-700">
              Expertise Areas
            </label>
            {personaAttributes.expertise.map((exp, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={exp}
                  onChange={(e) => handleArrayChange('expertise', index, e.target.value)}
                  placeholder="e.g., Software Development, Investment Analysis"
                  className="flex-1 p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                {personaAttributes.expertise.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('expertise', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('expertise')}
              className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
            >
              + Add Expertise
            </button>
          </div>

          {/* Goals */}
          <div>
            <label className="block mb-2 font-semibold text-emerald-700">
              Goals & Objectives
            </label>
            {personaAttributes.goals.map((goal, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleArrayChange('goals', index, e.target.value)}
                  placeholder="e.g., Help users achieve their goals, Provide expert guidance"
                  className="flex-1 p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                {personaAttributes.goals.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('goals', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('goals')}
              className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
            >
              + Add Goal
            </button>
          </div>

          {/* Communication Style */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-emerald-700">
                Tone
              </label>
              <select
                value={personaAttributes.tone}
                onChange={(e) => handleAttributeChange('tone', e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Supportive">Supportive</option>
                <option value="Analytical">Analytical</option>
                <option value="Encouraging">Encouraging</option>
                <option value="Formal">Formal</option>
                <option value="Casual">Casual</option>
                <option value="Inspiring">Inspiring</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-emerald-700">
                Style
              </label>
              <select
                value={personaAttributes.style}
                onChange={(e) => handleAttributeChange('style', e.target.value)}
                className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Clear and concise">Clear and concise</option>
                <option value="Detailed and thorough">Detailed and thorough</option>
                <option value="Educational">Educational</option>
                <option value="Strategic">Strategic</option>
                <option value="Creative">Creative</option>
                <option value="Practical">Practical</option>
                <option value="Data-driven">Data-driven</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-emerald-700">
                Communication Style
              </label>
              <input
                type="text"
                value={personaAttributes.communicationStyle}
                onChange={(e) => handleAttributeChange('communicationStyle', e.target.value)}
                placeholder="e.g., Direct and helpful"
                className="w-full p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* Personality Traits */}
          <div>
            <label className="block mb-2 font-semibold text-emerald-700">
              Personality Traits
            </label>
            {personaAttributes.personality.map((trait, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={trait}
                  onChange={(e) => handleArrayChange('personality', index, e.target.value)}
                  placeholder="e.g., Patient, Knowledgeable, Encouraging"
                  className="flex-1 p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                {personaAttributes.personality.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('personality', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('personality')}
              className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
            >
              + Add Trait
            </button>
          </div>

          {/* Specialties */}
          <div>
            <label className="block mb-2 font-semibold text-emerald-700">
              Specialties
            </label>
            {personaAttributes.specialties.map((specialty, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => handleArrayChange('specialties', index, e.target.value)}
                  placeholder="e.g., Programming, Investment Analysis"
                  className="flex-1 p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                {personaAttributes.specialties.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('specialties', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('specialties')}
              className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
            >
              + Add Specialty
            </button>
          </div>

          {/* Limitations */}
          <div>
            <label className="block mb-2 font-semibold text-emerald-700">
              Limitations & Boundaries
            </label>
            {personaAttributes.limitations.map((limit, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={limit}
                  onChange={(e) => handleArrayChange('limitations', index, e.target.value)}
                  placeholder="e.g., Cannot provide financial advice, Focuses on technical topics only"
                  className="flex-1 p-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                {personaAttributes.limitations.length > 1 && (
                  <button
                    onClick={() => removeArrayItem('limitations', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addArrayItem('limitations')}
              className="mt-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium"
            >
              + Add Limitation
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
              isFormValid() && !isGenerating
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Persona...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Generate Persona Prompt
              </span>
            )}
          </button>
        </div>
      </div>

      {generatedPrompt && (
        <div className="bg-emerald-800 text-white rounded-lg p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-emerald-100">Your Persona Prompt</h3>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              Copy Prompt
            </button>
          </div>
          <div className="bg-emerald-900 rounded p-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap text-sm text-emerald-100">{generatedPrompt}</pre>
          </div>
          <div className="mt-4 text-sm text-emerald-200">
            💡 <strong>Tip:</strong> Copy this prompt and paste it into ChatGPT, Claude, or any AI assistant to activate your persona!
          </div>
        </div>
      )}
    </div>
  );
}

export function AIPersonaCreatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">What is an AI Persona?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Persona</strong> is a detailed character profile that you can use to customize how AI assistants 
          respond to your queries. By defining a persona with specific attributes like name, role, background, expertise, 
          and communication style, you can create a consistent AI assistant that behaves like a specific character—such as 
          a "Tech Mentor" or "Investor Advisor"—tailored to your needs.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Persona Creator helps you build comprehensive personas by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Selecting templates:</strong> Choose from pre-built personas like Tech Mentor or Investor Advisor</li>
          <li><strong>Customizing attributes:</strong> Define name, role, background, expertise, and goals</li>
          <li><strong>Setting communication style:</strong> Specify tone, style, and personality traits</li>
          <li><strong>Defining boundaries:</strong> Set limitations and specialties for your persona</li>
          <li><strong>Generating prompts:</strong> Create ready-to-use persona prompts for any chatbot</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Available Templates</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-5 rounded-lg border-2 border-emerald-200">
            <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">👨‍💻</span>
              Tech Mentor
            </h3>
            <p className="text-gray-700 mb-3">Perfect for programming help, code reviews, and career guidance</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Software Development expertise</li>
              <li>• Patient and encouraging tone</li>
              <li>• Technical interview preparation</li>
            </ul>
          </div>

          <div className="bg-teal-50 p-5 rounded-lg border-2 border-teal-200">
            <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Investor Advisor
            </h3>
            <p className="text-gray-700 mb-3">Ideal for startup advice, funding strategies, and pitch reviews</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Startup valuation expertise</li>
              <li>• Analytical and strategic tone</li>
              <li>• Market analysis and positioning</li>
            </ul>
          </div>

          <div className="bg-cyan-50 p-5 rounded-lg border-2 border-cyan-200">
            <h3 className="font-bold text-cyan-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Business Consultant
            </h3>
            <p className="text-gray-700 mb-3">Great for business strategy, operations, and growth planning</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Business strategy expertise</li>
              <li>• Solution-focused approach</li>
              <li>• Process optimization guidance</li>
            </ul>
          </div>

          <div className="bg-green-50 p-5 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Creative Director
            </h3>
            <p className="text-gray-700 mb-3">Perfect for brand identity, design, and creative campaigns</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Brand strategy expertise</li>
              <li>• Creative and visionary tone</li>
              <li>• Visual design guidance</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">Why Use AI Personas?</h2>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border-l-4 border-emerald-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Consistent Responses:</strong> Get responses that match your desired character and expertise</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Specialized Knowledge:</strong> Focus AI responses on specific domains and expertise areas</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Better Context:</strong> Provide background and goals so AI understands your needs</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Customized Communication:</strong> Set tone and style that matches your preferences</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Reusable Prompts:</strong> Create once, use in any chatbot (ChatGPT, Claude, etc.)</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific:</strong> Provide detailed background and expertise areas for better results</li>
          <li><strong>Define boundaries:</strong> Set clear limitations so the persona knows what it cannot do</li>
          <li><strong>Match tone to purpose:</strong> Choose a communication style that fits your use case</li>
          <li><strong>Use templates:</strong> Start with a template and customize it to save time</li>
          <li><strong>Test and refine:</strong> Try the persona in your chatbot and adjust based on results</li>
          <li><strong>Save successful personas:</strong> Keep track of personas that work well for your needs</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">What Makes a Great AI Persona?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-emerald-200">
            <h3 className="font-bold text-emerald-800 mb-3">✅ Essential Elements</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Clear name and role</li>
              <li>• Detailed background and experience</li>
              <li>• Specific expertise areas</li>
              <li>• Defined goals and objectives</li>
              <li>• Consistent communication style</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-teal-200">
            <h3 className="font-bold text-teal-800 mb-3">🎯 Best Practices</h3>
            <ul className="text-gray-700 space-y-2">
              <li>• Set realistic limitations</li>
              <li>• Define personality traits</li>
              <li>• Specify specialties clearly</li>
              <li>• Include interaction guidelines</li>
              <li>• Test in actual conversations</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-emerald-100 to-teal-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-emerald-800">How to Use Your Persona Prompt</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Copy the generated prompt</strong> from the tool above</li>
          <li><strong>Open your preferred AI assistant</strong> (ChatGPT, Claude, Gemini, etc.)</li>
          <li><strong>Paste the persona prompt</strong> as your first message</li>
          <li><strong>Confirm the persona is active</strong> by asking a test question</li>
          <li><strong>Start using your customized AI assistant</strong> that matches your persona!</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Save your persona prompts in a document for easy reuse across different chatbots and sessions.
        </p>
      </section>
    </>
  );
}

export default AIPersonaCreator;

