"use client";

import React, { useState } from 'react';

type Tone = 'clickbait' | 'serious' | 'funny' | 'linkedin' | 'youtube' | 'professional' | 'casual' | 'dramatic';
type Format = 'headlines' | 'questions' | 'statements' | 'how-to' | 'numbers' | 'thumbnail';

interface ToneConfig {
  name: string;
  description: string;
  templates: string[];
}

const toneConfigs: Record<Tone, ToneConfig> = {
  clickbait: {
    name: 'Clickbait',
    description: 'High engagement, curiosity-driven',
    templates: [
      '{topic} will {shock|surprise|blow your mind}',
      'You won\'t believe this {topic} {fact|trick|secret}',
      '{number} {topic} {facts|tips|tricks} that will change everything',
      'Everyone is obsessed with {topic} - here\'s why',
      'This {topic} {hack|secret|method} is absolutely genius',
      'The {topic} {fact|story|discovery} nobody talks about',
      'Why {topic} is {better|worse} than you think',
      '{topic}: The {shocking|mind-blowing|secret} truth revealed',
      'This {topic} trend is going viral - here\'s why',
      'Nobody tells you {topic} {secret|truth|reality}'
    ]
  },
  serious: {
    name: 'Serious',
    description: 'Professional, informative, authoritative',
    templates: [
      'Understanding {topic}: A comprehensive guide',
      '{topic}: Key insights and analysis',
      'The impact of {topic} on {context}',
      '{topic} explained: What you need to know',
      'An in-depth exploration of {topic}',
      'Critical analysis: {topic} and its implications',
      'Breaking down {topic}: A detailed examination',
      'Professional insights on {topic}',
      'The strategic importance of {topic}',
      'Comprehensive overview: {topic} fundamentals'
    ]
  },
  funny: {
    name: 'Funny',
    description: 'Humorous, entertaining, light-hearted',
    templates: [
      '{topic} is the {hilarious|awkward|ridiculous} truth nobody mentions',
      'When {topic} meets real life: {comedy|chaos|disaster}',
      '{topic} in a nutshell: {humorous description}',
      'The {topic} struggle is real (and hilarious)',
      '{topic}: Because someone had to say it',
      'Confessions of a {topic} {person|enthusiast|newbie}',
      '{topic} explained like you\'re {amused|confused|drunk}',
      'The ultimate {topic} {fails|wins|moments} compilation',
      '{topic} - What we all {think|secretly feel|pretend}',
      'The {topic} {saga|adventure|nightmare} continues'
    ]
  },
  linkedin: {
    name: 'LinkedIn Professional',
    description: 'Thought leadership, industry insights',
    templates: [
      'Why {topic} is reshaping the future of {industry}',
      'Lessons from {topic}: What every professional needs to know',
      'My journey with {topic} and what I learned',
      '{topic}: The untapped opportunity in {field}',
      'How {topic} transformed my approach to {context}',
      '{topic} isn\'t just {about} - it\'s about {deeper meaning}',
      'The professional case for {topic}',
      'Breaking the {myth|stigma} around {topic}',
      '{topic}: A strategic perspective for leaders',
      'Thoughts on {topic} from a {role|perspective}'
    ]
  },
  youtube: {
    name: 'YouTube',
    description: 'Engaging, search-optimized, visual-friendly',
    templates: [
      'I {did|tried|tested} {topic} for {time} and here\'s what happened',
      '{topic} Explained in {number} Minutes',
      'The {topic} {tutorial|guide|review} you need to watch',
      'Everything {topic} - Complete {guide|tutorial|breakdown}',
      '{topic}: {Surprising|Shocking|Honest} {reality|truth|test}',
      'I Wish I Knew This About {topic} Sooner',
      'My Honest {topic} Review ({timeframe})',
      '{topic} Tutorial: From Beginner to Expert',
      'The {topic} Problem Nobody Talks About',
      'Testing {topic}: Does It Actually Work?'
    ]
  },
  professional: {
    name: 'Professional',
    description: 'Corporate, formal, business-focused',
    templates: [
      'Strategic approach to {topic} in {context}',
      '{topic}: Best practices and recommendations',
      'Implementing {topic} in {professional setting}',
      '{topic} white paper: Key findings',
      'Executive briefing: {topic} implications',
      '{topic} framework for {organization|team|project}',
      'Case study: {topic} success factors',
      '{topic} implementation guide for professionals',
      'ROI analysis: {topic} in {industry|context}',
      '{topic}: Technical considerations and solutions'
    ]
  },
  casual: {
    name: 'Casual',
    description: 'Conversational, friendly, approachable',
    templates: [
      'So, about {topic}...',
      'Let\'s talk about {topic}',
      'Here\'s what I think about {topic}',
      '{topic} might be simpler than you think',
      'Quick thoughts on {topic}',
      'Trying out {topic} for the first time',
      '{topic}: My honest take',
      'Everything I learned about {topic}',
      'You should know about {topic}',
      'Why I {love|hate} {topic} (and why you should too)'
    ]
  },
  dramatic: {
    name: 'Dramatic',
    description: 'Intense, emotional, impactful',
    templates: [
      'The shocking truth about {topic}',
      'Why {topic} is {life-changing|revolutionary|terrifying}',
      '{topic}: The {story|battle|revolution} that changed everything',
      'Inside the {topic} {scandal|crisis|miracle}',
      'The {topic} {revelation|discovery|catastrophe} nobody saw coming',
      '{topic} is destroying {thing} - here\'s proof',
      'Exposed: The dark side of {topic}',
      '{topic}: A {journey|battle|revolution} for the ages',
      'The {topic} {conspiracy|secret|movement} revealed',
      'Breaking: {topic} could change {thing} forever'
    ]
  }
};

