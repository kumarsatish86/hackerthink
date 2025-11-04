"use client";

import React, { useState } from 'react';

type VoiceSource = 'self' | 'celebrity' | 'client' | 'someone-else' | 'public-figure' | 'deceased';
type UseCase = 'personal' | 'commercial' | 'educational' | 'research';

interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
  requiresPermission: boolean;
  label: string;
  color: string;
  recommendations: string[];
  legalNotes: string[];
}

const riskAssessments: Record<string, RiskAssessment> = {
  'self-personal': {
    riskLevel: 'low',
    requiresPermission: false,
    label: '✅ Low Risk',
    color: 'green',
    recommendations: [
      'You own your voice and have full rights to clone it for personal use',
      'Ensure you have the technical ability to produce the voice clone yourself',
      'Keep recordings secure and private',
      'Be aware some platforms may restrict even personal use'
    ],
    legalNotes: [
      'Right of publicity generally doesn\'t apply to your own voice',
      'Some jurisdictions may have restrictions on voice cloning technology',
      'Check platform terms of service for voice cloning policies'
    ]
  },
  'self-commercial': {
    riskLevel: 'low',
    requiresPermission: false,
    label: '✅ Low Risk',
    color: 'green',
    recommendations: [
      'Using your own voice commercially is generally safe',
      'Consider explicit consent if representing a company or brand',
      'Document your consent and ownership',
      'Be transparent with audiences about AI-generated content'
    ],
    legalNotes: [
      'You have rights to your own voice and image',
      'Some jurisdictions require disclosure of AI-generated content',
      'Check local regulations for AI content disclosure requirements'
    ]
  },
  'celebrity-personal': {
    riskLevel: 'medium',
    requiresPermission: true,
    label: '⚠️ Medium Risk',
    color: 'yellow',
    recommendations: [
      'Personal use is generally lower risk than commercial',
      'Do not impersonate the celebrity or mislead others',
      'Consider if your use could harm their reputation',
      'Best practice: Obtain explicit written permission',
      'Avoid public dissemination or sharing'
    ],
    legalNotes: [
      'Celebrities have right of publicity protections',
      'Personal use may be exempt in some jurisdictions',
      'Commercial use without permission is almost always high risk',
      'Parody or satire may have different protections'
    ]
  },
  'celebrity-commercial': {
    riskLevel: 'very-high',
    requiresPermission: true,
    label: '🚨 Very High Risk',
    color: 'red',
    recommendations: [
      'Commercial use of celebrity voices without permission is extremely risky',
      'Consult with an intellectual property attorney before proceeding',
      'Never use for deceptive purposes or impersonation',
      'Consider using parody or satire with clear disclosure',
      'Obtain formal licensing agreements from rights holders'
    ],
    legalNotes: [
      'Commercial use of celebrity voices requires explicit licensing',
      'Celebrities can sue for right of publicity violations',
      'Damages can include lost profits and reputation harm',
      'Platforms may remove content and ban accounts',
      'Some jurisdictions have criminal penalties for certain violations'
    ]
  },
  'client-personal': {
    riskLevel: 'medium',
    requiresPermission: true,
    label: '⚠️ Medium Risk',
    color: 'yellow',
    recommendations: [
      'Requires explicit written consent from the client',
      'Document the consent clearly and retain records',
      'Specify scope of use in the agreement',
      'Respect client privacy and confidentiality',
      'Consider data protection regulations (GDPR, CCPA, etc.)'
    ],
    legalNotes: [
      'Client consent must be informed and voluntary',
      'Consider privacy laws and data protection regulations',
      'Employment or contract law may apply',
      'Scope of consent should be clearly defined'
    ]
  },
  'client-commercial': {
    riskLevel: 'high',
    requiresPermission: true,
    label: '🔴 High Risk',
    color: 'red',
    recommendations: [
      'Must have explicit written consent from the client',
      'Clearly define commercial use scope in contract',
      'Include compensation and benefit sharing terms',
      'Specify duration and geographic scope of rights',
      'Consider data protection and privacy laws'
    ],
    legalNotes: [
      'Commercial use without consent can lead to lawsuits',
      'Violations of client privacy can result in regulatory penalties',
      'GDPR and CCPA may apply to voice data',
      'Consider professional liability insurance'
    ]
  },
  'someone-else-personal': {
    riskLevel: 'medium',
    requiresPermission: true,
    label: '⚠️ Medium Risk',
    color: 'yellow',
    recommendations: [
      'Obtain explicit written consent from the person',
      'Clearly explain how the voice will be used',
      'Document the permission in writing',
      'Respect their right to withdraw consent',
      'Do not use for deceptive or harmful purposes'
    ],
    legalNotes: [
      'Right of publicity may apply depending on jurisdiction',
      'Privacy laws protect individuals from unauthorized use',
      'Consent should be specific and informed',
      'Some jurisdictions have specific voice protection laws'
    ]
  },
  'someone-else-commercial': {
    riskLevel: 'high',
    requiresPermission: true,
    label: '🔴 High Risk',
    color: 'red',
    recommendations: [
      'Requires explicit commercial licensing agreement',
      'Define compensation, scope, and duration clearly',
      'Consider professional legal advice',
      'Document all permissions and agreements',
      'Ensure compliance with privacy and data protection laws'
    ],
    legalNotes: [
      'Commercial use without consent can lead to lawsuits',
      'Right of publicity violations can be costly',
      'Data protection regulations may apply',
      'Damages can include profits, reputation, and legal fees'
    ]
  },
  'public-figure-personal': {
    riskLevel: 'medium',
    requiresPermission: true,
    label: '⚠️ Medium Risk',
    color: 'yellow',
    recommendations: [
      'Public figures have enhanced right of publicity protections',
      'Avoid misleading or deceptive use',
      'Consider context and potential harm to reputation',
      'Parody and news may have some protections',
      'Obtain permission when possible'
    ],
    legalNotes: [
      'Public figures have stronger legal protections',
      'Political and news use may have different standards',
      'Commercial use without permission is highly risky',
      'Jurisdictions vary in protections for public figures'
    ]
  },
  'public-figure-commercial': {
    riskLevel: 'very-high',
    requiresPermission: true,
    label: '🚨 Very High Risk',
    color: 'red',
    recommendations: [
      'Commercial use requires formal licensing agreements',
      'Consult with an attorney experienced in right of publicity',
      'Consider public figure\'s estate if deceased',
      'Never mislead or create false endorsements',
      'Expect high licensing fees and strict usage terms'
    ],
    legalNotes: [
      'Public figures have stronger right of publicity protections',
      'Commercial licensing is complex and expensive',
      'Unauthorized use can result in significant legal liability',
      'Platforms aggressively police unauthorized celebrity voice use'
    ]
  },
  'deceased-personal': {
    riskLevel: 'medium',
    requiresPermission: true,
    label: '⚠️ Medium Risk',
    color: 'yellow',
    recommendations: [
      'Rights may pass to estate or heirs',
      'Duration varies by jurisdiction (often 50-100 years after death)',
      'Personal use is generally lower risk',
      'Respect family privacy and wishes',
      'Avoid commercial exploitation without permission'
    ],
    legalNotes: [
      'Post-mortem right of publicity varies significantly by jurisdiction',
      'Some states have no post-mortem protection, others extend for decades',
      'Estate or heirs typically control rights',
      'Historical figures may have different treatment'
    ]
  },
  'deceased-commercial': {
    riskLevel: 'high',
    requiresPermission: true,
    label: '🔴 High Risk',
    color: 'red',
    recommendations: [
      'Commercial use requires licensing from estate or heirs',
      'Research jurisdiction-specific post-mortem rights',
      'Workshop and commercialize only with proper authorization',
      'Expect significant licensing costs',
      'Consult with entertainment and intellectual property attorneys'
    ],
    legalNotes: [
      'Post-mortem right of publicity varies dramatically by location',
      'Duration ranges from immediate expiration to 100+ years',
      'Estates aggressively protect deceased celebrities\' voices',
      'Commercial licensing is complex and expensive',
      'Some jurisdictions completely prohibit post-mortem commercial use'
    ]
  }
};

