"use client";
import React, { useState } from "react";

type WebServerType = "apache" | "nginx";
type FileType = "static" | "dynamic" | "config" | "log";
type ServerOS = "ubuntu" | "centos" | "other";

interface PermissionSettings {
  fileOwnership: string;
  directoryPerms: string;
  filePerms: string;
  configPerms: string;
  logPerms: string;
}

export function WebServerFilePermissionTool() {
  // Form states
  const [serverType, setServerType] = useState<WebServerType>("apache");
  const [serverOS, setServerOS] = useState<ServerOS>("ubuntu");
  const [webRoot, setWebRoot] = useState("/var/www/html");
  const [customUser, setCustomUser] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [showCommands, setShowCommands] = useState(false);

  // Get the appropriate user/group based on server type and OS
  const getWebServerUser = (): string => {
    if (customUser) return customUser;
    
    if (serverType === "apache") {
      if (serverOS === "ubuntu") return "www-data";
      if (serverOS === "centos") return "apache";
      return "apache";
    } else { // nginx
      if (serverOS === "ubuntu") return "www-data";
      if (serverOS === "centos") return "nginx";
      return "nginx";
    }
  };
  
  const getWebServerGroup = (): string => {
    if (customGroup) return customGroup;
    
    if (serverType === "apache") {
      if (serverOS === "ubuntu") return "www-data";
      if (serverOS === "centos") return "apache";
      return "apache";
    } else { // nginx
      if (serverOS === "ubuntu") return "www-data";
      if (serverOS === "centos") return "nginx";
      return "nginx";
    }
  };
  
  // Get permission settings based on server type
  const getPermissionSettings = (): PermissionSettings => {
    const user = getWebServerUser();
    const group = getWebServerGroup();
    
    return {
      fileOwnership: `${user}:${group}`,
      directoryPerms: "755", // drwxr-xr-x
      filePerms: "644", // -rw-r--r--
      configPerms: "640", // -rw-r-----
      logPerms: "660", // -rw-rw----
    };
  };
  
  const settings = getPermissionSettings();
  
  // Generate command to fix permissions
  const generateCommands = () => {
    const escapedWebRoot = webRoot.replace(/'/g, "\\'");
    const user = getWebServerUser();
    const group = getWebServerGroup();
    
    return {
      ownership: [
        `# Set ownership of all web files and directories`,
        `sudo chown -R ${user}:${group} '${escapedWebRoot}'`
      ],
      dirPermissions: [
        `# Set directory permissions (traversable but secure)`,
        `sudo find '${escapedWebRoot}' -type d -exec chmod 755 {} \\;`
      ],
      filePermissions: [
        `# Set file permissions (readable, writable by owner, readable by others)`,
        `sudo find '${escapedWebRoot}' -type f -exec chmod 644 {} \\;`
      ],
      configPermissions: [
        `# Set more restrictive permissions for configuration files`,
        `# For Apache`,
        `sudo find /etc/${serverType === "apache" ? "apache2" : "nginx"} -type f -exec chmod 640 {} \\;`,
        `# For sensitive config files (like those with passwords)`,
        `sudo find /etc/${serverType === "apache" ? "apache2" : "nginx"} -name "*.conf" -exec chmod 640 {} \\;`
      ],
      writeableDirectories: [
        `# Make specific directories writable by the web server (for uploads, cache, etc.)`,
        `# Replace 'uploads' with your actual writable directories`,
        `sudo mkdir -p '${escapedWebRoot}/uploads'`,
        `sudo chown -R ${user}:${group} '${escapedWebRoot}/uploads'`,
        `sudo chmod -R 775 '${escapedWebRoot}/uploads'`
      ],
      restartServer: [
        `# Restart the web server to apply changes`,
        `sudo systemctl restart ${serverType === "apache" ? "apache2" : "nginx"}`
      ]
    };
  };
  
  const commands = generateCommands();
  
  const handleGenerateCommands = () => {
    setShowCommands(true);
  };
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800 flex items-center gap-2">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <path d="M7 7H17M7 12H17M7 17H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Web Server File Permission Tool
      </h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-indigo-700">Configure Web Server Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Web Server Type</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="apache"
                  checked={serverType === "apache"}
                  onChange={() => setServerType("apache")}
                  className="text-indigo-600"
                />
                <span className="ml-2">Apache</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="nginx"
                  checked={serverType === "nginx"}
                  onChange={() => setServerType("nginx")}
                  className="text-indigo-600"
                />
                <span className="ml-2">Nginx</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-2">Server OS</label>
            <select
              value={serverOS}
              onChange={(e) => setServerOS(e.target.value as ServerOS)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ubuntu">Ubuntu/Debian</option>
              <option value="centos">CentOS/RHEL</option>
              <option value="other">Other Linux</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Web Root Directory</label>
          <input
            type="text"
            value={webRoot}
            onChange={(e) => setWebRoot(e.target.value)}
            placeholder="/var/www/html"
            className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-1">The main directory where your website files are stored</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Custom Web Server User (Optional)</label>
            <input
              type="text"
              value={customUser}
              onChange={(e) => setCustomUser(e.target.value)}
              placeholder={getWebServerUser()}
              className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty to use default ({getWebServerUser()})</p>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-2">Custom Web Server Group (Optional)</label>
            <input
              type="text"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              placeholder={getWebServerGroup()}
              className="w-full p-2 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty to use default ({getWebServerGroup()})</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerateCommands}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Generate Permission Commands
        </button>
      </div>
      
      {showCommands && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-indigo-700">Recommended Settings</h3>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded">
                <h4 className="font-medium text-indigo-700 mb-1">Ownership</h4>
                <p className="text-gray-700 font-mono">{settings.fileOwnership}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <h4 className="font-medium text-indigo-700 mb-1">Directory Permissions</h4>
                <p className="text-gray-700 font-mono">{settings.directoryPerms} (drwxr-xr-x)</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <h4 className="font-medium text-indigo-700 mb-1">Static File Permissions</h4>
                <p className="text-gray-700 font-mono">{settings.filePerms} (-rw-r--r--)</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded">
                <h4 className="font-medium text-indigo-700 mb-1">Config File Permissions</h4>
                <p className="text-gray-700 font-mono">{settings.configPerms} (-rw-r-----)</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-700">
                    These permissions provide a balance between security and functionality for most {serverType === "apache" ? "Apache" : "Nginx"} web servers.
                    Adjust as needed for your specific environment.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-3 text-indigo-700">Commands to Apply Permissions</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-indigo-700 mb-2">Set File Ownership</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.ownership.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-2">Set Directory Permissions</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.dirPermissions.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-2">Set File Permissions</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.filePermissions.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-2">Set Config Permissions</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.configPermissions.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-2">Setup Writable Directories</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.writeableDirectories.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-indigo-700 mb-2">Restart Web Server</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.restartServer.join("\n")}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WebServerFilePermissionToolInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Understanding Web Server Permissions</h2>
        <p className="text-gray-700 text-lg">
          Properly configured file and directory permissions are critical for web server security and functionality. 
          The web server needs to read files to serve them, but overly permissive settings can lead to security vulnerabilities.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Common Permission Patterns</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-indigo-200 rounded">
            <thead className="bg-indigo-100">
              <tr>
                <th className="p-2 border border-indigo-200 text-left">Item</th>
                <th className="p-2 border border-indigo-200 text-left">Numeric</th>
                <th className="p-2 border border-indigo-200 text-left">Symbolic</th>
                <th className="p-2 border border-indigo-200 text-left">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-200">
              <tr>
                <td className="p-2 border border-indigo-200 font-medium">Directories</td>
                <td className="p-2 border border-indigo-200 font-mono">755</td>
                <td className="p-2 border border-indigo-200 font-mono">drwxr-xr-x</td>
                <td className="p-2 border border-indigo-200">Owner can read/write/traverse, others can read/traverse</td>
              </tr>
              <tr className="bg-indigo-50">
                <td className="p-2 border border-indigo-200 font-medium">HTML/CSS/JS Files</td>
                <td className="p-2 border border-indigo-200 font-mono">644</td>
                <td className="p-2 border border-indigo-200 font-mono">-rw-r--r--</td>
                <td className="p-2 border border-indigo-200">Owner can read/write, others can read only</td>
              </tr>
              <tr>
                <td className="p-2 border border-indigo-200 font-medium">PHP/Scripts</td>
                <td className="p-2 border border-indigo-200 font-mono">644</td>
                <td className="p-2 border border-indigo-200 font-mono">-rw-r--r--</td>
                <td className="p-2 border border-indigo-200">Same as static files (executed by the web server)</td>
              </tr>
              <tr className="bg-indigo-50">
                <td className="p-2 border border-indigo-200 font-medium">Config Files</td>
                <td className="p-2 border border-indigo-200 font-mono">640</td>
                <td className="p-2 border border-indigo-200 font-mono">-rw-r-----</td>
                <td className="p-2 border border-indigo-200">Owner can read/write, group can read, others no access</td>
              </tr>
              <tr>
                <td className="p-2 border border-indigo-200 font-medium">Upload Directories</td>
                <td className="p-2 border border-indigo-200 font-mono">775</td>
                <td className="p-2 border border-indigo-200 font-mono">drwxrwxr-x</td>
                <td className="p-2 border border-indigo-200">Web server needs write access for uploads</td>
              </tr>
              <tr className="bg-indigo-50">
                <td className="p-2 border border-indigo-200 font-medium">Log Files</td>
                <td className="p-2 border border-indigo-200 font-mono">660</td>
                <td className="p-2 border border-indigo-200 font-mono">-rw-rw----</td>
                <td className="p-2 border border-indigo-200">Owner and group can read/write, others no access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Security Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Never set <code>777</code> (world-writable) permissions on web directories or files</li>
          <li>Make sure directory contents can't be listed without an index file</li>
          <li>Use <code>750</code> or stricter for sensitive configuration directories</li>
          <li>Apply the principle of least privilege - give only the minimum permissions necessary</li>
          <li>Regularly audit file permissions, especially after updates or installations</li>
          <li>Use suEXEC, php-fpm, or similar technologies to run scripts as specific users</li>
        </ul>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Web Server User Differences</h2>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-indigo-700 mb-2">Apache Users</h3>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>Ubuntu/Debian:</strong> www-data</li>
                <li><strong>CentOS/RHEL:</strong> apache</li>
                <li><strong>Arch Linux:</strong> http</li>
                <li><strong>FreeBSD:</strong> www</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-indigo-700 mb-2">Nginx Users</h3>
              <ul className="list-disc pl-6 text-gray-600">
                <li><strong>Ubuntu/Debian:</strong> www-data</li>
                <li><strong>CentOS/RHEL:</strong> nginx</li>
                <li><strong>Arch Linux:</strong> http</li>
                <li><strong>FreeBSD:</strong> www</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 