const formatTemplates: Record<Format, string[]> = {
  headlines: [],
  questions: [
    'Is {topic} the future of {thing}?',
    'What if {topic} is {idea}?',
    'Why is {topic} {trending|important|controversial}?',
    'Can {topic} {succeed|fail|work}?',
    'Is {topic} really {claim}?'
  ],
  statements: [
    '{topic} is {bold claim}',
    '{topic} isn\'t {popular belief} - it\'s {reality}',
    '{topic}: {insightful statement}',
    'The real {topic} is {truth}',
    '{topic} means {meaning}'
  ],
  'how-to': [
    'How to {topic} in {timeframe}',
    'How to {topic} like a {expert|professional}',
    'How to {topic} without {challenge}',
    'How to {topic}: {number} simple steps',
    'How to master {topic} quickly'
  ],
  numbers: [
    '{number} {topic} strategies that work',
    '{number} things I learned about {topic}',
    '{number} {topic} mistakes to avoid',
    '{number} ways to {topic} {better|faster|smarter}',
    '{number} {topic} {facts|tips|secrets}'
  ],
  thumbnail: [
    '{topic} is {extreme claim}',
    '{topic} is {polarizing statement}',
    '{topic} = {shock value}',
    '{topic} is {emotion}',
    '{topic} explained'
  ]
};

export function AIHeadlineGenerator() {
  const [topic, setTopic] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<Tone>('clickbait');
  const [selectedFormat, setSelectedFormat] = useState<Format>('headlines');
  const [numberOfHeadlines, setNumberOfHeadlines] = useState<number>(10);
  const [generatedHeadlines, setGeneratedHeadlines] = useState<string[]>([]);
  const [customContext, setCustomContext] = useState<string>('');

  const generateHeadline = (template: string): string => {
    let headline = template;
    
    // Replace {topic} with actual topic
    headline = headline.replace(/{topic}/g, topic);
    
    // Replace placeholders in {option1|option2} format
    headline = headline.replace(/{([^|]+)\|([^}]+)}/g, (match, opt1, opt2) => {
      return Math.random() > 0.5 ? opt1 : opt2;
    });
    
    // Replace {number} with random numbers
    headline = headline.replace(/{number}/g, () => {
      const numbers = [5, 7, 10, 15, 20, 50, 100];
      return numbers[Math.floor(Math.random() * numbers.length)].toString();
    });
    
    // Replace {timeframe} with timeframes
    headline = headline.replace(/{timeframe}/g, () => {
      const timeframes = ['30 days', '1 week', '1 month', '1 year', 'overnight'];
      return timeframes[Math.floor(Math.random() * timeframes.length)];
    });
    
    // Replace {context} with custom context or generic
    const contextValue = customContext || 'industry';
    headline = headline.replace(/{context}/g, contextValue);
    
    // Replace {thing} with generic substitutes
    const things = ['the industry', 'everything', 'your life', 'business', 'technology'];
    headline = headline.replace(/{thing}/g, () => things[Math.floor(Math.random() * things.length)]);
    
    // Replace {role} with roles
    const roles = ['developer', 'executive', 'manager', 'designer', 'engineer'];
    headline = headline.replace(/{role}/g, () => roles[Math.floor(Math.random() * roles.length)]);
    
    // Replace {industry} with industries
    const industries = ['tech', 'finance', 'healthcare', 'marketing', 'education'];
    headline = headline.replace(/{industry}/g, () => industries[Math.floor(Math.random() * industries.length)]);
    
    // Replace {organization|team|project} variations
    headline = headline.replace(/{organization\|team\|project}/g, () => {
      return ['organization', 'team', 'project'][Math.floor(Math.random() * 3)];
    });
    
    // Capitalize first letter
    return headline.charAt(0).toUpperCase() + headline.slice(1);
  };

  const handleGenerate = () => {
    if (!topic.trim()) return;

    const headlines: string[] = [];
    const templates = toneConfigs[selectedTone].templates;
    const formatTemps = formatTemplates[selectedFormat];
    
    let templatesToUse = templates;
    
    if (selectedFormat !== 'headlines' && formatTemps.length > 0) {
      templatesToUse = formatTemps;
    }

    // Generate headlines
    for (let i = 0; i < numberOfHeadlines; i++) {
      const templateIndex = Math.floor(Math.random() * templatesToUse.length);
      const template = templatesToUse[templateIndex];
      headlines.push(generateHeadline(template));
    }

    // Remove duplicates
    const uniqueHeadlines = Array.from(new Set(headlines));
    
    // If we have fewer than requested due to duplicates, generate more
    while (uniqueHeadlines.length < numberOfHeadlines) {
      const templateIndex = Math.floor(Math.random() * templatesToUse.length);
      const template = templatesToUse[templateIndex];
      const headline = generateHeadline(template);
      if (!uniqueHeadlines.includes(headline)) {
        uniqueHeadlines.push(headline);
      }
    }

    setGeneratedHeadlines(uniqueHeadlines.slice(0, numberOfHeadlines));
  };

  const copyHeadline = (headline: string) => {
    navigator.clipboard.writeText(headline);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(generatedHeadlines.join('\n'));
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-orange-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="14" rx="2" fill="#ea580c"/>
          <path d="M3 8h18M8 14h8" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        AI Headline Generator
      </h2>

      <p className="text-gray-600 mb-6">
        Generate eye-catching headlines, hooks, and titles for your content. Perfect for blogs, YouTube videos, 
        social media, and marketing campaigns. Multiple tones and formats to match your brand voice.
      </p>

      {/* Topic Input */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-orange-700">
          Your Topic / Article Idea *
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Why Linux is better than Windows, Python for beginners, AI automation"
          className="w-full p-3 border rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        <p className="text-sm text-gray-500 mt-2">
          Describe what your content is about in a few words
        </p>
      </div>

      {/* Tone Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-orange-700">
          Select Tone
        </label>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(toneConfigs).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedTone(key as Tone)}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedTone === key
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="font-semibold text-sm mb-1">{config.name}</div>
              <div className="text-xs text-gray-600">{config.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Format Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-orange-700">
          Headline Format
        </label>
        <div className="grid md:grid-cols-3 gap-3">
          {Object.entries(formatTemplates).map(([key, templates]) => (
            <button
              key={key}
              onClick={() => setSelectedFormat(key as Format)}
              disabled={templates.length === 0}
              className={`p-3 border-2 rounded-lg text-left transition-all ${
                selectedFormat === key
                  ? 'border-orange-500 bg-orange-50'
                  : templates.length === 0
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="font-semibold text-sm capitalize">{key.replace('-', ' ')}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Number of Headlines */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-4 font-medium text-orange-700">
          Number of Headlines to Generate: {numberOfHeadlines}
        </label>
        <input
          type="range"
          min="5"
          max="20"
          value={numberOfHeadlines}
          onChange={(e) => setNumberOfHeadlines(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>5</span>
          <span>20</span>
        </div>
      </div>

      {/* Optional Context */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-orange-700">
          Optional Context / Industry
        </label>
        <input
          type="text"
          value={customContext}
          onChange={(e) => setCustomContext(e.target.value)}
          placeholder="e.g., finance, tech, healthcare, marketing"
          className="w-full p-3 border rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        <p className="text-sm text-gray-500 mt-2">
          This helps customize headlines for specific industries or contexts
        </p>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!topic.trim()}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors mb-6 ${
          topic.trim()
            ? 'bg-orange-600 hover:bg-orange-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Generate {numberOfHeadlines} Headlines
      </button>

      {/* Generated Headlines */}
      {generatedHeadlines.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Your Generated Headlines ({generatedHeadlines.length})
            </h3>
            <button
              onClick={copyAll}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Copy All
            </button>
          </div>
          <div className="space-y-3">
            {generatedHeadlines.map((headline, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-orange-400 transition-colors group"
              >
                <div className="flex-1">
                  <span className="text-sm text-gray-500 mr-2">#{index + 1}</span>
                  <span className="text-lg font-medium text-gray-900">{headline}</span>
                </div>
                <button
                  onClick={() => copyHeadline(headline)}
                  className="ml-4 px-3 py-2 bg-gray-100 hover:bg-orange-50 text-gray-700 rounded-lg font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Offer CTA */}
      {generatedHeadlines.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            🎯 Want Even More Headlines?
          </h3>
          <p className="text-blue-800 mb-4">
            Subscribe to get <strong>50+ professionally crafted headlines</strong> every week, plus advanced templates and AI-powered suggestions!
          </p>
          <div className="flex gap-3">
            <a 
              href="/newsletter"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Get 50 More Headlines →
            </a>
            <a 
              href="/premium"
              className="px-6 py-3 bg-white hover:bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg font-semibold transition-colors"
            >
              Upgrade to Premium →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIHeadlineGeneratorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">What Makes a Great Headline?</h2>
        <p className="text-gray-700 text-lg">
          A great headline is <strong>specific, engaging, and promise-driven</strong>. It tells your audience exactly what they'll get while creating curiosity or urgency. The best headlines combine the right tone, clear value, and emotional resonance to compel clicks.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Available Tones & Styles</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">🎯 Engagement-Focused</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Clickbait - High curiosity, viral potential</li>
              <li>• YouTube - Video-optimized, SEO-friendly</li>
              <li>• Dramatic - Emotional, impactful</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">💼 Professional</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• LinkedIn - Thought leadership</li>
              <li>• Serious - Informative, authoritative</li>
              <li>• Professional - Corporate, formal</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">😄 Fun & Casual</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Funny - Entertaining, humorous</li>
              <li>• Casual - Conversational, friendly</li>
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">📝 Format Templates</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Questions - "Is X really Y?"</li>
              <li>• How-To - "How to X like Y"</li>
              <li>• Numbers - "10 X secrets"</li>
              <li>• Thumbnail - Short, punchy</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be specific</strong> - Vague topics produce vague headlines</li>
          <li><strong>Know your audience</strong> - Match tone to your target demographic</li>
          <li><strong>Test multiple variants</strong> - Generate 10-20 and pick the best ones</li>
          <li><strong>Consider platform</strong> - LinkedIn vs YouTube vs Blog have different needs</li>
          <li><strong>Add numbers</strong> - "5 Ways" or "10 Tips" increases engagement</li>
          <li><strong>Use power words</strong> - Ultimate, Secret, Revolutionary, Essential</li>
        </ul>
      </section>

      <section className="mb-10 bg-orange-50 border-l-4 border-orange-500 p-6 rounded">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Popular Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">📺 Content Creators</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• YouTube video titles</li>
              <li>• TikTok captions</li>
              <li>• Instagram post headlines</li>
              <li>• Podcast episode names</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">✍️ Bloggers & Writers</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Blog post titles</li>
              <li>• Article headlines</li>
              <li>• Newsletter subject lines</li>
              <li>• Article titles</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">💼 Marketers</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• Ad copy headlines</li>
              <li>• Email subject lines</li>
              <li>• Landing page headers</li>
              <li>• Social media ads</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-900 mb-2">🎓 Professional</h3>
            <ul className="text-sm text-orange-800 space-y-1">
              <li>• LinkedIn posts</li>
              <li>• Presentation titles</li>
              <li>• Report headlines</li>
              <li>• Webinar topics</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Headline Psychology</h2>
        <p className="text-gray-700 text-lg mb-3">
          Understanding how headlines work psychologically can significantly improve your content performance:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li><strong>Curiosity gap</strong> - Pique interest without giving everything away</li>
          <li><strong>Promise value</strong> - Clearly state the benefit readers will gain</li>
          <li><strong>Use specificity</strong> - "5 Linux Commands" beats "Linux Tips"</li>
          <li><strong>Emotional triggers</strong> - Words like "secret," "revealed," "ultimate" increase engagement</li>
          <li><strong>Urgency/Scarcity</strong> - "Limited time," "Few know," "Before it's too late"</li>
        </ul>
      </section>
    </>
  );
}

export default AIHeadlineGenerator;

