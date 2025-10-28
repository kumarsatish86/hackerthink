'use client';

import React, { useState } from 'react';

interface SystemdTimer {
  id: string;
  timerName: string;
  serviceName: string;
  description: string;
  command: string;
  user: string;
  scheduleType: string;
  onCalendar: string;
  onBootSec: string;
  onUnitActiveSec: string;
  accuracySec: string;
  randomizedDelaySec: string;
  persistent: boolean;
  generatedTimer: string;
  generatedService: string;
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

export const SystemdTimerUnitGenerator: React.FC = () => {
  const [timerName, setTimerName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [command, setCommand] = useState('');
  const [user, setUser] = useState('root');
  const [scheduleType, setScheduleType] = useState('onCalendar');
  const [onCalendar, setOnCalendar] = useState('daily');
  const [onBootSec, setOnBootSec] = useState('5min');
  const [onUnitActiveSec, setOnUnitActiveSec] = useState('1h');
  const [accuracySec, setAccuracySec] = useState('1m');
  const [randomizedDelaySec, setRandomizedDelaySec] = useState('30s');
  const [persistent, setPersistent] = useState(true);
  const [generatedTimer, setGeneratedTimer] = useState('');
  const [generatedService, setGeneratedService] = useState('');
  const [timerHistory, setTimerHistory] = useState<SystemdTimer[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const scheduleTypes = [
    { value: 'onCalendar', label: 'Calendar-based (daily, weekly, etc.)' },
    { value: 'onBoot', label: 'On system boot' },
    { value: 'onUnitActive', label: 'After unit becomes active' },
    { value: 'onStartup', label: 'On system startup' }
  ];

  const calendarPresets = [
    { value: 'daily', label: 'Daily at midnight' },
    { value: 'weekly', label: 'Weekly on Sunday' },
    { value: 'monthly', label: 'Monthly on 1st' },
    { value: 'yearly', label: 'Yearly on January 1st' },
    { value: 'hourly', label: 'Every hour' },
    { value: 'minutely', label: 'Every minute' },
    { value: 'weekly: monday 09:00:00', label: 'Weekly on Monday at 9 AM' },
    { value: 'monthly: 1 14:30:00', label: 'Monthly on 1st at 2:30 PM' },
    { value: 'daily 10:00:00', label: 'Daily at 10 AM' },
    { value: 'weekly: tuesday 15:00:00', label: 'Weekly on Tuesday at 3 PM' }
  ];

  const timeUnits = [
    { value: 's', label: 'Seconds' },
    { value: 'm', label: 'Minutes' },
    { value: 'h', label: 'Hours' },
    { value: 'd', label: 'Days' }
  ];

  const generateTimerFile = (): string => {
    let timerContent = `[Unit]
Description=${description || `Timer for ${timerName}`}
Requires=${serviceName}.service

[Timer]
`;

    switch (scheduleType) {
      case 'onCalendar':
        timerContent += `OnCalendar=${onCalendar}\n`;
        break;
      case 'onBoot':
        timerContent += `OnBootSec=${onBootSec}\n`;
        break;
      case 'onUnitActive':
        timerContent += `OnUnitActiveSec=${onUnitActiveSec}\n`;
        break;
      case 'onStartup':
        timerContent += `OnStartupSec=${onBootSec}\n`;
        break;
    }

    timerContent += `AccuracySec=${accuracySec}
RandomizedDelaySec=${randomizedDelaySec}
Persistent=${persistent}

[Install]
WantedBy=timers.target`;

    return timerContent;
  };

  const generateServiceFile = (): string => {
    return `[Unit]
Description=${description || `Service for ${serviceName}`}
Type=oneshot

[Service]
ExecStart=${command}
User=${user}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`;
  };

  const getTimerExplanation = (): string => {
    let explanation = `This systemd timer "${timerName}" will execute the service "${serviceName}" `;
    
    switch (scheduleType) {
      case 'onCalendar':
        explanation += `according to the calendar schedule: ${onCalendar}. `;
        break;
      case 'onBoot':
        explanation += `${onBootSec} after the system boots. `;
        break;
      case 'onUnitActive':
        explanation += `${onUnitActiveSec} after the unit becomes active. `;
        break;
      case 'onStartup':
        explanation += `${onBootSec} after system startup. `;
        break;
    }
    
    explanation += `The timer has an accuracy of ${accuracySec} and a randomized delay of ${randomizedDelaySec}. `;
    if (persistent) {
      explanation += `It is persistent, meaning it will run missed executions when the system comes back online.`;
    } else {
      explanation += `It is not persistent, so missed executions will be skipped.`;
    }
    
    return explanation;
  };

  const handleGenerate = () => {
    if (!timerName.trim() || !serviceName.trim() || !command.trim()) return;
    
    const timerFile = generateTimerFile();
    const serviceFile = generateServiceFile();
    const explanation = getTimerExplanation();
    
    setGeneratedTimer(timerFile);
    setGeneratedService(serviceFile);
    
    // Add to history
    const newTimer: SystemdTimer = {
      id: generateId(),
      timerName: timerName,
      serviceName: serviceName,
      description: description,
      command: command,
      user: user,
      scheduleType: scheduleType,
      onCalendar: onCalendar,
      onBootSec: onBootSec,
      onUnitActiveSec: onUnitActiveSec,
      accuracySec: accuracySec,
      randomizedDelaySec: randomizedDelaySec,
      persistent: persistent,
      generatedTimer: timerFile,
      generatedService: serviceFile,
      explanation: explanation,
      createdAt: new Date()
    };
    
    setTimerHistory([newTimer, ...timerHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setTimerHistory([]);
    setGeneratedTimer('');
    setGeneratedService('');
  };

  const validateInputs = (): boolean => {
    return timerName.trim() !== '' && 
           serviceName.trim() !== '' && 
           command.trim() !== '';
  };

  const getInstallationCommands = (): string => {
    return `# Installation commands:
sudo cp ${serviceName}.service /etc/systemd/system/
sudo cp ${timerName}.timer /etc/systemd/system/

# Reload systemd and enable the timer
sudo systemctl daemon-reload
sudo systemctl enable ${timerName}.timer
sudo systemctl start ${timerName}.timer

# Check status
sudo systemctl status ${timerName}.timer
sudo systemctl list-timers`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Systemd Timer</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timer Name
              </label>
              <input
                type="text"
                value={timerName}
                onChange={(e) => setTimerName(e.target.value)}
                placeholder="e.g., backup.timer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., backup.service"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Daily backup service"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Type
              </label>
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {scheduleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {scheduleType === 'onCalendar' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calendar Schedule
              </label>
              <select
                value={onCalendar}
                onChange={(e) => setOnCalendar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {calendarPresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {scheduleType === 'onBoot' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boot Delay
              </label>
              <input
                type="text"
                value={onBootSec}
                onChange={(e) => setOnBootSec(e.target.value)}
                placeholder="e.g., 5min, 1h"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          {scheduleType === 'onUnitActive' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Active Delay
              </label>
              <input
                type="text"
                value={onUnitActiveSec}
                onChange={(e) => setOnUnitActiveSec(e.target.value)}
                placeholder="e.g., 1h, 30min"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accuracy
              </label>
              <input
                type="text"
                value={accuracySec}
                onChange={(e) => setAccuracySec(e.target.value)}
                placeholder="e.g., 1m, 30s"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Random Delay
              </label>
              <input
                type="text"
                value={randomizedDelaySec}
                onChange={(e) => setRandomizedDelaySec(e.target.value)}
                placeholder="e.g., 30s, 5m"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="persistent"
                checked={persistent}
                onChange={(e) => setPersistent(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="persistent" className="ml-2 text-sm text-gray-700">
                Persistent
              </label>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Systemd Files
          </button>
        </div>
      </div>

      {/* Generated Files */}
      {generatedTimer && generatedService && (
        <div className="space-y-6">
          {/* Timer File */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Timer File</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">File: {timerName}</span>
                <button
                  onClick={() => copyToClipboard(generatedTimer)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{generatedTimer}</code>
              </pre>
            </div>
          </div>

          {/* Service File */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Service File</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">File: {serviceName}</span>
                <button
                  onClick={() => copyToClipboard(generatedService)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{generatedService}</code>
              </pre>
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
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Copy Commands
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{getInstallationCommands()}</code>
              </pre>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Timer Explanation</h3>
            <p className="text-gray-700">
              {getTimerExplanation()}
            </p>
          </div>
        </div>
      )}

      {/* Timer History */}
      {timerHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Timers</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {timerHistory.map((timer) => (
              <div key={timer.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Timer Details:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {timer.timerName}</p>
                      <p><strong>Service:</strong> {timer.serviceName}</p>
                      <p><strong>Schedule:</strong> {timer.scheduleType}</p>
                      <p><strong>User:</strong> {timer.user}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Configuration:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Accuracy:</strong> {timer.accuracySec}</p>
                      <p><strong>Random Delay:</strong> {timer.randomizedDelaySec}</p>
                      <p><strong>Persistent:</strong> {timer.persistent ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{timer.explanation}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(timer.generatedTimer)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Copy Timer
                  </button>
                  <button
                    onClick={() => copyToClipboard(timer.generatedService)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for Systemd Timers</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Use Descriptive Names</h4>
            <p className="text-gray-700 text-sm">
              Choose clear, descriptive names for your timer and service files to make them easy to identify and manage.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Set Appropriate Accuracy</h4>
            <p className="text-gray-700 text-sm">
              Set accuracy based on your needs. Higher accuracy means more precise timing but more system resources.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Use Random Delays</h4>
            <p className="text-gray-700 text-sm">
              Add random delays to prevent multiple timers from executing simultaneously and overwhelming the system.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Enable Persistence</h4>
            <p className="text-gray-700 text-sm">
              Enable persistence for critical timers so they can catch up on missed executions when the system comes back online.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Timer</h4>
            <p className="text-sm">Enter the timer name, service name, description, and command details.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Choose Schedule</h4>
            <p className="text-sm">Select the appropriate schedule type and configure timing parameters.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Generate Files</h4>
            <p className="text-sm">Click "Generate Systemd Files" to create the timer and service files.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Install and Enable</h4>
            <p className="text-sm">Use the provided installation commands to install and enable your timer.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemdTimerUnitGenerator;
