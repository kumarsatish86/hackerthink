'use client';
import React, { useState } from 'react';

interface FilesystemLabel {
  device: string;
  currentLabel: string;
  newLabel: string;
  filesystem: string;
  mountPoint: string;
  operation: 'read' | 'set' | 'remove';
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

export const DiskLabelingToolInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Disk Labeling */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Disk Labeling?</h3>
        <p className="text-gray-700 mb-4">
          Disk labeling allows you to assign human-readable names to filesystems, making them easier 
          to identify and manage. Instead of using device names like /dev/sda1, you can use descriptive 
          labels like "DATA" or "BACKUP" in your mount configurations and scripts.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Human-readable device identification</li>
            <li>Persistent naming across reboots</li>
            <li>Easier mount configuration management</li>
            <li>Better script readability</li>
            <li>Device independence in configurations</li>
          </ul>
        </div>
      </div>

      {/* Supported Filesystems */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Supported Filesystem Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Linux Native</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>ext2/ext3/ext4</code> - Extended filesystem family</li>
              <li>• <code>xfs</code> - High-performance filesystem</li>
              <li>• <code>btrfs</code> - Advanced filesystem</li>
              <li>• <code>jfs</code> - Journaled filesystem</li>
              <li>• <code>reiserfs</code> - Legacy filesystem</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Other Filesystems</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>fat16/fat32</code> - Legacy FAT filesystems</li>
              <li>• <code>ntfs</code> - Windows NTFS</li>
              <li>• <code>hfs/hfs+</code> - macOS filesystems</li>
              <li>• <code>udf</code> - Universal Disk Format</li>
              <li>• <code>iso9660</code> - CD/DVD filesystem</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Labeling Commands */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Labeling Commands by Filesystem</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">ext2/ext3/ext4 Filesystems</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>e2label</code> - Set or display label</li>
              <li>• <code>tune2fs -L</code> - Alternative method</li>
              <li>• <code>blkid</code> - Display current labels</li>
              <li>• Maximum label length: 16 characters</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">XFS Filesystems</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>xfs_admin -L</code> - Set label</li>
              <li>• <code>xfs_admin -l</code> - Display label</li>
              <li>• <code>blkid</code> - Display current labels</li>
              <li>• Maximum label length: 12 characters</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Btrfs Filesystems</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>btrfs filesystem label</code> - Set label</li>
              <li>• <code>btrfs filesystem show</code> - Display labels</li>
              <li>• <code>blkid</code> - Display current labels</li>
              <li>• Maximum label length: 256 characters</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">FAT/NTFS Filesystems</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>fatlabel</code> - Set FAT label</li>
              <li>• <code>ntfslabel</code> - Set NTFS label</li>
              <li>• <code>mlabel</code> - Alternative FAT labeler</li>
              <li>• <code>blkid</code> - Display current labels</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-indigo-900">Labeling Best Practices</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Naming Conventions</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use descriptive, meaningful names</li>
              <li>• Avoid spaces and special characters</li>
              <li>• Use uppercase for consistency</li>
              <li>• Include purpose or content type</li>
              <li>• Keep labels reasonably short</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Safety Considerations</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Always unmount before labeling</li>
              <li>• Backup important data first</li>
              <li>• Test labeling on non-critical filesystems</li>
              <li>• Verify labels after setting</li>
              <li>• Update mount configurations accordingly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Use Cases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-yellow-900">Common Use Cases</h3>
        <div className="space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Server Environments</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• <code>ROOT</code> - Root filesystem</li>
              <li>• <code>DATA</code> - User data storage</li>
              <li>• <code>BACKUP</code> - Backup storage</li>
              <li>• <code>LOGS</code> - System logs</li>
              <li>• <code>SWAP</code> - Swap partition</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">Desktop Systems</h4>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• <code>HOME</code> - User home directory</li>
              <li>• <code>MEDIA</code> - Media files</li>
              <li>• <code>GAMES</code> - Game installations</li>
              <li>• <code>DOCUMENTS</code> - Document storage</li>
              <li>• <code>EXTERNAL</code> - External drives</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Troubleshooting Label Issues</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Common Problems</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• "Device busy" - Filesystem is mounted</li>
              <li>• "Permission denied" - Need root access</li>
              <li>• "Invalid label" - Label too long or contains invalid characters</li>
              <li>• "Filesystem not supported" - Unsupported filesystem type</li>
              <li>• "Label not found" - No label set on filesystem</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Debugging Commands</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• <code>blkid</code> - Check all filesystem labels</li>
              <li>• <code>lsblk -f</code> - List block devices with filesystem info</li>
              <li>• <code>mount</code> - Check mounted filesystems</li>
              <li>• <code>fdisk -l</code> - List partition information</li>
              <li>• <code>dmesg</code> - Check kernel messages</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Mount Command Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Generate mount commands with options</p>
          <a href="/tools/mount-command-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Mount Command Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">AutoMount Configuration Tool</h4>
          <p className="text-gray-600 text-sm mb-3">Configure automatic mounting</p>
          <a href="/tools/automount-configuration-tool" className="text-blue-600 hover:text-blue-800 text-sm">
            Try AutoMount Configuration Tool →
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

export const DiskLabelingTool: React.FC = () => {
  const [operations, setOperations] = useState<FilesystemLabel[]>([
    {
      device: '',
      currentLabel: '',
      newLabel: '',
      filesystem: 'ext4',
      mountPoint: '',
      operation: 'read'
    }
  ]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const filesystemTypes = [
    { value: 'ext4', label: 'ext4 (Extended filesystem)', command: 'e2label', maxLength: 16 },
    { value: 'ext3', label: 'ext3 (Extended filesystem)', command: 'e2label', maxLength: 16 },
    { value: 'ext2', label: 'ext2 (Extended filesystem)', command: 'e2label', maxLength: 16 },
    { value: 'xfs', label: 'xfs (High-performance filesystem)', command: 'xfs_admin', maxLength: 12 },
    { value: 'btrfs', label: 'btrfs (Advanced filesystem)', command: 'btrfs', maxLength: 256 },
    { value: 'jfs', label: 'jfs (Journaled filesystem)', command: 'jfs_tune', maxLength: 16 },
    { value: 'reiserfs', label: 'reiserfs (Legacy filesystem)', command: 'reiserfstune', maxLength: 16 },
    { value: 'fat32', label: 'fat32 (FAT filesystem)', command: 'fatlabel', maxLength: 11 },
    { value: 'fat16', label: 'fat16 (FAT filesystem)', command: 'fatlabel', maxLength: 11 },
    { value: 'ntfs', label: 'ntfs (Windows NTFS)', command: 'ntfslabel', maxLength: 32 }
  ];

  const addOperation = () => {
    setOperations([...operations, {
      device: '',
      currentLabel: '',
      newLabel: '',
      filesystem: 'ext4',
      mountPoint: '',
      operation: 'read'
    }]);
  };

  const removeOperation = (index: number) => {
    if (operations.length > 1) {
      setOperations(operations.filter((_, i) => i !== index));
    }
  };

  const updateOperation = (index: number, field: keyof FilesystemLabel, value: any) => {
    const newOperations = [...operations];
    newOperations[index] = { ...newOperations[index], [field]: value };
    setOperations(newOperations);
  };

  const getCurrentFilesystem = (index: number) => {
    return filesystemTypes.find(fs => fs.value === operations[index].filesystem);
  };

  const generateReadCommand = (operation: FilesystemLabel): string => {
    const fs = filesystemTypes.find(fs => fs.value === operation.filesystem);
    if (!fs || !operation.device) return '';

    switch (operation.filesystem) {
      case 'ext2':
      case 'ext3':
      case 'ext4':
        return `e2label ${operation.device}`;
      case 'xfs':
        return `xfs_admin -l ${operation.device}`;
      case 'btrfs':
        return `btrfs filesystem label ${operation.device}`;
      case 'jfs':
        return `jfs_tune -l ${operation.device}`;
      case 'reiserfs':
        return `reiserfstune -l ${operation.device}`;
      case 'fat16':
      case 'fat32':
        return `fatlabel ${operation.device}`;
      case 'ntfs':
        return `ntfslabel ${operation.device}`;
      default:
        return `blkid -o value -s LABEL ${operation.device}`;
    }
  };

  const generateSetCommand = (operation: FilesystemLabel): string => {
    const fs = filesystemTypes.find(fs => fs.value === operation.filesystem);
    if (!fs || !operation.device || !operation.newLabel) return '';

    switch (operation.filesystem) {
      case 'ext2':
      case 'ext3':
      case 'ext4':
        return `e2label ${operation.device} "${operation.newLabel}"`;
      case 'xfs':
        return `xfs_admin -L "${operation.newLabel}" ${operation.device}`;
      case 'btrfs':
        return `btrfs filesystem label ${operation.device} "${operation.newLabel}"`;
      case 'jfs':
        return `jfs_tune -L "${operation.newLabel}" ${operation.device}`;
      case 'reiserfs':
        return `reiserfstune -l "${operation.newLabel}" ${operation.device}`;
      case 'fat16':
      case 'fat32':
        return `fatlabel ${operation.device} "${operation.newLabel}"`;
      case 'ntfs':
        return `ntfslabel ${operation.device} "${operation.newLabel}"`;
      default:
        return `# Use appropriate command for ${operation.filesystem}`;
    }
  };

  const generateRemoveCommand = (operation: FilesystemLabel): string => {
    const fs = filesystemTypes.find(fs => fs.value === operation.filesystem);
    if (!fs || !operation.device) return '';

    switch (operation.filesystem) {
      case 'ext2':
      case 'ext3':
      case 'ext4':
        return `e2label ${operation.device} ""`;
      case 'xfs':
        return `xfs_admin -L "" ${operation.device}`;
      case 'btrfs':
        return `btrfs filesystem label ${operation.device} ""`;
      case 'jfs':
        return `jfs_tune -L "" ${operation.device}`;
      case 'reiserfs':
        return `reiserfstune -l "" ${operation.device}`;
      case 'fat16':
      case 'fat32':
        return `fatlabel ${operation.device} ""`;
      case 'ntfs':
        return `ntfslabel ${operation.device} ""`;
      default:
        return `# Use appropriate command for ${operation.filesystem}`;
    }
  };

  const generateAllCommands = () => {
    return operations.map((operation, index) => {
      let command = '';
      switch (operation.operation) {
        case 'read':
          command = generateReadCommand(operation);
          break;
        case 'set':
          command = generateSetCommand(operation);
          break;
        case 'remove':
          command = generateRemoveCommand(operation);
          break;
      }

      if (!command) return '';

      const fs = getCurrentFilesystem(index);
      const comment = `# ${operation.operation.toUpperCase()} label for ${operation.device} (${operation.filesystem})`;
      
      return `${comment}\n${command}`;
    }).filter(cmd => cmd).join('\n\n');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setOperations([{
      device: '',
      currentLabel: '',
      newLabel: '',
      filesystem: 'ext4',
      mountPoint: '',
      operation: 'read'
    }]);
  };

  const validateOperation = (operation: FilesystemLabel): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const fs = getCurrentFilesystem(operations.indexOf(operation));

    if (!operation.device.trim()) {
      errors.push('Device path is required');
    }

    if (operation.operation === 'set' && !operation.newLabel.trim()) {
      errors.push('New label is required for set operation');
    }

    if (operation.operation === 'set' && fs && operation.newLabel.length > fs.maxLength) {
      errors.push(`Label too long. Maximum length for ${operation.filesystem} is ${fs.maxLength} characters`);
    }

    if (operation.operation === 'set' && operation.newLabel.includes(' ')) {
      errors.push('Label should not contain spaces');
    }

    if (operation.operation === 'set' && /[^a-zA-Z0-9_-]/.test(operation.newLabel)) {
      errors.push('Label should only contain letters, numbers, hyphens, and underscores');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'read': return '👁️';
      case 'set': return '✏️';
      case 'remove': return '🗑️';
      default: return '📋';
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'set': return 'bg-green-100 text-green-800 border-green-300';
      case 'remove': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Tool Description */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">About Disk Labeling</h3>
        <p className="text-blue-800 text-sm mb-3">
          This tool generates commands to read, set, or remove filesystem labels for various filesystem types. 
          Labels provide human-readable names for filesystems, making them easier to identify and manage.
        </p>
        <div className="text-blue-700 text-sm">
          <p><strong>Note:</strong> Always unmount filesystems before labeling operations to avoid data corruption.</p>
        </div>
      </div>

      {/* Operations List */}
      <div className="space-y-6">
        {operations.map((operation, index) => {
          const validation = validateOperation(operation);
          const fs = getCurrentFilesystem(index);
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Label Operation {index + 1}</h3>
                {operations.length > 1 && (
                  <button
                    onClick={() => removeOperation(index)}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Path
                  </label>
                  <input
                    type="text"
                    value={operation.device}
                    onChange={(e) => updateOperation(index, 'device', e.target.value)}
                    placeholder="e.g., /dev/sda1, /dev/sdb2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operation Type
                  </label>
                  <select
                    value={operation.operation}
                    onChange={(e) => updateOperation(index, 'operation', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="read">Read Current Label</option>
                    <option value="set">Set New Label</option>
                    <option value="remove">Remove Label</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filesystem Type
                  </label>
                  <select
                    value={operation.filesystem}
                    onChange={(e) => updateOperation(index, 'filesystem', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filesystemTypes.map(fs => (
                      <option key={fs.value} value={fs.value}>{fs.label}</option>
                    ))}
                  </select>
                </div>

                {showAdvanced && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mount Point (Optional)
                    </label>
                    <input
                      type="text"
                      value={operation.mountPoint}
                      onChange={(e) => updateOperation(index, 'mountPoint', e.target.value)}
                      placeholder="e.g., /mnt/data, /media/usb"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Current Label Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Label
                </label>
                <input
                  type="text"
                  value={operation.currentLabel}
                  onChange={(e) => updateOperation(index, 'currentLabel', e.target.value)}
                  placeholder="Current label (if known)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">
                  This field is for reference only. Use "Read Current Label" operation to get the actual label.
                </p>
              </div>

              {/* New Label Input (for set operation) */}
              {operation.operation === 'set' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Label
                    {fs && <span className="text-xs text-gray-500 ml-2">(Max: {fs.maxLength} chars)</span>}
                  </label>
                  <input
                    type="text"
                    value={operation.newLabel}
                    onChange={(e) => updateOperation(index, 'newLabel', e.target.value)}
                    placeholder="Enter new label"
                    maxLength={fs?.maxLength}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {fs && (
                    <p className="text-xs text-gray-500 mt-1">
                      Using command: <code>{fs.command}</code>
                    </p>
                  )}
                </div>
              )}

              {/* Validation Errors */}
              {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-red-900 mb-2">Validation Errors</h4>
                  <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                    {validation.errors.map((error, errorIndex) => (
                      <li key={errorIndex}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Generated Command Preview */}
              {validation.isValid && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Generated Command</h4>
                  <div className="bg-white p-3 rounded border text-sm font-mono">
                    {operation.operation === 'read' && generateReadCommand(operation)}
                    {operation.operation === 'set' && generateSetCommand(operation)}
                    {operation.operation === 'remove' && generateRemoveCommand(operation)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Operation Button */}
      <div className="text-center">
        <button
          onClick={addOperation}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          + Add Another Operation
        </button>
      </div>

      {/* Advanced Options Toggle */}
      <div className="text-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>
      </div>

      {/* Generated Commands */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generated Commands</h3>
          <button
            onClick={() => copyToClipboard(generateAllCommands())}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Copy All
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-2">
            Copy and run these commands as root (sudo) to perform the labeling operations:
          </p>
          <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
            <code>{generateAllCommands() || 'No valid operations to generate commands for'}</code>
          </pre>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={clearAll}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear All
        </button>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Operations</h4>
            <p className="text-sm">Set device paths, filesystem types, and operation types for each labeling task.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Generate Commands</h4>
            <p className="text-sm">The tool will generate appropriate commands based on your filesystem type and operation.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Execute Commands</h4>
            <p className="text-sm">Run the generated commands as root (sudo) to perform the labeling operations.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Verify Results</h4>
            <p className="text-sm">Use the read operation or <code>blkid</code> command to verify label changes.</p>
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-yellow-900 mb-2">⚠️ Important Safety Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Always unmount filesystems before labeling operations</li>
          <li>• Backup important data before making changes</li>
          <li>• Run commands as root (sudo) for device access</li>
          <li>• Verify device paths carefully to avoid mistakes</li>
          <li>• Test on non-critical filesystems first</li>
          <li>• Some operations may require specific tools to be installed</li>
        </ul>
      </div>

      {/* Quick Reference */}
      <div className="bg-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-indigo-900 mb-3">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-indigo-900 mb-2">Common Commands</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• <code>blkid</code> - Show all filesystem labels</li>
              <li>• <code>lsblk -f</code> - List block devices with filesystem info</li>
              <li>• <code>mount</code> - Check mounted filesystems</li>
              <li>• <code>umount</code> - Unmount filesystem before labeling</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-indigo-900 mb-2">Useful Options</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• <code>blkid -o value -s LABEL</code> - Show only labels</li>
              <li>• <code>lsblk -o NAME,LABEL,FSTYPE</code> - Custom output format</li>
              <li>• <code>findmnt</code> - Show mount tree</li>
              <li>• <code>df -T</code> - Show filesystem types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskLabelingTool;
