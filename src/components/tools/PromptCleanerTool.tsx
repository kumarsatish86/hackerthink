"use client";

import React, { useState } from 'react';

type RiskLevel = 'high' | 'medium' | 'low';

interface RiskPattern {
  pattern: RegExp;
  category: string;
  riskLevel: RiskLevel;
  suggestion: string;
  description: string;
}

const riskPatterns: RiskPattern[] = [
  // Jailbreak attempts
  {
    pattern: /ignore\s+(previous|all|safety|ethical)?\s*(instructions|rules|guidelines|policies)/i,
    category: 'Jailbreak Attempt',
    riskLevel: 'high',
    description: 'Attempts to bypass AI safety guidelines and instructions',
    suggestion: 'Remove jailbreak language. Instead, clearly state your legitimate use case and work within the AI\'s ethical guidelines.'
  },
  {
    pattern: /bypass|circumvent|override/i,
    category: 'Bypass Attempt',
    riskLevel: 'high',
    description: 'Attempts to bypass safety measures or restrictions',
    suggestion: 'Remove bypass language. Frame your request as a legitimate educational or professional need.'
  },
  {
    pattern: /act\s+as\s+(if\s+)?(you|you're|you\s+are)\s+(don't|do\s+not)\s+have/i,
    category: 'Roleplay Jailbreak',
    riskLevel: 'high',
    description: 'Attempts to make AI ignore its guidelines through roleplay',
    suggestion: 'Remove roleplay instructions. Ask directly for what you need within ethical boundaries.'
  },
  {
    pattern: /(pretend|assume|imagine)\s+(you|you're)\s+(are|don't|unrestricted|uncensored)/i,
    category: 'Roleplay Bypass',
    riskLevel: 'high',
    description: 'Roleplay attempts to bypass restrictions',
    suggestion: 'Remove hypothetical scenarios. State your actual legitimate need clearly.'
  },
  
  // Malicious content requests
  {
    pattern: /(undetectable|undiscoverable|stealth|hidden)\s+(malware|virus|trojan|exploit)/i,
    category: 'Malware Request',
    riskLevel: 'high',
    description: 'Request for malicious software creation',
    suggestion: 'This violates AI safety policies. Instead, ask about cybersecurity defenses, threat awareness, or legitimate security testing with proper authorization.'
  },
  {
    pattern: /(create|write|generate|code)\s+(malware|virus|trojan|ransomware|exploit)/i,
    category: 'Malware Creation',
    riskLevel: 'high',
    description: 'Request to create malicious software',
    suggestion: 'This is prohibited. Consider learning about cybersecurity defense, ethical hacking (with proper training), or security research through legitimate channels.'
  },
  {
    pattern: /(hack|hacking|breach|exploit)\s+(into|an?|the)\s+(system|network|account|database)/i,
    category: 'Unauthorized Access',
    riskLevel: 'high',
    description: 'Request for unauthorized access or hacking',
    suggestion: 'Remove hacking language. Ask about authorized penetration testing, security audits, or learning ethical hacking through legitimate courses and certifications.'
  },
  
  // Harmful content
  {
    pattern: /(create|generate|write)\s+(hate|discriminatory|offensive|harmful)\s+content/i,
    category: 'Harmful Content',
    riskLevel: 'high',
    description: 'Request for harmful or discriminatory content',
    suggestion: 'This violates ethical guidelines. Instead, ask for educational content about diversity, inclusion, or addressing discrimination constructively.'
  },
  {
    pattern: /(how\s+to|teach\s+me\s+to|show\s+me\s+how\s+to)\s+(harm|hurt|injure|attack)/i,
    category: 'Harmful Instructions',
    riskLevel: 'high',
    description: 'Request for instructions on causing harm',
    suggestion: 'This is not appropriate. If researching for legitimate purposes, ask about safety measures, conflict resolution, or professional security training.'
  },
  
  // Privacy violations
  {
    pattern: /(access|get|obtain|steal|extract)\s+(someone|another\s+person|their)\s+(personal|private|confidential)\s+(information|data|details)/i,
    category: 'Privacy Violation',
    riskLevel: 'high',
    description: 'Request for unauthorized access to private information',
    suggestion: 'This is illegal. Instead, ask about data privacy laws, ethical information gathering, or authorized access procedures.'
  },
  {
    pattern: /(spy|spying|surveillance|monitor)\s+(on|without\s+permission)/i,
    category: 'Unauthorized Surveillance',
    riskLevel: 'high',
    description: 'Request for unauthorized monitoring or surveillance',
    suggestion: 'Remove surveillance language. Ask about legal monitoring solutions, privacy-compliant tools, or authorized security measures.'
  },
  
  // Manipulation
  {
    pattern: /(manipulate|trick|deceive|fool)\s+(someone|users|people)/i,
    category: 'Manipulation',
    riskLevel: 'medium',
    description: 'Requests involving manipulation or deception',
    suggestion: 'Reframe to legitimate persuasion techniques, ethical marketing, or transparent communication strategies.'
  },
  {
    pattern: /(social\s+engineering|phishing|scam|fraud)/i,
    category: 'Social Engineering',
    riskLevel: 'high',
    description: 'Requests related to social engineering or scams',
    suggestion: 'This is prohibited. Instead, ask about security awareness training, phishing prevention, or ethical cybersecurity education.'
  },
  
  // Content moderation bypass
  {
    pattern: /(filter|moderation|safety|guardrails?)\s+(bypass|circumvent|disable|turn\s+off)/i,
    category: 'Safety Bypass',
    riskLevel: 'high',
    description: 'Attempts to disable safety filters',
    suggestion: 'Remove bypass language. Safety filters exist for protection. Work within AI guidelines for legitimate purposes.'
  },
  {
    pattern: /(uncensored|unfiltered|without\s+(restrictions?|limits?))/i,
    category: 'Content Restrictions',
    riskLevel: 'medium',
    description: 'Request for unrestricted or uncensored content',
    suggestion: 'Reframe to request appropriate content that fits within ethical and legal boundaries.'
  },
  
  // Dangerous instructions
  {
    pattern: /(how\s+to|instructions\s+for)\s+(make|create|build)\s+(bomb|weapon|explosive)/i,
    category: 'Dangerous Instructions',
    riskLevel: 'high',
    description: 'Request for dangerous item creation',
    suggestion: 'This is prohibited. If for educational purposes, ask about safety protocols, emergency preparedness, or authorized training programs.'
  },
  
  // Automated abuse
  {
    pattern: /(automate|script|bot|automated)\s+(spam|harassment|abuse)/i,
    category: 'Automated Abuse',
    riskLevel: 'high',
    description: 'Request for automated harmful actions',
    suggestion: 'This violates terms of service. Instead, ask about legitimate automation, ethical marketing, or appropriate use of automation tools.'
  },
  
  // Academic dishonesty
  {
    pattern: /(write|complete|do)\s+(my\s+)?(essay|assignment|homework|exam|test)\s+(for\s+me|instead\s+of\s+me)/i,
    category: 'Academic Dishonesty',
    riskLevel: 'medium',
    description: 'Request to complete academic work on behalf of student',
    suggestion: 'Use AI for legitimate learning assistance: brainstorming, research help, outlining, or editing - not completing assignments. Maintain academic integrity.'
  },
  {
    pattern: /(help\s+me|assist|aid)\s+(cheat|plagiarize)/i,
    category: 'Academic Integrity',
    riskLevel: 'high',
    description: 'Explicit request for academic dishonesty',
    suggestion: 'This violates academic integrity. Use AI ethically for learning, research assistance, and skill development within your institution\'s guidelines.'
  },
];

