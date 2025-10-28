'use client';

import React, { useState } from 'react';

interface CalendarExpression {
  id: string;
  expression: string;
  description: string;
  examples: string[];
  category: string;
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

export const SystemdOnCalendarStringHelper: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('daily');
  const [customExpression, setCustomExpression] = useState('');
  const [generatedExpression, setGeneratedExpression] = useState('');
  const [expressionHistory, setExpressionHistory] = useState<CalendarExpression[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const calendarCategories = [
    {
      value: 'daily',
      label: 'Daily Expressions',
      expressions: [
        { expression: 'daily', description: 'Every day at midnight (00:00:00)', examples: ['daily', 'daily 09:00:00', 'daily 14:30:00'] },
        { expression: 'daily 09:00:00', description: 'Every day at 9:00 AM', examples: ['daily 09:00:00', 'daily 14:30:00', 'daily 23:59:59'] },
        { expression: 'daily 00:00:00', description: 'Every day at midnight', examples: ['daily 00:00:00', 'daily 12:00:00', 'daily 18:00:00'] }
      ]
    },
    {
      value: 'weekly',
      label: 'Weekly Expressions',
      expressions: [
        { expression: 'weekly', description: 'Every week on Sunday at midnight', examples: ['weekly', 'weekly: monday 09:00:00', 'weekly: friday 18:00:00'] },
        { expression: 'weekly: monday 09:00:00', description: 'Every Monday at 9:00 AM', examples: ['weekly: monday 09:00:00', 'weekly: tuesday 14:30:00', 'weekly: friday 17:00:00'] },
        { expression: 'weekly: tuesday 14:30:00', description: 'Every Tuesday at 2:30 PM', examples: ['weekly: tuesday 14:30:00', 'weekly: wednesday 10:00:00', 'weekly: sunday 23:00:00'] }
      ]
    },
    {
      value: 'monthly',
      label: 'Monthly Expressions',
      expressions: [
        { expression: 'monthly', description: 'Every month on the 1st at midnight', examples: ['monthly', 'monthly: 1 14:30:00', 'monthly: 15 09:00:00'] },
        { expression: 'monthly: 1 14:30:00', description: 'Every month on the 1st at 2:30 PM', examples: ['monthly: 1 14:30:00', 'monthly: 15 09:00:00', 'monthly: 28 23:59:59'] },
        { expression: 'monthly: 15 09:00:00', description: 'Every month on the 15th at 9:00 AM', examples: ['monthly: 15 09:00:00', 'monthly: 1 00:00:00', 'monthly: 31 12:00:00'] }
      ]
    },
    {
      value: 'yearly',
      label: 'Yearly Expressions',
      expressions: [
        { expression: 'yearly', description: 'Every year on January 1st at midnight', examples: ['yearly', 'yearly: 1-1 09:00:00', 'yearly: 12-25 00:00:00'] },
        { expression: 'yearly: 1-1 09:00:00', description: 'Every year on January 1st at 9:00 AM', examples: ['yearly: 1-1 09:00:00', 'yearly: 7-4 14:00:00', 'yearly: 12-31 23:59:59'] },
        { expression: 'yearly: 12-25 00:00:00', description: 'Every year on December 25th at midnight', examples: ['yearly: 12-25 00:00:00', 'yearly: 1-1 00:00:00', 'yearly: 6-1 12:00:00'] }
      ]
    },
    {
      value: 'hourly',
      label: 'Hourly Expressions',
      expressions: [
        { expression: 'hourly', description: 'Every hour at minute 0', examples: ['hourly', 'hourly: 30', 'hourly: 15'] },
        { expression: 'hourly: 30', description: 'Every hour at minute 30', examples: ['hourly: 30', 'hourly: 15', 'hourly: 45'] },
        { expression: 'hourly: 15', description: 'Every hour at minute 15', examples: ['hourly: 15', 'hourly: 30', 'hourly: 45'] }
      ]
    },
    {
      value: 'minutely',
      label: 'Minutely Expressions',
      expressions: [
        { expression: 'minutely', description: 'Every minute at second 0', examples: ['minutely', 'minutely: 30', 'minutely: 15'] },
        { expression: 'minutely: 30', description: 'Every minute at second 30', examples: ['minutely: 30', 'minutely: 15', 'minutely: 45'] },
        { expression: 'minutely: 15', description: 'Every minute at second 15', examples: ['minutely: 15', 'minutely: 30', 'minutely: 45'] }
      ]
    }
  ];

  const specialExpressions = [
    {
      expression: '*-*-* 00:00:00',
      description: 'Every day at midnight (explicit format)',
      examples: ['*-*-* 00:00:00', '*-*-* 12:00:00', '*-*-* 23:59:59']
    },
    {
      expression: '*-*-* 00:00:00',
      description: 'Every day at midnight (explicit format)',
      examples: ['*-*-* 00:00:00', '*-*-* 12:00:00', '*-*-* 23:59:59']
    },
    {
      expression: 'Mon *-*-* 00:00:00',
      description: 'Every Monday at midnight',
      examples: ['Mon *-*-* 00:00:00', 'Tue *-*-* 09:00:00', 'Fri *-*-* 18:00:00']
    },
    {
      expression: '*-*-01 00:00:00',
      description: 'Every month on the 1st at midnight',
      examples: ['*-*-01 00:00:00', '*-*-15 12:00:00', '*-*-31 23:59:59']
    },
    {
      expression: '*-01-01 00:00:00',
      description: 'Every year on January 1st at midnight',
      examples: ['*-01-01 00:00:00', '*-07-04 14:00:00', '*-12-25 00:00:00']
    }
  ];

  const weekdayNames = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const generateCustomExpression = (): string => {
    if (!customExpression.trim()) return '';
    
    // Basic validation and formatting
    let expression = customExpression.trim().toLowerCase();
    
    // Handle common patterns
    if (expression.includes('daily')) {
      if (expression.includes('daily') && !expression.includes(':')) {
        expression = 'daily';
      }
    } else if (expression.includes('weekly')) {
      if (expression.includes('weekly') && !expression.includes(':')) {
        expression = 'weekly';
      }
    } else if (expression.includes('monthly')) {
      if (expression.includes('monthly') && !expression.includes(':')) {
        expression = 'monthly';
      }
    } else if (expression.includes('yearly')) {
      if (expression.includes('yearly') && !expression.includes(':')) {
        expression = 'yearly';
      }
    } else if (expression.includes('hourly')) {
      if (expression.includes('hourly') && !expression.includes(':')) {
        expression = 'hourly';
      }
    } else if (expression.includes('minutely')) {
      if (expression.includes('minutely') && !expression.includes(':')) {
        expression = 'minutely';
      }
    }
    
    return expression;
  };

  const getExpressionExplanation = (expression: string): string => {
    let explanation = '';
    
    if (expression.includes('daily')) {
      explanation = 'This expression will trigger every day. ';
      if (expression.includes(':')) {
        const time = expression.split(' ')[1];
        explanation += `It will execute at ${time}.`;
      } else {
        explanation += 'It will execute at midnight (00:00:00).';
      }
    } else if (expression.includes('weekly')) {
      explanation = 'This expression will trigger every week. ';
      if (expression.includes(':')) {
        const parts = expression.split(': ');
        if (parts.length > 1) {
          const dayTime = parts[1];
          explanation += `It will execute every ${dayTime}.`;
        }
      } else {
        explanation += 'It will execute every Sunday at midnight.';
      }
    } else if (expression.includes('monthly')) {
      explanation = 'This expression will trigger every month. ';
      if (expression.includes(':')) {
        const parts = expression.split(': ');
        if (parts.length > 1) {
          const dayTime = parts[1];
          explanation += `It will execute on the ${dayTime} of each month.`;
        }
      } else {
        explanation += 'It will execute on the 1st of each month at midnight.';
      }
    } else if (expression.includes('yearly')) {
      explanation = 'This expression will trigger every year. ';
      if (expression.includes(':')) {
        const parts = expression.split(': ');
        if (parts.length > 1) {
          const dateTime = parts[1];
          explanation += `It will execute on ${dateTime} each year.`;
        }
      } else {
        explanation += 'It will execute on January 1st at midnight.';
      }
    } else if (expression.includes('hourly')) {
      explanation = 'This expression will trigger every hour. ';
      if (expression.includes(':')) {
        const minute = expression.split(': ')[1];
        explanation += `It will execute at minute ${minute} of every hour.`;
      } else {
        explanation += 'It will execute at the start of every hour.';
      }
    } else if (expression.includes('minutely')) {
      explanation = 'This expression will trigger every minute. ';
      if (expression.includes(':')) {
        const second = expression.split(': ')[1];
        explanation += `It will execute at second ${second} of every minute.`;
      } else {
        explanation += 'It will execute at the start of every minute.';
      }
    } else {
      explanation = 'This is a custom calendar expression. Please verify the format is correct.';
    }
    
    return explanation;
  };

  const handleGenerateCustom = () => {
    if (!customExpression.trim()) return;
    
    const expression = generateCustomExpression();
    setGeneratedExpression(expression);
    
    // Add to history
    const newExpression: CalendarExpression = {
      id: generateId(),
      expression: expression,
      description: getExpressionExplanation(expression),
      examples: [expression],
      category: 'custom',
      createdAt: new Date()
    };
    
    setExpressionHistory([newExpression, ...expressionHistory]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearHistory = () => {
    setExpressionHistory([]);
    setGeneratedExpression('');
  };

  const getCurrentCategory = () => {
    return calendarCategories.find(cat => cat.value === selectedCategory) || calendarCategories[0];
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Select Calendar Expression Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {calendarCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Category Expressions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{getCurrentCategory().label}</h3>
        <div className="space-y-4">
          {getCurrentCategory().expressions.map((expr, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expression:</h4>
                  <code className="bg-gray-100 px-3 py-2 rounded text-lg font-mono">
                    {expr.expression}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(expr.expression)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy
                </button>
              </div>
              
              <div className="mb-3">
                <h5 className="font-medium text-gray-900 mb-2">Description:</h5>
                <p className="text-gray-600">{expr.description}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Examples:</h5>
                <div className="flex flex-wrap gap-2">
                  {expr.examples.map((example, idx) => (
                    <code key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {example}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Expressions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Special Calendar Expressions</h3>
        <div className="space-y-4">
          {specialExpressions.map((expr, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Expression:</h4>
                  <code className="bg-gray-100 px-3 py-2 rounded text-lg font-mono">
                    {expr.expression}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(expr.expression)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                >
                  Copy
                </button>
              </div>
              
              <div className="mb-3">
                <h5 className="font-medium text-gray-900 mb-2">Description:</h5>
                <p className="text-gray-600">{expr.description}</p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Examples:</h5>
                <div className="flex flex-wrap gap-2">
                  {expr.examples.map((example, idx) => (
                    <code key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {example}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Expression Generator */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Custom Expression</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Calendar Expression
            </label>
            <input
              type="text"
              value={customExpression}
              onChange={(e) => setCustomExpression(e.target.value)}
              placeholder="e.g., daily 09:00:00, weekly: monday 14:30:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter a custom calendar expression to generate and validate it.
            </p>
          </div>
          
          <button
            onClick={handleGenerateCustom}
            disabled={!customExpression.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Generate Expression
          </button>
        </div>
      </div>

      {/* Generated Custom Expression */}
      {generatedExpression && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Expression</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Expression:</span>
              <button
                onClick={() => copyToClipboard(generatedExpression)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
              >
                Copy
              </button>
            </div>
            <code className="block bg-white p-3 rounded text-lg border font-mono">
              {generatedExpression}
            </code>
            <p className="text-sm text-gray-600 mt-2">
              {getExpressionExplanation(generatedExpression)}
            </p>
          </div>
        </div>
      )}

      {/* Expression History */}
      {expressionHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Generated Expressions</h3>
            <button
              onClick={clearHistory}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear History
            </button>
          </div>
          <div className="space-y-4">
            {expressionHistory.map((expr) => (
              <div key={expr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Expression:</h4>
                    <code className="bg-gray-100 px-3 py-2 rounded text-lg font-mono">
                      {expr.expression}
                    </code>
                  </div>
                  <button
                    onClick={() => copyToClipboard(expr.expression)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  >
                    Copy
                  </button>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description:</h5>
                  <p className="text-gray-600 text-sm">{expr.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Reference */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Weekday Names</h4>
            <div className="space-y-2">
              {weekdayNames.map((day) => (
                <div key={day} className="flex justify-between">
                  <span className="text-gray-700">{day}</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{day}</code>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Month Names</h4>
            <div className="space-y-2">
              {monthNames.map((month) => (
                <div key={month} className="flex justify-between">
                  <span className="text-gray-700">{month}</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{month}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Best Practices for OnCalendar Expressions</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-blue-900 mb-2">1. Use Human-Readable Formats</h4>
            <p className="text-gray-700 text-sm">
              Prefer formats like 'daily 09:00:00' over '*-*-* 09:00:00' for better readability and maintenance.
            </p>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-green-900 mb-2">2. Consider Timezone Implications</h4>
            <p className="text-gray-700 text-sm">
              Be aware that OnCalendar expressions use the system's local timezone. Consider using UTC for consistency.
            </p>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-medium text-purple-900 mb-2">3. Test Your Expressions</h4>
            <p className="text-gray-700 text-sm">
              Use 'systemd-analyze calendar' to verify your OnCalendar expressions before deploying them.
            </p>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h4 className="font-medium text-orange-900 mb-2">4. Use Appropriate Accuracy</h4>
            <p className="text-gray-700 text-sm">
              Set AccuracySec in your timer unit to control how precisely systemd should match the calendar time.
            </p>
          </div>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-3 text-blue-800">
          <div>
            <h4 className="font-medium">1. Select Category</h4>
            <p className="text-sm">Choose the type of calendar expression you need (daily, weekly, monthly, etc.).</p>
          </div>
          
          <div>
            <h4 className="font-medium">2. Copy Expression</h4>
            <p className="text-sm">Copy the appropriate expression for your use case.</p>
          </div>
          
          <div>
            <h4 className="font-medium">3. Customize if Needed</h4>
            <p className="text-sm">Use the custom expression generator to create specific timing requirements.</p>
          </div>
          
          <div>
            <h4 className="font-medium">4. Use in Timer Unit</h4>
            <p className="text-sm">Add the expression to your systemd timer unit's OnCalendar directive.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemdOnCalendarStringHelper;
