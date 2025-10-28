'use client';

import React, { useState } from 'react';

interface HolidaySafeSchedule {
  id: string;
  scheduleType: string;
  executionTime: string;
  skipWeekends: boolean;
  skipHolidays: boolean;
  customHolidays: string[];
  generatedCron: string;
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

export const HolidaySafeScheduler: React.FC = () => {
  const [scheduleType, setScheduleType] = useState('daily');
  const [executionTime, setExecutionTime] = useState('09:00');
  const [skipWeekends, setSkipWeekends] = useState(true);
  const [skipHolidays, setSkipHolidays] = useState(true);
  const [customHolidays, setCustomHolidays] = useState<string[]>([]);
  const [newHoliday, setNewHoliday] = useState('');
  const [generatedCron, setGeneratedCron] = useState('');
  const [scheduleHistory, setScheduleHistory] = useState<HolidaySafeSchedule[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const scheduleTypes = [
    { value: 'daily', label: 'Daily', description: 'Every day at specified time' },
    { value: 'weekly', label: 'Weekly', description: 'Every week on specified day' },
    { value: 'monthly', label: 'Monthly', description: 'Every month on specified date' },
    { value: 'business-days', label: 'Business Days Only', description: 'Monday to Friday only' },
    { value: 'quarterly', label: 'Quarterly', description: 'Every 3 months' }
  ];

  const weekdays = [
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
    { value: '0', label: 'Sunday' }
  ];

  const commonHolidays = [
    '01-01', // New Year's Day
    '07-04', // Independence Day (US)
    '12-25', // Christmas Day
    '01-15', // Martin Luther King Jr. Day (3rd Monday)
    '02-19', // Presidents' Day (3rd Monday)
    '05-28', // Memorial Day (Last Monday)
    '09-03', // Labor Day (1st Monday)
    '10-08', // Columbus Day (2nd Monday)
    '11-11', // Veterans Day
    '11-22', // Thanksgiving (4th Thursday)
  ];

  const generateCronExpression = (): string => {
    const [hour, minute] = executionTime.split(':');
    
    switch (scheduleType) {
      case 'daily':
        if (skipWeekends) {
          return `${minute} ${hour} * * 1-5`;
        }
        return `${minute} ${hour} * * *`;
        
      case 'weekly':
        if (skipWeekends) {
          return `${minute} ${hour} * * 1-5`;
        }
        return `${minute} ${hour} * * 1`;
        
      case 'monthly':
        if (skipWeekends) {
          // This is complex - would need custom logic for month-end adjustments
          return `${minute} ${hour} 1-31 * 1-5`;
        }
        return `${minute} ${hour} 1-31 * *`;
        
      case 'business-days':
        return `${minute} ${hour} * * 1-5`;
        
      case 'quarterly':
        if (skipWeekends) {
          return `${minute} ${hour} 1 1,4,7,10 1-5`;
        }
        return `${minute} ${hour} 1 1,4,7,10 *`;
        
      default:
        return `${minute} ${hour} * * *`;
    }
  };

  const getScheduleExplanation = (): string => {
    const [hour, minute] = executionTime.split(':');
    const timeStr = `${hour}:${minute}`;
    
    let explanation = '';
    
    switch (scheduleType) {
      case 'daily':
        if (skipWeekends) {
          explanation = `Executes every weekday (Monday-Friday) at ${timeStr}. Skips weekends.`;
        } else {
          explanation = `Executes every day at ${timeStr}.`;
        }
        break;
        
      case 'weekly':
        if (skipWeekends) {
          explanation = `Executes every weekday (Monday-Friday) at ${timeStr}. Skips weekends.`;
        } else {
          explanation = `Executes every Monday at ${timeStr}.`;
        }
        break;
        
      case 'monthly':
        if (skipWeekends) {
          explanation = `Executes on the 1st of each month at ${timeStr}, but only on weekdays.`;
        } else {
          explanation = `Executes on the 1st of each month at ${timeStr}.`;
        }
        break;
        
      case 'business-days':
        explanation = `Executes every weekday (Monday-Friday) at ${timeStr}. Automatically skips weekends.`;
        break;
        
      case 'quarterly':
        if (skipWeekends) {
          explanation = `Executes quarterly on the 1st of January, April, July, and October at ${timeStr}, but only on weekdays.`;
        } else {
          explanation = `Executes quarterly on the 1st of January, April, July, and October at ${timeStr}.`;
        }
        break;
    }
    
    if (skipHolidays) {
      explanation += ' Note: This cron expression will still execute on holidays. Consider using a wrapper script to check for holidays.';
    }
    
    return explanation;
  };

  const addCustomHoliday = () => {
    if (newHoliday.trim() && !customHolidays.includes(newHoliday.trim())) {
      setCustomHolidays([...customHolidays, newHoliday.trim()]);
      setNewHoliday('');
    }
  };

  const removeCustomHoliday = (holiday: string) => {
    setCustomHolidays(customHolidays.filter(h => h !== holiday));
  };

  const addCommonHoliday = (holiday: string) => {
    if (!customHolidays.includes(holiday)) {
      setCustomHolidays([...customHolidays, holiday]);
    }
  };

  const handleGenerate = () => {
    const cron = generateCronExpression();
    setGeneratedCron(cron);
    
    const explanation = getScheduleExplanation();
    
    // Add to history
    const newSchedule: HolidaySafeSchedule = {
      id: generateId(),
      scheduleType: scheduleType,
      executionTime: executionTime,
      skipWeekends: skipWeekends,
      skipHolidays: skipHolidays,
      customHolidays: [...customHolidays],
      generatedCron: cron,
      explanation: explanation,
      createdAt: new Date()
    };
    
    setScheduleHistory([newSchedule, ...scheduleHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setScheduleHistory([]);
    setGeneratedCron('');
  };

  const generateHolidayCheckScript = (): string => {
    return `#!/bin/bash
# Holiday Check Script
# Add this to your cron job to skip holidays

# Get current date
CURRENT_DATE=$(date +%m-%d)
CURRENT_WEEKDAY=$(date +%u)

# Define holidays (MM-DD format)
HOLIDAYS=(
  "01-01"  # New Year's Day
  "07-04"  # Independence Day
  "12-25"  # Christmas Day
  # Add more holidays as needed
)

# Check if today is a holiday
for holiday in "${HOLIDAYS[@]}"; do
  if [ "$CURRENT_DATE" = "$holiday" ]; then
    echo "Today is a holiday ($holiday). Skipping execution."
    exit 0
  fi
done

# Check if today is weekend (6=Saturday, 7=Sunday)
if [ "$CURRENT_WEEKDAY" = "6" ] || [ "$CURRENT_WEEKDAY" = "7" ]; then
  echo "Today is a weekend. Skipping execution."
  exit 0
fi

# If we reach here, it's a business day and not a holiday
echo "Executing scheduled task..."
# Your actual command goes here
# /path/to/your/script.sh
`;
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Holiday-Safe Schedule</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule Type
            </label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {scheduleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Execution Time
            </label>
            <input
              type="time"
              value={executionTime}
              onChange={(e) => setExecutionTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipWeekends"
                checked={skipWeekends}
                onChange={(e) => setSkipWeekends(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="skipWeekends" className="ml-2 text-sm text-gray-700">
                Skip Weekends
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipHolidays"
                checked={skipHolidays}
                onChange={(e) => setSkipHolidays(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="skipHolidays" className="ml-2 text-sm text-gray-700">
                Skip Holidays
              </label>
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Generate Schedule
          </button>
        </div>
      </div>

      {/* Generated Cron */}
      {generatedCron && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Holiday-Safe Cron</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Cron Expression:</span>
              <button
                onClick={() => copyToClipboard(generatedCron)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Copy
              </button>
            </div>
            <code className="block bg-white p-3 rounded text-lg border font-mono">
              {generatedCron}
            </code>
            <p className="text-sm text-gray-600 mt-2">
              {getScheduleExplanation()}
            </p>
          </div>
        </div>
      )}

      {/* Custom Holidays */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Holidays</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              placeholder="MM-DD (e.g., 12-25)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addCustomHoliday}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add
            </button>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Common Holidays</h4>
            <div className="flex flex-wrap gap-2">
              {commonHolidays.map((holiday) => (
                <button
                  key={holiday}
                  onClick={() => addCommonHoliday(holiday)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {holiday}
                </button>
              ))}
            </div>
          </div>
          
          {customHolidays.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Your Custom Holidays</h4>
              <div className="flex flex-wrap gap-2">
                {customHolidays.map((holiday) => (
                  <div key={holiday} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                    <span>{holiday}</span>
                    <button
                      onClick={() => removeCustomHoliday(holiday)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holiday Check Script */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Holiday Check Script</h3>
        <p className="text-gray-600 mb-4">
          Use this script to check for holidays and weekends before executing your cron job:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Bash Script:</span>
            <button
              onClick={() => copyToClipboard(generateHolidayCheckScript())}
              className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
            >
              Copy Script
            </button>
          </div>
          <pre className="bg-white p-3 rounded text-xs overflow-x-auto border">
            <code>{generateHolidayCheckScript()}</code>
          </pre>
        </div>
      </div>

      {/* Schedule History */}
      {scheduleHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Schedules</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {scheduleHistory.map((schedule) => (
              <div key={schedule.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Configuration:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Type:</strong> {schedule.scheduleType}</p>
                      <p><strong>Time:</strong> {schedule.executionTime}</p>
                      <p><strong>Skip Weekends:</strong> {schedule.skipWeekends ? 'Yes' : 'No'}</p>
                      <p><strong>Skip Holidays:</strong> {schedule.skipHolidays ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Generated Cron:</h4>
                    <div className="flex items-center justify-between">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1 mr-2">
                        {schedule.generatedCron}
                      </code>
                      <button
                        onClick={() => copyToClipboard(schedule.generatedCron)}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{schedule.explanation}</p>
                </div>
                
                {schedule.customHolidays.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Custom Holidays:</h5>
                    <div className="flex flex-wrap gap-2">
                      {schedule.customHolidays.map((holiday, index) => (
                        <span
                          key={index}
                          className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                        >
                          {holiday}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for Holiday-Safe Scheduling</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Use Business Day Scheduling</h4>
            <p className="text-gray-700 text-sm">
              For critical business operations, use the "Business Days Only" option to automatically skip weekends.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Implement Holiday Checks</h4>
            <p className="text-gray-700 text-sm">
              Use the provided holiday check script to skip execution on holidays, even if your cron expression doesn't handle it.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Consider Regional Holidays</h4>
            <p className="text-gray-700 text-sm">
              Add region-specific holidays to your custom holiday list for accurate scheduling.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Test Your Schedule</h4>
            <p className="text-gray-700 text-sm">
              Verify that your holiday-safe schedule works correctly by testing it during holiday periods.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Schedule</h4>
            <p className="text-sm">Choose your schedule type, execution time, and whether to skip weekends/holidays.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Generate Cron</h4>
            <p className="text-sm">Click "Generate Schedule" to create the appropriate cron expression.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Add Custom Holidays</h4>
            <p className="text-sm">Add any custom holidays that should be skipped during execution.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Use Holiday Check Script</h4>
            <p className="text-sm">Implement the provided bash script to check for holidays before executing your job.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidaySafeScheduler;
