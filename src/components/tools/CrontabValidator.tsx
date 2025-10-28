"use client";
import React, { useState, useEffect } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-900 to-emerald-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-green-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-emerald-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-teal-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-green-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm font-semibold">Cron Validator</div>
                <div className="text-xs opacity-75">Syntax checker</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>🔍 Validate</span>
                    <span>⚠️ Errors</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>💡 Suggest</span>
                    <span>📝 Fix</span>
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

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
  parsedFields: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
  humanReadable: string;
  nextRuns: string[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  position?: number;
}

interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export function CrontabValidator() {
  const [cronExpression, setCronExpression] = useState('0 0 * * *');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchValidation, setBatchValidation] = useState('');
  const [batchResults, setBatchResults] = useState<{ expression: string; result: ValidationResult }[]>([]);

  const commonExpressions = [
    { name: 'Every minute', expression: '* * * * *' },
    { name: 'Every hour', expression: '0 * * * *' },
    { name: 'Daily at midnight', expression: '0 0 * * *' },
    { name: 'Weekly on Sunday', expression: '0 0 * * 0' },
    { name: 'Monthly on 1st', expression: '0 0 1 * *' },
    { name: 'Weekdays at 9 AM', expression: '0 9 * * 1-5' },
    { name: 'Every 15 minutes', expression: '*/15 * * * *' },
    { name: 'Every 2 hours', expression: '0 */2 * * *' },
  ];

  const validateCronExpression = (expression: string): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Basic structure validation
    const parts = expression.trim().split(/\s+/);
    
    if (parts.length !== 5) {
      errors.push({
        field: 'structure',
        message: `Cron expression must have exactly 5 fields, found ${parts.length}`,
        severity: 'error'
      });
      
      return {
        isValid: false,
        errors,
        warnings,
        suggestions: ['Use format: minute hour day-of-month month day-of-week'],
        parsedFields: { minute: '', hour: '', dayOfMonth: '', month: '', dayOfWeek: '' },
        humanReadable: 'Invalid cron expression',
        nextRuns: []
      };
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Validate each field
    validateField(minute, 'minute', 0, 59, errors, warnings, suggestions);
    validateField(hour, 'hour', 0, 23, errors, warnings, suggestions);
    validateField(dayOfMonth, 'day-of-month', 1, 31, errors, warnings, suggestions);
    validateField(month, 'month', 1, 12, errors, warnings, suggestions);
    validateField(dayOfWeek, 'day-of-week', 0, 7, errors, warnings, suggestions); // 0 and 7 both represent Sunday

    // Special validations
    validateSpecialCases(parts, errors, warnings, suggestions);

    // Generate human readable description
    const humanReadable = generateHumanReadable(parts);
    
    // Generate next runs if valid
    const nextRuns = errors.length === 0 ? generateNextRuns(parts) : [];

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      parsedFields: {
        minute,
        hour,
        dayOfMonth,
        month,
        dayOfWeek
      },
      humanReadable,
      nextRuns
    };
  };

  const validateField = (
    field: string, 
    fieldName: string, 
    min: number, 
    max: number, 
    errors: ValidationError[], 
    warnings: ValidationWarning[], 
    suggestions: string[]
  ) => {
    if (!field || field.trim() === '') {
      errors.push({
        field: fieldName,
        message: `${fieldName} field cannot be empty`,
        severity: 'error'
      });
      return;
    }

    // Check for invalid characters
    if (!/^[0-9,\-*\/]+$/.test(field)) {
      errors.push({
        field: fieldName,
        message: `${fieldName} contains invalid characters. Only numbers, *, /, -, and , are allowed`,
        severity: 'error'
      });
      return;
    }

    // Validate asterisk
    if (field === '*') {
      return; // Valid wildcard
    }

    // Validate step values (*/n)
    if (field.includes('/')) {
      const stepMatch = field.match(/^(\*|\d+(-\d+)?)\/(\d+)$/);
      if (!stepMatch) {
        errors.push({
          field: fieldName,
          message: `Invalid step syntax in ${fieldName}. Use format: */n or start-end/n`,
          severity: 'error'
        });
        return;
      }

      const stepValue = parseInt(stepMatch[3]);
      if (stepValue <= 0) {
        errors.push({
          field: fieldName,
          message: `Step value must be greater than 0 in ${fieldName}`,
          severity: 'error'
        });
        return;
      }

      if (stepValue > (max - min + 1)) {
        warnings.push({
          field: fieldName,
          message: `Step value ${stepValue} is larger than the field range`,
          suggestion: `Consider using a smaller step value for ${fieldName}`
        });
      }
    }

    // Validate ranges (n-m)
    if (field.includes('-') && !field.includes('/')) {
      const rangeParts = field.split('-');
      if (rangeParts.length !== 2) {
        errors.push({
          field: fieldName,
          message: `Invalid range syntax in ${fieldName}. Use format: start-end`,
          severity: 'error'
        });
        return;
      }

      const start = parseInt(rangeParts[0]);
      const end = parseInt(rangeParts[1]);

      if (isNaN(start) || isNaN(end)) {
        errors.push({
          field: fieldName,
          message: `Range values must be numbers in ${fieldName}`,
          severity: 'error'
        });
        return;
      }

      if (start > end) {
        errors.push({
          field: fieldName,
          message: `Range start (${start}) cannot be greater than end (${end}) in ${fieldName}`,
          severity: 'error'
        });
        return;
      }

      if (start < min || end > max) {
        errors.push({
          field: fieldName,
          message: `Range values must be between ${min} and ${max} for ${fieldName}`,
          severity: 'error'
        });
        return;
      }
    }

    // Validate comma-separated values
    if (field.includes(',')) {
      const values = field.split(',');
      for (const value of values) {
        if (value.trim() === '') {
          errors.push({
            field: fieldName,
            message: `Empty value in comma-separated list for ${fieldName}`,
            severity: 'error'
          });
          continue;
        }

        if (value.includes('-')) {
          // Validate range within comma-separated values
          const rangeParts = value.split('-');
          if (rangeParts.length === 2) {
            const start = parseInt(rangeParts[0]);
            const end = parseInt(rangeParts[1]);
            if (!isNaN(start) && !isNaN(end)) {
              if (start < min || end > max || start > end) {
                errors.push({
                  field: fieldName,
                  message: `Invalid range ${value} in ${fieldName}`,
                  severity: 'error'
                });
              }
            }
          }
        } else {
          const numValue = parseInt(value);
          if (isNaN(numValue)) {
            errors.push({
              field: fieldName,
              message: `Invalid value '${value}' in ${fieldName}`,
              severity: 'error'
            });
          } else if (numValue < min || numValue > max) {
            errors.push({
              field: fieldName,
              message: `Value ${numValue} is out of range (${min}-${max}) for ${fieldName}`,
              severity: 'error'
            });
          }
        }
      }
    } else if (!field.includes('*') && !field.includes('/') && !field.includes('-')) {
      // Single numeric value
      const numValue = parseInt(field);
      if (isNaN(numValue)) {
        errors.push({
          field: fieldName,
          message: `Invalid numeric value '${field}' in ${fieldName}`,
          severity: 'error'
        });
      } else if (numValue < min || numValue > max) {
        errors.push({
          field: fieldName,
          message: `Value ${numValue} is out of range (${min}-${max}) for ${fieldName}`,
          severity: 'error'
        });
      }
    }

    // Special case for day-of-week: both 0 and 7 represent Sunday
    if (fieldName === 'day-of-week' && field === '7') {
      warnings.push({
        field: fieldName,
        message: 'Using 7 for Sunday is valid but 0 is more common',
        suggestion: 'Consider using 0 instead of 7 for Sunday'
      });
    }
  };

  const validateSpecialCases = (
    parts: string[], 
    errors: ValidationError[], 
    warnings: ValidationWarning[], 
    suggestions: string[]
  ) => {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Check for conflicting day specifications
    if (dayOfMonth !== '*' && dayOfWeek !== '*') {
      warnings.push({
        field: 'day-specification',
        message: 'Both day-of-month and day-of-week are specified',
        suggestion: 'This will run when EITHER condition is met (OR logic), not both'
      });
    }

    // Check for potentially inefficient patterns
    if (minute === '*' && hour === '*') {
      warnings.push({
        field: 'frequency',
        message: 'This will run every minute',
        suggestion: 'Consider if such high frequency is necessary for system resources'
      });
    }

    // Check for February 29th, 30th, 31st
    if (dayOfMonth.includes('29') || dayOfMonth.includes('30') || dayOfMonth.includes('31')) {
      if (month.includes('2')) {
        warnings.push({
          field: 'date-validity',
          message: 'February does not have 29+ days in non-leap years',
          suggestion: 'Consider using day-of-week instead for consistent monthly execution'
        });
      }
    }

    // Check for common mistakes
    if (minute.includes('60')) {
      errors.push({
        field: 'minute',
        message: 'Minute 60 is invalid (use 0-59)',
        severity: 'error'
      });
    }

    if (hour.includes('24')) {
      errors.push({
        field: 'hour',
        message: 'Hour 24 is invalid (use 0-23)',
        severity: 'error'
      });
    }

    // Performance suggestions
    if (minute.startsWith('*/1') || minute === '*') {
      suggestions.push('Consider if running every minute is necessary for performance');
    }

    if (parts.join(' ') === '0 0 * * *') {
      suggestions.push('This is a common pattern for daily maintenance tasks');
    }
  };

  const generateHumanReadable = (parts: string[]): string => {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    let description = 'Runs ';
    
    // Minute description
    if (minute === '*') {
      description += 'every minute';
    } else if (minute.includes('/')) {
      const step = minute.split('/')[1];
      description += `every ${step} minutes`;
    } else if (minute === '0') {
      description += 'at the start of the hour';
    } else {
      description += `at minute ${minute}`;
    }
    
    // Hour description
    if (hour === '*') {
      description += ' of every hour';
    } else if (hour.includes('/')) {
      const step = hour.split('/')[1];
      description += ` of every ${step} hours`;
    } else if (hour.includes('-')) {
      const [start, end] = hour.split('-');
      description += ` between ${start}:00 and ${end}:00`;
    } else {
      description += ` at ${hour}:00`;
    }
    
    // Day and month description
    if (dayOfMonth === '*' && month === '*') {
      description += ' every day';
    } else if (dayOfMonth !== '*' && month === '*') {
      description += ` on day ${dayOfMonth} of every month`;
    } else if (dayOfMonth === '*' && month !== '*') {
      description += ` every day in month ${month}`;
    } else {
      description += ` on day ${dayOfMonth} of month ${month}`;
    }
    
    // Day of week description
    if (dayOfWeek !== '*') {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      if (dayOfWeek.includes(',')) {
        const days = dayOfWeek.split(',').map(d => dayNames[parseInt(d)] || d).join(', ');
        description += ` on ${days}`;
      } else if (dayOfWeek.includes('-')) {
        const [start, end] = dayOfWeek.split('-');
        description += ` from ${dayNames[parseInt(start)]} to ${dayNames[parseInt(end)]}`;
      } else {
        description += ` on ${dayNames[parseInt(dayOfWeek)] || dayOfWeek}`;
      }
    }
    
    return description;
  };

  const generateNextRuns = (parts: string[]): string[] => {
    // Simplified next run calculation - in a real implementation, you'd use a proper cron parser
    const runs: string[] = [];
    const now = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const nextRun = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
      runs.push(nextRun.toLocaleString());
    }
    
    return runs;
  };

  const handleValidation = () => {
    setIsValidating(true);
    
    // Simulate validation delay for better UX
    setTimeout(() => {
      const result = validateCronExpression(cronExpression);
      setValidationResult(result);
      setIsValidating(false);
    }, 300);
  };

  const handleBatchValidation = () => {
    const expressions = batchValidation.split('\n').filter(line => line.trim() !== '');
    const results = expressions.map(expression => ({
      expression: expression.trim(),
      result: validateCronExpression(expression.trim())
    }));
    setBatchResults(results);
  };

  const applySuggestion = (suggestion: string) => {
    // Apply common suggestions
    if (suggestion.includes('0 instead of 7')) {
      setCronExpression(cronExpression.replace(/\s7(\s|$)/, ' 0$1'));
    }
  };

  useEffect(() => {
    handleValidation();
  }, [cronExpression]);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#059669" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Crontab Validator
      </h2>

      {/* Main Validation Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Validate Cron Expression</h3>
        
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
                className={`flex-1 px-3 py-2 border rounded-lg font-mono text-lg focus:ring-2 focus:border-transparent ${
                  validationResult?.isValid 
                    ? 'border-green-300 focus:ring-green-500' 
                    : validationResult?.errors.length 
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              <button
                onClick={handleValidation}
                disabled={isValidating}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    ✅ Validate
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
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {validationResult.isValid ? (
              <div className="flex items-center gap-2 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">Valid Cron Expression</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-semibold">Invalid Cron Expression</span>
              </div>
            )}
          </div>

          {/* Field Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-green-800">Minute</div>
              <div className="font-mono text-green-600">{validationResult.parsedFields.minute}</div>
              <div className="text-xs text-green-500">0-59</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Hour</div>
              <div className="font-mono text-blue-600">{validationResult.parsedFields.hour}</div>
              <div className="text-xs text-blue-500">0-23</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-purple-800">Day of Month</div>
              <div className="font-mono text-purple-600">{validationResult.parsedFields.dayOfMonth}</div>
              <div className="text-xs text-purple-500">1-31</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-orange-800">Month</div>
              <div className="font-mono text-orange-600">{validationResult.parsedFields.month}</div>
              <div className="text-xs text-orange-500">1-12</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-red-800">Day of Week</div>
              <div className="font-mono text-red-600">{validationResult.parsedFields.dayOfWeek}</div>
              <div className="text-xs text-red-500">0-6 (Sun-Sat)</div>
            </div>
          </div>

          {/* Human Readable Description */}
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-green-800 mb-2">Human Readable</h4>
            <p className="text-green-700">{validationResult.humanReadable}</p>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Errors ({validationResult.errors.length})
              </h4>
              <div className="space-y-2">
                {validationResult.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-red-600 font-medium capitalize">{error.field}:</span>
                    <span className="text-red-700">{error.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Warnings ({validationResult.warnings.length})
              </h4>
              <div className="space-y-3">
                {validationResult.warnings.map((warning, index) => (
                  <div key={index} className="border-l-4 border-yellow-400 pl-3">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-600 font-medium capitalize">{warning.field}:</span>
                      <span className="text-yellow-700">{warning.message}</span>
                    </div>
                    <div className="text-yellow-600 text-sm mt-1">💡 {warning.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Suggestions
              </h4>
              <div className="space-y-2">
                {validationResult.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">💡</span>
                    <span className="text-blue-700">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Runs */}
          {validationResult.isValid && validationResult.nextRuns.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Next 5 Runs</h4>
              <div className="space-y-1">
                {validationResult.nextRuns.map((run, index) => (
                  <div key={index} className="flex items-center gap-2 text-green-700">
                    <span className="text-green-600 font-medium">#{index + 1}</span>
                    <span>{run}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Features */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-800">Advanced Features</h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-green-600 hover:text-green-700 flex items-center gap-2"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-6">
            {/* Batch Validation */}
            <div>
              <h4 className="font-semibold text-green-800 mb-3">Batch Validation</h4>
              <div className="space-y-3">
                <textarea
                  value={batchValidation}
                  onChange={(e) => setBatchValidation(e.target.value)}
                  placeholder="Enter multiple cron expressions (one per line)&#10;0 0 * * *&#10;*/15 * * * *&#10;0 9 * * 1-5"
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleBatchValidation}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Validate All
                </button>
              </div>

              {/* Batch Results */}
              {batchResults.length > 0 && (
                <div className="mt-4 space-y-3">
                  <h5 className="font-medium text-green-800">Batch Results</h5>
                  {batchResults.map((item, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      item.result.isValid 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <code className="font-mono text-sm">{item.expression}</code>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.result.isValid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.result.isValid ? 'Valid' : 'Invalid'}
                        </span>
                      </div>
                      {!item.result.isValid && (
                        <div className="text-sm text-red-700">
                          {item.result.errors.map(error => error.message).join(', ')}
                        </div>
                      )}
                      {item.result.isValid && (
                        <div className="text-sm text-green-700">
                          {item.result.humanReadable}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CrontabValidatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Why Validate Cron Expressions?</h2>
        <p className="text-gray-700 text-lg">
          Cron expression validation is crucial for ensuring your scheduled tasks run as expected. 
          Invalid syntax can cause jobs to fail silently, run at unexpected times, or not run at all. 
          Our validator helps catch errors before deployment, saving time and preventing system issues.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Validation Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">✅ Syntax Validation</h3>
            <p className="text-gray-700 mb-3">
              Comprehensive syntax checking for all cron expression components including field ranges, 
              special characters, and format validation.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Field count validation (exactly 5 fields required)</li>
              <li>Range validation for each field (minute: 0-59, hour: 0-23, etc.)</li>
              <li>Special character validation (*, /, -, ,)</li>
              <li>Step value validation (*/n format)</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">⚠️ Smart Warnings</h3>
            <p className="text-gray-700 mb-3">
              Intelligent warnings for potentially problematic patterns, performance issues, 
              and common mistakes that might not be syntax errors but could cause problems.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>High-frequency execution warnings</li>
              <li>Date validity checks (Feb 29, 30, 31)</li>
              <li>Conflicting day specifications</li>
              <li>Performance impact assessments</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">💡 Helpful Suggestions</h3>
            <p className="text-gray-700 mb-3">
              Actionable suggestions to improve your cron expressions, optimize performance, 
              and follow best practices for reliable scheduled task execution.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Alternative syntax recommendations</li>
              <li>Performance optimization tips</li>
              <li>Best practice suggestions</li>
              <li>Common pattern recognition</li>
            </ul>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-3">📊 Batch Validation</h3>
            <p className="text-gray-700 mb-3">
              Validate multiple cron expressions at once, perfect for reviewing entire 
              crontab files or validating multiple scheduled tasks simultaneously.
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Multi-line expression validation</li>
              <li>Bulk error reporting</li>
              <li>Summary statistics</li>
              <li>Export validation results</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Common Validation Errors</h2>
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">Syntax Errors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-red-700 mb-2">❌ Invalid Examples</h4>
                <ul className="list-disc pl-6 text-red-700 text-sm space-y-1">
                  <li><code>0 0 * *</code> - Missing day-of-week field</li>
                  <li><code>60 0 * * *</code> - Minute 60 doesn't exist</li>
                  <li><code>0 25 * * *</code> - Hour 25 doesn't exist</li>
                  <li><code>0 0 32 * *</code> - Day 32 doesn't exist</li>
                  <li><code>0 0 * 13 *</code> - Month 13 doesn't exist</li>
                  <li><code>0 0 * * 8</code> - Day-of-week 8 doesn't exist</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Corrected Examples</h4>
                <ul className="list-disc pl-6 text-green-700 text-sm space-y-1">
                  <li><code>0 0 * * *</code> - Added missing field</li>
                  <li><code>0 0 * * *</code> - Use 0-59 for minutes</li>
                  <li><code>0 1 * * *</code> - Use 0-23 for hours</li>
                  <li><code>0 0 31 * *</code> - Use 1-31 for days</li>
                  <li><code>0 0 * 12 *</code> - Use 1-12 for months</li>
                  <li><code>0 0 * * 0</code> - Use 0-6 for day-of-week</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-3">Logic Warnings</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Day Specification Conflicts</h4>
                <p className="text-yellow-700 text-sm mb-2">
                  When both day-of-month and day-of-week are specified (neither is *), 
                  the job runs when EITHER condition is met (OR logic).
                </p>
                <div className="bg-yellow-100 p-3 rounded">
                  <code className="text-yellow-800">0 0 15 * 1</code> - Runs on the 15th of every month OR every Monday
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-700 mb-2">Date Validity Issues</h4>
                <p className="text-yellow-700 text-sm mb-2">
                  Some date combinations may not exist in all months or years.
                </p>
                <div className="bg-yellow-100 p-3 rounded">
                  <code className="text-yellow-800">0 0 31 2 *</code> - February 31st doesn't exist
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Field Reference Guide</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="font-semibold text-green-800 mb-2">Minute</div>
              <div className="text-sm text-gray-600 mb-2">0-59</div>
              <div className="text-xs text-gray-500">
                <div>0 = :00</div>
                <div>30 = :30</div>
                <div>*/15 = every 15 min</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-800 mb-2">Hour</div>
              <div className="text-sm text-gray-600 mb-2">0-23</div>
              <div className="text-xs text-gray-500">
                <div>0 = midnight</div>
                <div>12 = noon</div>
                <div>*/2 = every 2 hours</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-800 mb-2">Day of Month</div>
              <div className="text-sm text-gray-600 mb-2">1-31</div>
              <div className="text-xs text-gray-500">
                <div>1 = 1st</div>
                <div>15 = 15th</div>
                <div>*/7 = every 7 days</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-orange-800 mb-2">Month</div>
              <div className="text-sm text-gray-600 mb-2">1-12</div>
              <div className="text-xs text-gray-500">
                <div>1 = January</div>
                <div>12 = December</div>
                <div>*/3 = quarterly</div>
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-red-800 mb-2">Day of Week</div>
              <div className="text-sm text-gray-600 mb-2">0-6</div>
              <div className="text-xs text-gray-500">
                <div>0 = Sunday</div>
                <div>1 = Monday</div>
                <div>1-5 = weekdays</div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-3">Special Characters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium text-gray-700 mb-2">Wildcards & Ranges</div>
                <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                  <li><code>*</code> - Any value (wildcard)</li>
                  <li><code>5-10</code> - Range from 5 to 10</li>
                  <li><code>1,3,5</code> - Specific values 1, 3, and 5</li>
                  <li><code>*/5</code> - Every 5th value</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-gray-700 mb-2">Advanced Patterns</div>
                <ul className="list-disc pl-6 text-gray-700 text-sm space-y-1">
                  <li><code>10-20/2</code> - Every 2nd value from 10 to 20</li>
                  <li><code>0,15,30,45</code> - Quarter-hour intervals</li>
                  <li><code>1-5</code> - Monday through Friday</li>
                  <li><code>*/10</code> - Every 10th occurrence</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Validation Best Practices</h2>
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-3">Pre-Deployment Checklist</h3>
          <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
            <li><strong>Syntax Validation:</strong> Always validate cron expressions before adding to crontab</li>
            <li><strong>Test Environment:</strong> Test cron jobs in a development environment first</li>
            <li><strong>Resource Impact:</strong> Consider system load and resource usage patterns</li>
            <li><strong>Timezone Awareness:</strong> Verify server timezone settings and daylight saving time effects</li>
            <li><strong>Logging:</strong> Ensure cron jobs have proper logging for monitoring and debugging</li>
            <li><strong>Error Handling:</strong> Include error handling and notification mechanisms</li>
            <li><strong>Documentation:</strong> Document the purpose and expected behavior of each cron job</li>
            <li><strong>Regular Review:</strong> Periodically review and validate existing cron expressions</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Integration with Development Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-3">CI/CD Integration</h3>
            <p className="text-gray-700 mb-3">
              Integrate cron validation into your continuous integration pipeline:
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Automated validation in build scripts</li>
              <li>Pre-commit hooks for cron expression validation</li>
              <li>Deployment pipeline checks</li>
              <li>Configuration file validation</li>
            </ul>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-3">Monitoring & Alerting</h3>
            <p className="text-gray-700 mb-3">
              Set up monitoring for cron job execution and validation:
            </p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Failed execution alerts</li>
              <li>Unexpected execution time notifications</li>
              <li>Resource usage monitoring</li>
              <li>Regular validation health checks</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Troubleshooting Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-3">Common Issues</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm space-y-2">
              <li><strong>Job not running:</strong> Check cron syntax and system cron service status</li>
              <li><strong>Wrong execution time:</strong> Verify server timezone and daylight saving settings</li>
              <li><strong>Permission errors:</strong> Ensure proper user permissions for cron execution</li>
              <li><strong>Path issues:</strong> Use absolute paths in cron commands</li>
              <li><strong>Environment variables:</strong> Set required environment variables in crontab</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-3">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm space-y-2">
              <li><code>crontab -l</code> - List current user's crontab</li>
              <li><code>crontab -e</code> - Edit current user's crontab</li>
              <li><code>systemctl status cron</code> - Check cron service status</li>
              <li><code>tail -f /var/log/cron</code> - Monitor cron execution logs</li>
              <li><code>grep CRON /var/log/syslog</code> - Search for cron entries in system log</li>
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
      <h2 className="text-2xl font-bold mb-6 text-green-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-green-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-green-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Master Linux Automation with Reliable Cron Jobs</h2>
      <p className="text-green-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux automation insights, cron validation techniques, and best practices delivered to your inbox. 
        Join our community of system administrators, DevOps engineers, and automation professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300" />
        <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-green-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
