"use client";

import React, { useState } from 'react';

interface CameraInstruction {
  shotType: string;
  cameraAngle: string;
  cameraMovement: string;
  framing: string;
  focus: string;
}

interface SceneVisualization {
  sceneDescription: string;
  cameraInstructions: CameraInstruction;
  veoPrompt: string;
  pikaPrompt: string;
  mood: string;
  lighting: string;
  colorPalette: string;
}

const shotTypes = [
  'Wide Shot (WS)',
  'Medium Shot (MS)',
  'Close-Up (CU)',
  'Extreme Close-Up (ECU)',
  'Long Shot (LS)',
  'Two Shot',
  'Over-the-Shoulder (OTS)',
  'Point of View (POV)',
  'Dutch Angle',
  'Bird\'s Eye View',
  'Worm\'s Eye View'
];

const cameraAngles = [
  'Eye Level',
  'High Angle',
  'Low Angle',
  'Dutch Angle',
  'Bird\'s Eye',
  'Worm\'s Eye'
];

const cameraMovements = [
  'Static',
  'Pan (Horizontal)',
  'Tilt (Vertical)',
  'Dolly (Forward/Back)',
  'Track (Sideways)',
  'Zoom In',
  'Zoom Out',
  'Crane Up',
  'Crane Down',
  'Steadycam Follow',
  'Handheld'
];

const moods = [
  'Dramatic',
  'Intimate',
  'Epic',
  'Mysterious',
  'Tense',
  'Peaceful',
  'Energetic',
  'Melancholic',
  'Romantic',
  'Thrilling'
];

function generateVisualization(script: string): SceneVisualization {
  const scriptLower = script.toLowerCase();
  
  // Analyze script for mood and context
  let mood = 'Dramatic';
  let lighting = 'Natural daylight';
  let colorPalette = 'Warm, cinematic';
  
  if (scriptLower.includes('love') || scriptLower.includes('heart') || scriptLower.includes('romantic')) {
    mood = 'Romantic';
    lighting = 'Soft, golden hour lighting';
    colorPalette = 'Warm, soft pastels';
  } else if (scriptLower.includes('dark') || scriptLower.includes('night') || scriptLower.includes('fear')) {
    mood = 'Mysterious';
    lighting = 'Low-key, dramatic shadows';
    colorPalette = 'Cool, desaturated blues and grays';
  } else if (scriptLower.includes('action') || scriptLower.includes('run') || scriptLower.includes('fight')) {
    mood = 'Energetic';
    lighting = 'Dynamic, high contrast';
    colorPalette = 'Vibrant, saturated colors';
  } else if (scriptLower.includes('sad') || scriptLower.includes('cry') || scriptLower.includes('lonely')) {
    mood = 'Melancholic';
    lighting = 'Soft, diffused, overcast';
    colorPalette = 'Muted, desaturated tones';
  }

  // Determine camera instructions based on script
  const shotType = scriptLower.includes('close') || scriptLower.includes('face') || scriptLower.includes('eye')
    ? 'Close-Up (CU)'
    : scriptLower.includes('wide') || scriptLower.includes('landscape') || scriptLower.includes('view')
    ? 'Wide Shot (WS)'
    : scriptLower.includes('two') || scriptLower.includes('both') || scriptLower.includes('together')
    ? 'Two Shot'
    : 'Medium Shot (MS)';

  const cameraAngle = scriptLower.includes('above') || scriptLower.includes('top')
    ? 'Bird\'s Eye'
    : scriptLower.includes('below') || scriptLower.includes('low')
    ? 'Worm\'s Eye'
    : scriptLower.includes('dramatic') || scriptLower.includes('intense')
    ? 'Dutch Angle'
    : 'Eye Level';

  const cameraMovement = scriptLower.includes('follow') || scriptLower.includes('walk') || scriptLower.includes('move')
    ? 'Steadycam Follow'
    : scriptLower.includes('zoom')
    ? 'Zoom In'
    : scriptLower.includes('pan') || scriptLower.includes('sweep')
    ? 'Pan (Horizontal)'
    : 'Static';

  const framing = shotType.includes('Close') ? 'Tight, character-focused' : 
                  shotType.includes('Wide') ? 'Environmental, establishing' : 
                  'Balanced composition';

  const focus = shotType.includes('Close') ? 'Shallow depth of field, character in focus' : 
                'Deep focus, environment and character';

  const cameraInstructions: CameraInstruction = {
    shotType,
    cameraAngle,
    cameraMovement,
    framing,
    focus
  };

  // Generate Veo prompt
  const veoPrompt = `Cinematic scene: ${script}. ${shotType}, ${cameraAngle} angle, ${cameraMovement} camera movement. ${lighting}. ${colorPalette} color palette. ${mood} mood. ${framing} framing. ${focus}. Professional cinematography, film quality, 4K resolution, smooth motion.`;

  // Generate Pika prompt
  const pikaPrompt = `${shotType} | ${cameraAngle} angle | ${cameraMovement} | ${script} | ${lighting} | ${colorPalette} | ${mood} atmosphere | Cinematic, professional film quality, 4K, smooth camera movement, depth of field`;

  // Generate scene description
  const sceneDescription = `A ${mood.toLowerCase()} scene featuring ${script}. Captured with ${shotType.toLowerCase()} from a ${cameraAngle.toLowerCase()} angle, using ${cameraMovement.toLowerCase()} camera movement. ${lighting} creates ${mood.toLowerCase()} atmosphere with a ${colorPalette.toLowerCase()} color palette.`;

  return {
    sceneDescription,
    cameraInstructions,
    veoPrompt,
    pikaPrompt,
    mood,
    lighting,
    colorPalette
  };
}

