'use client';

import React, { useState } from 'react';

interface RepetitiveJob {
  id: string;
  jobName: string;
  command: string;
  startTime: string;
  interval: number;
  intervalUnit: string;
  repetitions: number;
  maxDuration: number;
  generatedScript: string;
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

export const RepetitiveJobPlanner: React.FC = () => {
  const [jobName, setJobName] = useState('');
  const [command, setCommand] = useState('');
  const [startTime, setStartTime] = useState('');
  const [interval, setInterval] = useState(5);
  const [intervalUnit, setIntervalUnit] = useState('minutes');
  const [repetitions, setRepetitions] = useState(10);
  const [maxDuration, setMaxDuration] = useState(60);
  const [generatedScript, setGeneratedScript] = useState('');
  const [jobHistory, setJobHistory] = useState<RepetitiveJob[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const intervalUnits = [
    { value: 'seconds', label: 'Seconds' },
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' }
  ];

  const generateAtScript = (): string => {
    if (!startTime || !command.trim()) return '';

    const [hour, minute] = startTime.split(':');
    const atTime = `${hour}:${minute}`;
    
    let sleepCommand = '';
    let durationLimit = '';
    
    switch (intervalUnit) {
      case 'seconds':
        sleepCommand = `sleep ${interval}`;
        durationLimit = `timeout ${maxDuration}s`;
        break;
      case 'minutes':
        sleepCommand = `sleep $((60 * ${interval}))`;
        durationLimit = `timeout $((60 * ${maxDuration}))s`;
        break;
      case 'hours':
        sleepCommand = `sleep $((3600 * ${interval}))`;
        durationLimit = `timeout $((3600 * ${maxDuration}))s`;
        break;
    }

    return `#!/bin/bash
# Repetitive Job: ${jobName}
# Generated at: ${new Date().toLocaleString()}

# Function to execute the job
execute_job() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Executing: ${command}"
    ${command}
    local exit_code=$?
    if [ $exit_code -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Success"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Failed with exit code: $exit_code"
    fi
    return $exit_code
}

# Main execution loop
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting repetitive job: ${jobName}"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Will execute ${repetitions} times with ${interval} ${intervalUnit} intervals"

# Execute initial job
execute_job

# Loop for remaining executions
for i in $(seq 1 $((repetitions - 1))); do
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting ${interval} ${intervalUnit} before next execution (${i}/${repetitions})"
    ${sleepCommand}
    
    # Check if we've exceeded max duration
    if [ $SECONDS -gt $((maxDuration * ${intervalUnit === 'seconds' ? 1 : intervalUnit === 'minutes' ? 60 : 3600})) ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Maximum duration reached, stopping"
        break
    fi
    
    execute_job
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Repetitive job completed: ${jobName}"`;
  };

  const generateAtCommand = (): string => {
    if (!startTime || !command.trim()) return '';
    
    const [hour, minute] = startTime.split(':');
    const atTime = `${hour}:${minute}`;
    
    return `echo '${generateAtScript()}' | at ${atTime}`;
  };

  const generateCronAlternative = (): string => {
    if (!startTime || !command.trim()) return '';
    
    const [hour, minute] = startTime.split(':');
    
    // Calculate cron interval based on repetition needs
    let cronExpression = '';
    if (intervalUnit === 'minutes' && interval <= 59) {
      cronExpression = `${minute} */${interval} * * *`;
    } else if (intervalUnit === 'hours' && interval <= 23) {
      cronExpression = `${minute} */${interval} * * *`;
    } else {
      cronExpression = `${minute} ${hour} * * *`;
    }
    
    return `# Add to crontab: ${cronExpression}
# ${command}
# Note: This will run continuously, not just ${repetitions} times`;
  };

  const getJobExplanation = (): string => {
    let explanation = `This job will execute "${command}" starting at ${startTime}. `;
    explanation += `It will run ${repetitions} times with ${interval} ${intervalUnit} intervals between executions. `;
    
    if (maxDuration > 0) {
      explanation += `The job will stop after ${maxDuration} ${intervalUnit} maximum. `;
    }
    
    explanation += `The generated script uses the 'at' command for one-time scheduling with sleep loops for repetition.`;
    
    return explanation;
  };

  const handleGenerate = () => {
    if (!jobName.trim() || !command.trim() || !startTime) return;
    
    const script = generateAtScript();
    const atCommand = generateAtCommand();
    const cronAlt = generateCronAlternative();
    const explanation = getJobExplanation();
    
    const fullScript = `${script}

# To schedule this job, run:
${atCommand}

# Alternative cron approach:
${cronAlt}`;
    
    setGeneratedScript(fullScript);
    
    // Add to history
    const newJob: RepetitiveJob = {
      id: generateId(),
      jobName: jobName,
      command: command,
      startTime: startTime,
      interval: interval,
      intervalUnit: intervalUnit,
      repetitions: repetitions,
      maxDuration: maxDuration,
      generatedScript: fullScript,
      explanation: explanation,
      createdAt: new Date()
    };
    
    setJobHistory([newJob, ...jobHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setJobHistory([]);
    setGeneratedScript('');
  };

  const validateInputs = (): boolean => {
    return jobName.trim() !== '' && 
           command.trim() !== '' && 
           startTime !== '' && 
           interval > 0 && 
           repetitions > 0;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Repetitive Job</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Name
            </label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="e.g., Database Backup, Log Rotation"
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
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interval
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={interval}
                  onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={intervalUnit}
                  onChange={(e) => setIntervalUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {intervalUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Repetitions
              </label>
              <input
                type="number"
                value={repetitions}
                onChange={(e) => setRepetitions(parseInt(e.target.value) || 1)}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Duration (${intervalUnit})
              </label>
              <input
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value) || 0)}
                min="0"
                placeholder="0 = no limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Repetitive Job Script
          </button>
        </div>
      </div>

      {/* Generated Script */}
      {generatedScript && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Repetitive Job Script</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Bash Script:</span>
              <button
                onClick={() => copyToClipboard(generatedScript)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Copy Script
              </button>
            </div>
            <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
              <code>{generatedScript}</code>
            </pre>
            <p className="text-sm text-gray-600 mt-2">
              {getJobExplanation()}
            </p>
          </div>
        </div>
      )}

      {/* Job History */}
      {jobHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Jobs</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {jobHistory.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Job Details:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {job.jobName}</p>
                      <p><strong>Command:</strong> <code className="bg-gray-100 px-1 rounded">{job.command}</code></p>
                      <p><strong>Start Time:</strong> {job.startTime}</p>
                      <p><strong>Interval:</strong> {job.interval} {job.intervalUnit}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Execution:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Repetitions:</strong> {job.repetitions}</p>
                      <p><strong>Max Duration:</strong> {job.maxDuration > 0 ? `${job.maxDuration} ${job.intervalUnit}` : 'No limit'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{job.explanation}</p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(job.generatedScript)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Copy Script
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for Repetitive Jobs</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Use Appropriate Intervals</h4>
            <p className="text-gray-700 text-sm">
              Choose intervals that balance resource usage with job requirements. Avoid very short intervals (less than 1 minute) for system stability.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Set Maximum Duration</h4>
            <p className="text-gray-700 text-sm">
              Always set a maximum duration to prevent jobs from running indefinitely and consuming system resources.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Monitor Job Execution</h4>
            <p className="text-gray-700 text-sm">
              The generated script includes logging. Monitor these logs to ensure jobs are executing as expected.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Consider Alternative Approaches</h4>
            <p className="text-gray-700 text-sm">
              For long-term repetitive jobs, consider using cron instead of at + sleep loops for better system integration.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Your Job</h4>
            <p className="text-sm">Enter the job name, command, start time, and repetition details.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Generate Script</h4>
            <p className="text-sm">Click "Generate Repetitive Job Script" to create the bash script.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Schedule the Job</h4>
            <p className="text-sm">Use the provided at command to schedule the job for execution.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Monitor Execution</h4>
            <p className="text-sm">Check the job logs to ensure proper execution and handle any errors.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepetitiveJobPlanner;
