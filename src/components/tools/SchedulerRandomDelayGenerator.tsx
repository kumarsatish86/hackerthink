'use client';

import React, { useState } from 'react';

interface RandomDelaySchedule {
  id: string;
  scheduleName: string;
  baseSchedule: string;
  delayType: string;
  minDelay: number;
  maxDelay: number;
  delayUnit: string;
  generatedSchedule: string;
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

export const SchedulerRandomDelayGenerator: React.FC = () => {
  const [scheduleName, setScheduleName] = useState('');
  const [baseSchedule, setBaseSchedule] = useState('daily');
  const [delayType, setDelayType] = useState('uniform');
  const [minDelay, setMinDelay] = useState(0);
  const [maxDelay, setMaxDelay] = useState(300);
  const [delayUnit, setDelayUnit] = useState('seconds');
  const [generatedSchedule, setGeneratedSchedule] = useState('');
  const [scheduleHistory, setScheduleHistory] = useState<RandomDelaySchedule[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const baseSchedulePresets = [
    { value: 'daily', label: 'Daily at midnight', cron: '0 0 * * *' },
    { value: 'daily-9am', label: 'Daily at 9 AM', cron: '0 9 * * *' },
    { value: 'weekly', label: 'Weekly on Sunday', cron: '0 0 * * 0' },
    { value: 'weekly-monday', label: 'Weekly on Monday at 9 AM', cron: '0 9 * * 1' },
    { value: 'monthly', label: 'Monthly on 1st', cron: '0 0 1 * *' },
    { value: 'hourly', label: 'Every hour', cron: '0 * * * *' },
    { value: 'every-15min', label: 'Every 15 minutes', cron: '*/15 * * * *' },
    { value: 'every-5min', label: 'Every 5 minutes', cron: '*/5 * * * *' }
  ];

  const delayTypes = [
    { value: 'uniform', label: 'Uniform Random', description: 'Random delay between min and max values' },
    { value: 'normal', label: 'Normal Distribution', description: 'Bell curve distribution around mean' },
    { value: 'exponential', label: 'Exponential', description: 'Exponential distribution favoring shorter delays' },
    { value: 'jitter', label: 'Jitter Pattern', description: 'Small random variations around base time' }
  ];

  const timeUnits = [
    { value: 'seconds', label: 'Seconds', multiplier: 1 },
    { value: 'minutes', label: 'Minutes', multiplier: 60 },
    { value: 'hours', label: 'Hours', multiplier: 3600 }
  ];

  const generateRandomDelaySchedule = (): string => {
    const selectedBase = baseSchedulePresets.find(s => s.value === baseSchedule);
    if (!selectedBase) return '';

    let delayExpression = '';
    let delayDescription = '';

    switch (delayType) {
      case 'uniform':
        delayExpression = `sleep $((RANDOM % (${maxDelay} - ${minDelay} + 1) + ${minDelay}))`;
        delayDescription = `Random delay between ${minDelay} and ${maxDelay} ${delayUnit}`;
        break;
      case 'normal':
        const mean = Math.round((minDelay + maxDelay) / 2);
        const stdDev = Math.round((maxDelay - minDelay) / 6);
        delayExpression = `sleep $(((${mean} + (RANDOM % (${stdDev} * 2 + 1) - ${stdDev})))`;
        delayDescription = `Normal distribution around ${mean} ${delayUnit} with standard deviation of ${stdDev}`;
        break;
      case 'exponential':
        delayExpression = `sleep $(((${minDelay} + (RANDOM % (${maxDelay} - ${minDelay} + 1)) / 2))`;
        delayDescription = `Exponential distribution favoring delays closer to ${minDelay} ${delayUnit}`;
        break;
      case 'jitter':
        const jitterRange = Math.round((maxDelay - minDelay) * 0.1);
        delayExpression = `sleep $(((${minDelay} + (RANDOM % (${jitterRange} * 2 + 1) - ${jitterRange})))`;
        delayDescription = `Jitter pattern with ${jitterRange} ${delayUnit} variation around ${minDelay}`;
        break;
    }

    const scriptName = `${scheduleName.toLowerCase().replace(/\s+/g, '-')}-random-delay.sh`;
    
    return `#!/bin/bash
# Random Delay Scheduler: ${scheduleName}
# Generated at: ${new Date().toLocaleString()}
# Base Schedule: ${selectedBase.label}
# Delay Type: ${delayTypes.find(d => d.value === delayType)?.label}
# ${delayDescription}

# Function to generate random delay
generate_random_delay() {
    ${delayExpression}
}

# Main execution
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting scheduled task: ${scheduleName}"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Applying random delay..."

# Apply random delay
generate_random_delay

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Delay completed, executing task..."

# Your actual command goes here
# Replace this with your actual task
echo "Executing scheduled task: ${scheduleName}"
# /usr/local/bin/your-actual-command.sh

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Task completed: ${scheduleName}"`;
  };

  const generateCronWithRandomDelay = (): string => {
    const selectedBase = baseSchedulePresets.find(s => s.value === baseSchedule);
    if (!selectedBase) return '';

    const scriptName = `${scheduleName.toLowerCase().replace(/\s+/g, '-')}-random-delay.sh`;
    
    return `${selectedBase.cron} /usr/local/bin/${scriptName}`;
  };

  const generateSystemdTimerWithRandomDelay = (): string => {
    const selectedBase = baseSchedulePresets.find(s => s.value === baseSchedule);
    if (!selectedBase) return '';

    const serviceName = scheduleName.toLowerCase().replace(/\s+/g, '-');
    
    return `[Unit]
Description=Timer for ${scheduleName} with random delay
Requires=${serviceName}-random-delay.service

[Timer]
OnCalendar=${selectedBase.value === 'daily' ? 'daily' : 
              selectedBase.value === 'weekly' ? 'weekly' : 
              selectedBase.value === 'monthly' ? 'monthly' : 
              selectedBase.value === 'hourly' ? 'hourly' : 'daily'}
RandomizedDelaySec=${maxDelay}
AccuracySec=1m
Persistent=true

[Install]
WantedBy=timers.target`;
  };

  const getScheduleExplanation = (): string => {
    const selectedBase = baseSchedulePresets.find(s => s.value === baseSchedule);
    if (!selectedBase) return '';

    let explanation = `This schedule "${scheduleName}" is based on ${selectedBase.label.toLowerCase()}. `;
    explanation += `It will execute with a ${delayTypes.find(d => d.value === delayType)?.label.toLowerCase()} delay. `;

    switch (delayType) {
      case 'uniform':
        explanation += `The delay will be randomly distributed between ${minDelay} and ${maxDelay} ${delayUnit}. `;
        break;
      case 'normal':
        const mean = Math.round((minDelay + maxDelay) / 2);
        explanation += `The delay follows a normal distribution centered around ${mean} ${delayUnit}. `;
        break;
      case 'exponential':
        explanation += `The delay follows an exponential distribution, favoring shorter delays closer to ${minDelay} ${delayUnit}. `;
        break;
      case 'jitter':
        explanation += `The delay adds small random variations (jitter) around the base time of ${minDelay} ${delayUnit}. `;
        break;
    }

    explanation += `This approach helps prevent thundering herd problems by distributing load across different execution times.`;

    return explanation;
  };

  const handleGenerate = () => {
    if (!scheduleName.trim()) return;

    const script = generateRandomDelaySchedule();
    const cron = generateCronWithRandomDelay();
    const timer = generateSystemdTimerWithRandomDelay();
    const explanation = getScheduleExplanation();

    const fullOutput = `# Random Delay Schedule: ${scheduleName}

## Bash Script
${script}

## Cron Entry
${cron}

## Systemd Timer
${timer}

## Explanation
${explanation}`;

    setGeneratedSchedule(fullOutput);

    // Add to history
    const newSchedule: RandomDelaySchedule = {
      id: generateId(),
      scheduleName: scheduleName,
      baseSchedule: baseSchedule,
      delayType: delayType,
      minDelay: minDelay,
      maxDelay: maxDelay,
      delayUnit: delayUnit,
      generatedSchedule: fullOutput,
      explanation: explanation,
      createdAt: new Date()
    };

    setScheduleHistory([newSchedule, ...scheduleHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setScheduleHistory([]);
    setGeneratedSchedule('');
  };

  const validateInputs = (): boolean => {
    return scheduleName.trim() !== '' && 
           minDelay >= 0 && 
           maxDelay > minDelay;
  };

  const getInstallationCommands = (): string => {
    if (!generatedSchedule) return '';

    const scriptName = `${scheduleName.toLowerCase().replace(/\s+/g, '-')}-random-delay.sh`;
    const serviceName = scheduleName.toLowerCase().replace(/\s+/g, '-');
    
    return `# Installation Commands for ${scheduleName}

# 1. Create the random delay script:
sudo tee /usr/local/bin/${scriptName} > /dev/null << 'EOF'
${generateRandomDelaySchedule()}
EOF

# 2. Make the script executable:
sudo chmod +x /usr/local/bin/${scriptName}

# 3. For Cron installation:
# Add to crontab: crontab -e
# Then add: ${generateCronWithRandomDelay()}

# 4. For Systemd installation:
sudo cp ${serviceName}-random-delay.service /etc/systemd/system/
sudo cp ${serviceName}-random-delay.timer /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable ${serviceName}-random-delay.timer
sudo systemctl start ${serviceName}-random-delay.timer

# 5. Check status:
sudo systemctl status ${serviceName}-random-delay.timer
sudo systemctl list-timers`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Random Delay Scheduler</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Name
              </label>
              <input
                type="text"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="e.g., Database Backup, Log Rotation"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Schedule
              </label>
              <select
                value={baseSchedule}
                onChange={(e) => setBaseSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {baseSchedulePresets.map((preset) => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Type
              </label>
              <select
                value={delayType}
                onChange={(e) => setDelayType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {delayTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {delayTypes.find(d => d.value === delayType)?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Unit
              </label>
              <select
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Delay
              </label>
              <input
                type="number"
                value={minDelay}
                onChange={(e) => setMinDelay(parseInt(e.target.value) || 0)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Delay
              </label>
              <input
                type="number"
                value={maxDelay}
                onChange={(e) => setMaxDelay(parseInt(e.target.value) || 0)}
                min={minDelay + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Random Delay Schedule
          </button>
        </div>
      </div>

      {/* Generated Schedule */}
      {generatedSchedule && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Random Delay Schedule Overview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Schedule Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {scheduleName}</p>
                  <p><strong>Base Schedule:</strong> {baseSchedulePresets.find(s => s.value === baseSchedule)?.label}</p>
                  <p><strong>Delay Type:</strong> {delayTypes.find(d => d.value === delayType)?.label}</p>
                  <p><strong>Delay Range:</strong> {minDelay} - {maxDelay} {delayUnit}</p>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded">
                <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
                <p className="text-blue-800 text-sm">
                  {getScheduleExplanation()}
                </p>
              </div>
            </div>
          </div>

          {/* Generated Output */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Random Delay Schedule</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Complete Schedule:</span>
                <button
                  onClick={() => copyToClipboard(generatedSchedule)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy All
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{generatedSchedule}</code>
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
        </div>
      )}

      {/* Schedule History */}
      {scheduleHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Schedules</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {scheduleHistory.map((schedule) => (
              <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Schedule Details:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {schedule.scheduleName}</p>
                      <p><strong>Base Schedule:</strong> {baseSchedulePresets.find(s => s.value === schedule.baseSchedule)?.label}</p>
                      <p><strong>Delay Type:</strong> {delayTypes.find(d => d.value === schedule.delayType)?.label}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delay Configuration:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Range:</strong> {schedule.minDelay} - {schedule.maxDelay} {schedule.delayUnit}</p>
                      <p><strong>Created:</strong> {schedule.createdAt.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{schedule.explanation}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(schedule.generatedSchedule)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Copy Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for Random Delay Scheduling</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">1. Choose Appropriate Delay Ranges</h4>
            <p className="text-gray-700 text-sm">
              Set delay ranges that provide meaningful distribution without causing excessive delays. For hourly jobs, consider 0-300 seconds; for daily jobs, 0-1800 seconds.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-lg font-semibold text-green-900 mb-2">2. Use Different Delay Types for Different Scenarios</h4>
            <p className="text-gray-700 text-sm">
              Use uniform delays for load balancing, normal distribution for natural variation, exponential for quick recovery, and jitter for small variations.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="text-lg font-semibold text-purple-900 mb-2">3. Monitor and Adjust Delays</h4>
            <p className="text-gray-700 text-sm">
              Track execution times and adjust delay ranges based on actual load patterns and system performance.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="text-lg font-semibold text-orange-900 mb-2">4. Consider System Resources</h4>
            <p className="text-gray-700 text-sm">
              Ensure delays don't interfere with critical system operations or cause resource contention during peak usage periods.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Schedule</h4>
            <p className="text-sm">Enter the schedule name, base schedule, and delay parameters.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Choose Delay Type</h4>
            <p className="text-sm">Select the appropriate delay distribution for your use case.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Generate Schedule</h4>
            <p className="text-sm">Click "Generate Random Delay Schedule" to create the complete solution.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Install and Monitor</h4>
            <p className="text-sm">Use the provided installation commands and monitor execution patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulerRandomDelayGenerator;
