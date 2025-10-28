"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-900 to-emerald-800 rounded-xl mb-10">
      <div className="relative px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-green-100 text-lg">{description}</p>
      </div>
    </div>
  );
}

export function AtCommandGenerator() {
  const [scheduleType, setScheduleType] = useState<'time' | 'date' | 'relative'>('time');
  const [time, setTime] = useState('14:30');
  const [date, setDate] = useState('');
  const [relativeTime, setRelativeTime] = useState('1');
  const [relativeUnit, setRelativeUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');

  const generateAtCommand = () => {
    let atTime = '';
    
    switch (scheduleType) {
      case 'time':
        atTime = time;
        break;
      case 'date':
        if (date) {
          const dateObj = new Date(date);
          atTime = `${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()} ${time}`;
        } else {
          atTime = time;
        }
        break;
      case 'relative':
        atTime = `now + ${relativeTime} ${relativeUnit}`;
        break;
    }

    if (!command.trim()) {
      setOutput('Please enter a command to schedule.');
      return;
    }

    const atCommand = `at ${atTime}`;
    const fullCommand = `echo "${command}" | at ${atTime}`;
    
    setOutput(`Generated at command:\n\n${atCommand}\n\nFull command with echo:\n${fullCommand}\n\nUsage:\n1. Run: ${atCommand}\n2. Type your command\n3. Press Ctrl+D to submit`);
  };

  const clearOutput = () => {
    setOutput('');
    setCommand('');
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-green-800">at Command Generator</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-green-700">Schedule Type</h3>
            <div className="space-y-2">
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="time"
                  checked={scheduleType === 'time'}
                  onChange={(e) => setScheduleType(e.target.value as 'time')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium text-green-800">Specific Time Today</span>
                  <p className="text-sm text-green-600">Schedule for a specific time today</p>
                </div>
              </label>
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="date"
                  checked={scheduleType === 'date'}
                  onChange={(e) => setScheduleType(e.target.value as 'date')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium text-green-800">Specific Date & Time</span>
                  <p className="text-sm text-green-600">Schedule for a specific date and time</p>
                </div>
              </label>
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  value="relative"
                  checked={scheduleType === 'relative'}
                  onChange={(e) => setScheduleType(e.target.value as 'relative')}
                  className="mt-1 mr-3"
                />
                <div>
                  <span className="font-medium text-green-800">Relative Time</span>
                  <p className="text-sm text-green-600">Schedule relative to now</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {scheduleType === 'date' && (
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {scheduleType === 'relative' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Amount</label>
                <input
                  type="number"
                  min="1"
                  value={relativeTime}
                  onChange={(e) => setRelativeTime(e.target.value)}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">Unit</label>
                <select
                  value={relativeUnit}
                  onChange={(e) => setRelativeUnit(e.target.value as 'minutes' | 'hours' | 'days')}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-green-700 mb-2">Command to Execute</label>
            <textarea
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter the command you want to schedule"
              rows={4}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={generateAtCommand}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Generate Command
            </button>
            <button
              onClick={clearOutput}
              className="px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-700">Generated Command</h3>
          {output ? (
            <div className="bg-white rounded-lg shadow p-4 border border-green-200">
              <pre className="whitespace-pre-wrap text-sm text-green-800 font-mono bg-green-50 p-3 rounded border">
                {output}
              </pre>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 border border-green-200 text-center">
              <p className="text-green-600">Fill in the details and click "Generate Command" to see your at command</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function QuickReferenceSection() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 shadow-md mb-10">
      <h2 className="text-2xl font-bold text-green-800 mb-4">Quick Reference</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">Common at Commands</h3>
          <div className="bg-white rounded-lg shadow p-4">
            <ul className="space-y-2">
              <li>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded">at 2:30</code>
                <span className="ml-2">Schedule for 2:30 AM today</span>
              </li>
              <li>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded">at 15:30</code>
                <span className="ml-2">Schedule for 3:30 PM today</span>
              </li>
              <li>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded">at now + 2 hours</code>
                <span className="ml-2">Schedule for 2 hours from now</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-2">at Command Options</h3>
          <div className="bg-white rounded-lg shadow p-4">
            <ul className="space-y-2">
              <li>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded">at -l</code>
                <span className="ml-2">List pending jobs</span>
              </li>
              <li>
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded">at -r job_id</code>
                <span className="ml-2">Remove a scheduled job</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AtInfoSections() {
  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold mb-2 text-green-800">What is the at command?</h2>
        <p className="text-gray-700 text-lg">
          The <code className="bg-gray-100 px-1 rounded">at</code> command in Linux is used to schedule one-time tasks to be executed at a specific time.
        </p>
      </section>
      
      <section>
        <h2 className="text-xl font-bold mb-2 text-green-800">How at Commands Work</h2>
        <div className="bg-green-50 p-4 rounded-lg">
          <ol className="list-decimal pl-6 text-gray-700 space-y-2">
            <li>Use <code className="bg-gray-100 px-1 rounded">at</code> to schedule a command for a specific time</li>
            <li>The command is added to the at queue</li>
            <li>The at daemon executes the command at the specified time</li>
            <li>The job is removed from the queue after execution</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl overflow-hidden shadow-lg mb-10">
      <div className="px-6 py-10 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Master Linux Scheduling</h2>
        <p className="text-green-100 text-lg mb-6">
          Get notified about new Linux tools and tutorials.
        </p>
        <button className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
          Subscribe
        </button>
      </div>
    </div>
  );
}

export function RelatedToolsSection({ tools }: { tools: any[] }) {
  if (!tools || tools.length === 0) return null;
  
  const displayTools = tools.slice(0, 6);
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-green-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a 
            key={tool.id} 
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100"
          >
            <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
            <p className="text-gray-600 text-sm">{tool.description}</p>
            <div className="mt-4 text-green-600 text-sm font-medium">
              Try this tool →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
