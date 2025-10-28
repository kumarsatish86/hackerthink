"use client";
import React, { useState } from 'react';

export function ChownGenerator() {
  const [ownerName, setOwnerName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [recursive, setRecursive] = useState(false);
  const [reference, setReference] = useState('');
  const [preserveRoot, setPreserveRoot] = useState(true);
  
  // Common Linux users and groups
  const commonUsers = ['root', 'admin', 'www-data', 'apache', 'nginx', 'ubuntu', 'ec2-user', 'jenkins'];
  const commonGroups = ['root', 'sudo', 'admin', 'wheel', 'www-data', 'apache', 'nginx', 'users', 'developers'];
  
  // Generate chown command
  const getChownCommand = () => {
    let command = 'chown';
    
    // Add options
    if (recursive) command += ' -R';
    if (preserveRoot) command += ' --preserve-root';
    if (reference) command += ` --reference=${reference}`;
    
    // If reference is provided, we don't need owner:group
    if (!reference) {
      // Add user and group
      if (ownerName && groupName) {
        command += ` ${ownerName}:${groupName}`;
      } else if (ownerName) {
        command += ` ${ownerName}`;
      } else if (groupName) {
        command += ` :${groupName}`;
      } else {
        command += ' [user][:group]';
      }
    }
    
    // Add filename placeholder
    command += ' filename.txt';
    
    return command;
  };
  
  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-teal-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#0d9488"/>
        </svg>
        Chown Command Generator
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-teal-700">Ownership</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium" htmlFor="owner">Owner</label>
              <div className="relative">
                <input
                  id="owner"
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., apache"
                  list="users-list"
                />
                <datalist id="users-list">
                  {commonUsers.map(user => (
                    <option key={user} value={user} />
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current owner</p>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium" htmlFor="group">Group</label>
              <div className="relative">
                <input
                  id="group"
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., www-data"
                  list="groups-list"
                />
                <datalist id="groups-list">
                  {commonGroups.map(group => (
                    <option key={group} value={group} />
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave blank to keep current group</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3 text-teal-700">Options</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                id="recursive"
                type="checkbox"
                checked={recursive}
                onChange={() => setRecursive(!recursive)}
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 mr-2"
              />
              <label htmlFor="recursive" className="text-sm">
                Recursive (-R)
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">Apply changes to all files and directories recursively</p>
            
            <div className="flex items-center">
              <input
                id="preserve-root"
                type="checkbox"
                checked={preserveRoot}
                onChange={() => setPreserveRoot(!preserveRoot)}
                className="h-4 w-4 rounded text-teal-600 focus:ring-teal-500 mr-2"
              />
              <label htmlFor="preserve-root" className="text-sm">
                Preserve Root (--preserve-root)
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-6">Fail to operate recursively on '/'</p>
            
            <div className="mt-3">
              <label className="block mb-1 text-sm font-medium" htmlFor="reference">Reference File (optional)</label>
              <input
                id="reference"
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="e.g., /path/to/reference"
              />
              <p className="text-xs text-gray-500 mt-1">Use this file's owner and group rather than specifying values</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-teal-50 p-6 rounded-lg shadow border border-teal-100">
        <h3 className="font-medium mb-2 text-teal-700">Generated Command</h3>
        <div className="bg-teal-800 text-white p-3 rounded-md font-mono text-lg overflow-x-auto">
          {getChownCommand()}
        </div>
      </div>
    </div>
  );
}

export function ChownInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">What is <code>chown</code>?</h2>
        <p className="text-gray-700 text-lg">
          <code>chown</code> (change owner) is a command-line utility in Unix and Linux systems used to change the owner and group of files and directories. This is an important aspect of file system security and access control.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Understanding File Ownership</h2>
        <p className="text-gray-700 text-lg mb-4">
          In Linux, every file and directory is assigned both an owner and a group. These assignments determine who can access and modify the file:
        </p>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li><b>User ownership</b>: The primary owner of the file</li>
          <li><b>Group ownership</b>: Members of the file's group may have special access</li>
        </ul>
        <div className="mt-6 bg-white p-4 rounded-lg border border-teal-200">
          <h3 className="font-semibold text-lg mb-2 text-teal-700">Viewing Ownership</h3>
          <p className="text-gray-700 mb-3">
            You can view file ownership with the <code>ls -l</code> command:
          </p>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            $ ls -l example.txt<br/>
            -rw-r--r-- 1 <b>user group</b> 1234 Jan 1 12:00 example.txt
          </div>
          <p className="text-gray-700 mt-2">
            The highlighted section shows "user" as the owner and "group" as the group.
          </p>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Chown Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2 text-teal-700">Basic Usage</h3>
            <ul className="space-y-3">
              <li className="flex flex-col">
                <code className="bg-gray-100 p-2 rounded font-mono mb-1">chown user file.txt</code>
                <span className="text-sm text-gray-600">Change owner to "user"</span>
              </li>
              <li className="flex flex-col">
                <code className="bg-gray-100 p-2 rounded font-mono mb-1">chown user:group file.txt</code>
                <span className="text-sm text-gray-600">Change owner to "user" and group to "group"</span>
              </li>
              <li className="flex flex-col">
                <code className="bg-gray-100 p-2 rounded font-mono mb-1">chown :group file.txt</code>
                <span className="text-sm text-gray-600">Change only the group to "group"</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-2 text-teal-700">Advanced Options</h3>
            <ul className="space-y-3">
              <li className="flex flex-col">
                <code className="bg-gray-100 p-2 rounded font-mono mb-1">chown -R user:group directory/</code>
                <span className="text-sm text-gray-600">Recursively change ownership</span>
              </li>
              <li className="flex flex-col">
                <code className="bg-gray-100 p-2 rounded font-mono mb-1">chown --reference=ref.txt file.txt</code>
                <span className="text-sm text-gray-600">Use ownership from ref.txt</span>
              </li>
              <li className="flex flex-col">
                <code className="bg-gray-100 p-2 rounded font-mono mb-1">chown --from=old_owner:old_group new_owner:new_group file.txt</code>
                <span className="text-sm text-gray-600">Only change if current ownership matches</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Only the <b>root user</b> or the <b>current owner</b> of the file can change its ownership</li>
          <li>Be very careful when using <code>chown -R</code> recursively, especially on system directories</li>
          <li>The <code>--preserve-root</code> option prevents accidentally changing ownership of the root directory</li>
          <li>For web applications, common ownership patterns include apache:apache, www-data:www-data, or nginx:nginx</li>
        </ul>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-teal-800">Related Commands</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li><code>chgrp</code> - Changes group ownership only</li>
          <li><code>chmod</code> - Changes file permissions</li>
          <li><code>id</code> - Shows current user and group IDs</li>
          <li><code>groups</code> - Shows which groups a user belongs to</li>
        </ul>
      </section>
    </>
  );
} 