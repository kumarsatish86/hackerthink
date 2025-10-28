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
                <div className="text-2xl mb-2">🐳</div>
                <div className="text-sm font-semibold">Docker Crontab</div>
                <div className="text-xs opacity-75">Template Generator</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>📦 Container</span>
                    <span>⏰ Schedule</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>🔧 Docker</span>
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

interface DockerCronJob {
  id: string;
  name: string;
  description: string;
  containerName: string;
  image: string;
  command: string;
  schedule: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
  environment: string[];
  volumes: string[];
  network: string;
  restartPolicy: 'no' | 'always' | 'unless-stopped' | 'on-failure';
  enabled: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  logFile: string;
  emailNotification: boolean;
  emailAddress: string;
}

interface DockerCronConfig {
  projectName: string;
  adminEmail: string;
  timezone: string;
  logDirectory: string;
  backupDirectory: string;
  dockerComposeFile: string;
  jobs: DockerCronJob[];
}

export function DockerCrontabTemplateGenerator() {
  const [dockerCronConfig, setDockerCronConfig] = useState<DockerCronConfig>({
    projectName: 'Docker Project',
    adminEmail: 'admin@example.com',
    timezone: 'UTC',
    logDirectory: '/var/log/docker-cron',
    backupDirectory: '/var/backups/docker-cron',
    dockerComposeFile: 'docker-compose.yml',
    jobs: [
      {
        id: '1',
        name: 'Database Backup',
        description: 'Create daily database backup using Docker container',
        containerName: 'db-backup',
        image: 'postgres:15',
        command: '/usr/local/bin/backup-db.sh',
        schedule: { minute: '0', hour: '2', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
        environment: ['POSTGRES_PASSWORD=backup_pass', 'BACKUP_PATH=/backups'],
        volumes: ['/var/backups:/backups', '/etc/postgresql:/etc/postgresql'],
        network: 'default',
        restartPolicy: 'no',
        enabled: true,
        category: 'Data Protection',
        priority: 'high',
        logFile: '/var/log/docker-cron/db-backup.log',
        emailNotification: true,
        emailAddress: 'admin@example.com'
      },
      {
        id: '2',
        name: 'Log Rotation',
        description: 'Rotate Docker container logs',
        containerName: 'log-rotation',
        image: 'alpine:latest',
        command: '/bin/sh -c "find /var/lib/docker/containers -name \"*.log\" -mtime +7 -delete"',
        schedule: { minute: '0', hour: '3', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
        environment: ['LOG_RETENTION_DAYS=7'],
        volumes: ['/var/lib/docker:/var/lib/docker:ro'],
        network: 'host',
        restartPolicy: 'no',
        enabled: true,
        category: 'System Maintenance',
        priority: 'medium',
        logFile: '/var/log/docker-cron/log-rotation.log',
        emailNotification: false,
        emailAddress: ''
      }
    ]
  });

  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'crontab' | 'docker-compose' | 'systemd'>('crontab');

  const updateConfig = (key: keyof DockerCronConfig, value: any) => {
    setDockerCronConfig(prev => ({ ...prev, [key]: value }));
  };

  const addJob = () => {
    const newJob: DockerCronJob = {
      id: Date.now().toString(),
      name: 'New Docker Cron Job',
      description: 'Job description',
      containerName: 'new-job',
      image: 'alpine:latest',
      command: '/bin/sh -c "echo \'Hello World\'"',
      schedule: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      environment: ['ENV_VAR=value'],
      volumes: ['/host/path:/container/path'],
      network: 'default',
      restartPolicy: 'no',
      enabled: true,
      category: 'Custom',
      priority: 'medium',
      logFile: '/var/log/docker-cron/new-job.log',
      emailNotification: false,
      emailAddress: ''
    };
    updateConfig('jobs', [...dockerCronConfig.jobs, newJob]);
  };

  const removeJob = (id: string) => {
    updateConfig('jobs', dockerCronConfig.jobs.filter(job => job.id !== id));
  };

  const updateJob = (id: string, key: keyof DockerCronJob, value: any) => {
    updateConfig('jobs', dockerCronConfig.jobs.map(job => 
      job.id === id ? { ...job, [key]: value } : job
    ));
  };

  const updateJobSchedule = (id: string, field: keyof DockerCronJob['schedule'], value: string) => {
    updateConfig('jobs', dockerCronConfig.jobs.map(job => 
      job.id === id ? { 
        ...job, 
        schedule: { ...job.schedule, [field]: value } 
      } : job
    ));
  };

  const addEnvironmentVariable = (jobId: string) => {
    const variable = prompt('Enter environment variable (e.g., KEY=value):');
    if (variable) {
      updateJob(jobId, 'environment', [...dockerCronConfig.jobs.find(j => j.id === jobId)!.environment, variable]);
    }
  };

  const removeEnvironmentVariable = (jobId: string, index: number) => {
    const job = dockerCronConfig.jobs.find(j => j.id === jobId);
    if (job) {
      const newEnvironment = job.environment.filter((_, i) => i !== index);
      updateJob(jobId, 'environment', newEnvironment);
    }
  };

  const addVolume = (jobId: string) => {
    const volume = prompt('Enter volume mapping (e.g., /host/path:/container/path):');
    if (volume) {
      updateJob(jobId, 'volumes', [...dockerCronConfig.jobs.find(j => j.id === jobId)!.volumes, volume]);
    }
  };

  const removeVolume = (jobId: string, index: number) => {
    const job = dockerCronConfig.jobs.find(j => j.id === jobId);
    if (job) {
      const newVolumes = job.volumes.filter((_, i) => i !== index);
      updateJob(jobId, 'volumes', newVolumes);
    }
  };

  const generateTemplate = () => {
    if (outputFormat === 'crontab') {
      setGeneratedTemplate(generateCrontab());
    } else if (outputFormat === 'docker-compose') {
      setGeneratedTemplate(generateDockerCompose());
    } else {
      setGeneratedTemplate(generateSystemd());
    }
  };

  const generateCrontab = (): string => {
    const header = `# ${dockerCronConfig.projectName} - Docker Cron Configuration
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${dockerCronConfig.timezone}
# Admin: ${dockerCronConfig.adminEmail}
# 
# This file contains Docker-based cron jobs for ${dockerCronConfig.projectName}
# 
# Categories:
${dockerCronConfig.jobs.map(job => `# - ${job.category}: ${job.name}`).join('\n')}
#
# IMPORTANT: Ensure Docker daemon is running before executing these jobs
# Monitor logs at: ${dockerCronConfig.logDirectory}
# Backup this file to: ${dockerCronConfig.backupDirectory}
#
# =============================================================================
# DOCKER CRON JOBS
# =============================================================================
`;

    const systemJobs = dockerCronConfig.jobs
      .filter(job => job.category === 'System Maintenance')
      .map(job => generateDockerCronLine(job))
      .join('\n');

    const dataJobs = dockerCronConfig.jobs
      .filter(job => job.category === 'Data Protection')
      .map(job => generateDockerCronLine(job))
      .join('\n');

    const customJobs = dockerCronConfig.jobs
      .filter(job => job.category === 'Custom')
      .map(job => generateDockerCronLine(job))
      .join('\n');

    const footer = `
# =============================================================================
# DOCKER MONITORING AND ALERTS
# =============================================================================
# Check Docker service status every 5 minutes
*/5 * * * * root /usr/bin/systemctl is-active --quiet docker || echo "Docker service down" | mail -s "CRITICAL: Docker service stopped" ${dockerCronConfig.adminEmail}

# =============================================================================
# DOCKER LOG ROTATION AND CLEANUP
# =============================================================================
# Clean up unused Docker resources weekly
0 0 * * 0 root docker system prune -f --volumes

# Clean old Docker logs (older than 30 days)
0 1 1 * * root find ${dockerCronConfig.logDirectory} -name "*.log" -mtime +30 -delete

# =============================================================================
# BACKUP DOCKER CRON CONFIGURATION
# =============================================================================
# Backup this crontab daily
0 4 * * * root cp /etc/crontab ${dockerCronConfig.backupDirectory}/crontab.\$(date +\\%Y\\%m\\%d)
`;

    return header + systemJobs + '\n\n' + dataJobs + '\n\n' + customJobs + footer;
  };

  const generateDockerCronLine = (job: DockerCronJob): string => {
    if (!job.enabled) {
      return `# DISABLED: ${job.schedule.minute} ${job.schedule.hour} ${job.schedule.dayOfMonth} ${job.schedule.month} ${job.schedule.dayOfWeek} root ${generateDockerRunCommand(job)}`;
    }

    const schedule = `${job.schedule.minute} ${job.schedule.hour} ${job.schedule.dayOfMonth} ${job.schedule.month} ${job.schedule.dayOfWeek}`;
    const dockerCommand = generateDockerRunCommand(job);
    
    let fullCommand = dockerCommand;
    
    // Add logging
    fullCommand += ` >> ${job.logFile} 2>&1`;
    
    // Add email notification if enabled
    if (job.emailNotification && job.emailAddress) {
      fullCommand += ` || echo "Docker job failed: ${job.name}" | mail -s "DOCKER CRON FAILURE: ${job.name}" ${job.emailAddress}`;
    }

    return `${schedule} root ${fullCommand}`;
  };

  const generateDockerRunCommand = (job: DockerCronJob): string => {
    let command = `docker run --rm`;
    
    // Container name
    command += ` --name ${job.containerName}-cron`;
    
    // Environment variables
    job.environment.forEach(env => {
      command += ` -e "${env}"`;
    });
    
    // Volumes
    job.volumes.forEach(volume => {
      command += ` -v "${volume}"`;
    });
    
    // Network
    if (job.network !== 'default') {
      command += ` --network ${job.network}`;
    }
    
    // Restart policy
    if (job.restartPolicy !== 'no') {
      command += ` --restart ${job.restartPolicy}`;
    }
    
    // Image and command
    command += ` ${job.image} ${job.command}`;
    
    return command;
  };

  const generateDockerCompose = (): string => {
    const header = `# ${dockerCronConfig.projectName} - Docker Compose Configuration
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${dockerCronConfig.timezone}
# Admin: ${dockerCronConfig.adminEmail}
#
# This configuration uses Docker Compose for managing cron jobs
# Place in ${dockerCronConfig.dockerComposeFile}
#
# Usage:
# docker-compose up -d <service-name>
# docker-compose logs <service-name>
# docker-compose down <service-name>
#
# =============================================================================
version: '3.8'

services:
`;

    const services = dockerCronConfig.jobs
      .filter(job => job.enabled)
      .map(job => generateDockerComposeService(job))
      .join('\n\n');

    const networks = `
networks:
  default:
    driver: bridge
`;

    return header + services + networks;
  };

  const generateDockerComposeService = (job: DockerCronJob): string => {
    const serviceName = job.containerName;
    
    let service = `  ${serviceName}:
    image: ${job.image}
    container_name: ${job.containerName}
    command: ${job.command}
    restart: ${job.restartPolicy}`;
    
    if (job.environment.length > 0) {
      service += `\n    environment:`;
      job.environment.forEach(env => {
        service += `\n      - ${env}`;
      });
    }
    
    if (job.volumes.length > 0) {
      service += `\n    volumes:`;
      job.volumes.forEach(volume => {
        service += `\n      - ${volume}`;
      });
    }
    
    if (job.network !== 'default') {
      service += `\n    networks:`;
      service += `\n      - ${job.network}`;
    }
    
    service += `\n    labels:`;
    service += `\n      - "cron.job.name=${job.name}"`;
    service += `\n      - "cron.job.category=${job.category}"`;
    service += `\n      - "cron.job.priority=${job.priority}"`;
    service += `\n      - "cron.job.schedule=${job.schedule.minute} ${job.schedule.hour} ${job.schedule.dayOfMonth} ${job.schedule.month} ${job.schedule.dayOfWeek}"`;
    
    return service;
  };

  const generateSystemd = (): string => {
    const header = `# ${dockerCronConfig.projectName} - Systemd Timer Configuration for Docker
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${dockerCronConfig.timezone}
# Admin: ${dockerCronConfig.adminEmail}
#
# This configuration uses systemd timers with Docker commands
# Place these files in /etc/systemd/system/
#
# After creating files, run:
# systemctl daemon-reload
# systemctl enable <timer-name>.timer
# systemctl start <timer-name>.timer
#
# =============================================================================
`;

    const timerFiles = dockerCronConfig.jobs.map(job => {
      if (!job.enabled) return `# DISABLED: ${job.name}`;
      
      const timerName = `${job.containerName}-cron`;
      const schedule = convertCronToSystemd(job.schedule);
      
      return `# ${job.name} - ${job.description}
# File: /etc/systemd/system/${timerName}.timer

[Unit]
Description=Run ${job.name} Docker container on schedule
Requires=${timerName}.service

[Timer]
${schedule}
Persistent=true

[Install]
WantedBy=timers.target

# File: /etc/systemd/system/${timerName}.service

[Unit]
Description=${job.name} Docker Cron Job
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=${generateDockerRunCommand(job)}
StandardOutput=append:${job.logFile}
StandardError=append:${job.logFile}
User=root

[Install]
WantedBy=multi-user.target
`;
    }).join('\n\n');

    return header + timerFiles;
  };

  const convertCronToSystemd = (schedule: DockerCronJob['schedule']): string => {
    const { minute, hour, dayOfMonth, month, dayOfWeek } = schedule;
    
    if (dayOfMonth !== '*' && month !== '*') {
      return `OnCalendar=*-${month.padStart(2, '0')}-${dayOfMonth.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else if (dayOfWeek !== '*') {
      return `OnCalendar=weekly ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else if (hour !== '*') {
      return `OnCalendar=daily ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    } else {
      return `OnCalendar=hourly ${minute.padStart(2, '0')}:00:00`;
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
        Docker Crontab Template Generator
      </h2>

      {/* Project Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">Project Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={dockerCronConfig.projectName}
              onChange={(e) => updateConfig('projectName', e.target.value)}
              placeholder="Docker Project"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email
            </label>
            <input
              type="email"
              value={dockerCronConfig.adminEmail}
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
              value={dockerCronConfig.timezone}
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
              Docker Compose File
            </label>
            <input
              type="text"
              value={dockerCronConfig.dockerComposeFile}
              onChange={(e) => updateConfig('dockerComposeFile', e.target.value)}
              placeholder="docker-compose.yml"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Docker Cron Jobs Management */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-cyan-800">Docker Cron Jobs</h3>
          <button
            onClick={addJob}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add Job
          </button>
        </div>

        <div className="space-y-4">
          {dockerCronConfig.jobs.map((job, index) => (
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
                    Container Name
                  </label>
                  <input
                    type="text"
                    value={job.containerName}
                    onChange={(e) => updateJob(job.id, 'containerName', e.target.value)}
                    placeholder="my-container"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Docker Image
                  </label>
                  <input
                    type="text"
                    value={job.image}
                    onChange={(e) => updateJob(job.id, 'image', e.target.value)}
                    placeholder="alpine:latest"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Command
                  </label>
                  <input
                    type="text"
                    value={job.command}
                    onChange={(e) => updateJob(job.id, 'command', e.target.value)}
                    placeholder="/bin/sh -c 'echo Hello World'"
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
              </div>

              {/* Docker-specific Options */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Network
                  </label>
                  <input
                    type="text"
                    value={job.network}
                    onChange={(e) => updateJob(job.id, 'network', e.target.value)}
                    placeholder="default"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restart Policy
                  </label>
                  <select
                    value={job.restartPolicy}
                    onChange={(e) => updateJob(job.id, 'restartPolicy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="no">No restart</option>
                    <option value="always">Always</option>
                    <option value="unless-stopped">Unless stopped</option>
                    <option value="on-failure">On failure</option>
                  </select>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment Variables
                </label>
                <div className="space-y-2">
                  {job.environment.map((env, envIndex) => (
                    <div key={envIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={env}
                        onChange={(e) => {
                          const newEnv = [...job.environment];
                          newEnv[envIndex] = e.target.value;
                          updateJob(job.id, 'environment', newEnv);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeEnvironmentVariable(job.id, envIndex)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addEnvironmentVariable(job.id)}
                    className="px-3 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg transition-colors"
                  >
                    + Add Environment Variable
                  </button>
                </div>
              </div>

              {/* Volumes */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Mappings
                </label>
                <div className="space-y-2">
                  {job.volumes.map((volume, volIndex) => (
                    <div key={volIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={volume}
                        onChange={(e) => {
                          const newVolumes = [...job.volumes];
                          newVolumes[volIndex] = e.target.value;
                          updateJob(job.id, 'volumes', newVolumes);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => removeVolume(job.id, volIndex)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addVolume(job.id)}
                    className="px-3 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg transition-colors"
                  >
                    + Add Volume Mapping
                  </button>
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
                    Log File
                  </label>
                  <input
                    type="text"
                    value={job.logFile}
                    onChange={(e) => updateJob(job.id, 'logFile', e.target.value)}
                    placeholder="/var/log/docker-cron/job.log"
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
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">Generate Template</h3>
        
        <div className="flex gap-4 mb-4">
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'crontab' | 'docker-compose' | 'systemd')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="crontab">Traditional Crontab</option>
            <option value="docker-compose">Docker Compose</option>
            <option value="systemd">Systemd Timers</option>
          </select>
          
          <button
            onClick={generateTemplate}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Generate Template
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Traditional Crontab:</strong> Standard cron format with Docker run commands</p>
          <p><strong>Docker Compose:</strong> Complete docker-compose.yml configuration</p>
          <p><strong>Systemd Timers:</strong> Modern systemd timer configuration with Docker commands</p>
        </div>
      </div>

      {/* Generated Template */}
      {generatedTemplate && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-800">
              Generated {outputFormat === 'crontab' ? 'Crontab' : outputFormat === 'docker-compose' ? 'Docker Compose' : 'Systemd Timer'} Template
            </h3>
            <button
              onClick={() => copyToClipboard(generatedTemplate)}
              className="bg-cyan-100 hover:bg-cyan-200 text-cyan-800 px-4 py-2 rounded-lg transition-colors"
            >
              📋 Copy Template
            </button>
          </div>
          
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{generatedTemplate}</code>
          </pre>
          
          <div className="mt-4 p-4 bg-cyan-50 rounded-lg">
            <h4 className="font-medium text-cyan-800 mb-2">Installation Instructions:</h4>
            {outputFormat === 'crontab' ? (
              <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
                <li>Ensure Docker daemon is running: <code>sudo systemctl status docker</code></li>
                <li>Backup current crontab: <code>crontab -l &gt; crontab.backup</code></li>
                <li>Edit system crontab: <code>sudo nano /etc/crontab</code></li>
                <li>Replace content with generated configuration</li>
                <li>Restart cron service: <code>sudo systemctl restart cron</code></li>
              </ol>
            ) : outputFormat === 'docker-compose' ? (
              <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
                <li>Save the generated configuration to <code>docker-compose.yml</code></li>
                <li>Create log directory: <code>sudo mkdir -p ${dockerCronConfig.logDirectory}</code></li>
                <li>Test configuration: <code>docker-compose config</code></li>
                <li>Run services: <code>docker-compose up -d</code></li>
                <li>Check logs: <code>docker-compose logs</code></li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside text-cyan-700 text-sm space-y-1">
                <li>Create service and timer files in <code>/etc/systemd/system/</code></li>
                <li>Ensure Docker daemon is running</li>
                <li>Reload systemd: <code>sudo systemctl daemon-reload</code></li>
                <li>Enable timers: <code>sudo systemctl enable *.timer</code></li>
                <li>Start timers: <code>sudo systemctl start *.timer</code></li>
              </ol>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function DockerCrontabTemplateGeneratorInfoSections() {
  return (
    <div className="space-y-8 mb-8">
      {/* What is Docker Crontab Template Generator */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-cyan-800 mb-4 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          What is Docker Crontab Template Generator?
        </h3>
        <div className="text-gray-700 space-y-3">
          <p>
            The Docker Crontab Template Generator is a specialized tool designed for DevOps engineers and system administrators 
            who need to schedule Docker containers to run at specific intervals. This tool bridges the gap between traditional 
            cron scheduling and modern containerized environments, providing production-ready templates for Docker-based cron jobs.
          </p>
          <p>
            Unlike traditional cron generators, this tool understands Docker-specific concepts like container images, volume 
            mappings, environment variables, networks, and restart policies. It generates configurations that are optimized 
            for containerized environments while maintaining the reliability and flexibility of traditional cron scheduling.
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
                <h4 className="font-semibold text-gray-800">Docker-Native Design</h4>
                <p className="text-sm text-gray-600">Built specifically for Docker containers with proper volume mappings, networks, and restart policies</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Multi-Format Output</h4>
                <p className="text-sm text-gray-600">Generate crontab, Docker Compose, or systemd timer configurations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Container Management</h4>
                <p className="text-sm text-gray-600">Manage multiple Docker containers with different schedules and configurations</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Environment Variables</h4>
                <p className="text-sm text-gray-600">Configure container environment variables for different deployment scenarios</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">5</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Volume Management</h4>
                <p className="text-sm text-gray-600">Configure persistent storage and data sharing between host and containers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-sm font-bold">6</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Production Ready</h4>
                <p className="text-sm text-gray-600">Includes logging, monitoring, and error handling for production environments</p>
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
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">Data Operations</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Database backups and maintenance</li>
              <li>• File synchronization and archiving</li>
              <li>• Data cleanup and optimization</li>
              <li>• Backup verification and testing</li>
              <li>• Data migration tasks</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">System Maintenance</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Container log rotation</li>
              <li>• Docker system cleanup</li>
              <li>• Image updates and pruning</li>
              <li>• Health checks and monitoring</li>
              <li>• Security scans and updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">Application Tasks</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Cache clearing and warming</li>
              <li>• Report generation</li>
              <li>• Queue processing</li>
              <li>• API health monitoring</li>
              <li>• Performance testing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-cyan-700">DevOps Workflows</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automated deployments</li>
              <li>• Infrastructure testing</li>
              <li>• Configuration validation</li>
              <li>• Service discovery</li>
              <li>• Load balancing updates</li>
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
          Best Practices for Docker Cron Jobs
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <h4 className="font-semibold text-blue-800 mb-2">Container Design</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use lightweight base images (Alpine, distroless) when possible</li>
              <li>• Implement proper health checks for long-running containers</li>
              <li>• Use multi-stage builds to reduce image size</li>
              <li>• Set appropriate resource limits (CPU, memory)</li>
              <li>• Use non-root users when security is critical</li>
            </ul>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
            <h4 className="font-semibold text-green-800 mb-2">Scheduling & Reliability</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Stagger job execution times to avoid resource conflicts</li>
              <li>• Use appropriate restart policies for different job types</li>
              <li>• Implement proper error handling and retry logic</li>
              <li>• Monitor container resource usage and performance</li>
              <li>• Use persistent volumes for data that needs to survive container restarts</li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">Security & Monitoring</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Regularly update base images and dependencies</li>
              <li>• Scan images for vulnerabilities before deployment</li>
              <li>• Implement proper logging and monitoring</li>
              <li>• Use secrets management for sensitive data</li>
              <li>• Monitor container logs for errors and performance issues</li>
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
            <h4 className="font-semibold text-gray-800 mb-2">Container Not Starting</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Check Docker daemon:</strong> <code>sudo systemctl status docker</code></p>
              <p><strong>Verify image exists:</strong> <code>docker images | grep image-name</code></p>
              <p><strong>Check container logs:</strong> <code>docker logs container-name</code></p>
              <p><strong>Test manually:</strong> <code>docker run --rm image-name command</code></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Permission Issues</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Volume permissions:</strong> Ensure host directories have correct permissions</p>
              <p><strong>User mapping:</strong> Use appropriate user IDs for container processes</p>
              <p><strong>SELinux:</strong> Check if SELinux is blocking access to mounted volumes</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Resource Issues</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Disk space:</strong> <code>docker system df</code> to check space usage</p>
              <p><strong>Memory limits:</strong> Set appropriate memory limits for containers</p>
              <p><strong>Network issues:</strong> Check Docker network configuration and firewall rules</p>
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
      title: "Multiple Job Cron Generator",
      description: "Generate system-wide cron configurations for multiple jobs",
      url: "/tools/multiple-job-cron-generator",
      icon: "⚙️"
    },
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
        Explore other cron and scheduling tools to enhance your Linux system administration and DevOps workflow.
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
