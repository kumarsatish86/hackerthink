'use client';

import React, { useState } from 'react';

interface SystemdService {
  id: string;
  serviceName: string;
  description: string;
  command: string;
  user: string;
  group: string;
  workingDirectory: string;
  environment: string;
  serviceType: string;
  restartPolicy: string;
  restartSec: string;
  timeoutStartSec: string;
  timeoutStopSec: string;
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

export const SystemdServiceFileGenerator: React.FC = () => {
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [command, setCommand] = useState('');
  const [user, setUser] = useState('root');
  const [group, setGroup] = useState('root');
  const [workingDirectory, setWorkingDirectory] = useState('');
  const [environment, setEnvironment] = useState('');
  const [serviceType, setServiceType] = useState('oneshot');
  const [restartPolicy, setRestartPolicy] = useState('no');
  const [restartSec, setRestartSec] = useState('5s');
  const [timeoutStartSec, setTimeoutStartSec] = useState('30s');
  const [timeoutStopSec, setTimeoutStopSec] = useState('30s');
  const [generatedService, setGeneratedService] = useState('');
  const [serviceHistory, setServiceHistory] = useState<SystemdService[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const serviceTypes = [
    { value: 'oneshot', label: 'Oneshot (run once and exit)', description: 'For scripts that run once and exit' },
    { value: 'simple', label: 'Simple (run continuously)', description: 'For daemons that run continuously' },
    { value: 'forking', label: 'Forking (daemon forks)', description: 'For traditional daemons that fork' },
    { value: 'notify', label: 'Notify (systemd notification)', description: 'For services that notify systemd' },
    { value: 'dbus', label: 'DBus (DBus activation)', description: 'For DBus services' }
  ];

  const restartPolicies = [
    { value: 'no', label: 'No restart', description: 'Never restart the service' },
    { value: 'always', label: 'Always restart', description: 'Always restart on failure' },
    { value: 'on-failure', label: 'On failure only', description: 'Restart only on failure' },
    { value: 'on-abnormal', label: 'On abnormal exit', description: 'Restart on abnormal exit' },
    { value: 'on-abort', label: 'On abort', description: 'Restart on abort signal' }
  ];

  const commonUsers = [
    'root',
    'www-data',
    'postgres',
    'mysql',
    'redis',
    'nginx',
    'apache',
    'systemd-network',
    'systemd-resolve'
  ];

  const commonGroups = [
    'root',
    'www-data',
    'postgres',
    'mysql',
    'redis',
    'nginx',
    'apache',
    'systemd-network',
    'systemd-resolve'
  ];

  const generateServiceFile = (): string => {
    let serviceContent = `[Unit]
Description=${description || `Service for ${serviceName}`}
`;

    if (serviceType === 'oneshot') {
      serviceContent += `Type=oneshot
RemainAfterExit=yes
`;
    } else {
      serviceContent += `Type=${serviceType}
`;
    }

    serviceContent += `
[Service]
ExecStart=${command}`;

    if (user !== 'root') {
      serviceContent += `\nUser=${user}`;
    }

    if (group !== 'root') {
      serviceContent += `\nGroup=${group}`;
    }

    if (workingDirectory.trim()) {
      serviceContent += `\nWorkingDirectory=${workingDirectory}`;
    }

    if (environment.trim()) {
      const envVars = environment.split('\n').filter(line => line.trim());
      envVars.forEach(envVar => {
        serviceContent += `\nEnvironment="${envVar.trim()}"`;
      });
    }

    if (restartPolicy !== 'no') {
      serviceContent += `\nRestart=${restartPolicy}`;
      if (restartSec !== '5s') {
        serviceContent += `\nRestartSec=${restartSec}`;
      }
    }

    if (timeoutStartSec !== '30s') {
      serviceContent += `\nTimeoutStartSec=${timeoutStartSec}`;
    }

    if (timeoutStopSec !== '30s') {
      serviceContent += `\nTimeoutStopSec=${timeoutStopSec}`;
    }

    serviceContent += `
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`;

    return serviceContent;
  };

  const getServiceExplanation = (): string => {
    let explanation = `This systemd service "${serviceName}" is configured as a ${serviceType} service. `;
    
    if (serviceType === 'oneshot') {
      explanation += `It will execute the command "${command}" once and then exit. `;
    } else {
      explanation += `It will run the command "${command}" continuously. `;
    }
    
    if (user !== 'root') {
      explanation += `The service will run as user ${user}. `;
    }
    
    if (workingDirectory.trim()) {
      explanation += `It will execute from the working directory: ${workingDirectory}. `;
    }
    
    if (restartPolicy !== 'no') {
      explanation += `The service is configured to restart ${restartPolicy} with a ${restartSec} delay between restart attempts. `;
    }
    
    explanation += `The service will be enabled to start automatically on system boot.`;
    
    return explanation;
  };

  const handleGenerate = () => {
    if (!serviceName.trim() || !command.trim()) return;
    
    const serviceFile = generateServiceFile();
    const explanation = getServiceExplanation();
    
    setGeneratedService(serviceFile);
    
    // Add to history
    const newService: SystemdService = {
      id: generateId(),
      serviceName: serviceName,
      description: description,
      command: command,
      user: user,
      group: group,
      workingDirectory: workingDirectory,
      environment: environment,
      serviceType: serviceType,
      restartPolicy: restartPolicy,
      restartSec: restartSec,
      timeoutStartSec: timeoutStartSec,
      timeoutStopSec: timeoutStopSec,
      generatedService: serviceFile,
      explanation: explanation,
      createdAt: new Date()
    };
    
    setServiceHistory([newService, ...serviceHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setServiceHistory([]);
    setGeneratedService('');
  };

  const validateInputs = (): boolean => {
    return serviceName.trim() !== '' && command.trim() !== '';
  };

  const getInstallationCommands = (): string => {
    return `# Installation commands:
sudo cp ${serviceName}.service /etc/systemd/system/

# Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable ${serviceName}.service

# Start the service
sudo systemctl start ${serviceName}.service

# Check status
sudo systemctl status ${serviceName}.service

# View logs
sudo journalctl -u ${serviceName}.service -f`;
  };

  const getTimerIntegrationExample = (): string => {
    return `# Example timer file to use with this service:
[Unit]
Description=Timer for ${serviceName}
Requires=${serviceName}.service

[Timer]
OnCalendar=daily
AccuracySec=1m
RandomizedDelaySec=30s
Persistent=true

[Install]
WantedBy=timers.target`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Systemd Service</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {serviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
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
              <select
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {commonUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              {user === 'custom' && (
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="Enter custom user"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group
              </label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {commonGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              {group === 'custom' && (
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="Enter custom group"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Working Directory
            </label>
            <input
              type="text"
              value={workingDirectory}
              onChange={(e) => setWorkingDirectory(e.target.value)}
              placeholder="e.g., /var/backups (leave empty for default)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Environment Variables (one per line)
            </label>
            <textarea
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder="e.g.,&#10;DB_HOST=localhost&#10;DB_PORT=5432&#10;DEBUG=true"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restart Policy
              </label>
              <select
                value={restartPolicy}
                onChange={(e) => setRestartPolicy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {restartPolicies.map((policy) => (
                  <option key={policy.value} value={policy.value}>
                    {policy.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restart Delay
              </label>
              <input
                type="text"
                value={restartSec}
                onChange={(e) => setRestartSec(e.target.value)}
                placeholder="e.g., 5s, 1m"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Timeout
              </label>
              <input
                type="text"
                value={timeoutStartSec}
                onChange={(e) => setTimeoutStartSec(e.target.value)}
                placeholder="e.g., 30s, 2m"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Timeout
              </label>
              <input
                type="text"
                value={timeoutStopSec}
                onChange={(e) => setTimeoutStopSec(e.target.value)}
                placeholder="e.g., 30s, 2m"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Service File
          </button>
        </div>
      </div>

      {/* Generated Service File */}
      {generatedService && (
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
            <p className="text-sm text-gray-600 mt-2">
              {getServiceExplanation()}
            </p>
          </div>
        </div>
      )}

      {/* Installation Commands */}
      {generatedService && (
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
      )}

      {/* Timer Integration Example */}
      {generatedService && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Timer Integration Example</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Timer File:</span>
              <button
                onClick={() => copyToClipboard(getTimerIntegrationExample())}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
              >
                Copy Timer
              </button>
            </div>
            <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
              <code>{getTimerIntegrationExample()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Service History */}
      {serviceHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Services</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {serviceHistory.map((service) => (
              <div key={service.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service Details:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {service.serviceName}</p>
                      <p><strong>Type:</strong> {service.serviceType}</p>
                      <p><strong>Command:</strong> <code className="bg-gray-100 px-1 rounded">{service.command}</code></p>
                      <p><strong>User:</strong> {service.user}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Configuration:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Restart:</strong> {service.restartPolicy}</p>
                      <p><strong>Restart Delay:</strong> {service.restartSec}</p>
                      <p><strong>Start Timeout:</strong> {service.timeoutStartSec}</p>
                      <p><strong>Stop Timeout:</strong> {service.timeoutStopSec}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{service.explanation}</p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(service.generatedService)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
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
        <h3 className="text-lg font-semibold mb-4">Best Practices for Systemd Services</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Choose Appropriate Service Type</h4>
            <p className="text-gray-700 text-sm">
              Use 'oneshot' for scripts that run once and exit, 'simple' for daemons that run continuously, and 'forking' for traditional daemons.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Set Proper User Permissions</h4>
            <p className="text-gray-700 text-sm">
              Run services with minimal required privileges. Avoid running everything as root when possible.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Configure Restart Policies</h4>
            <p className="text-gray-700 text-sm">
              Use appropriate restart policies to ensure service reliability while preventing infinite restart loops.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Set Reasonable Timeouts</h4>
            <p className="text-gray-700 text-sm">
              Configure start and stop timeouts based on your service's actual behavior to prevent hanging services.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Service</h4>
            <p className="text-sm">Enter the service name, description, command, and other configuration details.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Choose Service Type</h4>
            <p className="text-sm">Select the appropriate service type based on how your service behaves.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Generate Service File</h4>
            <p className="text-sm">Click "Generate Service File" to create the systemd service configuration.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Install and Enable</h4>
            <p className="text-sm">Use the provided installation commands to install and enable your service.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemdServiceFileGenerator;
