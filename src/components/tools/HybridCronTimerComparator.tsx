'use client';
import React, { useState } from 'react';

interface CronExpression {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface SystemdTimer {
  onCalendar: string;
  onBootSec: string;
  onUnitActiveSec: string;
  persistent: boolean;
  accuracySec: string;
}

interface ComparisonResult {
  cronScore: number;
  timerScore: number;
  recommendation: string;
  reasoning: string[];
  hybridApproach: string;
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

export const HybridCronTimerComparatorInfoSections: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* What is Hybrid Cron+Timer Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-blue-900">What is Hybrid Cron+Timer Comparison?</h3>
        <p className="text-gray-700 mb-4">
          This tool helps you compare traditional cron scheduling with modern systemd timers and provides 
          hybrid recommendations for optimal task scheduling. It analyzes your requirements and suggests 
          the best approach or combination of both methods.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Key Benefits:</h4>
          <ul className="list-disc list-inside text-blue-800 space-y-1">
            <li>Compare cron vs systemd timer approaches</li>
            <li>Get hybrid recommendations for complex scenarios</li>
            <li>Understand when to use each method</li>
            <li>Optimize scheduling for reliability and performance</li>
          </ul>
        </div>
      </div>

      {/* When to Use Cron */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-green-900">When to Use Cron</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✅ Best For:</h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>• Simple, time-based scheduling</li>
              <li>• Legacy system compatibility</li>
              <li>• Quick one-off tasks</li>
              <li>• Systems without systemd</li>
              <li>• Standard time intervals</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">❌ Avoid For:</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Complex dependencies</li>
              <li>• Boot-time execution</li>
              <li>• Service integration</li>
              <li>• Advanced failure handling</li>
            </ul>
          </div>
        </div>
      </div>

      {/* When to Use Systemd Timers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-purple-900">When to Use Systemd Timers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">✅ Best For:</h4>
            <ul className="text-purple-800 text-sm space-y-1">
              <li>• Service integration</li>
              <li>• Boot-time execution</li>
              <li>• Complex dependencies</li>
              <li>• Advanced failure handling</li>
              <li>• Modern Linux systems</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">❌ Avoid For:</h4>
            <ul className="text-red-800 text-sm space-y-1">
              <li>• Legacy systems</li>
              <li>• Simple time-based tasks</li>
              <li>• Non-systemd environments</li>
              <li>• Quick prototyping</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hybrid Approaches */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-orange-900">Hybrid Approaches</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">1. Cron for Simple Tasks, Timers for Complex</h4>
            <p className="text-gray-700 text-sm">
              Use cron for basic time-based scheduling and systemd timers for tasks requiring service integration or complex dependencies.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">2. Timers for Boot/Service, Cron for Regular</h4>
            <p className="text-gray-700 text-sm">
              Use systemd timers for boot-time execution and service-related tasks, cron for regular time-based scheduling.
            </p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">3. Cron for Legacy, Timers for New</h4>
            <p className="text-gray-700 text-sm">
              Keep existing cron jobs for compatibility, use systemd timers for new functionality requiring modern features.
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-indigo-900">Best Practices</h3>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Scheduling Strategy</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Use cron for simple, time-based tasks</li>
              <li>• Use systemd timers for service integration</li>
              <li>• Consider hybrid approaches for complex scenarios</li>
              <li>• Document your scheduling strategy</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-medium text-indigo-900 mb-2">Maintenance</h4>
            <ul className="text-indigo-800 text-sm space-y-1">
              <li>• Regular review of scheduling methods</li>
              <li>• Monitor execution logs</li>
              <li>• Update approaches as requirements change</li>
              <li>• Test scheduling changes in staging</li>
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
          <h4 className="font-medium text-blue-900 mb-2">Systemd Timer Generator</h4>
          <p className="text-gray-600 text-sm mb-3">Create systemd timer units for modern scheduling</p>
          <a href="/tools/systemd-timer-unit-generator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Systemd Timer Generator →
          </a>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <h4 className="font-medium text-blue-900 mb-2">Crontab Validator</h4>
          <p className="text-gray-600 text-sm mb-3">Validate cron expressions and check syntax</p>
          <a href="/tools/crontab-validator" className="text-blue-600 hover:text-blue-800 text-sm">
            Try Crontab Validator →
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

export const HybridCronTimerComparator: React.FC = () => {
  const [cronExpression, setCronExpression] = useState<CronExpression>({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  });

  const [systemdTimer, setSystemdTimer] = useState<SystemdTimer>({
    onCalendar: '',
    onBootSec: '',
    onUnitActiveSec: '',
    persistent: true,
    accuracySec: '1min'
  });

  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [useCase, setUseCase] = useState('');
  const [complexity, setComplexity] = useState('simple');
  const [systemType, setSystemType] = useState('modern');

  const evaluateCronScore = (cron: CronExpression, useCase: string, complexity: string): number => {
    let score = 50; // Base score

    // Time-based scheduling
    if (cron.minute !== '*' || cron.hour !== '*') score += 20;
    
    // Simple use cases
    if (complexity === 'simple') score += 15;
    if (useCase.includes('backup') || useCase.includes('cleanup')) score += 10;
    
    // Legacy compatibility
    if (systemType === 'legacy') score += 15;

    return Math.min(100, score);
  };

  const evaluateTimerScore = (timer: SystemdTimer, useCase: string, complexity: string): number => {
    let score = 50; // Base score

    // Service integration
    if (useCase.includes('service') || useCase.includes('monitoring')) score += 20;
    
    // Complex scenarios
    if (complexity === 'complex') score += 20;
    
    // Boot-time execution
    if (timer.onBootSec || timer.onUnitActiveSec) score += 15;
    
    // Modern systems
    if (systemType === 'modern') score += 15;

    return Math.min(100, score);
  };

  const generateRecommendation = (cronScore: number, timerScore: number, useCase: string, complexity: string): string => {
    const diff = Math.abs(cronScore - timerScore);
    
    if (diff < 10) {
      return 'hybrid';
    } else if (cronScore > timerScore) {
      return 'cron';
    } else {
      return 'timer';
    }
  };

  const generateHybridApproach = (useCase: string, complexity: string): string => {
    if (complexity === 'simple' && useCase.includes('backup')) {
      return 'Use cron for the main backup schedule, systemd timer for post-backup verification';
    } else if (complexity === 'complex' && useCase.includes('monitoring')) {
      return 'Use systemd timer for service monitoring, cron for data cleanup and maintenance';
    } else if (useCase.includes('boot')) {
      return 'Use systemd timer for boot-time tasks, cron for regular maintenance';
    } else {
      return 'Use cron for time-based tasks, systemd timer for service-dependent operations';
    }
  };

  const compareApproaches = () => {
    const cronScore = evaluateCronScore(cronExpression, useCase, complexity);
    const timerScore = evaluateTimerScore(systemdTimer, useCase, complexity);
    const recommendation = generateRecommendation(cronScore, timerScore, useCase, complexity);
    const hybridApproach = generateHybridApproach(useCase, complexity);

    const reasoning: string[] = [];
    
    if (cronScore > timerScore) {
      reasoning.push('Cron is better for your simple, time-based scheduling needs');
      reasoning.push('Your system type and complexity favor traditional cron');
    } else if (timerScore > cronScore) {
      reasoning.push('Systemd timers provide better service integration');
      reasoning.push('Your use case benefits from modern timer features');
    } else {
      reasoning.push('Both approaches have similar scores for your scenario');
      reasoning.push('Consider a hybrid approach for optimal results');
    }

    setComparisonResult({
      cronScore,
      timerScore,
      recommendation,
      reasoning,
      hybridApproach
    });
  };

  const generateCronExpression = (): string => {
    return `${cronExpression.minute} ${cronExpression.hour} ${cronExpression.dayOfMonth} ${cronExpression.month} ${cronExpression.dayOfWeek}`;
  };

  const generateSystemdTimer = (): string => {
    let timerContent = `[Unit]
Description=Timer for ${useCase || 'scheduled task'}
Requires=${useCase.replace(/\s+/g, '-').toLowerCase()}.service

[Timer]
`;

    if (systemdTimer.onCalendar) {
      timerContent += `OnCalendar=${systemdTimer.onCalendar}\n`;
    }
    if (systemdTimer.onBootSec) {
      timerContent += `OnBootSec=${systemdTimer.onBootSec}\n`;
    }
    if (systemdTimer.onUnitActiveSec) {
      timerContent += `OnUnitActiveSec=${systemdTimer.onUnitActiveSec}\n`;
    }

    timerContent += `Persistent=${systemdTimer.persistent}
AccuracySec=${systemdTimer.accuracySec}

[Install]
WantedBy=timers.target`;

    return timerContent;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Use Case and Complexity Input */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Task Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Use Case Description
            </label>
            <input
              type="text"
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g., Daily backup, service monitoring, log rotation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Complexity
            </label>
            <select
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="simple">Simple (time-based only)</option>
              <option value="moderate">Moderate (with dependencies)</option>
              <option value="complex">Complex (service integration)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Type
            </label>
            <select
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="modern">Modern (systemd)</option>
              <option value="legacy">Legacy (no systemd)</option>
              <option value="mixed">Mixed environment</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={compareApproaches}
          disabled={!useCase.trim()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Compare Approaches
        </button>
      </div>

      {/* Cron Expression Builder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Cron Expression Builder</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minute</label>
            <input
              type="text"
              value={cronExpression.minute}
              onChange={(e) => setCronExpression({...cronExpression, minute: e.target.value})}
              placeholder="*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hour</label>
            <input
              type="text"
              value={cronExpression.hour}
              onChange={(e) => setCronExpression({...cronExpression, hour: e.target.value})}
              placeholder="*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
            <input
              type="text"
              value={cronExpression.dayOfMonth}
              onChange={(e) => setCronExpression({...cronExpression, dayOfMonth: e.target.value})}
              placeholder="*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="text"
              value={cronExpression.month}
              onChange={(e) => setCronExpression({...cronExpression, month: e.target.value})}
              placeholder="*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
            <input
              type="text"
              value={cronExpression.dayOfWeek}
              onChange={(e) => setCronExpression({...cronExpression, dayOfWeek: e.target.value})}
              placeholder="*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm text-gray-600">Generated Cron Expression:</p>
          <code className="text-lg font-mono text-gray-800">{generateCronExpression()}</code>
        </div>
      </div>

      {/* Systemd Timer Builder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Systemd Timer Builder</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OnCalendar Expression
            </label>
            <input
              type="text"
              value={systemdTimer.onCalendar}
              onChange={(e) => setSystemdTimer({...systemdTimer, onCalendar: e.target.value})}
              placeholder="daily, weekly, monthly, or custom"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OnBootSec
            </label>
            <input
              type="text"
              value={systemdTimer.onBootSec}
              onChange={(e) => setSystemdTimer({...systemdTimer, onBootSec: e.target.value})}
              placeholder="e.g., 5min, 1h"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OnUnitActiveSec
            </label>
            <input
              type="text"
              value={systemdTimer.onUnitActiveSec}
              onChange={(e) => setSystemdTimer({...systemdTimer, onUnitActiveSec: e.target.value})}
              placeholder="e.g., 1h, 30min"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accuracy
            </label>
            <select
              value={systemdTimer.accuracySec}
              onChange={(e) => setSystemdTimer({...systemdTimer, accuracySec: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1s">1 second</option>
              <option value="1min">1 minute</option>
              <option value="1h">1 hour</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="persistent"
            checked={systemdTimer.persistent}
            onChange={(e) => setSystemdTimer({...systemdTimer, persistent: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="persistent" className="text-sm text-gray-700">
            Persistent (run missed executions when system comes back online)
          </label>
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Comparison Results</h3>
          
          {/* Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Cron Score</h4>
              <div className="text-3xl font-bold text-blue-600">{comparisonResult.cronScore}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${comparisonResult.cronScore}%`}}
                ></div>
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-2">Systemd Timer Score</h4>
              <div className="text-3xl font-bold text-purple-600">{comparisonResult.timerScore}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{width: `${comparisonResult.timerScore}%`}}
                ></div>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-900 mb-2">Recommendation</h4>
            <p className="text-blue-800">
              {comparisonResult.recommendation === 'hybrid' ? 'Use a Hybrid Approach' : 
               comparisonResult.recommendation === 'cron' ? 'Use Cron' : 'Use Systemd Timer'}
            </p>
          </div>

          {/* Reasoning */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Reasoning</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {comparisonResult.reasoning.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Hybrid Approach */}
          {comparisonResult.recommendation === 'hybrid' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Hybrid Approach Suggestion</h4>
              <p className="text-green-800">{comparisonResult.hybridApproach}</p>
            </div>
          )}
        </div>
      )}

      {/* Generated Configurations */}
      {comparisonResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cron Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Cron Entry</h3>
              <button
                onClick={() => copyToClipboard(generateCronExpression())}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generateCronExpression()}</code>
            </pre>
          </div>

          {/* Systemd Timer Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Systemd Timer</h3>
              <button
                onClick={() => copyToClipboard(generateSystemdTimer())}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{generateSystemdTimer()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Define Your Requirements</h4>
            <p className="text-sm">Describe your use case and select the appropriate complexity level.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Configure Both Approaches</h4>
            <p className="text-sm">Set up cron expressions and systemd timer parameters.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Get Recommendations</h4>
            <p className="text-sm">Compare scores and get hybrid approach suggestions.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Implement the Best Solution</h4>
            <p className="text-sm">Use the generated configurations and recommendations for your system.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HybridCronTimerComparator;
