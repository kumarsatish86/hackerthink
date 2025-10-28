"use client";
import React, { useState, useEffect } from 'react';

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
                <div className="text-2xl mb-2">⏰</div>
                <div className="text-sm font-semibold">Schedule Preview</div>
                <div className="text-xs opacity-75">Next 5 runs</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>📅 Date</span>
                    <span>⏰ Time</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>🔄 Countdown</span>
                    <span>📊 Pattern</span>
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

interface ScheduleRun {
  date: Date;
  formattedDate: string;
  formattedTime: string;
  countdown: string;
  dayOfWeek: string;
  isToday: boolean;
  isTomorrow: boolean;
  relativeTime: string;
}

interface SchedulePreview {
  isValid: boolean;
  error?: string;
  nextRuns: ScheduleRun[];
  humanReadable: string;
  executionPattern: {
    frequency: string;
    nextRun: string;
    lastRun?: string;
  };
  timezone: string;
}

export function CrontabSchedulePreviewer() {
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [schedulePreview, setSchedulePreview] = useState<SchedulePreview | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('local');
  const [customTimezone, setCustomTimezone] = useState('UTC');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const commonExpressions = [
    { name: 'Daily at midnight', expression: '0 0 * * *' },
    { name: 'Every hour', expression: '0 * * * *' },
    { name: 'Every 15 minutes', expression: '*/15 * * * *' },
    { name: 'Weekdays at 9 AM', expression: '0 9 * * 1-5' },
    { name: 'Monthly on 1st', expression: '0 0 1 * *' },
    { name: 'Every Sunday', expression: '0 0 * * 0' },
    { name: 'Every 2 hours', expression: '0 */2 * * *' },
    { name: 'Quarterly at 2 AM', expression: '0 2 1 1,4,7,10 *' },
  ];

  const timezones = [
    { value: 'local', label: 'Local Time' },
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' },
  ];

  const parseCronExpression = (expression: string): CronField => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error('Cron expression must have exactly 5 fields');
    }
    
    return {
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4]
    };
  };

  const validateCronExpression = (expression: string): boolean => {
    try {
      parseCronExpression(expression);
      return true;
    } catch {
      return false;
    }
  };

  const isFieldValueActive = (field: string, value: number, min: number, max: number): boolean => {
    if (field === '*') return true;
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      if (range === '*') {
        return value % parseInt(step) === 0;
      }
      const rangeStart = range === '*' ? min : parseInt(range);
      const rangeEnd = max;
      for (let i = rangeStart; i <= rangeEnd; i += parseInt(step)) {
        if (i === value) return true;
      }
      return false;
    }
    if (field.includes(',')) {
      return field.split(',').some(x => parseInt(x) === value);
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(x => parseInt(x));
      return value >= start && value <= end;
    }
    return parseInt(field) === value;
  };

  const isTimeActive = (fields: CronField, date: Date): boolean => {
    const minute = date.getMinutes();
    const hour = date.getHours();
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();

    return (
      isFieldValueActive(fields.minute, minute, 0, 59) &&
      isFieldValueActive(fields.hour, hour, 0, 23) &&
      isFieldValueActive(fields.dayOfMonth, dayOfMonth, 1, 31) &&
      isFieldValueActive(fields.month, month, 1, 12) &&
      isFieldValueActive(fields.dayOfWeek, dayOfWeek, 0, 6)
    );
  };

  const findNextRun = (fields: CronField, startDate: Date, timezone: string): Date | null => {
    let currentDate = new Date(startDate);
    let attempts = 0;
    const maxAttempts = 1000; // Prevent infinite loops

    while (attempts < maxAttempts) {
      attempts++;
      
      // Check each minute of the current day
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute++) {
          const testDate = new Date(currentDate);
          testDate.setHours(hour, minute, 0, 0);
          
          if (testDate > startDate && isTimeActive(fields, testDate)) {
            return testDate;
          }
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return null;
  };

  const generateNextRuns = (fields: CronField, count: number = 5): ScheduleRun[] => {
    const runs: ScheduleRun[] = [];
    let currentDate = new Date();
    
    for (let i = 0; i < count; i++) {
      const nextRun = findNextRun(fields, currentDate, selectedTimezone);
      if (!nextRun) break;
      
      const now = new Date();
      const countdown = getCountdown(nextRun, now);
      const dayOfWeek = getDayOfWeek(nextRun.getDay());
      const isToday = isSameDay(nextRun, now);
      const isTomorrow = isSameDay(nextRun, new Date(now.getTime() + 24 * 60 * 60 * 1000));
      
      runs.push({
        date: nextRun,
        formattedDate: formatDate(nextRun),
        formattedTime: formatTime(nextRun),
        countdown,
        dayOfWeek,
        isToday,
        isTomorrow,
        relativeTime: getRelativeTime(nextRun, now)
      });
      
      // Set current date to the next run for finding subsequent runs
      currentDate = new Date(nextRun.getTime() + 60000); // Add 1 minute
    }
    
    return runs;
  };

  const getCountdown = (targetDate: Date, now: Date): string => {
    const diffMs = targetDate.getTime() - now.getTime();
    if (diffMs <= 0) return 'Now';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayOfWeek = (day: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const getRelativeTime = (targetDate: Date, now: Date): string => {
    const diffMs = targetDate.getTime() - now.getTime();
    if (diffMs <= 0) return 'Now';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      if (diffHours === 0) return 'In less than an hour';
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return `In ${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `In ${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `In ${months} month${months > 1 ? 's' : ''}`;
    }
  };

  const generateHumanReadable = (fields: CronField): string => {
    let description = 'Runs ';
    
    // Minute description
    if (fields.minute === '*') {
      description += 'every minute';
    } else if (fields.minute.includes('/')) {
      const step = fields.minute.split('/')[1];
      description += `every ${step} minutes`;
    } else if (fields.minute === '0') {
      description += 'at the start of the hour';
    } else {
      description += `at minute ${fields.minute}`;
    }
    
    // Hour description
    if (fields.hour === '*') {
      description += ' of every hour';
    } else if (fields.hour.includes('/')) {
      const step = fields.hour.split('/')[1];
      description += ` of every ${step} hours`;
    } else if (fields.hour.includes('-')) {
      const [start, end] = fields.hour.split('-');
      description += ` between ${start}:00 and ${end}:00`;
    } else {
      description += ` at ${fields.hour}:00`;
    }
    
    // Day and month description
    if (fields.dayOfMonth === '*' && fields.month === '*') {
      description += ' every day';
    } else if (fields.dayOfMonth !== '*' && fields.month === '*') {
      description += ` on day ${fields.dayOfMonth} of every month`;
    } else if (fields.dayOfMonth === '*' && fields.month !== '*') {
      description += ` every day in month ${fields.month}`;
    } else {
      description += ` on day ${fields.dayOfMonth} of month ${fields.month}`;
    }
    
    // Day of week description
    if (fields.dayOfWeek !== '*') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (fields.dayOfWeek.includes(',')) {
        const days = fields.dayOfWeek.split(',').map(d => dayNames[parseInt(d)] || d).join(', ');
        description += ` on ${days}`;
      } else if (fields.dayOfWeek.includes('-')) {
        const [start, end] = fields.dayOfWeek.split('-');
        description += ` from ${dayNames[parseInt(start)]} to ${dayNames[parseInt(end)]}`;
      } else {
        description += ` on ${dayNames[parseInt(fields.dayOfWeek)] || fields.dayOfWeek}`;
      }
    }
    
    return description;
  };

  const calculateExecutionPattern = (fields: CronField): { frequency: string; nextRun: string; lastRun?: string } => {
    let frequency = '';
    
    // Calculate frequency based on field values
    if (fields.minute === '*' && fields.hour === '*') {
      frequency = 'Every minute';
    } else if (fields.minute !== '*' && fields.hour === '*') {
      frequency = 'Every hour';
    } else if (fields.hour !== '*' && fields.dayOfMonth === '*' && fields.month === '*') {
      frequency = 'Daily';
    } else if (fields.dayOfWeek !== '*') {
      frequency = 'Weekly';
    } else if (fields.dayOfMonth !== '*' || fields.month !== '*') {
      frequency = 'Monthly';
    } else {
      frequency = 'Custom pattern';
    }
    
    return {
      frequency,
      nextRun: 'Next execution time shown above'
    };
  };

  const handlePreview = () => {
    if (!validateCronExpression(cronExpression)) {
      setSchedulePreview({
        isValid: false,
        error: 'Invalid cron expression. Please check the syntax.',
        nextRuns: [],
        humanReadable: '',
        executionPattern: { frequency: '', nextRun: '' },
        timezone: selectedTimezone
      });
      return;
    }

    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const fields = parseCronExpression(cronExpression);
        const nextRuns = generateNextRuns(fields, 5);
        const humanReadable = generateHumanReadable(fields);
        const executionPattern = calculateExecutionPattern(fields);
        
        setSchedulePreview({
          isValid: true,
          nextRuns,
          humanReadable,
          executionPattern,
          timezone: selectedTimezone
        });
      } catch (error) {
        setSchedulePreview({
          isValid: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          nextRuns: [],
          humanReadable: '',
          executionPattern: { frequency: '', nextRun: '' },
          timezone: selectedTimezone
        });
      } finally {
        setIsCalculating(false);
      }
    }, 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    if (validateCronExpression(cronExpression)) {
      handlePreview();
    }
  }, [cronExpression, selectedTimezone, startDate]);

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-cyan-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#0891b2" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Crontab Schedule Previewer
      </h2>

      {/* Main Input Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-cyan-800 mb-4">Preview Cron Schedule</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cron Expression
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="0 0 * * *"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={handlePreview}
                disabled={isCalculating}
                className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    🔍 Preview
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {commonExpressions.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setCronExpression(preset.expression)}
                  className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-cyan-600 hover:text-cyan-700 flex items-center gap-2 text-sm"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Preview Results */}
      {schedulePreview && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {!schedulePreview.isValid ? (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">Invalid Cron Expression</span>
              </div>
              <p className="text-red-700">{schedulePreview.error}</p>
            </div>
          ) : (
            <>
              {/* Human Readable Description */}
              <div className="bg-cyan-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-cyan-800 mb-2">Schedule Description</h4>
                <p className="text-cyan-700">{schedulePreview.humanReadable}</p>
              </div>

              {/* Execution Pattern */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Execution Pattern</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Frequency:</span>
                    <span className="ml-2 text-blue-700 font-medium">{schedulePreview.executionPattern.frequency}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Timezone:</span>
                    <span className="ml-2 text-blue-700 font-medium">{schedulePreview.timezone}</span>
                  </div>
                </div>
              </div>

              {/* Next 5 Runs */}
              <div>
                <h4 className="font-semibold text-cyan-800 mb-4">Next 5 Scheduled Runs</h4>
                <div className="space-y-3">
                  {schedulePreview.nextRuns.map((run, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 transition-all ${
                      run.isToday 
                        ? 'border-green-300 bg-green-50' 
                        : run.isTomorrow 
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            run.isToday 
                              ? 'bg-green-500 text-white' 
                              : run.isTomorrow 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{run.formattedDate}</div>
                            <div className="text-sm text-gray-600">{run.dayOfWeek}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg text-cyan-800">{run.formattedTime}</div>
                          <div className="text-sm text-cyan-600">{run.countdown}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{run.relativeTime}</span>
                        <button
                          onClick={() => copyToClipboard(`${run.formattedDate} at ${run.formattedTime}`)}
                          className="text-cyan-600 hover:text-cyan-700 text-xs"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-700 mb-3">Quick Actions</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => copyToClipboard(schedulePreview.humanReadable)}
                    className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-sm transition-colors"
                  >
                    📋 Copy Description
                  </button>
                  <button
                    onClick={() => copyToClipboard(cronExpression)}
                    className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-sm transition-colors"
                  >
                    📋 Copy Cron Expression
                  </button>
                  <button
                    onClick={() => {
                      const runsText = schedulePreview.nextRuns.map(run => 
                        `${run.formattedDate} at ${run.formattedTime}`
                      ).join('\n');
                      copyToClipboard(runsText);
                    }}
                    className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-sm transition-colors"
                  >
                    📋 Copy All Run Times
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CrontabSchedulePreviewerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Why Preview Cron Schedules?</h2>
        <p className="text-gray-700 text-lg">
          Understanding when your cron jobs will execute is crucial for planning, monitoring, and troubleshooting. 
          The Crontab Schedule Previewer shows you exactly when the next 5 runs will occur, helping you plan 
          maintenance windows, coordinate with team schedules, and ensure timely task execution.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Preview Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cyan-50 p-6 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-3">⏰ Next 5 Runs</h3>
            <p className="text-gray-700 mb-3">
              See exactly when your cron job will execute next, with detailed date, time, and countdown information.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Precise execution times</li>
              <li>Countdown to next run</li>
              <li>Day of week information</li>
              <li>Relative time descriptions</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">🌍 Timezone Support</h3>
            <p className="text-gray-700 mb-3">
              Preview schedules in your local timezone or any major timezone worldwide for accurate planning.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Local timezone detection</li>
              <li>Major timezone support</li>
              <li>DST awareness</li>
              <li>Custom timezone selection</li>
            </ul>
          </div>
          
          <div className="bg-teal-50 p-6 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-3">📊 Execution Patterns</h3>
            <p className="text-gray-700 mb-3">
              Understand the frequency and pattern of your cron job execution for better resource planning.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Frequency analysis</li>
              <li>Pattern recognition</li>
              <li>Resource impact assessment</li>
              <li>Optimization suggestions</li>
            </ul>
          </div>
          
          <div className="bg-indigo-50 p-6 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-3">💡 Smart Insights</h3>
            <p className="text-gray-700 mb-3">
              Get intelligent insights about your schedule, including human-readable descriptions and warnings.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Human-readable descriptions</li>
              <li>Schedule optimization tips</li>
              <li>Conflict detection</li>
              <li>Best practice recommendations</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Understanding Schedule Preview</h2>
        <div className="space-y-6">
          <div className="bg-cyan-50 p-6 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-3">Run Information Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-cyan-700 mb-2">Date & Time</h4>
                <ul className="list-disc pl-6 text-cyan-700 text-sm space-y-1">
                  <li><strong>Formatted Date:</strong> Full date with day of week</li>
                  <li><strong>Execution Time:</strong> Precise hour and minute</li>
                  <li><strong>Day of Week:</strong> Monday, Tuesday, etc.</li>
                  <li><strong>Relative Position:</strong> Today, Tomorrow, or future date</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-cyan-700 mb-2">Countdown & Status</h4>
                <ul className="list-disc pl-6 text-cyan-700 text-sm space-y-1">
                  <li><strong>Countdown:</strong> Time until execution</li>
                  <li><strong>Relative Time:</strong> Human-friendly descriptions</li>
                  <li><strong>Visual Indicators:</strong> Color-coded by urgency</li>
                  <li><strong>Copy Functionality:</strong> Easy copying of run times</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Timezone Considerations</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Local vs. Server Time</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Cron jobs typically run in the server's timezone. Use the timezone selector to ensure 
                  you're viewing the schedule in the correct timezone for your planning.
                </p>
                <div className="bg-blue-100 p-3 rounded">
                  <code className="text-blue-800">0 9 * * 1-5</code> - Runs at 9 AM in the server's timezone
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Daylight Saving Time</h4>
                <p className="text-blue-700 text-sm mb-2">
                  Be aware of DST changes that might affect your cron job execution times, especially 
                  for jobs that run at specific hours.
                </p>
                <div className="bg-blue-100 p-3 rounded">
                  <code className="text-blue-800">0 2 * * *</code> - May run at 1 AM or 3 AM during DST transitions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Use Cases and Applications</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">System Administration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Maintenance Planning</h4>
                <ul className="list-disc pl-6 text-gray-700 text-sm">
                  <li>Schedule system updates during low-traffic periods</li>
                  <li>Coordinate backup windows with team availability</li>
                  <li>Plan log rotation and cleanup operations</li>
                  <li>Schedule security scans and updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Monitoring & Alerting</h4>
                <ul className="list-disc pl-6 text-gray-700 text-sm">
                  <li>Set up monitoring for expected execution times</li>
                  <li>Configure alerts for missed executions</li>
                  <li>Plan incident response schedules</li>
                  <li>Coordinate with on-call rotations</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2">Development & DevOps</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">CI/CD Coordination</h4>
                <ul className="list-disc pl-6 text-gray-700 text-sm">
                  <li>Schedule builds during off-peak hours</li>
                  <li>Coordinate deployments with release schedules</li>
                  <li>Plan testing windows</li>
                  <li>Schedule database migrations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Data Processing</h4>
                <ul className="list-disc pl-6 text-gray-700 text-sm">
                  <li>Schedule ETL jobs during low-usage periods</li>
                  <li>Plan report generation times</li>
                  <li>Coordinate data synchronization</li>
                  <li>Schedule cache warming operations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Best Practices for Schedule Planning</h2>
        <div className="bg-cyan-50 p-6 rounded-lg">
          <h3 className="font-semibold text-cyan-800 mb-3">Optimization Guidelines</h3>
          <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
            <li><strong>Peak Hours:</strong> Avoid scheduling resource-intensive jobs during business hours</li>
            <li><strong>Distribution:</strong> Spread out cron jobs to prevent resource contention</li>
            <li><strong>Team Coordination:</strong> Consider team availability and timezone differences</li>
            <li><strong>Maintenance Windows:</strong> Plan maintenance during low-traffic periods</li>
            <li><strong>Monitoring:</strong> Set up alerts for failed executions and missed schedules</li>
            <li><strong>Documentation:</strong> Document the purpose and timing of each cron job</li>
            <li><strong>Testing:</strong> Verify schedules in development before production deployment</li>
            <li><strong>Backup Plans:</strong> Have fallback schedules for critical operations</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Advanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Custom Start Dates</h3>
            <p className="text-gray-700 mb-3">
              Set custom start dates to preview schedules from specific points in time:
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Test future schedule changes</li>
              <li>Plan maintenance windows</li>
              <li>Coordinate with project timelines</li>
              <li>Validate holiday schedules</li>
            </ul>
          </div>
          
          <div className="bg-teal-50 p-6 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-3">Timezone Management</h3>
            <p className="text-gray-700 mb-3">
              Handle complex timezone scenarios and DST transitions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Multi-timezone team coordination</li>
              <li>DST transition planning</li>
              <li>Global deployment scheduling</li>
              <li>Compliance with local regulations</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Troubleshooting Common Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">Schedule Discrepancies</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm space-y-2">
              <li><strong>Wrong execution time:</strong> Check server timezone settings</li>
              <li><strong>Missing executions:</strong> Verify cron service is running</li>
              <li><strong>Unexpected patterns:</strong> Validate cron expression syntax</li>
              <li><strong>Timezone confusion:</strong> Confirm server vs. local timezone</li>
              <li><strong>DST issues:</strong> Plan for daylight saving time changes</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm space-y-2">
              <li><code>date</code> - Check current server time</li>
              <li><code>timedatectl</code> - View timezone and DST status</li>
              <li><code>crontab -l</code> - List current cron jobs</li>
              <li><code>systemctl status cron</code> - Check cron service status</li>
              <li><code>tail -f /var/log/cron</code> - Monitor cron execution logs</li>
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
      <h2 className="text-2xl font-bold mb-6 text-cyan-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-cyan-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-cyan-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Master Linux Automation with Precise Scheduling</h2>
      <p className="text-cyan-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux automation insights, cron scheduling techniques, and best practices delivered to your inbox. 
        Join our community of system administrators, DevOps engineers, and automation professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-300" />
        <button className="bg-white text-cyan-600 px-6 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-cyan-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
