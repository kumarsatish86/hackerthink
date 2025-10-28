'use client';

import React, { useState } from 'react';

interface TimerSimulation {
  id: string;
  timerName: string;
  onCalendar: string;
  currentTime: Date;
  nextExecutions: Date[];
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

export const SystemdTimerSimulationTool: React.FC = () => {
  const [timerName, setTimerName] = useState('');
  const [onCalendar, setOnCalendar] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextExecutions, setNextExecutions] = useState<Date[]>([]);
  const [simulationHistory, setSimulationHistory] = useState<TimerSimulation[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const calendarPresets = [
    { value: 'daily', label: 'Daily at midnight' },
    { value: 'daily 09:00:00', label: 'Daily at 9 AM' },
    { value: 'weekly', label: 'Weekly on Sunday' },
    { value: 'weekly: monday 09:00:00', label: 'Weekly on Monday at 9 AM' },
    { value: 'monthly', label: 'Monthly on 1st' },
    { value: 'monthly: 1 14:30:00', label: 'Monthly on 1st at 2:30 PM' },
    { value: 'yearly', label: 'Yearly on January 1st' },
    { value: 'yearly: 7-4 14:00:00', label: 'Yearly on July 4th at 2 PM' },
    { value: 'hourly', label: 'Every hour' },
    { value: 'hourly: 30', label: 'Every hour at minute 30' },
    { value: 'minutely', label: 'Every minute' },
    { value: 'minutely: 15', label: 'Every minute at second 15' }
  ];

  const calculateNextExecutions = (expression: string, fromDate: Date, count: number = 5): Date[] => {
    const executions: Date[] = [];
    let currentDate = new Date(fromDate);
    
    // Reset to start of current day for daily calculations
    currentDate.setHours(0, 0, 0, 0);
    
    try {
      if (expression.includes('daily')) {
        const time = expression.includes(' ') ? expression.split(' ')[1] : '00:00:00';
        const [hours, minutes, seconds] = time.split(':').map(Number);
        
        while (executions.length < count) {
          const nextDate = new Date(currentDate);
          nextDate.setHours(hours, minutes, seconds, 0);
          
          if (nextDate > fromDate) {
            executions.push(new Date(nextDate));
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (expression.includes('weekly')) {
        let targetDay = 0; // Sunday
        let time = '00:00:00';
        
        if (expression.includes(': ')) {
          const parts = expression.split(': ');
          const dayTime = parts[1];
          if (dayTime.includes(' ')) {
            const [day, timeStr] = dayTime.split(' ');
            targetDay = getDayNumber(day);
            time = timeStr;
          }
        }
        
        const [hours, minutes, seconds] = time.split(':').map(Number);
        
        while (executions.length < count) {
          const nextDate = new Date(currentDate);
          const currentDay = nextDate.getDay();
          const daysToAdd = (targetDay - currentDay + 7) % 7;
          
          nextDate.setDate(nextDate.getDate() + daysToAdd);
          nextDate.setHours(hours, minutes, seconds, 0);
          
          if (nextDate > fromDate) {
            executions.push(new Date(nextDate));
          }
          
          currentDate.setDate(currentDate.getDate() + 7);
        }
      } else if (expression.includes('monthly')) {
        let targetDay = 1;
        let time = '00:00:00';
        
        if (expression.includes(': ')) {
          const parts = expression.split(': ');
          const dayTime = parts[1];
          if (dayTime.includes(' ')) {
            const [day, timeStr] = dayTime.split(' ');
            targetDay = parseInt(day);
            time = timeStr;
          }
        }
        
        const [hours, minutes, seconds] = time.split(':').map(Number);
        
        while (executions.length < count) {
          const nextDate = new Date(currentDate);
          nextDate.setDate(targetDay);
          nextDate.setHours(hours, minutes, seconds, 0);
          
          if (nextDate > fromDate) {
            executions.push(new Date(nextDate));
          }
          
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      } else if (expression.includes('yearly')) {
        let targetMonth = 1;
        let targetDay = 1;
        let time = '00:00:00';
        
        if (expression.includes(': ')) {
          const parts = expression.split(': ');
          const dateTime = parts[1];
          if (dateTime.includes('-')) {
            const [month, dayTime] = dateTime.split('-');
            targetMonth = parseInt(month);
            if (dayTime.includes(' ')) {
              const [day, timeStr] = dayTime.split(' ');
              targetDay = parseInt(day);
              time = timeStr;
            } else {
              targetDay = parseInt(dayTime);
            }
          }
        }
        
        const [hours, minutes, seconds] = time.split(':').map(Number);
        
        while (executions.length < count) {
          const nextDate = new Date(currentDate);
          nextDate.setMonth(targetMonth - 1, targetDay);
          nextDate.setHours(hours, minutes, seconds, 0);
          
          if (nextDate > fromDate) {
            executions.push(new Date(nextDate));
          }
          
          currentDate.setFullYear(currentDate.getFullYear() + 1);
        }
      } else if (expression.includes('hourly')) {
        let targetMinute = 0;
        
        if (expression.includes(': ')) {
          targetMinute = parseInt(expression.split(': ')[1]);
        }
        
        while (executions.length < count) {
          const nextDate = new Date(currentDate);
          nextDate.setMinutes(targetMinute, 0, 0);
          
          if (nextDate > fromDate) {
            executions.push(new Date(nextDate));
          }
          
          currentDate.setHours(currentDate.getHours() + 1);
        }
      } else if (expression.includes('minutely')) {
        let targetSecond = 0;
        
        if (expression.includes(': ')) {
          targetSecond = parseInt(expression.split(': ')[1]);
        }
        
        while (executions.length < count) {
          const nextDate = new Date(currentDate);
          nextDate.setSeconds(targetSecond, 0);
          
          if (nextDate > fromDate) {
            executions.push(new Date(nextDate));
          }
          
          currentDate.setMinutes(currentDate.getMinutes() + 1);
        }
      }
    } catch (error) {
      console.error('Error calculating next executions:', error);
    }
    
    return executions;
  };

  const getDayNumber = (dayName: string): number => {
    const dayMap: { [key: string]: number } = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    return dayMap[dayName.toLowerCase()] || 0;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTimeUntil = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getSimulationExplanation = (expression: string): string => {
    let explanation = `Timer "${timerName}" with OnCalendar="${expression}" will execute: `;
    
    if (expression.includes('daily')) {
      explanation += 'every day';
      if (expression.includes(' ')) {
        const time = expression.split(' ')[1];
        explanation += ` at ${time}`;
      } else {
        explanation += ' at midnight (00:00:00)';
      }
    } else if (expression.includes('weekly')) {
      explanation += 'every week';
      if (expression.includes(': ')) {
        const parts = expression.split(': ');
        const dayTime = parts[1];
        explanation += ` on ${dayTime}`;
      } else {
        explanation += ' on Sunday at midnight';
      }
    } else if (expression.includes('monthly')) {
      explanation += 'every month';
      if (expression.includes(': ')) {
        const parts = expression.split(': ');
        const dayTime = parts[1];
        explanation += ` on the ${dayTime}`;
      } else {
        explanation += ' on the 1st at midnight';
      }
    } else if (expression.includes('yearly')) {
      explanation += 'every year';
      if (expression.includes(': ')) {
        const parts = expression.split(': ');
        const dateTime = parts[1];
        explanation += ` on ${dateTime}`;
      } else {
        explanation += ' on January 1st at midnight';
      }
    } else if (expression.includes('hourly')) {
      explanation += 'every hour';
      if (expression.includes(': ')) {
        const minute = expression.split(': ')[1];
        explanation += ` at minute ${minute}`;
      }
    } else if (expression.includes('minutely')) {
      explanation += 'every minute';
      if (expression.includes(': ')) {
        const second = expression.split(': ')[1];
        explanation += ` at second ${second}`;
      }
    }
    
    explanation += `. The simulation shows the next 5 execution times from the current time.`;
    
    return explanation;
  };

  const handleSimulate = () => {
    if (!timerName.trim() || !onCalendar.trim()) return;
    
    const executions = calculateNextExecutions(onCalendar, currentTime, 5);
    setNextExecutions(executions);
    
    const explanation = getSimulationExplanation(onCalendar);
    
    // Add to history
    const newSimulation: TimerSimulation = {
      id: generateId(),
      timerName: timerName,
      onCalendar: onCalendar,
      currentTime: currentTime,
      nextExecutions: executions,
      explanation: explanation,
      createdAt: new Date()
    };
    
    setSimulationHistory([newSimulation, ...simulationHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setSimulationHistory([]);
    setNextExecutions([]);
  };

  const validateInputs = (): boolean => {
    return timerName.trim() !== '' && onCalendar.trim() !== '';
  };

  const getCurrentTimeString = (): string => {
    return currentTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Configure Timer Simulation</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timer Name
            </label>
            <input
              type="text"
              value={timerName}
              onChange={(e) => setTimerName(e.target.value)}
              placeholder="e.g., backup.timer, cleanup.timer"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OnCalendar Expression
            </label>
            <select
              value={onCalendar}
              onChange={(e) => setOnCalendar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a preset or enter custom expression</option>
              {calendarPresets.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Or enter a custom OnCalendar expression (e.g., "daily 14:30:00")
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Time (for simulation)
            </label>
            <input
              type="datetime-local"
              value={currentTime.toISOString().slice(0, 16)}
              onChange={(e) => setCurrentTime(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Current simulation time: {getCurrentTimeString()}
            </p>
          </div>
          
          <button
            onClick={handleSimulate}
            disabled={!validateInputs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Simulate Timer Execution
          </button>
        </div>
      </div>

      {/* Simulation Results */}
      {nextExecutions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Timer Execution Simulation</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Timer Details:</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Name:</strong> {timerName}</p>
                <p><strong>OnCalendar:</strong> <code className="bg-gray-100 px-1 rounded">{onCalendar}</code></p>
                <p><strong>Simulation Time:</strong> {getCurrentTimeString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Next 5 Executions:</h4>
              <div className="space-y-3">
                {nextExecutions.map((execution, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <span className="font-medium text-gray-900">#{index + 1}:</span>
                      <span className="ml-2 text-gray-700">{formatDate(execution)}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {getTimeUntil(execution)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {execution.toISOString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
              <p className="text-blue-800 text-sm">
                {getSimulationExplanation(onCalendar)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulation History */}
      {simulationHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Simulation History</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {simulationHistory.map((simulation) => (
              <div key={simulation.id} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Timer Details:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Name:</strong> {simulation.timerName}</p>
                      <p><strong>OnCalendar:</strong> <code className="bg-gray-100 px-1 rounded">{simulation.onCalendar}</code></p>
                      <p><strong>Simulated:</strong> {simulation.currentTime.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Next Execution:</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      {simulation.nextExecutions.slice(0, 2).map((execution, index) => (
                        <p key={index}>
                          <strong>#{index + 1}:</strong> {formatDate(execution)}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="font-medium text-gray-900 mb-2">Explanation:</h5>
                  <p className="text-gray-600 text-sm">{simulation.explanation}</p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setTimerName(simulation.timerName);
                      setOnCalendar(simulation.onCalendar);
                      setCurrentTime(simulation.currentTime);
                      setNextExecutions(simulation.nextExecutions);
                    }}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Reload
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for Timer Simulation</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Verify OnCalendar Syntax</h4>
            <p className="text-gray-700 text-sm">
              Use 'systemd-analyze calendar' to validate your OnCalendar expressions before using them in production.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Consider Timezone Effects</h4>
            <p className="text-gray-700 text-sm">
              Remember that OnCalendar expressions use the system's local timezone. Use UTC for consistency across systems.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Test Edge Cases</h4>
            <p className="text-gray-700 text-sm">
              Simulate timers around month boundaries, leap years, and daylight saving time transitions to ensure reliability.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Monitor Execution Patterns</h4>
            <p className="text-gray-700 text-sm">
              Use 'systemctl list-timers' to monitor actual timer execution and compare with your simulations.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Configure Timer</h4>
            <p className="text-sm">Enter the timer name and OnCalendar expression you want to simulate.</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Set Simulation Time</h4>
            <p className="text-sm">Choose the current time from which to calculate future executions.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Run Simulation</h4>
            <p className="text-sm">Click "Simulate Timer Execution" to see when the timer will next run.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Review Results</h4>
            <p className="text-sm">Check the next 5 execution times and time until each execution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemdTimerSimulationTool;
