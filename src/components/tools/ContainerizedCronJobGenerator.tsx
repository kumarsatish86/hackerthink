'use client';
import React, { useState } from 'react';

interface ContainerizedCronJob {
  name: string;
  schedule: string;
  image: string;
  command: string[];
  envVars: { name: string; value: string }[];
  volumes: { hostPath: string; containerPath: string }[];
  resources: {
    cpu: string;
    memory: string;
  };
  restartPolicy: string;
  timezone: string;
  concurrencyPolicy: string;
  successfulJobsHistoryLimit: number;
  failedJobsHistoryLimit: number;
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

export const ContainerizedCronJobGeneratorInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Containerized Cron Job Generation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Containerized Cron Job Generation?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you create cron jobs specifically designed for containerized environments. Generate Kubernetes CronJob manifests, 
          Docker-based cron solutions, and containerized scheduling configurations that work seamlessly with modern container orchestration systems.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Generate Kubernetes CronJob manifests</li>
            <li>Create Docker-based cron solutions</li>
            <li>Configure proper resource limits and volumes</li>
            <li>Handle timezone and scheduling considerations</li>
            <li>Integrate with container orchestration platforms</li>
          </ul>
        </div>
      </div>

      {/* Container Types */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Container Types & Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Docker Containers</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Single container applications</li>
              <li>• Development environments</li>
              <li>• Simple deployment scenarios</li>
              <li>• Local testing and validation</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Kubernetes CronJobs</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Production deployments</li>
              <li>• Multi-container applications</li>
              <li>• Scalable scheduling</li>
              <li>• Enterprise environments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Best Practices for Containerized Cron Jobs</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">1. Resource Management</h4>
            <p className="text-gray-700 text-sm">
              Always set CPU and memory limits to prevent resource exhaustion and ensure fair scheduling across your cluster.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">2. Volume Mounting</h4>
            <p className="text-gray-700 text-sm">
              Use persistent volumes for data that needs to survive container restarts and job completions.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Timezone Handling</h4>
            <p className="text-gray-700 text-sm">
              Configure proper timezone settings to ensure cron jobs run at the expected times in your target environment.
            </p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">4. Restart Policies</h4>
            <p className="text-gray-700 text-sm">
              Choose appropriate restart policies based on your application's requirements and failure handling needs.
            </p>
          </div>
        </div>
      </div>

      {/* Common Use Cases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-orange-900">Common Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Data Processing</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Database backups and maintenance</li>
              <li>• Log aggregation and analysis</li>
              <li>• Data cleanup and archiving</li>
              <li>• ETL pipeline execution</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">System Maintenance</h4>
            <ul className="text-orange-800 text-sm space-y-1">
              <li>• Health checks and monitoring</li>
              <li>• Certificate renewal</li>
              <li>• Cache invalidation</li>
              <li>• Performance optimization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security Considerations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Security Considerations</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Container Security</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Use non-root users when possible</li>
              <li>• Limit container capabilities</li>
              <li>• Scan images for vulnerabilities</li>
              <li>• Implement proper RBAC in Kubernetes</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Secret Management</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Use Kubernetes secrets or external secret managers</li>
              <li>• Avoid hardcoding sensitive information</li>
              <li>• Rotate credentials regularly</li>
              <li>• Implement least privilege access</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Crontab Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Generate cron expressions for scheduled tasks</p>
          <a href="/tools/crontab-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Crontab Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Docker Crontab Template Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Create Docker-based cron job templates</p>
          <a href="/tools/docker-crontab-template-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Docker Crontab Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Systemd Timer Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Generate systemd timer units for modern scheduling</p>
          <a href="/tools/systemd-timer-unit-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Systemd Timer Generator →
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

export const ContainerizedCronJobGenerator: React.FC = () => {
  const [containerType, setContainerType] = useState<'kubernetes' | 'docker'>('kubernetes');
  const [cronJob, setCronJob] = useState<ContainerizedCronJob>({
    name: '',
    schedule: '',
    image: '',
    command: [''],
    envVars: [{ name: '', value: '' }],
    volumes: [{ hostPath: '', containerPath: '' }],
    resources: {
      cpu: '100m',
      memory: '128Mi'
    },
    restartPolicy: 'OnFailure',
    timezone: 'UTC',
    concurrencyPolicy: 'Allow',
    successfulJobsHistoryLimit: 3,
    failedJobsHistoryLimit: 1
  });

  const addCommand = () => {
    setCronJob({
      ...cronJob,
      command: [...cronJob.command, '']
    });
  };

  const removeCommand = (index: number) => {
    setCronJob({
      ...cronJob,
      command: cronJob.command.filter((_, i) => i !== index)
    });
  };

  const updateCommand = (index: number, value: string) => {
    const newCommands = [...cronJob.command];
    newCommands[index] = value;
    setCronJob({
      ...cronJob,
      command: newCommands
    });
  };

  const addEnvVar = () => {
    setCronJob({
      ...cronJob,
      envVars: [...cronJob.envVars, { name: '', value: '' }]
    });
  };

  const removeEnvVar = (index: number) => {
    setCronJob({
      ...cronJob,
      envVars: cronJob.envVars.filter((_, i) => i !== index)
    });
  };

  const updateEnvVar = (index: number, field: 'name' | 'value', value: string) => {
    const newEnvVars = [...cronJob.envVars];
    newEnvVars[index] = { ...newEnvVars[index], [field]: value };
    setCronJob({
      ...cronJob,
      envVars: newEnvVars
    });
  };

  const addVolume = () => {
    setCronJob({
      ...cronJob,
      volumes: [...cronJob.volumes, { hostPath: '', containerPath: '' }]
    });
  };

  const removeVolume = (index: number) => {
    setCronJob({
      ...cronJob,
      volumes: cronJob.volumes.filter((_, i) => i !== index)
    });
  };

  const updateVolume = (index: number, field: 'hostPath' | 'containerPath', value: string) => {
    const newVolumes = [...cronJob.volumes];
    newVolumes[index] = { ...newVolumes[index], [field]: value };
    setCronJob({
      ...cronJob,
      volumes: newVolumes
    });
  };

  const generateKubernetesCronJob = (): string => {
    const envVars = cronJob.envVars
      .filter(env => env.name && env.value)
      .map(env => `        - name: ${env.name}\n          value: "${env.value}"`)
      .join('\n');

    const volumeMounts = cronJob.volumes
      .filter(vol => vol.hostPath && vol.containerPath)
      .map((vol, index) => `        - name: volume-${index}\n          mountPath: ${vol.containerPath}`)
      .join('\n');

    const volumes = cronJob.volumes
      .filter(vol => vol.hostPath && vol.containerPath)
      .map((vol, index) => `      - name: volume-${index}\n        hostPath:\n          path: ${vol.hostPath}`)
      .join('\n');

    return `apiVersion: batch/v1
kind: CronJob
metadata:
  name: ${cronJob.name}
  namespace: default
spec:
  schedule: "${cronJob.schedule}"
  timeZone: "${cronJob.timezone}"
  concurrencyPolicy: ${cronJob.concurrencyPolicy}
  successfulJobsHistoryLimit: ${cronJob.successfulJobsHistoryLimit}
  failedJobsHistoryLimit: ${cronJob.failedJobsHistoryLimit}
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: ${cronJob.restartPolicy}
          containers:
          - name: ${cronJob.name}
            image: ${cronJob.image}
            command: ${JSON.stringify(cronJob.command.filter(cmd => cmd.trim()))}
            ${envVars ? `env:\n${envVars}` : ''}
            ${volumeMounts ? `volumeMounts:\n${volumeMounts}` : ''}
            resources:
              requests:
                cpu: ${cronJob.resources.cpu}
                memory: ${cronJob.resources.memory}
              limits:
                cpu: ${cronJob.resources.cpu}
                memory: ${cronJob.resources.memory}
          ${volumes ? `volumes:\n${volumes}` : ''}`;
  };

  const generateDockerCronJob = (): string => {
    const envVars = cronJob.envVars
      .filter(env => env.name && env.value)
      .map(env => `  -e ${env.name}=${env.value}`)
      .join('\n');

    const volumeMounts = cronJob.volumes
      .filter(vol => vol.hostPath && vol.containerPath)
      .map(vol => `  -v ${vol.hostPath}:${vol.containerPath}`)
      .join('\n');

    const command = cronJob.command.filter(cmd => cmd.trim()).join(' ');

    return `# Docker-based cron job for ${cronJob.name}
# Schedule: ${cronJob.schedule}
# Timezone: ${cronJob.timezone}

# Add to your crontab:
# ${cronJob.schedule} docker run --rm \\

docker run --rm \\
  --name ${cronJob.name}-$(date +%s) \\
  ${envVars}
  ${volumeMounts}
  --memory=${cronJob.resources.memory} \\
  --cpus=${cronJob.resources.cpu} \\
  ${cronJob.image} \\
  ${command}

# Alternative: Create a persistent container
# docker create --name ${cronJob.name}-cron \\
#   ${envVars}
#   ${volumeMounts}
#   --memory=${cronJob.resources.memory} \\
#   --cpus=${cronJob.resources.cpu} \\
#   ${cronJob.image} \\
#   ${command}

# Then add to crontab:
# ${cronJob.schedule} docker start -a ${cronJob.name}-cron`;
  };

  const generateDockerComposeCron = (): string => {
    const envVars = cronJob.envVars
      .filter(env => env.name && env.value)
      .map(env => `      ${env.name}: ${env.value}`)
      .join('\n');

    const volumeMounts = cronJob.volumes
      .filter(vol => vol.hostPath && vol.containerPath)
      .map(vol => `      - ${vol.hostPath}:${vol.containerPath}`)
      .join('\n');

    return `version: '3.8'

services:
  ${cronJob.name}-cron:
    image: ${cronJob.image}
    container_name: ${cronJob.name}-cron
    command: ${JSON.stringify(cronJob.command.filter(cmd => cmd.trim()))}
    environment:
${envVars}
    volumes:
${volumeMounts}
    deploy:
      resources:
        limits:
          cpus: '${cronJob.resources.cpu}'
          memory: ${cronJob.resources.memory}
        reservations:
          cpus: '${cronJob.resources.cpu}'
          memory: ${cronJob.resources.memory}
    restart: ${cronJob.restartPolicy === 'OnFailure' ? 'on-failure' : 'no'}

# Add to crontab:
# ${cronJob.schedule} cd /path/to/docker-compose && docker-compose run --rm ${cronJob.name}-cron`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Container Type Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Container Type</h3>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="kubernetes"
              checked={containerType === 'kubernetes'}
              onChange={(e) => setContainerType(e.target.value as 'kubernetes' | 'docker')}
              className="mr-2"
            />
            <span className="text-gray-700">Kubernetes CronJob</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="docker"
              checked={containerType === 'docker'}
              onChange={(e) => setContainerType(e.target.value as 'kubernetes' | 'docker')}
              className="mr-2"
            />
            <span className="text-gray-700">Docker Container</span>
          </label>
        </div>
      </div>

      {/* Basic Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Basic Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Name
            </label>
            <input
              type="text"
              value={cronJob.name}
              onChange={(e) => setCronJob({...cronJob, name: e.target.value})}
              placeholder="e.g., backup-job, cleanup-task"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cron Schedule
            </label>
            <input
              type="text"
              value={cronJob.schedule}
              onChange={(e) => setCronJob({...cronJob, schedule: e.target.value})}
              placeholder="e.g., 0 2 * * * (daily at 2 AM)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Container Image
            </label>
            <input
              type="text"
              value={cronJob.image}
              onChange={(e) => setCronJob({...cronJob, image: e.target.value})}
              placeholder="e.g., ubuntu:20.04, alpine:latest"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={cronJob.timezone}
              onChange={(e) => setCronJob({...cronJob, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Commands */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Commands</h3>
        <div className="space-y-3">
          {cronJob.command.map((cmd, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={cmd}
                onChange={(e) => updateCommand(index, e.target.value)}
                placeholder="e.g., /bin/bash, /usr/bin/python3"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cronJob.command.length > 1 && (
                <button
                  onClick={() => removeCommand(index)}
                  className="px-3 py-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCommand}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            + Add Command
          </button>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Environment Variables</h3>
        <div className="space-y-3">
          {cronJob.envVars.map((env, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={env.name}
                onChange={(e) => updateEnvVar(index, 'name', e.target.value)}
                placeholder="Variable name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={env.value}
                  onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                  placeholder="Variable value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {cronJob.envVars.length > 1 && (
                  <button
                    onClick={() => removeEnvVar(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addEnvVar}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            + Add Environment Variable
          </button>
        </div>
      </div>

      {/* Volumes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Mounts</h3>
        <div className="space-y-3">
          {cronJob.volumes.map((vol, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="text"
                value={vol.hostPath}
                onChange={(e) => updateVolume(index, 'hostPath', e.target.value)}
                placeholder="Host path"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={vol.containerPath}
                  onChange={(e) => updateVolume(index, 'containerPath', e.target.value)}
                  placeholder="Container path"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {cronJob.volumes.length > 1 && (
                  <button
                    onClick={() => removeVolume(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addVolume}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            + Add Volume Mount
          </button>
        </div>
      </div>

      {/* Advanced Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Advanced Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPU Limit
            </label>
            <input
              type="text"
              value={cronJob.resources.cpu}
              onChange={(e) => setCronJob({
                ...cronJob, 
                resources: { ...cronJob.resources, cpu: e.target.value }
              })}
              placeholder="e.g., 100m, 0.5, 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memory Limit
            </label>
            <input
              type="text"
              value={cronJob.resources.memory}
              onChange={(e) => setCronJob({
                ...cronJob, 
                resources: { ...cronJob.resources, memory: e.target.value }
              })}
              placeholder="e.g., 128Mi, 512Mi, 1Gi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {containerType === 'kubernetes' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concurrency Policy
                </label>
                <select
                  value={cronJob.concurrencyPolicy}
                  onChange={(e) => setCronJob({...cronJob, concurrencyPolicy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Allow">Allow (default)</option>
                  <option value="Forbid">Forbid</option>
                  <option value="Replace">Replace</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restart Policy
                </label>
                <select
                  value={cronJob.restartPolicy}
                  onChange={(e) => setCronJob({...cronJob, restartPolicy: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="OnFailure">OnFailure</option>
                  <option value="Never">Never</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Successful Jobs History Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={cronJob.successfulJobsHistoryLimit}
                  onChange={(e) => setCronJob({...cronJob, successfulJobsHistoryLimit: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Failed Jobs History Limit
                </label>
                <input
                  type="number"
                  min="0"
                  value={cronJob.failedJobsHistoryLimit}
                  onChange={(e) => setCronJob({...cronJob, failedJobsHistoryLimit: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Generated Configurations */}
      <div className="space-y-6">
        {containerType === 'kubernetes' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Kubernetes CronJob</h3>
              <button
                onClick={() => copyToClipboard(generateKubernetesCronJob())}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generateKubernetesCronJob()}</code>
            </pre>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Docker Command</h3>
                <button
                  onClick={() => copyToClipboard(generateDockerCronJob())}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                <code>{generateDockerCronJob()}</code>
              </pre>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Docker Compose</h3>
                <button
                  onClick={() => copyToClipboard(generateDockerComposeCron())}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                <code>{generateDockerComposeCron()}</code>
              </pre>
            </div>
          </>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Your Job</h4>
            <p className="text-sm">Set the basic parameters like name, schedule, and container image.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Add Commands and Environment</h4>
            <p className="text-sm">Specify the commands to run and any environment variables needed.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Configure Volumes and Resources</h4>
            <p className="text-sm">Set up volume mounts and resource limits for your container.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Generate and Deploy</h4>
            <p className="text-sm">Copy the generated configuration and deploy it to your container platform.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerizedCronJobGenerator;
