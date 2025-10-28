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
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-sm">
                <div className="bg-green-700/80 text-white p-2 rounded">File<br/>rw-r--r--<br/>644</div>
                <div className="bg-emerald-700/80 text-white p-2 rounded">User<br/>john<br/>dev</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Analyze permissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckUserAccessToFileTool() {
  const [accessData, setAccessData] = useState({
    username: 'john',
    filename: '/home/john/documents/report.txt',
    filePermissions: '644',
    fileOwner: 'john',
    fileGroup: 'dev',
    userGroups: ['dev', 'users'],
    effectivePermissions: {
      read: true,
      write: true,
      execute: false
    }
  });

  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPermissions, setCustomPermissions] = useState('644');
  const [customOwner, setCustomOwner] = useState('john');
  const [customGroup, setCustomGroup] = useState('dev');

  const analyzeAccess = () => {
    const permissions = customPermissions || accessData.filePermissions;
    const owner = customOwner || accessData.fileOwner;
    const group = customGroup || accessData.fileGroup;
    
    // Parse permissions
    const numericPerms = parseInt(permissions, 8);
    const ownerPerms = (numericPerms >> 6) & 7;
    const groupPerms = (numericPerms >> 3) & 7;
    const otherPerms = numericPerms & 7;
    
    // Check if user is owner
    const isOwner = accessData.username === owner;
    const isInGroup = accessData.userGroups.includes(group);
    
    // Determine effective permissions
    let effectivePerms;
    if (isOwner) {
      effectivePerms = ownerPerms;
    } else if (isInGroup) {
      effectivePerms = groupPerms;
    } else {
      effectivePerms = otherPerms;
    }
    
    const canRead = (effectivePerms & 4) !== 0;
    const canWrite = (effectivePerms & 2) !== 0;
    const canExecute = (effectivePerms & 1) !== 0;
    
    // Check special permissions
    const hasStickyBit = (numericPerms & 0o1000) !== 0;
    const hasSetGID = (numericPerms & 0o2000) !== 0;
    const hasSetUID = (numericPerms & 0o4000) !== 0;
    
    // Security analysis
    const securityIssues: string[] = [];
    if (hasSetUID && !canExecute) securityIssues.push('SetUID bit set on non-executable file');
    if (hasSetGID && !canExecute) securityIssues.push('SetGID bit set on non-executable file');
    if (canWrite && hasSetUID) securityIssues.push('Writable SetUID file - security risk');
    if (canWrite && hasSetGID) securityIssues.push('Writable SetUID file - security risk');
    if (otherPerms & 2) securityIssues.push('Others have write permission');
    if (otherPerms & 4) securityIssues.push('Others have read permission');
    
    const result = {
      permissions: {
        numeric: permissions,
        symbolic: permissionsToSymbolic(permissions),
        owner: ownerPerms,
        group: groupPerms,
        other: otherPerms
      },
      access: {
        isOwner,
        isInGroup,
        effectivePermissions: effectivePerms,
        canRead,
        canWrite,
        canExecute
      },
      special: {
        stickyBit: hasStickyBit,
        setGID: hasSetGID,
        setUID: hasSetUID
      },
      security: {
        issues: securityIssues,
        riskLevel: securityIssues.length > 0 ? 'Medium' : 'Low'
      },
      commands: generateCommands(accessData.username, accessData.filename, permissions, owner, group)
    };
    
    setAnalysisResult(result);
  };

  const permissionsToSymbolic = (perms: string) => {
    const numeric = parseInt(perms, 8);
    const owner = (numeric >> 6) & 7;
    const group = (numeric >> 3) & 7;
    const other = numeric & 7;
    
    const toSymbolic = (p: number) => {
      let result = '';
      result += (p & 4) ? 'r' : '-';
      result += (p & 2) ? 'w' : '-';
      result += (p & 1) ? 'x' : '-';
      return result;
    };
    
    return `${toSymbolic(owner)}${toSymbolic(group)}${toSymbolic(other)}`;
  };

  const generateCommands = (username: string, filename: string, permissions: string, owner: string, group: string) => {
    const commands: string[] = [];
    
    // Check current permissions
    commands.push(`# Check file permissions and ownership`);
    commands.push(`ls -la "${filename}"`);
    commands.push(`stat "${filename}"`);
    commands.push('');
    
    // Check user's access
    commands.push(`# Check if user can access the file`);
    commands.push(`sudo -u ${username} test -r "${filename}" && echo "User ${username} can READ ${filename}" || echo "User ${username} cannot READ ${filename}"`);
    commands.push(`sudo -u ${username} test -w "${filename}" && echo "User ${username} can WRITE ${filename}" || echo "User ${username} cannot WRITE ${filename}"`);
    commands.push(`sudo -u ${username} test -x "${filename}" && echo "User ${username} can EXECUTE ${filename}" || echo "User ${username} cannot EXECUTE ${filename}"`);
    commands.push('');
    
    // Check user's groups
    commands.push(`# Check user's group memberships`);
    commands.push(`id ${username}`);
    commands.push(`groups ${username}`);
    commands.push('');
    
    // Check file's ACL (if available)
    commands.push(`# Check Access Control Lists (if enabled)`);
    commands.push(`getfacl "${filename}" 2>/dev/null || echo "ACLs not enabled or file doesn't exist"`);
    commands.push('');
    
    // Fix permissions if needed
    commands.push(`# Fix permissions (run as root)`);
    commands.push(`# chmod ${permissions} "${filename}"`);
    commands.push(`# chown ${owner}:${group} "${filename}"`);
    
    return commands.join('\n');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Commands copied to clipboard!');
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'secure_file':
        setCustomPermissions('600');
        setCustomOwner('john');
        setCustomGroup('john');
        break;
      case 'shared_readonly':
        setCustomPermissions('644');
        setCustomOwner('john');
        setCustomGroup('dev');
        break;
      case 'executable':
        setCustomPermissions('755');
        setCustomOwner('john');
        setCustomGroup('dev');
        break;
      case 'group_write':
        setCustomPermissions('664');
        setCustomOwner('john');
        setCustomGroup('dev');
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#16a34a" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Check User Access to File Tool
      </h2>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4">Quick Permission Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => applyPreset('secure_file')} className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-green-800">Secure File</div>
            <div className="text-sm text-green-600">600 - Owner only</div>
          </button>
          
          <button onClick={() => applyPreset('shared_readonly')} className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-blue-800">Shared Read-Only</div>
            <div className="text-sm text-blue-600">644 - Owner write, others read</div>
          </button>
          
          <button onClick={() => applyPreset('executable')} className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-purple-800">Executable</div>
            <div className="text-sm text-purple-600">755 - Owner full, others read/execute</div>
          </button>
          
          <button onClick={() => applyPreset('group_write')} className="bg-orange-50 hover:bg-orange-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-orange-800">Group Write</div>
            <div className="text-sm text-orange-600">664 - Owner/group write, others read</div>
          </button>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Access Analysis Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input 
                type="text" 
                value={accessData.username} 
                onChange={(e) => setAccessData(prev => ({ ...prev, username: e.target.value }))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="john" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Path *</label>
              <input 
                type="text" 
                value={accessData.filename} 
                onChange={(e) => setAccessData(prev => ({ ...prev, filename: e.target.value }))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="/home/john/documents/file.txt" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Groups</label>
              <input 
                type="text" 
                value={accessData.userGroups.join(', ')} 
                onChange={(e) => setAccessData(prev => ({ ...prev, userGroups: e.target.value.split(',').map(g => g.trim()) }))} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="dev, users, admin" 
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Permissions (Octal)</label>
              <input 
                type="text" 
                value={customPermissions} 
                onChange={(e) => setCustomPermissions(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="644" 
              />
              <p className="text-xs text-gray-500 mt-1">e.g., 644, 755, 600, 777</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Owner</label>
              <input 
                type="text" 
                value={customOwner} 
                onChange={(e) => setCustomOwner(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="john" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Group</label>
              <input 
                type="text" 
                value={customGroup} 
                onChange={(e) => setCustomGroup(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                placeholder="dev" 
              />
            </div>
            
            <div className="pt-2">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-green-600 hover:text-green-800 text-sm font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Advanced File Attributes</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sticky Bit</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="0">No (0)</option>
                  <option value="1">Yes (1)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SetGID</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="0">No (0)</option>
                  <option value="2">Yes (2)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SetUID</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="0">No (0)</option>
                  <option value="4">Yes (4)</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="text-center mb-6">
        <button 
          onClick={analyzeAccess} 
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          🔍 Analyze User Access
        </button>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Permission Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Permission Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Numeric</h4>
                <p className="text-2xl font-mono text-green-700">{analysisResult.permissions.numeric}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Symbolic</h4>
                <p className="text-2xl font-mono text-blue-700">{analysisResult.permissions.symbolic}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Owner</h4>
                <p className="text-lg text-purple-700">{customOwner}:{customGroup}</p>
              </div>
            </div>
          </div>

          {/* Access Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Access Analysis for {accessData.username}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">User Status</h4>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${analysisResult.access.isOwner ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`w-3 h-3 rounded-full ${analysisResult.access.isOwner ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    {analysisResult.access.isOwner ? 'Is file owner' : 'Not file owner'}
                  </div>
                  <div className={`flex items-center gap-2 ${analysisResult.access.isInGroup ? 'text-green-600' : 'text-gray-600'}`}>
                    <span className={`w-3 h-3 rounded-full ${analysisResult.access.isInGroup ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    {analysisResult.access.isInGroup ? 'Member of file group' : 'Not member of file group'}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Effective Permissions</h4>
                <div className="space-y-2">
                  <div className={`flex items-center gap-2 ${analysisResult.access.canRead ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-3 h-3 rounded-full ${analysisResult.access.canRead ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {analysisResult.access.canRead ? 'Can READ' : 'Cannot READ'}
                  </div>
                  <div className={`flex items-center gap-2 ${analysisResult.access.canWrite ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-3 h-3 rounded-full ${analysisResult.access.canWrite ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {analysisResult.access.canWrite ? 'Can WRITE' : 'Cannot WRITE'}
                  </div>
                  <div className={`flex items-center gap-2 ${analysisResult.access.canExecute ? 'text-green-600' : 'text-red-600'}`}>
                    <span className={`w-3 h-3 rounded-full ${analysisResult.access.canExecute ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {analysisResult.access.canExecute ? 'Can EXECUTE' : 'Cannot EXECUTE'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Special Permissions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Special Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${analysisResult.special.stickyBit ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                <h4 className="font-semibold text-gray-800 mb-2">Sticky Bit</h4>
                <p className={`text-lg ${analysisResult.special.stickyBit ? 'text-yellow-700' : 'text-gray-500'}`}>
                  {analysisResult.special.stickyBit ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${analysisResult.special.setGID ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'}`}>
                <h4 className="font-semibold text-gray-800 mb-2">SetGID</h4>
                <p className={`text-lg ${analysisResult.special.setGID ? 'text-orange-700' : 'text-gray-500'}`}>
                  {analysisResult.special.setGID ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${analysisResult.special.setUID ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                <h4 className="font-semibold text-gray-800 mb-2">SetUID</h4>
                <p className={`text-lg ${analysisResult.special.setUID ? 'text-red-700' : 'text-gray-500'}`}>
                  {analysisResult.special.setUID ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>

          {/* Security Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Security Analysis</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-lg font-semibold">Risk Level:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                analysisResult.security.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                analysisResult.security.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {analysisResult.security.riskLevel}
              </span>
            </div>
            
            {analysisResult.security.issues.length > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Security Issues Found:</h4>
                <ul className="list-disc pl-6 text-yellow-700">
                  {analysisResult.security.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">✅ No security issues detected. File permissions are secure.</p>
              </div>
            )}
          </div>

          {/* Generated Commands */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Generated Commands</h3>
            <div className="bg-gray-900 p-4 rounded-lg">
              <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">{analysisResult.commands}</pre>
              <div className="mt-4 text-center">
                <button
                  onClick={() => copyToClipboard(analysisResult.commands)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  📋 Copy Commands
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
          <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">💡</span>
          Quick Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Permission Checks:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">ls -la filename</div>
                <div className="text-xs text-gray-500">List file permissions</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">stat filename</div>
                <div className="text-xs text-gray-500">Detailed file information</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">id username</div>
                <div className="text-xs text-gray-500">Check user groups</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Security Best Practices:</h4>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Use 600 for sensitive files</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Avoid 777 permissions</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Regular permission audits</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Monitor SetUID/SetGID files</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckUserAccessToFileInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">What is User Access Analysis?</h2>
        <p className="text-gray-700 text-lg">
          User access analysis in Linux systems examines file permissions, ownership, and group memberships to determine 
          what actions a specific user can perform on a file. This analysis is crucial for security auditing, troubleshooting 
          access issues, and ensuring proper permission management.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">File Permissions</h3>
            <p className="text-green-700">Three sets of permissions (owner, group, others) with read (r), write (w), and execute (x) rights.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Ownership</h3>
            <p className="text-blue-700">The user and group that own a file, determining the base permission set applied.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Group Membership</h3>
            <p className="text-purple-700">Users can belong to multiple groups, affecting which permission set applies to them.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Effective Permissions</h3>
            <p className="text-orange-700">The actual permissions a user has based on ownership, group membership, and permission sets.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Permission Types</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Read Permission (r)</h3>
            <p className="text-gray-700 mb-2">Allows viewing file contents and listing directory contents:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>File: Can read file content</li>
              <li>Directory: Can list directory contents</li>
              <li>Numeric value: 4</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Write Permission (w)</h3>
            <p className="text-gray-700 mb-2">Allows modifying file contents and creating/deleting files in directories:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>File: Can modify file content</li>
              <li>Directory: Can create/delete files</li>
              <li>Numeric value: 2</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Execute Permission (x)</h3>
            <p className="text-gray-700 mb-2">Allows running files as programs and accessing directory contents:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>File: Can execute as program</li>
              <li>Directory: Can access directory contents</li>
              <li>Numeric value: 1</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Special Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Sticky Bit (t)</h3>
            <p className="text-yellow-700">On directories, only file owners can delete their files, even if others have write permission.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">SetGID (s)</h3>
            <p className="text-orange-700">Files created in the directory inherit the group ownership of the directory.</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">SetUID (s)</h3>
            <p className="text-red-700">Program runs with the permissions of the file owner, not the user executing it.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Common Permission Patterns</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">File Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>600 (rw-------):</strong> Owner read/write, no access for others
              </div>
              <div>
                <strong>644 (rw-r--r--):</strong> Owner read/write, others read-only
              </div>
              <div>
                <strong>755 (rwxr-xr-x):</strong> Owner full access, others read/execute
              </div>
              <div>
                <strong>777 (rwxrwxrwx):</strong> Full access for everyone (security risk)
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Directory Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>700 (rwx------):</strong> Owner full access, no access for others
              </div>
              <div>
                <strong>755 (rwxr-xr-x):</strong> Owner full access, others list/access
              </div>
              <div>
                <strong>775 (rwxrwxr-x):</strong> Owner/group full access, others list/access
              </div>
              <div>
                <strong>1777 (rwxrwxrwt):</strong> Full access with sticky bit
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Security Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Principle of Least Privilege:</strong> Grant only necessary permissions</li>
            <li><strong>Regular Audits:</strong> Periodically review file permissions and ownership</li>
            <li><strong>Secure Defaults:</strong> Use restrictive permissions (600, 700) for sensitive files</li>
            <li><strong>Monitor SetUID/SetGID:</strong> Be cautious with special permission bits</li>
            <li><strong>Group Management:</strong> Use groups for shared access instead of world permissions</li>
            <li><strong>Documentation:</strong> Maintain records of permission changes and reasons</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Troubleshooting Access Issues</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Common Problems</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Permission Denied:</strong> Check if user has required permissions</li>
              <li><strong>File Not Found:</strong> Verify file path and existence</li>
              <li><strong>Group Access Issues:</strong> Confirm user is member of required group</li>
              <li><strong>Inheritance Problems:</strong> Check parent directory permissions</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>ls -la filename</code>: View detailed file information</li>
              <li><code>stat filename</code>: Show comprehensive file stats</li>
              <li><code>id username</code>: Display user's group memberships</li>
              <li><code>groups username</code>: List all groups for a user</li>
              <li><code>sudo -u username test -r filename</code>: Test specific permissions</li>
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
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-green-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
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
