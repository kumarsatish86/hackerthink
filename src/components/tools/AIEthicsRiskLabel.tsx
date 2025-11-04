"use client";

import React, { useState } from 'react';

type RiskLevel = 'green' | 'yellow' | 'red';

interface RiskAssessment {
  level: RiskLevel;
  label: string;
  title: string;
  description: string;
  reasons: string[];
  guidance: string;
  ethicalConsiderations: string[];
}

// Keywords and patterns for risk assessment
const riskPatterns = {
  red: [
    // Fraud and deception
    /fraud/i, /scam/i, /phishing/i, /deceiv/i, /trick/i, /impersonat/i,
    // Financial harm
    /steal|theft|rob/i, /financial/i, /money/i, /bank/i, /credit/i,
    // Identity theft
    /identity theft/i, /pretend to be|pretending to be/i, /fake identity/i,
    // Explicit harm
    /harm/i, /hurt/i, /attack/i, /violence/i,
    // Legal violations
    /illegal/i, /unauthorized/i, /without permission/i,
    // Deepfake misuse
    /deepfake.*real/i, /make.*look real/i, /convincing.*fake/i,
    // Specific harmful scenarios
    /voice.*password/i, /voice.*bank/i, /CEO.*layoff/i, /fake.*official/i,
    /fake.*news/i, /misinformation/i, /political.*fake/i, /election/i,
  ],
  yellow: [
    // Reputation harm
    /reputation/i, /embarrass/i, /humiliat/i, /mocking/i, /parody.*real/i,
    // Misleading content
    /misleading/i, /confusing/i, /ambiguous/i, /unclear/i,
    // Public figures
    /celebrity/i, /politician/i, /public figure/i, /famous/i,
    // Realistic generation
    /realistic.*person/i, /photo.*real/i, /video.*real/i,
    // Commercial use without consent
    /commercial.*without/i, /profit.*without/i, /sell.*without/i,
    // Satire/parody that could confuse
    /satire.*real/i, /joke.*real/i,
  ],
  green: [
    // Clear fiction
    /fictional/i, /fantasy/i, /sci-fi/i, /cartoon/i, /animation/i,
    // Parody with disclaimers
    /obvious parody/i, /clearly fake/i, /intentionally silly/i,
    // Art and creative
    /art project/i, /creative/i, /artistic/i, /non-commercial art/i,
    // Educational
    /educational/i, /teaching/i, /demonstration/i, /example/i,
    // Self-consent
    /myself/i, /my own/i, /self/i, /personal use/i,
    // Historical figures (sometimes)
    /historical figure.*educational/i,
  ],
};

const riskKeywords = {
  red: [
    'CEO', 'layoff', 'announcing', 'official', 'government', 'authority',
    'financial', 'banking', 'authentication', 'security', 'password',
    'voting', 'election', 'political manipulation',
  ],
  yellow: [
    'realistic', 'real person', 'celebrity', 'public figure', 'politician',
    'commercial', 'for profit', 'reputation',
  ],
  green: [
    'fantasy', 'fictional', 'cartoon', 'animation', 'art project',
    'educational', 'parody', 'obviously fake',
  ],
};

