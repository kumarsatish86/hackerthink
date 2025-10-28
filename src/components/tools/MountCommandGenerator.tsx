'use client';
import React, { useState } from 'react';

interface MountCommand {
  device: string;
  mountPoint: string;
  filesystem: string;
  options: string[];
  command: string;
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

export const MountCommandGeneratorInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Mount Command Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Mount Command Generation?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you generate proper mount commands for various filesystem types and scenarios. 
          Create mount commands with appropriate options, validate syntax, and get ready-to-use commands 
          for mounting filesystems, network shares, and special devices.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Generate mount commands for any filesystem type</li>
            <li>Configure appropriate mount options for performance and security</li>
            <li>Support for network filesystems (NFS, CIFS, SSHFS)</li>
            <li>Generate unmount and remount commands</li>
            <li>Validate mount command syntax before execution</li>
          </ul>
        </div>
      </div>

      {/* Mount Command Syntax */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Mount Command Syntax</h3>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Basic Syntax</h4>
            <code className="text-green-800 text-sm">
              mount [-t filesystem_type] [-o options] device mount_point
            </code>
            <p className="text-green-700 text-sm mt-2">
              The mount command requires at minimum a device and mount point. Filesystem type and options are optional but recommended.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Common Parameters</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>-t</code> - Specify filesystem type</li>
              <li>• <code>-o</code> - Specify mount options</li>
              <li>• <code>-r</code> - Mount read-only (equivalent to -o ro)</li>
              <li>• <code>-w</code> - Mount read-write (default)</li>
              <li>• <code>-v</code> - Verbose output</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filesystem Types */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Filesystem Types & Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Local Filesystems</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>ext4</code> - Modern Linux journaling filesystem</li>
              <li>• <code>xfs</code> - High-performance filesystem for large volumes</li>
              <li>• <code>btrfs</code> - Advanced filesystem with snapshots</li>
              <li>• <code>ntfs</code> - Windows NTFS filesystem</li>
              <li>• <code>fat32</code> - Legacy FAT filesystem</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Network & Special</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>nfs</code> - Network File System</li>
              <li>• <code>cifs</code> - Common Internet File System (SMB)</li>
              <li>• <code>sshfs</code> - SSH File System</li>
              <li>• <code>tmpfs</code> - Temporary memory-based filesystem</li>
              <li>• <code>iso9660</code> - CD/DVD filesystem</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mount Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-orange-900">Common Mount Options</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">Performance Options</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• <code>noatime</code> - Don't update access times (improves performance)</li>
              <li>• <code>nodiratime</code> - Don't update directory access times</li>
              <li>• <code>async</code> - Asynchronous writes (default, improves performance)</li>
              <li>• <code>sync</code> - Synchronous writes (safer, slower)</li>
              <li>• <code>defaults</code> - Use default options (rw, suid, dev, exec, auto, nouser, async)</li>
            </ul>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">Security Options</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• <code>ro</code> - Read-only mount</li>
              <li>• <code>rw</code> - Read-write mount</li>
              <li>• <code>noexec</code> - Prevent execution of binaries</li>
              <li>• <code>nosuid</code> - Ignore set-user-ID and set-group-ID bits</li>
              <li>• <code>nodev</code> - Don't interpret device files</li>
            </ul>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">Network Options</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• <code>username=user</code> - Username for authentication</li>
              <li>• <code>password=pass</code> - Password for authentication</li>
              <li>• <code>uid=1000</code> - Set owner user ID</li>
              <li>• <code>gid=1000</code> - Set owner group ID</li>
              <li>• <code>umask=022</code> - Set file permission mask</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-indigo-900">Best Practices</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Before Mounting</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Ensure mount point directory exists</li>
              <li>• Check device availability and permissions</li>
              <li>• Verify filesystem type compatibility</li>
              <li>• Test mount command with dry-run if possible</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Security Considerations</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use <code>noexec</code> for data-only mounts</li>
              <li>• Consider <code>nosuid</code> for untrusted filesystems</li>
              <li>• Use <code>ro</code> for read-only data</li>
              <li>• Set appropriate <code>uid</code> and <code>gid</code> for network mounts</li>
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
              <li>• Check if device exists: <code>ls -la /dev/</code></li>
              <li>• Verify filesystem type: <code>blkid</code></li>
              <li>• Check mount point permissions: <code>ls -ld /mount/point</code></li>
              <li>• Review system logs: <code>dmesg | tail</code></li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Network Mount Issues</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Test network connectivity: <code>ping server</code></li>
              <li>• Check service availability: <code>telnet server port</code></li>
              <li>• Verify credentials and permissions</li>
              <li>• Check firewall and SELinux settings</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Fstab Entry Validator</h4>
          <p className="text-gray-600 text-sm mb-3">Validate fstab configurations</p>
          <a href="/tools/fstab-entry-validator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Fstab Entry Validator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Filesystem Checker</h4>
          <p className="text-gray-600 text-sm mb-3">Check and repair filesystem issues</p>
          <a href="/tools/filesystem-checker" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Filesystem Checker →
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

export const MountCommandGenerator: React.FC = () => {
  const [mountCommand, setMountCommand] = useState<MountCommand>({
    device: '',
    mountPoint: '',
    filesystem: 'auto',
    options: ['defaults'],
    command: ''
  });

  const [customOption, setCustomOption] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filesystemTypes = [
    { value: 'auto', label: 'auto (detect automatically)' },
    { value: 'ext4', label: 'ext4 (Linux journaling filesystem)' },
    { value: 'xfs', label: 'xfs (High-performance filesystem)' },
    { value: 'btrfs', label: 'btrfs (Advanced filesystem)' },
    { value: 'ntfs', label: 'ntfs (Windows NTFS)' },
    { value: 'fat32', label: 'fat32 (Legacy FAT filesystem)' },
    { value: 'nfs', label: 'nfs (Network File System)' },
    { value: 'cifs', label: 'cifs (Common Internet File System)' },
    { value: 'sshfs', label: 'sshfs (SSH File System)' },
    { value: 'tmpfs', label: 'tmpfs (Temporary memory filesystem)' },
    { value: 'iso9660', label: 'iso9660 (CD/DVD filesystem)' }
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
    { value: 'user', label: 'user (allow non-root users to mount)' },
    { value: 'nouser', label: 'nouser (only root can mount)' },
    { value: 'auto', label: 'auto (mount at boot)' },
    { value: 'noauto', label: 'noauto (don\'t mount at boot)' }
  ];

  const networkOptions = [
    { value: 'username=user', label: 'username=user (set username)' },
    { value: 'password=pass', label: 'password=pass (set password)' },
    { value: 'uid=1000', label: 'uid=1000 (set owner user ID)' },
    { value: 'gid=1000', label: 'gid=1000 (set owner group ID)' },
    { value: 'umask=022', label: 'umask=022 (set permission mask)' },
    { value: 'vers=3.0', label: 'vers=3.0 (SMB protocol version)' },
    { value: 'sec=ntlmssp', label: 'sec=ntlmssp (security mode)' }
  ];

  const addOption = (option: string) => {
    if (!mountCommand.options.includes(option)) {
      setMountCommand({
        ...mountCommand,
        options: [...mountCommand.options, option]
      });
    }
  };

  const removeOption = (option: string) => {
    setMountCommand({
      ...mountCommand,
      options: mountCommand.options.filter(opt => opt !== option)
    });
  };

  const addCustomOption = () => {
    if (customOption.trim() && !mountCommand.options.includes(customOption.trim())) {
      setMountCommand({
        ...mountCommand,
        options: [...mountCommand.options, customOption.trim()]
      });
      setCustomOption('');
    }
  };

  const generateMountCommand = (): string => {
    let command = 'mount';
    
    if (mountCommand.filesystem !== 'auto') {
      command += ` -t ${mountCommand.filesystem}`;
    }
    
    if (mountCommand.options.length > 0) {
      const optionsString = mountCommand.options.join(',');
      command += ` -o ${optionsString}`;
    }
    
    command += ` ${mountCommand.device} ${mountCommand.mountPoint}`;
    
    return command;
  };

  const generateUmountCommand = (): string => {
    return `umount ${mountCommand.mountPoint}`;
  };

  const generateRemountCommand = (): string => {
    let command = 'mount -o remount';
    
    if (mountCommand.filesystem !== 'auto') {
      command += ` -t ${mountCommand.filesystem}`;
    }
    
    if (mountCommand.options.length > 0) {
      const optionsString = mountCommand.options.join(',');
      command += ` -o ${optionsString}`;
    }
    
    command += ` ${mountCommand.mountPoint}`;
    
    return command;
  };

  const validateCommand = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!mountCommand.device.trim()) {
      errors.push('Device path is required');
    }

    if (!mountCommand.mountPoint.trim()) {
      errors.push('Mount point is required');
    } else if (!mountCommand.mountPoint.startsWith('/')) {
      errors.push('Mount point must be an absolute path');
    }

    if (mountCommand.options.length === 0) {
      errors.push('At least one mount option is required');
    }

    // Check for conflicting options
    if (mountCommand.options.includes('ro') && mountCommand.options.includes('rw')) {
      errors.push('Conflicting options: ro and rw cannot be used together');
    }
    if (mountCommand.options.includes('sync') && mountCommand.options.includes('async')) {
      errors.push('Conflicting options: sync and async cannot be used together');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearForm = () => {
    setMountCommand({
      device: '',
      mountPoint: '',
      filesystem: 'auto',
      options: ['defaults'],
      command: ''
    });
    setCustomOption('');
  };

  const validation = validateCommand();

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
              value={mountCommand.device}
              onChange={(e) => setMountCommand({...mountCommand, device: e.target.value})}
              placeholder="e.g., /dev/sda1, UUID=..., //server/share"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Device path, UUID, LABEL, or network path
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mount Point
            </label>
            <input
              type="text"
              value={mountCommand.mountPoint}
              onChange={(e) => setMountCommand({...mountCommand, mountPoint: e.target.value})}
              placeholder="e.g., /mnt/data, /media/cdrom"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Directory where filesystem will be mounted
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filesystem Type
            </label>
            <select
              value={mountCommand.filesystem}
              onChange={(e) => setMountCommand({...mountCommand, filesystem: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filesystemTypes.map(fs => (
                <option key={fs.value} value={fs.value}>{fs.label}</option>
              ))}
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
                  mountCommand.options.includes(option.value)
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

        {/* Network Options */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Network Options</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {networkOptions.map(option => (
              <button
                key={option.value}
                onClick={() => addOption(option.value)}
                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                  mountCommand.options.includes(option.value)
                    ? 'bg-green-100 border-green-300 text-green-800'
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
              placeholder="e.g., uid=1000, gid=1000, umask=022"
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
            {mountCommand.options.map(option => (
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

      {/* Generated Commands */}
      <div className="space-y-6">
        {/* Mount Command */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Mount Command</h3>
            <button
              onClick={() => copyToClipboard(generateMountCommand())}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Copy
            </button>
          </div>
          <div className="bg-gray-100 p-4 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Use this command to mount the filesystem:</p>
            <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
              <code>{generateMountCommand()}</code>
            </pre>
          </div>
        </div>

        {/* Additional Commands */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Remount Command</h3>
              <button
                onClick={() => copyToClipboard(generateRemountCommand())}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-sm text-gray-600 mb-2">To remount with new options:</p>
              <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
                <code>{generateRemountCommand()}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={clearForm}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Form
        </button>
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
            <p className="text-sm">Choose appropriate options for performance, security, and functionality.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Copy and Execute</h4>
            <p className="text-sm">Copy the generated command and run it with appropriate privileges.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Verify Mount</h4>
            <p className="text-sm">Use <code>mount</code> or <code>df -h</code> to verify the mount was successful.</p>
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-yellow-900 mb-2">⚠️ Important Safety Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Always ensure the mount point directory exists before mounting</li>
          <li>• Be careful with network mounts - verify credentials and permissions</li>
          <li>• Test mount commands in a safe environment first</li>
          <li>• Use appropriate mount options for security (noexec, nosuid when appropriate)</li>
          <li>• Check system logs if mount operations fail</li>
        </ul>
      </div>
    </div>
  );
};

export default MountCommandGenerator;
