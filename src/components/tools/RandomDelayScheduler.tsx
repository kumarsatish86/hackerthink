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
  generatedCron: string;
  generatedSystemdTimer: string;
  generatedSystemdService: string;
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

export const RandomDelayScheduler: React.FC = () => {
  const [scheduleName, setScheduleName] = useState('');
  const [baseSchedule, setBaseSchedule] = useState('daily');
  const [delayType, setDelayType] = useState('random');
  const [minDelay, setMinDelay] = useState(0);
  const [maxDelay, setMaxDelay] = useState(300);
  const [delayUnit, setDelayUnit] = useState('seconds');
  const [command, setCommand] = useState('/usr/local/bin/backup.sh');
  const [user, setUser] = useState('root');
  const [generatedCron, setGeneratedCron] = useState('');
  const [generatedSystemdTimer, setGeneratedSystemdTimer] = useState('');
  const [generatedSystemdService, setGeneratedSystemdService] = useState('');
  const [scheduleHistory, setScheduleHistory] = useState<RandomDelaySchedule[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const baseSchedules = [
    { value: 'daily', label: 'Daily at midnight', cron: '0 0 * * *', systemd: 'daily' },
    { value: 'daily-9am', label: 'Daily at 9 AM', cron: '0 9 * * *', systemd: 'daily 09:00:00' },
    { value: 'weekly', label: 'Weekly on Sunday', cron: '0 0 * * 0', systemd: 'weekly' },
    { value: 'weekly-monday', label: 'Weekly on Monday at 9 AM', cron: '0 9 * * 1', systemd: 'weekly: monday 09:00:00' },
    { value: 'monthly', label: 'Monthly on 1st', cron: '0 0 1 * *', systemd: 'monthly' },
    { value: 'hourly', label: 'Every hour', cron: '0 * * * *', systemd: 'hourly' },
    { value: 'every-5min', label: 'Every 5 minutes', cron: '*/5 * * * *', systemd: 'minutely: 0/5' }
  ];

  const delayTypes = [
    { value: 'random', label: 'Random delay within range', description: 'Random delay between min and max values' },
    { value: 'staggered', label: 'Staggered execution', description: 'Distribute execution across the delay window' },
    { value: 'jitter', label: 'Jitter (small random variation)', description: 'Small random variation around base time' }
  ];

  const delayUnits = [
    { value: 'seconds', label: 'Seconds', multiplier: 1 },
    { value: 'minutes', label: 'Minutes', multiplier: 60 },
    { value: 'hours', label: 'Hours', multiplier: 3600 }
  ];

  const generateRandomDelayCron = (): string => {
    const selectedSchedule = baseSchedules.find(s => s.value === baseSchedule);
    if (!selectedSchedule) return '';

    let cronExpression = selectedSchedule.cron;
    
    if (delayType === 'random' || delayType === 'staggered') {
      // For random delays, we'll use a wrapper script approach
      // The cron runs at the base time, but the script adds random delay
      return `${selectedSchedule.cron} ${user} /usr/local/bin/random-delay-wrapper.sh ${minDelay} ${maxDelay} ${delayUnit} ${command}`;
    } else if (delayType === 'jitter') {
      // For jitter, we can use cron's minute-level randomization
      const [minute, hour, day, month, weekday] = selectedSchedule.cron.split(' ');
      if (minute === '0' || minute === '*/5') {
        // Add small random variation to minute
        return `${Math.floor(Math.random() * 5)} ${hour} ${day} ${month} ${weekday} ${user} ${command}`;
      }
    }
    
    return `${selectedSchedule.cron} ${user} ${command}`;
  };

  const generateRandomDelayWrapperScript = (): string => {
    return `#!/bin/bash
# Random Delay Wrapper Script
# Usage: random-delay-wrapper.sh <min_delay> <max_delay> <unit> <command>

MIN_DELAY=$1
MAX_DELAY=$2
UNIT=$3
COMMAND=$4

# Convert to seconds
case $UNIT in
    "seconds")
        MIN_SECONDS=$MIN_DELAY
        MAX_SECONDS=$MAX_DELAY
        ;;
    "minutes")
        MIN_SECONDS=$((MIN_DELAY * 60))
        MAX_SECONDS=$((MAX_DELAY * 60))
        ;;
    "hours")
        MIN_SECONDS=$((MIN_DELAY * 3600))
        MAX_SECONDS=$((MAX_DELAY * 3600))
        ;;
    *)
        echo "Invalid unit: $UNIT"
        exit 1
        ;;
esac

# Calculate random delay
if [ $MIN_SECONDS -eq $MAX_SECONDS ]; then
    DELAY=$MIN_SECONDS
else
    DELAY=$((RANDOM % (MAX_SECONDS - MIN_SECONDS + 1) + MIN_SECONDS))
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Scheduled command will execute in ${DELAY} seconds"
sleep $DELAY

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Executing: $COMMAND"
eval $COMMAND`;
  };

  const generateSystemdTimer = (): string => {
    const selectedSchedule = baseSchedules.find(s => s.value === baseSchedule);
    if (!selectedSchedule) return '';

    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    
    let timerContent = `[Unit]
Description=Timer for ${scheduleName} with random delay
Requires=${serviceName}.service

[Timer]
OnCalendar=${selectedSchedule.systemd}`;

    if (delayType === 'random' || delayType === 'staggered') {
      const maxDelaySeconds = maxDelay * (delayUnits.find(u => u.value === delayUnit)?.multiplier || 1);
      timerContent += `
RandomizedDelaySec=${maxDelaySeconds}s`;
    } else if (delayType === 'jitter') {
      const jitterSeconds = Math.min(maxDelay, 300); // Cap jitter at 5 minutes
      timerContent += `
RandomizedDelaySec=${jitterSeconds}s`;
    }

    timerContent += `
AccuracySec=1m
Persistent=true

[Install]
WantedBy=timers.target`;

    return timerContent;
  };

  const generateSystemdService = (): string => {
    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    
    return `[Unit]
Description=Service for ${scheduleName} with random delay
Type=oneshot

[Service]
ExecStart=${command}
User=${user}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`;
  };

  const getScheduleExplanation = (): string => {
    const selectedSchedule = baseSchedules.find(s => s.value === baseSchedule);
    if (!selectedSchedule) return '';

    let explanation = `This schedule "${scheduleName}" will execute "${command}" ${selectedSchedule.label.toLowerCase()}. `;
    
    if (delayType === 'random') {
      explanation += `A random delay between ${minDelay} and ${maxDelay} ${delayUnit} will be added to prevent multiple systems from executing simultaneously. `;
    } else if (delayType === 'staggered') {
      explanation += `Execution will be staggered across a ${minDelay}-${maxDelay} ${delayUnit} window to distribute load. `;
    } else if (delayType === 'jitter') {
      explanation += `Small random variations (jitter) of up to ${maxDelay} ${delayUnit} will be added to prevent thundering herd problems. `;
    }
    
    explanation += `This approach is useful for distributed systems, backup operations, and any scenario where multiple systems might execute the same task at the same time.`;
    
    return explanation;
  };

  const handleGenerate = () => {
    if (!scheduleName.trim() || !command.trim()) return;
    
    const cron = generateRandomDelayCron();
    const timer = generateSystemdTimer();
    const service = generateSystemdService();
    const explanation = getScheduleExplanation();
    
    setGeneratedCron(cron);
    setGeneratedSystemdTimer(timer);
    setGeneratedSystemdService(service);
    
    // Add to history
    const newSchedule: RandomDelaySchedule = {
      id: generateId(),
      scheduleName: scheduleName,
      baseSchedule: baseSchedule,
      delayType: delayType,
      minDelay: minDelay,
      maxDelay: maxDelay,
      delayUnit: delayUnit,
      generatedCron: cron,
      generatedSystemdTimer: timer,
      generatedSystemdService: service,
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
    setGeneratedCron('');
    setGeneratedSystemdTimer('');
    setGeneratedSystemdService('');
  };

  const validateInputs = (): boolean => {
    return scheduleName.trim() !== '' && 
           command.trim() !== '' && 
           minDelay >= 0 && 
           maxDelay >= minDelay;
  };

  const getInstallationCommands = (): string => {
    if (!generatedCron || !generatedSystemdTimer) return '';
    
    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    const timerName = `${serviceName}.timer`;
    
    return `# Systemd Installation:
sudo cp ${serviceName}.service /etc/systemd/system/
sudo cp ${timerName} /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable ${timerName}
sudo systemctl start ${timerName}

# Cron Installation (if using cron approach):
# 1. Create the wrapper script:
sudo tee /usr/local/bin/random-delay-wrapper.sh > /dev/null << 'EOF'
${generateRandomDelayWrapperScript()}
EOF

# 2. Make it executable:
sudo chmod +x /usr/local/bin/random-delay-wrapper.sh

# 3. Add to crontab: crontab -e
# Then add: ${generatedCron}

# Check status:
sudo systemctl status ${timerName}
sudo systemctl list-timers
crontab -l`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Random Delay Schedule</h3>
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
                placeholder="e.g., Backup Schedule, Maintenance Task"
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
                {baseSchedules.map((schedule) => (
                  <option key={schedule.value} value={schedule.value}>
                    {schedule.label}
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
              <p className="text-xs text-gray-500 mt-1">
                {delayTypes.find(t => t.value === delayType)?.description}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Unit
              </label>
              <select
                value={delayUnit}
                onChange={(e) => setDelayUnit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {delayUnits.map((unit) => (
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
                min={minDelay}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Generated Results */}
      {generatedCron && generatedSystemdTimer && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Random Delay Schedule Overview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Schedule Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {scheduleName}</p>
                  <p><strong>Base Schedule:</strong> {baseSchedules.find(s => s.value === baseSchedule)?.label}</p>
                  <p><strong>Delay Type:</strong> {delayTypes.find(t => t.value === delayType)?.label}</p>
                  <p><strong>Delay Range:</strong> {minDelay} - {maxDelay} {delayUnit}</p>
                  <p><strong>Command:</strong> {command}</p>
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

          {/* Cron Implementation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Cron Implementation with Random Delay</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Crontab Entry:</span>
                <button
                  onClick={() => copyToClipboard(generatedCron)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy Entry
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-sm overflow-x-auto border">
                <code>{generatedCron}</code>
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                This cron entry uses a wrapper script to add random delays. The wrapper script will be generated below.
              </p>
            </div>
          </div>

          {/* Wrapper Script */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Random Delay Wrapper Script</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Wrapper Script:</span>
                <button
                  onClick={() => copyToClipboard(generateRandomDelayWrapperScript())}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Copy Script
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{generateRandomDelayWrapperScript()}</code>
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Save this script as <code className="bg-gray-100 px-1 rounded">/usr/local/bin/random-delay-wrapper.sh</code> and make it executable.
              </p>
            </div>
          </div>

          {/* Systemd Implementation */}
          <div className="space-y-6">
            {/* Timer File */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Systemd Timer with Random Delay</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Timer Unit:</span>
                  <button
                    onClick={() => copyToClipboard(generatedSystemdTimer)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Timer
                  </button>
                </div>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                  <code>{generatedSystemdTimer}</code>
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
                    onClick={() => copyToClipboard(generatedSystemdService)}
                    className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Service
                  </button>
                </div>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                  <code>{generatedSystemdService}</code>
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
                      <p><strong>Base Schedule:</strong> {baseSchedules.find(s => s.value === schedule.baseSchedule)?.label}</p>
                      <p><strong>Delay Type:</strong> {delayTypes.find(t => t.value === schedule.delayType)?.label}</p>
                      <p><strong>Delay Range:</strong> {schedule.minDelay} - {schedule.maxDelay} {schedule.delayUnit}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Generated Files:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Cron:</strong> <code className="bg-gray-100 px-1 rounded">Generated</code></p>
                      <p><strong>Timer:</strong> <code className="bg-gray-100 px-1 rounded">Generated</code></p>
                      <p><strong>Service:</strong> <code className="bg-gray-100 px-1 rounded">Generated</code></p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{schedule.explanation}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setScheduleName(schedule.scheduleName);
                      setBaseSchedule(schedule.baseSchedule);
                      setDelayType(schedule.delayType);
                      setMinDelay(schedule.minDelay);
                      setMaxDelay(schedule.maxDelay);
                      setDelayUnit(schedule.delayUnit);
                      setGeneratedCron(schedule.generatedCron);
                      setGeneratedSystemdTimer(schedule.generatedSystemdTimer);
                      setGeneratedSystemdService(schedule.generatedSystemdService);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Reload
                  </button>
                  <button
                    onClick={() => copyToClipboard(schedule.generatedCron)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Cron
                  </button>
                  <button
                    onClick={() => copyToClipboard(schedule.generatedSystemdTimer)}
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
        <h3 className="text-lg font-semibold mb-4">Best Practices for Random Delay Scheduling</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Choose Appropriate Delay Ranges</h4>
            <p className="text-gray-700 text-sm">
              Set delay ranges that are meaningful for your use case. Too small delays may not prevent thundering herd, while too large delays may impact responsiveness.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Use Systemd When Possible</h4>
            <p className="text-gray-700 text-sm">
              Systemd timers have built-in RandomizedDelaySec support, making them more reliable than cron wrapper scripts for random delays.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Consider System Load</h4>
            <p className="text-gray-700 text-sm">
              Random delays are most effective when the delay window is proportional to the number of systems and the expected execution time.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Monitor Execution Patterns</h4>
            <p className="text-gray-700 text-sm">
              Use monitoring tools to verify that random delays are working as expected and not causing unintended clustering.
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
            <p className="text-sm">Enter the schedule name, base timing, and random delay parameters.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Choose Delay Type</h4>
            <p className="text-sm">Select between random delays, staggered execution, or jitter for your use case.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Generate Files</h4>
            <p className="text-sm">Click "Generate Random Delay Schedule" to create cron and systemd implementations.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Install and Configure</h4>
            <p className="text-sm">Use the provided installation commands to set up your random delay schedule.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomDelayScheduler;
