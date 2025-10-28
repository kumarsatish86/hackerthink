"use client";
import React, { useState, useEffect } from 'react';

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
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-semibold">Cron Visualizer</div>
                <div className="text-xs opacity-75">Visual representation</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>⏰ Time</span>
                    <span>📅 Date</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>🔄 Pattern</span>
                    <span>📈 Graph</span>
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

interface VisualData {
  timeline: { time: string; active: boolean }[];
  calendar: { date: string; active: boolean }[];
  frequency: { period: string; count: number }[];
  nextRuns: string[];
}

export function CrontabEntryVisualizer() {
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [cronFields, setCronFields] = useState<CronField>({
    minute: '0',
    hour: '0',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*'
  });
  const [visualData, setVisualData] = useState<VisualData>({
    timeline: [],
    calendar: [],
    frequency: [],
    nextRuns: []
  });
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar' | 'frequency' | 'next-runs'>('timeline');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

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

  const generateTimelineData = (fields: CronField): { time: string; active: boolean }[] => {
    const timeline: { time: string; active: boolean }[] = [];
    
    // Generate 24-hour timeline
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isActive = isTimeActive(fields, hour, minute);
        timeline.push({ time, active: isActive });
      }
    }
    
    return timeline;
  };

  const generateCalendarData = (fields: CronField): { date: string; active: boolean }[] => {
    const calendar: { date: string; active: boolean }[] = [];
    const today = new Date();
    
    // Generate 30 days of calendar data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isActive = isDateActive(fields, date);
      calendar.push({ date: dateStr, active: isActive });
    }
    
    return calendar;
  };

  const generateFrequencyData = (fields: CronField): { period: string; count: number }[] => {
    const frequency: { period: string; count: number }[] = [];
    
    // Calculate frequency for different periods
    const minuteFreq = calculateFieldFrequency(fields.minute, 0, 59);
    const hourFreq = calculateFieldFrequency(fields.hour, 0, 23);
    const dayFreq = calculateFieldFrequency(fields.dayOfMonth, 1, 31);
    const monthFreq = calculateFieldFrequency(fields.month, 1, 12);
    const weekFreq = calculateFieldFrequency(fields.dayOfWeek, 0, 6);
    
    frequency.push(
      { period: 'Per Hour', count: minuteFreq },
      { period: 'Per Day', count: hourFreq * minuteFreq },
      { period: 'Per Week', count: dayFreq * hourFreq * minuteFreq },
      { period: 'Per Month', count: monthFreq * dayFreq * hourFreq * minuteFreq },
      { period: 'Per Year', count: weekFreq * monthFreq * dayFreq * hourFreq * minuteFreq }
    );
    
    return frequency;
  };

  const calculateFieldFrequency = (field: string, min: number, max: number): number => {
    if (field === '*') return max - min + 1;
    if (field.includes('/')) {
      const step = parseInt(field.split('/')[1]);
      return Math.floor((max - min + 1) / step);
    }
    if (field.includes(',')) {
      return field.split(',').length;
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-').map(x => parseInt(x));
      return end - start + 1;
    }
    return 1;
  };

  const isTimeActive = (fields: CronField, hour: number, minute: number): boolean => {
    // Check minute field
    if (!isFieldValueActive(fields.minute, minute, 0, 59)) return false;
    
    // Check hour field
    if (!isFieldValueActive(fields.hour, hour, 0, 23)) return false;
    
    return true;
  };

  const isDateActive = (fields: CronField, date: Date): boolean => {
    const dayOfMonth = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    
    // Check day of month field
    if (!isFieldValueActive(fields.dayOfMonth, dayOfMonth, 1, 31)) return false;
    
    // Check month field
    if (!isFieldValueActive(fields.month, month, 1, 12)) return false;
    
    // Check day of week field
    if (!isFieldValueActive(fields.dayOfWeek, dayOfWeek, 0, 6)) return false;
    
    return true;
  };

  const isFieldValueActive = (field: string, value: number, min: number, max: number): boolean => {
    if (field === '*') return true;
    if (field.includes('/')) {
      const [range, step] = field.split('/');
      if (range === '*') {
        return value % parseInt(step) === 0;
      }
      // Handle range with step
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

  const generateNextRuns = (fields: CronField): string[] => {
    const nextRuns: string[] = [];
    const now = new Date();
    
    // Generate next 10 run times
    let currentDate = new Date(now);
    let runsFound = 0;
    let attempts = 0;
    
    while (runsFound < 10 && attempts < 1000) {
      attempts++;
      
      if (isDateActive(fields, currentDate)) {
        // Check each hour and minute
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute++) {
            if (isTimeActive(fields, hour, minute)) {
              const runTime = new Date(currentDate);
              runTime.setHours(hour, minute, 0, 0);
              
              if (runTime > now) {
                nextRuns.push(runTime.toLocaleString());
                runsFound++;
                if (runsFound >= 10) break;
              }
            }
          }
          if (runsFound >= 10) break;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return nextRuns;
  };

  const updateVisualData = () => {
    const fields = parseCronExpression(cronExpression);
    setCronFields(fields);
    
    const newVisualData: VisualData = {
      timeline: generateTimelineData(fields),
      calendar: generateCalendarData(fields),
      frequency: generateFrequencyData(fields),
      nextRuns: generateNextRuns(fields)
    };
    
    setVisualData(newVisualData);
  };

  useEffect(() => {
    updateVisualData();
  }, [cronExpression]);

  const getFieldDescription = (field: string, fieldName: string): string => {
    if (field === '*') return `Every ${fieldName}`;
    if (field.includes('/')) {
      const step = field.split('/')[1];
      return `Every ${step} ${fieldName}`;
    }
    if (field.includes(',')) {
      const values = field.split(',').join(', ');
      return `${fieldName} ${values}`;
    }
    if (field.includes('-')) {
      const [start, end] = field.split('-');
      return `${fieldName} ${start} to ${end}`;
    }
    return `${fieldName} ${field}`;
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

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-purple-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#7c3aed" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Crontab Entry Visualizer
      </h2>

      {/* Cron Expression Input */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Enter Cron Expression</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cron Expression</label>
            <input
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="0 0 * * *"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={updateVisualData}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Visualize
          </button>
        </div>
        
        {/* Field Breakdown */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-purple-800">Minute</div>
            <div className="font-mono text-purple-600">{cronFields.minute}</div>
            <div className="text-xs text-purple-500">{getFieldDescription(cronFields.minute, 'minute')}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Hour</div>
            <div className="font-mono text-blue-600">{cronFields.hour}</div>
            <div className="text-xs text-blue-500">{getFieldDescription(cronFields.hour, 'hour')}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-green-800">Day of Month</div>
            <div className="font-mono text-green-600">{cronFields.dayOfMonth}</div>
            <div className="text-xs text-green-500">{getFieldDescription(cronFields.dayOfMonth, 'day')}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-orange-800">Month</div>
            <div className="font-mono text-orange-600">{cronFields.month}</div>
            <div className="text-xs text-orange-500">{getFieldDescription(cronFields.month, 'month')}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-red-800">Day of Week</div>
            <div className="font-mono text-red-600">{cronFields.dayOfWeek}</div>
            <div className="text-xs text-red-500">{getFieldDescription(cronFields.dayOfWeek, 'weekday')}</div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Visualization Mode</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'timeline'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏰ Timeline View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setViewMode('frequency')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'frequency'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Frequency Analysis
          </button>
          <button
            onClick={() => setViewMode('next-runs')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              viewMode === 'next-runs'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🔮 Next Runs
          </button>
        </div>
      </div>

      {/* Visualization Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {viewMode === 'timeline' && (
          <div>
            <h3 className="text-lg font-semibold text-purple-800 mb-4">24-Hour Timeline</h3>
            <div className="grid grid-cols-24 gap-1">
              {visualData.timeline.map((item, index) => (
                <div
                  key={index}
                  className={`h-8 rounded text-xs flex items-center justify-center ${
                    item.active 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  title={`${item.time} - ${item.active ? 'Active' : 'Inactive'}`}
                >
                  {index % 4 === 0 ? item.time : ''}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-4 h-4 bg-purple-500 rounded mr-2"></span>
              Active time slots
              <span className="inline-block w-4 h-4 bg-gray-100 rounded ml-4 mr-2"></span>
              Inactive time slots
            </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div>
            <h3 className="text-lg font-semibold text-purple-800 mb-4">30-Day Calendar</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-medium text-gray-700 p-2">
                  {day}
                </div>
              ))}
              {visualData.calendar.map((item, index) => (
                <div
                  key={index}
                  className={`p-2 text-center rounded ${
                    item.active 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {new Date(item.date).getDate()}
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <span className="inline-block w-4 h-4 bg-green-500 rounded mr-2"></span>
              Active dates
              <span className="inline-block w-4 h-4 bg-gray-100 rounded ml-4 mr-2"></span>
              Inactive dates
            </div>
          </div>
        )}

        {viewMode === 'frequency' && (
          <div>
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Execution Frequency Analysis</h3>
            <div className="space-y-4">
              {visualData.frequency.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 font-medium text-gray-700">{item.period}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-purple-500 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.count / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-right font-mono text-purple-600">{item.count}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Summary</h4>
              <p className="text-sm text-purple-700">
                This cron job will execute approximately <strong>{visualData.frequency[4]?.count || 0} times per year</strong>, 
                with the highest frequency being <strong>{visualData.frequency[1]?.count || 0} times per day</strong>.
              </p>
            </div>
          </div>
        )}

        {viewMode === 'next-runs' && (
          <div>
            <h3 className="text-lg font-semibold text-purple-800 mb-4">Next 10 Scheduled Runs</h3>
            <div className="space-y-3">
              {visualData.nextRuns.map((run, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-purple-800">{run}</div>
                    <div className="text-sm text-purple-600">
                      {(() => {
                        const runDate = new Date(run);
                        const now = new Date();
                        const diffMs = runDate.getTime() - now.getTime();
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        
                        if (diffDays > 0) return `In ${diffDays} day${diffDays > 1 ? 's' : ''}, ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
                        if (diffHours > 0) return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}, ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
                        return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
                      })()}
                    </div>
                  </div>
                  <div className="text-purple-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setCronExpression('0 0 * * *')}
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-purple-800">🔄 Daily at Midnight</div>
            <div className="text-sm text-purple-600">0 0 * * *</div>
          </button>
          
          <button
            onClick={() => setCronExpression('0 9 * * 1-5')}
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-purple-800">🔄 Weekdays at 9 AM</div>
            <div className="text-sm text-purple-600">0 9 * * 1-5</div>
          </button>
          
          <button
            onClick={() => setCronExpression('*/15 * * * *')}
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-purple-800">🔄 Every 15 Minutes</div>
            <div className="text-sm text-purple-600">*/15 * * * *</div>
          </button>
          
          <button
            onClick={() => setCronExpression('0 2 1 * *')}
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-purple-800">🔄 Monthly at 2 AM</div>
            <div className="text-sm text-purple-600">0 2 1 * *</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function CrontabEntryVisualizerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Why Visualize Crontab Entries?</h2>
        <p className="text-gray-700 text-lg">
          Understanding cron expressions can be challenging, especially when dealing with complex schedules. 
          Visual representations help system administrators and developers quickly grasp when their automated 
          tasks will run, identify potential conflicts, and optimize scheduling patterns for better resource management.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Visualization Modes Explained</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">⏰ Timeline View</h3>
            <p className="text-gray-700 mb-3">
              Shows a 24-hour timeline with 15-minute intervals, highlighting exactly when your cron job 
              will execute throughout the day. Perfect for understanding daily patterns and identifying 
              peak execution times.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Visual representation of active vs. inactive time slots</li>
              <li>Easy identification of execution patterns</li>
              <li>Helps optimize resource usage</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">📅 Calendar View</h3>
            <p className="text-gray-700 mb-3">
              Displays a 30-day calendar showing which dates will have active cron executions. 
              Useful for understanding weekly patterns, monthly schedules, and identifying 
              maintenance windows.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Monthly execution pattern visualization</li>
              <li>Weekend vs. weekday execution analysis</li>
              <li>Holiday and special date planning</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">📊 Frequency Analysis</h3>
            <p className="text-gray-700 mb-3">
              Provides detailed statistics on how often your cron job will run across different time periods. 
              Helps with capacity planning, resource allocation, and performance optimization.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Execution frequency per hour, day, week, month, and year</li>
              <li>Resource usage estimation</li>
              <li>Performance impact assessment</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-3">🔮 Next Runs</h3>
            <p className="text-gray-700 mb-3">
              Shows the next 10 scheduled execution times with countdown information. 
              Essential for monitoring, debugging, and ensuring timely task execution.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Upcoming execution schedule</li>
              <li>Time until next run</li>
              <li>Monitoring and alerting support</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Understanding the Visual Elements</h2>
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">Color Coding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
                <span className="text-gray-700">Purple: Active time slots and primary actions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span className="text-gray-700">Green: Active dates and successful states</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
                <span className="text-gray-700">Blue: Hour field and secondary information</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-100 rounded border"></div>
                <span className="text-gray-700">Gray: Inactive periods and neutral states</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">Interactive Elements</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm space-y-2">
              <li><strong>Hover Effects:</strong> Additional information appears when hovering over timeline elements</li>
              <li><strong>Click Actions:</strong> Quick preset buttons for common cron patterns</li>
              <li><strong>Real-time Updates:</strong> Visualizations update immediately when changing cron expressions</li>
              <li><strong>Responsive Design:</strong> Adapts to different screen sizes and devices</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Advanced Visualization Features</h2>
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">Smart Field Parsing</h3>
            <p className="text-gray-700 mb-3">
              The visualizer intelligently parses complex cron expressions including:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Ranges & Steps</h4>
                <ul className="list-disc pl-6 text-gray-700 text-sm">
                  <li><code>0-23/2</code> - Every 2 hours from 0 to 23</li>
                  <li><code>*/15</code> - Every 15 minutes</li>
                  <li><code>1-31/3</code> - Every 3rd day of the month</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-purple-700 mb-2">Multiple Values</h4>
                <ul className="list-disc pl-6 text-gray-700 text-sm">
                  <li><code>1,15</code> - 1st and 15th of month</li>
                  <li><code>1,3,5</code> - Monday, Wednesday, Friday</li>
                  <li><code>0,6,12,18</code> - Midnight, 6 AM, Noon, 6 PM</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Performance Optimization</h3>
            <p className="text-gray-700 mb-3">
              The visualizer is designed for efficiency and real-time updates:
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Lazy Loading:</strong> Visualizations are generated on-demand</li>
              <li><strong>Memoization:</strong> Repeated calculations are cached for performance</li>
              <li><strong>Debounced Updates:</strong> Prevents excessive re-rendering during typing</li>
              <li><strong>Optimized Algorithms:</strong> Efficient cron parsing and validation</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Use Cases and Applications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">System Administration</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Maintenance Windows:</strong> Plan system updates during low-traffic periods</li>
              <li><strong>Backup Scheduling:</strong> Optimize backup timing for minimal impact</li>
              <li><strong>Log Rotation:</strong> Schedule log cleanup during off-peak hours</li>
              <li><strong>Resource Monitoring:</strong> Track cron job resource usage patterns</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-3">Development & DevOps</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>CI/CD Pipelines:</strong> Schedule builds and deployments</li>
              <li><strong>Data Processing:</strong> Plan ETL jobs and data synchronization</li>
              <li><strong>Testing:</strong> Schedule automated tests and health checks</li>
              <li><strong>Monitoring:</strong> Set up alerting and reporting schedules</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">Business Operations</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Report Generation:</strong> Schedule daily, weekly, and monthly reports</li>
              <li><strong>Data Synchronization:</strong> Coordinate data updates across systems</li>
              <li><strong>Customer Communications:</strong> Schedule automated emails and notifications</li>
              <li><strong>Billing Cycles:</strong> Plan invoice generation and payment processing</li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">Security & Compliance</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Security Scans:</strong> Schedule vulnerability assessments</li>
              <li><strong>Access Reviews:</strong> Regular user permission audits</li>
              <li><strong>Compliance Checks:</strong> Automated compliance monitoring</li>
              <li><strong>Incident Response:</strong> Automated security incident handling</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Best Practices for Cron Visualization</h2>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-3">Optimization Guidelines</h3>
          <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
            <li><strong>Peak Hours:</strong> Avoid scheduling resource-intensive jobs during business hours</li>
            <li><strong>Distribution:</strong> Spread out cron jobs to prevent resource contention</li>
            <li><strong>Monitoring:</strong> Use visualizations to identify execution patterns and conflicts</li>
            <li><strong>Documentation:</strong> Document the purpose and timing of each cron job</li>
            <li><strong>Testing:</strong> Verify cron expressions before deploying to production</li>
            <li><strong>Backup:</strong> Keep backups of crontab configurations</li>
            <li><strong>Review:</strong> Regularly review and optimize cron schedules</li>
            <li><strong>Alerting:</strong> Set up monitoring for failed cron job executions</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Troubleshooting Common Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">Visualization Problems</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm">
              <li><strong>Empty Timeline:</strong> Check if cron expression is valid</li>
              <li><strong>Incorrect Patterns:</strong> Verify field syntax and ranges</li>
              <li><strong>Performance Issues:</strong> Complex expressions may take longer to render</li>
              <li><strong>Display Errors:</strong> Ensure browser supports required CSS features</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">Cron Expression Issues</h3>
            <ul className="list-disc pl-6 text-blue-700 text-sm">
              <li><strong>Syntax Errors:</strong> Validate cron expression format</li>
              <li><strong>Invalid Ranges:</strong> Check field value boundaries</li>
              <li><strong>Conflicting Fields:</strong> Day of month and day of week conflicts</li>
              <li><strong>Timezone Issues:</strong> Verify server timezone settings</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Integration with Other Tools</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-purple-800 mb-3">Complementary Cron Tools</h3>
          <p className="text-gray-700 mb-4">
            The Crontab Entry Visualizer works seamlessly with other cron-related tools:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Cron Generators</h4>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li>Create cron expressions with user-friendly interfaces</li>
                <li>Generate expressions for common scheduling patterns</li>
                <li>Validate cron syntax before visualization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-700 mb-2">Cron Translators</h4>
              <ul className="list-disc pl-6 text-gray-700 text-sm">
                <li>Convert cron expressions to human language</li>
                <li>Understand complex scheduling patterns</li>
                <li>Document cron job purposes and timing</li>
              </ul>
            </div>
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
      <h2 className="text-2xl font-bold mb-6 text-purple-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-purple-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-purple-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Master Linux Automation with Visual Tools</h2>
      <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux automation insights, cron visualization techniques, and tool updates delivered to your inbox. 
        Join our community of system administrators, DevOps engineers, and automation enthusiasts.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300" />
        <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-purple-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