function assessRisk(scenario: string): RiskAssessment {
  const lowerScenario = scenario.toLowerCase();
  let redFlags = 0;
  let yellowFlags = 0;
  let greenFlags = 0;
  const foundReasons: string[] = [];

  // Check red patterns
  for (const pattern of riskPatterns.red) {
    if (pattern.test(scenario)) {
      redFlags++;
      foundReasons.push('Contains indicators of fraud, deception, or harm');
      break;
    }
  }

  // Check for specific high-risk scenarios
  if (/CEO|executive|leader/i.test(scenario) && /announc|say|speak|voice/i.test(scenario)) {
    if (/layoff|terminat|fire|redundant/i.test(scenario)) {
      redFlags += 2;
      foundReasons.push('Creating fake executive statements about layoffs could cause panic and harm');
    } else {
      yellowFlags++;
      foundReasons.push('Generating executive content can mislead stakeholders');
    }
  }

  if (/prime minister|president|government official/i.test(scenario)) {
    if (/real|realistic|authentic/i.test(scenario)) {
      redFlags++;
      foundReasons.push('Creating realistic deepfakes of government officials is highly dangerous');
    } else if (/parody|comedy|dancing|funny/i.test(scenario)) {
      yellowFlags++;
      foundReasons.push('Parody of public figures could mislead if not clearly labeled');
    }
  }

  // Check yellow patterns
  for (const pattern of riskPatterns.yellow) {
    if (pattern.test(scenario) && redFlags === 0) {
      yellowFlags++;
      foundReasons.push('Could mislead viewers or harm reputation');
      break;
    }
  }

  // Check green patterns
  for (const pattern of riskPatterns.green) {
    if (pattern.test(scenario) && redFlags === 0 && yellowFlags === 0) {
      greenFlags++;
      break;
    }
  }

  // Special checks
  if (/without.*permission|without.*consent|unauthorized/i.test(scenario)) {
    redFlags++;
    foundReasons.push('Using someone\'s likeness without permission is typically illegal');
  }

  if (/for.*fun|joke|parody.*obvious|clearly.*fake|intentionally.*silly/i.test(scenario)) {
    if (redFlags === 0) {
      greenFlags++;
      foundReasons.push('Obvious parody or humorous content with clear disclaimers is generally acceptable');
    }
  }

  // Determine final risk level
  let level: RiskLevel;
  let label: string;
  let title: string;
  let description: string;
  let guidance: string;
  let ethicalConsiderations: string[];

  if (redFlags > 0) {
    level = 'red';
    label = 'HIGH RISK';
    title = '🔴 High Risk - Not Recommended';
    description = 'This scenario poses significant ethical, legal, and harm risks. Creating this content could result in fraud, identity theft, financial harm, or serious reputational damage.';
    guidance = 'DO NOT proceed with this scenario. This type of content creation is likely illegal, unethical, and could cause serious harm to individuals or organizations.';
    ethicalConsiderations = [
      'Likely violates laws against fraud, impersonation, or identity theft',
      'Could cause financial or emotional harm to victims',
      'May be used for malicious purposes like scams or misinformation',
      'Violates privacy and consent principles',
      'Could damage trust in media and technology',
    ];
  } else if (yellowFlags > 0 && greenFlags === 0) {
    level = 'yellow';
    label = 'MODERATE RISK';
    title = '🟡 Moderate Risk - Proceed with Caution';
    description = 'This scenario could be misleading or cause reputational harm if not handled carefully. Requires transparency, clear disclaimers, and careful consideration of context.';
    guidance = 'Proceed only if: (1) You have explicit permission from all involved parties, (2) You include clear, prominent disclaimers that content is AI-generated, (3) You ensure it cannot be mistaken for authentic content, and (4) Your purpose is legitimate (education, art, etc.).';
    ethicalConsiderations = [
      'Could mislead viewers if not clearly labeled',
      'May harm reputation of individuals depicted',
      'Requires consent from all parties involved',
      'Consider legal implications in your jurisdiction',
      'Ensure transparent disclosure of AI generation',
    ];
  } else {
    level = 'green';
    label = 'LOW RISK';
    title = '🟢 Low Risk - Generally Acceptable';
    description = 'This scenario appears to be harmless parody, clearly fictional content, or ethically acceptable use. Still ensure proper disclosure and consider context.';
    guidance = 'This appears acceptable, but still best practices apply: (1) Include disclaimers when sharing publicly, (2) Ensure content is obviously fictional or clearly marked as AI-generated, (3) Respect copyright and intellectual property, (4) Consider your audience and platform policies.';
    ethicalConsiderations = [
      'Ensure content is clearly marked as AI-generated or fictional',
      'Respect copyright and intellectual property rights',
      'Be mindful of platform terms of service',
      'Consider your audience and potential impact',
      'When in doubt, seek permission or consult legal advice',
    ];
  }

  return {
    level,
    label,
    title,
    description,
    reasons: foundReasons.length > 0 ? foundReasons : ['Scanned for ethical concerns'],
    guidance,
    ethicalConsiderations,
  };
}