export function AIVoiceCloningLegalityChecker() {
  const [voiceSource, setVoiceSource] = useState<VoiceSource | ''>('');
  const [useCase, setUseCase] = useState<UseCase | ''>('');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  const handleCheck = () => {
    if (!voiceSource || !useCase) return;
    
    const key = `${voiceSource}-${useCase}`;
    setAssessment(riskAssessments[key]);
  };

  const getRiskColorClasses = (color: string) => {
    const colors = {
      green: 'border-green-500 bg-green-50 text-green-800',
      yellow: 'border-yellow-500 bg-yellow-50 text-yellow-800',
      red: 'border-red-500 bg-red-50 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-amber-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#f97316"/>
          <path d="M2 17L12 22L22 17" stroke="#f97316" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#f97316" strokeWidth="2" fill="none"/>
        </svg>
        AI Voice Cloning Legality Checker
      </h2>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-orange-900 mb-2">⚠️ Important Legal Disclaimer</h3>
              <p className="text-sm text-orange-800">
                This tool provides <strong>general legal information</strong> only, not legal advice. Laws vary significantly by 
                jurisdiction (country, state, province). This tool cannot replace consultation with a qualified attorney 
                familiar with your specific situation and jurisdiction. Use at your own risk.
              </p>
            </div>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="text-orange-600 hover:text-orange-800 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Assess the legal risk of voice cloning based on voice source and intended use. Get general guidance 
        to help you understand potential legal implications before proceeding with voice cloning projects.
      </p>

      {/* Voice Source Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-amber-700">
          1. Who is the voice source?
        </label>
        <div className="grid md:grid-cols-3 gap-3">
          <button
            onClick={() => setVoiceSource('self')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              voiceSource === 'self' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Your Own Voice</div>
            <div className="text-xs text-gray-600 mt-1">Self-produced content</div>
          </button>
          <button
            onClick={() => setVoiceSource('celebrity')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              voiceSource === 'celebrity' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Celebrity</div>
            <div className="text-xs text-gray-600 mt-1">Actor, musician, influencer</div>
          </button>
          <button
            onClick={() => setVoiceSource('client')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              voiceSource === 'client' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Client Voice</div>
            <div className="text-xs text-gray-600 mt-1">Business client, contractor</div>
          </button>
          <button
            onClick={() => setVoiceSource('someone-else')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              voiceSource === 'someone-else' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Someone Else's Voice</div>
            <div className="text-xs text-gray-600 mt-1">Friend, colleague, stranger</div>
          </button>
          <button
            onClick={() => setVoiceSource('public-figure')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              voiceSource === 'public-figure' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Public Figure</div>
            <div className="text-xs text-gray-600 mt-1">Politician, public person</div>
          </button>
          <button
            onClick={() => setVoiceSource('deceased')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              voiceSource === 'deceased' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Deceased Person</div>
            <div className="text-xs text-gray-600 mt-1">Historical figure, deceased celebrity</div>
          </button>
        </div>
      </div>

      {/* Use Case Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-amber-700">
          2. What is your intended use?
        </label>
        <div className="grid md:grid-cols-4 gap-3">
          <button
            onClick={() => setUseCase('personal')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              useCase === 'personal' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Personal Use</div>
            <div className="text-xs text-gray-600 mt-1">Non-commercial, private</div>
          </button>
          <button
            onClick={() => setUseCase('commercial')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              useCase === 'commercial' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Commercial Use</div>
            <div className="text-xs text-gray-600 mt-1">Business, profit, public</div>
          </button>
          <button
            onClick={() => setUseCase('educational')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              useCase === 'educational' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Educational</div>
            <div className="text-xs text-gray-600 mt-1">Teaching, research</div>
          </button>
          <button
            onClick={() => setUseCase('research')}
            className={`p-3 border-2 rounded-lg text-left transition-all ${
              useCase === 'research' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <div className="font-semibold text-sm">Research</div>
            <div className="text-xs text-gray-600 mt-1">Academic, scientific</div>
          </button>
        </div>
      </div>

      {/* Check Button */}
      <button
        onClick={handleCheck}
        disabled={!voiceSource || !useCase}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors mb-6 ${
          voiceSource && useCase
            ? 'bg-amber-600 hover:bg-amber-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Check Legal Risk
      </button>

      {/* Assessment Results */}
      {assessment && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className={`border-l-4 p-6 mb-6 rounded-r ${getRiskColorClasses(assessment.color)}`}>
            <h3 className="text-2xl font-bold mb-2">{assessment.label}</h3>
            <p className="font-medium">Risk Level: {assessment.riskLevel.toUpperCase()}</p>
            {assessment.requiresPermission && (
              <p className="mt-2 font-semibold">⚠️ Requires Permission: YES</p>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-gray-900">Recommendations</h3>
            <ul className="space-y-2">
              {assessment.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-3 text-amber-900">Legal Considerations</h3>
            <ul className="space-y-2">
              {assessment.legalNotes.map((note, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-700 mt-1">•</span>
                  <span className="text-amber-800 text-sm">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Additional Resources */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">
          📚 Need More Legal Guidance?
        </h3>
        <p className="text-blue-800 mb-4">
          <strong>This is general information only, not legal advice.</strong> For specific situations, 
          consult with an attorney experienced in intellectual property, right of publicity, and AI law.
        </p>
        <div className="flex gap-3">
          <a 
            href="/legal/ai-voice-cloning-guide"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            Full Legal Guide →
          </a>
          <a 
            href="/legal/consultation"
            className="px-6 py-3 bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-semibold transition-colors text-sm"
          >
            Legal Consultation →
          </a>
        </div>
      </div>
    </div>
  );
}

export function AIVoiceCloningLegalityCheckerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-amber-800">Understanding Voice Cloning & Right of Publicity</h2>
        <p className="text-gray-700 text-lg">
          <strong>Right of Publicity</strong> protects individuals from unauthorized commercial use of their likeness, 
          name, voice, and other identifiable attributes. Voice cloning technology makes it easier than ever to replicate 
          voices, but legal protections vary significantly by jurisdiction.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-amber-800">Why This Matters</h2>
        <p className="text-gray-700 text-lg mb-3">
          As voice cloning technology becomes more accessible, the risk of legal issues increases:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Celebrity voice impersonation</strong> can lead to lawsuits</li>
          <li><strong>Commercial use without permission</strong> violates right of publicity</li>
          <li><strong>Platforms ban and remove</strong> unauthorized voice cloning content</li>
          <li><strong>Privacy regulations</strong> (GDPR, CCPA) may apply to voice data</li>
          <li><strong>Post-mortem rights</strong> vary dramatically by jurisdiction</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-amber-800">When Permission is Required</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">Always Required</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Commercial celebrity voice cloning</li>
              <li>• Commercial use of someone else's voice</li>
              <li>• Client or employee voices for business</li>
              <li>• Deceased celebrities (estate rights)</li>
            </ul>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-800 mb-2">Generally Safe</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Your own voice for personal use</li>
              <li>• Your own voice for commercial use</li>
              <li>• Parody and satire (some protections)</li>
              <li>• News and journalism (context matters)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-amber-50 border-l-4 border-amber-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-amber-800">Jurisdiction Matters</h2>
        <p className="text-gray-700 text-lg mb-3">
          Laws vary dramatically by location. This tool provides general guidance but cannot account for all jurisdictions:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><strong>United States:</strong> State-by-state variation in right of publicity laws</li>
          <li><strong>European Union:</strong> GDPR and data protection laws apply</li>
          <li><strong>Post-mortem rights:</strong> Range from 0 to 100+ years</li>
          <li><strong>Platform policies:</strong> Each platform has different rules</li>
          <li><strong>International use:</strong> May trigger multiple jurisdictions</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-amber-800">Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Get written consent</strong> - Document permissions clearly</li>
          <li><strong>Be transparent</strong> - Disclose AI-generated content when required</li>
          <li><strong>Respect privacy</strong> - Follow data protection regulations</li>
          <li><strong>Consider jurisdiction</strong> - Where content is created and distributed</li>
          <li><strong>Consult professionals</strong> - Attorney, licensing experts when needed</li>
          <li><strong>Review platform policies</strong> - Each platform has specific rules</li>
          <li><strong>Use disclaimers</strong> - Clearly identify AI-generated voice content</li>
        </ul>
      </section>

      <section className="mb-10 bg-red-50 border-l-4 border-red-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-red-800">🚨 High-Risk Scenarios</h2>
        <p className="text-red-700 text-lg mb-3">
          These scenarios almost always require permission and have high legal risk:
        </p>
        <ul className="list-disc pl-6 text-red-800 space-y-1">
          <li>Using celebrity voices for commercial advertisements</li>
          <li>Creating fake celebrity endorsements or content</li>
          <li>Commercial use of client or employee voices without consent</li>
          <li>Posting unauthorized celebrity AI songs or content publicly</li>
          <li>Deceptive voice cloning for fraud or impersonation</li>
        </ul>
        <p className="text-red-700 font-semibold mt-4">
          ⚠️ Legal consequences can include lawsuits, damages, platform bans, and in some cases, criminal charges.
        </p>
      </section>
    </>
  );
}

export default AIVoiceCloningLegalityChecker;