export function AIScriptToSceneVisualizer() {
  const [script, setScript] = useState('');
  const [visualization, setVisualization] = useState<SceneVisualization | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<'veo' | 'pika' | 'instructions'>('instructions');

  const handleGenerate = () => {
    if (!script.trim()) {
      alert('Please enter a script line');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const viz = generateVisualization(script);
      setVisualization(viz);
      setIsGenerating(false);
    }, 800);
  };

  const handleCopy = (type: 'veo' | 'pika' | 'instructions' | 'description') => {
    if (!visualization) return;

    let text = '';
    switch (type) {
      case 'veo':
        text = visualization.veoPrompt;
        break;
      case 'pika':
        text = visualization.pikaPrompt;
        break;
      case 'description':
        text = visualization.sceneDescription;
        break;
      case 'instructions':
        text = `CAMERA INSTRUCTIONS:\nShot Type: ${visualization.cameraInstructions.shotType}\nCamera Angle: ${visualization.cameraInstructions.cameraAngle}\nCamera Movement: ${visualization.cameraInstructions.cameraMovement}\nFraming: ${visualization.cameraInstructions.framing}\nFocus: ${visualization.cameraInstructions.focus}\n\nMOOD & STYLE:\nMood: ${visualization.mood}\nLighting: ${visualization.lighting}\nColor Palette: ${visualization.colorPalette}`;
        break;
    }

    navigator.clipboard.writeText(text);
    alert(`${type === 'veo' ? 'Veo' : type === 'pika' ? 'Pika' : type === 'description' ? 'Scene description' : 'Camera instructions'} copied to clipboard!`);
  };

  const handleClear = () => {
    setScript('');
    setVisualization(null);
  };

  const handleLoadExample = () => {
    const examples = [
      'A mysterious figure walks through the foggy alley at night',
      'Two lovers embrace as the sun sets over the ocean',
      'The hero stands on the mountain peak, surveying the battlefield below',
      'A child looks up at the stars with wonder in their eyes'
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setScript(randomExample);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold mb-6 text-indigo-800 flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="#4F46E5" strokeWidth="2" fill="none"/>
        </svg>
        AI Script-to-Scene Visualizer
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Input Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-semibold text-indigo-700">
              Enter Script Line(s) <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleLoadExample}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-sm hover:bg-indigo-200 transition-colors"
              >
                Load Example
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="e.g., A mysterious figure walks through the foggy alley at night"
            rows={4}
            className="w-full p-4 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-y"
          />
          <p className="text-xs text-gray-600 mt-2">
            {script.length} characters | Enter 1-2 lines of script or scene description
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!script.trim() || isGenerating}
          className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all transform ${
            script.trim() && !isGenerating
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating Visualization...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              Generate Scene Visualization
            </span>
          )}
        </button>
      </div>

      {visualization && (
        <div className="space-y-6">
          {/* Output Type Selector */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedOutput('instructions')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                  selectedOutput === 'instructions'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📹 Camera Instructions
              </button>
              <button
                onClick={() => setSelectedOutput('veo')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                  selectedOutput === 'veo'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎥 Veo Prompt
              </button>
              <button
                onClick={() => setSelectedOutput('pika')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${
                  selectedOutput === 'pika'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎬 Pika Prompt
              </button>
            </div>
          </div>

          {/* Camera Instructions */}
          {selectedOutput === 'instructions' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-indigo-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-indigo-800">📹 Camera Instructions</h3>
                <button
                  onClick={() => handleCopy('instructions')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-800 mb-2">Shot Type</h4>
                  <p className="text-gray-800">{visualization.cameraInstructions.shotType}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Camera Angle</h4>
                  <p className="text-gray-800">{visualization.cameraInstructions.cameraAngle}</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-800 mb-2">Camera Movement</h4>
                  <p className="text-gray-800">{visualization.cameraInstructions.cameraMovement}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-rose-800 mb-2">Framing</h4>
                  <p className="text-gray-800">{visualization.cameraInstructions.framing}</p>
                </div>
              </div>

              <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">Focus</h4>
                <p className="text-gray-800">{visualization.cameraInstructions.focus}</p>
              </div>

              <div className="mt-4 grid md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Mood</h4>
                  <p className="text-gray-800">{visualization.mood}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Lighting</h4>
                  <p className="text-gray-800">{visualization.lighting}</p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-cyan-800 mb-2">Color Palette</h4>
                  <p className="text-gray-800">{visualization.colorPalette}</p>
                </div>
              </div>
            </div>
          )}

          {/* Veo Prompt */}
          {selectedOutput === 'veo' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                      VEO
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">Google Veo Prompt</h3>
                  </div>
                  <p className="text-sm text-gray-600">Optimized for Google's Veo video generation model</p>
                </div>
                <button
                  onClick={() => handleCopy('veo')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{visualization.veoPrompt}</pre>
              </div>
            </div>
          )}

          {/* Pika Prompt */}
          {selectedOutput === 'pika' && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                      PIKA
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">Pika Prompt</h3>
                  </div>
                  <p className="text-sm text-gray-600">Optimized for Pika video generation platform</p>
                </div>
                <button
                  onClick={() => handleCopy('pika')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">{visualization.pikaPrompt}</pre>
              </div>
            </div>
          )}

          {/* Scene Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-indigo-800">Scene Description</h3>
              <button
                onClick={() => handleCopy('description')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                Copy
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg">
              {visualization.sceneDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function AIScriptToSceneVisualizerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">What is a Script-to-Scene Visualizer?</h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          A <strong>Script-to-Scene Visualizer</strong> is a tool that converts simple script lines into detailed 
          cinematic camera instructions and video generation prompts. Enter 1-2 lines of script or scene description, 
          and the tool generates professional camera instructions (shot types, angles, movements) and optimized prompts 
          for AI video generation tools like Google Veo and Pika. Perfect for filmmakers, content creators, and video 
          producers who want to visualize their scripts quickly.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">How This Tool Works</h2>
        <p className="text-gray-700 text-lg mb-4">
          Our Script-to-Scene Visualizer analyzes your script and generates:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Camera Instructions:</strong> Shot type, camera angle, movement, framing, and focus</li>
          <li><strong>Mood & Style:</strong> Lighting, color palette, and overall mood</li>
          <li><strong>Veo Prompts:</strong> Optimized prompts for Google's Veo video generation model</li>
          <li><strong>Pika Prompts:</strong> Optimized prompts for Pika video generation platform</li>
          <li><strong>Scene Description:</strong> Detailed cinematic description of the scene</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Supported Video Platforms</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎥</span>
              Google Veo
            </h3>
            <p className="text-gray-700 mb-3">Google's advanced video generation model</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• High-quality video generation</li>
              <li>• Detailed prompt support</li>
              <li>• Cinematic quality output</li>
            </ul>
          </div>

          <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              Pika
            </h3>
            <p className="text-gray-700 mb-3">Popular AI video generation platform</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• User-friendly interface</li>
              <li>• Fast generation times</li>
              <li>• Creative video styles</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Camera Shot Types</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {shotTypes.map(shot => (
            <div key={shot} className="bg-white p-3 rounded-lg border border-indigo-200 text-sm text-gray-700">
              • {shot}
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Why Use This Tool?</h2>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-l-4 border-indigo-500">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Save Time:</strong> Instantly generate camera instructions from simple script lines</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Professional Quality:</strong> Get cinematic camera instructions automatically</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>AI Video Ready:</strong> Generate prompts optimized for Veo and Pika</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Learn Filmmaking:</strong> Understand camera techniques and shot composition</span>
            </li>
            <li className="flex items-start gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500 mt-0.5 flex-shrink-0">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span><strong>Shareable Content:</strong> Perfect for social media and content creation</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-800">Tips for Best Results</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg space-y-2">
          <li><strong>Be descriptive:</strong> Include visual details (lighting, time of day, setting)</li>
          <li><strong>Mention emotions:</strong> Include mood words (mysterious, romantic, tense)</li>
          <li><strong>Specify actions:</strong> Mention character movements or actions</li>
          <li><strong>Use examples:</strong> Try the example button to see different styles</li>
          <li><strong>Experiment:</strong> Try different script lines to see varied camera instructions</li>
          <li><strong>Customize prompts:</strong> Use generated prompts as starting points and refine</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">Perfect For</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-indigo-200">
            <h3 className="font-bold text-indigo-800 mb-3">✅ Filmmakers</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Pre-visualization of scenes</li>
              <li>• Camera shot planning</li>
              <li>• Storyboard generation</li>
              <li>• Production planning</li>
            </ul>
          </div>
          <div className="bg-white p-5 rounded-lg border-2 border-purple-200">
            <h3 className="font-bold text-purple-800 mb-3">✅ Content Creators</h3>
            <ul className="text-gray-700 space-y-2 text-sm">
              <li>• Social media video prompts</li>
              <li>• YouTube video planning</li>
              <li>• AI video generation</li>
              <li>• Creative video concepts</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-10 bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-indigo-800">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-700 text-lg space-y-3">
          <li><strong>Enter your script</strong> (1-2 lines describing the scene)</li>
          <li><strong>Click "Generate Visualization"</strong> to create camera instructions</li>
          <li><strong>View camera instructions</strong> (shot type, angle, movement, etc.)</li>
          <li><strong>Switch to Veo or Pika prompts</strong> for AI video generation</li>
          <li><strong>Copy the prompt</strong> and use in your video generation tool</li>
          <li><strong>Generate your video</strong> using Veo, Pika, or other AI video tools</li>
        </ol>
        <p className="mt-4 text-gray-700 text-lg">
          <strong>Pro Tip:</strong> Use descriptive script lines with mood, lighting, and action details for the best camera instructions and video prompts!
        </p>
      </section>
    </>
  );
}

export default AIScriptToSceneVisualizer;

