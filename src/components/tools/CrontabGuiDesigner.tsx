"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-indigo-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-pink-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-purple-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">🎨</div>
                <div className="text-sm font-semibold">Crontab GUI</div>
                <div className="text-xs opacity-75">Visual Designer</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>⏰ Schedule</span>
                    <span>🖱️ Drag & Drop</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>🎯 Visual</span>
                    <span>📝 Export</span>
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

interface CrontabJob {
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
  enabled: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  logFile: string;
  emailNotification: boolean;
  emailAddress: string;
  tags: string[];
}

interface CrontabProject {
  name: string;
  description: string;
  timezone: string;
  jobs: CrontabJob[];
  categories: string[];
  tags: string[];
}

export function CrontabGuiDesigner() {
  const [project, setProject] = useState<CrontabProject>({
    name: 'My Crontab Project',
    description: 'A collection of scheduled tasks',
    timezone: 'UTC',
    jobs: [],
    categories: ['System', 'Backup', 'Monitoring', 'Custom'],
    tags: ['daily', 'weekly', 'monthly', 'critical']
  });

  const [selectedJob, setSelectedJob] = useState<CrontabJob | null>(null);
  const [viewMode, setViewMode] = useState<'design' | 'preview' | 'export'>('design');
  const [dragSource, setDragSource] = useState<string | null>(null);

  const addJob = () => {
    const newJob: CrontabJob = {
      id: Date.now().toString(),
      name: 'New Cron Job',
      description: 'Job description',
      command: '/usr/bin/echo "Hello World"',
      schedule: { minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' },
      enabled: true,
      category: 'Custom',
      priority: 'medium',
      user: 'root',
      logFile: '/var/log/cron.log',
      emailNotification: false,
      emailAddress: '',
      tags: []
    };
    setProject(prev => ({ ...prev, jobs: [...prev.jobs, newJob] }));
    setSelectedJob(newJob);
  };

  const updateJob = (id: string, key: keyof CrontabJob, value: any) => {
    setProject(prev => ({
      ...prev,
      jobs: prev.jobs.map(job => 
        job.id === id ? { ...job, [key]: value } : job
      )
    }));
  };

  const removeJob = (id: string) => {
    setProject(prev => ({ ...prev, jobs: prev.jobs.filter(job => job.id !== id) }));
    if (selectedJob?.id === id) {
      setSelectedJob(null);
    }
  };

  const duplicateJob = (id: string) => {
    const job = project.jobs.find(j => j.id === id);
    if (job) {
      const newJob = { ...job, id: Date.now().toString(), name: `${job.name} (Copy)` };
      setProject(prev => ({ ...prev, jobs: [...prev.jobs, newJob] }));
    }
  };

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDragSource(jobId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetJobId: string) => {
    e.preventDefault();
    if (dragSource && dragSource !== targetJobId) {
      const jobs = [...project.jobs];
      const sourceIndex = jobs.findIndex(j => j.id === dragSource);
      const targetIndex = jobs.findIndex(j => j.id === targetJobId);
      
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [movedJob] = jobs.splice(sourceIndex, 1);
        jobs.splice(targetIndex, 0, movedJob);
        setProject(prev => ({ ...prev, jobs }));
      }
    }
    setDragSource(null);
  };

  const generateCrontab = () => {
    const header = `# ${project.name}
# Generated on: ${new Date().toLocaleDateString()}
# Timezone: ${project.timezone}
#
# Categories: ${project.categories.join(', ')}
# Tags: ${project.tags.join(', ')}
#
# =============================================================================
# CRON JOBS
# =============================================================================
`;

    const jobs = project.jobs
      .filter(job => job.enabled)
      .map(job => {
        const schedule = `${job.schedule.minute} ${job.schedule.hour} ${job.schedule.dayOfMonth} ${job.schedule.month} ${job.schedule.dayOfWeek}`;
        let line = `${schedule} ${job.user} ${job.command}`;
        
        if (job.logFile) {
          line += ` >> ${job.logFile} 2>&1`;
        }
        
        if (job.emailNotification && job.emailAddress) {
          line += ` || echo "Job failed: ${job.name}" | mail -s "CRON FAILURE: ${job.name}" ${job.emailAddress}`;
        }
        
        return `# ${job.name} - ${job.description}\n${line}`;
      })
      .join('\n\n');

    return header + jobs;
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
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-purple-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#7c3aed" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Crontab GUI Designer
      </h2>

      {/* Project Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Project Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={project.timezone}
              onChange={(e) => setProject(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={project.description}
              onChange={(e) => setProject(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setViewMode('design')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'design' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎨 Design View
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'preview' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👁️ Preview
          </button>
          <button
            onClick={() => setViewMode('export')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'export' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📤 Export
          </button>
        </div>

        {viewMode === 'design' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Jobs List */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-purple-800">Cron Jobs</h4>
                <button
                  onClick={addJob}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  + Add Job
                </button>
              </div>
              
              <div className="space-y-3">
                {project.jobs.map((job, index) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, job.id)}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedJob?.id === job.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                    } ${dragSource === job.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={job.enabled}
                          onChange={(e) => updateJob(job.id, 'enabled', e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4"
                        />
                        <span className="font-medium text-gray-900">{job.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateJob(job.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          📋
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeJob(job.id);
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">{job.description}</div>
                    
                    <div className="text-xs text-gray-500 font-mono">
                      {job.schedule.minute} {job.schedule.hour} {job.schedule.dayOfMonth} {job.schedule.month} {job.schedule.dayOfWeek}
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {job.category} • {job.user}
                    </div>
                  </div>
                ))}
                
                {project.jobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">⏰</div>
                    <p>No cron jobs yet</p>
                    <p className="text-sm">Click "Add Job" to create your first scheduled task</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Editor */}
            <div className="lg:col-span-2">
              {selectedJob ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4">Edit Job: {selectedJob.name}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Name</label>
                      <input
                        type="text"
                        value={selectedJob.name}
                        onChange={(e) => updateJob(selectedJob.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={selectedJob.category}
                        onChange={(e) => updateJob(selectedJob.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {project.categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={selectedJob.priority}
                        onChange={(e) => updateJob(selectedJob.id, 'priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                      <input
                        type="text"
                        value={selectedJob.user}
                        onChange={(e) => updateJob(selectedJob.id, 'user', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={selectedJob.description}
                      onChange={(e) => updateJob(selectedJob.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Command</label>
                    <input
                      type="text"
                      value={selectedJob.command}
                      onChange={(e) => updateJob(selectedJob.id, 'command', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Schedule Configuration */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                    <div className="grid grid-cols-5 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Minute</label>
                        <input
                          type="text"
                          value={selectedJob.schedule.minute}
                          onChange={(e) => updateJob(selectedJob.id, 'schedule', { ...selectedJob.schedule, minute: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Hour</label>
                        <input
                          type="text"
                          value={selectedJob.schedule.hour}
                          onChange={(e) => updateJob(selectedJob.id, 'schedule', { ...selectedJob.schedule, hour: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Day</label>
                        <input
                          type="text"
                          value={selectedJob.schedule.dayOfMonth}
                          onChange={(e) => updateJob(selectedJob.id, 'schedule', { ...selectedJob.schedule, dayOfMonth: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Month</label>
                        <input
                          type="text"
                          value={selectedJob.schedule.month}
                          onChange={(e) => updateJob(selectedJob.id, 'schedule', { ...selectedJob.schedule, month: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Weekday</label>
                        <input
                          type="text"
                          value={selectedJob.schedule.dayOfWeek}
                          onChange={(e) => updateJob(selectedJob.id, 'schedule', { ...selectedJob.schedule, dayOfWeek: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Log File</label>
                      <input
                        type="text"
                        value={selectedJob.logFile}
                        onChange={(e) => updateJob(selectedJob.id, 'logFile', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`email-${selectedJob.id}`}
                        checked={selectedJob.emailNotification}
                        onChange={(e) => updateJob(selectedJob.id, 'emailNotification', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor={`email-${selectedJob.id}`} className="text-sm text-gray-700">
                        Email notifications
                      </label>
                    </div>
                    
                    {selectedJob.emailNotification && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={selectedJob.emailAddress}
                          onChange={(e) => updateJob(selectedJob.id, 'emailAddress', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-lg">Select a job to edit</p>
                  <p className="text-sm">Choose a job from the list or create a new one</p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'preview' && (
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
            <div className="text-white mb-4"># Preview of generated crontab:</div>
            <pre>{generateCrontab()}</pre>
          </div>
        )}

        {viewMode === 'export' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => copyToClipboard(generateCrontab())}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                📋 Copy Crontab
              </button>
              
              <button
                onClick={() => {
                  const blob = new Blob([generateCrontab()], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${project.name.replace(/\s+/g, '_')}_crontab.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                💾 Download File
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Installation Instructions:</h4>
              <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1">
                <li>Copy the generated crontab content</li>
                <li>Edit your system crontab: <code>sudo nano /etc/crontab</code></li>
                <li>Paste the content at the end of the file</li>
                <li>Save and exit (Ctrl+X, Y, Enter in nano)</li>
                <li>Restart cron service: <code>sudo systemctl restart cron</code></li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CrontabGuiDesignerInfoSections() {
  return (
    <div className="space-y-8 mb-8">
      {/* Features Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="#7c3aed" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Key Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">🎨</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Visual Design Interface</h4>
                <p className="text-gray-600 text-sm">Intuitive drag-and-drop interface for creating and organizing cron jobs visually</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">⏰</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Smart Schedule Builder</h4>
                <p className="text-gray-600 text-sm">Easy-to-use schedule configuration with validation and common patterns</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">📊</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Project Management</h4>
                <p className="text-gray-600 text-sm">Organize jobs by categories, priorities, and tags for better management</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">👁️</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Live Preview</h4>
                <p className="text-gray-600 text-sm">Real-time preview of generated crontab content before export</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">📤</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Multiple Export Formats</h4>
                <p className="text-gray-600 text-sm">Export as text, download files, or copy to clipboard for easy deployment</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">🔧</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Advanced Configuration</h4>
                <p className="text-gray-600 text-sm">Set user permissions, log files, email notifications, and more</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-purple-800 mb-6">Common Use Cases</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="text-3xl mb-3">🔄</div>
            <h4 className="font-semibold text-blue-800 mb-2">System Maintenance</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Log rotation and cleanup</li>
              <li>• Package updates</li>
              <li>• System health checks</li>
              <li>• Temporary file cleanup</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="text-3xl mb-3">💾</div>
            <h4 className="font-semibold text-green-800 mb-2">Data Protection</h4>
            <ul className="text-green-700 text-sm space-y-1">
              <li>• Database backups</li>
              <li>• File synchronization</li>
              <li>• Archive creation</li>
              <li>• Data integrity checks</li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-semibold text-orange-800 mb-2">Monitoring & Reporting</h4>
            <ul className="text-orange-700 text-sm space-y-1">
              <li>• Performance metrics</li>
              <li>• Alert generation</li>
              <li>• Report generation</li>
              <li>• Status updates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Best Practices Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-purple-800 mb-6">Best Practices</h3>
        
        <div className="space-y-6">
          <div className="border-l-4 border-purple-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Schedule Planning</h4>
            <p className="text-gray-600 text-sm">Avoid scheduling multiple resource-intensive jobs simultaneously. Use different minutes and hours to distribute load.</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Logging & Monitoring</h4>
            <p className="text-gray-600 text-sm">Always configure log files for your cron jobs and set up email notifications for critical failures.</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">User Permissions</h4>
            <p className="text-gray-600 text-sm">Run jobs with the minimum required privileges. Use specific users instead of root when possible.</p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-6">
            <h4 className="font-semibold text-gray-900 mb-2">Testing & Validation</h4>
            <p className="text-gray-600 text-sm">Test your cron jobs manually before deploying to production. Use the preview feature to verify syntax.</p>
          </div>
        </div>
      </div>

      {/* Technical Details Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-purple-800 mb-6">Technical Details</h3>
        
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm mb-6">
          <div className="text-white mb-2"># Crontab Format:</div>
          <div># minute hour day month weekday user command</div>
          <div>#  0-59  0-23  1-31  1-12  0-7  user  /path/to/command</div>
          <div className="mt-2 text-yellow-400"># Examples:</div>
          <div># 0 2 * * * root /usr/local/bin/backup.sh</div>
          <div># */15 * * * * www-data /usr/bin/php /var/www/cron.php</div>
          <div># 0 0 1 * * root /usr/sbin/logrotate</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Special Characters</h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><code className="bg-gray-100 px-2 py-1 rounded">*</code> - Every value</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">*/n</code> - Every n values</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">1-5</code> - Range of values</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">1,3,5</code> - Specific values</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Common Patterns</h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li><code className="bg-gray-100 px-2 py-1 rounded">@yearly</code> - Once a year (0 0 1 1 *)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">@monthly</code> - Once a month (0 0 1 * *)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">@weekly</code> - Once a week (0 0 * * 0)</li>
              <li><code className="bg-gray-100 px-2 py-1 rounded">@daily</code> - Once a day (0 0 * * *)</li>
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
      name: "Crontab Human Language Translator",
      description: "Convert cron expressions to human-readable descriptions",
      url: "/tools/crontab-human-language-translator",
      icon: "📝"
    },
    {
      name: "Crontab Entry Visualizer",
      description: "Visual representation of cron schedules and patterns",
      url: "/tools/crontab-entry-visualizer",
      icon: "📊"
    },
    {
      name: "Crontab Validator",
      description: "Validate cron syntax and check for common errors",
      url: "/tools/crontab-validator",
      icon: "✅"
    },
    {
      name: "Crontab Schedule Previewer",
      description: "Preview next execution times for cron expressions",
      url: "/tools/crontab-schedule-previewer",
      icon: "👁️"
    },
    {
      name: "Cron Job Backup Script Generator",
      description: "Generate backup scripts for cron job management",
      url: "/tools/cron-job-backup-script-generator",
      icon: "💾"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
      <h3 className="text-2xl font-bold text-purple-800 mb-6">Related Tools</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedTools.map((tool, index) => (
          <a
            key={index}
            href={tool.url}
            className="block p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{tool.icon}</div>
            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
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
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-center text-white mb-8">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold mb-4">Stay Updated with Linux Tools</h3>
        <p className="text-purple-100 mb-6">
          Get notified about new tools, updates, and Linux administration tips. Join our community of system administrators and developers.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
          />
          <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
            Subscribe
          </button>
        </div>
        
        <p className="text-purple-200 text-sm mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
