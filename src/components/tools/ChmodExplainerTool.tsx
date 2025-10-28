"use client";
import React, { useState } from 'react';

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
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-sm">
                <div className="bg-green-700/80 text-white p-1 rounded">rwx</div>
                <div className="bg-green-700/60 text-white p-1 rounded">r-x</div>
                <div className="bg-green-700/40 text-white p-1 rounded">r-x</div>
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

export function ChmodExplainerTool() {
  const [numericInput, setNumericInput] = useState('755');
  const [symbolicInput, setSymbolicInput] = useState('rwxr-xr-x');
  const [numericResult, setNumericResult] = useState<string>('');
  const [symbolicResult, setSymbolicResult] = useState<string>('');
  const [showNumericResult, setShowNumericResult] = useState(false);
  const [showSymbolicResult, setShowSymbolicResult] = useState(false);

  // Convert numeric to symbolic
  const convertNumericToSymbolic = () => {
    if (!/^[0-7]{3}$/.test(numericInput)) {
      alert('Please enter a valid 3-digit octal number (0-7 for each digit)');
      return;
    }

    const user = parseInt(numericInput[0]);
    const group = parseInt(numericInput[1]);
    const others = parseInt(numericInput[2]);

    const userSymbolic = numberToSymbolic(user);
    const groupSymbolic = numberToSymbolic(group);
    const othersSymbolic = numberToSymbolic(others);

    const symbolic = userSymbolic + groupSymbolic + othersSymbolic;
    setSymbolicResult(symbolic);
    setShowSymbolicResult(true);
  };

  // Convert symbolic to numeric
  const convertSymbolicToNumeric = () => {
    if (!/^[rwx-]{9}$/.test(symbolicInput)) {
      alert('Please enter a valid 9-character symbolic permission (e.g., rwxr-xr-x)');
      return;
    }

    const user = symbolicInput.substring(0, 3);
    const group = symbolicInput.substring(3, 6);
    const others = symbolicInput.substring(6, 9);

    const userNumeric = symbolicToNumber(user);
    const groupNumeric = symbolicToNumber(group);
    const othersNumeric = symbolicToNumber(others);

    const numeric = userNumeric + groupNumeric + othersNumeric;
    setNumericResult(numeric);
    setShowNumericResult(true);
  };

  // Convert single digit to symbolic
  const numberToSymbolic = (num: number): string => {
    const permissions = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    return permissions[num];
  };

  // Convert symbolic to single digit
  const symbolicToNumber = (symbolic: string): string => {
    let value = 0;
    if (symbolic[0] === 'r') value += 4;
    if (symbolic[1] === 'w') value += 2;
    if (symbolic[2] === 'x') value += 1;
    return value.toString();
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#059669" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Chmod Permission Converter
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Numeric to Symbolic Converter */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">🔢</span>
            Numeric to Symbolic
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="numericInput" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Numeric Permission (e.g., 755, 644, 777)
              </label>
              <input 
                type="text" 
                id="numericInput" 
                value={numericInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-7]/g, '').substring(0, 3);
                  setNumericInput(value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                placeholder="755"
                maxLength={3}
              />
            </div>
            
            <button 
              onClick={convertNumericToSymbolic}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Convert to Symbolic
            </button>
            
            {showSymbolicResult && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Result:</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-mono text-center text-green-800 mb-3">{symbolicResult}</div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                    <div>
                      <div className="font-semibold text-blue-600">User ({numericInput[0]})</div>
                      <div className="font-mono">{symbolicResult.substring(0, 3)}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">Group ({numericInput[1]})</div>
                      <div className="font-mono">{symbolicResult.substring(3, 6)}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-red-600">Others ({numericInput[2]})</div>
                      <div className="font-mono">{symbolicResult.substring(6, 9)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Symbolic to Numeric Converter */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">🔤</span>
            Symbolic to Numeric
          </h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="symbolicInput" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Symbolic Permission (e.g., rwxr-xr-x, rw-r--r--)
              </label>
              <input 
                type="text" 
                id="symbolicInput" 
                value={symbolicInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^rwx-]/gi, '').substring(0, 9);
                  setSymbolicInput(value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-mono"
                placeholder="rwxr-xr-x"
                maxLength={9}
              />
            </div>
            
            <button 
              onClick={convertSymbolicToNumeric}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Convert to Numeric
            </button>
            
            {showSymbolicResult && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Result:</h4>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-2xl font-mono text-center text-green-800 mb-3">{numericResult}</div>
                  <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
                    <div>
                      <div className="font-semibold text-blue-600">User</div>
                      <div className="font-mono">{numericResult[0]} ({symbolicInput.substring(0, 3)})</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">Group</div>
                      <div className="font-mono">{numericResult[1]} ({symbolicInput.substring(3, 6)})</div>
                    </div>
                    <div>
                      <div className="font-semibold text-red-600">Others</div>
                      <div className="font-mono">{numericResult[2]} ({symbolicInput.substring(6, 9)})</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Explanation */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">📚</span>
          Understanding Chmod Permissions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">User (Owner)</h4>
              <div className="text-2xl font-mono text-blue-600 mb-2">rwx</div>
              <p className="text-sm text-gray-600">File owner's permissions</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Group</h4>
              <div className="text-2xl font-mono text-green-600 mb-2">r-x</div>
              <p className="text-sm text-gray-600">Group members' permissions</p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Others</h4>
              <div className="text-2xl font-mono text-red-600 mb-2">r-x</div>
              <p className="text-sm text-gray-600">Everyone else's permissions</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Permission Characters:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">r</span> = Read permission</li>
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">w</span> = Write permission</li>
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">x</span> = Execute permission</li>
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">-</span> = No permission</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Numeric Values:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">4</span> = Read (r)</li>
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">2</span> = Write (w)</li>
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">1</span> = Execute (x)</li>
              <li><span className="font-mono bg-gray-100 px-2 py-1 rounded">0</span> = No permission (-)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Common Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <span className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mr-3">💡</span>
          Common Permission Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-mono text-blue-600 mb-2">755</div>
              <div className="text-lg font-mono text-gray-700 mb-2">rwxr-xr-x</div>
              <p className="text-sm text-gray-600">Directory permissions (common for web folders)</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-mono text-blue-600 mb-2">644</div>
              <div className="text-lg font-mono text-gray-700 mb-2">rw-r--r--</div>
              <p className="text-sm text-gray-600">File permissions (readable by all, writable by owner)</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-mono text-blue-600 mb-2">777</div>
              <div className="text-lg font-mono text-gray-700 mb-2">rwxrwxrwx</div>
              <p className="text-sm text-gray-600">Full permissions (use with caution!)</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-mono text-blue-600 mb-2">600</div>
              <div className="text-lg font-mono text-gray-700 mb-2">rw-------</div>
              <p className="text-sm text-gray-600">Owner only (common for private files)</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-mono text-blue-600 mb-2">750</div>
              <div className="text-lg font-mono text-gray-700 mb-2">rwxr-x---</div>
              <p className="text-sm text-gray-600">Owner and group (common for scripts)</p>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="text-center">
              <div className="text-2xl font-mono text-blue-600 mb-2">400</div>
              <div className="text-lg font-mono text-gray-700 mb-2">r--------</div>
              <p className="text-sm text-gray-600">Read-only (common for config files)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <span className="bg-red-100 text-red-800 p-2 rounded-lg mr-3">⚠️</span>
          Security Best Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-red-800 mb-3">❌ Avoid These:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Using 777 permissions (too permissive)</li>
              <li>• Giving write access to others (666)</li>
              <li>• Making sensitive files world-readable</li>
              <li>• Using 000 permissions (can cause issues)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-800 mb-3">✅ Recommended:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 755 for directories (rwxr-xr-x)</li>
              <li>• 644 for regular files (rw-r--r--)</li>
              <li>• 600 for private files (rw-------)</li>
              <li>• 750 for group-shared content (rwxr-x---)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChmodExplainerInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">What is <code>chmod</code>?</h2>
        <p className="text-gray-700 text-lg">
          <code>chmod</code> (change mode) is a command-line utility in Unix and Linux systems used to change the access permissions of files and directories. Permissions control who can read, write, or execute a file.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Understanding File Permissions</h2>
        <p className="text-gray-700 text-lg mb-4">
          File permissions in Linux are represented in two ways:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg mb-4">
          <li><b>Symbolic notation</b>: Uses letters like rwxr-xr-x</li>
          <li><b>Numeric notation</b>: Uses octal numbers like 755</li>
        </ul>
        <p className="text-gray-700 text-lg">
          Both notations represent the same permissions for three categories: Owner, Group, and Others.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Permission Categories</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><b>Owner</b>: The user who owns the file has full control over permissions</li>
            <li><b>Group</b>: Users in the same group as the file</li>
            <li><b>Others</b>: All other users on the system</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Common Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Directories</h3>
            <p className="text-blue-700">Use 755 (rwxr-xr-x) for directories that need to be accessible by others</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Scripts</h3>
            <p className="text-green-700">Use 755 (rwxr-xr-x) for executable scripts</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Config Files</h3>
            <p className="text-yellow-700">Use 644 (rw-r--r--) for configuration files</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Private Files</h3>
            <p className="text-red-700">Use 600 (rw-------) for sensitive files</p>
          </div>
        </div>
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
      <h2 className="text-2xl font-bold mb-6 text-green-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a 
            key={tool.id} 
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
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
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-green-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
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
