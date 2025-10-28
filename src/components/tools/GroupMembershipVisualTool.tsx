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
          <div className="relative">
            <svg className="absolute top-0 right-0 w-full h-full text-white opacity-10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="grid grid-cols-2 gap-4 font-mono text-center text-sm">
                <div className="bg-blue-700/80 text-white p-2 rounded">Users<br/>john, jane<br/>admin</div>
                <div className="bg-indigo-700/80 text-white p-2 rounded">Groups<br/>sudo, dev<br/>admin</div>
              </div>
              <div className="mt-4 text-white text-xs text-center">Visualize relationships</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GroupMembershipVisualTool() {
  const [groupData, setGroupData] = useState({
    groups: [
      { name: 'sudo', gid: 27, users: ['john', 'admin', 'jane'] },
      { name: 'dev', gid: 1000, users: ['john', 'jane', 'bob'] },
      { name: 'admin', gid: 1001, users: ['admin', 'root'] },
      { name: 'users', gid: 100, users: ['john', 'jane', 'bob', 'alice'] }
    ],
    users: [
      { name: 'john', uid: 1000, primaryGroup: 'dev', groups: ['sudo', 'dev', 'users'] },
      { name: 'jane', uid: 1001, primaryGroup: 'dev', groups: ['sudo', 'dev', 'users'] },
      { name: 'bob', uid: 1002, primaryGroup: 'dev', groups: ['dev', 'users'] },
      { name: 'admin', uid: 1003, primaryGroup: 'admin', groups: ['sudo', 'admin'] },
      { name: 'alice', uid: 1004, primaryGroup: 'users', groups: ['users'] }
    ]
  });

  const [selectedView, setSelectedView] = useState<'groups' | 'users' | 'visual'>('visual');
  const [newGroup, setNewGroup] = useState({ name: '', gid: '' });
  const [newUser, setNewUser] = useState({ name: '', uid: '', primaryGroup: '' });
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  const addGroup = () => {
    if (newGroup.name && newGroup.gid) {
      const group = {
        name: newGroup.name,
        gid: parseInt(newGroup.gid),
        users: []
      };
      setGroupData(prev => ({
        ...prev,
        groups: [...prev.groups, group]
      }));
      setNewGroup({ name: '', gid: '' });
      setShowAddGroup(false);
    }
  };

  const addUser = () => {
    if (newUser.name && newUser.uid && newUser.primaryGroup) {
      const user = {
        name: newUser.name,
        uid: parseInt(newUser.uid),
        primaryGroup: newUser.primaryGroup,
        groups: [newUser.primaryGroup]
      };
      setGroupData(prev => ({
        ...prev,
        users: [...prev.users, user]
      }));
      
      // Add user to the primary group
      setGroupData(prev => ({
        ...prev,
        groups: prev.groups.map(g => 
          g.name === newUser.primaryGroup 
            ? { ...g, users: [...g.users, newUser.name] }
            : g
        )
      }));
      
      setNewUser({ name: '', uid: '', primaryGroup: '' });
      setShowAddUser(false);
    }
  };

  const addUserToGroup = (username: string, groupname: string) => {
    setGroupData(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.name === groupname 
          ? { ...g, users: g.users.includes(username) ? g.users : [...g.users, username] }
          : g
      ),
      users: prev.users.map(u => 
        u.name === username 
          ? { ...u, groups: u.groups.includes(groupname) ? u.groups : [...u.groups, groupname] }
          : u
      )
    }));
  };

  const removeUserFromGroup = (username: string, groupname: string) => {
    setGroupData(prev => ({
      ...prev,
      groups: prev.groups.map(g => 
        g.name === groupname 
          ? { ...g, users: g.users.filter(u => u !== username) }
          : g
      ),
      users: prev.users.map(u => 
        u.name === username 
          ? { ...u, groups: u.groups.filter(g => g !== groupname) }
          : u
      )
    }));
  };

  const deleteGroup = (groupname: string) => {
    if (confirm(`Are you sure you want to delete group '${groupname}'?`)) {
      setGroupData(prev => ({
        ...prev,
        groups: prev.groups.filter(g => g.name !== groupname),
        users: prev.users.map(u => ({
          ...u,
          groups: u.groups.filter(g => g !== groupname),
          primaryGroup: u.primaryGroup === groupname ? 'users' : u.primaryGroup
        }))
      }));
    }
  };

  const deleteUser = (username: string) => {
    if (confirm(`Are you sure you want to delete user '${username}'?`)) {
      setGroupData(prev => ({
        ...prev,
        users: prev.users.filter(u => u.name !== username),
        groups: prev.groups.map(g => ({
          ...g,
          users: g.users.filter(u => u !== username)
        }))
      }));
    }
  };

  const generateCommands = () => {
    let commands = '';
    
    // Group creation commands
    groupData.groups.forEach(group => {
      commands += `# Create group ${group.name}\n`;
      commands += `groupadd -g ${group.gid} ${group.name}\n\n`;
    });
    
    // User creation commands
    groupData.users.forEach(user => {
      commands += `# Create user ${user.name}\n`;
      commands += `useradd -u ${user.uid} -g ${user.primaryGroup} ${user.name}\n`;
      
      // Add user to additional groups
      user.groups.filter(g => g !== user.primaryGroup).forEach(group => {
        commands += `usermod -a -G ${group} ${user.name}\n`;
      });
      commands += '\n';
    });
    
    return commands;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Commands copied to clipboard!');
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#2563eb" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        Group Membership Visual Tool
      </h2>

      {/* View Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSelectedView('visual')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'visual'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎯 Visual View
          </button>
          <button
            onClick={() => setSelectedView('groups')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'groups'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👥 Groups
          </button>
          <button
            onClick={() => setSelectedView('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👤 Users
          </button>
        </div>

        {/* Visual View */}
        {selectedView === 'visual' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Groups Visualization */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Groups & Members</h3>
                <div className="space-y-3">
                  {groupData.groups.map(group => (
                    <div key={group.name} className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-700">{group.name} (GID: {group.gid})</h4>
                        <button
                          onClick={() => deleteGroup(group.name)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.users.map(user => (
                          <span
                            key={user}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                          >
                            {user}
                          </span>
                        ))}
                        {group.users.length === 0 && (
                          <span className="text-gray-500 text-sm italic">No members</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Users Visualization */}
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-indigo-800 mb-4">Users & Groups</h3>
                <div className="space-y-3">
                  {groupData.users.map(user => (
                    <div key={user.name} className="bg-white p-3 rounded-lg border border-indigo-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-indigo-700">{user.name} (UID: {user.uid})</h4>
                        <button
                          onClick={() => deleteUser(user.name)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">Primary: </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {user.primaryGroup}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.groups.map(group => (
                          <span
                            key={group}
                            className={`px-2 py-1 rounded text-sm ${
                              group === user.primaryGroup
                                ? 'bg-green-100 text-green-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Relationship Diagram */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Membership Relationships</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupData.groups.map(group => (
                  <div key={group.name} className="border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-center text-blue-700 mb-3">{group.name}</h4>
                    <div className="space-y-2">
                      {group.users.map(user => (
                        <div key={user} className="text-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                          <span className="text-sm text-gray-700">{user}</span>
                        </div>
                      ))}
                      {group.users.length === 0 && (
                        <div className="text-center text-gray-400 text-sm italic">Empty</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Groups View */}
        {selectedView === 'groups' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-blue-800">Manage Groups</h3>
              <button
                onClick={() => setShowAddGroup(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ➕ Add Group
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupData.groups.map(group => (
                <div key={group.name} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-blue-700">{group.name}</h4>
                    <button
                      onClick={() => deleteGroup(group.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">GID: {group.gid}</p>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Members:</label>
                    <div className="flex flex-wrap gap-2">
                      {group.users.map(user => (
                        <span
                          key={user}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          {user}
                          <button
                            onClick={() => removeUserFromGroup(user, group.name)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addUserToGroup(e.target.value, group.name);
                          e.target.value = '';
                        }
                      }}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Add user...</option>
                      {groupData.users
                        .filter(user => !group.users.includes(user.name))
                        .map(user => (
                          <option key={user.name} value={user.name}>
                            {user.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users View */}
        {selectedView === 'users' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-indigo-800">Manage Users</h3>
              <button
                onClick={() => setShowAddUser(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ➕ Add User
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupData.users.map(user => (
                <div key={user.name} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-indigo-700">{user.name}</h4>
                    <button
                      onClick={() => deleteUser(user.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">UID: {user.uid}</p>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Primary Group:</label>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {user.primaryGroup}
                    </span>
                    
                    <label className="block text-sm font-medium text-gray-700 mt-3">Additional Groups:</label>
                    <div className="flex flex-wrap gap-2">
                      {user.groups
                        .filter(group => group !== user.primaryGroup)
                        .map(group => (
                          <span
                            key={group}
                            className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {group}
                            <button
                              onClick={() => removeUserFromGroup(user.name, group)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      {user.groups.filter(group => group !== user.primaryGroup).length === 0 && (
                        <span className="text-gray-400 text-sm italic">None</span>
                      )}
                    </div>
                    
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addUserToGroup(user.name, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Add to group...</option>
                      {groupData.groups
                        .filter(group => !user.groups.includes(group.name))
                        .map(group => (
                          <option key={group.name} value={group.name}>
                            {group.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAddGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Add New Group</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="groupname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GID</label>
                <input
                  type="number"
                  value={newGroup.gid}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, gid: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addGroup}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Group
                </button>
                <button
                  onClick={() => setShowAddGroup(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Add New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UID</label>
                <input
                  type="number"
                  value={newUser.uid}
                  onChange={(e) => setNewUser(prev => ({ ...prev, uid: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Group</label>
                <select
                  value={newUser.primaryGroup}
                  onChange={(e) => setNewUser(prev => ({ ...prev, primaryGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select group...</option>
                  {groupData.groups.map(group => (
                    <option key={group.name} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addUser}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add User
                </button>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Commands */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Generated Commands</h3>
        <div className="bg-gray-900 p-4 rounded-lg">
          <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">{generateCommands()}</pre>
          <div className="mt-4 text-center">
            <button
              onClick={() => copyToClipboard(generateCommands())}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              📋 Copy Commands
            </button>
          </div>
        </div>
      </div>

      {/* Quick Examples */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
          <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3">💡</span>
          Quick Examples
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Common Group Commands:</h4>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">groupadd -g 1000 dev</div>
                <div className="text-xs text-gray-500">Create group with specific GID</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">usermod -a -G sudo john</div>
                <div className="text-xs text-gray-500">Add user to group</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">gpasswd -d john sudo</div>
                <div className="text-xs text-gray-500">Remove user from group</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Best Practices:</h4>
            <div className="space-y-2">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Use descriptive group names</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Assign appropriate GIDs</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Limit sudo group membership</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-green-700">• Regular group membership reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GroupMembershipInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">What is Group Membership Management?</h2>
        <p className="text-gray-700 text-lg">
          Group membership management in Linux systems controls user access to resources, permissions, and system capabilities. 
          Users can belong to multiple groups, with one primary group and additional supplementary groups. This system provides 
          flexible access control and security management.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Key Concepts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Primary Group</h3>
            <p className="text-blue-700">The main group assigned to a user. New files created by the user inherit this group ownership.</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h3 className="font-semibold text-indigo-800 mb-2">Supplementary Groups</h3>
            <p className="text-indigo-700">Additional groups that provide extra permissions and access rights beyond the primary group.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Group ID (GID)</h3>
            <p className="text-purple-700">Unique numeric identifier for each group, similar to UID for users.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Group Membership</h3>
            <p className="text-green-700">The relationship between users and groups, determining access rights and permissions.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Commands Used</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Group Management</h3>
            <p className="text-gray-700 mb-2">Commands for creating and managing groups:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>groupadd -g GID groupname</code>: Create new group with specific GID</li>
              <li><code>groupdel groupname</code>: Delete existing group</li>
              <li><code>groupmod -n newname oldname</code>: Rename group</li>
              <li><code>gpasswd -a username groupname</code>: Add user to group</li>
              <li><code>gpasswd -d username groupname</code>: Remove user from group</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">User Management</h3>
            <p className="text-gray-700 mb-2">Commands for managing user group memberships:</p>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>usermod -g groupname username</code>: Change primary group</li>
              <li><code>usermod -a -G groupname username</code>: Add to supplementary group</li>
              <li><code>usermod -G group1,group2 username</code>: Set all supplementary groups</li>
              <li><code>id username</code>: Display user's group memberships</li>
              <li><code>groups username</code>: List all groups for a user</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Access Control</h3>
            <p className="text-blue-700">Control access to files, directories, and system resources based on group membership.</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Privilege Management</h3>
            <p className="text-green-700">Grant administrative privileges (sudo) or specific system access to user groups.</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Project Teams</h3>
            <p className="text-purple-700">Organize users into project-specific groups for collaborative development.</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2">Security Policies</h3>
            <p className="text-orange-700">Implement security policies by grouping users with similar access requirements.</p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Security Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Principle of Least Privilege:</strong> Only grant necessary group memberships</li>
            <li><strong>Regular Reviews:</strong> Periodically audit group memberships and remove unnecessary access</li>
            <li><strong>Documentation:</strong> Maintain clear records of group purposes and membership criteria</li>
            <li><strong>Monitoring:</strong> Track changes to group memberships for security auditing</li>
            <li><strong>Separation of Duties:</strong> Avoid giving users conflicting group memberships</li>
            <li><strong>Default Groups:</strong> Use standard system groups when possible instead of creating custom ones</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Monitoring and Maintenance</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Check Group Memberships</h3>
            <p className="text-gray-700">Use <code>id username</code> to view all group memberships for a specific user.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">List Group Members</h3>
            <p className="text-gray-700">Use <code>getent group groupname</code> to see all members of a specific group.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Audit Trail</h3>
            <p className="text-gray-700">Monitor <code>/var/log/auth.log</code> for group membership changes and access attempts.</p>
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
      <h2 className="text-2xl font-bold mb-6 text-blue-800">Related Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayTools.map((tool) => (
          <a key={tool.id} href={`/tools/${tool.slug}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100 flex flex-col">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                {tool.icon ? (
                  <img src={getIconPath(tool.icon)} alt={tool.title} className="w-5 h-5" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '🔧';
                  }} />
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

export function SubscribeSection() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Stay Updated with Linux Concepts</h2>
      <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
        Get the latest Linux tips, tutorials, and tool updates delivered to your inbox. 
        Join our community of Linux enthusiasts and professionals.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
          Subscribe
        </button>
      </div>
      <p className="text-blue-200 text-sm mt-3">
        No spam, unsubscribe at any time. We respect your privacy.
      </p>
    </div>
  );
}
