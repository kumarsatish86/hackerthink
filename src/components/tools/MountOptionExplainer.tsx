'use client';
import React, { useState } from 'react';

interface MountOption {
  name: string;
  category: string;
  description: string;
  effects: string[];
  useCases: string[];
  conflicts: string[];
  examples: string[];
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

export const MountOptionExplainerInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Mount Option Explanation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Mount Option Explanation?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you understand what different mount options do and when to use them. 
          Learn about performance options, security settings, network configurations, and how 
          different options affect your filesystem behavior and system performance.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Understand what each mount option does</li>
            <li>Learn when to use specific options</li>
            <li>Discover performance and security implications</li>
            <li>Find conflicting options to avoid</li>
            <li>Get practical examples for common scenarios</li>
          </ul>
        </div>
      </div>

      {/* Mount Option Categories */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Mount Option Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Performance Options</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>noatime</code> - Access time optimization</li>
              <li>• <code>async/sync</code> - Write behavior control</li>
              <li>• <code>nodiratime</code> - Directory access optimization</li>
              <li>• <code>barrier</code> - Journaling control</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Security Options</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>noexec</code> - Binary execution prevention</li>
              <li>• <code>nosuid</code> - Set-UID bit handling</li>
              <li>• <code>nodev</code> - Device file handling</li>
              <li>• <code>ro</code> - Read-only mounting</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Network Options</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>username/password</code> - Authentication</li>
              <li>• <code>uid/gid</code> - Ownership mapping</li>
              <li>• <code>vers</code> - Protocol version</li>
              <li>• <code>sec</code> - Security mode</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Behavior Options</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>auto/noauto</code> - Boot mounting</li>
              <li>• <code>user/nouser</code> - User mounting</li>
              <li>• <code>defaults</code> - Standard options</li>
              <li>• <code>errors</code> - Error handling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Understanding Mount Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Understanding Mount Options</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">How Options Work</h4>
            <p className="text-purple-800 text-sm">
              Mount options are specified with the <code>-o</code> flag and control how the filesystem 
              is mounted and behaves. Options can be combined with commas, and some options have 
              parameters (e.g., <code>uid=1000</code>). Understanding these options helps you optimize 
              performance, security, and functionality for your specific use case.
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Option Precedence</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Later options can override earlier ones</li>
              <li>• Some options are mutually exclusive</li>
              <li>• Filesystem-specific options take precedence</li>
              <li>• Default options can be modified</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-indigo-900">Best Practices</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Performance Optimization</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use <code>noatime</code> for data filesystems</li>
              <li>• Consider <code>async</code> for better write performance</li>
              <li>• Use <code>nodiratime</code> with <code>noatime</code></li>
              <li>• Avoid <code>sync</code> unless data integrity is critical</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Security Hardening</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use <code>noexec</code> for data-only mounts</li>
              <li>• Apply <code>nosuid</code> for untrusted filesystems</li>
              <li>• Use <code>ro</code> for read-only data</li>
              <li>• Consider <code>nodev</code> for security</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Mistakes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Common Mistakes to Avoid</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Conflicting Options</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• <code>ro</code> and <code>rw</code> cannot be used together</li>
              <li>• <code>sync</code> and <code>async</code> are mutually exclusive</li>
              <li>• <code>user</code> and <code>nouser</code> conflict</li>
              <li>• <code>auto</code> and <code>noauto</code> are opposites</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Performance Issues</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Using <code>sync</code> on high-performance systems</li>
              <li>• Not using <code>noatime</code> for large filesystems</li>
              <li>• Over-optimizing with unnecessary options</li>
              <li>• Ignoring filesystem-specific recommendations</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Mount Command Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Generate mount commands with options</p>
          <a href="/tools/mount-command-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Mount Command Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Fstab Entry Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Create proper fstab entries</p>
          <a href="/tools/fstab-entry-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Fstab Entry Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Fstab Entry Validator</h4>
          <p className="text-gray-600 text-sm mb-3">Validate fstab configurations</p>
          <a href="/tools/fstab-entry-validator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Fstab Entry Validator →
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

export const MountOptionExplainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mountOptions: MountOption[] = [
    // Performance Options
    {
      name: 'noatime',
      category: 'performance',
      description: 'Do not update access times on files and directories. This significantly improves performance on filesystems with many files.',
      effects: [
        'Faster file access operations',
        'Reduced disk I/O',
        'No access time updates',
        'Better performance for read-heavy workloads'
      ],
      useCases: [
        'Data storage filesystems',
        'Web server document roots',
        'Database storage directories',
        'Large filesystems with many files'
      ],
      conflicts: ['atime', 'relatime'],
      examples: [
        'mount -o noatime /dev/sda1 /data',
        'mount -o defaults,noatime /dev/sdb1 /backup'
      ]
    },
    {
      name: 'nodiratime',
      category: 'performance',
      description: 'Do not update access times on directories. This is often used with noatime for maximum performance.',
      effects: [
        'Faster directory operations',
        'Reduced disk I/O for directories',
        'No directory access time updates'
      ],
      useCases: [
        'High-performance servers',
        'Large directory structures',
        'When using noatime option'
      ],
      conflicts: ['diratime'],
      examples: [
        'mount -o noatime,nodiratime /dev/sda1 /data',
        'mount -o defaults,noatime,nodiratime /dev/sdb1 /backup'
      ]
    },
    {
      name: 'async',
      category: 'performance',
      description: 'Use asynchronous I/O operations. This is the default and provides better performance by buffering writes.',
      effects: [
        'Better write performance',
        'Writes are buffered in memory',
        'Faster application response',
        'Potential data loss on power failure'
      ],
      useCases: [
        'General purpose filesystems',
        'Performance-critical applications',
        'When data loss is acceptable'
      ],
      conflicts: ['sync'],
      examples: [
        'mount -o async /dev/sda1 /data',
        'mount -o defaults,async /dev/sdb1 /backup'
      ]
    },
    {
      name: 'sync',
      category: 'performance',
      description: 'Use synchronous I/O operations. Writes are immediately written to disk, ensuring data integrity.',
      effects: [
        'Guaranteed data integrity',
        'Slower write performance',
        'Immediate disk writes',
        'Better for critical data'
      ],
      useCases: [
        'Database filesystems',
        'Financial data storage',
        'Critical system files',
        'When data integrity is paramount'
      ],
      conflicts: ['async'],
      examples: [
        'mount -o sync /dev/sda1 /database',
        'mount -o defaults,sync /dev/sdb1 /financial'
      ]
    },
    // Security Options
    {
      name: 'noexec',
      category: 'security',
      description: 'Prevent execution of binaries from this filesystem. This is a security measure to prevent malicious code execution.',
      effects: [
        'No binary execution allowed',
        'Enhanced security',
        'Prevents script execution',
        'Protects against malware'
      ],
      useCases: [
        'Data-only filesystems',
        'User upload directories',
        'Untrusted filesystems',
        'Security-sensitive environments'
      ],
      conflicts: ['exec'],
      examples: [
        'mount -o noexec /dev/sda1 /uploads',
        'mount -o defaults,noexec /dev/sdb1 /userdata'
      ]
    },
    {
      name: 'nosuid',
      category: 'security',
      description: 'Ignore set-user-ID and set-group-ID bits on files. This prevents privilege escalation attacks.',
      effects: [
        'SUID/SGID bits ignored',
        'Enhanced security',
        'Prevents privilege escalation',
        'Protects against root exploits'
      ],
      useCases: [
        'Untrusted filesystems',
        'User data directories',
        'Network mounts',
        'Security-hardened systems'
      ],
      conflicts: ['suid'],
      examples: [
        'mount -o nosuid /dev/sda1 /userdata',
        'mount -o defaults,nosuid /dev/sdb1 /shared'
      ]
    },
    {
      name: 'nodev',
      category: 'security',
      description: 'Do not interpret device files on this filesystem. This prevents access to hardware devices.',
      effects: [
        'Device files not accessible',
        'Enhanced security',
        'Prevents device access',
        'Protects against device attacks'
      ],
      useCases: [
        'Untrusted filesystems',
        'User data directories',
        'Security-sensitive mounts',
        'When device access is not needed'
      ],
      conflicts: ['dev'],
      examples: [
        'mount -o nodev /dev/sda1 /userdata',
        'mount -o defaults,nodev /dev/sdb1 /shared'
      ]
    },
    {
      name: 'ro',
      category: 'security',
      description: 'Mount filesystem as read-only. No writes are allowed, protecting data from modification.',
      effects: [
        'No writes allowed',
        'Data protection',
        'Prevents accidental deletion',
        'Immutable filesystem'
      ],
      useCases: [
        'CD/DVD mounts',
        'Backup verification',
        'System recovery',
        'Read-only data'
      ],
      conflicts: ['rw'],
      examples: [
        'mount -o ro /dev/cdrom /media/cdrom',
        'mount -o defaults,ro /dev/sda1 /backup'
      ]
    },
    // Network Options
    {
      name: 'username',
      category: 'network',
      description: 'Specify username for network authentication. Used with network filesystems like CIFS/SMB.',
      effects: [
        'Network authentication',
        'User-specific access',
        'Credential-based mounting',
        'Access control'
      ],
      useCases: [
        'Windows shares (CIFS/SMB)',
        'Network storage',
        'User-specific mounts',
        'Enterprise environments'
      ],
      conflicts: ['guest'],
      examples: [
        'mount -o username=john //server/share /mnt/share',
        'mount -o username=admin,password=pass //server/admin /mnt/admin'
      ]
    },
    {
      name: 'uid',
      category: 'network',
      description: 'Set the owner user ID for files on this filesystem. Useful for network mounts.',
      effects: [
        'File ownership mapping',
        'User ID translation',
        'Permission control',
        'Cross-platform compatibility'
      ],
      useCases: [
        'Network filesystems',
        'Cross-platform mounts',
        'User permission mapping',
        'Multi-user systems'
      ],
      conflicts: [],
      examples: [
        'mount -o uid=1000 //server/share /mnt/share',
        'mount -o username=john,uid=1000 //server/share /mnt/share'
      ]
    },
    {
      name: 'gid',
      category: 'network',
      description: 'Set the owner group ID for files on this filesystem. Useful for network mounts.',
      effects: [
        'Group ownership mapping',
        'Group ID translation',
        'Permission control',
        'Cross-platform compatibility'
      ],
      useCases: [
        'Network filesystems',
        'Cross-platform mounts',
        'Group permission mapping',
        'Multi-user systems'
      ],
      conflicts: [],
      examples: [
        'mount -o gid=1000 //server/share /mnt/share',
        'mount -o username=john,gid=1000 //server/share /mnt/share'
      ]
    },
    // Behavior Options
    {
      name: 'defaults',
      category: 'behavior',
      description: 'Use default mount options: rw, suid, dev, exec, auto, nouser, async.',
      effects: [
        'Standard mount behavior',
        'Read-write access',
        'Binary execution allowed',
        'Automatic mounting'
      ],
      useCases: [
        'General purpose mounts',
        'Standard filesystem access',
        'When specific options not needed',
        'Default configurations'
      ],
      conflicts: [],
      examples: [
        'mount -o defaults /dev/sda1 /mnt/data',
        'mount -o defaults,noatime /dev/sdb1 /mnt/backup'
      ]
    },
    {
      name: 'auto',
      category: 'behavior',
      description: 'Mount filesystem automatically at boot time. This is the default behavior.',
      effects: [
        'Automatic mounting at boot',
        'Filesystem available after reboot',
        'System startup dependency',
        'Persistent mounts'
      ],
      useCases: [
        'System filesystems',
        'Data storage',
        'Boot-required mounts',
        'Standard configurations'
      ],
      conflicts: ['noauto'],
      examples: [
        'mount -o auto /dev/sda1 /mnt/data',
        'mount -o defaults,auto /dev/sdb1 /mnt/backup'
      ]
    },
    {
      name: 'noauto',
      category: 'behavior',
      description: 'Do not mount filesystem automatically at boot. Manual mounting required.',
      effects: [
        'Manual mounting required',
        'No boot dependency',
        'On-demand access',
        'Flexible mounting'
      ],
      useCases: [
        'Temporary mounts',
        'External devices',
        'Optional storage',
        'Development environments'
      ],
      conflicts: ['auto'],
      examples: [
        'mount -o noauto /dev/sda1 /mnt/temp',
        'mount -o defaults,noauto /dev/sdb1 /mnt/optional'
      ]
    },
    {
      name: 'user',
      category: 'behavior',
      description: 'Allow non-root users to mount and unmount this filesystem.',
      effects: [
        'User mounting allowed',
        'Non-root access',
        'Flexible mounting',
        'Desktop user support'
      ],
      useCases: [
        'Desktop systems',
        'User devices',
        'Removable media',
        'Multi-user environments'
      ],
      conflicts: ['nouser'],
      examples: [
        'mount -o user /dev/sda1 /mnt/userdata',
        'mount -o defaults,user /dev/sdb1 /mnt/shared'
      ]
    }
  ];

  const categories = [
    { value: 'all', label: 'All Options' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'network', label: 'Network' },
    { value: 'behavior', label: 'Behavior' }
  ];

  const filteredOptions = mountOptions.filter(option => {
    const matchesSearch = option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         option.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || option.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-green-100 text-green-800 border-green-300';
      case 'security': return 'bg-red-100 text-red-800 border-red-300';
      case 'network': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'behavior': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡';
      case 'security': return '🔒';
      case 'network': return '🌐';
      case 'behavior': return '⚙️';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Search Mount Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Options
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by option name or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Filter
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-gray-600">
          Found <span className="font-semibold text-blue-600">{filteredOptions.length}</span> mount options
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedCategory !== 'all' && ` in ${categories.find(c => c.value === selectedCategory)?.label} category`}
        </p>
      </div>

      {/* Mount Options List */}
      <div className="space-y-6">
        {filteredOptions.map((option, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(option.category)}</span>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{option.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor(option.category)}`}>
                    {option.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{option.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Effects */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Effects</h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {option.effects.map((effect, effectIndex) => (
                    <li key={effectIndex}>{effect}</li>
                  ))}
                </ul>
              </div>

              {/* Use Cases */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Use Cases</h4>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  {option.useCases.map((useCase, useCaseIndex) => (
                    <li key={useCaseIndex}>{useCase}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conflicts and Examples */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Conflicts */}
              {option.conflicts.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Conflicts With</h4>
                  <div className="flex flex-wrap gap-2">
                    {option.conflicts.map((conflict, conflictIndex) => (
                      <span key={conflictIndex} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded border border-red-300">
                        {conflict}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Examples</h4>
                <div className="space-y-2">
                  {option.examples.map((example, exampleIndex) => (
                    <div key={exampleIndex} className="bg-gray-100 p-2 rounded text-sm font-mono">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredOptions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mount Options Found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or category filter to find mount options.
          </p>
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.filter(cat => cat.value !== 'all').map(category => (
            <div key={category.value} className="text-center">
              <div className="text-3xl mb-2">{getCategoryIcon(category.value)}</div>
              <h4 className="font-medium text-blue-900 mb-1">{category.label}</h4>
              <p className="text-blue-700 text-sm">
                {mountOptions.filter(opt => opt.category === category.value).length} options
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-yellow-900 mb-2">💡 Pro Tips</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Use <code>noatime</code> for better performance on data filesystems</li>
          <li>• Combine <code>noexec,nosuid,nodev</code> for security on untrusted mounts</li>
          <li>• Use <code>sync</code> only when data integrity is critical</li>
          <li>• Consider <code>user</code> option for desktop systems</li>
          <li>• Test mount options in a safe environment before production use</li>
        </ul>
      </div>
    </div>
  );
};

export default MountOptionExplainer;
