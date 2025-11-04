"use client";

import React, { useState } from 'react';

interface ContentDay {
  day: number;
  date: string;
  dayOfWeek: string;
  topic: string;
  prompt: string;
  contentType: string;
  hashtags: string[];
}

const contentTypes = [
  'Social Media Post',
  'Video/Reel',
  'Blog Post',
  'Email Newsletter',
  'Podcast Episode',
  'YouTube Video',
  'LinkedIn Post',
  'Twitter/X Thread',
  'Instagram Story',
  'TikTok Video'
];

const frequencies = [
  { id: 'daily', name: 'Daily', daysPerWeek: 7 },
  { id: '5x', name: '5x per week', daysPerWeek: 5 },
  { id: '3x', name: '3x per week', daysPerWeek: 3 },
  { id: '2x', name: '2x per week', daysPerWeek: 2 },
  { id: 'weekly', name: 'Weekly', daysPerWeek: 1 }
];

function generateContentPlan(topic: string, frequency: string, contentType: string, startDate: Date = new Date()): ContentDay[] {
  const plan: ContentDay[] = [];
  const frequencyData = frequencies.find(f => f.id === frequency);
  const daysPerWeek = frequencyData?.daysPerWeek || 7;
  
  const contentIdeas = [
    'Share a personal story related to your topic',
    'Post a quick tip or hack',
    'Create a behind-the-scenes content',
    'Share a customer testimonial or success story',
    'Post an educational piece explaining a key concept',
    'Share industry news or updates',
    'Create a "How-to" guide or tutorial',
    'Post a motivational quote or inspiration',
    'Share a case study or example',
    'Create a comparison or "vs" content',
    'Post a FAQ answering common questions',
    'Share a listicle (top 5, top 10)',
    'Create a "Day in the life" content',
    'Post a product or service highlight',
    'Share a trend or prediction',
    'Create a challenge or contest',
    'Post a "Myth vs Fact" content',
    'Share a resource or tool recommendation',
    'Create a "What I learned" reflection',
    'Post a community spotlight or feature',
    'Share a "Before and After" transformation',
    'Create a "Common mistakes" warning',
    'Post a "Pro tip" from an expert',
    'Share a "Quick wins" list',
    'Create a "Step-by-step" guide',
    'Post a "Why it matters" explanation',
    'Share a "Behind the scenes" look',
    'Create a "Fun facts" or trivia',
    'Post a "Tools and resources" roundup',
    'Share a "Lessons learned" reflection'
  ];

  const hashtagTemplates = [
    ['#ContentCreator', '#SocialMedia', '#Marketing'],
    ['#BusinessTips', '#Entrepreneurship', '#Growth'],
    ['#TechNews', '#Innovation', '#Digital'],
    ['#Lifestyle', '#Wellness', '#Mindfulness'],
    ['#Education', '#Learning', '#Knowledge'],
    ['#Fitness', '#Health', '#Wellness'],
    ['#Fashion', '#Style', '#Trends'],
    ['#Food', '#Recipe', '#Cooking'],
    ['#Travel', '#Adventure', '#Explore'],
    ['#Photography', '#Art', '#Creative']
  ];

  // Get hashtags based on topic
  const hashtags = hashtagTemplates[Math.floor(Math.random() * hashtagTemplates.length)];

  // Generate dates for 30 days
  const currentDate = new Date(startDate);
  let contentDays: number[] = [];
  
  // Distribute content days across weeks
  const weeks = Math.ceil(30 / 7);
  for (let week = 0; week < weeks; week++) {
    const weekStart = week * 7;
    const weekEnd = Math.min(weekStart + 7, 30);
    const daysInWeek = weekEnd - weekStart;
    const contentDaysInWeek = Math.min(daysPerWeek, daysInWeek);
    
    // Distribute content days evenly across the week
    const spacing = Math.floor(daysInWeek / contentDaysInWeek);
    for (let i = 0; i < contentDaysInWeek; i++) {
      const dayIndex = weekStart + (i * spacing);
      if (dayIndex < 30) {
        contentDays.push(dayIndex + 1);
      }
    }
  }

  // Generate content for each day
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    const isContentDay = contentDays.includes(i + 1);
    
    if (isContentDay) {
      const ideaIndex = i % contentIdeas.length;
      const prompt = `${contentIdeas[ideaIndex]} about ${topic}. Make it engaging and valuable for your audience.`;
      
      plan.push({
        day: i + 1,
        date: dateStr,
        dayOfWeek,
        topic: topic,
        prompt,
        contentType,
        hashtags: [...hashtags, `#${topic.replace(/\s+/g, '')}`]
      });
    } else {
      plan.push({
        day: i + 1,
        date: dateStr,
        dayOfWeek,
        topic: topic,
        prompt: 'Rest day - No content scheduled',
        contentType: '',
        hashtags: []
      });
    }
  }

  return plan;
}

export function AIContentPlanner() {
  const [topic, setTopic] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [contentType, setContentType] = useState('Social Media Post');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [contentPlan, setContentPlan] = useState<ContentDay[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const start = new Date(startDate);
      const plan = generateContentPlan(topic, frequency, contentType, start);
      setContentPlan(plan);
      setIsGenerating(false);
      setShowPlan(true);
    }, 800);
  };

  const handleCopy = (day: ContentDay) => {
    const text = `Day ${day.day} - ${day.date} (${day.dayOfWeek})\n\nTopic: ${day.topic}\nContent Type: ${day.contentType}\nPrompt: ${day.prompt}\n\nHashtags: ${day.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    alert('Content plan copied to clipboard!');
  };

  const handleCopyAll = () => {
    const text = `30-Day Content Plan for: ${topic}\n\n${contentPlan.map(day => 
      day.prompt !== 'Rest day - No content scheduled' 
        ? `Day ${day.day} - ${day.date} (${day.dayOfWeek})\nPrompt: ${day.prompt}\nHashtags: ${day.hashtags.join(' ')}\n`
        : ''
    ).filter(Boolean).join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('Full content plan copied to clipboard!');
  };

  const handleClear = () => {
    setTopic('');
    setFrequency('daily');
    setContentType('Social Media Post');
    setContentPlan([]);
    setShowPlan(false);
  };

  const handleLoadExample = () => {
    setTopic('AI Tools for Productivity');
    setFrequency('3x');
    setContentType('Social Media Post');
  };

  const activeDays = contentPlan.filter(day => day.prompt !== 'Rest day - No content scheduled').length;

  return (
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-teal-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="#0F766E" strokeWidth="2" fill="none"/>
        </svg>
        AI Content Planner (30-Day Schedule Generator)
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-teal-700">
            Content Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., AI Tools for Productivity, Fitness Tips, Business Strategies"
            className="w-full p-4 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
          <p className="text-xs text-gray-600 mt-2">
            Enter the main topic or theme for your content
          </p>
        </div>

        {/* Frequency Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-teal-700">
            Posting Frequency
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {frequencies.map(freq => (
              <button
                key={freq.id}
                onClick={() => setFrequency(freq.id)}
                className={`p-3 border-2 rounded-lg text-sm font-medium transition-all ${
                  frequency === freq.id
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-teal-700 border-teal-200 hover:border-teal-300'
                }`}
              >
                {freq.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Selection */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-teal-700">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full p-4 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          >
            {contentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-teal-700">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-4 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleLoadExample}
            className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
          >
            Load Example
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!topic.trim() || isGenerating}
          className={`w-full mt-4 py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            topic.trim() && !isGenerating
              ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 hover:scale-105 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating 30-Day Plan...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/>
              </svg>
              Generate 30-Day Content Plan
            </span>
          )}
        </button>
      </div>

      {showPlan && contentPlan.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-teal-800">30-Day Content Plan Summary</h3>
                <p className="text-gray-600 mt-1">Topic: <strong>{topic}</strong></p>
              </div>
              <button
                onClick={handleCopyAll}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy All
              </button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-teal-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Days</p>
                <p className="text-2xl font-bold text-teal-800">30</p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Content Days</p>
                <p className="text-2xl font-bold text-cyan-800">{activeDays}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Rest Days</p>
                <p className="text-2xl font-bold text-blue-800">{30 - activeDays}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Content Type</p>
                <p className="text-lg font-bold text-purple-800">{contentType}</p>
              </div>
            </div>
          </div>

          {/* Content Calendar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-teal-800 mb-4">30-Day Content Calendar</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contentPlan.map((day) => (
                <div
                  key={day.day}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    day.prompt !== 'Rest day - No content scheduled'
                      ? 'border-teal-200 bg-teal-50 hover:border-teal-400 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">Day {day.day}</span>
                        {day.prompt !== 'Rest day - No content scheduled' && (
                          <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-bold">
                            {contentType}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{day.date} ({day.dayOfWeek})</p>
                    </div>
                    {day.prompt !== 'Rest day - No content scheduled' && (
                      <button
                        onClick={() => handleCopy(day)}
                        className="p-1 text-teal-600 hover:text-teal-800 transition-colors"
                        title="Copy"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {day.prompt !== 'Rest day - No content scheduled' ? (
                    <>
                      <p className="text-sm text-gray-800 mb-2 font-medium">{day.prompt}</p>
                      {day.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {day.hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {day.hashtags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{day.hashtags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Rest day</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIContentPlannerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">What is an AI Content Planner?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          An <strong>AI Content Planner</strong> is a tool that generates a 30-day content schedule with daily 
          AI prompt ideas. Choose your topic and posting frequency, and the tool creates a complete content calendar 
          with daily prompts, hashtags, and content type suggestions. Perfect for influencers, small businesses, 
          content creators, and anyone who needs a structured content strategy.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our AI Content Planner generates a 30-day content schedule by:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Analyzing your topic:</strong> Understanding your content theme and focus</li>
          <li><strong>Selecting frequency:</strong> Distributing content days based on your posting frequency</li>
          <li><strong>Generating prompts:</strong> Creating daily AI prompt ideas for each content day</li>
          <li><strong>Suggesting hashtags:</strong> Providing relevant hashtags for each post</li>
          <li><strong>Creating calendar:</strong> Organizing content into a 30-day schedule</li>
          <li><strong>Exporting plan:</strong> Allowing you to copy and export the full plan</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">Supported Frequencies</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {frequencies.map(freq => (
            <div key={freq.id} className="bg-white p-4 rounded-lg border-2 border-teal-200 text-center">
              <div className="text-3xl font-bold text-teal-800 mb-2">{freq.daysPerWeek}</div>
              <div className="text-sm text-gray-700 font-semibold">{freq.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">Supported Content Types</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          {contentTypes.map(type => (
            <div key={type} className="bg-white p-3 rounded-lg border border-teal-200 text-sm text-gray-700 text-center">
              {type}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-lg border-l-4 border-teal-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Save Time:</strong> Generate a complete 30-day content plan in seconds</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Stay Consistent:</strong> Maintain a regular posting schedule with planned content</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Get Ideas:</strong> Never run out of content ideas with daily AI prompts</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Plan Ahead:</strong> See your entire month of content at a glance</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Copy Ready:</strong> Copy prompts and hashtags directly to your content tools</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific:</strong> Use detailed topics for better prompt generation</li>
          <li><strong>Choose realistic frequency:</strong> Select a frequency you can maintain consistently</li>
          <li><strong>Customize prompts:</strong> Use generated prompts as starting points and customize</li>
          <li><strong>Plan in advance:</strong> Generate plans at the start of each month</li>
          <li><strong>Mix content types:</strong> Try different content types for variety</li>
          <li><strong>Track performance:</strong> Monitor which prompts perform best</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-teal-200">
            <h3 className="font-bold text-teal-800 mb-3">✅ Influencers</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Plan social media content</li>
              <li>• Maintain consistent posting</li>
              <li>• Generate daily content ideas</li>
              <li>• Track content calendar</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-cyan-200">
            <h3 className="font-bold text-cyan-800 mb-3">✅ Small Businesses</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Content marketing strategy</li>
              <li>• Social media planning</li>
              <li>• Email newsletter planning</li>
              <li>• Blog content scheduling</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-teal-100 to-cyan-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-teal-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Enter your topic</strong> (e.g., "AI Tools for Productivity")</li>
          <li><strong>Select posting frequency</strong> (daily, 3x/week, weekly, etc.)</li>
          <li><strong>Choose content type</strong> (Social Media Post, Video, Blog, etc.)</li>
          <li><strong>Set start date</strong> (when you want to begin your content plan)</li>
          <li><strong>Click "Generate 30-Day Content Plan"</strong> to create your schedule</li>
          <li><strong>Review the calendar</strong> and copy individual prompts or the full plan</li>
          <li><strong>Use the prompts</strong> to create your content using AI tools like ChatGPT</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Generate a new plan at the start of each month to keep your content fresh and relevant!
        </p>
      </section>
    </>
  );
}

export default AIContentPlanner;

