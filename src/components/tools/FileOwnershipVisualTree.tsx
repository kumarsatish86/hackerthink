"use client";
import React, { useState, useEffect } from 'react';

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
              <path d="M10 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl border border-white/20 w-64">
              <div className="text-white text-center">
                <div className="text-2xl mb-2">📁</div>
                <div className="text-sm font-semibold">File Tree</div>
                <div className="text-xs opacity-75">Visualize ownership</div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>👤 user</span>
                    <span>👥 group</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>📄 file</span>
                    <span>📁 dir</span>
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

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  owner: string;
  group: string;
  permissions: string;
  children?: FileNode[];
  expanded?: boolean;
}

export function FileOwnershipVisualTree() {
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      id: '1',
      name: '/home',
      type: 'directory',
      owner: 'root',
      group: 'root',
      permissions: '755',
      expanded: true,
      children: [
        {
          id: '2',
          name: 'user1',
          type: 'directory',
          owner: 'user1',
          group: 'user1',
          permissions: '755',
          expanded: true,
          children: [
            {
              id: '3',
              name: 'Documents',
              type: 'directory',
              owner: 'user1',
              group: 'user1',
              permissions: '755',
              expanded: false,
              children: [
                {
                  id: '4',
                  name: 'report.txt',
                  type: 'file',
                  owner: 'user1',
                  group: 'user1',
                  permissions: '644'
                }
              ]
            },
            {
              id: '5',
              name: 'script.sh',
              type: 'file',
              owner: 'user1',
              group: 'user1',
              permissions: '755'
            }
          ]
        }
      ]
    }
  ]);

  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'users' | 'groups'>('tree');

  const toggleNode = (nodeId: string) => {
    setFileTree(prevTree => {
      const updateNode = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, expanded: !node.expanded };
          }
          if (node.children) {
            return { ...node, children: updateNode(node.children) };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
  };

  const renderTreeNode = (node: FileNode, level: number = 0) => {
    const isExpanded = node.expanded;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedNode?.id === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          onClick={() => setSelectedNode(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="w-5 h-5 mr-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-5 h-5 mr-2"></div>}

          <span className="mr-2 text-lg">
            {node.type === 'directory' ? '📁' : '📄'}
          </span>

          <span className="flex-1 font-medium text-gray-900">{node.name}</span>

          <span className="mr-3 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
            👤 {node.owner}
          </span>

          <span className="mr-3 text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
            👥 {node.group}
          </span>

          <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded font-mono">
            {node.permissions}
          </span>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4 border-l-2 border-gray-200">
            {node.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-green-800 flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path fill="#059669" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        File Ownership Visual Tree
      </h2>

      {/* View Mode Tabs */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'tree'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌳 Tree View
          </button>
          <button
            onClick={() => setViewMode('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👤 Users View
          </button>
          <button
            onClick={() => setViewMode('groups')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'groups'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👥 Groups View
          </button>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[400px] bg-gray-50 rounded-lg p-4">
          {viewMode === 'tree' && (
            <div className="space-y-1">
              {fileTree.map(node => renderTreeNode(node))}
            </div>
          )}
          {viewMode === 'users' && (
            <div className="text-center text-gray-500 py-8">
              Users view - showing files grouped by owner
            </div>
          )}
          {viewMode === 'groups' && (
            <div className="text-center text-gray-500 py-8">
              Groups view - showing files grouped by group
            </div>
          )}
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
            <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">📋</span>
            Node Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">File Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{selectedNode.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{selectedNode.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium text-blue-600">{selectedNode.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Group:</span>
                  <span className="font-medium text-green-600">{selectedNode.group}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="font-medium font-mono text-purple-600">{selectedNode.permissions}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Generated Commands</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="mb-2"># Change ownership</div>
                <div>sudo chown {selectedNode.owner}:{selectedNode.group} "{selectedNode.name}"</div>
                <div className="mb-2 mt-3"># Change permissions</div>
                <div>sudo chmod {selectedNode.permissions} "{selectedNode.name}"</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function FileOwnershipVisualTreeInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">What is File Ownership?</h2>
        <p className="text-gray-700 text-lg">
          File ownership in Linux determines who can access, modify, and control files and directories. 
          Every file has an owner (user) and a group, along with specific permissions that control what 
          operations can be performed. Understanding file ownership is crucial for system security and 
          proper access management.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Ownership Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">👤 User Owner</h3>
            <p className="text-gray-700 text-sm">
              The user who created the file or had ownership transferred to them. 
              The owner has full control over the file and can modify permissions.
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">👥 Group Owner</h3>
            <p className="text-gray-700 text-sm">
              A collection of users who share certain access rights. Group members 
              can access files based on group permissions.
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">🔒 Permissions</h3>
            <p className="text-gray-700 text-sm">
              Three sets of permissions: owner, group, and others. Each set controls 
              read, write, and execute access.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Permission System</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <div className="font-semibold text-blue-800">Owner</div>
              <div className="text-sm text-blue-600">User permissions</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="font-semibold text-green-800">Group</div>
              <div className="text-sm text-green-600">Group permissions</div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <div className="font-semibold text-purple-800">Others</div>
              <div className="text-sm text-purple-600">World permissions</div>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <div className="font-semibold text-orange-800">Special</div>
              <div className="text-sm text-orange-600">SetUID/SetGID/Sticky</div>
            </div>
          </div>
          <p className="text-gray-700 text-center">
            <strong>Format:</strong> rwx rwx rwx (read, write, execute for each category)
          </p>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Common Permission Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">File Permissions</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>644</code> - Owner read/write, group/others read (default files)</li>
              <li><code>600</code> - Owner read/write only (private files)</li>
              <li><code>664</code> - Owner/group read/write, others read (shared files)</li>
              <li><code>666</code> - Everyone read/write (world-writable)</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Directory Permissions</h3>
            <ul className="list-disc pl-6 text-gray-700 text-sm">
              <li><code>755</code> - Owner full access, group/others read/execute (default dirs)</li>
              <li><code>750</code> - Owner full access, group read/execute, others none</li>
              <li><code>700</code> - Owner full access only (private directories)</li>
              <li><code>777</code> - Everyone full access (world-writable)</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Ownership Management Commands</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">chown - Change Ownership</h3>
            <div className="space-y-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chown user:group file</div>
                <div className="text-xs text-gray-500">Change both user and group ownership</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chown -R user:group directory</div>
                <div className="text-xs text-gray-500">Recursively change ownership</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chown user file</div>
                <div className="text-xs text-gray-500">Change only user ownership</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">chgrp - Change Group</h3>
            <div className="space-y-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chgrp group file</div>
                <div className="text-xs text-gray-500">Change group ownership</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chgrp -R group directory</div>
                <div className="text-xs text-gray-500">Recursively change group</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">chmod - Change Permissions</h3>
            <div className="space-y-2">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chmod 755 file</div>
                <div className="text-xs text-gray-500">Set numeric permissions</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chmod u+rwx,g+rx,o+rx file</div>
                <div className="text-xs text-gray-500">Set symbolic permissions</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="font-mono text-sm text-gray-700">chmod -R 755 directory</div>
                <div className="text-xs text-gray-500">Recursively set permissions</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Best Practices</h2>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <ul className="list-disc pl-6 text-gray-700 text-lg">
            <li><strong>Principle of Least Privilege:</strong> Give users only the access they need</li>
            <li><strong>Use Groups:</strong> Assign permissions to groups rather than individual users</li>
            <li><strong>Regular Audits:</strong> Periodically review file ownership and permissions</li>
            <li><strong>Secure Defaults:</strong> Use restrictive default permissions (644 for files, 755 for dirs)</li>
            <li><strong>Document Changes:</strong> Keep records of ownership and permission changes</li>
            <li><strong>Test Access:</strong> Verify permissions work as expected after changes</li>
            <li><strong>Backup Before Changes:</strong> Always backup before making ownership changes</li>
            <li><strong>Use sudo:</strong> Use elevated privileges only when necessary</li>
          </ul>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Security Considerations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">Security Risks</h3>
            <ul className="list-disc pl-6 text-red-700 text-sm">
              <li>World-writable files (666, 777)</li>
              <li>SetUID/SetGID binaries with weak permissions</li>
              <li>Files owned by root with weak permissions</li>
              <li>Inherited permissions from parent directories</li>
              <li>Sticky bit on world-writable directories</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Security Measures</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm">
              <li>Regular permission audits</li>
              <li>Use of access control lists (ACLs)</li>
              <li>Implementation of mandatory access control</li>
              <li>File integrity monitoring</li>
              <li>Principle of least privilege</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-green-800">Troubleshooting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Common Issues</h3>
            <ul className="list-disc pl-6 text-blue-700 text-sm">
              <li>"Permission denied" errors</li>
              <li>Files not accessible after ownership change</li>
              <li>Group membership not working</li>
              <li>Inherited permissions problems</li>
              <li>SetUID/SetGID not functioning</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Debugging Commands</h3>
            <ul className="list-disc pl-6 text-green-700 text-sm">
              <li><code>ls -la</code> - View detailed permissions</li>
              <li><code>stat file</code> - View file status</li>
              <li><code>id username</code> - Check user/group info</li>
              <li><code>groups username</code> - List user groups</li>
              <li><code>getfacl file</code> - View ACLs</li>
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