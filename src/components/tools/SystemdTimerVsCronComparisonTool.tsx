'use client';

import React, { useState } from 'react';

interface ComparisonExample {
  id: string;
  schedule: string;
  cronExpression: string;
  systemdOnCalendar: string;
  systemdTimerFile: string;
  systemdServiceFile: string;
  cronTabEntry: string;
  explanation: string;
  createdAt: Date;
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

export const SystemdTimerVsCronComparisonTool: React.FC = () => {
  const [selectedSchedule, setSelectedSchedule] = useState('daily');
  const [command, setCommand] = useState('/usr/local/bin/backup.sh');
  const [user, setUser] = useState('root');
  const [generatedComparison, setGeneratedComparison] = useState<ComparisonExample | null>(null);
  const [comparisonHistory, setComparisonHistory] = useState<ComparisonExample[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const schedulePresets = [
    { value: 'daily', label: 'Daily at midnight', cron: '0 0 * * *', systemd: 'daily' },
    { value: 'daily-9am', label: 'Daily at 9 AM', cron: '0 9 * * *', systemd: 'daily 09:00:00' },
    { value: 'weekly', label: 'Weekly on Sunday', cron: '0 0 * * 0', systemd: 'weekly' },
    { value: 'weekly-monday', label: 'Weekly on Monday at 9 AM', cron: '0 9 * * 1', systemd: 'weekly: monday 09:00:00' },
    { value: 'monthly', label: 'Monthly on 1st', cron: '0 0 1 * *', systemd: 'monthly' },
    { value: 'monthly-15th', label: 'Monthly on 15th at 2 PM', cron: '0 14 15 * *', systemd: 'monthly: 15 14:00:00' },
    { value: 'yearly', label: 'Yearly on January 1st', cron: '0 0 1 1 *', systemd: 'yearly' },
    { value: 'yearly-july4', label: 'Yearly on July 4th at 2 PM', cron: '0 14 4 7 *', systemd: 'yearly: 7-4 14:00:00' },
    { value: 'hourly', label: 'Every hour', cron: '0 * * * *', systemd: 'hourly' },
    { value: 'hourly-30min', label: 'Every hour at minute 30', cron: '30 * * * *', systemd: 'hourly: 30' },
    { value: 'every-5min', label: 'Every 5 minutes', cron: '*/5 * * * *', systemd: 'minutely: 0/5' },
    { value: 'business-days', label: 'Business days at 9 AM', cron: '0 9 * * 1-5', systemd: 'weekly: monday 09:00:00' }
  ];

  const generateComparison = (): ComparisonExample => {
    const selectedPreset = schedulePresets.find(p => p.value === selectedSchedule);
    if (!selectedPreset) throw new Error('Invalid schedule selected');

    const cronExpression = selectedPreset.cron;
    const systemdOnCalendar = selectedPreset.systemd;
    const schedule = selectedPreset.label;

    const systemdTimerFile = `[Unit]
Description=Timer for ${command}
Requires=${command.split('/').pop()?.replace('.sh', '')}.service

[Timer]
OnCalendar=${systemdOnCalendar}
AccuracySec=1m
RandomizedDelaySec=30s
Persistent=true

[Install]
WantedBy=timers.target`;

    const systemdServiceFile = `[Unit]
Description=Service for ${command}
Type=oneshot

[Service]
ExecStart=${command}
User=${user}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`;

    const cronTabEntry = `${cronExpression} ${user} ${command}`;

    let explanation = `This comparison shows how to schedule "${command}" to run ${schedule.toLowerCase()}. `;
    explanation += `The cron expression "${cronExpression}" and systemd OnCalendar "${systemdOnCalendar}" will produce the same execution schedule. `;
    explanation += `Systemd timers provide better integration with the system, while cron offers simplicity and wide compatibility.`;

    return {
      id: generateId(),
      schedule,
      cronExpression,
      systemdOnCalendar,
      systemdTimerFile,
      systemdServiceFile,
      cronTabEntry,
      explanation,
      createdAt: new Date()
    };
  };

  const handleGenerate = () => {
    if (!command.trim()) return;
    
    const comparison = generateComparison();
    setGeneratedComparison(comparison);
    
    // Add to history
    setComparisonHistory([comparison, ...comparisonHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setComparisonHistory([]);
    setGeneratedComparison(null);
  };

  const validateInputs = (): boolean => {
    return command.trim() !== '';
  };

  const getInstallationCommands = (): string => {
    if (!generatedComparison) return '';
    
    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    const timerName = `${serviceName}.timer`;
    
    return `# Systemd Installation:
sudo cp ${serviceName}.service /etc/systemd/system/
sudo cp ${timerName} /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable ${timerName}
sudo systemctl start ${timerName}

# Cron Installation:
# Add to crontab: crontab -e
# Then add: ${generatedComparison.cronTabEntry}

# Check status:
sudo systemctl status ${timerName}
sudo systemctl list-timers
crontab -l`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Comparison</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Type
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {schedulePresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Command to Execute
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., /usr/local/bin/backup.sh"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="e.g., root, www-data"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Comparison
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {generatedComparison && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Cron Expression</h4>
                <div className="flex justify-between items-center mb-2">
                  <code className="bg-white px-3 py-2 rounded text-lg font-mono">
                    {generatedComparison.cronExpression}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedComparison.cronExpression)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-blue-700">
                  Traditional cron format for scheduling
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">Systemd OnCalendar</h4>
                <div className="flex justify-between items-center mb-2">
                  <code className="bg-white px-3 py-2 rounded text-lg font-mono">
                    {generatedComparison.systemdOnCalendar}
                  </code>
                  <button
                    onClick={() => copyToClipboard(generatedComparison.systemdOnCalendar)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-green-700">
                  Modern systemd calendar format
                </p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
              <p className="text-gray-700 text-sm">
                {generatedComparison.explanation}
              </p>
            </div>
          </div>

          {/* Cron Implementation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Cron Implementation</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Crontab Entry:</span>
                <button
                  onClick={() => copyToClipboard(generatedComparison.cronTabEntry)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy Entry
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-sm overflow-x-auto border">
                <code>{generatedComparison.cronTabEntry}</code>
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Add this line to your crontab using <code className="bg-gray-100 px-1 rounded">crontab -e</code>
              </p>
            </div>
          </div>

          {/* Systemd Implementation */}
          <div className="space-y-6">
            {/* Timer File */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Systemd Timer File</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Timer Unit:</span>
                  <button
                    onClick={() => copyToClipboard(generatedComparison.systemdTimerFile)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Timer
                  </button>
                </div>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                  <code>{generatedComparison.systemdTimerFile}</code>
                </pre>
              </div>
            </div>

            {/* Service File */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Systemd Service File</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Service Unit:</span>
                  <button
                    onClick={() => copyToClipboard(generatedComparison.systemdServiceFile)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Service
                  </button>
                </div>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                  <code>{generatedComparison.systemdServiceFile}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Installation Commands */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Installation Commands</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Commands:</span>
                <button
                  onClick={() => copyToClipboard(getInstallationCommands())}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                >
                  Copy Commands
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{getInstallationCommands()}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Feature Comparison Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Feature Comparison: Cron vs Systemd Timers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cron
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Systemd Timers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Ease of Use
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Simple, familiar syntax
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  More complex but powerful
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  System Integration
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Limited integration
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Full systemd integration
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Logging
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Basic logging
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Journal integration
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Persistence
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  No built-in persistence
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Built-in persistence
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Accuracy
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Minute-level accuracy
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Configurable accuracy
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Randomization
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Manual implementation
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Built-in randomization
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Dependencies
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  No dependency management
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Full dependency management
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Monitoring
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Limited monitoring
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Rich monitoring tools
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison History */}
      {comparisonHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Comparison History</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {comparisonHistory.map((comparison) => (
              <div key={comparison.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Schedule:</h4>
                    <p className="text-gray-600">{comparison.schedule}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>Command:</strong> {comparison.command}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Formats:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Cron:</strong> <code className="bg-gray-100 px-1 rounded">{comparison.cronExpression}</code></p>
                      <p><strong>Systemd:</strong> <code className="bg-gray-100 px-1 rounded">{comparison.systemdOnCalendar}</code></p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSchedule(comparison.schedule.toLowerCase().replace(/\s+/g, '-'));
                      setCommand(comparison.command);
                      setGeneratedComparison(comparison);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Reload
                  </button>
                  <button
                    onClick={() => copyToClipboard(comparison.cronTabEntry)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Cron
                  </button>
                  <button
                    onClick={() => copyToClipboard(comparison.systemdTimerFile)}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                  >
                    Copy Timer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">When to Use Each Approach</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">Use Cron When:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• You need simple, quick scheduling</li>
              <li>• Working on older systems without systemd</li>
              <li>• Team is familiar with cron syntax</li>
              <li>• Basic scheduling needs (daily, weekly, etc.)</li>
              <li>• Quick scripts and maintenance tasks</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">Use Systemd Timers When:</h4>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• You need advanced scheduling features</li>
              <li>• Working on modern Linux systems</li>
              <li>• Require system integration and monitoring</li>
              <li>• Need persistence and accuracy control</li>
              <li>• Building production services</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Select Schedule</h4>
            <p className="text-sm">Choose the scheduling pattern you need from the presets.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Configure Command</h4>
            <p className="text-sm">Enter the command you want to schedule and the user to run it as.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Generate Comparison</h4>
            <p className="text-sm">Click "Generate Comparison" to see both cron and systemd implementations.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Choose Implementation</h4>
            <p className="text-sm">Copy the appropriate files and commands for your preferred approach.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemdTimerVsCronComparisonTool;
