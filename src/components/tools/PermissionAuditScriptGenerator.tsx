"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 to-violet-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-violet-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-indigo-500 rounded-full"></div>
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
                <div className="bg-purple-700/80 text-white p-2 rounded">Audit<br/>find / -type f<br/>ls -la</div>
                <div className="bg-violet-700/80 text-white p-2 rounded">Report<br/>permissions<br/>security</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Generate audit scripts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PermissionAuditScriptGenerator() {
  const [auditConfig, setAuditConfig] = useState({
    scanType: 'comprehensive',
    outputFormat: 'bash',
    includeRemediation: true,
    maxDepth: 3
  });

  const [generatedScript, setGeneratedScript] = useState<string>('');

  const generateAuditScript = () => {
    const script = `#!/bin/bash
# Permission Audit Script
# Generated: ${new Date().toISOString()}
# Scan Type: ${auditConfig.scanType}
# Output Format: ${auditConfig.outputFormat}

set -euo pipefail

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Logging function
log() {
    echo -e "\${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]\${NC} \$1"
}

warn() {
    echo -e "\${YELLOW}[WARNING]\${NC} \$1"
}

error() {
    echo -e "\${RED}[ERROR]\${NC} \$1"
}

success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} \$1"
}

# Create output directory
OUTPUT_DIR="/tmp/permission_audit_$(date +%Y%m%d_%H%M%S)"
mkdir -p "\$OUTPUT_DIR"
log "Creating output directory: \$OUTPUT_DIR"

# Initialize report
REPORT_FILE="\$OUTPUT_DIR/permission_audit_report.txt"
echo "Permission Audit Report - $(date)" > "\$REPORT_FILE"
echo "================================================" >> "\$REPORT_FILE"
echo "" >> "\$REPORT_FILE"

# Function to audit permissions
audit_permissions() {
    local path="\$1"
    local depth="\$2"
    
    log "Auditing permissions for: \$path (max depth: \$depth)"
    
    # Find world-writable files
    log "Scanning for world-writable files..."
    find "\$path" -maxdepth "\$depth" -type f -perm -002 2>/dev/null | while read -r file; do
        echo "WORLD_WRITABLE: \$file (\$(ls -ld "\$file" | awk '{print \$1}'))" >> "\$REPORT_FILE"
        echo "WORLD_WRITABLE: \$file (\$(ls -ld "\$file" | awk '{print \$1}'))"
    done
    
    # Find SetUID files
    log "Scanning for SetUID files..."
    find "\$path" -maxdepth "\$depth" -type f -perm -4000 2>/dev/null | while read -r file; do
        echo "SETUID: \$file (\$(ls -ld "\$file" | awk '{print \$1, \$3, \$4}'))" >> "\$REPORT_FILE"
        echo "SETUID: \$file (\$(ls -ld "\$file" | awk '{print \$1, \$3, \$4}'))"
    done
    
    # Find SetGID files
    log "Scanning for SetGID files..."
    find "\$path" -maxdepth "\$depth" -type f -perm -2000 2>/dev/null | while read -r file; do
        echo "SETGID: \$file (\$(ls -ld "\$file" | awk '{print \$1, \$3, \$4}'))" >> "\$REPORT_FILE"
        echo "SETGID: \$file (\$(ls -ld "\$file" | awk '{print \$1, \$3, \$4}'))"
    done
    
    # Find files with no owner
    log "Scanning for files with no owner..."
    find "\$path" -maxdepth "\$depth" -nouser 2>/dev/null | while read -r file; do
        echo "NO_OWNER: \$file" >> "\$REPORT_FILE"
        echo "NO_OWNER: \$file"
    done
    
    # Find files with no group
    log "Scanning for files with no group..."
    find "\$path" -maxdepth "\$depth" -nogroup 2>/dev/null | while read -r file; do
        echo "NO_GROUP: \$file" >> "\$REPORT_FILE"
        echo "NO_GROUP: \$file"
    done
}

# Main execution
main() {
    log "Starting permission audit..."
    log "Scan type: ${auditConfig.scanType}"
    log "Max depth: ${auditConfig.maxDepth}"
    
    # Audit common paths
    audit_permissions "/etc" ${auditConfig.maxDepth}
    audit_permissions "/home" ${auditConfig.maxDepth}
    audit_permissions "/var" ${auditConfig.maxDepth}
    
    # Generate summary
    echo "" >> "\$REPORT_FILE"
    echo "Audit Summary:" >> "\$REPORT_FILE"
    echo "=============" >> "\$REPORT_FILE"
    echo "Scan completed: $(date)" >> "\$REPORT_FILE"
    echo "Output directory: \$OUTPUT_DIR" >> "\$REPORT_FILE"
    
    success "Permission audit completed successfully!"
    log "Report saved to: \$REPORT_FILE"
    log "Output directory: \$OUTPUT_DIR"
    
    # Display report location
    echo ""
    echo "📋 Audit Report: \$REPORT_FILE"
    echo "📁 Output Directory: \$OUTPUT_DIR"
    echo ""
    echo "To view the report: cat \$REPORT_FILE"
    echo "To open output directory: ls -la \$OUTPUT_DIR"
}

# Run main function
main "\$@"
`;

    setGeneratedScript(script);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Script copied to clipboard!');
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'comprehensive':
        setAuditConfig(prev => ({
          ...prev,
          scanType: 'comprehensive',
          maxDepth: 3
        }));
        break;
      case 'security_focused':
        setAuditConfig(prev => ({
          ...prev,
          scanType: 'security_focused',
          maxDepth: 2
        }));
        break;
      case 'home_directory':
        setAuditConfig(prev => ({
          ...prev,
          scanType: 'home_directory',
          maxDepth: 5
        }));
        break;
      case 'web_server':
        setAuditConfig(prev => ({
          ...prev,
          scanType: 'web_server',
          maxDepth: 4
        }));
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-purple-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#9333ea" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Permission Audit Script Generator
      </h2>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-purple-800 mb-4">Quick Audit Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => applyPreset('comprehensive')} className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-purple-800">Comprehensive</div>
            <div className="text-sm text-purple-600">Full system scan</div>
          </button>
          
          <button onClick={() => applyPreset('security_focused')} className="bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-red-800">Security Focused</div>
            <div className="text-sm text-red-600">Critical paths only</div>
          </button>
          
          <button onClick={() => applyPreset('home_directory')} className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-blue-800">Home Directory</div>
            <div className="text-sm text-blue-600">User files scan</div>
          </button>
          
          <button onClick={() => applyPreset('web_server')} className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-green-800">Web Server</div>
            <div className="text-sm text-green-600">Web-related paths</div>
          </button>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-purple-800 mb-4">Audit Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scan Type</label>
            <select 
              value={auditConfig.scanType} 
              onChange={(e) => setAuditConfig(prev => ({ ...prev, scanType: e.target.value }))} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="comprehensive">Comprehensive</option>
              <option value="security_focused">Security Focused</option>
              <option value="home_directory">Home Directory</option>
              <option value="web_server">Web Server</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Directory Depth</label>
            <input 
              type="number" 
              value={auditConfig.maxDepth} 
              onChange={(e) => setAuditConfig(prev => ({ ...prev, maxDepth: parseInt(e.target.value) || 3 }))} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
              min="1" 
              max="10"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-6">
        <button 
          onClick={generateAuditScript} 
          className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          🚀 Generate Audit Script
        </button>
      </div>

      {/* Generated Script */}
      {generatedScript && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">Generated Bash Script</h3>
          <div className="bg-gray-900 p-4 rounded-lg">
            <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">{generatedScript}</pre>
            <div className="mt-4 text-center">
              <button
                onClick={() => copyToClipboard(generatedScript)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                📋 Copy Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-purple-800 mb-4 flex items-center">
          <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3">💡</span>
          Quick Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Audit Commands:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">find / -type f -perm -002</div>
                <div className="text-xs text-gray-500">Find world-writable files</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">find / -type f -perm -4000</div>
                <div className="text-xs text-gray-500">Find SetUID files</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">find / -nouser</div>
                <div className="text-xs text-gray-500">Find files with no owner</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Security Best Practices:</h4>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Regular permission audits</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Monitor SetUID/SetGID files</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Check for orphaned files</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Document permission changes</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PermissionAuditScriptInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">What is Permission Auditing?</h2>
        <p className="text-gray-700 text-lg">
          Permission auditing in Linux systems involves systematically scanning files and directories to identify 
          security vulnerabilities related to file permissions, ownership, and access rights. This process helps 
          system administrators maintain security compliance and identify potential security risks.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Key Security Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">World-Writable Files</h3>
            <p className="text-red-700">Files that anyone can modify, creating security vulnerabilities and potential data corruption.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">SetUID/SetGID Files</h3>
            <p className="text-orange-700">Executable files that run with elevated privileges, which can be exploited if compromised.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Orphaned Files</h3>
            <p className="text-yellow-700">Files with no owner or group, which may indicate system issues or security problems.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Insecure Permissions</h3>
            <p className="text-blue-700">Files with overly permissive access rights that expose sensitive information.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Audit Process</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">1. Planning</h3>
            <p className="text-gray-700 mb-2">Define the scope of the audit:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Determine which directories to scan</li>
              <li>Set maximum directory depth</li>
              <li>Choose permission checks to perform</li>
              <li>Plan remediation strategies</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">2. Execution</h3>
            <p className="text-gray-700 mb-2">Run the audit script:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Scan specified directories recursively</li>
              <li>Check file permissions and ownership</li>
              <li>Identify security issues</li>
              <li>Generate detailed reports</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">3. Analysis</h3>
            <p className="text-gray-700 mb-2">Review audit results:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Prioritize security issues by severity</li>
              <li>Identify false positives</li>
              <li>Plan remediation actions</li>
              <li>Document findings</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">4. Remediation</h3>
            <p className="text-gray-700 mb-2">Fix identified issues:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Apply appropriate permissions</li>
              <li>Fix ownership issues</li>
              <li>Remove unnecessary SetUID/SetGID bits</li>
              <li>Verify fixes</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Common Permission Issues</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">World-Writable Files (002)</h3>
            <p className="text-gray-700 mb-2">Files that anyone can modify:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Risk:</strong> Data corruption, unauthorized modifications</li>
              <li><strong>Common locations:</strong> /tmp, /var/tmp, user home directories</li>
              <li><strong>Fix:</strong> <code>chmod o-w filename</code></li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">SetUID Files (4000)</h3>
            <p className="text-gray-700 mb-2">Executable files that run with owner privileges:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Risk:</strong> Privilege escalation if compromised</li>
              <li><strong>Common examples:</strong> passwd, sudo, su</li>
              <li><strong>Fix:</strong> <code>chmod u-s filename</code> (review first)</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Orphaned Files</h3>
            <p className="text-gray-700 mb-2">Files with no valid owner or group:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><strong>Risk:</strong> Security bypass, access control issues</li>
              <li><strong>Detection:</strong> <code>find / -nouser</code> or <code>find / -nogroup</code></li>
              <li><strong>Fix:</strong> <code>chown root:root filename</code> (review first)</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Regular Audits:</strong> Perform permission audits monthly or after system changes</li>
            <li><strong>Documentation:</strong> Keep records of all permission changes and reasons</li>
            <li><strong>Testing:</strong> Test audit scripts in non-production environments first</li>
            <li><strong>Backup:</strong> Always backup before making permission changes</li>
            <li><strong>Review:</strong> Manually review critical findings before remediation</li>
            <li><strong>Monitoring:</strong> Set up alerts for permission changes on critical files</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-purple-800">Automation Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Consistency</h3>
            <p className="text-green-700">Automated scripts ensure the same checks are performed every time, reducing human error.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Efficiency</h3>
            <p className="text-blue-700">Scripts can scan large file systems quickly and generate comprehensive reports automatically.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Documentation</h3>
            <p className="text-purple-700">Automated reports provide detailed documentation for compliance and security reviews.</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">Remediation</h3>
            <p className="text-indigo-700">Scripts can generate fix commands and even apply them automatically when safe.</p>
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
      <h2 className="text-2xl font-bold mb-6 text-purple-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
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
    <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300" />
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
