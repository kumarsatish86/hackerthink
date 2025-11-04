"use client";

import React, { useState } from 'react';

interface ResumeData {
  jobTitle: string;
  company: string;
  experience: string;
  tone: string;
  documentType: 'resume' | 'cover-letter' | 'both';
  keySkills: string[];
  achievements: string[];
  education: string;
  customRequirements: string;
}

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (2-5 years)',
  'Senior Level (5-10 years)',
  'Executive Level (10+ years)'
];

const tones = [
  'Professional',
  'Confident',
  'Friendly',
  'Formal',
  'Dynamic',
  'Results-oriented',
  'Enthusiastic',
  'Assertive'
];

function generateResumePrompt(data: ResumeData): string {
  const { jobTitle, company, experience, tone, keySkills, achievements, education, customRequirements } = data;

  let prompt = `Act as an expert resume writer and career coach. Create a professional ${tone.toLowerCase()} resume for a ${experience.toLowerCase()} professional applying for the position of ${jobTitle}${company ? ` at ${company}` : ''}.\n\n`;

  prompt += `RESUME REQUIREMENTS:\n`;
  prompt += `• Target Position: ${jobTitle}\n`;
  if (company) {
    prompt += `• Target Company: ${company}\n`;
  }
  prompt += `• Experience Level: ${experience}\n`;
  prompt += `• Tone: ${tone}\n`;
  
  if (keySkills.length > 0) {
    prompt += `• Key Skills to Highlight:\n`;
    keySkills.forEach(skill => {
      prompt += `  - ${skill}\n`;
    });
  }

  if (achievements.length > 0) {
    prompt += `• Key Achievements to Include:\n`;
    achievements.forEach(achievement => {
      prompt += `  - ${achievement}\n`;
    });
  }

  if (education) {
    prompt += `• Education: ${education}\n`;
  }

  if (customRequirements) {
    prompt += `• Additional Requirements:\n${customRequirements}\n`;
  }

  prompt += `\nSTRUCTURE REQUIREMENTS:\n`;
  prompt += `1. Professional Summary/Objective: 2-3 sentences highlighting relevant experience and career goals\n`;
  prompt += `2. Work Experience Section:\n`;
  prompt += `   - List 3-5 most relevant positions\n`;
  prompt += `   - Use bullet points starting with action verbs\n`;
  prompt += `   - Quantify achievements with numbers, percentages, or metrics\n`;
  prompt += `   - Focus on results and impact\n`;
  prompt += `3. Skills Section:\n`;
  prompt += `   - Technical skills relevant to ${jobTitle}\n`;
  prompt += `   - Soft skills\n`;
  prompt += `   - Tools and technologies\n`;
  prompt += `4. Education Section:\n`;
  prompt += `   - Include degree, institution, and graduation year\n`;
  if (education) {
    prompt += `   - Include: ${education}\n`;
  }

  prompt += `\nWRITING GUIDELINES:\n`;
  prompt += `• Use ${tone.toLowerCase()} tone throughout\n`;
  prompt += `• Optimize for ATS (Applicant Tracking Systems)\n`;
  prompt += `• Use industry-standard terminology\n`;
  prompt += `• Highlight quantifiable achievements\n`;
  prompt += `• Keep language concise and impactful\n`;
  prompt += `• Ensure all dates are consistent\n`;
  prompt += `• Use professional formatting\n`;

  prompt += `\nPlease generate a complete, ready-to-use resume that is:\n`;
  prompt += `- ATS-friendly\n`;
  prompt += `- Professional and ${tone.toLowerCase()}\n`;
  prompt += `- Tailored to the ${jobTitle} position\n`;
  prompt += `- Highlighting relevant experience and achievements\n`;
  prompt += `- Ready to be copied and used`;

  return prompt;
}

