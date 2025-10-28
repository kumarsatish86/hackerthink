"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-indigo-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-indigo-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-purple-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative w-full h-64">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-sm">
                <div className="bg-blue-700/80 text-white p-1 rounded">rwx</div>
                <div className="bg-blue-700/60 text-white p-1 rounded">r-x</div>
                <div className="bg-blue-700/40 text-white p-1 rounded">r-x</div>
                <div className="text-white mt-2">7</div>
                <div className="text-white mt-2">5</div>
                <div className="text-white mt-2">5</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">chmod 755 file.sh</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickReferenceSection() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 shadow-md mb-10">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Quick Reference</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Common Permission Patterns</h3>
          <div className="bg-white rounded-lg shadow p-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">chmod 755</div>
                <span>Standard permission for executable scripts</span>
              </li>
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">chmod 644</div>
                <span>Standard permission for regular files</span>
              </li>
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">chmod 777</div>
                <span>Full access to everyone (use cautiously!)</span>
              </li>
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">chmod 700</div>
                <span>Private file - owner only access</span>
              </li>
            </ul>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Chmod Command Options</h3>
          <div className="bg-white rounded-lg shadow p-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">-R</div>
                <span>Recursively change permissions</span>
              </li>
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">u+x</div>
                <span>Add execute permission for user</span>
              </li>
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">go-w</div>
                <span>Remove write permission for group and others</span>
              </li>
              <li className="flex items-start">
                <div className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">a+r</div>
                <span>Add read permission for all</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl overflow-hidden shadow-lg mb-10">
      <div className="px-6 py-10 md:py-12 md:flex items-center justify-between relative">
        <div className="md:w-7/12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Stay Updated with Linux Tips</h2>
          <p className="text-indigo-100 mb-6 md:pr-8">Get weekly tutorials, command references, and new tool announcements delivered straight to your inbox.</p>
        </div>
        <div className="md:w-5/12 relative z-10">
          <form className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="w-full p-3 mb-2 rounded border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="button"
              className="w-full bg-indigo-800 hover:bg-indigo-900 text-white font-medium py-3 px-4 rounded transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="white">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export function ChmodCalculator() {
  const [permissions, setPermissions] = useState([
    { r: false, w: false, x: false }, // Owner
    { r: false, w: false, x: false }, // Group
    { r: false, w: false, x: false }, // Others
  ]);

  const handleChange = (idx: number, perm: 'r' | 'w' | 'x') => {
    setPermissions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [perm]: !updated[idx][perm] };
      return updated;
    });
  };

  const getNumeric = () =>
    permissions
      .map((p) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0))
      .join('');

  const getSymbolic = () =>
    permissions
      .map((p) => `${p.r ? 'r' : '-'}${p.w ? 'w' : '-'}${p.x ? 'x' : '-'}`)
      .join('');

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        File Permissions Calculator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {['Owner', 'Group', 'Others'].map((label, idx) => (
          <div key={label} className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2 text-blue-700">{label}</h3>
            <div className="flex flex-col gap-2">
              {(['r', 'w', 'x'] as const).map((perm) => (
                <label key={perm} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-blue-600 mr-2"
                    checked={permissions[idx][perm]}
                    onChange={() => handleChange(idx, perm)}
                  />
                  <span className="capitalize">{perm === 'r' ? 'Read' : perm === 'w' ? 'Write' : 'Execute'}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="results bg-blue-50 p-6 rounded-lg flex flex-col md:flex-row gap-8 items-center justify-between">
        <div>
          <h3 className="font-medium mb-1 text-blue-700">Numeric Notation</h3>
          <div className="text-3xl font-mono text-blue-900" data-testid="numeric-value">{getNumeric()}</div>
        </div>
        <div>
          <h3 className="font-medium mb-1 text-blue-700">Symbolic Notation</h3>
          <div className="text-3xl font-mono text-blue-900" data-testid="symbolic-value">{getSymbolic()}</div>
        </div>
        <div>
          <h3 className="font-medium mb-1 text-blue-700">Command</h3>
          <div className="bg-blue-800 text-white p-2 rounded font-mono text-lg" data-testid="chmod-command">
            chmod {getNumeric()} filename
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChmodInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">What is <code>chmod</code>?</h2>
        <p className="text-gray-700 text-lg">
          <code>chmod</code> (change mode) is a command-line utility in Unix and Linux systems used to change the access permissions of files and directories. Permissions control who can read, write, or execute a file.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Understanding File Permissions</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li><b>Owner</b>: The user who owns the file.</li>
          <li><b>Group</b>: Other users in the file's group.</li>
          <li><b>Others</b>: All other users.</li>
        </ul>
        <div className="mt-4">
          <table className="w-full text-center border border-blue-200 rounded-lg overflow-hidden">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2">Permission</th>
                <th className="p-2">Symbol</th>
                <th className="p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-2">Read</td><td className="p-2">r</td><td className="p-2">4</td></tr>
              <tr className="bg-blue-50"><td className="p-2">Write</td><td className="p-2">w</td><td className="p-2">2</td></tr>
              <tr><td className="p-2">Execute</td><td className="p-2">x</td><td className="p-2">1</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Examples</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li><code>chmod 755 file.sh</code> — Owner can read/write/execute, group and others can read/execute.</li>
          <li><code>chmod 644 file.txt</code> — Owner can read/write, group and others can read only.</li>
          <li><code>chmod 700 script.sh</code> — Only owner can read/write/execute.</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Never give write permissions to others unless necessary.</li>
          <li>Use <code>chmod -R</code> to change permissions recursively for directories.</li>
          <li>Be cautious with <code>777</code> — it gives full access to everyone.</li>
        </ul>
      </section>
    </>
  );
}

export function RelatedToolsSection({ tools }: { tools: any[] }) {
  if (!tools || tools.length === 0) return null;
  
  // Limit to exactly 6 tools
  const displayTools = tools.slice(0, 6);
  
  // Helper function to get SVG path for icons
  const getIconPath = (iconName: string): string => {
    return `/images/icons/${iconName?.toLowerCase() || 'wrench'}.svg`;
  };
  
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a 
            key={tool.id} 
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img 
                    src={getIconPath(tool.icon)} 
                    alt={tool.title}
                    className="w-5 h-5"
                    onError={(e) => {
                      // If icon fails to load, fallback to a default emoji
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '🔧';
                    }}
                  />
                ) : (
                  <span className="text-blue-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-blue-600 text-sm font-medium">
              Try this tool →
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 