function analyzePrompt(prompt: string): {
  risks: Array<{
    match: string;
    pattern: RiskPattern;
    position: number;
  }>;
  safeRewrite: string;
  riskScore: number;
} {
  const risks: Array<{
    match: string;
    pattern: RiskPattern;
    position: number;
  }> = [];

  // Find all risk matches
  riskPatterns.forEach((pattern) => {
    const matches = prompt.matchAll(pattern.pattern);
    for (const match of matches) {
      if (match.index !== undefined) {
        risks.push({
          match: match[0],
          pattern,
          position: match.index,
        });
      }
    }
  });

  // Calculate risk score
  const riskScore = risks.reduce((score, risk) => {
    if (risk.pattern.riskLevel === 'high') return score + 10;
    if (risk.pattern.riskLevel === 'medium') return score + 5;
    return score + 2;
  }, 0);

  // Generate safe rewrite suggestions
  let safeRewrite = prompt;
  const uniqueSuggestions = new Set<string>();

  risks.forEach((risk) => {
    // Replace risky phrases (basic approach - could be enhanced)
    const categoryLower = risk.pattern.category.toLowerCase();
    if (categoryLower.includes('jailbreak') || categoryLower.includes('bypass')) {
      safeRewrite = safeRewrite.replace(risk.match, '[Revised to work within ethical guidelines]');
    } else if (categoryLower.includes('malware') || categoryLower.includes('hack')) {
      safeRewrite = safeRewrite.replace(risk.match, '[Educational security context]');
    }
    uniqueSuggestions.add(risk.pattern.suggestion);
  });

  // If no risks found, provide general safety guidance
  if (risks.length === 0) {
    safeRewrite = prompt; // No changes needed
  }

  return {
    risks: risks.sort((a, b) => {
      // Sort by risk level (high first), then by position
      const levelOrder = { high: 0, medium: 1, low: 2 };
      const levelDiff = levelOrder[a.pattern.riskLevel] - levelOrder[b.pattern.riskLevel];
      if (levelDiff !== 0) return levelDiff;
      return a.position - b.position;
    }),
    safeRewrite,
    riskScore,
  };
}