function generateCoverLetterPrompt(data: ResumeData): string {
  const { jobTitle, company, experience, tone, keySkills, achievements, education, customRequirements } = data;

  let prompt = `Act as an expert cover letter writer and career coach. Create a professional ${tone.toLowerCase()} cover letter for a ${experience.toLowerCase()} professional applying for the position of ${jobTitle}${company ? ` at ${company}` : ''}.\n\n`;

  prompt += `COVER LETTER REQUIREMENTS:\n`;
  prompt += `• Target Position: ${jobTitle}\n`;
  if (company) {
    prompt += `• Target Company: ${company}\n`;
  }
  prompt += `• Experience Level: ${experience}\n`;
  prompt += `• Tone: ${tone}\n`;

  if (keySkills.length > 0) {
    prompt += `• Key Skills to Emphasize:\n`;
    keySkills.forEach(skill => {
      prompt += `  - ${skill}\n`;
    });
  }

  if (achievements.length > 0) {
    prompt += `• Key Achievements to Highlight:\n`;
    achievements.forEach(achievement => {
      prompt += `  - ${achievement}\n`;
    });
  }

  if (education) {
    prompt += `• Education Background: ${education}\n`;
  }

  if (customRequirements) {
    prompt += `• Additional Requirements:\n${customRequirements}\n`;
  }

  prompt += `\nSTRUCTURE REQUIREMENTS:\n`;
  prompt += `1. Header: Professional format with date, recipient name/title, company address\n`;
  prompt += `2. Opening Paragraph (2-3 sentences):\n`;
  prompt += `   - Introduce yourself\n`;
  prompt += `   - State the position you're applying for\n`;
  prompt += `   - Express enthusiasm for the role\n`;
  prompt += `3. Body Paragraphs (2-3 paragraphs):\n`;
  prompt += `   - Explain why you're a good fit\n`;
  prompt += `   - Highlight relevant experience and skills\n`;
  prompt += `   - Provide specific examples and achievements\n`;
  prompt += `   - Connect your background to the job requirements\n`;
  prompt += `4. Closing Paragraph (2-3 sentences):\n`;
  prompt += `   - Reiterate your interest\n`;
  prompt += `   - Request an interview\n`;
  prompt += `   - Professional closing\n`;

  prompt += `\nWRITING GUIDELINES:\n`;
  prompt += `• Use ${tone.toLowerCase()} tone throughout\n`;
  prompt += `• Keep length to 3-4 paragraphs (approximately 300-400 words)\n`;
  prompt += `• Address the hiring manager by name if possible (or use "Dear Hiring Manager")\n`;
  prompt += `• Show genuine interest in the company and role\n`;
  prompt += `• Use specific examples from your experience\n`;
  prompt += `• Avoid generic phrases - be specific and authentic\n`;
  prompt += `• Proofread for grammar and spelling\n`;
  prompt += `• Professional closing (Sincerely, Best regards, etc.)\n`;

  prompt += `\nPlease generate a complete, ready-to-use cover letter that:\n`;
  prompt += `- Is tailored to the ${jobTitle} position${company ? ` at ${company}` : ''}\n`;
  prompt += `- Highlights relevant experience and achievements\n`;
  prompt += `- Shows genuine interest and enthusiasm\n`;
  prompt += `- Is professional and ${tone.toLowerCase()}\n`;
  prompt += `- Is ready to be customized and sent`;

  return prompt;
}

