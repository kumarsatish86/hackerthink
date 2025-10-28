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
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">⏰</div>
                <div className="text-sm font-semibold">Cron Translator</div>
                <div className="text-xs opacity-75">Human language</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>📅 Date</span>
                    <span>⏰ Time</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>🔄 Repeat</span>
                    <span>📝 Command</span>
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

interface CronField {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

interface HumanExpression {
  type: 'frequency' | 'specific' | 'custom';
  description: string;
  cronExpression: string;
}

export function CrontabHumanLanguageTranslator() {
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [humanDescription, setHumanDescription] = useState('');
  const [translationMode, setTranslationMode] = useState<'cron-to-human' | 'human-to-cron'>('cron-to-human');
  const [cronFields, setCronFields] = useState<CronField>({
    minute: '0',
    hour: '0',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  });
  const [selectedHumanExpression, setSelectedHumanExpression] = useState<HumanExpression | null>(null);
  const [nextRuns, setNextRuns] = useState<string[]>([]);

  const humanExpressions: HumanExpression[] = [
    {
      type: 'frequency',
      description: 'Every minute',
      cronExpression: '* * * * *'
    },
    {
      type: 'frequency',
      description: 'Every hour',
      cronExpression: '0 * * * *'
    },
    {
      type: 'frequency',
      description: 'Every day at midnight',
      cronExpression: '0 0 * * *'
    },
    {
      type: 'frequency',
      description: 'Every day at 2 AM',
      cronExpression: '0 2 * * *'
    },
    {
      type: 'frequency',
      description: 'Every Monday at 9 AM',
      cronExpression: '0 9 * * 1'
    },
    {
      type: 'frequency',
      description: 'Every weekday at 6 PM',
      cronExpression: '0 18 * * 1-5'
    },
    {
      type: 'frequency',
      description: 'Every Sunday at 11 PM',
      cronExpression: '0 23 * * 0'
    },
    {
      type: 'frequency',
      description: 'Every 15 minutes',
      cronExpression: '*/15 * * * *'
    },
    {
      type: 'frequency',
      description: 'Every 30 minutes',
      cronExpression: '0,30 * * * *'
    },
    {
      type: 'frequency',
      description: 'Every 2 hours',
      cronExpression: '0 */2 * * *'
    },
    {
      type: 'frequency',
      description: 'Every month on the 1st at 3 AM',
      cronExpression: '0 3 1 * *'
    },
    {
      type: 'frequency',
      description: 'Every quarter (Jan, Apr, Jul, Oct) on the 1st at 2 AM',
      cronExpression: '0 2 1 1,4,7,10 *'
    },
    {
      type: 'specific',
      description: 'Every day at 8:30 AM',
      cronExpression: '30 8 * * *'
    },
    {
      type: 'specific',
      description: 'Every Tuesday and Thursday at 10:15 AM',
      cronExpression: '15 10 * * 2,4'
    },
    {
      type: 'specific',
      description: 'Every 1st and 15th of the month at 6 PM',
      cronExpression: '0 18 1,15 * *'
    },
    {
      type: 'custom',
      description: 'Every 5 minutes during business hours (9 AM - 5 PM)',
      cronExpression: '*/5 9-17 * * 1-5'
    }
  ];

  const parseCronExpression = (expression: string): CronField => {
    const parts = expression.split(' ');
    if (parts.length !== 5) {
      return { minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' };
    }
    
    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4]
    };
  };

