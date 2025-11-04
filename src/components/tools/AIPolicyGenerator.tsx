"use client";

import React, { useState } from 'react';

type PolicyType = 'disclosure' | 'full-policy';
type UseCase = 'freelancer' | 'agency' | 'student' | 'company' | 'content-creator' | 'developer';

interface PolicyTemplate {
  type: PolicyType;
  useCase: UseCase;
  title: string;
  template: (companyName: string, customDetails?: string) => string;
}

const disclosureTemplates: Record<UseCase, string> = {
  freelancer: `This content was created with the assistance of AI tools for [brainstorming, research, and initial drafting]. All final content, claims, and conclusions were reviewed, edited, and approved by [NAME]. This AI assistance was used to enhance productivity while maintaining human oversight and accountability for the final work.`,
  
  agency: `This work product was developed using AI tools to support our creative and analytical processes. While AI assisted with [research, ideation, drafting, or editing], all final decisions, strategic direction, and deliverables were made and approved by our human team. We maintain full responsibility for the accuracy, quality, and appropriateness of all work delivered.`,
  
  student: `This assignment was completed with the aid of AI tools for [research assistance, outline generation, and editing support] in accordance with my institution's guidelines. All ideas, analysis, and writing reflect my own work, with AI used solely as a productivity tool under my direct supervision and control. I take full responsibility for the content submitted.`,
  
  company: `[COMPANY NAME] utilizes AI tools to enhance productivity and innovation across our operations. When AI is used in work products, it serves as a tool to support human decision-making and creativity. All final outputs are reviewed, validated, and approved by qualified human professionals who maintain accountability for accuracy, ethics, and compliance with all applicable standards and regulations.`,
  
  'content-creator': `This content was created using AI tools for [brainstorming, research, outlining, and editing support]. All final messaging, opinions, and claims represent my own work and have been reviewed and approved by me. AI serves as a creative assistant, but I maintain full editorial control and responsibility for all published content.`,
  
  developer: `This code/software was developed with the assistance of AI coding tools (including but not limited to GitHub Copilot, ChatGPT, or similar) for [code generation, debugging, documentation, or optimization]. All code was reviewed, tested, and approved by human developers. We maintain full responsibility for code quality, security, and functionality.`,
};

