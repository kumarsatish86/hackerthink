'use client';
import React, { useState } from 'react';

interface FstabEntry {
  device: string;
  mountPoint: string;
  filesystem: string;
  options: string[];
  dump: number;
  pass: number;
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

export const FstabEntryGeneratorInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Fstab Entry Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Fstab Entry Generation?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you create proper `/etc/fstab` entries for various filesystem types. Generate mount configurations with appropriate options, 
          dump settings, and pass numbers for automatic mounting at boot time.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Generate proper fstab entries for any filesystem</li>
            <li>Configure appropriate mount options for performance and security</li>
            <li>Set correct dump and pass values for boot mounting</li>
            <li>Support for various filesystem types (ext4, xfs, ntfs, etc.)</li>
            <li>Validate mount point and device specifications</li>
          </ul>
        </div>
      </div>

      {/* Filesystem Types */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Filesystem Types & Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Linux Native Filesystems</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• ext4 - Modern Linux filesystem with journaling</li>
              <li>• xfs - High-performance filesystem for large volumes</li>
              <li>• btrfs - Advanced filesystem with snapshots</li>
              <li>• ext3 - Legacy journaling filesystem</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Cross-Platform & Special</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• ntfs - Windows NTFS filesystem</li>
              <li>• fat32 - Legacy FAT filesystem</li>
              <li>• iso9660 - CD/DVD filesystem</li>
              <li>• tmpfs - Temporary memory-based filesystem</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Mount Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Common Mount Options</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">Performance Options</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>noatime</code> - Don't update access times (improves performance)</li>
              <li>• <code>nodiratime</code> - Don't update directory access times</li>
              <li>• <code>async</code> - Asynchronous writes (default, improves performance)</li>
              <li>• <code>sync</code> - Synchronous writes (safer, slower)</li>
            </ul>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">Security Options</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>ro</code> - Read-only mount</li>
              <li>• <code>noexec</code> - Prevent execution of binaries</li>
              <li>• <code>nosuid</code> - Ignore set-user-ID and set-group-ID bits</li>
              <li>• <code>nodev</code> - Don't interpret device files</li>
            </ul>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">Error Handling</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>errors=remount-ro</code> - Remount read-only on errors</li>
              <li>• <code>errors=continue</code> - Continue on errors</li>
              <li>• <code>errors=panic</code> - Panic on errors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dump and Pass Values */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-orange-900">Dump and Pass Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Dump Field (5th column)</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• <code>0</code> - Don't backup with dump utility</li>
              <li>• <code>1</code> - Backup with dump utility</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Pass Field (6th column)</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• <code>0</code> - Don't check with fsck</li>
              <li>• <code>1</code> - Check first (root filesystem)</li>
              <li>• <code>2</code> - Check after root (other filesystems)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-indigo-900">Best Practices</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Mount Point Safety</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Always use absolute paths for mount points</li>
              <li>• Ensure mount point directory exists before mounting</li>
              <li>• Use descriptive mount point names</li>
              <li>• Avoid mounting over system directories</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Performance Optimization</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use <code>noatime</code> for data volumes</li>
              <li>• Consider <code>async</code> for better performance</li>
              <li>• Use appropriate block size for your workload</li>
              <li>• Monitor I/O performance after mounting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Troubleshooting Common Issues</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Mount Failures</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Check device path exists and is accessible</li>
              <li>• Verify filesystem type is correct</li>
              <li>• Ensure mount point directory exists</li>
              <li>• Check for conflicting mount options</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Performance Issues</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Monitor I/O wait times</li>
              <li>• Check for appropriate mount options</li>
              <li>• Verify filesystem is not fragmented</li>
              <li>• Consider using SSD-optimized options</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Disk Partition Manager</h4>
          <p className="text-gray-600 text-sm mb-3">Create and manage disk partitions</p>
          <a href="/tools/disk-partition-manager" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Disk Partition Manager →
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

export const FstabEntryGenerator: React.FC = () => {
  const [fstabEntry, setFstabEntry] = useState<FstabEntry>({
    device: '',
    mountPoint: '',
    filesystem: 'auto',
    options: ['defaults'],
    dump: 0,
    pass: 0
  });

  const [presetOptions, setPresetOptions] = useState<string[]>([]);
  const [customOption, setCustomOption] = useState('');

  const filesystemTypes = [
    { value: 'auto', label: 'auto (detect automatically)' },
    { value: 'ext4', label: 'ext4 (Linux journaling filesystem)' },
    { value: 'xfs', label: 'xfs (High-performance filesystem)' },
    { value: 'btrfs', label: 'btrfs (Advanced filesystem)' },
    { value: 'ext3', label: 'ext3 (Legacy journaling filesystem)' },
    { value: 'ext2', label: 'ext2 (Legacy filesystem)' },
    { value: 'ntfs', label: 'ntfs (Windows NTFS)' },
    { value: 'fat32', label: 'fat32 (Legacy FAT filesystem)' },
    { value: 'iso9660', label: 'iso9660 (CD/DVD filesystem)' },
    { value: 'tmpfs', label: 'tmpfs (Temporary memory filesystem)' },
    { value: 'swap', label: 'swap (Swap partition)' }
  ];

  const commonOptions = [
    { value: 'defaults', label: 'defaults (rw, suid, dev, exec, auto, nouser, async)' },
    { value: 'ro', label: 'ro (read-only)' },
    { value: 'rw', label: 'rw (read-write)' },
    { value: 'noatime', label: 'noatime (don\'t update access times)' },
    { value: 'nodiratime', label: 'nodiratime (don\'t update directory access times)' },
    { value: 'noexec', label: 'noexec (prevent execution of binaries)' },
    { value: 'nosuid', label: 'nosuid (ignore set-user-ID bits)' },
    { value: 'nodev', label: 'nodev (don\'t interpret device files)' },
    { value: 'sync', label: 'sync (synchronous writes)' },
    { value: 'async', label: 'async (asynchronous writes)' },
    { value: 'errors=remount-ro', label: 'errors=remount-ro (remount read-only on errors)' },
    { value: 'errors=continue', label: 'errors=continue (continue on errors)' },
    { value: 'errors=panic', label: 'errors=panic (panic on errors)' }
  ];

  const addOption = (option: string) => {
    if (!fstabEntry.options.includes(option)) {
      setFstabEntry({
        ...fstabEntry,
        options: [...fstabEntry.options, option]
      });
    }
  };

  const removeOption = (option: string) => {
    setFstabEntry({
      ...fstabEntry,
      options: fstabEntry.options.filter(opt => opt !== option)
    });
  };

  const addCustomOption = () => {
    if (customOption.trim() && !fstabEntry.options.includes(customOption.trim())) {
      setFstabEntry({
        ...fstabEntry,
        options: [...fstabEntry.options, customOption.trim()]
      });
      setCustomOption('');
    }
  };

  const generateFstabEntry = (): string => {
    const optionsString = fstabEntry.options.join(',');
    return `${fstabEntry.device}\t${fstabEntry.mountPoint}\t${fstabEntry.filesystem}\t${optionsString}\t${fstabEntry.dump}\t${fstabEntry.pass}`;
  };

  const generateMountCommand = (): string => {
    const optionsString = fstabEntry.options.join(',');
    return `mount -t ${fstabEntry.filesystem} -o ${optionsString} ${fstabEntry.device} ${fstabEntry.mountPoint}`;
  };

  const generateUmountCommand = (): string => {
    return `umount ${fstabEntry.mountPoint}`;
  };

  const validateEntry = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!fstabEntry.device.trim()) {
      errors.push('Device path is required');
    }

    if (!fstabEntry.mountPoint.trim()) {
      errors.push('Mount point is required');
    } else if (!fstabEntry.mountPoint.startsWith('/')) {
      errors.push('Mount point must be an absolute path');
    }

    if (fstabEntry.filesystem === 'swap' && fstabEntry.mountPoint !== 'swap') {
      errors.push('Swap filesystems should use mount point "swap"');
    }

    if (fstabEntry.options.length === 0) {
      errors.push('At least one mount option is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const validation = validateEntry();

  return (
    <div className="space-y-6">
      {/* Basic Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Path
            </label>
            <input
              type="text"
              value={fstabEntry.device}
              onChange={(e) => setFstabEntry({...fstabEntry, device: e.target.value})}
              placeholder="e.g., /dev/sda1, UUID=..., LABEL=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use device path, UUID, or LABEL identifier
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mount Point
            </label>
            <input
              type="text"
              value={fstabEntry.mountPoint}
              onChange={(e) => setFstabEntry({...fstabEntry, mountPoint: e.target.value})}
              placeholder="e.g., /mnt/data, /home, swap"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Absolute path where filesystem will be mounted
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filesystem Type
            </label>
            <select
              value={fstabEntry.filesystem}
              onChange={(e) => setFstabEntry({...fstabEntry, filesystem: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filesystemTypes.map(fs => (
                <option key={fs.value} value={fs.value}>{fs.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dump Field
            </label>
            <select
              value={fstabEntry.dump}
              onChange={(e) => setFstabEntry({...fstabEntry, dump: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0 - Don't backup with dump</option>
              <option value={1}>1 - Backup with dump utility</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pass Field
            </label>
            <select
              value={fstabEntry.pass}
              onChange={(e) => setFstabEntry({...fstabEntry, pass: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0 - Don't check with fsck</option>
              <option value={1}>1 - Check first (root filesystem)</option>
              <option value={2}>2 - Check after root (other filesystems)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mount Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Mount Options</h3>
        
        {/* Common Options */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Common Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonOptions.map(option => (
              <button
                key={option.value}
                onClick={() => addOption(option.value)}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  fstabEntry.options.includes(option.value)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
                title={option.label}
              >
                {option.value}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Option */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Custom Option</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={customOption}
              onChange={(e) => setCustomOption(e.target.value)}
              placeholder="e.g., uid=1000, gid=1000"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCustomOption}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Options */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">Selected Options</h4>
          <div className="flex flex-wrap gap-2">
            {fstabEntry.options.map(option => (
              <div
                key={option}
                className="flex items-center gap-2 px-3 py-2 bg-blue-100 border border-blue-300 rounded-md"
              >
                <span className="text-sm text-blue-800">{option}</span>
                <button
                  onClick={() => removeOption(option)}
                  className="text-blue-600 hover:text-blue-800 text-lg font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Validation */}
      {!validation.isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-red-900 mb-2">Validation Errors</h4>
          <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Generated Output */}
      <div className="space-y-6">
        {/* Fstab Entry */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Fstab Entry</h3>
            <button
              onClick={() => copyToClipboard(generateFstabEntry())}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Add this line to your /etc/fstab file:</p>
            <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
              <code>{generateFstabEntry()}</code>
            </pre>
          </div>
        </div>

        {/* Mount Commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Mount Command</h3>
              <button
                onClick={() => copyToClipboard(generateMountCommand())}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">Test mount before adding to fstab:</p>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                <code>{generateMountCommand()}</code>
              </pre>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Unmount Command</h3>
              <button
                onClick={() => copyToClipboard(generateUmountCommand())}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">To unmount the filesystem:</p>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                <code>{generateUmountCommand()}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Your Mount</h4>
            <p className="text-sm">Set the device path, mount point, and filesystem type.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Select Mount Options</h4>
            <p className="text-sm">Choose appropriate options for performance and security.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Set Dump and Pass Values</h4>
            <p className="text-sm">Configure backup and filesystem check settings.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Test and Apply</h4>
            <p className="text-sm">Test the mount command first, then add to /etc/fstab.</p>
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-yellow-900 mb-2">⚠️ Important Safety Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Always test mount commands before adding to /etc/fstab</li>
          <li>• Ensure the mount point directory exists before mounting</li>
          <li>• Be careful with root filesystem mount options</li>
          <li>• Keep a backup of your original /etc/fstab file</li>
          <li>• Use UUID or LABEL instead of device names when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default FstabEntryGenerator;