  const generateHumanDescription = (expression: string): string => {
    const fields = parseCronExpression(expression);
    
    let description = '';
    
    // Minute
    if (fields.minute === '*') {
      description += 'Every minute';
    } else if (fields.minute.includes('/')) {
      const interval = fields.minute.split('/')[1];
      description += `Every ${interval} minutes`;
    } else if (fields.minute.includes(',')) {
      const minutes = fields.minute.split(',').join(', ');
      description += `At minute ${minutes}`;
    } else if (fields.minute === '0') {
      description += 'At the start of the hour';
    } else {
      description += `At minute ${fields.minute}`;
    }
    
    // Hour
    if (fields.hour === '*') {
      description += ' of every hour';
    } else if (fields.hour.includes('/')) {
      const interval = fields.hour.split('/')[1];
      description += ` of every ${interval} hours`;
    } else if (fields.hour.includes('-')) {
      const [start, end] = fields.hour.split('-');
      description += ` between ${start}:00 and ${end}:00`;
    } else if (fields.hour.includes(',')) {
      const hours = fields.hour.split(',').join(', ');
      description += ` at ${hours}:00`;
    } else {
      description += ` at ${fields.hour}:00`;
    }
    
    // Day of month
    if (fields.dayOfMonth === '*') {
      description += ' of every day';
    } else if (fields.dayOfMonth.includes(',')) {
      const days = fields.dayOfMonth.split(',').join(', ');
      description += ` on day ${days}`;
    } else if (fields.dayOfMonth.includes('/')) {
      const interval = fields.dayOfMonth.split('/')[1];
      description += ` every ${interval} days`;
    } else {
      description += ` on day ${fields.dayOfMonth}`;
    }
    
    // Month
    if (fields.month === '*') {
      description += ' of every month';
    } else if (fields.month.includes(',')) {
      const months = fields.month.split(',').map(m => getMonthName(parseInt(m))).join(', ');
      description += ` in ${months}`;
    } else if (fields.month.includes('/')) {
      const interval = fields.month.split('/')[1];
      description += ` every ${interval} months`;
    } else {
      description += ` in ${getMonthName(parseInt(fields.month))}`;
    }
    
    // Day of week
    if (fields.dayOfWeek === '*') {
      // No specific day of week
    } else if (fields.dayOfWeek.includes(',')) {
      const days = fields.dayOfWeek.split(',').map(d => getDayName(parseInt(d))).join(', ');
      description += ` on ${days}`;
    } else if (fields.dayOfWeek.includes('-')) {
      const [start, end] = fields.dayOfWeek.split('-');
      description += ` from ${getDayName(parseInt(start))} to ${getDayName(parseInt(end))}`;
    } else {
      description += ` on ${getDayName(parseInt(fields.dayOfWeek))}`;
    }
    
    return description;
  };

  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || month.toString();
  };

  const getDayName = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || day.toString();
  };

  const updateCronExpression = () => {
    const expression = `${cronFields.minute} ${cronFields.hour} ${cronFields.dayOfMonth} ${cronFields.month} ${cronFields.dayOfWeek}`;
    setCronExpression(expression);
    setHumanDescription(generateHumanDescription(expression));
  };

  const generateNextRuns = (expression: string): string[] => {
    // This is a simplified simulation - in a real app you'd use a proper cron parser
    const now = new Date();
    const runs: string[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const nextRun = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
      runs.push(nextRun.toLocaleString());
    }
    
    return runs;
  };

  const validateCronExpression = (expression: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const parts = expression.split(' ');
    
    if (parts.length !== 5) {
      errors.push('Cron expression must have exactly 5 fields');
      return { isValid: false, errors };
    }
    
    // Validate each field
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    if (!isValidField(minute, 0, 59)) {
      errors.push('Minute field is invalid (0-59)');
    }
    if (!isValidField(hour, 0, 23)) {
      errors.push('Hour field is invalid (0-23)');
    }
    if (!isValidField(dayOfMonth, 1, 31)) {
      errors.push('Day of month field is invalid (1-31)');
    }
    if (!isValidField(month, 1, 12)) {
      errors.push('Month field is invalid (1-12)');
    }
    if (!isValidField(dayOfWeek, 0, 6)) {
      errors.push('Day of week field is invalid (0-6, where 0=Sunday)');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const isValidField = (field: string, min: number, max: number): boolean => {
    if (field === '*') return true;
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      if (range === '*') return parseInt(step) > 0;
      return isValidRange(range, min, max) && parseInt(step) > 0;
    }
    if (field.includes(',')) {
      return field.split(',').every(part => isValidRange(part, min, max));
    }
    if (field.includes('-')) {
      return isValidRange(field, min, max);
    }
    return isValidRange(field, min, max);
  };

  const isValidRange = (range: string, min: number, max: number): boolean => {
    if (range.includes('-')) {
      const [start, end] = range.split('-');
      return parseInt(start) >= min && parseInt(end) <= max && parseInt(start) <= parseInt(end);
    }
    const num = parseInt(range);
    return !isNaN(num) && num >= min && num <= max;
  };

  useEffect(() => {
    updateCronExpression();
  }, [cronFields]);

  useEffect(() => {
    if (translationMode === 'cron-to-human') {
      setHumanDescription(generateHumanDescription(cronExpression));
      setNextRuns(generateNextRuns(cronExpression));
    }
  }, [cronExpression, translationMode]);

  const handleHumanExpressionSelect = (expression: HumanExpression) => {
    setSelectedHumanExpression(expression);
    setCronExpression(expression.cronExpression);
    setCronFields(parseCronExpression(expression.cronExpression));
    setTranslationMode('human-to-cron');
  };

  const validation = validateCronExpression(cronExpression);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#2563eb" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Crontab Human Language Translator
      </h2>

      {/* Translation Mode Toggle */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Translation Mode</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setTranslationMode('cron-to-human')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              translationMode === 'cron-to-human'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔍 Cron → Human Language
          </button>
          <button
            onClick={() => setTranslationMode('human-to-cron')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              translationMode === 'human-to-cron'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Human Language → Cron
          </button>
        </div>
      </div>

      {translationMode === 'cron-to-human' ? (
        /* Cron to Human Translation */
        <div className="space-y-6">
          {/* Cron Expression Input */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Enter Cron Expression</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => setCronExpression(e.target.value)}
                  placeholder="0 0 * * *"
                  className={`w-full px-3 py-2 border rounded-lg font-mono text-lg ${
                    validation.isValid ? 'border-green-300 focus:ring-green-500' : 'border-red-300 focus:ring-red-500'
                  } focus:ring-2 focus:border-transparent`}
                />
                {!validation.isValid && (
                  <div className="mt-2 text-red-600 text-sm">
                    {validation.errors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setCronFields(parseCronExpression(cronExpression))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Parse
              </button>
            </div>
          </div>

          {/* Cron Field Editor */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Edit Cron Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minute (0-59)</label>
                <input
                  type="text"
                  value={cronFields.minute}
                  onChange={(e) => setCronFields({...cronFields, minute: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hour (0-23)</label>
                <input
                  type="text"
                  value={cronFields.hour}
                  onChange={(e) => setCronFields({...cronFields, hour: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month (1-31)</label>
                <input
                  type="text"
                  value={cronFields.dayOfMonth}
                  onChange={(e) => setCronFields({...cronFields, dayOfMonth: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month (1-12)</label>
                <input
                  type="text"
                  value={cronFields.month}
                  onChange={(e) => setCronFields({...cronFields, month: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week (0-6)</label>
                <input
                  type="text"
                  value={cronFields.dayOfWeek}
                  onChange={(e) => setCronFields({...cronFields, dayOfWeek: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Human Description */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Human Language Translation</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-lg">{humanDescription}</p>
            </div>
          </div>

          {/* Next Runs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Next 5 Scheduled Runs</h3>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-blue-600 font-medium">#{index + 1}</span>
                  <span className="text-gray-700">{run}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Human to Cron Translation */
        <div className="space-y-6">
          {/* Predefined Expressions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Common Expressions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {humanExpressions.map((expression, index) => (
                <button
                  key={index}
                  onClick={() => handleHumanExpressionSelect(expression)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    selectedHumanExpression?.description === expression.description
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="font-medium text-gray-800 mb-1">{expression.description}</div>
                  <div className="font-mono text-sm text-blue-600">{expression.cronExpression}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Expression Details */}
          {selectedHumanExpression && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Selected Expression</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="font-medium text-blue-800 mb-2">{selectedHumanExpression.description}</div>
                <div className="font-mono text-lg text-blue-600">{selectedHumanExpression.cronExpression}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigator.clipboard.writeText(cronExpression)}
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-blue-800">📋 Copy Cron Expression</div>
            <div className="text-sm text-blue-600">Copy to clipboard</div>
          </button>
          
          <button
            onClick={() => navigator.clipboard.writeText(humanDescription)}
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-blue-800">📝 Copy Description</div>
            <div className="text-sm text-blue-600">Copy human description</div>
          </button>
          
          <button
            onClick={() => setCronExpression('0 0 * * *')}
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-blue-800">🔄 Reset to Default</div>
            <div className="text-sm text-blue-600">Daily at midnight</div>
          </button>
          
          <button
            onClick={() => setTranslationMode(translationMode === 'cron-to-human' ? 'human-to-cron' : 'cron-to-human')}
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-blue-800">🔄 Switch Mode</div>
            <div className="text-sm text-blue-600">Change translation direction</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function CrontabHumanLanguageTranslatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">What is a Crontab?</h2>
        <p className="text-gray-700 text-lg">
          A crontab (cron table) is a configuration file that specifies shell commands to run 
          periodically on a given schedule. The name comes from the word "cron" which is derived 
          from the Greek word for time, χρόνος (chronos). Crontabs are used to automate system 
          maintenance, backups, log rotation, and other repetitive tasks.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Cron Expression Format</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">A cron expression consists of 5 fields:</p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
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
              <div className="text-sm text-red-600">0-6 (Sun-Sat)</div>
            </div>
          </div>
          <p className="text-gray-700 mt-4 text-center">
            <strong>Format:</strong> minute hour day_of_month month day_of_week
          </p>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Special Characters</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Asterisk (*)</h3>
            <p className="text-gray-700 mb-2">Represents "every" value in the field:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>* * * * *</code> - Every minute of every hour, every day</li>
              <li><code>0 * * * *</code> - At minute 0 of every hour</li>
              <li><code>0 0 * * *</code> - At midnight every day</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Slash (/)</h3>
            <p className="text-gray-700 mb-2">Specifies increments:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>*/15 * * * *</code> - Every 15 minutes</li>
              <li><code>0 */2 * * *</code> - Every 2 hours</li>
              <li><code>0 0 */3 * *</code> - Every 3 days at midnight</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Comma (,)</h3>
            <p className="text-gray-700 mb-2">Specifies multiple values:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>0 9,17 * * *</code> - At 9 AM and 5 PM daily</li>
              <li><code>0 0 1,15 * *</code> - On the 1st and 15th of each month</li>
              <li><code>0 12 * * 1,3,5</code> - At noon on Monday, Wednesday, Friday</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Hyphen (-)</h3>
            <p className="text-gray-700 mb-2">Specifies ranges:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>0 9-17 * * *</code> - Every hour from 9 AM to 5 PM</li>
              <li><code>0 0 * * 1-5</code> - Every weekday at midnight</li>
              <li><code>0 0 1-7 * *</code> - First week of every month</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Common Cron Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Daily Tasks</h3>
            <ul className="list-disc pl-6 text-blue-700 text-sm">
              <li><code>0 0 * * *</code> - Daily at midnight</li>
              <li><code>0 6 * * *</code> - Daily at 6 AM</li>
              <li><code>0 18 * * *</code> - Daily at 6 PM</li>
              <li><code>0 12 * * *</code> - Daily at noon</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Weekly Tasks</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm">
              <li><code>0 9 * * 1</code> - Every Monday at 9 AM</li>
              <li><code>0 0 * * 0</code> - Every Sunday at midnight</li>
              <li><code>0 17 * * 5</code> - Every Friday at 5 PM</li>
              <li><code>0 8 * * 1-5</code> - Every weekday at 8 AM</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Monthly Tasks</h3>
            <ul className="list-disc pl-6 text-purple-700 text-sm">
              <li><code>0 2 1 * *</code> - 1st of every month at 2 AM</li>
              <li><code>0 3 15 * *</code> - 15th of every month at 3 AM</li>
              <li><code>0 0 1 */3 *</code> - 1st of every 3rd month</li>
              <li><code>0 1 1 1,4,7,10 *</code> - Quarterly on 1st at 1 AM</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Frequent Tasks</h3>
            <ul className="list-disc pl-6 text-orange-700 text-sm">
              <li><code>* * * * *</code> - Every minute</li>
              <li><code>*/5 * * * *</code> - Every 5 minutes</li>
              <li><code>0,30 * * * *</code> - Every 30 minutes</li>
              <li><code>0 */1 * * *</code> - Every hour</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Business Hours Scheduling</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-700 mb-4">Common patterns for business operations:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Business Hours (9 AM - 5 PM)</h3>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li><code>0 9-17 * * 1-5</code> - Every hour during business hours</li>
                <li><code>*/15 9-17 * * 1-5</code> - Every 15 minutes during business hours</li>
                <li><code>0 9,12,17 * * 1-5</code> - At 9 AM, noon, and 5 PM on weekdays</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">After Hours (6 PM - 8 AM)</h3>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li><code>0 18-23,0-8 * * *</code> - Every hour after 6 PM and before 9 AM</li>
                <li><code>0 2 * * *</code> - Daily at 2 AM (maintenance window)</li>
                <li><code>0 0 * * 0</code> - Weekly maintenance on Sunday</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Seasonal and Special Scheduling</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Quarterly Tasks</h3>
            <p className="text-gray-700 mb-2">Tasks that run every quarter:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>0 2 1 1,4,7,10 *</code> - Quarterly reports (Jan, Apr, Jul, Oct)</li>
              <li><code>0 3 1 */3 *</code> - Every 3 months at 3 AM</li>
              <li><code>0 1 1 1,4,7,10 *</code> - Quarterly backups</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">End of Month/Year</h3>
            <p className="text-gray-700 mb-2">Common end-of-period tasks:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>0 23 28-31 * *</code> - End of month processing</li>
              <li><code>0 0 31 12 *</code> - New Year's Eve at midnight</li>
              <li><code>0 1 1 1 *</code> - New Year's Day at 1 AM</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Documentation:</strong> Always document what each cron job does</li>
            <li><strong>Logging:</strong> Ensure cron jobs log their output and errors</li>
            <li><strong>Testing:</strong> Test cron expressions before deploying to production</li>
            <li><strong>Monitoring:</strong> Monitor cron job execution and success rates</li>
            <li><strong>Time Zones:</strong> Be aware of server time zone settings</li>
            <li><strong>Resource Usage:</strong> Avoid scheduling resource-intensive jobs at peak times</li>
            <li><strong>Dependencies:</strong> Consider dependencies between different cron jobs</li>
            <li><strong>Backup:</strong> Keep backups of crontab configurations</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Troubleshooting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Common Issues</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm">
              <li><strong>Wrong time:</strong> Check server timezone settings</li>
              <li><strong>Permission denied:</strong> Ensure proper file permissions</li>
              <li><strong>Path issues:</strong> Use absolute paths in cron commands</li>
              <li><strong>Environment variables:</strong> Cron jobs don't inherit user environment</li>
              <li><strong>Syntax errors:</strong> Validate cron expressions</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-blue-700 text-sm">
              <li><code>crontab -l</code> - List current crontab</li>
              <li><code>crontab -e</code> - Edit crontab</li>
              <li><code>systemctl status cron</code> - Check cron service status</li>
              <li><code>tail -f /var/log/cron</code> - Monitor cron logs</li>
              <li><code>date</code> - Check current server time</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Security Considerations</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Cron Security Best Practices</h3>
          <ul className="list-disc pl-6 text-gray-700 text-sm">
            <li><strong>User permissions:</strong> Only allow trusted users to create cron jobs</li>
            <li><strong>Command validation:</strong> Validate all commands before adding to crontab</li>
            <li><strong>Output handling:</strong> Redirect output to prevent information disclosure</li>
            <li><strong>Path restrictions:</strong> Use restricted PATH in cron environment</li>
            <li><strong>Log monitoring:</strong> Monitor cron logs for suspicious activity</li>
            <li><strong>Regular audits:</strong> Periodically review all cron jobs</li>
          </ul>
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
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Automation</h2>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux automation tips, cron scheduling best practices, and tool updates delivered to your inbox. 
        Join our community of system administrators and DevOps professionals.
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