const fullPolicyTemplates: Record<UseCase, string> = {
  freelancer: `RESPONSIBLE AI USAGE POLICY

[NAME/FREELANCER NAME]

1. PURPOSE
This policy outlines how I use artificial intelligence (AI) tools in my professional work and my commitment to transparency, quality, and ethical AI usage.

2. AI TOOL USAGE
I may use AI tools to assist with:
- Research and information gathering
- Initial content drafting and outlining
- Editing and proofreading
- Brainstorming and ideation
- Translation and localization

3. HUMAN OVERSIGHT
All AI-generated content is subject to thorough human review, editing, and approval. I maintain full responsibility for:
- The accuracy and validity of all information
- The appropriateness and quality of all deliverables
- Compliance with client requirements and industry standards
- Ethical considerations and professional judgment

4. TRANSPARENCY
I commit to transparent communication about AI usage when relevant or requested by clients. AI is a tool to enhance efficiency and creativity, not to replace human expertise and judgment.

5. QUALITY ASSURANCE
All work products undergo human quality assurance processes to ensure they meet professional standards and client expectations.

6. CONFIDENTIALITY
I ensure that any AI tools used comply with confidentiality requirements and data protection standards applicable to your project.

7. DISCLAIMER
This policy is subject to change as AI technology and best practices evolve. For specific questions about AI usage in your project, please contact me directly.

Last Updated: [DATE]`,
  
  agency: `RESPONSIBLE AI USAGE POLICY

[AGENCY NAME]

1. PURPOSE AND SCOPE
This policy establishes guidelines for the responsible and transparent use of artificial intelligence (AI) tools by [AGENCY NAME] in delivering client services and internal operations.

2. PRINCIPLES
- AI enhances human capability; it does not replace human judgment
- All AI usage maintains client confidentiality and data security
- We commit to transparency about AI usage when requested or relevant
- Quality and accuracy standards are maintained regardless of AI assistance

3. APPROVED USE CASES
AI tools may be used for:
- Research and competitive analysis
- Content ideation and brainstorming
- Initial draft generation
- Editing and proofreading
- Data analysis and pattern recognition
- Translation and localization

4. RESTRICTED USE
AI tools are NOT used for:
- Final decision-making without human approval
- Client data analysis without proper data protection measures
- Replacing required human expertise (legal, medical, financial advice)
- Circumventing quality assurance processes

5. HUMAN OVERSIGHT AND REVIEW
All AI-assisted work undergoes mandatory human review:
- Content is reviewed, edited, and approved by qualified team members
- Fact-checking and validation are performed by human experts
- Strategic decisions remain with senior team members
- Client approvals are obtained through human interaction

6. TRANSPARENCY AND DISCLOSURE
We commit to:
- Informing clients about significant AI usage when relevant
- Including AI disclosure statements in deliverables when appropriate
- Answering client questions about our AI usage practices

7. QUALITY ASSURANCE
Our quality assurance process ensures:
- All deliverables meet or exceed client expectations
- Accuracy and fact-checking standards are maintained
- Professional standards and industry best practices are followed
- Human accountability is maintained at all levels

8. DATA SECURITY AND CONFIDENTIALITY
- All AI tools comply with our data security standards
- Client confidential information is handled per our privacy policy
- AI tool vendors are vetted for security and compliance

9. CONTINUOUS IMPROVEMENT
This policy is reviewed regularly and updated as AI technology and best practices evolve.

For questions about this policy, please contact [CONTACT INFORMATION].

Last Updated: [DATE]`,
  
  student: `STUDENT AI USAGE POLICY

[SCHOOL/UNIVERSITY NAME] - [STUDENT NAME]

1. PURPOSE
This policy documents how I use AI tools in my academic work in compliance with institutional guidelines and academic integrity standards.

2. AI TOOL DECLARATION
I may use AI tools for:
- Research assistance and information gathering
- Outline and structure development
- Editing and proofreading (grammar, style)
- Understanding complex concepts through conversation
- Translation and language learning

3. PROHIBITED USES
AI tools are NOT used for:
- Completing assignments on my behalf without my work
- Generating content that I present as my original work
- Circumventing learning objectives or assessments
- Violating academic integrity policies

4. HUMAN OVERSIGHT AND RESPONSIBILITY
I take full responsibility for:
- All ideas, analysis, and arguments presented in my work
- Accuracy and validity of all information
- Compliance with assignment requirements
- Adherence to academic integrity standards

5. TRANSPARENCY
When required by instructors or assignment guidelines, I will:
- Disclose AI tool usage
- Explain how AI was used
- Demonstrate my understanding and contribution to the work

6. LEARNING OBJECTIVE COMPLIANCE
AI tools are used as educational aids to enhance learning, not to replace the learning process. All work demonstrates my own understanding, critical thinking, and knowledge application.

7. ACADEMIC INTEGRITY
This policy is designed to ensure compliance with [INSTITUTION NAME]'s academic integrity policy. When in doubt about appropriate AI usage, I consult with instructors or academic advisors.

Last Updated: [DATE]`,
  
  company: `CORPORATE RESPONSIBLE AI USAGE POLICY

[COMPANY NAME]

1. POLICY STATEMENT
[COMPANY NAME] recognizes that artificial intelligence (AI) tools can enhance productivity, innovation, and operational efficiency. This policy establishes principles and guidelines for the responsible use of AI tools across all departments and functions.

2. CORE PRINCIPLES
- Human oversight and accountability are paramount
- AI enhances human capabilities; it does not replace human judgment
- Transparency about AI usage when relevant to stakeholders
- Quality, accuracy, and ethical standards are maintained
- Data security and confidentiality are protected

3. APPROVED APPLICATIONS
AI tools may be approved for use in:
- Content creation and editing (with human review)
- Data analysis and pattern recognition
- Customer service support (with human escalation)
- Research and information gathering
- Translation and localization
- Code generation and technical documentation (developer use only)

4. RESTRICTED APPLICATIONS
AI tools are NOT approved for:
- Making final hiring or employment decisions
- Providing legal, medical, or financial advice
- Processing confidential customer data without proper safeguards
- Automating decisions that require human judgment
- Circumventing quality assurance or review processes

5. HUMAN OVERSIGHT REQUIREMENTS
- All AI-generated content must be reviewed and approved by qualified human professionals
- Critical decisions must involve human judgment, regardless of AI assistance
- Quality assurance processes include human validation
- Strategic decisions remain with authorized human decision-makers

6. TRANSPARENCY AND COMMUNICATION
- AI usage is disclosed when relevant to clients, partners, or stakeholders
- Internal documentation tracks significant AI tool usage
- Staff are trained on appropriate AI usage and limitations

7. QUALITY ASSURANCE
- All AI-assisted work products meet established quality standards
- Human review processes are documented and enforced
- Regular audits ensure compliance with this policy

8. DATA SECURITY AND PRIVACY
- AI tools must comply with our data security and privacy policies
- Confidential information is not shared with AI tools unless authorized
- Vendor security assessments are conducted before adoption
- Compliance with GDPR, CCPA, and other applicable regulations is maintained

9. TRAINING AND AWARENESS
- Employees receive training on this policy and appropriate AI usage
- Regular updates keep staff informed about AI best practices
- Clear escalation paths exist for questions or concerns

10. COMPLIANCE AND ENFORCEMENT
- Violations of this policy may result in disciplinary action
- Regular policy reviews ensure continued relevance
- Updates are communicated to all staff

11. CONTACT AND QUESTIONS
For questions about this policy or AI usage guidelines, contact [HR/COMPLIANCE DEPARTMENT].

Policy Owner: [DEPARTMENT]
Last Updated: [DATE]
Review Cycle: Annual`,
  
  'content-creator': `CONTENT CREATOR AI USAGE POLICY

[NAME/CHANNEL NAME]

1. PURPOSE
This policy outlines my use of artificial intelligence (AI) tools in content creation and my commitment to transparency and authenticity with my audience.

2. AI TOOL USAGE
I may use AI tools to assist with:
- Research and fact-gathering
- Content ideation and brainstorming
- Outline and structure development
- Editing and proofreading
- Translation and localization
- Image generation (when disclosed)

3. HUMAN OVERSIGHT
All AI-assisted content undergoes human review and approval:
- Ideas, opinions, and perspectives are my own
- All factual claims are verified
- Final messaging reflects my voice and values
- I maintain full editorial control

4. TRANSPARENCY WITH AUDIENCE
I commit to:
- Disclosing AI usage when significant or relevant
- Being transparent when AI-generated images or content are used
- Clearly distinguishing AI-assisted vs. AI-generated content
- Maintaining authenticity in all content

5. QUALITY AND ACCURACY
- All content meets my quality standards
- Fact-checking and verification are performed
- I take responsibility for all information shared
- Errors are corrected promptly and transparently

6. ETHICAL CONSIDERATIONS
- AI usage does not compromise my authenticity
- I respect intellectual property and attribution standards
- I avoid misleading audiences about content creation methods

7. DISCLOSURE STATEMENTS
When AI is used significantly, I may include disclosure such as:
"This content was created with AI assistance for [specific purpose]. All ideas, opinions, and final content represent my own work and have been reviewed and approved by me."

8. CONTINUOUS IMPROVEMENT
This policy evolves as AI technology and best practices develop.

For questions, contact me at [CONTACT INFO].

Last Updated: [DATE]`,
  
  developer: `DEVELOPER AI CODING TOOLS POLICY

[NAME/TEAM NAME]

1. PURPOSE
This policy governs the use of AI coding assistance tools (such as GitHub Copilot, ChatGPT for coding, etc.) in software development activities.

2. APPROVED AI CODING TOOLS
Approved tools include but are not limited to:
- GitHub Copilot
- ChatGPT (for coding assistance)
- Cursor
- Tabnine
- Other AI pair programming tools (subject to approval)

3. APPROVED USE CASES
AI coding tools may be used for:
- Code generation and boilerplate creation
- Debugging assistance and error resolution
- Code documentation and comments
- Refactoring suggestions
- Test case generation
- Code review assistance
- Learning and understanding unfamiliar codebases

4. HUMAN OVERSIGHT REQUIREMENTS
All AI-generated code must:
- Be reviewed by human developers before merging
- Undergo standard code review processes
- Meet security and quality standards
- Be tested thoroughly
- Comply with project coding standards and best practices

5. RESTRICTED USES
AI coding tools are NOT used for:
- Generating code that handles sensitive data without security review
- Bypassing security requirements or best practices
- Circumventing code review processes
- Copying proprietary code from AI training data
- Generating code without understanding its functionality

6. INTELLECTUAL PROPERTY CONSIDERATIONS
- Code generated using AI tools must be reviewed for IP concerns
- Teams must ensure compliance with open-source licenses
- Proprietary code must not be shared with AI tools that may expose it

7. SECURITY REQUIREMENTS
- AI-generated code must pass security reviews
- Sensitive credentials or secrets must not be shared with AI tools
- Code handling sensitive data requires additional scrutiny

8. QUALITY STANDARDS
- All code must meet project quality standards
- Performance and efficiency considerations apply
- Code must be maintainable and well-documented
- Test coverage requirements are maintained

9. TRANSPARENCY
- AI tool usage is documented in code reviews when significant
- Team members are informed about AI-assisted development
- Best practices and learnings are shared within the team

10. CONTINUOUS LEARNING
- Teams stay informed about AI coding tool capabilities and limitations
- Regular discussions ensure appropriate usage
- Policy is updated as tools and best practices evolve

For questions, contact [TECH LEAD/DEPARTMENT].

Last Updated: [DATE]`,
};

