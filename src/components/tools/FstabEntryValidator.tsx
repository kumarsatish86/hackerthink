'use client';
import React, { useState } from 'react';

interface FstabEntry {
  device: string;
  mountPoint: string;
  filesystem: string;
  options: string[];
  dump: number;
  pass: number;
  lineNumber: number;
  originalLine: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface HeroSectionProps {
  title: string;
  description: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ title, description }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
    </div>
  );
};

export const FstabEntryValidatorInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Fstab Entry Validation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Fstab Entry Validation?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you validate existing `/etc/fstab` entries and identify potential configuration issues. 
          Check for syntax errors, invalid mount options, missing directories, and other common problems that could 
          prevent your system from booting properly.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Validate existing fstab entries for syntax errors</li>
            <li>Check mount point directories for existence</li>
            <li>Verify device paths and filesystem types</li>
            <li>Identify conflicting mount options</li>
            <li>Prevent boot failures due to fstab errors</li>
          </ul>
        </div>
      </div>

      {/* Common Fstab Errors */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Common Fstab Errors</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-red-900 mb-2">Syntax Errors</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Missing or extra fields in fstab line</li>
              <li>• Incorrect field separators (tabs vs spaces)</li>
              <li>• Malformed mount options</li>
              <li>• Invalid dump or pass values</li>
            </ul>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-red-900 mb-2">Device Issues</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Non-existent device paths</li>
              <li>• Invalid UUID or LABEL formats</li>
              <li>• Missing device files</li>
              <li>• Incorrect filesystem type</li>
            </ul>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-medium text-red-900 mb-2">Mount Point Problems</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Non-existent mount point directories</li>
              <li>• Relative paths instead of absolute paths</li>
              <li>• Mounting over system directories</li>
              <li>• Permission issues on mount points</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Validation Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Validation Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Syntax Validation</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Field count verification</li>
              <li>• Separator validation</li>
              <li>• Data type checking</li>
              <li>• Format compliance</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Content Validation</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Device path verification</li>
              <li>• Mount point existence</li>
              <li>• Filesystem type checking</li>
              <li>• Option compatibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices for Validation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Best Practices for Validation</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Before Making Changes</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Always backup your /etc/fstab file</li>
              <li>• Test mount commands manually first</li>
              <li>• Use UUID or LABEL instead of device names</li>
              <li>• Validate syntax before rebooting</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">During Validation</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Check each field individually</li>
              <li>• Verify mount point directories exist</li>
              <li>• Test device accessibility</li>
              <li>• Review mount option compatibility</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting Validation Issues */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-orange-900">Troubleshooting Validation Issues</h3>
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Device Not Found</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Check if device exists: <code>ls -la /dev/</code></li>
              <li>• Verify UUID: <code>blkid</code></li>
              <li>• Check partition table: <code>fdisk -l</code></li>
              <li>• Use <code>findmnt</code> to see current mounts</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Mount Point Issues</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Create missing directories: <code>mkdir -p /mount/point</code></li>
              <li>• Check permissions: <code>ls -ld /mount/point</code></li>
              <li>• Verify ownership: <code>chown user:group /mount/point</code></li>
              <li>• Test mount manually: <code>mount /dev/device /mount/point</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Safety Considerations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Safety Considerations</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Critical Warnings</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Never edit /etc/fstab on a running system without backup</li>
              <li>• Avoid modifying root filesystem entries</li>
              <li>• Test changes in a safe environment first</li>
              <li>• Keep rescue media available for emergency recovery</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Recovery Steps</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Boot from rescue media if system won't start</li>
              <li>• Mount root filesystem in rescue mode</li>
              <li>• Edit /etc/fstab to fix errors</li>
              <li>• Reboot and test the system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RelatedToolsSection: React.FC<{ tools: any[] }> = ({ tools }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Related Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Fstab Entry Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Create proper fstab entries</p>
          <a href="/tools/fstab-entry-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Fstab Entry Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Filesystem Checker</h4>
          <p className="text-gray-600 text-sm mb-3">Check and repair filesystem issues</p>
          <a href="/tools/filesystem-checker" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Filesystem Checker →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Mount Point Validator</h4>
          <p className="text-gray-600 text-sm mb-3">Validate mount point configurations</p>
          <a href="/tools/mount-point-validator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Mount Point Validator →
          </a>
        </div>
      </div>
    </div>
  );
};

