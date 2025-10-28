"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 to-indigo-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-indigo-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-blue-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-purple-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-sm">
                <div className="bg-purple-700/80 text-white p-2 rounded">File 1<br/>rwxr-xr-x<br/>755</div>
                <div className="bg-indigo-700/80 text-white p-2 rounded">File 2<br/>rw-r--r--<br/>644</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Compare permissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ComparePermissionsTool() {
  const [file1Permissions, setFile1Permissions] = useState({
    numeric: '755',
    symbolic: 'rwxr-xr-x',
    filename: 'file1.txt'
  });
  
  const [file2Permissions, setFile2Permissions] = useState({
    numeric: '644',
    symbolic: 'rw-r--r--',
    filename: 'file2.txt'
  });

  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // Convert numeric to symbolic
  const numericToSymbolic = (numeric: string): string => {
    if (!/^[0-7]{3}$/.test(numeric)) return '---';
    const permissions = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    return numeric.split('').map(digit => permissions[parseInt(digit)]).join('');
  };

  // Convert symbolic to numeric
  const symbolicToNumeric = (symbolic: string): string => {
    if (!/^[rwx-]{9}$/.test(symbolic)) return '000';
    const user = symbolic.substring(0, 3);
    const group = symbolic.substring(3, 6);
    const others = symbolic.substring(6, 9);
    
    const userNum = symbolicToNumber(user);
    const groupNum = symbolicToNumber(group);
    const othersNum = symbolicToNumber(others);
    
    return userNum + groupNum + othersNum;
  };

  const symbolicToNumber = (symbolic: string): string => {
    let value = 0;
    if (symbolic[0] === 'r') value += 4;
    if (symbolic[1] === 'w') value += 2;
    if (symbolic[2] === 'x') value += 1;
    return value.toString();
  };

  // Update permissions when input changes
  const updateFile1Permissions = (type: 'numeric' | 'symbolic', value: string) => {
    if (type === 'numeric') {
      const symbolic = numericToSymbolic(value);
      setFile1Permissions(prev => ({ ...prev, numeric: value, symbolic }));
    } else {
      const numeric = symbolicToNumeric(value);
      setFile1Permissions(prev => ({ ...prev, symbolic: value, numeric }));
    }
  };

  const updateFile2Permissions = (type: 'numeric' | 'symbolic', value: string) => {
    if (type === 'numeric') {
      const symbolic = numericToSymbolic(value);
      setFile2Permissions(prev => ({ ...prev, numeric: value, symbolic }));
    } else {
      const numeric = symbolicToNumeric(value);
      setFile2Permissions(prev => ({ ...prev, symbolic: value, numeric }));
    }
  };

  // Compare permissions
  const comparePermissions = () => {
    const file1 = file1Permissions.numeric;
    const file2 = file2Permissions.numeric;
    
    const user1 = parseInt(file1[0]);
    const group1 = parseInt(file1[1]);
    const others1 = parseInt(file1[2]);
    
    const user2 = parseInt(file2[0]);
    const group2 = parseInt(file2[1]);
    const others2 = parseInt(file2[2]);
    
    const comparison = {
      user: {
        file1: user1,
        file2: user2,
        difference: user1 - user2,
        stronger: user1 > user2 ? 'File 1' : user2 > user1 ? 'File 2' : 'Equal'
      },
      group: {
        file1: group1,
        file2: group2,
        difference: group1 - group2,
        stronger: group1 > group2 ? 'File 1' : group2 > group1 ? 'File 2' : 'Equal'
      },
      others: {
        file1: others1,
        file2: others2,
        difference: others1 - others2,
        stronger: others1 > others2 ? 'File 1' : others2 > others1 ? 'File 2' : 'Equal'
      },
      overall: {
        file1: user1 + group1 + others1,
        file2: user2 + group2 + others2,
        difference: (user1 + group1 + others1) - (user2 + group2 + others2),
        stronger: (user1 + group1 + others1) > (user2 + group2 + others2) ? 'File 1' : (user2 + group2 + others2) > (user1 + group1 + others1) ? 'File 2' : 'Equal'
      }
    };
    
    setComparisonResult(comparison);
  };

  // Get permission description
  const getPermissionDescription = (numeric: string): string => {
    const user = parseInt(numeric[0]);
    const group = parseInt(numeric[1]);
    const others = parseInt(numeric[2]);
    
    if (user === 7 && group === 7 && others === 7) return 'Full access for everyone (777)';
    if (user === 7 && group === 5 && others === 5) return 'Owner full access, others read/execute (755)';
    if (user === 6 && group === 4 && others === 4) return 'Owner read/write, others read only (644)';
    if (user === 6 && group === 0 && others === 0) return 'Owner read/write only (600)';
    if (user === 4 && group === 0 && others === 0) return 'Owner read only (400)';
    
    return 'Custom permissions';
  };

  // Get security level
  const getSecurityLevel = (numeric: string): { level: string; color: string; description: string } => {
    const user = parseInt(numeric[0]);
    const group = parseInt(numeric[1]);
    const others = parseInt(numeric[2]);
    
    if (others >= 6) return { level: 'Very Low', color: 'text-red-600', description: 'Others have write access - security risk!' };
    if (others >= 4) return { level: 'Low', color: 'text-orange-600', description: 'Others have read access - potential information disclosure' };
    if (group >= 6) return { level: 'Medium', color: 'text-yellow-600', description: 'Group has write access - moderate security' };
    if (user === 7 && group <= 4 && others <= 4) return { level: 'High', color: 'text-green-600', description: 'Good security - owner has full access, others limited' };
    if (user <= 4) return { level: 'Very High', color: 'text-blue-600', description: 'Very restrictive - even owner has limited access' };
    
    return { level: 'Medium', color: 'text-gray-600', description: 'Moderate security level' };
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-purple-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#7c3aed" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Permission Comparison Tool
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* File 1 Permissions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">📁</span>
            File 1: {file1Permissions.filename}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filename
              </label>
              <input 
                type="text" 
                value={file1Permissions.filename}
                onChange={(e) => setFile1Permissions(prev => ({ ...prev, filename: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="file1.txt"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numeric Permissions
              </label>
              <input 
                type="text" 
                value={file1Permissions.numeric}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-7]/g, '').substring(0, 3);
                  updateFile1Permissions('numeric', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg"
                placeholder="755"
                maxLength={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbolic Permissions
              </label>
              <input 
                type="text" 
                value={file1Permissions.symbolic}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^rwx-]/gi, '').substring(0, 9);
                  updateFile1Permissions('symbolic', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-center text-lg"
                placeholder="rwxr-xr-x"
                maxLength={9}
              />
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-700">
                <strong>Description:</strong> {getPermissionDescription(file1Permissions.numeric)}
              </div>
              <div className={`text-sm mt-1 ${getSecurityLevel(file1Permissions.numeric).color}`}>
                <strong>Security Level:</strong> {getSecurityLevel(file1Permissions.numeric).level}
              </div>
            </div>
          </div>
        </div>

        {/* File 2 Permissions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
            <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">📄</span>
            File 2: {file2Permissions.filename}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filename
              </label>
              <input 
                type="text" 
                value={file2Permissions.filename}
                onChange={(e) => setFile2Permissions(prev => ({ ...prev, filename: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="file2.txt"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numeric Permissions
              </label>
              <input 
                type="text" 
                value={file2Permissions.numeric}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-7]/g, '').substring(0, 3);
                  updateFile2Permissions('numeric', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-center text-lg"
                placeholder="644"
                maxLength={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbolic Permissions
              </label>
              <input 
                type="text" 
                value={file2Permissions.symbolic}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^rwx-]/gi, '').substring(0, 9);
                  updateFile2Permissions('symbolic', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-center text-lg"
                placeholder="rw-r--r--"
                maxLength={9}
              />
            </div>
            
            <div className="bg-indigo-50 p-3 rounded-lg">
              <div className="text-sm text-indigo-700">
                <strong>Description:</strong> {getPermissionDescription(file2Permissions.numeric)}
              </div>
              <div className={`text-sm mt-1 ${getSecurityLevel(file2Permissions.numeric).color}`}>
                <strong>Security Level:</strong> {getSecurityLevel(file2Permissions.numeric).level}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="text-center mb-8">
        <button 
          onClick={comparePermissions}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          🔍 Compare Permissions
        </button>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-purple-800 mb-6 flex items-center">
            <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">📊</span>
            Comparison Results
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* User Permissions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">User (Owner)</h4>
              <div className="text-center">
                <div className="text-2xl font-mono text-blue-600 mb-1">
                  {comparisonResult.user.file1} vs {comparisonResult.user.file2}
                </div>
                <div className={`text-sm ${comparisonResult.user.difference > 0 ? 'text-green-600' : comparisonResult.user.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {comparisonResult.user.difference > 0 ? '+' : ''}{comparisonResult.user.difference}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {comparisonResult.user.stronger}
                </div>
              </div>
            </div>
            
            {/* Group Permissions */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Group</h4>
              <div className="text-center">
                <div className="text-2xl font-mono text-green-600 mb-1">
                  {comparisonResult.group.file1} vs {comparisonResult.group.file2}
                </div>
                <div className={`text-sm ${comparisonResult.group.difference > 0 ? 'text-green-600' : comparisonResult.group.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {comparisonResult.group.difference > 0 ? '+' : ''}{comparisonResult.group.difference}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {comparisonResult.group.stronger}
                </div>
              </div>
            </div>
            
            {/* Others Permissions */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Others</h4>
              <div className="text-center">
                <div className="text-2xl font-mono text-red-600 mb-1">
                  {comparisonResult.others.file1} vs {comparisonResult.others.file2}
                </div>
                <div className={`text-sm ${comparisonResult.others.difference > 0 ? 'text-green-600' : comparisonResult.others.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {comparisonResult.others.difference > 0 ? '+' : ''}{comparisonResult.others.difference}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {comparisonResult.others.stronger}
                </div>
              </div>
            </div>
            
            {/* Overall */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Overall</h4>
              <div className="text-center">
                <div className="text-2xl font-mono text-purple-600 mb-1">
                  {comparisonResult.overall.file1} vs {comparisonResult.overall.file2}
                </div>
                <div className={`text-sm ${comparisonResult.overall.difference > 0 ? 'text-green-600' : comparisonResult.overall.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {comparisonResult.overall.difference > 0 ? '+' : ''}{comparisonResult.overall.difference}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {comparisonResult.overall.stronger}
                </div>
              </div>
            </div>
          </div>
          
          {/* Security Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Security Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-purple-700 mb-2">{file1Permissions.filename}</h5>
                <div className={`text-sm ${getSecurityLevel(file1Permissions.numeric).color}`}>
                  <strong>Level:</strong> {getSecurityLevel(file1Permissions.numeric).level}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {getSecurityLevel(file1Permissions.numeric).description}
                </div>
              </div>
              <div>
                <h5 className="font-medium text-indigo-700 mb-2">{file2Permissions.filename}</h5>
                <div className={`text-sm ${getSecurityLevel(file2Permissions.numeric).color}`}>
                  <strong>Level:</strong> {getSecurityLevel(file2Permissions.numeric).level}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {getSecurityLevel(file2Permissions.numeric).description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
          <span className="bg-yellow-100 text-yellow-800 p-2 rounded-lg mr-3">⚡</span>
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => {
              setFile1Permissions({ numeric: '755', symbolic: 'rwxr-xr-x', filename: 'directory' });
              setFile2Permissions({ numeric: '644', symbolic: 'rw-r--r--', filename: 'file' });
            }}
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-blue-800">Directory vs File</div>
            <div className="text-sm text-blue-600">Compare 755 (dir) vs 644 (file)</div>
          </button>
          
          <button 
            onClick={() => {
              setFile1Permissions({ numeric: '600', symbolic: 'rw-------', filename: 'private' });
              setFile2Permissions({ numeric: '644', symbolic: 'rw-r--r--', filename: 'public' });
            }}
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-green-800">Private vs Public</div>
            <div className="text-sm text-green-600">Compare 600 (private) vs 644 (public)</div>
          </button>
          
          <button 
            onClick={() => {
              setFile1Permissions({ numeric: '750', symbolic: 'rwxr-x---', filename: 'script' });
              setFile2Permissions({ numeric: '755', symbolic: 'rwxr-xr-x', filename: 'directory' });
            }}
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-purple-800">Script vs Directory</div>
            <div className="text-sm text-purple-600">Compare 750 (script) vs 755 (dir)</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function ComparePermissionsInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Why Compare File Permissions?</h2>
        <p className="text-gray-700 text-lg">
          Comparing file permissions helps you understand security differences, identify potential vulnerabilities, 
          and ensure consistent access control across your system. This tool makes it easy to spot permission 
          discrepancies and understand their security implications.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Understanding Permission Differences</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><b>Positive difference</b>: File 1 has more permissions (potentially less secure)</li>
            <li><b>Negative difference</b>: File 2 has more permissions (potentially less secure)</li>
            <li><b>Zero difference</b>: Both files have identical permissions</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Security Levels Explained</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Very Low Security</h3>
            <p className="text-red-700">Files with 777, 666, or similar permissions that give excessive access to others</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Low Security</h3>
            <p className="text-orange-700">Files readable by others (644, 640) - potential information disclosure</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Medium Security</h3>
            <p className="text-yellow-700">Group-writable files (750, 770) - moderate security risk</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">High Security</h3>
            <p className="text-green-700">Owner-only access (600, 700) - good security practices</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Common Permission Patterns</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-center border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-purple-100">
              <tr>
                <th className="p-3">Permission</th>
                <th className="p-3">Use Case</th>
                <th className="p-3">Security Level</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="p-3 font-mono">777</td>
                <td className="p-3">Temporary files</td>
                <td className="p-3 text-red-600">Very Low</td>
                <td className="p-3">Everyone can read, write, execute</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-mono">755</td>
                <td className="p-3">Directories</td>
                <td className="p-3 text-green-600">High</td>
                <td className="p-3">Owner full access, others read/execute</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 font-mono">644</td>
                <td className="p-3">Regular files</td>
                <td className="p-3 text-orange-600">Low</td>
                <td className="p-3">Owner read/write, others read only</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 font-mono">600</td>
                <td className="p-3">Private files</td>
                <td className="p-3 text-green-600">High</td>
                <td className="p-3">Owner read/write only</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 font-mono">750</td>
                <td className="p-3">Scripts</td>
                <td className="p-3 text-yellow-600">Medium</td>
                <td className="p-3">Owner full access, group read/execute</td>
              </tr>
            </tbody>
          </table>
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
      <h2 className="text-2xl font-bold mb-6 text-purple-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a 
            key={tool.id} 
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
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
                  <span className="text-purple-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-purple-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-purple-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
