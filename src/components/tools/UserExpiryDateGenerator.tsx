"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-teal-900 to-cyan-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-teal-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-cyan-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-blue-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-teal-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-sm">
                <div className="bg-teal-700/80 text-white p-2 rounded">Current<br/>2024-12-31</div>
                <div className="bg-cyan-700/80 text-white p-2 rounded">Expiry<br/>2025-06-30</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Generate expiry dates</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserExpiryDateGenerator() {
  const [expiryData, setExpiryData] = useState({
    username: 'john.doe',
    currentDate: new Date().toISOString().split('T')[0],
    expiryType: 'duration',
    duration: { years: 0, months: 6, weeks: 0, days: 0 },
    specificDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    inactiveDays: 30,
    warningDays: 7,
    includeUsermod: true,
    includeChage: true,
    includeNotification: true
  });

  const [expiryInfo, setExpiryInfo] = useState<any>(null);

  const calculateExpiryDate = () => {
    const current = new Date(expiryData.currentDate);
    const expiry = new Date(current);
    expiry.setFullYear(expiry.getFullYear() + expiryData.duration.years);
    expiry.setMonth(expiry.getMonth() + expiryData.duration.months);
    expiry.setDate(expiry.getDate() + (expiryData.duration.weeks * 7) + expiryData.duration.days);
    return expiry;
  };

  const getExpiryDate = () => {
    if (expiryData.expiryType === 'duration') {
      return calculateExpiryDate();
    } else {
      return new Date(expiryData.specificDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysUntilExpiry = () => {
    const current = new Date(expiryData.currentDate);
    const expiry = getExpiryDate();
    const diffTime = expiry.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const generateUsermodCommand = () => {
    const expiryDate = getExpiryDate();
    const formattedDate = formatDate(expiryDate);
    let command = `usermod -e ${formattedDate}`;
    if (expiryData.inactiveDays > 0) {
      command += ` -f ${expiryData.inactiveDays}`;
    }
    command += ` ${expiryData.username}`;
    return command;
  };

  const generateChageCommand = () => {
    const expiryDate = getExpiryDate();
    const formattedDate = formatDate(expiryDate);
    let command = `chage -E ${formattedDate}`;
    if (expiryData.inactiveDays > 0) {
      command += ` -I ${expiryData.inactiveDays}`;
    }
    if (expiryData.warningDays > 0) {
      command += ` -W ${expiryData.warningDays}`;
    }
    command += ` ${expiryData.username}`;
    return command;
  };

  const generateNotificationScript = () => {
    const expiryDate = getExpiryDate();
    const formattedDate = formatDate(expiryDate);
    const daysUntilExpiry = getDaysUntilExpiry();
    
    return `#!/bin/bash
# User Expiry Notification Script
USERNAME="${expiryData.username}"
EXPIRY_DATE="${formattedDate}"
WARNING_DAYS=${expiryData.warningDays}
INACTIVE_DAYS=${expiryData.inactiveDays}

echo "User Account Expiry Management"
echo "Username: $USERNAME"
echo "Expiry Date: $EXPIRY_DATE"

if id "$USERNAME" &>/dev/null; then
    usermod -e $EXPIRY_DATE $USERNAME
    echo "✅ Expiry date set to $EXPIRY_DATE"
    
    if [ $INACTIVE_DAYS -gt 0 ]; then
        usermod -f $INACTIVE_DAYS $USERNAME
        echo "✅ Inactive days set to $INACTIVE_DAYS"
    fi
    
    if [ $WARNING_DAYS -gt 0 ]; then
        chage -W $WARNING_DAYS $USERNAME
        echo "✅ Warning days set to $WARNING_DAYS"
    fi
    
    echo "Account expiry settings applied successfully!"
else
    echo "❌ User $USERNAME does not exist"
    exit 1
fi`;
  };

  const generateAllCommands = () => {
    const expiryDate = getExpiryDate();
    const daysUntilExpiry = getDaysUntilExpiry();
    
    setExpiryInfo({
      expiryDate: formatDate(expiryDate),
      daysUntilExpiry,
      isExpired: daysUntilExpiry < 0,
      isExpiringSoon: daysUntilExpiry <= expiryData.warningDays && daysUntilExpiry > 0,
      status: daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry <= expiryData.warningDays ? 'Expiring Soon' : 'Active'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Command copied to clipboard!');
    });
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'temporary':
        setExpiryData(prev => ({
          ...prev,
          expiryType: 'duration',
          duration: { years: 0, months: 3, weeks: 0, days: 0 },
          inactiveDays: 7,
          warningDays: 3
        }));
        break;
      case 'contract':
        setExpiryData(prev => ({
          ...prev,
          expiryType: 'duration',
          duration: { years: 1, months: 0, weeks: 0, days: 0 },
          inactiveDays: 30,
          warningDays: 14
        }));
        break;
      case 'internship':
        setExpiryData(prev => ({
          ...prev,
          expiryType: 'duration',
          duration: { years: 0, months: 6, weeks: 0, days: 0 },
          inactiveDays: 14,
          warningDays: 7
        }));
        break;
      case 'project':
        setExpiryData(prev => ({
          ...prev,
          expiryType: 'duration',
          duration: { years: 0, months: 0, weeks: 8, days: 0 },
          inactiveDays: 7,
          warningDays: 3
        }));
        break;
    }
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-teal-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#0d9488" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        User Expiry Date Generator
      </h2>

      {/* Quick Presets */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-teal-800 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => applyPreset('temporary')} className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-blue-800">Temporary</div>
            <div className="text-sm text-blue-600">3 months, 7 days inactive</div>
          </button>
          <button onClick={() => applyPreset('contract')} className="bg-green-50 hover:bg-green-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-green-800">Contract</div>
            <div className="text-sm text-green-600">1 year, 30 days inactive</div>
          </button>
          <button onClick={() => applyPreset('internship')} className="bg-purple-50 hover:bg-purple-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-purple-800">Internship</div>
            <div className="text-sm text-purple-600">6 months, 14 days inactive</div>
          </button>
          <button onClick={() => applyPreset('project')} className="bg-orange-50 hover:bg-orange-100 p-3 rounded-lg text-left transition-colors">
            <div className="font-semibold text-orange-800">Project</div>
            <div className="text-sm text-orange-600">8 weeks, 7 days inactive</div>
          </button>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-teal-800 mb-4">Expiry Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
              <input type="text" value={expiryData.username} onChange={(e) => setExpiryData(prev => ({ ...prev, username: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="john.doe" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Date</label>
              <input type="date" value={expiryData.currentDate} onChange={(e) => setExpiryData(prev => ({ ...prev, currentDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Type</label>
              <select value={expiryData.expiryType} onChange={(e) => setExpiryData(prev => ({ ...prev, expiryType: e.target.value as 'duration' | 'specific' }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="duration">Duration from current date</option>
                <option value="specific">Specific date</option>
              </select>
            </div>
            
            {expiryData.expiryType === 'duration' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Years</label>
                    <input type="number" min="0" value={expiryData.duration.years} onChange={(e) => setExpiryData(prev => ({ ...prev, duration: { ...prev.duration, years: parseInt(e.target.value) || 0 } }))} className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Months</label>
                    <input type="number" min="0" max="11" value={expiryData.duration.months} onChange={(e) => setExpiryData(prev => ({ ...prev, duration: { ...prev.duration, months: parseInt(e.target.value) || 0 } }))} className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Weeks</label>
                    <input type="number" min="0" value={expiryData.duration.weeks} onChange={(e) => setExpiryData(prev => ({ ...prev, duration: { ...prev.duration, weeks: parseInt(e.target.value) || 0 } }))} className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Days</label>
                    <input type="number" min="0" value={expiryData.duration.days} onChange={(e) => setExpiryData(prev => ({ ...prev, duration: { ...prev.duration, days: parseInt(e.target.value) || 0 } }))} className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}
            
            {expiryData.expiryType === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Expiry Date</label>
                <input type="date" value={expiryData.specificDate} onChange={(e) => setExpiryData(prev => ({ ...prev, specificDate: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inactive Days (after expiry)</label>
              <input type="number" min="0" value={expiryData.inactiveDays} onChange={(e) => setExpiryData(prev => ({ ...prev, inactiveDays: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="30" />
              <p className="text-xs text-gray-500 mt-1">Days after expiry before account is locked</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Warning Days (before expiry)</label>
              <input type="number" min="0" value={expiryData.warningDays} onChange={(e) => setExpiryData(prev => ({ ...prev, warningDays: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="7" />
              <p className="text-xs text-gray-500 mt-1">Days before expiry to show warning</p>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Generate Commands</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" checked={expiryData.includeUsermod} onChange={(e) => setExpiryData(prev => ({ ...prev, includeUsermod: e.target.checked }))} className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">usermod command</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={expiryData.includeChage} onChange={(e) => setExpiryData(prev => ({ ...prev, includeChage: e.target.checked }))} className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">chage command</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={expiryData.includeNotification} onChange={(e) => setExpiryData(prev => ({ ...prev, includeNotification: e.target.checked }))} className="mr-2 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-sm text-gray-700">Notification script</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center mb-6">
        <button onClick={generateAllCommands} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
          🚀 Generate Commands & Scripts
        </button>
      </div>

      {/* Expiry Information */}
      {expiryInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-teal-800 mb-4">Expiry Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{expiryInfo.expiryDate}</div>
              <div className="text-sm text-gray-600">Expiry Date</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${expiryInfo.isExpired ? 'text-red-600' : expiryInfo.isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                {expiryInfo.daysUntilExpiry}
              </div>
              <div className="text-sm text-gray-600">Days Until Expiry</div>
            </div>
            
            <div className="text-center">
              <div className={`text-lg font-semibold px-3 py-1 rounded-full ${
                expiryInfo.status === 'Expired' ? 'bg-red-100 text-red-800' :
                expiryInfo.status === 'Expiring Soon' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {expiryInfo.status}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Summary:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Username: <code className="bg-gray-200 px-1 rounded">{expiryData.username}</code></li>
              <li>• Expiry Date: <code className="bg-gray-200 px-1 rounded">{expiryInfo.expiryDate}</code></li>
              <li>• Inactive Days: <code className="bg-gray-200 px-1 rounded">{expiryData.inactiveDays}</code> days after expiry</li>
              <li>• Warning Days: <code className="bg-gray-200 px-1 rounded">{expiryData.warningDays}</code> days before expiry</li>
            </ul>
          </div>
        </div>
      )}

      {/* Generated Commands */}
      <div className="space-y-4">
        {expiryData.includeUsermod && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-3">usermod Command:</h4>
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <code className="text-green-400 text-lg break-all">{generateUsermodCommand()}</code>
              <button onClick={() => copyToClipboard(generateUsermodCommand())} className="ml-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                📋 Copy
              </button>
            </div>
          </div>
        )}
        
        {expiryData.includeChage && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-3">chage Command:</h4>
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <code className="text-green-400 text-lg break-all">{generateChageCommand()}</code>
              <button onClick={() => copyToClipboard(generateChageCommand())} className="ml-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors">
                📋 Copy
              </button>
            </div>
          </div>
        )}
        
        {expiryData.includeNotification && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-3">Notification Script:</h4>
            <div className="bg-gray-800 p-4 rounded-lg">
              <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">{generateNotificationScript()}</pre>
              <div className="mt-4 text-center">
                <button onClick={() => copyToClipboard(generateNotificationScript())} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition-colors">
                  📋 Copy Script
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-semibold text-teal-800 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">💡</span>
          Quick Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Expiry Scenarios:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -e 2025-06-30 john</div>
                <div className="text-xs text-gray-500">Set expiry to specific date</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -e 2025-06-30 -f 7 john</div>
                <div className="text-xs text-gray-500">Set expiry + 7 days inactive</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chage -E 2025-06-30 -I 30 -W 7 john</div>
                <div className="text-xs text-gray-500">Set expiry + inactive + warning</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Best Practices:</h4>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Set appropriate inactive periods</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Use warning days for notifications</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Document expiry policies</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Regular expiry reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserExpiryDateInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">What is User Account Expiry?</h2>
        <p className="text-gray-700 text-lg">
          User account expiry is a security feature in Linux systems that automatically disables user accounts after a specified date. 
          This is essential for managing temporary users, contractors, interns, and ensuring that unused accounts don't become security risks.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Expiry Date (-e)</h3>
            <p className="text-teal-700">The date when the user account will be automatically disabled. After this date, the user cannot log in.</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Inactive Period (-f)</h3>
            <p className="text-teal-700">Number of days after expiry before the account is completely locked. This provides a grace period.</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Warning Days (-W)</h3>
            <p className="text-teal-700">Number of days before expiry when the user receives warnings about their account expiration.</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Account Status</h3>
            <p className="text-teal-700">The current state of the account: Active, Expiring Soon, Expired, or Locked.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Commands Used</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">usermod Command</h3>
            <p className="text-gray-700 mb-2">The <code>usermod</code> command modifies existing user accounts:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>-e YYYY-MM-DD</code>: Set account expiry date</li>
              <li><code>-f days</code>: Set inactive period after expiry</li>
              <li><code>-L</code>: Lock account immediately</li>
              <li><code>-U</code>: Unlock account</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">chage Command</h3>
            <p className="text-gray-700 mb-2">The <code>chage</code> command manages password aging and account expiry:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>-E YYYY-MM-DD</code>: Set account expiry date</li>
              <li><code>-I days</code>: Set inactive period after expiry</li>
              <li><code>-W days</code>: Set warning days before expiry</li>
              <li><code>-l username</code>: List current settings</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Temporary Employees</h3>
            <p className="text-blue-700">Set expiry dates for contractors, interns, or seasonal workers to automatically disable their accounts.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Project-Based Access</h3>
            <p className="text-green-700">Grant access for specific project durations with automatic account cleanup.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Security Compliance</h3>
            <p className="text-purple-700">Ensure accounts are automatically disabled to meet security policy requirements.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Resource Management</h3>
            <p className="text-orange-700">Prevent unused accounts from consuming system resources and licenses.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Security Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Regular Reviews:</strong> Periodically review and update expiry dates</li>
            <li><strong>Documentation:</strong> Maintain records of expiry policies and dates</li>
            <li><strong>Notifications:</strong> Set up automated notifications for expiring accounts</li>
            <li><strong>Grace Periods:</strong> Use appropriate inactive periods for different user types</li>
            <li><strong>Monitoring:</strong> Monitor account status and expiry compliance</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Monitoring and Maintenance</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Check Expiry Status</h3>
            <p className="text-gray-700">Use <code>chage -l username</code> to view current expiry settings for any user.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">List Expired Accounts</h3>
            <p className="text-gray-700">Use <code>chage -l username | grep "Account expires"</code> to check specific users.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-teal-800 mb-2">Automated Scripts</h3>
            <p className="text-gray-700">Create cron jobs to automatically check and report on expiring accounts.</p>
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
      <h2 className="text-2xl font-bold mb-6 text-teal-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
                ) : (
                  <span className="text-teal-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-teal-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-teal-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-300" />
        <button className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-teal-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
