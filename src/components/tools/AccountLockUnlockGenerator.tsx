"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-900 to-pink-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-red-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-pink-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-purple-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-red-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-sm">
                <div className="bg-red-700/80 text-white p-2 rounded">Lock<br/>usermod -L<br/>username</div>
                <div className="bg-green-700/80 text-white p-2 rounded">Unlock<br/>usermod -U<br/>username</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Generate security scripts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountLockUnlockGenerator() {
  const [lockData, setLockData] = useState({
    username: 'john.doe',
    action: 'lock',
    reason: 'security_violation',
    customReason: '',
    duration: 'permanent',
    customDuration: '',
    notifyUser: true,
    notifyAdmin: true,
    logAction: true,
    backupHome: false,
    includePasswordReset: false,
    includeExpiry: false,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [generatedScript, setGeneratedScript] = useState<string>('');

  const generateLockScript = () => {
    const timestamp = new Date().toISOString();
    const reason = lockData.customReason || lockData.reason;
    const duration = lockData.customDuration || lockData.duration;
    
    let script = `#!/bin/bash
# Account Lock/Unlock Script
# Generated: ${timestamp}
# Username: ${lockData.username}
# Action: ${lockData.action}
# Reason: ${reason}
# Duration: ${duration}

USERNAME="${lockData.username}"
ACTION="${lockData.action}"
REASON="${reason}"
DURATION="${duration}"
LOG_FILE="/var/log/account_management.log"
ADMIN_EMAIL="admin@company.com"
BACKUP_DIR="/backup/users"

# Logging function
log_action() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo "$1"
}

# Check if user exists
if ! id "$USERNAME" &>/dev/null; then
    log_action "ERROR: User $USERNAME does not exist"
    exit 1
fi

log_action "Starting $ACTION operation for user $USERNAME"
log_action "Reason: $REASON"
log_action "Duration: $DURATION"

# Create backup if requested
if [ "$ACTION" = "lock" ] && [ "$BACKUP_HOME" = "true" ]; then
    if [ -d "/home/$USERNAME" ]; then
        BACKUP_PATH="$BACKUP_DIR/${USERNAME}_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_PATH"
        cp -r "/home/$USERNAME" "$BACKUP_PATH"
        log_action "Home directory backed up to $BACKUP_PATH"
    fi
fi

# Perform lock/unlock action
if [ "$ACTION" = "lock" ]; then
    # Lock the account
    usermod -L "$USERNAME"
    log_action "Account $USERNAME locked successfully"
    
    # Set expiry if requested
    if [ "$INCLUDE_EXPIRY" = "true" ]; then
        usermod -e ${lockData.expiryDate} "$USERNAME"
        log_action "Expiry date set to ${lockData.expiryDate}"
    fi
    
    # Reset password if requested
    if [ "$INCLUDE_PASSWORD_RESET" = "true" ]; then
        echo "$USERNAME:$(openssl rand -base64 12)" | chpasswd
        log_action "Password reset for $USERNAME"
    fi
    
elif [ "$ACTION" = "unlock" ]; then
    # Unlock the account
    usermod -U "$USERNAME"
    log_action "Account $USERNAME unlocked successfully"
    
    # Clear expiry if it was set
    usermod -e "" "$USERNAME"
    log_action "Expiry date cleared for $USERNAME"
fi

# Send notifications
if [ "$NOTIFY_USER" = "true" ]; then
    if [ "$ACTION" = "lock" ]; then
        echo "Your account has been locked due to: $REASON" | mail -s "Account Locked" "$USERNAME@company.com"
    else
        echo "Your account has been unlocked. You can now log in." | mail -s "Account Unlocked" "$USERNAME@company.com"
    fi
    log_action "Notification sent to user $USERNAME"
fi

if [ "$NOTIFY_ADMIN" = "true" ]; then
    echo "Account $ACTION completed for user $USERNAME. Reason: $REASON" | mail -s "Account $ACTION Alert" "$ADMIN_EMAIL"
    log_action "Notification sent to admin"
fi

log_action "$ACTION operation completed successfully for user $USERNAME"
echo "✅ Account $ACTION completed for $USERNAME"
echo "📝 Check logs at: $LOG_FILE"`;

    setGeneratedScript(script);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Script copied to clipboard!');
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'security_violation':
        setLockData(prev => ({
          ...prev,
          action: 'lock',
          reason: 'security_violation',
          duration: 'permanent',
          notifyUser: true,
          notifyAdmin: true,
          logAction: true,
          backupHome: true,
          includePasswordReset: true
        }));
        break;
      case 'temporary_suspension':
        setLockData(prev => ({
          ...prev,
          action: 'lock',
          reason: 'temporary_suspension',
          duration: '24h',
          notifyUser: true,
          notifyAdmin: true,
          logAction: true,
          backupHome: false,
          includePasswordReset: false,
          includeExpiry: true
        }));
        break;
      case 'investigation':
        setLockData(prev => ({
          ...prev,
          action: 'lock',
          reason: 'investigation',
          duration: 'permanent',
          notifyUser: false,
          notifyAdmin: true,
          logAction: true,
          backupHome: true,
          includePasswordReset: true
        }));
        break;
      case 'standard_unlock':
        setLockData(prev => ({
          ...prev,
          action: 'unlock',
          reason: 'standard_unlock',
          duration: 'permanent',
          notifyUser: true,
          notifyAdmin: true,
          logAction: true,
          backupHome: false,
          includePasswordReset: false
        }));
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-red-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#dc2626" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Account Lock/Unlock Script Generator
      </h2>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => applyPreset('security_violation')} className="bg-red-50 hover:bg-red-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-red-800">Security Violation</div>
            <div className="text-sm text-red-600">Permanent lock, backup, reset</div>
          </button>
          
          <button onClick={() => applyPreset('temporary_suspension')} className="bg-yellow-50 hover:bg-yellow-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-yellow-800">Temporary Suspension</div>
            <div className="text-sm text-yellow-600">24h lock, expiry date</div>
          </button>
          
          <button onClick={() => applyPreset('investigation')} className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-purple-800">Investigation</div>
            <div className="text-sm text-purple-600">Silent lock, backup, reset</div>
          </button>
          
          <button onClick={() => applyPreset('standard_unlock')} className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-green-800">Standard Unlock</div>
            <div className="text-sm text-green-600">Notify user and admin</div>
          </button>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-red-800 mb-4">Script Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input type="text" value={lockData.username} onChange={(e) => setLockData(prev => ({ ...prev, username: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="john.doe" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select value={lockData.action} onChange={(e) => setLockData(prev => ({ ...prev, action: e.target.value as 'lock' | 'unlock' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="lock">Lock Account</option>
                <option value="unlock">Unlock Account</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <select value={lockData.reason} onChange={(e) => setLockData(prev => ({ ...prev, reason: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="security_violation">Security Violation</option>
                <option value="temporary_suspension">Temporary Suspension</option>
                <option value="investigation">Investigation</option>
                <option value="policy_violation">Policy Violation</option>
                <option value="inactive_account">Inactive Account</option>
                <option value="custom">Custom Reason</option>
              </select>
            </div>
            
            {lockData.reason === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Reason</label>
                <input type="text" value={lockData.customReason} onChange={(e) => setLockData(prev => ({ ...prev, customReason: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="Enter custom reason" />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <select value={lockData.duration} onChange={(e) => setLockData(prev => ({ ...prev, duration: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                <option value="permanent">Permanent</option>
                <option value="24h">24 Hours</option>
                <option value="48h">48 Hours</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
                <option value="custom">Custom Duration</option>
              </select>
            </div>
            
            {lockData.duration === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Custom Duration</label>
                <input type="text" value={lockData.customDuration} onChange={(e) => setLockData(prev => ({ ...prev, customDuration: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" placeholder="e.g., 72h, 2w, 3m" />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Notifications</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked={lockData.notifyUser} onChange={(e) => setLockData(prev => ({ ...prev, notifyUser: e.target.checked }))} className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Notify User</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" checked={lockData.notifyAdmin} onChange={(e) => setLockData(prev => ({ ...prev, notifyAdmin: e.target.checked }))} className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Notify Admin</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" checked={lockData.logAction} onChange={(e) => setLockData(prev => ({ ...prev, logAction: e.target.checked }))} className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Log Action</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Additional Actions</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked={lockData.backupHome} onChange={(e) => setLockData(prev => ({ ...prev, backupHome: e.target.checked }))} className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Backup Home Directory</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" checked={lockData.includePasswordReset} onChange={(e) => setLockData(prev => ({ ...prev, includePasswordReset: e.target.checked }))} className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Reset Password</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" checked={lockData.includeExpiry} onChange={(e) => setLockData(prev => ({ ...prev, includeExpiry: e.target.checked }))} className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Set Expiry Date</span>
                </label>
              </div>
            </div>
            
            {lockData.includeExpiry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                <input type="date" value={lockData.expiryDate} onChange={(e) => setLockData(prev => ({ ...prev, expiryDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-6">
        <button onClick={generateLockScript} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          🚀 Generate Lock/Unlock Script
        </button>
      </div>

      {/* Generated Script */}
      {generatedScript && (
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Generated Script:</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">{generatedScript}</pre>
            <div className="mt-4 text-center">
              <button onClick={() => copyToClipboard(generatedScript)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors">
                📋 Copy Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">💡</span>
          Quick Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Lock Commands:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -L username</div>
                <div className="text-xs text-gray-500">Lock account</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -U username</div>
                <div className="text-xs text-gray-500">Unlock account</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">passwd -l username</div>
                <div className="text-xs text-gray-500">Lock via password</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Best Practices:</h4>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Always log actions</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Backup before locking</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Document reasons</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Set appropriate durations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountLockUnlockInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">What is Account Locking/Unlocking?</h2>
        <p className="text-gray-700 text-lg">
          Account locking and unlocking are essential security measures in Linux systems that control user access. 
          Locking prevents users from logging in, while unlocking restores access. This is crucial for security incidents, 
          policy violations, investigations, and temporary suspensions.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Account Lock (-L)</h3>
            <p className="text-red-700">Prevents user from logging in by locking the password. The account remains but is inaccessible.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Account Unlock (-U)</h3>
            <p className="text-green-700">Restores user access by unlocking the password. User can log in normally again.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Password Lock (-l)</h3>
            <p className="text-yellow-700">Alternative method using passwd command to lock/unlock accounts.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Account Expiry</h3>
            <p className="text-blue-700">Sets a date when the account automatically becomes inaccessible.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Commands Used</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">usermod Command</h3>
            <p className="text-gray-700 mb-2">The <code>usermod</code> command modifies existing user accounts:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>-L</code>: Lock user account</li>
              <li><code>-U</code>: Unlock user account</li>
              <li><code>-e YYYY-MM-DD</code>: Set account expiry date</li>
              <li><code>-f days</code>: Set inactive period after expiry</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">passwd Command</h3>
            <p className="text-gray-700 mb-2">The <code>passwd</code> command manages password-related operations:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>-l username</code>: Lock user account</li>
              <li><code>-u username</code>: Unlock user account</li>
              <li><code>-S username</code>: Show account status</li>
              <li><code>-d username</code>: Delete password (disable login)</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Security Incidents</h3>
            <p className="text-red-700">Immediate account lockout for suspected security breaches or unauthorized access.</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Policy Violations</h3>
            <p className="text-yellow-700">Temporary suspension for violations of company policies or acceptable use guidelines.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Investigations</h3>
            <p className="text-purple-700">Account lock during security investigations or compliance audits.</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Account Management</h3>
            <p className="text-blue-700">Regular maintenance for inactive accounts or user departures.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Security Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Immediate Response:</strong> Lock accounts immediately upon security incidents</li>
            <li><strong>Documentation:</strong> Record all lock/unlock actions with reasons and timestamps</li>
            <li><strong>Notifications:</strong> Inform relevant parties of account status changes</li>
            <li><strong>Backup:</strong> Create backups before locking accounts to preserve data</li>
            <li><strong>Monitoring:</strong> Track account status and access attempts</li>
            <li><strong>Review:</strong> Regularly review locked accounts and their status</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-red-800">Monitoring and Maintenance</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Check Account Status</h3>
            <p className="text-gray-700">Use <code>passwd -S username</code> to view current account status and lock information.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">List Locked Accounts</h3>
            <p className="text-gray-700">Use <code>grep "LK" /etc/shadow</code> to find all locked accounts on the system.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Audit Trail</h3>
            <p className="text-gray-700">Maintain comprehensive logs of all account lock/unlock operations for compliance and security.</p>
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
    <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-red-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
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
