'use client';

import React, { useState } from 'react';

interface TimezoneConversion {
  id: string;
  originalCron: string;
  sourceTimezone: string;
  targetTimezone: string;
  convertedCron: string;
  explanation: string;
  createdAt: Date;
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

export const TimezoneCronAdjuster: React.FC = () => {
  const [originalCron, setOriginalCron] = useState('');
  const [sourceTimezone, setSourceTimezone] = useState('America/New_York');
  const [targetTimezone, setTargetTimezone] = useState('UTC');
  const [convertedCron, setConvertedCron] = useState('');
  const [conversionHistory, setConversionHistory] = useState<TimezoneConversion[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
    { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
    { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
    { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST/NZDT)' }
  ];

  const parseCronExpression = (cron: string): { minute: number; hour: number; day: number; month: number; weekday: number } | null => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5) return null;

    try {
      return {
        minute: parseInt(parts[0]) || 0,
        hour: parseInt(parts[1]) || 0,
        day: parseInt(parts[2]) || 1,
        month: parseInt(parts[3]) || 1,
        weekday: parseInt(parts[4]) || 0
      };
    } catch {
      return null;
    }
  };

  const convertTimezone = (cron: string, fromTz: string, toTz: string): string => {
    const parsed = parseCronExpression(cron);
    if (!parsed) return 'Invalid cron expression';

    try {
      // Create a date object in the source timezone
      const now = new Date();
      const sourceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parsed.hour, parsed.minute);
      
      // Get timezone offsets (simplified approach)
      const offsetMap: { [key: string]: number } = {
        'UTC': 0,
        'America/New_York': -5, // EST
        'America/Chicago': -6,  // CST
        'America/Denver': -7,   // MST
        'America/Los_Angeles': -8, // PST
        'Europe/London': 0,     // GMT
        'Europe/Paris': 1,      // CET
        'Europe/Berlin': 1,     // CET
        'Asia/Tokyo': 9,        // JST
        'Asia/Shanghai': 8,     // CST
        'Asia/Kolkata': 5.5,    // IST
        'Australia/Sydney': 10, // AEST
        'Pacific/Auckland': 12  // NZST
      };

      const fromOffset = offsetMap[fromTz] || 0;
      const toOffset = offsetMap[toTz] || 0;
      const offsetDiff = toOffset - fromOffset;

      // Adjust hour
      let newHour = parsed.hour + offsetDiff;
      let newDay = parsed.day;
      let newMonth = parsed.month;
      let newYear = now.getFullYear();

      // Handle day/month/year rollovers
      if (newHour >= 24) {
        newHour -= 24;
        newDay++;
        if (newDay > 31) {
          newDay = 1;
          newMonth++;
          if (newMonth > 12) {
            newMonth = 1;
            newYear++;
          }
        }
      } else if (newHour < 0) {
        newHour += 24;
        newDay--;
        if (newDay < 1) {
          newDay = 31;
          newMonth--;
          if (newMonth < 1) {
            newMonth = 12;
            newYear--;
          }
        }
      }

      // Ensure valid ranges
      newHour = Math.max(0, Math.min(23, newHour));
      newDay = Math.max(1, Math.min(31, newDay));
      newMonth = Math.max(1, Math.min(12, newMonth));

      return `${parsed.minute} ${newHour} ${newDay} ${newMonth} ${parsed.weekday}`;
    } catch (error) {
      return 'Error converting timezone';
    }
  };

  const getTimezoneExplanation = (fromTz: string, toTz: string, originalHour: number, convertedHour: number): string => {
    const offsetMap: { [key: string]: string } = {
      'UTC': 'UTC',
      'America/New_York': 'EST/EDT (UTC-5/UTC-4)',
      'America/Chicago': 'CST/CDT (UTC-6/UTC-5)',
      'America/Denver': 'MST/MDT (UTC-7/UTC-6)',
      'America/Los_Angeles': 'PST/PDT (UTC-8/UTC-7)',
      'Europe/London': 'GMT/BST (UTC+0/UTC+1)',
      'Europe/Paris': 'CET/CEST (UTC+1/UTC+2)',
      'Europe/Berlin': 'CET/CEST (UTC+1/UTC+2)',
      'Asia/Tokyo': 'JST (UTC+9)',
      'Asia/Shanghai': 'CST (UTC+8)',
      'Asia/Kolkata': 'IST (UTC+5:30)',
      'Australia/Sydney': 'AEST/AEDT (UTC+10/UTC+11)',
      'Pacific/Auckland': 'NZST/NZDT (UTC+12/UTC+13)'
    };

    const fromLabel = offsetMap[fromTz] || fromTz;
    const toLabel = offsetMap[toTz] || toTz;
    
    let timeChange = '';
    if (convertedHour > originalHour) {
      timeChange = `moved forward by ${convertedHour - originalHour} hour(s)`;
    } else if (convertedHour < originalHour) {
      timeChange = `moved backward by ${originalHour - convertedHour} hour(s)`;
    } else {
      timeChange = 'remained the same';
    }

    return `Converting from ${fromLabel} to ${toLabel}. The execution time has ${timeChange}.`;
  };