export function AIPolicyGenerator() {
  const [policyType, setPolicyType] = useState<PolicyType>('disclosure');
  const [useCase, setUseCase] = useState<UseCase>('freelancer');
  const [companyName, setCompanyName] = useState('');
  const [customDetails, setCustomDetails] = useState('');
  const [generatedPolicy, setGeneratedPolicy] = useState('');
  const [copied, setCopied] = useState(false);

  const generatePolicy = () => {
    let policy = '';
    const name = companyName.trim() || '[YOUR NAME/COMPANY NAME]';

    if (policyType === 'disclosure') {
      policy = disclosureTemplates[useCase]
        .replace('[NAME]', name)
        .replace('[NAME/FREELANCER NAME]', name)
        .replace('[AGENCY NAME]', name)
        .replace('[COMPANY NAME]', name)
        .replace('[SCHOOL/UNIVERSITY NAME]', name)
        .replace('[STUDENT NAME]', name)
        .replace('[NAME/CHANNEL NAME]', name)
        .replace('[NAME/TEAM NAME]', name);
      
      // Replace bracketed placeholders with custom details or default
      policy = policy.replace(/\[brainstorming[^\]]*\]/g, customDetails || '[specify AI assistance used]');
      policy = policy.replace(/\[research[^\]]*\]/g, customDetails || '[specify AI assistance used]');
      policy = policy.replace(/\[.*?\]/g, (match) => {
        if (match.includes('DATE')) return new Date().toLocaleDateString();
        if (match.includes('CONTACT')) return '[Your Contact Information]';
        return match;
      });
    } else {
      policy = fullPolicyTemplates[useCase]
        .replace(/\[NAME\]/g, name)
        .replace(/\[NAME\/FREELANCER NAME\]/g, name)
        .replace(/\[AGENCY NAME\]/g, name)
        .replace(/\[COMPANY NAME\]/g, name)
        .replace(/\[SCHOOL\/UNIVERSITY NAME\]/g, name)
        .replace(/\[STUDENT NAME\]/g, name)
        .replace(/\[NAME\/CHANNEL NAME\]/g, name)
        .replace(/\[NAME\/TEAM NAME\]/g, name)
        .replace(/\[INSTITUTION NAME\]/g, name)
        .replace(/\[DATE\]/g, new Date().toLocaleDateString())
        .replace(/\[CONTACT INFORMATION\]/g, '[Your Contact Information]')
        .replace(/\[CONTACT INFO\]/g, '[Your Contact Information]')
        .replace(/\[HR\/COMPLIANCE DEPARTMENT\]/g, '[HR/Compliance Department]')
        .replace(/\[DEPARTMENT\]/g, '[Department]')
        .replace(/\[TECH LEAD\/DEPARTMENT\]/g, '[Tech Lead/Department]');
    }

    setGeneratedPolicy(policy);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPolicy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#047857" strokeWidth="2" fill="none"/>
          <path d="M14 2v6h6" stroke="#047857" strokeWidth="2" fill="none"/>
          <path d="M16 13H8" stroke="#047857" strokeWidth="2"/>
          <path d="M16 17H8" stroke="#047857" strokeWidth="2"/>
          <path d="M10 9H8" stroke="#047857" strokeWidth="2"/>
        </svg>
        AI Policy / Terms Generator
      </h2>

      <p className="text-gray-600 mb-6">
        Generate boilerplate AI usage policies and disclosure statements for your organization, 
        freelance work, or academic use. Customize templates based on your needs.
      </p>

      {/* Critical Disclaimer */}
      <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-2">NOT LEGAL ADVICE</h3>
            <p className="text-red-800 font-semibold mb-2">
              The templates and policies generated by this tool are for informational and draft purposes only. 
              They do NOT constitute legal advice.
            </p>
            <p className="text-sm text-red-700">
              Before using any generated policy or disclosure statement:
            </p>
            <ul className="list-disc pl-6 text-sm text-red-700 mt-2 space-y-1">
              <li>Consult with a qualified attorney or legal professional</li>
              <li>Review policies with your organization's legal/compliance department</li>
              <li>Ensure compliance with applicable laws, regulations, and industry standards</li>
              <li>Customize policies to fit your specific circumstances and jurisdiction</li>
              <li>Regularly review and update policies as laws and best practices evolve</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Policy Type Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-gray-700">
          What type of policy do you need?
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setPolicyType('disclosure')}
            className={`p-4 border-2 rounded-lg transition-all text-left ${
              policyType === 'disclosure'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="font-semibold text-gray-900 mb-1">📄 Disclosure Statement</div>
            <div className="text-sm text-gray-600">Short statement for content, deliverables, or communications</div>
          </button>
          <button
            onClick={() => setPolicyType('full-policy')}
            className={`p-4 border-2 rounded-lg transition-all text-left ${
              policyType === 'full-policy'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="font-semibold text-gray-900 mb-1">📋 Full Policy Document</div>
            <div className="text-sm text-gray-600">Comprehensive policy document for organizations</div>
          </button>
        </div>
      </div>

      {/* Use Case Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-gray-700">
          Who is this for?
        </label>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { value: 'freelancer', label: 'Freelancer', icon: '👤' },
            { value: 'agency', label: 'Agency', icon: '🏢' },
            { value: 'student', label: 'Student', icon: '🎓' },
            { value: 'company', label: 'Company', icon: '💼' },
            { value: 'content-creator', label: 'Content Creator', icon: '✍️' },
            { value: 'developer', label: 'Developer', icon: '💻' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setUseCase(option.value as UseCase)}
              className={`p-3 border-2 rounded-lg transition-all ${
                useCase === option.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-emerald-300'
              }`}
            >
              <span className="text-2xl mb-1 block">{option.icon}</span>
              <div className="text-sm font-semibold text-gray-900">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              {policyType === 'disclosure' ? 'Your Name or Company Name' : 'Organization/Name'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., John Smith, ABC Agency, or XYZ Company"
              className="w-full p-3 border rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          
          {policyType === 'disclosure' && (
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                AI Usage Details (Optional)
              </label>
              <input
                type="text"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="e.g., brainstorming and research"
                className="w-full p-3 border rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe how AI was used (will replace placeholder text)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="mb-6">
        <button
          onClick={generatePolicy}
          disabled={!companyName.trim()}
          className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Generate {policyType === 'disclosure' ? 'Disclosure Statement' : 'Policy'}
        </button>
      </div>

      {/* Generated Policy */}
      {generatedPolicy && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Generated {policyType === 'disclosure' ? 'Disclosure Statement' : 'Policy'}
            </h3>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <span>✓</span> Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
              {generatedPolicy}
            </pre>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Remember:</strong> This is a template/draft. Review with legal counsel before use. 
              Customize for your specific needs and jurisdiction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIPolicyGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Why You Need an AI Usage Policy</h2>
        <p className="text-gray-700 text-lg">
          As AI tools become increasingly common in professional and academic settings, organizations, 
          freelancers, and students are being asked to declare their AI usage. Having a clear, transparent 
          policy protects you, builds trust with clients and stakeholders, and demonstrates responsible AI usage.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">What This Tool Provides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">📄 Disclosure Statements</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Short statements for content deliverables</li>
              <li>• Client communication templates</li>
              <li>• Academic assignment declarations</li>
              <li>• Public-facing disclosures</li>
            </ul>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">📋 Full Policy Documents</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Comprehensive organizational policies</li>
              <li>• HR and compliance documentation</li>
              <li>• Internal guidelines and procedures</li>
              <li>• Framework for AI usage standards</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Use Cases Covered</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">👤 Freelancers</h3>
            <p className="text-sm text-gray-700">
              Disclosure statements for client work, transparency about AI assistance, professional ethics.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🏢 Agencies</h3>
            <p className="text-sm text-gray-700">
              Organizational policies, client communications, internal guidelines, quality standards.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🎓 Students</h3>
            <p className="text-sm text-gray-700">
              Academic integrity declarations, assignment disclosures, compliance with institution policies.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💼 Companies</h3>
            <p className="text-sm text-gray-700">
              Corporate policies, HR documentation, compliance frameworks, employee guidelines.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">✍️ Content Creators</h3>
            <p className="text-sm text-gray-700">
              Audience transparency, disclosure statements, authenticity commitments, ethical usage.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">💻 Developers</h3>
            <p className="text-sm text-gray-700">
              Coding tool usage policies, team guidelines, code review standards, security considerations.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-red-50 border-l-4 border-red-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-red-800">Important Legal Disclaimer</h2>
        <p className="text-red-900 font-semibold mb-3">
          This tool generates templates and draft policies for informational purposes only. 
          These are NOT legal documents and do NOT constitute legal advice.
        </p>
        <p className="text-red-800 mb-3">
          Before implementing any policy or disclosure statement:
        </p>
        <ul className="list-disc pl-6 text-red-800 space-y-2">
          <li><strong>Consult with qualified legal counsel</strong> - Every situation is unique and requires professional legal review</li>
          <li><strong>Comply with applicable laws</strong> - Regulations vary by jurisdiction (GDPR, CCPA, local laws)</li>
          <li><strong>Review with compliance teams</strong> - Ensure alignment with industry standards and regulations</li>
          <li><strong>Customize for your needs</strong> - Templates are starting points and must be tailored</li>
          <li><strong>Update regularly</strong> - Laws and best practices evolve; policies need regular review</li>
        </ul>
        <p className="text-red-800 mt-4">
          Use of generated policies is at your own risk. We assume no liability for legal consequences 
          arising from the use of these templates.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Benefits of Having an AI Policy</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">✅ Transparency & Trust</h3>
            <p className="text-sm text-gray-700">
              Build trust with clients, stakeholders, and audiences through clear communication about AI usage.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🛡️ Legal Protection</h3>
            <p className="text-sm text-gray-700">
              Document your AI usage practices and demonstrate responsible, ethical use.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📋 Compliance</h3>
            <p className="text-sm text-gray-700">
              Meet requirements from clients, institutions, or regulations that mandate AI usage disclosure.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🎯 Clarity</h3>
            <p className="text-sm text-gray-700">
              Establish clear guidelines for your team or yourself on appropriate AI usage boundaries.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default AIPolicyGenerator;