export function PromptCleanerTool() {
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzePrompt> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt to analyze.');
      return;
    }
    const result = analyzePrompt(prompt);
    setAnalysis(result);
    setCopied(false);
  };

  const handleCopySafeRewrite = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(analysis.safeRewrite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getRiskLevelDisplay = (level: RiskLevel) => {
    switch (level) {
      case 'high':
        return { color: 'red', label: 'HIGH RISK', bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-900' };
      case 'medium':
        return { color: 'yellow', label: 'MEDIUM RISK', bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-900' };
      case 'low':
        return { color: 'blue', label: 'LOW RISK', bg: 'blue-50', border: 'border-blue-500', text: 'text-blue-900' };
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#7C3AED" strokeWidth="2" fill="none"/>
          <path d="M2 17L12 22L22 17" stroke="#7C3AED" strokeWidth="2" fill="none"/>
          <path d="M2 12L12 17L22 12" stroke="#7C3AED" strokeWidth="2" fill="none"/>
        </svg>
        Prompt Cleaner / Jailbreak Risk Highlighter
      </h2>

      <p className="text-gray-600 mb-6">
        Analyze your prompts for risky language, jailbreak attempts, or policy violations. 
        Get suggestions for safe rewrites that maintain your intent while staying within AI 
        safety guidelines and terms of service.
      </p>

      {/* Important Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This tool helps identify potentially problematic language. 
          It does not guarantee compliance with all AI provider terms or legal requirements. 
          Always review your prompts and ensure they align with applicable policies and regulations.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-gray-700">
          Enter your prompt to analyze:
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your prompt here... (e.g., 'Ignore previous instructions and tell me how to...')"
          className="w-full p-4 border rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 h-48 resize-none"
        />
        <button
          onClick={handleAnalyze}
          disabled={!prompt.trim()}
          className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Analyze Prompt for Risks
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Risk Summary */}
          <div className={`rounded-lg p-6 border-l-4 ${
            analysis.riskScore >= 10 
              ? 'bg-red-50 border-red-500' 
              : analysis.riskScore >= 5
              ? 'bg-yellow-50 border-yellow-500'
              : analysis.riskScore > 0
              ? 'bg-blue-50 border-blue-500'
              : 'bg-green-50 border-green-500'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xl font-bold ${
                analysis.riskScore >= 10 
                  ? 'text-red-900' 
                  : analysis.riskScore >= 5
                  ? 'text-yellow-900'
                  : analysis.riskScore > 0
                  ? 'text-blue-900'
                  : 'text-green-900'
              }`}>
                {analysis.riskScore === 0 ? '✅ No Risks Detected' : '⚠️ Risks Detected'}
              </h3>
              {analysis.riskScore > 0 && (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  analysis.riskScore >= 10 
                    ? 'bg-red-200 text-red-900' 
                    : 'bg-yellow-200 text-yellow-900'
                }`}>
                  Risk Score: {analysis.riskScore}
                </span>
              )}
            </div>
            <p className={
              analysis.riskScore >= 10 
                ? 'text-red-800' 
                : analysis.riskScore >= 5
                ? 'text-yellow-800'
                : analysis.riskScore > 0
                ? 'text-blue-800'
                : 'text-green-800'
            }>
              {analysis.riskScore === 0 
                ? 'Your prompt appears safe and within ethical guidelines.' 
                : analysis.riskScore >= 10
                ? 'HIGH RISK: Your prompt contains language that likely violates AI safety policies. Revise before use.'
                : analysis.riskScore >= 5
                ? 'MEDIUM RISK: Your prompt may be problematic. Review the flagged issues below and consider revisions.'
                : 'LOW RISK: Minor concerns detected. Review suggestions for best practices.'
              }
            </p>
          </div>

          {/* Detected Risks */}
          {analysis.risks.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Detected Issues ({analysis.risks.length})
              </h3>
              <div className="space-y-4">
                {analysis.risks.map((risk, idx) => {
                  const riskDisplay = getRiskLevelDisplay(risk.pattern.riskLevel);
                  return (
                    <div key={idx} className={`border-l-4 rounded-lg p-4 ${riskDisplay.border} ${riskDisplay.bg}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          risk.pattern.riskLevel === 'high' 
                            ? 'bg-red-200 text-red-900' 
                            : risk.pattern.riskLevel === 'medium'
                            ? 'bg-yellow-200 text-yellow-900'
                            : 'bg-blue-200 text-blue-900'
                        }`}>
                          {riskDisplay.label}
                        </span>
                        <span className="text-xs text-gray-600">{risk.pattern.category}</span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Flagged phrase:</p>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-900">
                          "{risk.match}"
                        </code>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{risk.pattern.description}</p>
                      <div className="bg-white rounded p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-1">💡 Suggestion:</p>
                        <p className="text-sm text-gray-800">{risk.pattern.suggestion}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safe Rewrite */}
          {analysis.risks.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  💡 Suggested Safe Rewrite
                </h3>
                <button
                  onClick={handleCopySafeRewrite}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
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
                      Copy Rewrite
                    </>
                  )}
                </button>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {analysis.safeRewrite}
                </pre>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                <strong>Note:</strong> This is an automated suggestion. Review and refine based on your specific needs 
                and ensure compliance with all applicable policies.
              </p>
            </div>
          )}

          {/* Best Practices */}
          <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-6">
            <h3 className="font-semibold text-purple-900 mb-3">📋 Prompt Safety Best Practices</h3>
            <ul className="text-sm text-purple-800 space-y-2">
              <li>✅ <strong>Be transparent:</strong> Clearly state your legitimate use case and goals</li>
              <li>✅ <strong>Work within guidelines:</strong> Frame requests to fit within ethical boundaries</li>
              <li>✅ <strong>Avoid bypass language:</strong> Don't try to circumvent safety measures</li>
              <li>✅ <strong>Respect terms of service:</strong> Review and comply with AI provider policies</li>
              <li>✅ <strong>Think education over exploitation:</strong> Ask for learning resources rather than harmful instructions</li>
              <li>✅ <strong>Use AI responsibly:</strong> Consider the potential consequences of your prompts</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptCleanerToolInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Why This Tool Matters</h2>
        <p className="text-gray-700 text-lg">
          As AI becomes integral to business operations, ensuring prompt safety is critical. This tool helps 
          organizations and individuals identify potentially problematic language before submitting prompts to AI 
          systems. By catching jailbreak attempts, policy violations, and risky language early, you can protect 
          against account bans, policy violations, and ethical concerns.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">What We Detect</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-semibold text-red-900 mb-2">🔴 High Risk</h3>
            <ul className="text-sm text-red-800 space-y-1 list-disc pl-5">
              <li>Jailbreak attempts</li>
              <li>Malware/hacking requests</li>
              <li>Harmful content generation</li>
              <li>Privacy violations</li>
              <li>Safety bypass attempts</li>
            </ul>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <h3 className="font-semibold text-yellow-900 mb-2">🟡 Medium Risk</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc pl-5">
              <li>Manipulation requests</li>
              <li>Academic integrity concerns</li>
              <li>Questionable content requests</li>
              <li>Terms of service edge cases</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Who Needs This Tool</h2>
        <div className="space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🏢 Enterprise Teams</h3>
            <p className="text-sm text-gray-700">
              Protect against employees accidentally or intentionally violating AI provider terms. 
              Ensure compliance with corporate AI usage policies and prevent account bans.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">👨‍💼 Freelancers & Consultants</h3>
            <p className="text-sm text-gray-700">
              Avoid account suspensions and maintain professional relationships with AI providers. 
              Ensure all client work stays within terms of service.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🎓 Students & Researchers</h3>
            <p className="text-sm text-gray-700">
              Learn to frame requests ethically. Understand how to use AI tools responsibly 
              while maintaining academic integrity.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🛡️ Compliance Teams</h3>
            <p className="text-sm text-gray-700">
              Review and audit prompts for policy compliance. Document responsible AI usage 
              and identify potential risks before they become issues.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Common Risk Patterns</h2>
        <div className="space-y-3 text-gray-700">
          <div>
            <h3 className="font-semibold mb-1">Jailbreak Attempts</h3>
            <p className="text-sm">
              Phrases like "ignore previous instructions" or "act as if you don't have restrictions" 
              are common jailbreak attempts. These try to bypass AI safety guidelines and can result 
              in immediate policy violations.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Malicious Content Requests</h3>
            <p className="text-sm">
              Requests for malware creation, hacking instructions, or harmful code are prohibited. 
              Instead, ask about cybersecurity defense, ethical hacking education, or authorized 
              security testing.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Privacy Violations</h3>
            <p className="text-sm">
              Attempts to access private information, spy on individuals, or violate privacy are 
              illegal and prohibited. Frame requests around authorized access, privacy laws, or 
              ethical information gathering.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Academic Dishonesty</h3>
            <p className="text-sm">
              Asking AI to complete assignments violates academic integrity policies. Use AI for 
              legitimate assistance like brainstorming, research, or editing - not completing work 
              for you.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">How to Fix Risky Prompts</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2">
          <li>
            <strong>Identify the issue:</strong> Review flagged phrases and understand why they're risky
          </li>
          <li>
            <strong>Reframe your intent:</strong> What are you actually trying to achieve? Frame it ethically
          </li>
          <li>
            <strong>Use suggested rewrites:</strong> Our tool provides safe alternatives that maintain your goal
          </li>
          <li>
            <strong>Review compliance:</strong> Ensure your revised prompt aligns with terms of service
          </li>
          <li>
            <strong>Test carefully:</strong> Start with low-risk prompts and build trust with AI providers
          </li>
        </ol>
      </section>

      <section className="mb-10 bg-red-50 border-l-4 border-red-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-red-800">Important Disclaimers</h2>
        <ul className="text-sm text-red-800 space-y-2">
          <li>
            <strong>Not Legal Advice:</strong> This tool identifies potentially problematic language but 
            does not constitute legal advice. Always consult legal professionals for compliance questions.
          </li>
          <li>
            <strong>Provider Policies Vary:</strong> Different AI providers have different policies. 
            Review each provider's terms of service for specific requirements.
          </li>
          <li>
            <strong>False Positives Possible:</strong> Some legitimate prompts may be flagged. Use your 
            judgment and context to determine if flagged language is actually problematic.
          </li>
          <li>
            <strong>Continuous Updates:</strong> AI provider policies evolve. Stay updated on current 
            terms of service and safety guidelines.
          </li>
        </ul>
      </section>
    </>
  );
}

export default PromptCleanerTool;