  const handleConvert = () => {
    if (!originalCron.trim()) return;

    const converted = convertTimezone(originalCron, sourceTimezone, targetTimezone);
    setConvertedCron(converted);

    // Parse for explanation
    const parsed = parseCronExpression(originalCron);
    const convertedParsed = parseCronExpression(converted);
    
    let explanation = '';
    if (parsed && convertedParsed) {
      explanation = getTimezoneExplanation(sourceTimezone, targetTimezone, parsed.hour, convertedParsed.hour);
    }

    // Add to history
    const newConversion: TimezoneConversion = {
      id: generateId(),
      originalCron: originalCron,
      sourceTimezone: sourceTimezone,
      targetTimezone: targetTimezone,
      convertedCron: converted,
      explanation: explanation,
      createdAt: new Date()
    };

    setConversionHistory([newConversion, ...conversionHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setConversionHistory([]);
    setConvertedCron('');
  };

  const validateCronExpression = (cron: string): boolean => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5) return false;
    
    try {
      const minute = parseInt(parts[0]);
      const hour = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      const month = parseInt(parts[3]);
      const weekday = parseInt(parts[4]);
      
      return minute >= 0 && minute <= 59 &&
             hour >= 0 && hour <= 23 &&
             day >= 1 && day <= 31 &&
             month >= 1 && month <= 12 &&
             weekday >= 0 && weekday <= 7;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Convert Cron Job Between Timezones</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cron Expression
            </label>
            <input
              type="text"
              value={originalCron}
              onChange={(e) => setOriginalCron(e.target.value)}
              placeholder="e.g., 0 9 * * 1 (9:00 AM every Monday)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                originalCron && !validateCronExpression(originalCron) 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-300'
              }`}
            />
            <p className="text-sm text-gray-500 mt-1">
              Format: minute hour day month weekday (e.g., 0 9 * * 1)
            </p>
            {originalCron && !validateCronExpression(originalCron) && (
              <p className="text-sm text-red-600 mt-1">
                Invalid cron expression. Please check the format.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Timezone
              </label>
              <select
                value={sourceTimezone}
                onChange={(e) => setSourceTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Target Timezone
              </label>
              <select
                value={targetTimezone}
                onChange={(e) => setTargetTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={handleConvert}
            disabled={!originalCron.trim() || !validateCronExpression(originalCron)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Convert Timezone
          </button>
        </div>
      </div>

      {/* Converted Cron */}
      {convertedCron && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Converted Cron Expression</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">New Cron:</span>
              <button
                onClick={() => copyToClipboard(convertedCron)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Copy
              </button>
            </div>
            <code className="block bg-white p-3 rounded text-lg border font-mono">
              {convertedCron}
            </code>
            <p className="text-sm text-gray-600 mt-2">
              This cron expression will execute at the same absolute time in {targetTimezone}.
            </p>
          </div>
        </div>
      )}

      {/* Conversion History */}
      {conversionHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Conversion History</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {conversionHistory.map((conversion) => (
              <div key={conversion.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Original:</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Cron:</strong> <code className="bg-gray-100 px-1 rounded">{conversion.originalCron}</code>
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Timezone:</strong> {conversion.sourceTimezone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Converted:</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Cron:</strong> <code className="bg-gray-100 px-1 rounded">{conversion.convertedCron}</code>
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Timezone:</strong> {conversion.targetTimezone}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{conversion.explanation}</p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(conversion.convertedCron)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Copy Converted
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Examples */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Common Timezone Conversions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Business Hours (9 AM)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">9:00 AM EST</span>
                <span className="text-gray-600">→ 14:00 UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">9:00 AM PST</span>
                <span className="text-gray-600">→ 17:00 UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">9:00 AM CET</span>
                <span className="text-gray-600">→ 08:00 UTC</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Maintenance Windows</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">2:00 AM EST</span>
                <span className="text-gray-600">→ 07:00 UTC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">11:00 PM PST</span>
                <span className="text-gray-600">→ 07:00 UTC (next day)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">3:00 AM JST</span>
                <span className="text-gray-600">→ 18:00 UTC (previous day)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for Timezone Conversion</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Use UTC for Server Operations</h4>
            <p className="text-gray-700 text-sm">
              Always convert cron jobs to UTC for server operations to avoid daylight saving time issues and ensure consistency across different server locations.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Consider DST Changes</h4>
            <p className="text-gray-700 text-sm">
              Be aware that some timezones have daylight saving time transitions that can affect your cron job execution times.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Document Timezone Assumptions</h4>
            <p className="text-gray-700 text-sm">
              Always document which timezone your cron expressions are written in to avoid confusion during maintenance.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Test After Conversion</h4>
            <p className="text-gray-700 text-sm">
              Verify that your converted cron jobs execute at the expected times by testing them in a safe environment first.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Enter Cron Expression</h4>
            <p className="text-sm">Input your cron expression in the standard format (minute hour day month weekday).</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Select Timezones</h4>
            <p className="text-sm">Choose the source timezone (where the cron was originally written) and target timezone (where you want to run it).</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Convert</h4>
            <p className="text-sm">Click "Convert Timezone" to get the equivalent cron expression in the target timezone.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Use the Result</h4>
            <p className="text-sm">Copy the converted cron expression and use it in your system. It will execute at the same absolute time.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimezoneCronAdjuster;
