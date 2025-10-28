'use client';
import React, { useState } from 'react';

interface AutoMountConfig {
  device: string;
  mountPoint: string;
  filesystem: string;
  options: string[];
  dump: number;
  pass: number;
  enabled: boolean;
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

export const AutoMountConfigurationToolInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is AutoMount Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is AutoMount Configuration?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you configure automatic mounting of filesystems and devices at boot time. 
          Create proper fstab entries, configure udev rules, and set up systemd mount units for 
          seamless filesystem access without manual intervention.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Automatic mounting at system boot</li>
            <li>Persistent filesystem access</li>
            <li>Configure mount options and permissions</li>
            <li>Support for various device types</li>
            <li>Generate multiple configuration formats</li>
          </ul>
        </div>
      </div>

      {/* AutoMount Methods */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">AutoMount Methods</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Traditional Method</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>/etc/fstab</code> - Static mount table</li>
              <li>• <code>mount -a</code> - Mount all at boot</li>
              <li>• <code>auto</code> option - Automatic mounting</li>
              <li>• <code>noauto</code> option - Manual mounting</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Modern Methods</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• <code>systemd.mount</code> - Systemd mount units</li>
              <li>• <code>udev rules</code> - Dynamic device detection</li>
              <li>• <code>autofs</code> - On-demand mounting</li>
              <li>• <code>udisks2</code> - Desktop auto-mounting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Configuration Options</h3>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Mount Options</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>auto</code> - Mount at boot (default)</li>
              <li>• <code>noauto</code> - Don't mount at boot</li>
              <li>• <code>user</code> - Allow non-root users to mount</li>
              <li>• <code>nouser</code> - Only root can mount</li>
              <li>• <code>exec</code> - Allow binary execution</li>
              <li>• <code>noexec</code> - Prevent binary execution</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Dump and Pass</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• <code>dump</code> - Backup flag (0=no backup, 1=backup)</li>
              <li>• <code>pass</code> - Fsck order (0=no check, 1=first, 2=second)</li>
              <li>• Root filesystem should have pass=1</li>
              <li>• Other filesystems should have pass=2</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-indigo-900">Best Practices</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Boot Order</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Mount root filesystem first (pass=1)</li>
              <li>• Mount system directories early</li>
              <li>• Mount user data directories later</li>
              <li>• Use appropriate mount options for security</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Security Considerations</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use <code>noexec</code> for data-only mounts</li>
              <li>• Apply <code>nosuid</code> for untrusted filesystems</li>
              <li>• Consider <code>nodev</code> for security</li>
              <li>• Use <code>ro</code> for read-only data</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Troubleshooting AutoMount Issues</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Common Problems</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Device not available at boot time</li>
              <li>• Network filesystems not accessible</li>
              <li>• Permission denied errors</li>
              <li>• Filesystem corruption during boot</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Debugging Commands</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• <code>systemctl status</code> - Check systemd services</li>
              <li>• <code>journalctl -u systemd-fsck</code> - View fsck logs</li>
              <li>• <code>mount -a</code> - Test mount all</li>
              <li>• <code>blkid</code> - Check device UUIDs</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Mount Option Explainer</h4>
          <p className="text-gray-600 text-sm mb-3">Understand mount options</p>
          <a href="/tools/mount-option-explainer" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Mount Option Explainer →
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

export const AutoMountConfigurationTool: React.FC = () => {
  const [configs, setConfigs] = useState<AutoMountConfig[]>([
    {
      device: '',
      mountPoint: '',
      filesystem: 'auto',
      options: ['defaults'],
      dump: 0,
      pass: 2,
      enabled: true
    }
  ]);

  const [selectedMethod, setSelectedMethod] = useState<'fstab' | 'systemd' | 'udev'>('fstab');
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
    { value: 'tmpfs', label: 'tmpfs (Temporary memory filesystem)' }
  ];

  const mountOptions = [
    { value: 'defaults', label: 'defaults (rw, suid, dev, exec, auto, nouser, async)' },
    { value: 'auto', label: 'auto (mount at boot)' },
    { value: 'noauto', label: 'noauto (don\'t mount at boot)' },
    { value: 'user', label: 'user (allow non-root users to mount)' },
    { value: 'nouser', label: 'nouser (only root can mount)' },
    { value: 'exec', label: 'exec (allow execution of binaries)' },
    { value: 'noexec', label: 'noexec (prevent execution of binaries)' },
    { value: 'ro', label: 'ro (read-only)' },
    { value: 'rw', label: 'rw (read-write)' },
    { value: 'sync', label: 'sync (synchronous writes)' },
    { value: 'async', label: 'async (asynchronous writes)' }
  ];

  const addConfig = () => {
    setConfigs([...configs, {
      device: '',
      mountPoint: '',
      filesystem: 'auto',
      options: ['defaults'],
      dump: 0,
      pass: 2,
      enabled: true
    }]);
  };

  const removeConfig = (index: number) => {
    if (configs.length > 1) {
      setConfigs(configs.filter((_, i) => i !== index));
    }
  };

  const updateConfig = (index: number, field: keyof AutoMountConfig, value: any) => {
    const newConfigs = [...configs];
    newConfigs[index] = { ...newConfigs[index], [field]: value };
    setConfigs(newConfigs);
  };

  const toggleOption = (configIndex: number, option: string) => {
    const config = configs[configIndex];
    const newOptions = config.options.includes(option)
      ? config.options.filter(opt => opt !== option)
      : [...config.options, option];
    
    // Handle mutually exclusive options
    if (option === 'auto' && newOptions.includes('noauto')) {
      newOptions.splice(newOptions.indexOf('noauto'), 1);
    } else if (option === 'noauto' && newOptions.includes('auto')) {
      newOptions.splice(newOptions.indexOf('auto'), 1);
    }
    
    updateConfig(configIndex, 'options', newOptions);
  };

  const generateFstabEntry = (config: AutoMountConfig): string => {
    if (!config.device || !config.mountPoint) return '';
    
    const options = config.options.join(',');
    return `${config.device}\t${config.mountPoint}\t${config.filesystem}\t${options}\t${config.dump}\t${config.pass}`;
  };

  const generateSystemdMount = (config: AutoMountConfig): string => {
    if (!config.device || !config.mountPoint) return '';
    
    const mountName = config.mountPoint.replace(/\//g, '-').replace(/^-/, '');
    const options = config.options.join(',');
    
    return `[Unit]
Description=Mount ${config.mountPoint}
After=local-fs.target

[Mount]
What=${config.device}
Where=${config.mountPoint}
Type=${config.filesystem}
Options=${options}

[Install]
WantedBy=local-fs.target`;
  };

  const generateUdevRule = (config: AutoMountConfig): string => {
    if (!config.device || !config.mountPoint) return '';
    
    const devicePath = config.device.startsWith('/dev/') ? config.device : `/dev/${config.device}`;
    const options = config.options.join(',');
    
    return `# Auto-mount rule for ${config.mountPoint}
ACTION=="add", KERNEL=="${devicePath.replace('/dev/', '')}", RUN+="/usr/bin/mkdir -p ${config.mountPoint}"
ACTION=="add", KERNEL=="${devicePath.replace('/dev/', '')}", RUN+="/usr/bin/mount -t ${config.filesystem} -o ${options} ${devicePath} ${config.mountPoint}"
ACTION=="remove", KERNEL=="${devicePath.replace('/dev/', '')}", RUN+="/usr/bin/umount ${config.mountPoint}"`;
  };

  const generateAllConfigurations = () => {
    const enabledConfigs = configs.filter(config => config.enabled);
    
    switch (selectedMethod) {
      case 'fstab':
        return enabledConfigs.map(config => generateFstabEntry(config)).filter(entry => entry).join('\n');
      case 'systemd':
        return enabledConfigs.map(config => generateSystemdMount(config)).filter(entry => entry).join('\n\n');
      case 'udev':
        return enabledConfigs.map(config => generateUdevRule(config)).filter(entry => entry).join('\n\n');
      default:
        return '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearAll = () => {
    setConfigs([{
      device: '',
      mountPoint: '',
      filesystem: 'auto',
      options: ['defaults'],
      dump: 0,
      pass: 2,
      enabled: true
    }]);
  };

  const validateConfig = (config: AutoMountConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.device.trim()) {
      errors.push('Device path is required');
    }

    if (!config.mountPoint.trim()) {
      errors.push('Mount point is required');
    } else if (!config.mountPoint.startsWith('/')) {
      errors.push('Mount point must be an absolute path');
    }

    if (config.options.length === 0) {
      errors.push('At least one mount option is required');
    }

    if (config.pass < 0 || config.pass > 2) {
      errors.push('Pass number must be 0, 1, or 2');
    }

    if (config.dump < 0 || config.dump > 1) {
      errors.push('Dump flag must be 0 or 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">AutoMount Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedMethod('fstab')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedMethod === 'fstab'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-medium">Traditional Fstab</h4>
            <p className="text-sm">Use /etc/fstab for static mounting</p>
          </button>
          
          <button
            onClick={() => setSelectedMethod('systemd')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedMethod === 'systemd'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-medium">Systemd Mount</h4>
            <p className="text-sm">Modern systemd mount units</p>
          </button>
          
          <button
            onClick={() => setSelectedMethod('udev')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedMethod === 'udev'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-2">🔌</div>
            <h4 className="font-medium">Udev Rules</h4>
            <p className="text-sm">Dynamic device detection</p>
          </button>
        </div>
      </div>

      {/* Configuration List */}
      <div className="space-y-6">
        {configs.map((config, index) => {
          const validation = validateConfig(config);
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">AutoMount Configuration {index + 1}</h3>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => updateConfig(index, 'enabled', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                  {configs.length > 1 && (
                    <button
                      onClick={() => removeConfig(index)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Path
                  </label>
                  <input
                    type="text"
                    value={config.device}
                    onChange={(e) => updateConfig(index, 'device', e.target.value)}
                    placeholder="e.g., /dev/sda1, UUID=..., LABEL=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mount Point
                  </label>
                  <input
                    type="text"
                    value={config.mountPoint}
                    onChange={(e) => updateConfig(index, 'mountPoint', e.target.value)}
                    placeholder="e.g., /mnt/data, /media/usb"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filesystem Type
                  </label>
                  <select
                    value={config.filesystem}
                    onChange={(e) => updateConfig(index, 'filesystem', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filesystemTypes.map(fs => (
                      <option key={fs.value} value={fs.value}>{fs.label}</option>
                    ))}
                  </select>
                </div>

                {showAdvanced && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dump Flag
                      </label>
                      <select
                        value={config.dump}
                        onChange={(e) => updateConfig(index, 'dump', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>0 (no backup)</option>
                        <option value={1}>1 (backup)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pass Number
                      </label>
                      <select
                        value={config.pass}
                        onChange={(e) => updateConfig(index, 'pass', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>0 (no check)</option>
                        <option value={1}>1 (first check)</option>
                        <option value={2}>2 (second check)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Mount Options */}
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">Mount Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {mountOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleOption(index, option.value)}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                        config.options.includes(option.value)
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

              {/* Validation Errors */}
              {!validation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-red-900 mb-2">Configuration Errors</h4>
                  <ul className="list-disc list-inside text-red-800 text-sm space-y-1">
                    {validation.errors.map((error, errorIndex) => (
                      <li key={errorIndex}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {validation.isValid && config.enabled && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                  <div className="bg-white p-3 rounded border text-sm font-mono">
                    {selectedMethod === 'fstab' && generateFstabEntry(config)}
                    {selectedMethod === 'systemd' && generateSystemdMount(config)}
                    {selectedMethod === 'udev' && generateUdevRule(config)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Configuration Button */}
      <div className="text-center">
        <button
          onClick={addConfig}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          + Add Another Configuration
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

      {/* Generated Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Generated {selectedMethod.toUpperCase()} Configuration</h3>
          <button
            onClick={() => copyToClipboard(generateAllConfigurations())}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Copy All
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm text-gray-600 mb-2">
            {selectedMethod === 'fstab' && 'Add these lines to /etc/fstab:'}
            {selectedMethod === 'systemd' && 'Save these files to /etc/systemd/system/ with .mount extension:'}
            {selectedMethod === 'udev' && 'Add these rules to /etc/udev/rules.d/ with .rules extension:'}
          </p>
          <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
            <code>{generateAllConfigurations() || 'No valid configurations to generate'}</code>
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
            <h4 className="font-medium">1. Choose AutoMount Method</h4>
            <p className="text-sm">Select between traditional fstab, modern systemd, or dynamic udev rules.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Configure Mount Points</h4>
            <p className="text-sm">Set device paths, mount points, filesystem types, and options.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Copy Configuration</h4>
            <p className="text-sm">Copy the generated configuration to the appropriate system file.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Apply Changes</h4>
            <p className="text-sm">
              {selectedMethod === 'fstab' && 'Run "mount -a" to test, then reboot to verify.'}
              {selectedMethod === 'systemd' && 'Run "systemctl daemon-reload" and "systemctl enable mount-name.mount".'}
              {selectedMethod === 'udev' && 'Reload udev rules with "udevadm control --reload-rules".'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-yellow-900 mb-2">⚠️ Important Safety Notes</h4>
        <ul className="text-yellow-800 text-sm space-y-1">
          <li>• Always backup your current configuration before making changes</li>
          <li>• Test mount commands manually before adding to auto-mount configuration</li>
          <li>• Ensure mount points exist and have proper permissions</li>
          <li>• Be careful with network mounts - ensure network is available at boot</li>
          <li>• Use appropriate pass numbers (1 for root, 2 for others)</li>
        </ul>
      </div>
    </div>
  );
};

export default AutoMountConfigurationTool;