export function AIEthicsRiskLabel() {
  const [scenario, setScenario] = useState('');
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);

  const handleAnalyze = () => {
    if (scenario.trim().length < 10) {
      alert('Please enter a more detailed scenario (at least 10 characters).');
      return;
    }
    const result = assessRisk(scenario);
    setAssessment(result);
  };

  const handleClear = () => {
    setScenario('');
    setAssessment(null);
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-orange-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#9A3412" strokeWidth="2" fill="none"/>
          <path d="M12 8v4M12 16h.01" stroke="#9A3412" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        AI Ethics / Deepfake Risk Label
      </h2>

      <p className="text-gray-600 mb-6">
        Get an ethical risk assessment for your AI content creation scenario. 
        Understand if your intended use is safe (green), requires caution (yellow), or is high-risk (red).
      </p>

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This tool provides ethical guidance based on general principles. 
          It is not legal advice. Always consult legal professionals for specific legal questions, 
          and ensure compliance with local laws and regulations.
        </p>
      </div>

      {/* Example Scenarios */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">💡 Example Scenarios:</h3>
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setScenario("I want to generate realistic CEO voice announcing layoffs.")}
            className="text-left w-full p-2 hover:bg-gray-50 rounded border border-gray-200"
          >
            "I want to generate realistic CEO voice announcing layoffs."
          </button>
          <button
            onClick={() => setScenario("I want to make past Prime Minister dancing in a parody video.")}
            className="text-left w-full p-2 hover:bg-gray-50 rounded border border-gray-200"
          >
            "I want to make past Prime Minister dancing in a parody video."
          </button>
          <button
            onClick={() => setScenario("Create a fictional cartoon character for an animated series.")}
            className="text-left w-full p-2 hover:bg-gray-50 rounded border border-gray-200"
          >
            "Create a fictional cartoon character for an animated series."
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-gray-700">
          Describe your AI content creation scenario:
        </label>
        <textarea
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          placeholder="e.g., I want to generate a realistic voice of a public figure saying..."
          className="w-full p-4 border rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 h-32 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleAnalyze}
            disabled={!scenario.trim() || scenario.trim().length < 10}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Analyze Risk
          </button>
          {scenario && (
            <button
              onClick={handleClear}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Risk Assessment Result */}
      {assessment && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Traffic Light Visual */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 ${
                assessment.level === 'green' 
                  ? 'bg-green-500 border-green-700' 
                  : 'bg-gray-300 border-gray-400'
              } mb-2`}></div>
              <span className="text-xs font-semibold text-gray-700">LOW RISK</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 ${
                assessment.level === 'yellow' 
                  ? 'bg-yellow-500 border-yellow-700' 
                  : 'bg-gray-300 border-gray-400'
              } mb-2`}></div>
              <span className="text-xs font-semibold text-gray-700">MODERATE RISK</span>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full border-4 ${
                assessment.level === 'red' 
                  ? 'bg-red-500 border-red-700' 
                  : 'bg-gray-300 border-gray-400'
              } mb-2`}></div>
              <span className="text-xs font-semibold text-gray-700">HIGH RISK</span>
            </div>
          </div>

          {/* Assessment Details */}
          <div className={`border-l-4 rounded-lg p-6 mb-6 ${
            assessment.level === 'green' 
              ? 'bg-green-50 border-green-500' 
              : assessment.level === 'yellow'
              ? 'bg-yellow-50 border-yellow-500'
              : 'bg-red-50 border-red-500'
          }`}>
            <h3 className={`text-2xl font-bold mb-3 ${
              assessment.level === 'green' 
                ? 'text-green-900' 
                : assessment.level === 'yellow'
                ? 'text-yellow-900'
                : 'text-red-900'
            }`}>
              {assessment.title}
            </h3>
            <p className={`text-lg mb-4 ${
              assessment.level === 'green' 
                ? 'text-green-800' 
                : assessment.level === 'yellow'
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {assessment.description}
            </p>

            {/* Reasons */}
            {assessment.reasons.length > 0 && (
              <div className="mb-4">
                <h4 className={`font-semibold mb-2 ${
                  assessment.level === 'green' 
                    ? 'text-green-900' 
                    : assessment.level === 'yellow'
                    ? 'text-yellow-900'
                    : 'text-red-900'
                }`}>
                  Detected Concerns:
                </h4>
                <ul className="list-disc pl-6 space-y-1">
                  {assessment.reasons.map((reason, idx) => (
                    <li key={idx} className={
                      assessment.level === 'green' 
                        ? 'text-green-700' 
                        : assessment.level === 'yellow'
                        ? 'text-yellow-700'
                        : 'text-red-700'
                    }>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Guidance */}
            <div className={`p-4 rounded-lg ${
              assessment.level === 'green' 
                ? 'bg-green-100' 
                : assessment.level === 'yellow'
                ? 'bg-yellow-100'
                : 'bg-red-100'
            }`}>
              <h4 className={`font-bold mb-2 ${
                assessment.level === 'green' 
                  ? 'text-green-900' 
                  : assessment.level === 'yellow'
                  ? 'text-yellow-900'
                  : 'text-red-900'
              }`}>
                Guidance:
              </h4>
              <p className={
                assessment.level === 'green' 
                  ? 'text-green-800' 
                  : assessment.level === 'yellow'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }>
                {assessment.guidance}
              </p>
            </div>
          </div>

          {/* Ethical Considerations */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Ethical Considerations
            </h3>
            <ul className="space-y-2">
              {assessment.ethicalConsiderations.map((consideration, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{consideration}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-6 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Legal Disclaimer:</strong> This assessment is for ethical guidance only and does not constitute legal advice. 
              Laws regarding deepfakes, impersonation, and AI-generated content vary by jurisdiction. Always consult with qualified 
              legal professionals before creating content involving real people. Violations can result in serious legal consequences 
              including criminal charges, civil liability, and significant fines.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIEthicsRiskLabelInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Why This Tool Matters</h2>
        <p className="text-gray-700 text-lg">
          As AI tools make it easier to create realistic deepfakes, voice clones, and synthetic media, 
          understanding the ethical implications is crucial. This tool helps creators, marketers, and 
          organizations assess the ethical risk of their AI content creation scenarios before they proceed, 
          promoting responsible AI usage and preventing harm.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Understanding Risk Levels</h2>
        <div className="space-y-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-green-900">🟢 Low Risk (Green)</h3>
            </div>
            <p className="text-green-800 mb-2">
              Generally acceptable scenarios that are clearly fictional, parodic, or have proper consent 
              and disclosure.
            </p>
            <ul className="text-sm text-green-700 space-y-1 list-disc pl-6">
              <li>Obvious parody or comedy with clear disclaimers</li>
              <li>Fictional characters and animation</li>
              <li>Educational demonstrations</li>
              <li>Personal use with your own likeness</li>
              <li>Art projects with proper labeling</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-yellow-900">🟡 Moderate Risk (Yellow)</h3>
            </div>
            <p className="text-yellow-800 mb-2">
              Scenarios that could be misleading or harmful if not handled with transparency and proper consent.
            </p>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-6">
              <li>Realistic content featuring public figures</li>
              <li>Commercial use without explicit consent</li>
              <li>Content that could damage reputation</li>
              <li>Parody that might be mistaken for real content</li>
              <li>Content requiring careful disclosure and context</li>
            </ul>
            <p className="text-yellow-800 font-semibold mt-3">
              Proceed only with: explicit consent, clear disclaimers, transparent disclosure, and legitimate purpose.
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-red-900">🔴 High Risk (Red)</h3>
            </div>
            <p className="text-red-800 mb-2 font-semibold">
              DO NOT PROCEED. These scenarios pose serious ethical, legal, and harm risks.
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc pl-6">
              <li>Fraud, scams, or financial deception</li>
              <li>Identity theft or impersonation</li>
              <li>Creating fake official statements or announcements</li>
              <li>Non-consensual use of someone's likeness</li>
              <li>Content designed to mislead or cause harm</li>
              <li>Political manipulation or election interference</li>
              <li>Any scenario involving unauthorized use for malicious purposes</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Best Practices for Ethical AI Content</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">✅ Always Do</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>Get explicit consent from all parties</li>
              <li>Include clear, prominent disclaimers</li>
              <li>Label AI-generated content transparently</li>
              <li>Consider the potential for misuse</li>
              <li>Respect privacy and reputation rights</li>
              <li>Follow platform terms of service</li>
            </ul>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">❌ Never Do</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>Create content for fraud or scams</li>
              <li>Impersonate others without permission</li>
              <li>Generate fake official statements</li>
              <li>Create misleading or deceptive content</li>
              <li>Use for political manipulation</li>
              <li>Violate privacy or consent</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Legal Considerations</h2>
        <p className="text-gray-700 mb-3">
          Laws regarding deepfakes and AI-generated content are rapidly evolving. Many jurisdictions have 
          specific laws prohibiting:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
          <li>Non-consensual deepfake pornography</li>
          <li>Deepfakes for political manipulation</li>
          <li>Impersonation for fraud or financial gain</li>
          <li>Creating fake official statements or documents</li>
          <li>Using someone's likeness without consent</li>
        </ul>
        <p className="text-gray-700 font-semibold">
          Penalties can include criminal charges, significant fines, and civil liability. Always consult 
          legal professionals before creating content involving real people.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Our Commitment to Responsible AI</h2>
        <p className="text-gray-700 text-lg">
          This tool reflects our commitment to responsible AI usage. We believe that with great power comes 
          great responsibility. AI tools can be incredible creative and productivity aids, but they must be 
          used ethically and legally. By providing ethical guidance and risk assessment, we aim to help 
          creators navigate the complex landscape of AI content generation while protecting individuals, 
          organizations, and society from harm.
        </p>
      </section>
    </>
  );
}

export default AIEthicsRiskLabel;

