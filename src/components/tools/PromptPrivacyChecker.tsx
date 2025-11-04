"use client";

import React, { useState } from 'react';

interface PrivacyIssue {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  matches: string[];
  recommendation: string;
  icon: string;
  color: string;
}

const privacyPatterns = [
  {
    type: 'Email Address',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    severity: 'high' as const,
    description: 'Email addresses can be used to identify individuals',
    recommendation: 'Remove email addresses or replace with placeholders like [email]',
    icon: '📧',
    color: 'red'
  },
  {
    type: 'Phone Number',
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    severity: 'high' as const,
    description: 'Phone numbers can be used to contact or identify individuals',
    recommendation: 'Remove phone numbers or replace with placeholders like [phone]',
    icon: '📱',
    color: 'red'
  },
  {
    type: 'Credit Card',
    pattern: /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/g,
    severity: 'high' as const,
    description: 'Credit card numbers are highly sensitive financial data',
    recommendation: 'Never include credit card numbers in prompts. Remove immediately.',
    icon: '💳',
    color: 'red'
  },
  {
    type: 'SSN (Social Security Number)',
    pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    severity: 'high' as const,
    description: 'SSN is highly sensitive personal identification data',
    recommendation: 'Never include SSN in prompts. Remove immediately.',
    icon: '🆔',
    color: 'red'
  },
  {
    type: 'API Key',
    pattern: /\b(api[_-]?key|apikey|secret[_-]?key|access[_-]?token|bearer[_-]?token)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{20,}['"]?/gi,
    severity: 'high' as const,
    description: 'API keys and tokens provide unauthorized access to services',
    recommendation: 'Remove API keys immediately. Use environment variables instead.',
    icon: '🔑',
    color: 'red'
  },
  {
    type: 'Password',
    pattern: /(password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/gi,
    severity: 'high' as const,
    description: 'Passwords are highly sensitive authentication credentials',
    recommendation: 'Never include passwords in prompts. Remove immediately.',
    icon: '🔐',
    color: 'red'
  },
  {
    type: 'IP Address',
    pattern: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
    severity: 'medium' as const,
    description: 'IP addresses can reveal location and network information',
    recommendation: 'Remove IP addresses or replace with placeholders like [ip]',
    icon: '🌐',
    color: 'orange'
  },
  {
    type: 'URL with Token',
    pattern: /https?:\/\/[^\s]+[?&](token|key|secret|password|auth|api[_-]?key)=[^\s&]+/gi,
    severity: 'high' as const,
    description: 'URLs containing tokens or credentials are sensitive',
    recommendation: 'Remove URLs with tokens. Use sanitized URLs without credentials.',
    icon: '🔗',
    color: 'red'
  },
  {
    type: 'Date of Birth',
    pattern: /\b(0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])[\/\-](19|20)\d{2}\b/g,
    severity: 'medium' as const,
    description: 'Date of birth can be used for identity verification',
    recommendation: 'Remove dates of birth or replace with placeholders like [dob]',
    icon: '📅',
    color: 'orange'
  },
  {
    type: 'Address',
    pattern: /\b\d+\s+[A-Za-z\s]+(street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct)\b/gi,
    severity: 'medium' as const,
    description: 'Physical addresses can reveal location information',
    recommendation: 'Remove addresses or replace with placeholders like [address]',
    icon: '🏠',
    color: 'orange'
  },
  {
    type: 'License Plate',
    pattern: /\b[A-Z]{1,3}\s?\d{1,4}[A-Z]{0,2}\b/g,
    severity: 'low' as const,
    description: 'License plates can be used to identify vehicles',
    recommendation: 'Remove license plates or replace with placeholders like [plate]',
    icon: '🚗',
    color: 'yellow'
  },
  {
    type: 'Bank Account',
    pattern: /\b\d{8,17}\b/g,
    severity: 'high' as const,
    description: 'Bank account numbers are highly sensitive financial data',
    recommendation: 'Never include bank account numbers in prompts. Remove immediately.',
    icon: '🏦',
    color: 'red'
  }
];

function scanForPrivacyIssues(text: string): PrivacyIssue[] {
  const issues: PrivacyIssue[] = [];
  const foundMatches = new Set<string>();

  privacyPatterns.forEach(pattern => {
    const matches = text.match(pattern.pattern);
    if (matches && matches.length > 0) {
      // Filter out false positives
      const validMatches = matches.filter(match => {
        // Additional validation for specific patterns
        if (pattern.type === 'IP Address') {
          const parts = match.split('.');
          if (parts.length !== 4) return false;
          return parts.every(part => {
            const num = parseInt(part);
            return num >= 0 && num <= 255;
          });
        }
        if (pattern.type === 'Bank Account') {
          // Only flag if it's in a context that suggests it's a bank account
          const context = text.toLowerCase();
          if (!context.includes('account') && !context.includes('bank') && !context.includes('routing')) {
            return false;
          }
        }
        return true;
      });

      if (validMatches.length > 0) {
        // Create unique key for this type of issue
        const issueKey = `${pattern.type}-${pattern.severity}`;
        if (!foundMatches.has(issueKey)) {
          foundMatches.add(issueKey);
          issues.push({
            type: pattern.type,
            severity: pattern.severity,
            description: pattern.description,
            matches: validMatches.slice(0, 5), // Limit to first 5 matches
            recommendation: pattern.recommendation,
            icon: pattern.icon,
            color: pattern.color
          });
        }
      }
    }
  });

  // Sort by severity (high first)
  const severityOrder = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return issues;
}

export function PromptPrivacyChecker() {
  const [inputText, setInputText] = useState('');
  const [privacyIssues, setPrivacyIssues] = useState<PrivacyIssue[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  const handleScan = () => {
    if (!inputText.trim()) {
      alert('Please enter some text to scan');
      return;
    }

    setIsScanning(true);
    setShowResults(false);

    setTimeout(() => {
      const issues = scanForPrivacyIssues(inputText);
      setPrivacyIssues(issues);
      setIsScanning(false);
      setShowResults(true);
      setScanComplete(true);
    }, 800);
  };

  const handleClear = () => {
    setInputText('');
    setPrivacyIssues([]);
    setShowResults(false);
    setScanComplete(false);
  };

  const handleLoadExample = () => {
    const examples = [
      'My email is john.doe@example.com and my phone is 555-123-4567. Please help me reset my password which is MySecurePass123!',
      'Contact me at support@company.com or call +1-800-555-0199. My API key is [API_KEY_PLACEHOLDER]',
      'I live at 123 Main Street, New York, NY 10001. My SSN is 123-45-6789 and my credit card is 4532-1234-5678-9010',
      'My date of birth is 01/15/1990 and my IP address is 192.168.1.100. Please access https://api.example.com?token=abc123xyz'
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInputText(randomExample);
  };

  const highSeverityCount = privacyIssues.filter(i => i.severity === 'high').length;
  const mediumSeverityCount = privacyIssues.filter(i => i.severity === 'medium').length;
  const lowSeverityCount = privacyIssues.filter(i => i.severity === 'low').length;

  return (
    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-red-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#DC2626" strokeWidth="2" fill="none"/>
          <path d="M9 12l2 2 4-4" stroke="#DC2626" strokeWidth="2" fill="none"/>
        </svg>
        Prompt Privacy Checker
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-semibold text-red-700">
              Paste Your Prompt <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLoadExample}
                className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your prompt here to check for sensitive data..."
            rows={8}
            className="w-full p-4 border-2 border-red-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 resize-y font-mono text-sm"
          />
          <p className="text-xs text-gray-600 mt-2">
            {inputText.length} characters
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={!inputText.trim() || isScanning}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            inputText.trim() && !isScanning
              ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 hover:scale-105 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isScanning ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Scanning for Privacy Issues...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              Scan for Privacy Issues
            </span>
          )}
        </button>
      </div>

      {showResults && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-red-800 mb-4">Privacy Scan Results</h3>
            {privacyIssues.length === 0 ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-2xl font-bold text-green-800 mb-2">No Privacy Issues Found</h4>
                <p className="text-gray-700">
                  Your prompt appears to be safe and doesn't contain obvious sensitive data.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Note: This tool checks for common patterns. Always review your prompts manually before sharing.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                  <div className="text-3xl font-bold text-red-800 mb-2">{highSeverityCount}</div>
                  <div className="text-sm text-gray-700">High Severity Issues</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                  <div className="text-3xl font-bold text-orange-800 mb-2">{mediumSeverityCount}</div>
                  <div className="text-sm text-gray-700">Medium Severity Issues</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-800 mb-2">{lowSeverityCount}</div>
                  <div className="text-sm text-gray-700">Low Severity Issues</div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy Issues */}
          {privacyIssues.length > 0 && (
            <div className="space-y-4">
              {privacyIssues.map((issue, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                    issue.severity === 'high'
                      ? 'border-red-300 bg-red-50'
                      : issue.severity === 'medium'
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{issue.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`text-lg font-bold ${
                          issue.severity === 'high'
                            ? 'text-red-800'
                            : issue.severity === 'medium'
                            ? 'text-orange-800'
                            : 'text-yellow-800'
                        }`}>
                          {issue.type}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          issue.severity === 'high'
                            ? 'bg-red-200 text-red-800'
                            : issue.severity === 'medium'
                            ? 'bg-orange-200 text-orange-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{issue.description}</p>
                      {issue.matches.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Found:</p>
                          <div className="flex flex-wrap gap-2">
                            {issue.matches.map((match, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm font-mono"
                              >
                                {match.substring(0, 30)}{match.length > 30 ? '...' : ''}
                              </span>
                            ))}
                            {issue.matches.length >= 5 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                                + more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-800 mb-1">Recommendation:</p>
                        <p className="text-sm text-gray-700">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security Warning */}
          {privacyIssues.length > 0 && (
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h4 className="text-lg font-bold text-red-800 mb-2">Security Warning</h4>
                  <p className="text-gray-700 mb-3">
                    Your prompt contains sensitive data that should not be shared with AI models. 
                    This data could be:
                  </p>
                  <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-3">
                    <li>Stored in AI training data</li>
                    <li>Used to train future models</li>
                    <li>Accessible to AI service providers</li>
                    <li>Potentially exposed in data breaches</li>
                  </ul>
                  <p className="text-sm font-semibold text-red-800">
                    ⚠️ Remove all sensitive data before using AI prompts in production or sharing with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Best Practices */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-bold text-blue-800 mb-3">Privacy Best Practices</h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 text-sm">
              <li><strong>Never include credentials:</strong> Passwords, API keys, and tokens should never be in prompts</li>
              <li><strong>Sanitize PII:</strong> Replace personal information with placeholders (e.g., [email], [phone])</li>
              <li><strong>Use environment variables:</strong> Store sensitive data in secure environment variables</li>
              <li><strong>Review before sharing:</strong> Always manually review prompts before sharing with AI services</li>
              <li><strong>Use encryption:</strong> Encrypt sensitive data before sending to AI APIs</li>
              <li><strong>Follow compliance:</strong> Ensure compliance with GDPR, HIPAA, and other privacy regulations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptPrivacyCheckerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">What is a Prompt Privacy Checker?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          A <strong>Prompt Privacy Checker</strong> is a security tool that scans AI prompts for sensitive 
          and personal data. It flags potential privacy issues like email addresses, phone numbers, credentials, 
          credit card numbers, SSNs, API keys, and other personally identifiable information (PII). Perfect 
          for enterprise AI users who need to ensure privacy compliance and protect sensitive data before 
          sending prompts to AI models.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our Prompt Privacy Checker scans prompts by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Pattern Detection:</strong> Uses regex patterns to identify sensitive data types</li>
          <li><strong>Severity Classification:</strong> Categorizes issues as high, medium, or low severity</li>
          <li><strong>Match Highlighting:</strong> Shows exactly what sensitive data was found</li>
          <li><strong>Recommendations:</strong> Provides actionable advice for fixing each issue</li>
          <li><strong>Security Warnings:</strong> Alerts about risks of sharing sensitive data with AI</li>
          <li><strong>Best Practices:</strong> Offers guidance on privacy best practices</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Detected Data Types</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {privacyPatterns.map((pattern, index) => (
            <div key={index} className={`bg-${
              pattern.severity === 'high' ? 'red' : pattern.severity === 'medium' ? 'orange' : 'yellow'
            }-50 p-4 rounded-lg border-2 border-${
              pattern.severity === 'high' ? 'red' : pattern.severity === 'medium' ? 'orange' : 'yellow'
            }-200`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{pattern.icon}</span>
                <div>
                  <h3 className={`font-bold text-${
                    pattern.severity === 'high' ? 'red' : pattern.severity === 'medium' ? 'orange' : 'yellow'
                  }-800`}>{pattern.type}</h3>
                  <span className={`text-xs px-2 py-1 rounded bg-${
                    pattern.severity === 'high' ? 'red' : pattern.severity === 'medium' ? 'orange' : 'yellow'
                  }-200 text-${
                    pattern.severity === 'high' ? 'red' : pattern.severity === 'medium' ? 'orange' : 'yellow'
                  }-800`}>
                    {pattern.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{pattern.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border-l-4 border-red-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Protect Privacy:</strong> Prevent accidental exposure of sensitive data in AI prompts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Ensure Compliance:</strong> Meet GDPR, HIPAA, and other privacy regulations</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Prevent Breaches:</strong> Avoid data leaks and security incidents</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Enterprise Ready:</strong> Perfect for organizations using AI in production</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Peace of Mind:</strong> Verify prompts are safe before sharing with AI services</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Privacy Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Sanitize before sharing:</strong> Always check prompts for sensitive data before using AI</li>
          <li><strong>Use placeholders:</strong> Replace PII with placeholders like [email], [phone], [name]</li>
          <li><strong>Never include credentials:</strong> Passwords, API keys, and tokens should never be in prompts</li>
          <li><strong>Use environment variables:</strong> Store sensitive data securely outside of prompts</li>
          <li><strong>Review manually:</strong> Automated tools can't catch everything - always review manually</li>
          <li><strong>Follow compliance:</strong> Ensure compliance with GDPR, HIPAA, and other regulations</li>
          <li><strong>Encrypt sensitive data:</strong> Use encryption for sensitive data before AI processing</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-red-200">
            <h3 className="font-bold text-red-800 mb-3">✅ Enterprise AI</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Compliance with privacy regulations</li>
              <li>• Protect sensitive customer data</li>
              <li>• Prevent data breaches</li>
              <li>• Secure AI integration</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-pink-200">
            <h3 className="font-bold text-pink-800 mb-3">✅ Developers</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Check prompts before API calls</li>
              <li>• Prevent credential leaks</li>
              <li>• Secure development practices</li>
              <li>• Privacy-aware development</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Paste your prompt</strong> into the text area</li>
          <li><strong>Click "Scan for Privacy Issues"</strong> to analyze your prompt</li>
          <li><strong>Review results</strong> showing any detected sensitive data</li>
          <li><strong>Check severity levels</strong> (high, medium, low) for each issue</li>
          <li><strong>Follow recommendations</strong> to fix each privacy issue</li>
          <li><strong>Remove sensitive data</strong> before using the prompt with AI services</li>
          <li><strong>Re-scan if needed</strong> to verify all issues are resolved</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Important:</strong> This tool helps identify potential privacy issues, but it's not a substitute 
          for manual review and proper security practices. Always follow your organization's privacy and security 
          policies.
        </p>
      </section>
    </>
  );
}

export default PromptPrivacyChecker;

