"use client";
import React, { useState, useEffect } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-900 to-orange-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-red-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-orange-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-pink-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-red-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <div className="text-sm font-semibold">Security Scanner</div>
                <div className="text-xs opacity-75">Detect privilege risks</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>👤 User</span>
                    <span>🔑 Sudo</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>📁 Files</span>
                    <span>⚡ SUID</span>
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

interface PrivilegeCheck {
  id: string;
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  status: 'pass' | 'fail' | 'warning';
  details: string;
  recommendation: string;
}

export function UserPrivilegeEscalationDetector() {
  const [username, setUsername] = useState('');
  const [scanResults, setScanResults] = useState<PrivilegeCheck[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<PrivilegeCheck | null>(null);
  const [scanType, setScanType] = useState<'basic' | 'comprehensive' | 'custom'>('basic');

  const privilegeChecks: PrivilegeCheck[] = [
    {
      id: '1',
      name: 'Sudo Access',
      description: 'Check if user has sudo privileges and what commands they can run',
      risk: 'high',
      status: 'warning',
      details: 'User has limited sudo access to specific commands',
      recommendation: 'Review and restrict sudo access to only necessary commands'
    },
    {
      id: '2',
      name: 'SUID/SGID Files',
      description: 'Identify files with SUID or SGID bits that the user can execute',
      risk: 'critical',
      status: 'fail',
      details: 'Found 3 SUID binaries accessible to user',
      recommendation: 'Remove unnecessary SUID bits and restrict access to critical binaries'
    },
    {
      id: '3',
      name: 'Group Memberships',
      description: 'Check user group memberships for elevated privileges',
      risk: 'medium',
      status: 'pass',
      details: 'User is member of standard groups only',
      recommendation: 'Monitor group memberships for changes'
    },
    {
      id: '4',
      name: 'File Permissions',
      description: 'Scan for world-writable files owned by the user',
      risk: 'medium',
      status: 'warning',
      details: 'Found 2 world-writable files in user home directory',
      recommendation: 'Restrict file permissions to owner only when possible'
    },
    {
      id: '5',
      name: 'Cron Jobs',
      description: 'Check for cron jobs that run with elevated privileges',
      risk: 'high',
      status: 'fail',
      details: 'User has cron job running as root',
      recommendation: 'Review and remove unnecessary elevated cron jobs'
    },
    {
      id: '6',
      name: 'SSH Keys',
      description: 'Check for SSH key-based authentication vulnerabilities',
      risk: 'low',
      status: 'pass',
      details: 'SSH keys are properly secured',
      recommendation: 'Continue monitoring SSH key security'
    },
    {
      id: '7',
      name: 'Network Services',
      description: 'Check for network services running with user privileges',
      risk: 'medium',
      status: 'warning',
      details: 'User running web service on non-standard port',
      recommendation: 'Review service configuration and security'
    },
    {
      id: '8',
      name: 'Environment Variables',
      description: 'Check for dangerous environment variables',
      risk: 'low',
      status: 'pass',
      details: 'No dangerous environment variables found',
      recommendation: 'Regularly audit environment variables'
    }
  ];

  const runScan = () => {
    if (!username.trim()) return;
    
    setIsScanning(true);
    setScanComplete(false);
    
    // Simulate scanning process
    setTimeout(() => {
      // Randomize some results for demonstration
      const randomizedResults = privilegeChecks.map(check => ({
        ...check,
        status: Math.random() > 0.3 ? check.status : 
                Math.random() > 0.5 ? 'pass' : 'warning',
        details: check.details // Keep original details for now
      }));
      
      setScanResults(randomizedResults);
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'fail': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const generateCommands = () => {
    if (!username) return [];

    const commands = [];
    
    // Sudo commands
    commands.push(`# Check sudo access for ${username}`);
    commands.push(`sudo -l -U ${username}`);
    commands.push(`# View sudoers file`);
    commands.push(`sudo cat /etc/sudoers | grep ${username}`);
    
    // SUID/SGID commands
    commands.push(`# Find SUID files accessible to ${username}`);
    commands.push(`find / -perm -4000 -user root -executable 2>/dev/null | xargs ls -la`);
    commands.push(`# Find SGID files accessible to ${username}`);
    commands.push(`find / -perm -2000 -group root -executable 2>/dev/null | xargs ls -la`);
    
    // Group membership
    commands.push(`# Check group memberships for ${username}`);
    commands.push(`groups ${username}`);
    commands.push(`id ${username}`);
    
    // File permissions
    commands.push(`# Find world-writable files owned by ${username}`);
    commands.push(`find /home/${username} -perm -002 -type f 2>/dev/null`);
    
    // Cron jobs
    commands.push(`# Check cron jobs for ${username}`);
    commands.push(`crontab -u ${username} -l`);
    commands.push(`# Check system cron jobs`);
    commands.push(`sudo cat /etc/crontab`);
    
    // SSH keys
    commands.push(`# Check SSH key permissions for ${username}`);
    commands.push(`ls -la /home/${username}/.ssh/`);
    
    // Network services
    commands.push(`# Check listening ports for ${username}`);
    commands.push(`netstat -tlnp | grep ${username}`);
    commands.push(`ss -tlnp | grep ${username}`);
    
    return commands;
  };

  const getRiskSummary = () => {
    const critical = scanResults.filter(r => r.risk === 'critical').length;
    const high = scanResults.filter(r => r.risk === 'high').length;
    const medium = scanResults.filter(r => r.risk === 'medium').length;
    const low = scanResults.filter(r => r.risk === 'low').length;
    
    return { critical, high, medium, low };
  };

  const riskSummary = getRiskSummary();

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-red-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#dc2626" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        User Privilege Escalation Detector
      </h2>

      {/* Scan Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Scan Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username to scan"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="basic">Basic Scan</option>
              <option value="comprehensive">Comprehensive Scan</option>
              <option value="custom">Custom Scan</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={runScan}
              disabled={!username.trim() || isScanning}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scanning...
                </>
              ) : (
                <>
                  🔍 Start Scan
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Scan Results */}
      {scanComplete && (
        <>
          {/* Risk Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Risk Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{riskSummary.critical}</div>
                <div className="text-sm text-red-700">Critical</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{riskSummary.high}</div>
                <div className="text-sm text-orange-700">High</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{riskSummary.medium}</div>
                <div className="text-sm text-yellow-700">Medium</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{riskSummary.low}</div>
                <div className="text-sm text-green-700">Low</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Scan Results</h3>
            <div className="space-y-3">
              {scanResults.map((check) => (
                <div
                  key={check.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedCheck?.id === check.id 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                  onClick={() => setSelectedCheck(check)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getStatusIcon(check.status)}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">{check.name}</h4>
                        <p className="text-sm text-gray-600">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(check.risk)}`}>
                        {check.risk.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                        {check.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Check Details */}
          {selectedCheck && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
                <span className="bg-red-100 text-red-800 p-2 rounded-lg mr-3">📋</span>
                {selectedCheck.name} - Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Check Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedCheck.risk)}`}>
                        {selectedCheck.risk.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCheck.status)}`}>
                        {selectedCheck.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-gray-800">{selectedCheck.description}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Findings</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 text-sm">{selectedCheck.details}</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-3 mt-4">Recommendation</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-700 text-sm">{selectedCheck.recommendation}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generated Commands */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
              <span className="bg-red-100 text-red-800 p-2 rounded-lg mr-3">💻</span>
              Manual Verification Commands
            </h3>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {generateCommands().map((command, index) => (
                <div key={index} className="mb-2">
                  <span className="text-gray-400">$ </span>
                  {command}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const commands = generateCommands().join('\n');
                  navigator.clipboard.writeText(commands);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📋 Copy Commands
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Quick Security Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-red-50 hover:bg-red-100 p-4 rounded-lg text-left transition-colors">
            <div className="font-semibold text-red-800">🔒 Lock User Account</div>
            <div className="text-sm text-red-600">Temporarily disable user access</div>
          </button>
          
          <button className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-left transition-colors">
            <div className="font-semibold text-orange-800">📋 Audit Logs</div>
            <div className="text-sm text-orange-600">Review user activity logs</div>
          </button>
          
          <button className="bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-left transition-colors">
            <div className="font-semibold text-yellow-800">🔄 Reset Permissions</div>
            <div className="text-sm text-yellow-600">Restore default file permissions</div>
          </button>
          
          <button className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-left transition-colors">
            <div className="font-semibold text-blue-800">📊 Generate Report</div>
            <div className="text-sm text-blue-600">Create detailed security report</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export function UserPrivilegeEscalationDetectorInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">What is Privilege Escalation?</h2>
        <p className="text-gray-700 text-lg">
          Privilege escalation is a security vulnerability where a user gains elevated access rights 
          beyond what they were originally granted. This can happen through various means including 
          exploiting software bugs, misconfigurations, or leveraging existing privileges to access 
          higher-level resources. Detecting and preventing privilege escalation is crucial for 
          maintaining system security.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Types of Privilege Escalation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">🔄 Horizontal Escalation</h3>
            <p className="text-gray-700 text-sm">
              Gaining access to resources at the same privilege level but belonging to other users. 
              This includes accessing other user accounts, files, or services without authorization.
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">⬆️ Vertical Escalation</h3>
            <p className="text-gray-700 text-sm">
              Gaining higher-level privileges, such as becoming root or administrator. This is 
              typically more dangerous as it provides access to system-wide resources.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Common Attack Vectors</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">SUID/SGID Binaries</h3>
            <p className="text-gray-700 mb-2">Files with SUID (Set User ID) or SGID (Set Group ID) bits run with elevated privileges:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>SUID binaries run as the file owner (often root)</li>
              <li>SGID binaries run with the file's group privileges</li>
              <li>Vulnerable SUID binaries can lead to root access</li>
              <li>Common targets: passwd, chsh, chfn, gpasswd</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Sudo Misconfigurations</h3>
            <p className="text-gray-700 mb-2">Improper sudo configurations can allow privilege escalation:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Allowing execution of arbitrary commands</li>
              <li>Missing password requirements</li>
              <li>Overly permissive command specifications</li>
              <li>Environment variable manipulation</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">File Permission Issues</h3>
            <p className="text-gray-700 mb-2">Weak file permissions can enable privilege escalation:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>World-writable files and directories</li>
              <li>Files owned by privileged users with weak permissions</li>
              <li>Symbolic link vulnerabilities</li>
              <li>Race conditions in file operations</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Cron Job Vulnerabilities</h3>
            <p className="text-gray-700 mb-2">Scheduled tasks can be exploited for privilege escalation:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Jobs running as root or other privileged users</li>
              <li>Writable cron directories or files</li>
              <li>Environment variable manipulation</li>
              <li>Path-based command execution</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Detection Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔍 Active Detection</h3>
            <ul className="list-disc pl-6 text-blue-700 text-sm">
              <li>Regular privilege audits</li>
              <li>Automated security scans</li>
              <li>Penetration testing</li>
              <li>Vulnerability assessments</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">📊 Passive Monitoring</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm">
              <li>Log analysis and monitoring</li>
              <li>File integrity monitoring</li>
              <li>User activity tracking</li>
              <li>System call monitoring</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Prevention Strategies</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Principle of Least Privilege</h3>
            <p className="text-gray-700 mb-2">Grant users only the minimum privileges necessary:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Regular privilege reviews</li>
              <li>Remove unnecessary sudo access</li>
              <li>Limit group memberships</li>
              <li>Restrict file permissions</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Secure Configuration</h3>
            <p className="text-gray-700 mb-2">Implement secure system configurations:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Disable unnecessary SUID/SGID bits</li>
              <li>Secure sudo configurations</li>
              <li>Proper file permission settings</li>
              <li>Regular security updates</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Monitoring and Auditing</h3>
            <p className="text-gray-700 mb-2">Continuous monitoring and regular audits:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>File integrity monitoring</li>
              <li>User privilege tracking</li>
              <li>Log analysis and alerting</li>
              <li>Regular security assessments</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Security Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">System Tools</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>sudo -l</code> - List sudo privileges</li>
              <li><code>find</code> - Search for SUID/SGID files</li>
              <li><code>ls -la</code> - Check file permissions</li>
              <li><code>crontab -l</code> - View cron jobs</li>
              <li><code>id</code> - Check user/group info</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Security Tools</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Lynis:</strong> Security auditing tool</li>
              <li><strong>Rkhunter:</strong> Rootkit detection</li>
              <li><strong>Chkrootkit:</strong> Rootkit scanner</li>
              <li><strong>Tripwire:</strong> File integrity monitor</li>
              <li><strong>OSSEC:</strong> Host-based intrusion detection</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Incident Response</h2>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">When Privilege Escalation is Detected</h3>
          <ol className="list-decimal pl-6 text-red-700 text-lg">
            <li><strong>Immediate Response:</strong> Isolate affected systems and accounts</li>
            <li><strong>Investigation:</strong> Determine scope and method of escalation</li>
            <li><strong>Containment:</strong> Remove unauthorized access and privileges</li>
            <li><strong>Recovery:</strong> Restore system to secure state</li>
            <li><strong>Post-Incident:</strong> Analyze lessons learned and improve defenses</li>
          </ol>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Regular Audits:</strong> Conduct privilege audits at least quarterly</li>
            <li><strong>Automated Scanning:</strong> Use automated tools for continuous monitoring</li>
            <li><strong>Documentation:</strong> Maintain detailed records of all privilege changes</li>
            <li><strong>Training:</strong> Educate users about security risks and best practices</li>
            <li><strong>Testing:</strong> Regularly test security controls and incident response</li>
            <li><strong>Updates:</strong> Keep systems and security tools updated</li>
            <li><strong>Backup:</strong> Maintain secure backups for recovery</li>
            <li><strong>Compliance:</strong> Follow security standards and regulations</li>
          </ul>
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
      <h2 className="text-2xl font-bold mb-6 text-red-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-red-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-red-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Security</h2>
      <p className="text-red-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux security tips, vulnerability alerts, and tool updates delivered to your inbox. 
        Join our community of security professionals and system administrators.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300" />
        <button className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-red-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