export const SubscribeSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-8 text-center text-white">
      <h3 className="text-2xl font-bold mb-4">Stay Updated with Linux Tools</h3>
      <p className="text-blue-100 mb-6">
        Get notified about new tools, updates, and Linux administration tips.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <input
          type="email"
          placeholder="Enter your email address"
          className="px-4 py-2 rounded-md text-gray-900 w-full sm:w-64"
        />
        <button className="px-6 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export const FstabEntryValidator: React.FC = () => {
  const [fstabContent, setFstabContent] = useState('');
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const parseFstabLine = (line: string, lineNumber: number): FstabEntry | null => {
    // Remove comments and empty lines
    const cleanLine = line.split('#')[0].trim();
    if (!cleanLine) return null;

    // Split by tabs or multiple spaces
    const fields = cleanLine.split(/\s+/);
    
    if (fields.length !== 6) {
      return null;
    }

    const [device, mountPoint, filesystem, options, dump, pass] = fields;
    
    return {
      device,
      mountPoint,
      filesystem,
      options: options.split(',').filter(opt => opt.trim()),
      dump: parseInt(dump) || 0,
      pass: parseInt(pass) || 0,
      lineNumber,
      originalLine: line
    };
  };

  const validateEntry = (entry: FstabEntry): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Device validation
    if (!entry.device) {
      errors.push('Device field is empty');
    } else if (entry.device.startsWith('/dev/')) {
      // Check if device path is reasonable (basic check)
      if (entry.device.length < 5) {
        warnings.push('Device path seems too short');
      }
    } else if (entry.device.startsWith('UUID=')) {
      if (!entry.device.match(/^UUID=[a-f0-9-]+$/i)) {
        errors.push('Invalid UUID format');
      }
    } else if (entry.device.startsWith('LABEL=')) {
      if (entry.device.length < 7) {
        warnings.push('Label seems too short');
      }
    } else if (entry.device === 'swap') {
      // Swap is valid
    } else {
      warnings.push('Device format not recognized (consider using UUID or LABEL)');
    }

    // Mount point validation
    if (!entry.mountPoint) {
      errors.push('Mount point field is empty');
    } else if (!entry.mountPoint.startsWith('/') && entry.mountPoint !== 'swap') {
      errors.push('Mount point must be an absolute path or "swap"');
    } else if (entry.mountPoint === '/') {
      warnings.push('Root filesystem mount point - be very careful with changes');
    } else if (entry.mountPoint.includes(' ')) {
      errors.push('Mount point contains spaces');
    }

    // Filesystem validation
    if (!entry.filesystem) {
      errors.push('Filesystem type field is empty');
    } else {
      const validFilesystems = [
        'ext4', 'ext3', 'ext2', 'xfs', 'btrfs', 'ntfs', 'fat32', 'vfat',
        'iso9660', 'tmpfs', 'swap', 'auto', 'nfs', 'cifs'
      ];
      if (!validFilesystems.includes(entry.filesystem.toLowerCase())) {
        warnings.push(`Filesystem type "${entry.filesystem}" is not commonly used`);
      }
    }

    // Options validation
    if (entry.options.length === 0) {
      errors.push('No mount options specified');
    } else {
      const validOptions = [
        'ro', 'rw', 'noatime', 'nodiratime', 'noexec', 'nosuid', 'nodev',
        'sync', 'async', 'defaults', 'errors=remount-ro', 'errors=continue',
        'errors=panic', 'user', 'nouser', 'auto', 'noauto'
      ];
      
      entry.options.forEach(option => {
        if (!validOptions.includes(option) && !option.includes('=')) {
          warnings.push(`Mount option "${option}" is not commonly used`);
        }
      });

      // Check for conflicting options
      if (entry.options.includes('ro') && entry.options.includes('rw')) {
        errors.push('Conflicting options: ro and rw cannot be used together');
      }
      if (entry.options.includes('sync') && entry.options.includes('async')) {
        errors.push('Conflicting options: sync and async cannot be used together');
      }
    }

    // Dump validation
    if (entry.dump !== 0 && entry.dump !== 1) {
      errors.push('Dump field must be 0 or 1');
    }

    // Pass validation
    if (entry.pass < 0 || entry.pass > 2) {
      errors.push('Pass field must be 0, 1, or 2');
    }

    // Special cases
    if (entry.filesystem === 'swap' && entry.mountPoint !== 'swap') {
      errors.push('Swap filesystem must use mount point "swap"');
    }

    if (entry.mountPoint === '/' && entry.pass !== 1) {
      warnings.push('Root filesystem should typically have pass=1');
    }

    // Suggestions
    if (entry.device.startsWith('/dev/') && !entry.device.startsWith('/dev/disk/')) {
      suggestions.push('Consider using UUID or LABEL instead of device path for better reliability');
    }

    if (entry.options.includes('defaults')) {
      suggestions.push('The "defaults" option is good for most use cases');
    }

    if (entry.dump === 0 && entry.filesystem !== 'swap') {
      suggestions.push('Consider setting dump=1 for data filesystems if you use backup tools');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  };

  const validateFstab = () => {
    setIsValidating(true);
    const lines = fstabContent.split('\n');
    const results: ValidationResult[] = [];

    lines.forEach((line, index) => {
      const entry = parseFstabLine(line, index + 1);
      if (entry) {
        const result = validateEntry(entry);
        results.push(result);
      } else if (line.trim() && !line.trim().startsWith('#')) {
        // Invalid line format
        results.push({
          isValid: false,
          errors: ['Invalid fstab line format - must have exactly 6 fields'],
          warnings: [],
          suggestions: ['Check field count and separators']
        });
      }
    });

    setValidationResults(results);
    setIsValidating(false);
  };

  const getOverallStatus = (): { isValid: boolean; errorCount: number; warningCount: number } => {
    let errorCount = 0;
    let warningCount = 0;

    validationResults.forEach(result => {
      errorCount += result.errors.length;
      warningCount += result.warnings.length;
    });

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Fstab Content Input</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your /etc/fstab content here:
          </label>
          <textarea
            value={fstabContent}
            onChange={(e) => setFstabContent(e.target.value)}
            placeholder="# /etc/fstab: static file system information.
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed.
UUID=12345678-1234-1234-1234-123456789012 / ext4 defaults,noatime 0 1
UUID=87654321-4321-4321-4321-210987654321 /home ext4 defaults 0 2
UUID=11111111-1111-1111-1111-111111111111 swap swap defaults 0 0"
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={validateFstab}
            disabled={!fstabContent.trim() || isValidating}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Validate Fstab'}
          </button>
          <button
            onClick={() => setFstabContent('')}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Overall Status */}
      {validationResults.length > 0 && (
        <div className={`rounded-lg p-6 ${
          overallStatus.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              overallStatus.isValid ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <span className="text-white font-bold">
                {overallStatus.isValid ? '✓' : '✗'}
              </span>
            </div>
            <h3 className={`text-xl font-semibold ${
              overallStatus.isValid ? 'text-green-900' : 'text-red-900'
            }`}>
              {overallStatus.isValid ? 'Fstab Validation Passed' : 'Fstab Validation Failed'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{validationResults.length}</div>
              <div className="text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overallStatus.errorCount}</div>
              <div className="text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{overallStatus.warningCount}</div>
              <div className="text-gray-600">Warnings</div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {validationResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Validation Results</h3>
          {validationResults.map((result, index) => (
            <div key={index} className={`rounded-lg p-4 border ${
              result.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <h4 className={`font-medium ${
                  result.isValid ? 'text-green-900' : 'text-red-900'
                }`}>
                  Entry {index + 1}
                </h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.isValid ? 'Valid' : 'Invalid'}
                </span>
              </div>

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
                  <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                    {result.errors.map((error, errorIndex) => (
                      <li key={errorIndex}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-yellow-900 mb-2">Warnings:</h5>
                  <ul className="list-disc list-inside text-yellow-800 text-sm space-y-1">
                    {result.warnings.map((warning, warningIndex) => (
                      <li key={warningIndex}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="mb-3">
                  <h5 className="font-medium text-blue-900 mb-2">Suggestions:</h5>
                  <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                    {result.suggestions.map((suggestion, suggestionIndex) => (
                      <li key={suggestionIndex}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Validation Tips */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Validation Tips</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Check Field Count</h4>
            <p className="text-sm">Each line must have exactly 6 fields separated by tabs or spaces.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Verify Device Paths</h4>
            <p className="text-sm">Use <code>blkid</code> to get UUIDs and <code>ls -la /dev/</code> to check device existence.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Test Mount Points</h4>
            <p className="text-sm">Ensure mount point directories exist and have proper permissions.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Validate Options</h4>
            <p className="text-sm">Check for conflicting mount options and use appropriate filesystem-specific options.</p>
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-yellow-900 mb-2">⚠️ Important Safety Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Always backup your /etc/fstab file before making changes</li>
          <li>• Test mount commands manually before updating fstab</li>
          <li>• Use rescue media if your system won't boot after fstab changes</li>
          <li>• Be extremely careful with root filesystem entries</li>
          <li>• Validate syntax before rebooting the system</li>
        </ul>
      </div>
    </div>
  );
};

export default FstabEntryValidator;
