'use client';

import React, { useState } from 'react';
import { FaGavel, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

interface LicenseInfo {
  name: string;
  commercial: boolean | 'varies';
  attribution: boolean;
  shareAlike: boolean;
  description: string;
  recommendation: string;
}

const licenseDatabase: Record<string, LicenseInfo> = {
  'MIT': {
    name: 'MIT License',
    commercial: true,
    attribution: true,
    shareAlike: false,
    description: 'Permissive license allowing commercial use, modification, and distribution.',
    recommendation: '✅ Safe for commercial use. Must include copyright notice.'
  },
  'Apache-2.0': {
    name: 'Apache License 2.0',
    commercial: true,
    attribution: true,
    shareAlike: false,
    description: 'Allows commercial use with patent grant. More comprehensive than MIT.',
    recommendation: '✅ Safe for commercial use. Must include license text and copyright.'
  },
  'CC-BY': {
    name: 'Creative Commons Attribution',
    commercial: true,
    attribution: true,
    shareAlike: false,
    description: 'Allows commercial use with attribution requirement.',
    recommendation: '✅ Safe for commercial use. Must credit the original creators.'
  },
  'CC-BY-SA': {
    name: 'Creative Commons Attribution-ShareAlike',
    commercial: true,
    attribution: true,
    shareAlike: true,
    description: 'Allows commercial use but derivatives must use the same license.',
    recommendation: '✅ Safe for commercial use. Modified versions must use CC-BY-SA.'
  },
  'CC-BY-NC': {
    name: 'Creative Commons Non-Commercial',
    commercial: false,
    attribution: true,
    shareAlike: false,
    description: 'Allows use but NOT for commercial purposes.',
    recommendation: '❌ NOT for commercial use. Research and educational use only.'
  },
  'CC0': {
    name: 'Public Domain (CC0)',
    commercial: true,
    attribution: false,
    shareAlike: false,
    description: 'Public domain dedication. No restrictions.',
    recommendation: '✅ Safe for commercial use. No attribution required.'
  },
  'ODbL': {
    name: 'Open Database License',
    commercial: true,
    attribution: true,
    shareAlike: true,
    description: 'Allows commercial use with attribution and ShareAlike for database contents.',
    recommendation: '✅ Safe for commercial use. Check ShareAlike requirements.'
  },
  'Proprietary': {
    name: 'Proprietary License',
    commercial: 'varies',
    attribution: false,
    shareAlike: false,
    description: 'Custom license terms. Must check specific agreement.',
    recommendation: '⚠️ Check specific license terms. Consult legal if needed.'
  }
};

function DatasetLicenseChecker() {
  const [licenseInput, setLicenseInput] = useState('');
  const [result, setResult] = useState<LicenseInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  const checkLicense = () => {
    const normalized = licenseInput.trim();
    
    // Try exact match first
    let found = licenseDatabase[normalized];
    
    // Try partial matches
    if (!found) {
      const lower = normalized.toLowerCase();
      found = Object.values(licenseDatabase).find(lic => 
        lic.name.toLowerCase().includes(lower) ||
        lower.includes(lic.name.toLowerCase())
      ) || null;
    }

    // Check for common variations
    if (!found) {
      if (lower.includes('mit')) found = licenseDatabase['MIT'];
      else if (lower.includes('apache')) found = licenseDatabase['Apache-2.0'];
      else if (lower.includes('cc-by') && lower.includes('nc')) found = licenseDatabase['CC-BY-NC'];
      else if (lower.includes('cc-by') && lower.includes('sa')) found = licenseDatabase['CC-BY-SA'];
      else if (lower.includes('cc-by') && !lower.includes('nc') && !lower.includes('sa')) found = licenseDatabase['CC-BY'];
      else if (lower.includes('cc0') || lower.includes('public domain')) found = licenseDatabase['CC0'];
      else if (lower.includes('odbl')) found = licenseDatabase['ODbL'];
      else if (lower.includes('proprietary') || lower.includes('custom')) found = licenseDatabase['Proprietary'];
    }

    if (found) {
      setResult(found);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }
  };

  const formatCommercialUse = (commercial: boolean | 'varies') => {
    if (commercial === true) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
          <FaCheckCircle /> Allowed
        </span>
      );
    } else if (commercial === false) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
          <FaTimesCircle /> Not Allowed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
          <FaExclamationTriangle /> Check License
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* License Checker */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FaGavel className="text-red-600" />
          Dataset License Checker
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter License Name
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkLicense()}
                placeholder="e.g., MIT, Apache 2.0, CC-BY, CC-BY-NC..."
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={checkLicense}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Check License
              </button>
            </div>
          </div>

          {/* Quick Examples */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {['MIT', 'Apache-2.0', 'CC-BY', 'CC-BY-NC', 'CC0'].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setLicenseInput(example);
                    setTimeout(checkLicense, 100);
                  }}
                  className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-100"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">{result.name}</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Commercial Use:</p>
              {formatCommercialUse(result.commercial)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Attribution Required:</p>
                <p className="text-gray-600">
                  {result.attribution ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">ShareAlike:</p>
                <p className="text-gray-600">
                  {result.shareAlike ? (
                    <span className="text-blue-600">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Description:</p>
              <p className="text-blue-800">{result.description}</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Recommendation:</p>
              <p className="text-gray-700">{result.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {notFound && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-yellow-600 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">License Not Found</h3>
              <p className="text-yellow-800 text-sm mb-2">
                We couldn't find information about this license in our database. This could mean:
              </p>
              <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1 ml-4">
                <li>The license name is misspelled or uses different formatting</li>
                <li>It's a custom or proprietary license not in our database</li>
                <li>It's a newer license we haven't added yet</li>
              </ul>
              <p className="text-yellow-800 text-sm mt-3">
                <strong>Recommendation:</strong> Read the full license text carefully and consult with a legal professional if you're unsure about commercial use rights.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* License Database */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Common Dataset Licenses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">License</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Commercial Use</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Attribution</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Object.values(licenseDatabase).map((license) => (
                <tr key={license.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{license.name}</td>
                  <td className="px-4 py-3">
                    {formatCommercialUse(license.commercial)}
                  </td>
                  <td className="px-4 py-3">
                    {license.attribution ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Export info sections component
export function DatasetLicenseCheckerInfoSections() {
  return (
    <div className="mt-12 space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Understanding Dataset Licenses</h2>
        <p className="text-gray-700 mb-4">
          Dataset licenses determine how you can use, modify, and distribute datasets. Understanding license terms 
          is crucial for legal compliance, especially in commercial applications.
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li><strong>Commercial Use:</strong> Whether you can use the dataset in commercial projects</li>
          <li><strong>Attribution:</strong> Whether you must credit the original creators</li>
          <li><strong>ShareAlike:</strong> Whether derivatives must use the same license</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Legal Disclaimer</h2>
        <p className="text-gray-700">
          This tool provides general information about common dataset licenses but does not constitute legal advice. 
          Always review the full license text for any dataset you plan to use, and consult with a qualified legal 
          professional for specific licensing questions related to your use case.
        </p>
      </section>
    </div>
  );
}

export default DatasetLicenseChecker;
export { DatasetLicenseChecker };
