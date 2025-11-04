"use client";

import React, { useState } from 'react';

interface SavingsBreakdown {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  hoursPerMonth: number;
}

function calculateSavings(
  hourlyRate: number,
  hoursSavedPerDay: number,
  teamSize: number,
  workingDaysPerMonth: number = 22
): SavingsBreakdown {
  const dailySavings = hourlyRate * hoursSavedPerDay * teamSize;
  const weeklySavings = dailySavings * 5; // 5 working days per week
  const monthlySavings = dailySavings * workingDaysPerMonth;
  const yearlySavings = monthlySavings * 12;
  const hoursPerMonth = hoursSavedPerDay * workingDaysPerMonth * teamSize;

  return {
    daily: dailySavings,
    weekly: weeklySavings,
    monthly: monthlySavings,
    yearly: yearlySavings,
    hoursPerMonth,
  };
}

function calculateROI(monthlySavings: number, monthlyAICost: number): number {
  if (monthlyAICost === 0) return 0;
  return ((monthlySavings - monthlyAICost) / monthlyAICost) * 100;
}

export function AIROICalculator() {
  const [hourlyRate, setHourlyRate] = useState(50);
  const [hoursSavedPerDay, setHoursSavedPerDay] = useState(2);
  const [teamSize, setTeamSize] = useState(10);
  const [workingDaysPerMonth, setWorkingDaysPerMonth] = useState(22);
  const [monthlyAICost, setMonthlyAICost] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const savings = calculateSavings(hourlyRate, hoursSavedPerDay, teamSize, workingDaysPerMonth);
  const roi = calculateROI(savings.monthly, monthlyAICost);
  const netMonthlySavings = savings.monthly - monthlyAICost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-green-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#065F46"/>
        </svg>
        AI Automation Savings Calculator
      </h2>

      <p className="text-gray-600 mb-6">
        Calculate the cost savings and ROI of AI automation for your team. 
        Justify AI investments by quantifying productivity gains and time saved.
      </p>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Calculator Inputs</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hourly Rate */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Average Hourly Cost per Employee
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 p-3 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Include salary, benefits, overhead (typically 1.25-2x base salary)
            </p>
          </div>

          {/* Hours Saved */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Hours Saved per Day (per employee)
            </label>
            <input
              type="number"
              value={hoursSavedPerDay}
              onChange={(e) => setHoursSavedPerDay(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-3 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
              min="0"
              step="0.5"
            />
            <p className="text-xs text-gray-500 mt-1">
              Average hours saved per day through AI automation
            </p>
          </div>

          {/* Team Size */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Team Size
            </label>
            <input
              type="number"
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full p-3 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of employees using AI tools
            </p>
          </div>

          {/* Working Days */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Working Days per Month
            </label>
            <input
              type="number"
              value={workingDaysPerMonth}
              onChange={(e) => setWorkingDaysPerMonth(Math.max(1, parseInt(e.target.value) || 22))}
              className="w-full p-3 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
              min="1"
              max="31"
            />
            <p className="text-xs text-gray-500 mt-1">
              Standard is 22 (excluding weekends and holidays)
            </p>
          </div>
        </div>

        {/* Advanced Options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 text-green-600 hover:text-green-800 text-sm font-medium flex items-center gap-1"
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options (AI Tool Costs)
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <label className="block mb-2 font-medium text-gray-700">
              Monthly AI Tool Costs (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={monthlyAICost}
                onChange={(e) => setMonthlyAICost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-8 p-3 border rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                min="0"
                step="0.01"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total monthly cost of AI tools (ChatGPT Plus, Copilot, etc.)
            </p>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Primary Savings Display */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Monthly Savings</h3>
          <div className="text-4xl font-bold text-green-600 mb-2">
            {formatCurrency(savings.monthly)}
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Based on {formatNumber(savings.hoursPerMonth)} hours saved per month
          </p>
          
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Savings:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(savings.daily)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Weekly Savings:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(savings.weekly)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Yearly Savings:</span>
              <span className="font-semibold text-green-600 text-lg">{formatCurrency(savings.yearly)}</span>
            </div>
          </div>
        </div>

        {/* ROI Display */}
        {monthlyAICost > 0 ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 ROI Analysis</h3>
            <div className={`text-4xl font-bold mb-2 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Return on AI Investment
            </p>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Savings:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(savings.monthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Tool Costs:</span>
                <span className="font-semibold text-gray-900">-{formatCurrency(monthlyAICost)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-gray-600 font-semibold">Net Savings:</span>
                <span className={`font-bold text-lg ${netMonthlySavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netMonthlySavings)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Additional Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatNumber(savings.hoursPerMonth)}
                </div>
                <p className="text-sm text-gray-600">Hours Saved per Month</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatNumber(savings.hoursPerMonth / teamSize)}
                </div>
                <p className="text-sm text-gray-600">Hours Saved per Employee</p>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                Add AI tool costs above to see ROI calculation
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Savings Breakdown</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-700 mb-1">{formatCurrency(savings.daily)}</div>
            <div className="text-xs text-gray-600">Per Day</div>
          </div>
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-xl font-bold text-green-700 mb-1">{formatCurrency(savings.weekly)}</div>
            <div className="text-xs text-gray-600">Per Week</div>
          </div>
          <div className="text-center p-4 bg-green-200 rounded-lg">
            <div className="text-xl font-bold text-green-800 mb-1">{formatCurrency(savings.monthly)}</div>
            <div className="text-xs text-gray-600">Per Month</div>
          </div>
          <div className="text-center p-4 bg-green-300 rounded-lg">
            <div className="text-xl font-bold text-green-900 mb-1">{formatCurrency(savings.yearly)}</div>
            <div className="text-xs text-gray-600">Per Year</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Key Insights</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>
            <strong>Productivity Gain:</strong> Saving {hoursSavedPerDay} hours per day per employee 
            equals {((hoursSavedPerDay / 8) * 100).toFixed(0)}% productivity increase (assuming 8-hour workday)
          </li>
          <li>
            <strong>Annual Impact:</strong> {formatCurrency(savings.yearly)} saved per year could fund 
            {Math.floor(savings.yearly / (hourlyRate * 2000))} additional full-time employees 
            (at current hourly rates)
          </li>
          {monthlyAICost > 0 && (
            <li>
              <strong>Payback Period:</strong> AI tool costs paid back in 
              {Math.ceil((monthlyAICost * 12) / savings.yearly * 12)} months, then pure savings begin
            </li>
          )}
          <li>
            <strong>Scalability:</strong> If team doubles to {teamSize * 2} employees, 
            annual savings would reach {formatCurrency(savings.yearly * 2)}
          </li>
        </ul>
      </div>
    </div>
  );
}

export function AIROICalculatorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Why Calculate AI ROI?</h2>
        <p className="text-gray-700 text-lg">
          Every manager is pitching AI automation savings, but few can quantify the actual impact. 
          This calculator helps you justify AI investments with concrete numbers, build business cases 
          for AI tool adoption, and demonstrate the real cost savings from productivity gains.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">How to Use This Calculator</h2>
        <ol className="list-decimal pl-6 text-gray-700 space-y-2 text-lg">
          <li><strong>Enter Hourly Cost:</strong> Calculate true employee cost including salary, benefits, and overhead (typically 1.25-2x base salary)</li>
          <li><strong>Estimate Hours Saved:</strong> Measure or estimate daily hours saved per employee through AI automation</li>
          <li><strong>Input Team Size:</strong> Enter number of employees using AI tools</li>
          <li><strong>Adjust Working Days:</strong> Standard is 22 days/month (excludes weekends and holidays)</li>
          <li><strong>Add AI Costs (Optional):</strong> Include monthly AI tool subscriptions to calculate net ROI</li>
          <li><strong>Use Results:</strong> Export or screenshot results for presentations, proposals, or budget justifications</li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Understanding the Results</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">💰 Savings Calculations</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>Daily:</strong> Hours saved × hourly rate × team size</li>
              <li>• <strong>Monthly:</strong> Daily savings × working days per month</li>
              <li>• <strong>Yearly:</strong> Monthly savings × 12 months</li>
              <li>• <strong>Net Savings:</strong> Gross savings minus AI tool costs</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">📊 ROI Calculation</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• <strong>ROI Formula:</strong> ((Savings - Costs) / Costs) × 100</li>
              <li>• <strong>Positive ROI:</strong> Savings exceed tool costs</li>
              <li>• <strong>Payback Period:</strong> Time to recover initial/tool costs</li>
              <li>• <strong>Break-even:</strong> When savings equal costs</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Common Use Cases</h2>
        <div className="space-y-3">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">💼 Business Case Justification</h3>
            <p className="text-sm text-gray-700">
              Use calculated savings to justify AI tool purchases, budget approvals, or team expansion. 
              Present concrete ROI numbers to executives and stakeholders.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">📈 Performance Metrics</h3>
            <p className="text-sm text-gray-700">
              Track productivity improvements and cost savings over time. Compare actual results 
              against projections to refine AI adoption strategies.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">🎯 Budget Planning</h3>
            <p className="text-sm text-gray-700">
              Plan AI tool budgets knowing the expected return. Determine optimal tool cost thresholds 
              where ROI remains positive.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">📊 Competitive Analysis</h3>
            <p className="text-sm text-gray-700">
              Compare productivity gains across teams or departments. Identify high-impact areas 
              for AI automation investment.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-green-50 border-l-4 border-green-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-green-800">Real-World Examples</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold mb-1">Small Team (5 people, $50/hr, 2 hours/day)</h3>
            <p className="text-sm">
              <strong>Monthly Savings:</strong> $11,000 | <strong>Yearly:</strong> $132,000
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Mid-Size Team (25 people, $75/hr, 3 hours/day)</h3>
            <p className="text-sm">
              <strong>Monthly Savings:</strong> $123,750 | <strong>Yearly:</strong> $1,485,000
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Enterprise (100 people, $100/hr, 4 hours/day)</h3>
            <p className="text-sm">
              <strong>Monthly Savings:</strong> $880,000 | <strong>Yearly:</strong> $10,560,000
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Tips for Accurate Calculations</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li><strong>True Employee Cost:</strong> Include fully loaded costs (salary + benefits + overhead), typically 1.5-2x base salary</li>
          <li><strong>Measured Hours:</strong> Track actual time saved, not estimated. Use time-tracking tools for accuracy</li>
          <li><strong>Scalability:</strong> Consider how savings scale as more employees adopt AI tools</li>
          <li><strong>Tool Costs:</strong> Include all AI subscriptions (ChatGPT Plus, Copilot, Claude, etc.) for accurate ROI</li>
          <li><strong>Quality Impact:</strong> These calculations focus on time savings; also consider quality improvements</li>
          <li><strong>Ongoing Measurement:</strong> Recalculate regularly as AI tool usage and savings evolve</li>
        </ul>
      </section>
    </>
  );
}

export default AIROICalculator;

