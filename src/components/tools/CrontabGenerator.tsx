"use client";
import React, { useState, useEffect } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-indigo-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-purple-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-5 gap-1 font-mono text-center text-sm">
                <div className="bg-blue-700/80 text-white p-1 rounded">*</div>
                <div className="bg-blue-700/60 text-white p-1 rounded">*</div>
                <div className="bg-blue-700/80 text-white p-1 rounded">*</div>
                <div className="bg-blue-700/60 text-white p-1 rounded">*</div>
                <div className="bg-blue-700/80 text-white p-1 rounded">*</div>
                <div className="text-white mt-2 text-xs">min</div>
                <div className="text-white mt-2 text-xs">hour</div>
                <div className="text-white mt-2 text-xs">day</div>
                <div className="text-white mt-2 text-xs">month</div>
                <div className="text-white mt-2 text-xs">dow</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Cron Expression</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrontabGenerator() {
  const [cronFields, setCronFields] = useState({
    minute: '*',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  });
  const [command, setCommand] = useState('/path/to/script.sh');
  const [customValues, setCustomValues] = useState({
    minute: '',
    hour: '',
    dayOfMonth: '',
    month: '',
    dayOfWeek: ''
  });
  const [generatedCron, setGeneratedCron] = useState('* * * * * /path/to/script.sh');
  const [description, setDescription] = useState('This cron job will run every minute.');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    generateCronExpression();
  }, [cronFields, command]);

  const handleFieldChange = (field: string, value: string) => {
    setCronFields(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomValueChange = (field: string, value: string) => {
    setCustomValues(prev => ({ ...prev, [field]: value }));
    if (value) {
      setCronFields(prev => ({ ...prev, [field]: value }));
    }
  };

  const generateCronExpression = () => {
    const minute = cronFields.minute === 'custom' ? customValues.minute || '*' : cronFields.minute;
    const hour = cronFields.hour === 'custom' ? customValues.hour || '*' : cronFields.hour;
    const dayOfMonth = cronFields.dayOfMonth === 'custom' ? customValues.dayOfMonth || '*' : cronFields.dayOfMonth;
    const month = cronFields.month === 'custom' ? customValues.month || '*' : cronFields.month;
    const dayOfWeek = cronFields.dayOfWeek === 'custom' ? customValues.dayOfWeek || '*' : cronFields.dayOfWeek;

    const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${command}`;
    setGeneratedCron(cronExpression);
    generateDescription(minute, hour, dayOfMonth, month, dayOfWeek);
  };

  const generateDescription = (minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string) => {
    let desc = 'This cron job will run ';
    
    if (minute === '*') desc += 'every minute';
    else if (minute.startsWith('*/')) desc += `every ${minute.substring(2)} minutes`;
    else desc += `at minute ${minute}`;
    
    if (hour !== '*') {
      if (hour.startsWith('*/')) desc += `, every ${hour.substring(2)} hours`;
      else desc += `, at hour ${hour}`;
    }
    
    if (dayOfMonth !== '*') {
      if (dayOfMonth === 'L') desc += ', on the last day of the month';
      else desc += `, on day ${dayOfMonth} of the month`;
    }
    
    if (month !== '*') {
      if (month.startsWith('*/')) desc += `, every ${month.substring(2)} months`;
      else desc += `, in month ${month}`;
    }
    
    if (dayOfWeek !== '*') {
      if (dayOfWeek === '1-5') desc += ', on weekdays';
      else if (dayOfWeek === '0,6') desc += ', on weekends';
      else desc += `, on day ${dayOfWeek} of the week`;
    }
    
    desc += '.';
    setDescription(desc);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCron).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'daily':
        setCronFields({ minute: '0', hour: '0', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        setCommand('/path/to/daily-backup.sh');
        break;
      case 'hourly':
        setCronFields({ minute: '0', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' });
        setCommand('/path/to/hourly-check.sh');
        break;
      case 'weekly':
        setCronFields({ minute: '0', hour: '2', dayOfMonth: '*', month: '*', dayOfWeek: '0' });
        setCommand('/path/to/weekly-maintenance.sh');
        break;
      case 'monthly':
        setCronFields({ minute: '0', hour: '3', dayOfMonth: '1', month: '*', dayOfWeek: '*' });
        setCommand('/path/to/monthly-report.sh');
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#1d4ed8" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Crontab Expression Generator
      </h2>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => applyPreset('daily')} className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-blue-800">Daily</div>
            <div className="text-sm text-blue-600">Every day at midnight</div>
          </button>
          
          <button onClick={() => applyPreset('hourly')} className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-green-800">Hourly</div>
            <div className="text-sm text-green-600">Every hour at minute 0</div>
          </button>
          
          <button onClick={() => applyPreset('weekly')} className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-purple-800">Weekly</div>
            <div className="text-sm text-purple-600">Every Sunday at 2 AM</div>
          </button>
          
          <button onClick={() => applyPreset('monthly')} className="bg-orange-50 hover:bg-orange-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-orange-800">Monthly</div>
            <div className="text-sm text-orange-600">1st of every month at 3 AM</div>
          </button>
        </div>
      </div>

      {/* Cron Expression Generator */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4">Cron Expression Generator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {/* Minute */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minute</label>
            <select 
              value={cronFields.minute} 
              onChange={(e) => handleFieldChange('minute', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="*">Every minute (*)</option>
              <option value="*/5">Every 5 minutes (*/5)</option>
              <option value="*/10">Every 10 minutes (*/10)</option>
              <option value="*/15">Every 15 minutes (*/15)</option>
              <option value="*/30">Every 30 minutes (*/30)</option>
              <option value="0">At minute 0 (0)</option>
              <option value="15">At minute 15 (15)</option>
              <option value="30">At minute 30 (30)</option>
              <option value="45">At minute 45 (45)</option>
              <option value="custom">Custom value...</option>
            </select>
            {cronFields.minute === 'custom' && (
              <input 
                type="text" 
                value={customValues.minute}
                onChange={(e) => handleCustomValueChange('minute', e.target.value)}
                placeholder="Custom minute (0-59)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* Hour */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hour</label>
            <select 
              value={cronFields.hour} 
              onChange={(e) => handleFieldChange('hour', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="*">Every hour (*)</option>
              <option value="*/2">Every 2 hours (*/2)</option>
              <option value="*/3">Every 3 hours (*/3)</option>
              <option value="*/6">Every 6 hours (*/6)</option>
              <option value="*/12">Every 12 hours (*/12)</option>
              <option value="0">At midnight (0)</option>
              <option value="6">At 6 AM (6)</option>
              <option value="12">At noon (12)</option>
              <option value="18">At 6 PM (18)</option>
              <option value="custom">Custom value...</option>
            </select>
            {cronFields.hour === 'custom' && (
              <input 
                type="text" 
                value={customValues.hour}
                onChange={(e) => handleCustomValueChange('hour', e.target.value)}
                placeholder="Custom hour (0-23)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* Day of Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
            <select 
              value={cronFields.dayOfMonth} 
              onChange={(e) => handleFieldChange('dayOfMonth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="*">Every day (*)</option>
              <option value="1">On the 1st (1)</option>
              <option value="15">On the 15th (15)</option>
              <option value="28">On the 28th (28)</option>
              <option value="L">Last day of month (L)</option>
              <option value="custom">Custom value...</option>
            </select>
            {cronFields.dayOfMonth === 'custom' && (
              <input 
                type="text" 
                value={customValues.dayOfMonth}
                onChange={(e) => handleCustomValueChange('dayOfMonth', e.target.value)}
                placeholder="Custom day (1-31)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select 
              value={cronFields.month} 
              onChange={(e) => handleFieldChange('month', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="*">Every month (*)</option>
              <option value="1">January (1)</option>
              <option value="2">February (2)</option>
              <option value="3">March (3)</option>
              <option value="4">April (4)</option>
              <option value="5">May (5)</option>
              <option value="6">June (6)</option>
              <option value="7">July (7)</option>
              <option value="8">August (8)</option>
              <option value="9">September (9)</option>
              <option value="10">October (10)</option>
              <option value="11">November (11)</option>
              <option value="12">December (12)</option>
              <option value="*/3">Every quarter (*/3)</option>
              <option value="*/6">Every 6 months (*/6)</option>
              <option value="custom">Custom value...</option>
            </select>
            {cronFields.month === 'custom' && (
              <input 
                type="text" 
                value={customValues.month}
                onChange={(e) => handleCustomValueChange('month', e.target.value)}
                placeholder="Custom month (1-12)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
          
          {/* Day of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
            <select 
              value={cronFields.dayOfWeek} 
              onChange={(e) => handleFieldChange('dayOfWeek', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="*">Every day (*)</option>
              <option value="0">Sunday (0)</option>
              <option value="1">Monday (1)</option>
              <option value="2">Tuesday (2)</option>
              <option value="3">Wednesday (3)</option>
              <option value="4">Thursday (4)</option>
              <option value="5">Friday (5)</option>
              <option value="6">Saturday (6)</option>
              <option value="1-5">Weekdays (1-5)</option>
              <option value="0,6">Weekends (0,6)</option>
              <option value="custom">Custom value...</option>
            </select>
            {cronFields.dayOfWeek === 'custom' && (
              <input 
                type="text" 
                value={customValues.dayOfWeek}
                onChange={(e) => handleCustomValueChange('dayOfWeek', e.target.value)}
                placeholder="Custom day (0-6)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>
        
        {/* Command Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Command to Execute</label>
          <input 
            type="text" 
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., /path/to/script.sh"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
        
        {/* Results */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Generated Crontab Line</h3>
          <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-lg mb-4 break-all">
            {generatedCron}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
              <p className="text-gray-700">{description}</p>
            </div>
            
            <button 
              onClick={copyToClipboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">💡</span>
          Common Cron Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">System Maintenance:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">0 2 * * * /usr/sbin/logrotate</div>
                <div className="text-xs text-gray-500">Daily log rotation at 2 AM</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">0 3 * * 0 /usr/sbin/weekly-maintenance</div>
                <div className="text-xs text-gray-500">Weekly maintenance on Sundays at 3 AM</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">0 4 1 * * /usr/sbin/monthly-backup</div>
                <div className="text-xs text-gray-500">Monthly backup on 1st at 4 AM</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Application Tasks:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">*/5 * * * * /usr/bin/check-service</div>
                <div className="text-xs text-gray-500">Check service every 5 minutes</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">0 */6 * * * /usr/bin/cleanup-temp</div>
                <div className="text-xs text-gray-500">Clean temp files every 6 hours</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">30 9 * * 1-5 /usr/bin/send-report</div>
                <div className="text-xs text-gray-500">Send report weekdays at 9:30 AM</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CrontabGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">What is Crontab?</h2>
        <p className="text-gray-700 text-lg">
          Crontab (cron table) is a Linux/Unix utility that allows you to schedule and automate 
          repetitive tasks. It's a powerful tool for system administrators and developers to run 
          scripts, commands, or programs at specified intervals without manual intervention.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Cron Expression Format</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-5 gap-4 text-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="font-semibold text-blue-800">Minute</div>
              <div className="text-sm text-blue-600">0-59</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="font-semibold text-green-800">Hour</div>
              <div className="text-sm text-green-600">0-23</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="font-semibold text-purple-800">Day of Month</div>
              <div className="text-sm text-purple-600">1-31</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <div className="font-semibold text-orange-800">Month</div>
              <div className="text-sm text-orange-600">1-12</div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <div className="font-semibold text-red-800">Day of Week</div>
              <div className="text-sm text-red-600">0-6</div>
            </div>
          </div>
          <p className="text-gray-700 text-center">
            <strong>Format:</strong> minute hour day_of_month month day_of_week command
          </p>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Special Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Asterisk (*)</h3>
            <p className="text-gray-700 mb-2">Represents "every" value:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>*</code> in minute field = every minute</li>
              <li><code>*</code> in hour field = every hour</li>
              <li><code>*</code> in day field = every day</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Slash (/)</h3>
            <p className="text-gray-700 mb-2">Specifies intervals:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>*/5</code> = every 5 units</li>
              <li><code>*/15</code> = every 15 minutes</li>
              <li><code>*/2</code> = every 2 hours</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Comma (,)</h3>
            <p className="text-gray-700 mb-2">Specifies multiple values:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>1,3,5</code> = at 1, 3, and 5</li>
              <li><code>0,6</code> = on Sunday and Saturday</li>
              <li><code>1,15</code> = on 1st and 15th</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Hyphen (-)</h3>
            <p className="text-gray-700 mb-2">Specifies ranges:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>1-5</code> = from 1 to 5</li>
              <li><code>9-17</code> = from 9 AM to 5 PM</li>
              <li><code>1-31</code> = every day of month</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Common Use Cases</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">System Maintenance</h3>
            <p className="text-gray-700 mb-2">Automate routine system tasks:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Log rotation and cleanup</li>
              <li>System updates and patches</li>
              <li>Backup operations</li>
              <li>Disk space monitoring</li>
              <li>Security scans and updates</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Application Management</h3>
            <p className="text-gray-700 mb-2">Schedule application-specific tasks:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Database maintenance and backups</li>
              <li>Cache clearing and optimization</li>
              <li>Report generation and distribution</li>
              <li>Data synchronization</li>
              <li>Performance monitoring</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Business Operations</h3>
            <p className="text-gray-700 mb-2">Automate business processes:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Daily/weekly/monthly reports</li>
              <li>Data processing and analysis</li>
              <li>Email notifications and alerts</li>
              <li>Invoice generation</li>
              <li>Customer data updates</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Use Absolute Paths:</strong> Always specify full paths to scripts and commands</li>
            <li><strong>Set Proper Permissions:</strong> Ensure scripts have execute permissions (chmod +x)</li>
            <li><strong>Log Output:</strong> Redirect output to log files for debugging</li>
            <li><strong>Test Commands:</strong> Verify commands work manually before adding to crontab</li>
            <li><strong>Use Descriptive Comments:</strong> Add comments to explain what each job does</li>
            <li><strong>Monitor Execution:</strong> Check logs regularly to ensure jobs are running</li>
            <li><strong>Backup Crontab:</strong> Keep backups of your crontab configuration</li>
            <li><strong>Consider Time Zones:</strong> Be aware of system timezone settings</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Troubleshooting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Common Issues</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm">
              <li>Script permissions not set correctly</li>
              <li>Environment variables not available</li>
              <li>Path issues in cron environment</li>
              <li>Output not being captured</li>
              <li>Time zone mismatches</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm">
              <li><code>crontab -l</code> - List current crontab</li>
              <li><code>crontab -e</code> - Edit crontab</li>
              <li><code>systemctl status cron</code> - Check cron service</li>
              <li><code>tail -f /var/log/cron</code> - Monitor cron logs</li>
              <li><code>grep CRON /var/log/syslog</code> - View cron entries</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export function RelatedToolsSection({ tools }: { tools: any[] }) {
  if (!tools || tools.length === 0) return null;
  
  const displayTools = tools.slice(0, 6);
  
  const getIconPath = (iconName: string): string => {
    return `/images/icons/${iconName?.toLowerCase() || 'wrench'}.svg`;
  };
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-blue-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-blue-600 text-sm font-medium">
              Try this tool →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-blue-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
