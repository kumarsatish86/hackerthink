"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 to-teal-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-teal-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-cyan-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">💾</div>
                <div className="text-sm font-semibold">Custom Time-Based</div>
                <div className="text-xs opacity-75">Backup Cron Builder</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>⏰ Schedule</span>
                    <span>🔄 Retention</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>📁 Source</span>
                    <span>🎯 Target</span>
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

export function CustomTimeBasedBackupCronBuilder() {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-emerald-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#059669" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Custom Time-Based Backup Cron Builder
      </h2>
      
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🚧</div>
        <p className="text-lg">Component under construction</p>
        <p className="text-sm">This tool is being built with comprehensive backup functionality</p>
      </div>
    </div>
  );
}

export function CustomTimeBasedBackupCronBuilderInfoSections() {
  return (
    <div className="space-y-8 mb-8">
      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#059669" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Key Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">⏰</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Time-Based Scheduling</h4>
                <p className="text-gray-600 text-sm">Flexible cron scheduling for different backup frequencies and time windows</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">🔄</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Multiple Backup Types</h4>
                <p className="text-gray-600 text-sm">Support for rsync, tar, full, incremental, and differential backup strategies</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">🗂️</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Retention Policies</h4>
                <p className="text-gray-600 text-sm">Configurable retention rules for days, weeks, months, and years</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">🔧</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Pre/Post Scripts</h4>
                <p className="text-gray-600 text-sm">Execute custom scripts before and after backup operations</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">📧</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                <p className="text-gray-600 text-sm">Get notified of backup success or failure via email</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 text-lg">💾</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Compression & Encryption</h4>
                <p className="text-gray-600 text-sm">Built-in compression options and encryption support for secure backups</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6">Common Use Cases</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="text-3xl mb-3">🏢</div>
            <h4 className="font-semibold text-blue-800 mb-2">Enterprise Systems</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Database backups</li>
              <li>• File server replication</li>
              <li>• Application data protection</li>
              <li>• Disaster recovery planning</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="text-3xl mb-3">🌐</div>
            <h4 className="font-semibold text-green-800 mb-2">Web Applications</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Website content backup</li>
              <li>• User uploads protection</li>
              <li>• Configuration files</li>
              <li>• SSL certificates</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="text-3xl mb-3">🖥️</div>
            <h4 className="font-semibold text-orange-800 mb-2">Personal Systems</h4>
            <ul className="text-orange-700 text-sm space-y-1">
              <li>• Home directory backup</li>
              <li>• Media file protection</li>
              <li>• Document preservation</li>
              <li>• System configuration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6">Best Practices</h3>
        
        <div className="space-y-6">
          <div className="border-l-4 border-emerald-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Backup Strategy</h4>
            <p className="text-gray-600 text-sm">Use a combination of full, incremental, and differential backups. Full backups weekly, incremental daily, and differential backups for critical data.</p>
          </div>
          
          <div className="border-l-4 border-emerald-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Retention Planning</h4>
            <p className="text-gray-600 text-sm">Implement the 3-2-1 rule: 3 copies, 2 different media types, 1 off-site location. Adjust retention based on data criticality and compliance requirements.</p>
          </div>
          
          <div className="border-l-4 border-emerald-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Testing & Validation</h4>
            <p className="text-gray-600 text-sm">Regularly test backup restoration procedures. Verify backup integrity and ensure recovery time objectives (RTO) are met.</p>
          </div>
          
          <div className="border-l-4 border-emerald-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Monitoring & Alerts</h4>
            <p className="text-gray-600 text-sm">Set up comprehensive monitoring for backup jobs. Use email notifications and log monitoring to track backup success and failures.</p>
          </div>
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-emerald-800 mb-6">Technical Details</h3>
        
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm mb-6">
          <div className="text-white mb-2"># Backup Types:</div>
          <div># rsync - Incremental file synchronization with delta transfer</div>
          <div># tar - Archive creation with compression options</div>
          <div># full - Complete directory copy</div>
          <div># incremental - Changes since last backup</div>
          <div># differential - Changes since last full backup</div>
          <div className="mt-2 text-yellow-400"># Examples:</div>
          <div># rsync -avz --delete /source/ /backup/$(date +%Y%m%d_%H%M)/</div>
          <div># tar -czf backup_$(date +%Y%m%d_%H%M).tar.gz -C /source .</div>
          <div># cp -r /source /backup/full_$(date +%Y%m%d_%H%M)</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Retention Variables</h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><code className="bg-gray-100 px-2 py-1 rounded">keepDays</code> - Number of daily backups to retain</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">keepWeeks</code> - Number of weekly backups to retain</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">keepMonths</code> - Number of monthly backups to retain</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">keepYears</code> - Number of yearly backups to retain</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Compression Options</h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><code className="bg-gray-100 px-2 py-1 rounded">gzip</code> - Fast compression, moderate ratio</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">bzip2</code> - Better compression, slower</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">xz</code> - Best compression, slowest</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">none</code> - No compression</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RelatedToolsSection({ tools }: { tools: any[] }) {
  const relatedTools = [
    {
      name: "Crontab Generator",
      description: "Simple cron expression generator with common patterns",
      url: "/tools/crontab-generator",
      icon: "⏰"
    },
    {
      name: "Crontab GUI Designer",
      description: "Visual designer for creating and managing cron jobs",
      url: "/tools/crontab-gui-designer",
      icon: "🎨"
    },
    {
      name: "Cron Job Backup Script Generator",
      description: "Generate backup scripts for cron job management",
      url: "/tools/cron-job-backup-script-generator",
      icon: "💾"
    },
    {
      name: "Docker Crontab Template Generator",
      description: "Generate Docker-based cron job configurations",
      url: "/tools/docker-crontab-template-generator",
      icon: "🐳"
    },
    {
      name: "Crontab Schedule Previewer",
      description: "Preview next execution times for cron expressions",
      url: "/tools/crontab-schedule-previewer",
      icon: "👁️"
    },
    {
      name: "Crontab Validator",
      description: "Validate cron syntax and check for common errors",
      url: "/tools/crontab-validator",
      icon: "✅"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h3 className="text-2xl font-bold text-emerald-800 mb-6">Related Tools</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedTools.map((tool, index) => (
          <a
            key={index}
            href={tool.url}
            className="block p-6 border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
              {tool.name}
            </h4>
            <p className="text-gray-600 text-sm">{tool.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg p-8 text-center text-white mb-8">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Stay Updated with Linux Tools</h3>
        <p className="text-emerald-100 mb-6">
          Get notified about new tools, updates, and Linux administration tips. Join our community of system administrators and developers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
          />
          <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
            Subscribe
          </button>
        </div>
        
        <p className="text-emerald-200 text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