export function AIResumeCoverLetterGenerator() {
  const [resumeData, setResumeData] = useState<ResumeData>({
    jobTitle: '',
    company: '',
    experience: '',
    tone: 'Professional',
    documentType: 'resume',
    keySkills: [''],
    achievements: [''],
    education: '',
    customRequirements: ''
  });
  const [generatedPrompts, setGeneratedPrompts] = useState<{ resume?: string; coverLetter?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const handleInputChange = (field: keyof ResumeData, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setResumeData(prev => ({
        ...prev,
        keySkills: [...prev.keySkills.filter(s => s), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setResumeData(prev => {
      const skills = [...prev.keySkills];
      skills.splice(index, 1);
      return {
        ...prev,
        keySkills: skills.length > 0 ? skills : ['']
      };
    });
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setResumeData(prev => ({
        ...prev,
        achievements: [...prev.achievements.filter(a => a), newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setResumeData(prev => {
      const achievements = [...prev.achievements];
      achievements.splice(index, 1);
      return {
        ...prev,
        achievements: achievements.length > 0 ? achievements : ['']
      };
    });
  };

  const handleGenerate = () => {
    if (!resumeData.jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const prompts: { resume?: string; coverLetter?: string } = {};

      if (resumeData.documentType === 'resume' || resumeData.documentType === 'both') {
        prompts.resume = generateResumePrompt(resumeData);
      }

      if (resumeData.documentType === 'cover-letter' || resumeData.documentType === 'both') {
        prompts.coverLetter = generateCoverLetterPrompt(resumeData);
      }

      setGeneratedPrompts(prompts);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = (type: 'resume' | 'cover-letter') => {
    const prompt = type === 'resume' ? generatedPrompts.resume : generatedPrompts.coverLetter;
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      alert(`${type === 'resume' ? 'Resume' : 'Cover Letter'} prompt copied to clipboard!`);
    }
  };

  const handleCopyAll = () => {
    const allPrompts = Object.entries(generatedPrompts)
      .map(([type, prompt]) => `=== ${type === 'resume' ? 'RESUME PROMPT' : 'COVER LETTER PROMPT'} ===\n\n${prompt}\n\n`)
      .join('---\n\n');
    
    navigator.clipboard.writeText(allPrompts);
    alert('All prompts copied to clipboard!');
  };

  const isFormValid = () => {
    return resumeData.jobTitle.trim() !== '' && resumeData.documentType !== '';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-blue-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#1E40AF" strokeWidth="2" fill="none"/>
        </svg>
        AI Resume / Cover Letter Prompt Generator
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-6">
          {/* Document Type */}
          <div>
            <label className="block mb-2 font-semibold text-blue-700">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={resumeData.documentType}
              onChange={(e) => handleInputChange('documentType', e.target.value as any)}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="resume">Resume Only</option>
              <option value="cover-letter">Cover Letter Only</option>
              <option value="both">Both Resume & Cover Letter</option>
            </select>
          </div>

          {/* Job Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-blue-700">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={resumeData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Manager"
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-blue-700">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={resumeData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="e.g., Google, Microsoft"
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Experience & Tone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-blue-700">
                Experience Level
              </label>
              <select
                value={resumeData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Experience Level</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-blue-700">
                Tone
              </label>
              <select
                value={resumeData.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {tones.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Key Skills */}
          <div>
            <label className="block mb-2 font-semibold text-blue-700">
              Key Skills (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="e.g., JavaScript, Project Management, Data Analysis"
                className="flex-1 p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button
                onClick={handleAddSkill}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            {resumeData.keySkills.filter(s => s).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {resumeData.keySkills.filter(s => s).map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(index)}
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Key Achievements */}
          <div>
            <label className="block mb-2 font-semibold text-blue-700">
              Key Achievements (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="e.g., Increased sales by 30%, Led team of 10"
                className="flex-1 p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddAchievement()}
              />
              <button
                onClick={handleAddAchievement}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            {resumeData.achievements.filter(a => a).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {resumeData.achievements.filter(a => a).map((achievement, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {achievement}
                    <button
                      onClick={() => handleRemoveAchievement(index)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <label className="block mb-2 font-semibold text-blue-700">
              Education (Optional)
            </label>
            <input
              type="text"
              value={resumeData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              placeholder="e.g., Bachelor's in Computer Science, MBA"
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Custom Requirements */}
          <div>
            <label className="block mb-2 font-semibold text-blue-700">
              Additional Requirements (Optional)
            </label>
            <textarea
              value={resumeData.customRequirements}
              onChange={(e) => handleInputChange('customRequirements', e.target.value)}
              placeholder="e.g., Must include specific certifications, focus on remote work experience, etc."
              rows={3}
              className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-y"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!isFormValid() || isGenerating}
            className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
              isFormValid() && !isGenerating
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Prompts...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                Generate {resumeData.documentType === 'both' ? 'Resume & Cover Letter' : resumeData.documentType === 'resume' ? 'Resume' : 'Cover Letter'} Prompt
              </span>
            )}
          </button>
        </div>
      </div>

      {Object.keys(generatedPrompts).length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-blue-800">
              Generated Prompts
            </h3>
            {(generatedPrompts.resume && generatedPrompts.coverLetter) && (
              <button
                onClick={handleCopyAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy All
              </button>
            )}
          </div>

          {generatedPrompts.resume && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      RESUME PROMPT
                    </span>
                    <h4 className="text-xl font-bold text-gray-900">Resume Generation Prompt</h4>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('resume')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{generatedPrompts.resume}</pre>
              </div>
            </div>
          )}

          {generatedPrompts.coverLetter && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                      COVER LETTER PROMPT
                    </span>
                    <h4 className="text-xl font-bold text-gray-900">Cover Letter Generation Prompt</h4>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy('cover-letter')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{generatedPrompts.coverLetter}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AIResumeCoverLetterGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">What is an AI Resume/Cover Letter Prompt Generator?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Resume/Cover Letter Prompt Generator</strong> is a specialized tool that creates optimized prompts 
          for generating professional resumes and cover letters using AI assistants like ChatGPT. By entering your job title, 
          experience level, key skills, achievements, and preferred tone, the tool generates comprehensive, ready-to-use 
          prompts that guide AI to create tailored, ATS-friendly resumes and compelling cover letters.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Resume/Cover Letter Prompt Generator creates professional prompts by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Collecting job information:</strong> Job title, company, experience level, and tone preferences</li>
          <li><strong>Incorporating your background:</strong> Key skills, achievements, and education details</li>
          <li><strong>Structuring requirements:</strong> Organizing prompts with clear sections and guidelines</li>
          <li><strong>Optimizing for ATS:</strong> Including ATS-friendly formatting and keyword optimization</li>
          <li><strong>Generating comprehensive prompts:</strong> Creating detailed prompts for ChatGPT or other AI assistants</li>
          <li><strong>Providing both options:</strong> Generate resume prompts, cover letter prompts, or both</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Why Use AI for Resume/Cover Letter Creation?</h2>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Time-Saving:</strong> Generate professional resumes and cover letters in minutes instead of hours</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>ATS-Optimized:</strong> Prompts include ATS-friendly formatting and keyword optimization</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Tailored Content:</strong> Prompts are customized to your specific job and experience level</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Professional Quality:</strong> Generate polished, professional documents ready for job applications</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Multiple Versions:</strong> Easily create different versions for different job applications</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Features Included in Generated Prompts</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">📄 Resume Prompts Include</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Professional summary/objective</li>
              <li>• Work experience with action verbs</li>
              <li>• Quantifiable achievements</li>
              <li>• Skills section (technical & soft)</li>
              <li>• Education section</li>
              <li>• ATS optimization guidelines</li>
              <li>• Industry-standard formatting</li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-5 rounded-lg border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-800 mb-3">✉️ Cover Letter Prompts Include</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Professional header format</li>
              <li>• Engaging opening paragraph</li>
              <li>• Body paragraphs with examples</li>
              <li>• Strong closing paragraph</li>
              <li>• Company-specific customization</li>
              <li>• Tone and style guidelines</li>
              <li>• Length optimization (300-400 words)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific:</strong> Provide detailed job title and company information</li>
          <li><strong>Include key skills:</strong> List relevant technical and soft skills for the position</li>
          <li><strong>Highlight achievements:</strong> Add quantifiable achievements with numbers and metrics</li>
          <li><strong>Choose appropriate tone:</strong> Match tone to industry and company culture</li>
          <li><strong>Review generated content:</strong> Always review and customize AI-generated resumes/cover letters</li>
          <li><strong>Proofread carefully:</strong> Check for accuracy, grammar, and spelling</li>
          <li><strong>Customize for each job:</strong> Tailor prompts for each specific job application</li>
          <li><strong>Update regularly:</strong> Keep your resume and cover letter current with new experiences</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Experience Levels Supported</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {['Entry Level (0-2 years)', 'Mid Level (2-5 years)', 'Senior Level (5-10 years)', 'Executive Level (10+ years)'].map((level, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-blue-200 text-sm text-gray-700">
              • {level}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">How to Use Generated Prompts</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Fill in the form</strong> with your job details, experience, and skills</li>
          <li><strong>Generate the prompt</strong> for resume, cover letter, or both</li>
          <li><strong>Copy the generated prompt</strong> from the tool</li>
          <li><strong>Open ChatGPT</strong> or your preferred AI assistant</li>
          <li><strong>Paste the prompt</strong> and let AI generate your resume/cover letter</li>
          <li><strong>Review and customize</strong> the generated content to match your specific experience</li>
          <li><strong>Proofread and finalize</strong> before submitting your application</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Save successful prompts for future use and customize them for different job applications. Always review AI-generated content to ensure accuracy and authenticity.
        </p>
      </section>
    </>
  );
}

export default AIResumeCoverLetterGenerator;

