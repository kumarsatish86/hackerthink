'use client';

import React, { useState } from 'react';

interface RetryCronJob {
  id: string;
  jobName: string;
  command: string;
  user: string;
  schedule: string;
  maxRetries: number;
  retryDelay: number;
  retryDelayUnit: string;
  backoffMultiplier: number;
  maxRetryDelay: number;
  maxRetryDelayUnit: string;
  generatedCron: string;
  generatedRetryScript: string;
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

export const CommandRetryCronGeneratorInfoSections: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* What is Command Retry Logic? */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">What is Command Retry Logic?</h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            Command retry logic is a programming pattern that automatically attempts to re-execute a failed command 
            with intelligent delays between attempts. This approach is essential for handling transient failures 
            in distributed systems, network operations, and automated tasks.
          </p>
          <p className="text-gray-700 mb-4">
            Instead of failing immediately when a command encounters an error, retry logic implements strategies 
            like exponential backoff to give the system time to recover while preventing overwhelming already-stressed resources.
          </p>
        </div>
      </div>

      {/* Why Use Retry Logic? */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Use Retry Logic?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-blue-900">Reliability</h4>
            <p className="text-gray-700 text-sm">
              Automatically handle temporary failures without manual intervention, ensuring critical jobs complete successfully.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-green-900">Resilience</h4>
            <p className="text-gray-700 text-sm">
              Build robust systems that can withstand network hiccups, resource constraints, and temporary service unavailability.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-purple-900">Automation</h4>
            <p className="text-gray-700 text-sm">
              Reduce manual monitoring and intervention, allowing systems to self-heal from common failure scenarios.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-orange-900">Performance</h4>
            <p className="text-gray-700 text-sm">
              Optimize resource usage by avoiding unnecessary retries while ensuring timely completion of critical tasks.
            </p>
          </div>
        </div>
      </div>

      {/* Retry Strategies */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Retry Strategies</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">Exponential Backoff</h4>
            <p className="text-gray-700 text-sm">
              Increase delay exponentially between retries (e.g., 5s, 10s, 20s, 40s). This prevents overwhelming 
              struggling systems while providing quick recovery for temporary issues.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-lg font-semibold text-green-900 mb-2">Fixed Delay</h4>
            <p className="text-gray-700 text-sm">
              Use consistent delays between retries. Simple but may not be optimal for all failure scenarios.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="text-lg font-semibold text-purple-900 mb-2">Jittered Backoff</h4>
            <p className="text-gray-700 text-sm">
              Add randomness to exponential backoff to prevent multiple retrying clients from synchronizing their retry attempts.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="text-lg font-semibold text-orange-900 mb-2">Maximum Delay Cap</h4>
            <p className="text-gray-700 text-sm">
              Limit the maximum delay to prevent jobs from waiting too long between retries, ensuring reasonable completion times.
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Database Operations</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Backup and restore operations</li>
              <li>Data synchronization tasks</li>
              <li>Maintenance procedures</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Network Operations</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>File transfers and downloads</li>
              <li>API calls and web scraping</li>
              <li>Remote system administration</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">System Maintenance</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Log rotation and cleanup</li>
              <li>Package updates and installations</li>
              <li>Service restarts and health checks</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-gray-900">Monitoring and Alerting</h4>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Health check scripts</li>
              <li>Metric collection</li>
              <li>Alert notifications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Best Practices</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="text-lg font-semibold text-blue-900 mb-2">1. Set Appropriate Retry Limits</h4>
            <p className="text-gray-700 text-sm">
              Choose retry counts based on the nature of your operation. Network operations might need more retries 
              than local file operations. Avoid infinite retry loops that could consume system resources indefinitely.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="text-lg font-semibold text-green-900 mb-2">2. Use Exponential Backoff</h4>
            <p className="text-gray-700 text-sm">
              Implement exponential backoff to prevent overwhelming struggling systems. Start with short delays 
              and increase them exponentially, but cap at reasonable maximums.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="text-lg font-semibold text-purple-900 mb-2">3. Log All Retry Attempts</h4>
            <p className="text-gray-700 text-sm">
              Maintain detailed logs of retry attempts, including failure reasons and timing. This information 
              is crucial for debugging and optimizing retry strategies.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="text-lg font-semibold text-orange-900 mb-2">4. Consider Idempotency</h4>
            <p className="text-gray-700 text-sm">
              Ensure your commands are idempotent (safe to run multiple times) when implementing retry logic. 
              This prevents unintended side effects from multiple executions.
            </p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="text-lg font-semibold text-red-900 mb-2">5. Monitor and Alert</h4>
            <p className="text-gray-700 text-sm">
              Set up monitoring for jobs that frequently require retries. High retry rates might indicate 
              underlying system issues that need attention.
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting Common Issues</h3>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">High Retry Rates</h4>
            <p className="text-gray-700 text-sm mb-2">
              If your jobs are frequently retrying, investigate the root cause:
            </p>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Check system resource availability (CPU, memory, disk space)</li>
              <li>Verify network connectivity and firewall rules</li>
              <li>Review command dependencies and prerequisites</li>
              <li>Examine system logs for error patterns</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Excessive Delays</h4>
            <p className="text-gray-700 text-sm mb-2">
              If retry delays are too long, consider:
            </p>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Reducing the backoff multiplier</li>
              <li>Lowering the maximum delay cap</li>
              <li>Using fixed delays for time-sensitive operations</li>
              <li>Implementing circuit breaker patterns for persistent failures</li>
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Resource Exhaustion</h4>
            <p className="text-gray-700 text-sm mb-2">
              To prevent resource exhaustion:
            </p>
            <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
              <li>Set reasonable retry limits</li>
              <li>Implement maximum execution time limits</li>
              <li>Use job queues for resource-intensive operations</li>
              <li>Monitor system resource usage during retry operations</li>
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
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.slice(0, 6).map((tool) => (
          <div key={tool.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">{tool.icon}</span>
              <h4 className="font-semibold text-gray-900">{tool.title}</h4>
            </div>
            <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
            <a
              href={`/tools/${tool.slug}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Learn More →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SubscribeSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
      <h3 className="text-2xl font-bold mb-4">Stay Updated with Linux Tools</h3>
      <p className="text-blue-100 mb-6">
        Get notified about new tools, updates, and Linux administration tips.
      </p>
      <div className="max-w-md mx-auto">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button className="px-6 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100 transition-colors">
            Subscribe
          </button>
        </div>
        <p className="text-blue-100 text-sm mt-2">
          No spam, unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export const CommandRetryCronGenerator: React.FC = () => {
  const [jobName, setJobName] = useState('');
  const [command, setCommand] = useState('');
  const [user, setUser] = useState('root');
  const [schedule, setSchedule] = useState('daily');
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(5);
  const [retryDelayUnit, setRetryDelayUnit] = useState('minutes');
  const [backoffMultiplier, setBackoffMultiplier] = useState(2);
  const [maxRetryDelay, setMaxRetryDelay] = useState(60);
  const [maxRetryDelayUnit, setMaxRetryDelayUnit] = useState('minutes');
  const [generatedCron, setGeneratedCron] = useState('');
  const [generatedRetryScript, setGeneratedRetryScript] = useState('');
  const [generatedSystemdTimer, setGeneratedSystemdTimer] = useState('');
  const [generatedSystemdService, setGeneratedSystemdService] = useState('');
  const [jobHistory, setJobHistory] = useState<RetryCronJob[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const schedulePresets = [
    { value: 'daily', label: 'Daily at midnight', cron: '0 0 * * *', systemd: 'daily' },
    { value: 'daily-9am', label: 'Daily at 9 AM', cron: '0 9 * * *', systemd: 'daily 09:00:00' },
    { value: 'weekly', label: 'Weekly on Sunday', cron: '0 0 * * 0', systemd: 'weekly' },
    { value: 'weekly-monday', label: 'Weekly on Monday at 9 AM', cron: '0 9 * * 1', systemd: 'weekly: monday 09:00:00' },
    { value: 'monthly', label: 'Monthly on 1st', cron: '0 0 1 * *', systemd: 'monthly' },
    { value: 'hourly', label: 'Every hour', cron: '0 * * * *', systemd: 'hourly' },
    { value: 'every-15min', label: 'Every 15 minutes', cron: '*/15 * * * *', systemd: 'minutely: 0/15' },
    { value: 'every-5min', label: 'Every 5 minutes', cron: '*/5 * * * *', systemd: 'minutely: 0/5' }
  ];

  const timeUnits = [
    { value: 'seconds', label: 'Seconds', multiplier: 1 },
    { value: 'minutes', label: 'Minutes', multiplier: 60 },
    { value: 'hours', label: 'Hours', multiplier: 3600 }
  ];

  const generateRetryScript = (): string => {
    const selectedSchedule = schedulePresets.find(s => s.value === schedule);
    if (!selectedSchedule) return '';

    const maxRetryDelaySeconds = maxRetryDelay * (timeUnits.find(u => u.value === maxRetryDelayUnit)?.multiplier || 1);
    const initialRetryDelaySeconds = retryDelay * (timeUnits.find(u => u.value === retryDelayUnit)?.multiplier || 1);

    return `#!/bin/bash
# Command Retry Script for ${jobName}
# Generated at: ${new Date().toLocaleString()}

COMMAND="${command}"
MAX_RETRIES=${maxRetries}
INITIAL_DELAY=${initialRetryDelaySeconds}
BACKOFF_MULTIPLIER=${backoffMultiplier}
MAX_DELAY=${maxRetryDelaySeconds}
LOG_FILE="/var/log/${jobName.toLowerCase().replace(/\s+/g, '-')}-retry.log"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Calculate delay with exponential backoff
calculate_delay() {
    local attempt=$1
    local delay=$((INITIAL_DELAY * BACKOFF_MULTIPLIER ** (attempt - 1)))
    
    # Cap delay at maximum
    if [ $delay -gt $MAX_DELAY ]; then
        delay=$MAX_DELAY
    fi
    
    echo $delay
}

log "Starting command execution with retry logic: $COMMAND"
log "Max retries: $MAX_RETRIES, Initial delay: ${initialRetryDelaySeconds}s, Max delay: ${maxRetryDelaySeconds}s"

# Execute command with retries
for attempt in $(seq 1 $((MAX_RETRIES + 1))); do
    log "Attempt $attempt of $((MAX_RETRIES + 1))"
    
    # Execute the command
    if eval "$COMMAND"; then
        log "Command succeeded on attempt $attempt"
        exit 0
    else
        local exit_code=$?
        log "Command failed on attempt $attempt with exit code: $exit_code"
        
        # If this was the last attempt, exit with failure
        if [ $attempt -gt $MAX_RETRIES ]; then
            log "All retry attempts exhausted. Command failed permanently."
            exit $exit_code
        fi
        
        # Calculate delay for next retry
        local delay=$(calculate_delay $attempt)
        log "Waiting ${delay}s before retry ${attempt + 1}"
        sleep $delay
    fi
done

# This should never be reached
log "Unexpected end of retry loop"
exit 1`;
  };

  const generateCronWithRetry = (): string => {
    const selectedSchedule = schedulePresets.find(s => s.value === schedule);
    if (!selectedSchedule) return '';

    const scriptName = `${jobName.toLowerCase().replace(/\s+/g, '-')}-retry.sh`;
    
    return `${selectedSchedule.cron} ${user} /usr/local/bin/${scriptName}`;
  };

  const generateSystemdTimer = (): string => {
    const selectedSchedule = schedulePresets.find(s => s.value === schedule);
    if (!selectedSchedule) return '';

    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    
    return `[Unit]
Description=Timer for ${jobName} with retry logic
Requires=${serviceName}-retry.service

[Timer]
OnCalendar=${selectedSchedule.systemd}
AccuracySec=1m
RandomizedDelaySec=30s
Persistent=true

[Install]
WantedBy=timers.target`;
  };

  const generateSystemdService = (): string => {
    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    
    return `[Unit]
Description=Service for ${jobName} with retry logic
Type=oneshot

[Service]
ExecStart=/usr/local/bin/${serviceName}-retry.sh
User=${user}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target`;
  };

  const getJobExplanation = (): string => {
    const selectedSchedule = schedulePresets.find(s => s.value === schedule);
    if (!selectedSchedule) return '';

    let explanation = `This retry-enabled job "${jobName}" will execute "${command}" ${selectedSchedule.label.toLowerCase()}. `;
    explanation += `If the command fails, it will retry up to ${maxRetries} times with exponential backoff. `;
    
    const initialDelaySeconds = retryDelay * (timeUnits.find(u => u.value === retryDelayUnit)?.multiplier || 1);
    const maxDelaySeconds = maxRetryDelay * (timeUnits.find(u => u.value === maxRetryDelayUnit)?.multiplier || 1);
    
    explanation += `The initial retry delay is ${initialDelaySeconds} seconds, which will be multiplied by ${backoffMultiplier} for each subsequent retry, `;
    explanation += `capped at a maximum of ${maxDelaySeconds} seconds. `;
    explanation += `This approach ensures that temporary failures (network issues, resource constraints) don't permanently prevent job execution.`;
    
    return explanation;
  };

  const handleGenerate = () => {
    if (!jobName.trim() || !command.trim()) return;
    
    const cron = generateCronWithRetry();
    const retryScript = generateRetryScript();
    const timer = generateSystemdTimer();
    const service = generateSystemdService();
    const explanation = getJobExplanation();
    
    setGeneratedCron(cron);
    setGeneratedRetryScript(retryScript);
    setGeneratedSystemdTimer(timer);
    setGeneratedSystemdService(service);
    
    // Add to history
    const newJob: RetryCronJob = {
      id: generateId(),
      jobName: jobName,
      command: command,
      user: user,
      schedule: schedule,
      maxRetries: maxRetries,
      retryDelay: retryDelay,
      retryDelayUnit: retryDelayUnit,
      backoffMultiplier: backoffMultiplier,
      maxRetryDelay: maxRetryDelay,
      maxRetryDelayUnit: maxRetryDelayUnit,
      generatedCron: cron,
      generatedRetryScript: retryScript,
      generatedSystemdTimer: timer,
      generatedSystemdService: service,
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
    setGeneratedCron('');
    setGeneratedRetryScript('');
    setGeneratedSystemdTimer('');
    setGeneratedSystemdService('');
  };

  const validateInputs = (): boolean => {
    return jobName.trim() !== '' && 
           command.trim() !== '' && 
           maxRetries >= 0 && 
           retryDelay > 0 && 
           backoffMultiplier > 0 && 
           maxRetryDelay > 0;
  };

  const getInstallationCommands = (): string => {
    if (!generatedCron || !generatedRetryScript) return '';
    
    const scriptName = `${jobName.toLowerCase().replace(/\s+/g, '-')}-retry.sh`;
    const serviceName = command.split('/').pop()?.replace('.sh', '') || 'service';
    const timerName = `${serviceName}-retry.timer`;
    
    return `# Installation Commands for ${jobName}

# 1. Create the retry script:
sudo tee /usr/local/bin/${scriptName} > /dev/null << 'EOF'
${generatedRetryScript}
EOF

# 2. Make the script executable:
sudo chmod +x /usr/local/bin/${scriptName}

# 3. Create log directory (optional):
sudo mkdir -p /var/log
sudo touch /var/log/${jobName.toLowerCase().replace(/\s+/g, '-')}-retry.log
sudo chown ${user}:${user} /var/log/${jobName.toLowerCase().replace(/\s+/g, '-')}-retry.log

# 4. For Cron installation:
# Add to crontab: crontab -e
# Then add: ${generatedCron}

# 5. For Systemd installation:
sudo cp ${serviceName}-retry.service /etc/systemd/system/
sudo cp ${timerName} /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable ${timerName}
sudo systemctl start ${timerName}

# 6. Check status:
sudo systemctl status ${timerName}
sudo systemctl list-timers
crontab -l

# 7. Monitor logs:
sudo tail -f /var/log/${jobName.toLowerCase().replace(/\s+/g, '-')}-retry.log`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Retry-Enabled Cron Job</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Schedule
              </label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {schedulePresets.map((preset) => (
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Retries
              </label>
              <input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value) || 0)}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Retry Delay
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={retryDelay}
                  onChange={(e) => setRetryDelay(parseInt(e.target.value) || 1)}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={retryDelayUnit}
                  onChange={(e) => setRetryDelayUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backoff Multiplier
              </label>
              <input
                type="number"
                value={backoffMultiplier}
                onChange={(e) => setBackoffMultiplier(parseFloat(e.target.value) || 1)}
                min="1"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Retry Delay
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={maxRetryDelay}
                  onChange={(e) => setMaxRetryDelay(parseInt(e.target.value) || 1)}
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={maxRetryDelayUnit}
                  onChange={(e) => setMaxRetryDelayUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Strategy Preview
                </label>
                <div className="bg-gray-50 p-3 rounded text-xs">
                  {maxRetries > 0 && (
                    <div>
                      <p><strong>Attempt 1:</strong> Immediate execution</p>
                      {Array.from({ length: Math.min(maxRetries, 5) }, (_, i) => {
                        const delay = retryDelay * Math.pow(backoffMultiplier, i);
                        const cappedDelay = Math.min(delay, maxRetryDelay);
                        const unit = cappedDelay === delay ? retryDelayUnit : maxRetryDelayUnit;
                        return (
                          <p key={i + 2}>
                            <strong>Attempt {i + 2}:</strong> Wait {cappedDelay} {unit}
                            {cappedDelay !== delay && ` (capped from ${delay} ${retryDelayUnit})`}
                          </p>
                        );
                      })}
                      {maxRetries > 5 && <p>... and {maxRetries - 5} more attempts</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Retry-Enabled Cron Job
          </button>
        </div>
      </div>

      {/* Generated Results */}
      {generatedCron && generatedRetryScript && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Retry-Enabled Job Overview</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Job Details:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Name:</strong> {jobName}</p>
                  <p><strong>Schedule:</strong> {schedulePresets.find(s => s.value === schedule)?.label}</p>
                  <p><strong>Command:</strong> {command}</p>
                  <p><strong>Max Retries:</strong> {maxRetries}</p>
                  <p><strong>Initial Delay:</strong> {retryDelay} {retryDelayUnit}</p>
                  <p><strong>Backoff Multiplier:</strong> {backoffMultiplier}</p>
                  <p><strong>Max Delay:</strong> {maxRetryDelay} {maxRetryDelayUnit}</p>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded">
                <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
                <p className="text-blue-800 text-sm">
                  {getJobExplanation()}
                </p>
              </div>
            </div>
          </div>

          {/* Cron Implementation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Cron Implementation with Retry Logic</h3>
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
                This cron entry will execute the retry script at the scheduled time. The retry script handles all retry logic.
              </p>
            </div>
          </div>

          {/* Retry Script */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Retry Script</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Retry Script:</span>
                <button
                  onClick={() => copyToClipboard(generatedRetryScript)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Copy Script
                </button>
              </div>
              <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
                <code>{generatedRetryScript}</code>
              </pre>
              <p className="text-sm text-gray-600 mt-2">
                Save this script as <code className="bg-gray-100 px-1 rounded">/usr/local/bin/{jobName.toLowerCase().replace(/\s+/g, '-')}-retry.sh</code> and make it executable.
              </p>
            </div>
          </div>

          {/* Systemd Implementation */}
          <div className="space-y-6">
            {/* Timer File */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Systemd Timer with Retry Logic</h3>
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
                      <p><strong>Schedule:</strong> {schedulePresets.find(s => s.value === job.schedule)?.label}</p>
                      <p><strong>Command:</strong> {job.command}</p>
                      <p><strong>Max Retries:</strong> {job.maxRetries}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Retry Configuration:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Initial Delay:</strong> {job.retryDelay} {job.retryDelayUnit}</p>
                      <p><strong>Backoff Multiplier:</strong> {job.backoffMultiplier}</p>
                      <p><strong>Max Delay:</strong> {job.maxRetryDelay} {job.maxRetryDelayUnit}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{job.explanation}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setJobName(job.jobName);
                      setCommand(job.command);
                      setUser(job.user);
                      setSchedule(job.schedule);
                      setMaxRetries(job.maxRetries);
                      setRetryDelay(job.retryDelay);
                      setRetryDelayUnit(job.retryDelayUnit);
                      setBackoffMultiplier(job.backoffMultiplier);
                      setMaxRetryDelay(job.maxRetryDelay);
                      setMaxRetryDelayUnit(job.maxRetryDelayUnit);
                      setGeneratedCron(job.generatedCron);
                      setGeneratedRetryScript(job.generatedRetryScript);
                      setGeneratedSystemdTimer(job.generatedSystemdTimer);
                      setGeneratedSystemdService(job.generatedSystemdService);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Reload
                  </button>
                  <button
                    onClick={() => copyToClipboard(job.generatedCron)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Copy Cron
                  </button>
                  <button
                    onClick={() => copyToClipboard(job.generatedRetryScript)}
                    className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
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
        <h3 className="text-lg font-semibold mb-4">Best Practices for Retry-Enabled Jobs</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Choose Appropriate Retry Counts</h4>
            <p className="text-gray-700 text-sm">
              Set max retries based on the nature of your command. Network operations might need more retries than local file operations.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Use Exponential Backoff</h4>
            <p className="text-gray-700 text-sm">
              Exponential backoff prevents overwhelming systems that are experiencing temporary issues while still providing quick recovery.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Set Reasonable Delay Caps</h4>
            <p className="text-gray-700 text-sm">
              Cap maximum delays to ensure jobs don't wait too long between retries, which could impact overall system responsiveness.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Monitor and Log Retries</h4>
            <p className="text-gray-700 text-sm">
              Always log retry attempts to understand failure patterns and adjust retry strategies accordingly.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Job</h4>
            <p className="text-sm">Enter the job name, schedule, command, and retry parameters.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Set Retry Strategy</h4>
            <p className="text-sm">Configure retry count, delays, and backoff multiplier for your use case.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Generate Files</h4>
            <p className="text-sm">Click "Generate Retry-Enabled Cron Job" to create all necessary files.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Install and Monitor</h4>
            <p className="text-sm">Use the provided installation commands and monitor logs for retry behavior.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandRetryCronGenerator;
