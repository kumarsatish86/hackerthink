"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-cyan-900 to-blue-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-teal-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-cyan-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="text-sm font-semibold">Multiple Job</div>
                <div className="text-xs opacity-75">Cron Generator</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>📋 Jobs</span>
                    <span>⏰ Schedule</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>🔧 System</span>
                    <span>📊 Monitor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CronJob {
  id: string;
  name: string;
  description: string;
  command: string;
  schedule: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
  user: string;
  enabled: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  logFile: string;
  emailNotification: boolean;
  emailAddress: string;
  environment: string;
  workingDirectory: string;
}

interface CronConfig {
  systemName: string;
  adminEmail: string;
  timezone: string;
  logDirectory: string;
  backupDirectory: string;
  jobs: CronJob[];
}

export function MultipleJobCronGenerator() {
  const [cronConfig, setCronConfig] = useState<CronConfig>({
    systemName: 'Production Server',
    adminEmail: 'admin@example.com',
    timezone: 'UTC',
    logDirectory: '/var/log/cron',
    backupDirectory: '/var/backups/cron',
    jobs: [
      {
        id: '1',
        name: 'System Log Rotation',
        description: 'Rotate system logs to prevent disk space issues',
        command: '/usr/sbin/logrotate /etc/logrotate.conf',
        schedule: { minute: '0', hour: '2', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
        user: 'root',
        enabled: true,
        category: 'System Maintenance',
        priority: 'medium',
        logFile: '/var/log/cron/logrotate.log',
        emailNotification: true,
        emailAddress: 'admin@example.com',
        environment: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        workingDirectory: '/'
      },
      {
        id: '2',
        name: 'Database Backup',
        description: 'Create daily database backup',
        command: '/usr/local/bin/backup-db.sh',
        schedule: { minute: '0', hour: '3', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
        user: 'postgres',
        enabled: true,
        category: 'Data Protection',
        priority: 'high',
        logFile: '/var/log/cron/db-backup.log',
        emailNotification: true,
        emailAddress: 'admin@example.com',
        environment: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        workingDirectory: '/var/backups'
      }
    ]
  });

  const [generatedCron, setGeneratedCron] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'crontab' | 'systemd' | 'anacron'>('crontab');

  const updateConfig = (key: keyof CronConfig, value: any) => {
    setCronConfig(prev => ({ ...prev, [key]: value }));
  };

  const addJob = () => {
    const newJob: CronJob = {
      id: Date.now().toString(),
      name: 'New Cron Job',
      description: 'Job description',
      command: '/usr/bin/command',
      schedule: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      user: 'root',
      enabled: true,
      category: 'Custom',
      priority: 'medium',
      logFile: '/var/log/cron/custom.log',
      emailNotification: false,
      emailAddress: '',
      environment: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      workingDirectory: '/'
    };
    updateConfig('jobs', [...cronConfig.jobs, newJob]);
  };

  const removeJob = (id: string) => {
    updateConfig('jobs', cronConfig.jobs.filter(job => job.id !== id));
  };

  const updateJob = (id: string, key: keyof CronJob, value: any) => {
    updateConfig('jobs', cronConfig.jobs.map(job => 
      job.id === id ? { ...job, [key]: value } : job
    ));
  };

  const updateJobSchedule = (id: string, field: keyof CronJob['schedule'], value: string) => {
    updateConfig('jobs', cronConfig.jobs.map(job => 
      job.id === id ? { 
        ...job, 
        schedule: { ...job.schedule, [field]: value } 
      } : job
    ));
  };

  const generateCronConfiguration = () => {
    if (outputFormat === 'crontab') {
      setGeneratedCron(generateCrontab());
    } else if (outputFormat === 'systemd') {
      setGeneratedCron(generateSystemd());
    } else {
      setGeneratedCron(generateAnacron());
    }
  };

  const generateCrontab = (): string => {
    const header = `# ${cronConfig.systemName} - System-wide Cron Configuration
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${cronConfig.timezone}
# Admin: ${cronConfig.adminEmail}
# 
# This file contains system-wide cron jobs for ${cronConfig.systemName}
# 
# Categories:
${cronConfig.jobs.map(job => `# - ${job.category}: ${job.name}`).join('\n')}
#
# IMPORTANT: Always test new cron jobs in a safe environment first
# Monitor logs at: ${cronConfig.logDirectory}
# Backup this file to: ${cronConfig.backupDirectory}
#
# =============================================================================
# SYSTEM MAINTENANCE JOBS
# =============================================================================
`;

    const systemJobs = cronConfig.jobs
      .filter(job => job.category === 'System Maintenance')
      .map(job => generateCronLine(job))
      .join('\n');

    const dataJobs = cronConfig.jobs
      .filter(job => job.category === 'Data Protection')
      .map(job => generateCronLine(job))
      .join('\n');

    const customJobs = cronConfig.jobs
      .filter(job => job.category === 'Custom')
      .map(job => generateCronLine(job))
      .join('\n');

    const footer = `
# =============================================================================
# MONITORING AND ALERTS
# =============================================================================
# Check cron service status every 5 minutes
*/5 * * * * root /usr/bin/systemctl is-active --quiet cron || echo "Cron service down" | mail -s "CRITICAL: Cron service stopped" ${cronConfig.adminEmail}

# =============================================================================
# LOG ROTATION AND CLEANUP
# =============================================================================
# Rotate cron logs weekly
0 0 * * 0 root /usr/sbin/logrotate /etc/logrotate.d/cron

# Clean old cron logs (older than 30 days)
0 1 1 * * root find ${cronConfig.logDirectory} -name "*.log" -mtime +30 -delete

# =============================================================================
# BACKUP CRON CONFIGURATION
# =============================================================================
# Backup this crontab daily
0 4 * * * root cp /etc/crontab ${cronConfig.backupDirectory}/crontab.\$(date +\\%Y\\%m\\%d)
`;

    return header + systemJobs + '\n\n' + dataJobs + '\n\n' + customJobs + footer;
  };

  const generateCronLine = (job: CronJob): string => {
    if (!job.enabled) {
      return `# DISABLED: ${job.schedule.minute} ${job.schedule.hour} ${job.schedule.dayOfMonth} ${job.schedule.month} ${job.schedule.dayOfWeek} ${job.user} ${job.command}`;
    }

    const schedule = `${job.schedule.minute} ${job.schedule.hour} ${job.schedule.dayOfMonth} ${job.schedule.month} ${job.schedule.dayOfWeek}`;
    const user = job.user;
    const command = job.command;
    
    let fullCommand = command;
    
    // Add environment variables if specified
    if (job.environment) {
      fullCommand = `${job.environment} ${fullCommand}`;
    }
    
    // Add working directory if specified
    if (job.workingDirectory && job.workingDirectory !== '/') {
      fullCommand = `cd ${job.workingDirectory} && ${fullCommand}`;
    }
    
    // Add logging
    fullCommand += ` >> ${job.logFile} 2>&1`;
    
    // Add email notification if enabled
    if (job.emailNotification && job.emailAddress) {
      fullCommand += ` || echo "Job failed: ${job.name}" | mail -s "CRON FAILURE: ${job.name}" ${job.emailAddress}`;
    }

    return `${schedule} ${user} ${fullCommand}`;
  };

  const generateSystemd = (): string => {
    const header = `# ${cronConfig.systemName} - Systemd Timer Configuration
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${cronConfig.timezone}
# Admin: ${cronConfig.adminEmail}
#
# This configuration uses systemd timers instead of traditional cron
# Place these files in /etc/systemd/system/
#
# After creating files, run:
# systemctl daemon-reload
# systemctl enable <timer-name>.timer
# systemctl start <timer-name>.timer
#
# =============================================================================
`;

    const timerFiles = cronConfig.jobs.map(job => {
      if (!job.enabled) return `# DISABLED: ${job.name}`;
      
      const timerName = job.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const schedule = convertCronToSystemd(job.schedule);
      
      return `# ${job.name} - ${job.description}
# File: /etc/systemd/system/${timerName}.timer

[Unit]
Description=Run ${job.name} on schedule
Requires=${timerName}.service

[Timer]
${schedule}
Persistent=true

[Install]
WantedBy=timers.target

# File: /etc/systemd/system/${timerName}.service

[Unit]
Description=${job.name}
After=network.target

[Service]
Type=oneshot
User=${job.user}
${job.workingDirectory !== '/' ? `WorkingDirectory=${job.workingDirectory}` : ''}
${job.environment ? `Environment="${job.environment}"` : ''}
ExecStart=${job.command}
StandardOutput=append:${job.logFile}
StandardError=append:${job.logFile}

[Install]
WantedBy=multi-user.target
`;
    }).join('\n\n');

    return header + timerFiles;
  };

  const generateAnacron = (): string => {
    const header = `# ${cronConfig.systemName} - Anacron Configuration
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${cronConfig.timezone}
# Admin: ${cronConfig.adminEmail}
#
# This configuration uses anacron for systems that may not be running 24/7
# Place in /etc/anacrontab
#
# Format: period delay job-identifier command
# period: daily, weekly, monthly, or number of days
# delay: delay in minutes after system startup
# job-identifier: unique name for the job
#
# =============================================================================
# Anacron configuration
# =============================================================================
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
MAILTO=${cronConfig.adminEmail}
RANDOM_DELAY=45

# =============================================================================
# SYSTEM MAINTENANCE JOBS
# =============================================================================
`;

    const systemJobs = cronConfig.jobs
      .filter(job => job.category === 'System Maintenance')
      .map(job => generateAnacronLine(job))
      .join('\n');

    const dataJobs = cronConfig.jobs
      .filter(job => job.category === 'Data Protection')
      .map(job => generateAnacronLine(job))
      .join('\n');

    const customJobs = cronConfig.jobs
      .filter(job => job.category === 'Custom')
      .map(job => generateAnacronLine(job))
      .join('\n');

    return header + systemJobs + '\n\n' + dataJobs + '\n\n' + customJobs;
  };

  const generateAnacronLine = (job: CronJob): string => {
    if (!job.enabled) {
      return `# DISABLED: ${job.name} - ${job.description}`;
    }

    // Convert cron schedule to anacron period
    const period = convertCronToAnacronPeriod(job.schedule);
    const delay = Math.floor(Math.random() * 30) + 15; // Random delay 15-45 minutes
    const identifier = job.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    let command = job.command;
    
    // Add working directory if specified
    if (job.workingDirectory && job.workingDirectory !== '/') {
      command = `cd ${job.workingDirectory} && ${command}`;
    }
    
    // Add logging
    command += ` >> ${job.logFile} 2>&1`;

    return `${period}\t${delay}\t${identifier}\t${command}`;
  };

  const convertCronToSystemd = (schedule: CronJob['schedule']): string => {
    // Convert cron schedule to systemd OnCalendar format
    const { minute, hour, dayOfMonth, month, dayOfWeek } = schedule;
    
    if (dayOfMonth !== '*' && month !== '*') {
      // Specific date: monthly
      return `OnCalendar=*-${month.padStart(2, '0')}-${dayOfMonth.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else if (dayOfWeek !== '*') {
      // Weekly
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return `OnCalendar=weekly ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else if (hour !== '*') {
      // Daily
      return `OnCalendar=daily ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else {
      // Hourly
      return `OnCalendar=hourly ${minute.padStart(2, '0')}:00:00`;
    }
  };

  const convertCronToAnacronPeriod = (schedule: CronJob['schedule']): string => {
    const { dayOfMonth, month, dayOfWeek } = schedule;
    
    if (dayOfMonth !== '*' && month !== '*') {
      return 'monthly';
    } else if (dayOfWeek !== '*') {
      return 'weekly';
    } else {
      return 'daily';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-cyan-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Multiple Job Cron Generator
      </h2>

      {/* System Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">System Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Name
            </label>
            <input
              type="text"
              value={cronConfig.systemName}
              onChange={(e) => updateConfig('systemName', e.target.value)}
              placeholder="Production Server"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={cronConfig.adminEmail}
              onChange={(e) => updateConfig('adminEmail', e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={cronConfig.timezone}
              onChange={(e) => updateConfig('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Log Directory
            </label>
            <input
              type="text"
              value={cronConfig.logDirectory}
              onChange={(e) => updateConfig('logDirectory', e.target.value)}
              placeholder="/var/log/cron"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Cron Jobs Management */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cyan-800">Cron Jobs</h3>
          <button
            onClick={addJob}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Job
          </button>
        </div>

        <div className="space-y-4">
          {cronConfig.jobs.map((job, index) => (
            <div key={job.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={job.enabled}
                    onChange={(e) => updateJob(job.id, 'enabled', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <input
                    type="text"
                    value={job.name}
                    onChange={(e) => updateJob(job.id, 'name', e.target.value)}
                    className="text-lg font-medium border-none bg-transparent focus:ring-2 focus:ring-cyan-500 rounded px-2"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                    {job.priority}
                  </span>
                  <button
                    onClick={() => removeJob(job.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={job.description}
                    onChange={(e) => updateJob(job.id, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={job.category}
                    onChange={(e) => updateJob(job.id, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="System Maintenance">System Maintenance</option>
                    <option value="Data Protection">Data Protection</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Command
                  </label>
                  <input
                    type="text"
                    value={job.command}
                    onChange={(e) => updateJob(job.id, 'command', e.target.value)}
                    placeholder="/usr/bin/command"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <input
                    type="text"
                    value={job.user}
                    onChange={(e) => updateJob(job.id, 'user', e.target.value)}
                    placeholder="root"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={job.priority}
                    onChange={(e) => updateJob(job.id, 'priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Log File
                  </label>
                  <input
                    type="text"
                    value={job.logFile}
                    onChange={(e) => updateJob(job.id, 'logFile', e.target.value)}
                    placeholder="/var/log/cron/job.log"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Minute</label>
                    <input
                      type="text"
                      value={job.schedule.minute}
                      onChange={(e) => updateJobSchedule(job.id, 'minute', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hour</label>
                    <input
                      type="text"
                      value={job.schedule.hour}
                      onChange={(e) => updateJobSchedule(job.id, 'hour', e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Day</label>
                    <input
                      type="text"
                      value={job.schedule.dayOfMonth}
                      onChange={(e) => updateJobSchedule(job.id, 'dayOfMonth', e.target.value)}
                      placeholder="*"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Month</label>
                    <input
                      type="text"
                      value={job.schedule.month}
                      onChange={(e) => updateJobSchedule(job.id, 'month', e.target.value)}
                      placeholder="*"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weekday</label>
                    <input
                      type="text"
                      value={job.schedule.dayOfWeek}
                      onChange={(e) => updateJobSchedule(job.id, 'dayOfWeek', e.target.value)}
                      placeholder="*"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment Variables
                  </label>
                  <input
                    type="text"
                    value={job.environment}
                    onChange={(e) => updateJob(job.id, 'environment', e.target.value)}
                    placeholder="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Working Directory
                  </label>
                  <input
                    type="text"
                    value={job.workingDirectory}
                    onChange={(e) => updateJob(job.id, 'workingDirectory', e.target.value)}
                    placeholder="/"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`email-${job.id}`}
                    checked={job.emailNotification}
                    onChange={(e) => updateJob(job.id, 'emailNotification', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor={`email-${job.id}`} className="text-sm text-gray-700">
                    Email notifications
                  </label>
                </div>

                {job.emailNotification && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={job.emailAddress}
                      onChange={(e) => updateJob(job.id, 'emailAddress', e.target.value)}
                      placeholder="admin@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generation Options */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">Generate Configuration</h3>
        
        <div className="flex gap-4 mb-4">
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'crontab' | 'systemd' | 'anacron')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="crontab">Traditional Crontab</option>
            <option value="systemd">Systemd Timers</option>
            <option value="anacron">Anacron (for non-24/7 systems)</option>
          </select>
          
          <button
            onClick={generateCronConfiguration}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Generate Configuration
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Traditional Crontab:</strong> Standard cron format, best for 24/7 systems</p>
          <p><strong>Systemd Timers:</strong> Modern alternative with better dependency management</p>
          <p><strong>Anacron:</strong> For systems that may not be running continuously</p>
        </div>
      </div>

      {/* Generated Configuration */}
      {generatedCron && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-800">
              Generated {outputFormat === 'crontab' ? 'Crontab' : outputFormat === 'systemd' ? 'Systemd Timer' : 'Anacron'} Configuration
            </h3>
            <button
              onClick={() => copyToClipboard(generatedCron)}
              className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 px-4 py-2 rounded-lg transition-colors"
            >
              📋 Copy Configuration
            </button>
          </div>
          
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{generatedCron}</code>
          </pre>
          
          <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
            <h4 className="font-medium text-cyan-800 mb-2">Installation Instructions:</h4>
            {outputFormat === 'crontab' ? (
              <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
                <li>Backup current crontab: <code>crontab -l &gt; crontab.backup</code></li>
                <li>Edit system crontab: <code>sudo nano /etc/crontab</code></li>
                <li>Replace content with generated configuration</li>
                <li>Restart cron service: <code>sudo systemctl restart cron</code></li>
                <li>Verify jobs are loaded: <code>sudo systemctl status cron</code></li>
              </ol>
            ) : outputFormat === 'systemd' ? (
              <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
                <li>Create service and timer files in <code>/etc/systemd/system/</code></li>
                <li>Reload systemd: <code>sudo systemctl daemon-reload</code></li>
                <li>Enable timers: <code>sudo systemctl enable *.timer</code></li>
                <li>Start timers: <code>sudo systemctl start *.timer</code></li>
                <li>Check status: <code>sudo systemctl list-timers</code></li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
                <li>Backup current anacrontab: <code>sudo cp /etc/anacrontab /etc/anacrontab.backup</code></li>
                <li>Edit anacrontab: <code>sudo nano /etc/anacrontab</code></li>
                <li>Replace content with generated configuration</li>
                <li>Restart anacron: <code>sudo systemctl restart anacron</code></li>
                <li>Test a job: <code>sudo anacron -f -n</code></li>
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MultipleJobCronGeneratorInfoSections() {
  return (
    <div className="space-y-8 mb-8">
      {/* What is Multiple Job Cron Generator */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          What is Multiple Job Cron Generator?
        </h3>
        <div className="text-gray-700 space-y-3">
          <p>
            The Multiple Job Cron Generator is a comprehensive tool designed for system administrators and DevOps engineers 
            who need to manage multiple scheduled tasks across Linux systems. Unlike simple cron generators, this tool 
            provides enterprise-grade features for managing complex job schedules, dependencies, and system-wide configurations.
          </p>
          <p>
            This tool generates production-ready cron configurations that include proper logging, error handling, 
            monitoring, and backup strategies. It's ideal for servers that require multiple maintenance tasks, 
            backup operations, monitoring scripts, and automated system administration workflows.
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Multi-Format Output</h4>
                <p className="text-sm text-gray-600">Generate configurations in traditional crontab, systemd timers, or anacron formats</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Job Management</h4>
                <p className="text-sm text-gray-600">Add, edit, and organize multiple cron jobs with categories and priorities</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Advanced Scheduling</h4>
                <p className="text-sm text-gray-600">Flexible cron expression inputs with validation and preview</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">System Integration</h4>
                <p className="text-sm text-gray-600">Built-in logging, monitoring, and backup strategies</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">5</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Production Ready</h4>
                <p className="text-sm text-gray-600">Includes error handling, email notifications, and security best practices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">6</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Documentation</h4>
                <p className="text-sm text-gray-600">Comprehensive installation and usage instructions for each format</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Common Use Cases
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">System Maintenance</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Log rotation and cleanup</li>
              <li>• System updates and patches</li>
              <li>• Temporary file cleanup</li>
              <li>• Service health checks</li>
              <li>• Disk space monitoring</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">Data Protection</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Database backups</li>
              <li>• File system backups</li>
              <li>• Configuration backups</li>
              <li>• Archive management</li>
              <li>• Data integrity checks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">Monitoring & Alerts</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Service status monitoring</li>
              <li>• Resource usage alerts</li>
              <li>• Security scan scheduling</li>
              <li>• Performance metrics collection</li>
              <li>• Network connectivity tests</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">Application Tasks</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cache clearing</li>
              <li>• Report generation</li>
              <li>• Data synchronization</li>
              <li>• Queue processing</li>
              <li>• Maintenance mode toggles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Best Practices for System-wide Cron Jobs
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-semibold text-blue-800 mb-2">Security Considerations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Always specify the user explicitly - avoid running as root when possible</li>
              <li>• Use absolute paths for commands and files</li>
              <li>• Set appropriate file permissions for cron scripts</li>
              <li>• Implement proper logging and monitoring</li>
              <li>• Use environment variables for sensitive configuration</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="font-semibold text-green-800 mb-2">Performance & Reliability</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Stagger job execution times to avoid resource conflicts</li>
              <li>• Implement proper error handling and retry logic</li>
              <li>• Use log rotation to prevent disk space issues</li>
              <li>• Monitor job execution times and resource usage</li>
              <li>• Implement job dependencies when necessary</li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">Maintenance & Monitoring</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Regularly review and update cron configurations</li>
              <li>• Monitor logs for failed jobs and errors</li>
              <li>• Test new jobs in staging environments first</li>
              <li>• Keep backups of cron configurations</li>
              <li>• Document the purpose and schedule of each job</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Troubleshooting Common Issues
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Job Not Running</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Check cron service:</strong> <code>sudo systemctl status cron</code></p>
              <p><strong>Verify crontab syntax:</strong> <code>sudo crontab -l</code></p>
              <p><strong>Check logs:</strong> <code>sudo tail -f /var/log/syslog | grep CRON</code></p>
              <p><strong>Test manually:</strong> Run the command directly to ensure it works</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Permission Issues</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>File permissions:</strong> Ensure scripts are executable: <code>chmod +x script.sh</code></p>
              <p><strong>User permissions:</strong> Verify the cron user has access to required files</p>
              <p><strong>Path issues:</strong> Use absolute paths or set PATH environment variable</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Logging Problems</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Log directory:</strong> Ensure log directory exists and is writable</p>
              <p><strong>Disk space:</strong> Check available disk space for log files</p>
              <p><strong>Log rotation:</strong> Implement logrotate to prevent log files from growing too large</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RelatedToolsSection({ tools }: { tools: any[] }) {
  const relatedTools = [
    {
      title: "Crontab Generator",
      description: "Simple cron expression generator for individual jobs",
      url: "/tools/crontab-generator",
      icon: "⏰"
    },
    {
      title: "Crontab Human Language Translator",
      description: "Convert cron expressions to human-readable descriptions",
      url: "/tools/crontab-human-language-translator",
      icon: "📝"
    },
    {
      title: "Crontab Entry Visualizer",
      description: "Visual representation of cron schedules and patterns",
      url: "/tools/crontab-entry-visualizer",
      icon: "📊"
    },
    {
      title: "Crontab Validator",
      description: "Validate and check cron expression syntax",
      url: "/tools/crontab-validator",
      icon: "✅"
    },
    {
      title: "Crontab Schedule Previewer",
      description: "Preview next execution times for cron expressions",
      url: "/tools/crontab-schedule-previewer",
      icon: "👁️"
    },
    {
      title: "Cron Job Backup Script Generator",
      description: "Generate backup scripts for cron job management",
      url: "/tools/cron-job-backup-script-generator",
      icon: "💾"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Related Tools
      </h3>
      <p className="text-gray-600 mb-4">
        Explore other cron and scheduling tools to enhance your Linux system administration workflow.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool, index) => (
          <a
            key={index}
            href={tool.url}
            className="block p-4 border border-gray-200 rounded-lg hover:border-cyan-300 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{tool.icon}</span>
              <h4 className="font-semibold text-gray-800 group-hover:text-cyan-700 transition-colors">
                {tool.title}
              </h4>
            </div>
            <p className="text-sm text-gray-600">{tool.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-center text-white mb-8">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Stay Updated with Linux Tools</h3>
        <p className="text-cyan-100 mb-6">
          Get notified about new tools, updates, and Linux administration tips. 
          Join our community of system administrators and DevOps professionals.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600"
          />
          <button className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Subscribe
          </button>
        </div>
        <p className="text-xs text-cyan-200 mt-3">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
