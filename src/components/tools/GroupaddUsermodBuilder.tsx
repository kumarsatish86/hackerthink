"use client";
import React, { useState } from 'react';

export function HeroSection({ title, description }: { title: string, description: string }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-900 to-red-800 rounded-xl mb-10">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-orange-500 rounded-full"></div>
        <div className="absolute right-10 top-20 w-20 h-20 bg-red-500 rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-30 h-30 bg-pink-500 rounded-full"></div>
      </div>
      <div className="relative px-8 py-16 md:py-20 text-center md:text-left md:flex items-center">
        <div className="md:w-2/3 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-orange-100 text-lg md:text-xl max-w-2xl">{description}</p>
        </div>
        <div className="hidden md:block md:w-1/3">
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-sm">
                <div className="bg-orange-700/80 text-white p-2 rounded">groupadd<br/>-g 1001<br/>developers</div>
                <div className="bg-red-700/80 text-white p-2 rounded">usermod<br/>-a -G<br/>developers john</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Build commands</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GroupaddUsermodBuilder() {
  const [activeTab, setActiveTab] = useState<'groupadd' | 'usermod'>('groupadd');
  
  // Groupadd state
  const [groupaddData, setGroupaddData] = useState({
    groupName: 'developers',
    gid: '1001',
    force: false,
    system: false,
    password: false,
    chroot: '',
    prefix: '',
    extraUsers: ''
  });
  
  // Usermod state
  const [usermodData, setUsermodData] = useState({
    username: 'john',
    groups: ['developers'],
    newGroup: '',
    append: true,
    remove: false,
    primaryGroup: '',
    home: '',
    shell: '',
    uid: '',
    gid: '',
    comment: '',
    lock: false,
    unlock: false,
    expire: '',
    inactive: ''
  });

  // Generate groupadd command
  const generateGroupaddCommand = () => {
    let command = 'groupadd';
    
    if (groupaddData.gid && groupaddData.gid.trim()) {
      command += ` -g ${groupaddData.gid.trim()}`;
    }
    
    if (groupaddData.force) {
      command += ' -f';
    }
    
    if (groupaddData.system) {
      command += ' -r';
    }
    
    if (groupaddData.password) {
      command += ' -p';
    }
    
    if (groupaddData.chroot && groupaddData.chroot.trim()) {
      command += ` -R ${groupaddData.chroot.trim()}`;
    }
    
    if (groupaddData.prefix && groupaddData.prefix.trim()) {
      command += ` -P ${groupaddData.prefix.trim()}`;
    }
    
    command += ` ${groupaddData.groupName.trim()}`;
    
    if (groupaddData.extraUsers && groupaddData.extraUsers.trim()) {
      command += ` ${groupaddData.extraUsers.trim()}`;
    }
    
    return command;
  };

  // Generate usermod command
  const generateUsermodCommand = () => {
    let command = 'usermod';
    
    if (usermodData.groups.length > 0) {
      if (usermodData.append && !usermodData.remove) {
        command += ` -a -G ${usermodData.groups.join(',')}`;
      } else if (usermodData.remove) {
        command += ` -G ${usermodData.groups.join(',')}`;
      } else {
        command += ` -G ${usermodData.groups.join(',')}`;
      }
    }
    
    if (usermodData.primaryGroup && usermodData.primaryGroup.trim()) {
      command += ` -g ${usermodData.primaryGroup.trim()}`;
    }
    
    if (usermodData.home && usermodData.home.trim()) {
      command += ` -d ${usermodData.home.trim()}`;
    }
    
    if (usermodData.shell && usermodData.shell.trim()) {
      command += ` -s ${usermodData.shell.trim()}`;
    }
    
    if (usermodData.uid && usermodData.uid.trim()) {
      command += ` -u ${usermodData.uid.trim()}`;
    }
    
    if (usermodData.gid && usermodData.gid.trim()) {
      command += ` -g ${usermodData.gid.trim()}`;
    }
    
    if (usermodData.comment && usermodData.comment.trim()) {
      command += ` -c "${usermodData.comment.trim()}"`;
    }
    
    if (usermodData.lock) {
      command += ' -L';
    }
    
    if (usermodData.unlock) {
      command += ' -U';
    }
    
    if (usermodData.expire && usermodData.expire.trim()) {
      command += ` -e ${usermodData.expire.trim()}`;
    }
    
    if (usermodData.inactive && usermodData.inactive.trim()) {
      command += ` -f ${usermodData.inactive.trim()}`;
    }
    
    command += ` ${usermodData.username.trim()}`;
    
    return command;
  };

  // Add group to usermod
  const addGroup = () => {
    if (usermodData.newGroup.trim() && !usermodData.groups.includes(usermodData.newGroup.trim())) {
      setUsermodData(prev => ({
        ...prev,
        groups: [...prev.groups, usermodData.newGroup.trim()],
        newGroup: ''
      }));
    }
  };

  // Remove group from usermod
  const removeGroup = (groupToRemove: string) => {
    setUsermodData(prev => ({
      ...prev,
      groups: prev.groups.filter(group => group !== groupToRemove)
    }));
  };

  // Copy command to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      alert('Command copied to clipboard!');
    });
  };

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-orange-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#ea580c" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Group & User Management Command Builder
      </h2>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('groupadd')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'groupadd'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          📁 Groupadd Command
        </button>
        <button
          onClick={() => setActiveTab('usermod')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'usermod'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          👤 Usermod Command
        </button>
      </div>

      {/* Groupadd Tab */}
      {activeTab === 'groupadd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 p-2 rounded-lg mr-3">📁</span>
              Group Creation Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input 
                    type="text" 
                    value={groupaddData.groupName}
                    onChange={(e) => setGroupaddData(prev => ({ ...prev, groupName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="developers"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group ID (GID)
                  </label>
                  <input 
                    type="text" 
                    value={groupaddData.gid}
                    onChange={(e) => setGroupaddData(prev => ({ ...prev, gid: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="1001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chroot Directory
                  </label>
                  <input 
                    type="text" 
                    value={groupaddData.chroot}
                    onChange={(e) => setGroupaddData(prev => ({ ...prev, chroot: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="/chroot"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prefix
                  </label>
                  <input 
                    type="text" 
                    value={groupaddData.prefix}
                    onChange={(e) => setGroupaddData(prev => ({ ...prev, prefix: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="sys_"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Users
                  </label>
                  <input 
                    type="text" 
                    value={groupaddData.extraUsers}
                    onChange={(e) => setGroupaddData(prev => ({ ...prev, extraUsers: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="user1 user2"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={groupaddData.force}
                      onChange={(e) => setGroupaddData(prev => ({ ...prev, force: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Force creation (-f)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={groupaddData.system}
                      onChange={(e) => setGroupaddData(prev => ({ ...prev, system: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">System group (-r)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={groupaddData.password}
                      onChange={(e) => setGroupaddData(prev => ({ ...prev, password: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Set password (-p)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Generated Command */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-3">Generated Command:</h4>
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <code className="text-green-400 text-lg break-all">{generateGroupaddCommand()}</code>
              <button
                onClick={() => copyToClipboard(generateGroupaddCommand())}
                className="ml-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usermod Tab */}
      {activeTab === 'usermod' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
              <span className="bg-orange-100 text-orange-800 p-2 rounded-lg mr-3">👤</span>
              User Modification Options
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username *
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.username}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="john"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Group
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.primaryGroup}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, primaryGroup: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="developers"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Home Directory
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.home}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, home: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="/home/john"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shell
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.shell}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, shell: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="/bin/bash"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID (UID)
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.uid}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, uid: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="1001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group ID (GID)
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.gid}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, gid: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="1001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <input 
                    type="text" 
                    value={usermodData.comment}
                    onChange={(e) => setUsermodData(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Developer"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={usermodData.append}
                      onChange={(e) => setUsermodData(prev => ({ ...prev, append: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Append to groups (-a)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={usermodData.lock}
                      onChange={(e) => setUsermodData(prev => ({ ...prev, lock: e.target.checked, unlock: false }))}
                      className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Lock account (-L)</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={usermodData.unlock}
                      onChange={(e) => setUsermodData(prev => ({ ...prev, unlock: e.target.checked, lock: false }))}
                      className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-700">Unlock account (-U)</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Group Management */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">Group Management</h4>
              
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  value={usermodData.newGroup}
                  onChange={(e) => setUsermodData(prev => ({ ...prev, newGroup: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Add new group"
                  onKeyPress={(e) => e.key === 'Enter' && addGroup()}
                />
                <button
                  onClick={addGroup}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {usermodData.groups.map((group, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                  >
                    {group}
                    <button
                      onClick={() => removeGroup(group)}
                      className="text-orange-600 hover:text-orange-800 text-lg font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Generated Command */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h4 className="text-white font-semibold mb-3">Generated Command:</h4>
            <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
              <code className="text-green-400 text-lg break-all">{generateUsermodCommand()}</code>
              <button
                onClick={() => copyToClipboard(generateUsermodCommand())}
                className="ml-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                📋 Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">💡</span>
          Quick Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Groupadd Commands:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">groupadd developers</div>
                <div className="text-xs text-gray-500">Create basic group</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">groupadd -g 1001 developers</div>
                <div className="text-xs text-gray-500">Create group with specific GID</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">groupadd -r systemgroup</div>
                <div className="text-xs text-gray-500">Create system group</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Usermod Commands:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -a -G developers john</div>
                <div className="text-xs text-gray-500">Add user to group</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -s /bin/bash john</div>
                <div className="text-xs text-gray-500">Change user shell</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -L john</div>
                <div className="text-xs text-gray-500">Lock user account</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GroupaddUsermodInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">What are <code>groupadd</code> and <code>usermod</code>?</h2>
        <p className="text-gray-700 text-lg">
          <code>groupadd</code> and <code>usermod</code> are essential Linux system administration commands for managing user groups and modifying user accounts. 
          These commands help administrators maintain proper access control and user organization on Linux systems.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Groupadd Command</h2>
        <p className="text-gray-700 text-lg mb-4">
          The <code>groupadd</code> command creates new user groups on the system. Groups are used to organize users and manage permissions collectively.
        </p>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">Common Options:</h3>
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><code>-g GID</code>: Specify the group ID number</li>
            <li><code>-f</code>: Force creation, exit with success if group exists</li>
            <li><code>-r</code>: Create a system group</li>
            <li><code>-p</code>: Set encrypted password for the group</li>
            <li><code>-R CHROOT_DIR</code>: Apply changes in CHROOT_DIR</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Usermod Command</h2>
        <p className="text-gray-700 text-lg mb-4">
          The <code>usermod</code> command modifies existing user accounts, allowing administrators to change user properties, group memberships, and account settings.
        </p>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 mb-2">Common Options:</h3>
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><code>-a -G groups</code>: Append user to additional groups</li>
            <li><code>-g group</code>: Change primary group</li>
            <li><code>-d home</code>: Change home directory</li>
            <li><code>-s shell</code>: Change login shell</li>
            <li><code>-L</code>: Lock user account</li>
            <li><code>-U</code>: Unlock user account</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">✅ Do's</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Use descriptive group names</li>
              <li>Assign appropriate GIDs</li>
              <li>Use -a flag when adding to groups</li>
              <li>Test commands on non-production systems</li>
              <li>Document group purposes</li>
            </ul>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">❌ Don'ts</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li>Use system GIDs for user groups</li>
              <li>Remove users from primary groups</li>
              <li>Use overly broad permissions</li>
              <li>Forget to update group memberships</li>
              <li>Use non-standard group names</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Security Considerations</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Principle of Least Privilege:</strong> Only grant necessary group memberships</li>
            <li><strong>Regular Audits:</strong> Review group memberships periodically</li>
            <li><strong>Group Naming:</strong> Use clear, descriptive names for groups</li>
            <li><strong>Documentation:</strong> Maintain records of group purposes and members</li>
            <li><strong>Access Control:</strong> Use groups to manage file and directory permissions</li>
          </ul>
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
      <h2 className="text-2xl font-bold mb-6 text-orange-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a 
            key={tool.id} 
            href={`/tools/${tool.slug}`}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
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
                  <span className="text-orange-800 text-lg">🔧</span>
                )}
              </div>
              <h3 className="font-semibold text-lg">{tool.title}</h3>
            </div>
            <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 text-orange-600 text-sm font-medium">
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
    <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-orange-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
