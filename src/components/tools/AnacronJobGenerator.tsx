'use client';
import React, { useState } from 'react';
interface AnacronJob {
  period: string;
  delay: number;
  identifier: string;
  command: string;
  description: string;
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

export const AnacronJobGeneratorInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Anacron */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Anacron?</h3>
        <p className="text-gray-700 mb-4">
          Anacron is a Linux utility that runs commands at specified intervals, regardless of when the system was last running. 
          Unlike cron, which requires the system to be running at the exact time specified, anacron ensures that missed jobs 
          are executed when the system comes back online.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Runs missed jobs when the system is back online</li>
            <li>Perfect for laptops and systems that aren't always running</li>
            <li>Simple configuration format</li>
            <li>Built-in delay mechanism to prevent system overload</li>
          </ul>
        </div>
      </div>

      {/* Anacrontab Format */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">Anacrontab Format</h3>
        <p className="text-gray-700 mb-4">
          The anacrontab file uses a simple format with four fields separated by tabs or spaces:
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <code className="text-green-800 font-mono">
            period delay job-identifier command
          </code>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center">
            <span className="font-medium text-green-800 w-24">period:</span>
            <span className="text-gray-700">daily, weekly, or monthly</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-green-800 w-24">delay:</span>
            <span className="text-gray-700">delay in minutes before executing the job</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-green-800 w-24">identifier:</span>
            <span className="text-gray-700">unique name for the job</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-green-800 w-24">command:</span>
            <span className="text-gray-700">the command or script to execute</span>
          </div>
        </div>
      </div>

      {/* Common Use Cases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">Common Use Cases</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Daily Tasks</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• System backups</li>
              <li>• Log rotation</li>
              <li>• Security updates</li>
              <li>• Disk cleanup</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Weekly Tasks</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Full system backup</li>
              <li>• Package updates</li>
              <li>• Performance monitoring</li>
              <li>• Security scans</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Monthly Tasks</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• System maintenance</li>
              <li>• Archive old logs</li>
              <li>• Update documentation</li>
              <li>• Performance reports</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">System Administration</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• User management</li>
              <li>• Disk space monitoring</li>
              <li>• Service health checks</li>
              <li>• Configuration backups</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-orange-900">Best Practices</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">1. Use Descriptive Identifiers</h4>
            <p className="text-gray-700 text-sm">
              Choose clear, descriptive names for your jobs that indicate their purpose and frequency.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">2. Set Appropriate Delays</h4>
            <p className="text-gray-700 text-sm">
              Use delays to prevent multiple jobs from running simultaneously and overwhelming the system.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">3. Test Commands First</h4>
            <p className="text-gray-700 text-sm">
              Always test your commands manually before adding them to anacron to ensure they work correctly.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Use Absolute Paths</h4>
            <p className="text-gray-700 text-sm">
              Use absolute paths for commands and scripts to avoid path-related issues.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">5. Monitor Job Execution</h4>
            <p className="text-gray-700 text-sm">
              Check anacron logs regularly to ensure jobs are executing as expected.
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-900">Troubleshooting</h3>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Common Issues</h4>
            <div className="space-y-2 text-red-800 text-sm">
              <div>
                <strong>Jobs not running:</strong> Check if anacron service is enabled and running
              </div>
              <div>
                <strong>Permission denied:</strong> Ensure commands have proper execute permissions
              </div>
              <div>
                <strong>Path not found:</strong> Use absolute paths for all commands
              </div>
              <div>
                <strong>Jobs running multiple times:</strong> Check for duplicate entries in anacrontab
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Useful Commands</h4>
            <div className="space-y-2 text-blue-800 text-sm">
              <div>
                <code className="bg-blue-100 px-2 py-1 rounded">sudo systemctl status anacron</code>
                <span className="ml-2">- Check anacron service status</span>
              </div>
              <div>
                <code className="bg-blue-100 px-2 py-1 rounded">sudo journalctl -u anacron</code>
                <span className="ml-2">- View anacron logs</span>
              </div>
              <div>
                <code className="bg-blue-100 px-2 py-1 rounded">sudo anacron -T</code>
                <span className="ml-2">- Test anacron configuration</span>
              </div>
              <div>
                <code className="bg-blue-100 px-2 py-1 rounded">sudo anacron -f</code>
                <span className="ml-2">- Force execution of all jobs</span>
              </div>
            </div>
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
          <h4 className="font-medium text-blue-900 mb-2">Crontab Validator</h4>
          <p className="text-gray-600 text-sm mb-3">Validate cron expressions and check syntax</p>
          <a href="/tools/crontab-validator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Crontab Validator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Crontab Entry Visualizer</h4>
          <p className="text-gray-600 text-sm mb-3">Visualize cron expressions with interactive diagrams</p>
          <a href="/tools/crontab-entry-visualizer" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Crontab Visualizer →
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

export const AnacronJobGenerator: React.FC = () => {
  const [jobs, setJobs] = useState<AnacronJob[]>([]);
  const [newJob, setNewJob] = useState<Omit<AnacronJob, 'identifier'>>({
    period: 'daily',
    delay: 1,
    command: '',
    description: ''
  });

  const generateIdentifier = (period: string, command: string): string => {
    const base = command.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    return `${period}_${base}`;
  };

  const addJob = () => {
    if (!newJob.command.trim()) return;
    
    const identifier = generateIdentifier(newJob.period, newJob.command);
    const job: AnacronJob = {
      ...newJob,
      identifier
    };
    
    setJobs([...jobs, job]);
    setNewJob({
      period: 'daily',
      delay: 1,
      command: '',
      description: ''
    });
  };

  const removeJob = (index: number) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  const generateAnacrontab = (): string => {
    if (jobs.length === 0) return '';
    
    const header = `# Anacron configuration file
# Generated by LinuxConcept Anacron Job Generator
# Format: period delay job-identifier command

`;
    
    const jobLines = jobs.map(job => 
      `${job.period}\t${job.delay}\t${job.identifier}\t${job.command}`
    ).join('\n');
    
    return header + jobLines;
  };

  const generateSystemdTimer = (job: AnacronJob): string => {
    const timerName = `${job.identifier}.timer`;
    const serviceName = `${job.identifier}.service`;
    
    return `# ${timerName}
[Unit]
Description=Timer for ${job.description || job.identifier}
Requires=${serviceName}

[Timer]
${job.period === 'daily' ? 'OnCalendar=daily' : 
  job.period === 'weekly' ? 'OnCalendar=weekly' : 
  'OnCalendar=monthly'}
Persistent=true

[Install]
WantedBy=timers.target

# ${serviceName}
[Unit]
Description=${job.description || job.identifier}
Type=oneshot

[Service]
ExecStart=${job.command}
User=root

[Install]
WantedBy=multi-user.target`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Job Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Add New Anacron Job</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={newJob.period}
              onChange={(e) => setNewJob({...newJob, period: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delay (minutes)
            </label>
            <input
              type="number"
              min="1"
              value={newJob.delay}
              onChange={(e) => setNewJob({...newJob, delay: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Command
            </label>
            <input
              type="text"
              value={newJob.command}
              onChange={(e) => setNewJob({...newJob, command: e.target.value})}
              placeholder="e.g., /usr/bin/backup-script.sh"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <input
              type="text"
              value={newJob.description}
              onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              placeholder="e.g., Daily backup of user data"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={addJob}
          disabled={!newJob.command.trim()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Job
        </button>
      </div>

      {/* Jobs List */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Configured Jobs</h3>
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mr-2">
                      {job.period}
                    </span>
                    <span className="text-sm text-gray-600">
                      Delay: {job.delay} min
                    </span>
                  </div>
                  <button
                    onClick={() => removeJob(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{job.identifier}</p>
                  <p className="text-gray-600">{job.command}</p>
                  {job.description && (
                    <p className="text-gray-500 italic">{job.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Anacrontab */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Anacrontab</h3>
            <button
              onClick={() => copyToClipboard(generateAnacrontab())}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Copy
            </button>
          </div>
          <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
            <code>{generateAnacrontab()}</code>
          </pre>
        </div>
      )}

      {/* Systemd Timer Alternative */}
      {jobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Systemd Timer Alternative</h3>
          <p className="text-gray-600 mb-4">
            For systems using systemd instead of anacron, here are the equivalent timer configurations:
          </p>
          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{job.identifier}</h4>
                  <button
                    onClick={() => copyToClipboard(generateSystemdTimer(job))}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Copy
                  </button>
                </div>
                <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-xs">
                  <code>{generateSystemdTimer(job)}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Install Anacron</h4>
            <p className="text-sm">Most Linux distributions include anacron by default. If not:</p>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              sudo apt-get install anacron  # Ubuntu/Debian<br/>
              sudo yum install anacron      # CentOS/RHEL
            </code>
          </div>
          
          <div>
            <h4 className="font-medium">2. Configure Anacron</h4>
            <p className="text-sm">Copy the generated anacrontab to:</p>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              /etc/anacrontab
            </code>
          </div>
          
          <div>
            <h4 className="font-medium">3. Start Anacron Service</h4>
            <code className="block bg-blue-100 p-2 rounded text-sm mt-1">
              sudo systemctl enable anacron<br/>
              sudo systemctl start anacron
            </code>
          </div>
          
          <div>
            <h4 className="font-medium">4. Alternative: Use Systemd Timers</h4>
            <p className="text-sm">For modern systems, you can use the generated systemd timer files instead of anacron.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnacronJobGenerator;
