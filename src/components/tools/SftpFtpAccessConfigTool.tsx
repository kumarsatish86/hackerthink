"use client";
import React, { useState } from "react";

type ServerType = "sftp" | "ftp" | "ftps";
type ServerOS = "ubuntu" | "centos" | "other";
type UserAccess = "dedicated" | "shared";

interface PermissionSettings {
  fileOwnership: string;
  directoryPerms: string;
  filePerms: string;
  homePerms: string;
}

export function SftpFtpAccessConfigTool() {
  // Form states
  const [serverType, setServerType] = useState<ServerType>("sftp");
  const [serverOS, setServerOS] = useState<ServerOS>("ubuntu");
  const [userHomeDir, setUserHomeDir] = useState("/home/ftpuser");
  const [uploadDir, setUploadDir] = useState("/uploads");
  const [userName, setUserName] = useState("ftpuser");
  const [userGroup, setUserGroup] = useState("ftpgroup");
  const [userAccessType, setUserAccessType] = useState<UserAccess>("dedicated");
  const [showCommands, setShowCommands] = useState(false);
  
  // Get permission settings based on server type
  const getPermissionSettings = (): PermissionSettings => {
    return {
      fileOwnership: `${userName}:${userGroup}`,
      directoryPerms: userAccessType === "dedicated" ? "750" : "770", // More restrictive for dedicated
      filePerms: userAccessType === "dedicated" ? "640" : "660", 
      homePerms: userAccessType === "dedicated" ? "750" : "750", // Home dir is similar
    };
  };
  
  const settings = getPermissionSettings();
  
  // Generate command to setup FTP/SFTP with proper permissions
  const generateCommands = () => {
    const escapedHomeDir = userHomeDir.replace(/'/g, "\\'");
    const escapedUploadDir = uploadDir.replace(/'/g, "\\'");
    const fullUploadPath = `${escapedHomeDir}${escapedUploadDir}`;
    
    return {
      createUser: [
        `# Create user group`,
        `sudo groupadd ${userGroup}`,
        ``,
        `# Create user with home directory`,
        `sudo useradd -m -d '${escapedHomeDir}' -g ${userGroup} ${userName}`,
        ``,
        `# Set password for the user (you'll be prompted to enter password)`,
        `sudo passwd ${userName}`
      ],
      setupDirs: [
        `# Create upload directory if it doesn't exist`,
        `sudo mkdir -p '${fullUploadPath}'`,
        ``,
        `# Set proper ownership`,
        `sudo chown -R ${userName}:${userGroup} '${escapedHomeDir}'`
      ],
      setPermissions: [
        `# Set home directory permissions`,
        `sudo chmod ${settings.homePerms} '${escapedHomeDir}'`,
        ``,
        `# Set directory permissions for all subdirectories`,
        `sudo find '${escapedHomeDir}' -type d -exec chmod ${settings.directoryPerms} {} \\;`,
        ``,
        `# Set file permissions`,
        `sudo find '${escapedHomeDir}' -type f -exec chmod ${settings.filePerms} {} \\;`
      ],
      setupChroot: [
        `# For SFTP with chroot jail (better security)`,
        ...(serverType === "sftp" ? [
          `# Edit SSH config file`,
          `sudo nano /etc/ssh/sshd_config`,
          ``,
          `# Add these lines at the end of the file:`,
          `# Match Group ${userGroup}`,
          `#     ChrootDirectory ${escapedHomeDir}`,
          `#     ForceCommand internal-sftp`,
          `#     AllowTcpForwarding no`,
          `#     X11Forwarding no`,
          ``,
          `# Restart SSH service`,
          `sudo systemctl restart sshd`
        ] : [`# Not applicable for FTP servers`])
      ],
      configureFTP: [
        `# Install and configure FTP server (${serverType === "ftps" ? "FTPS" : "FTP"})`,
        ...(serverType !== "sftp" ? [
          `# For ${serverOS === "ubuntu" ? "Ubuntu/Debian" : serverOS === "centos" ? "CentOS/RHEL" : "Linux"}:`,
          `sudo apt-get update && sudo apt-get install -y vsftpd`,
          ``,
          `# Edit vsftpd configuration`,
          `sudo nano /etc/vsftpd.conf`,
          ``,
          `# Important settings to add/modify:`,
          `# local_enable=YES`,
          `# write_enable=YES`,
          `# chroot_local_user=YES`,
          ...(serverType === "ftps" ? [
            `# ssl_enable=YES`,
            `# allow_anon_ssl=NO`,
            `# force_local_data_ssl=YES`,
            `# force_local_logins_ssl=YES`
          ] : []),
          ``,
          `# Restart FTP service`,
          `sudo systemctl restart vsftpd`
        ] : [`# Not applicable for SFTP servers`])
      ]
    };
  };
  
  const commands = generateCommands();
  
  const handleGenerateCommands = () => {
    setShowCommands(true);
  };
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10V14C5 16.2091 7.23858 18 10 18H14C16.7614 18 19 16.2091 19 14V10C19 7.79086 16.7614 6 14 6H10C7.23858 6 5 7.79086 5 10Z" stroke="currentColor" strokeWidth="2" />
          <path d="M7 10L12 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        SFTP/FTP File Access Config Tool
      </h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-700">Configure Server Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">Server Type</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="sftp"
                  checked={serverType === "sftp"}
                  onChange={() => setServerType("sftp")}
                  className="text-blue-600"
                />
                <span className="ml-2">SFTP (SSH)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="ftp"
                  checked={serverType === "ftp"}
                  onChange={() => setServerType("ftp")}
                  className="text-blue-600"
                />
                <span className="ml-2">FTP</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="ftps"
                  checked={serverType === "ftps"}
                  onChange={() => setServerType("ftps")}
                  className="text-blue-600"
                />
                <span className="ml-2">FTPS (Secure)</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-2">Server OS</label>
            <select
              value={serverOS}
              onChange={(e) => setServerOS(e.target.value as ServerOS)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ubuntu">Ubuntu/Debian</option>
              <option value="centos">CentOS/RHEL</option>
              <option value="other">Other Linux</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">User Home Directory</label>
          <input
            type="text"
            value={userHomeDir}
            onChange={(e) => setUserHomeDir(e.target.value)}
            placeholder="/home/ftpuser"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">Root directory for the FTP/SFTP user</p>
        </div>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">Upload Directory (relative to home)</label>
          <input
            type="text"
            value={uploadDir}
            onChange={(e) => setUploadDir(e.target.value)}
            placeholder="/uploads"
            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">Directory where uploads will be stored (will be created inside user's home)</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">FTP/SFTP Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="ftpuser"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block font-medium text-gray-700 mb-2">FTP/SFTP Group</label>
            <input
              type="text"
              value={userGroup}
              onChange={(e) => setUserGroup(e.target.value)}
              placeholder="ftpgroup"
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">User Access Type</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="dedicated"
                checked={userAccessType === "dedicated"}
                onChange={() => setUserAccessType("dedicated")}
                className="text-blue-600"
              />
              <span className="ml-2">Dedicated (single user)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="shared"
                checked={userAccessType === "shared"}
                onChange={() => setUserAccessType("shared")}
                className="text-blue-600"
              />
              <span className="ml-2">Shared (multiple users in group)</span>
            </label>
          </div>
        </div>
        
        <button
          onClick={handleGenerateCommands}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Generate Setup Commands
        </button>
      </div>
      
      {showCommands && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-700">Recommended Settings</h3>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-700 mb-1">Ownership</h4>
                <p className="text-gray-700 font-mono">{settings.fileOwnership}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-700 mb-1">Directory Permissions</h4>
                <p className="text-gray-700 font-mono">{settings.directoryPerms} ({settings.directoryPerms === "750" ? "rwxr-x---" : "rwxrwx---"})</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-700 mb-1">File Permissions</h4>
                <p className="text-gray-700 font-mono">{settings.filePerms} ({settings.filePerms === "640" ? "rw-r-----" : "rw-rw----"})</p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-700 mb-1">Home Directory Permissions</h4>
                <p className="text-gray-700 font-mono">{settings.homePerms} (rwxr-x---)</p>
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
                    {serverType === "sftp" 
                      ? "SFTP with chroot jail provides better security than standard FTP. The commands below will configure the system for secure file transfers."
                      : serverType === "ftps" 
                      ? "FTPS provides encryption for secure file transfers, but SFTP is generally preferred for its simpler configuration and better security."
                      : "Standard FTP is not encrypted. Consider using SFTP or FTPS for better security."
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-3 text-blue-700">Commands to Setup {serverType.toUpperCase()}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Create User and Group</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.createUser.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Setup Directories</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.setupDirs.join("\n")}
                  </pre>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">Set Permissions</h4>
                <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {commands.setPermissions.join("\n")}
                  </pre>
                </div>
              </div>
              
              {serverType === "sftp" && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Configure SFTP Chroot Jail</h4>
                  <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {commands.setupChroot.join("\n")}
                    </pre>
                  </div>
                </div>
              )}
              
              {serverType !== "sftp" && (
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">Configure FTP Server</h4>
                  <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {commands.configureFTP.join("\n")}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SftpFtpAccessConfigToolInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Understanding FTP/SFTP User Permissions</h2>
        <p className="text-gray-700 text-lg">
          Properly configured permissions are essential for secure FTP/SFTP access. Each protocol has different security
          characteristics, with SFTP (SSH File Transfer Protocol) generally offering better security through SSH encryption
          and easier chroot jail configuration.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Protocol Comparison</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-blue-200 rounded">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border border-blue-200 text-left">Feature</th>
                <th className="p-2 border border-blue-200 text-left">SFTP</th>
                <th className="p-2 border border-blue-200 text-left">FTPS</th>
                <th className="p-2 border border-blue-200 text-left">FTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200">
              <tr>
                <td className="p-2 border border-blue-200 font-medium">Encryption</td>
                <td className="p-2 border border-blue-200">Full (SSH)</td>
                <td className="p-2 border border-blue-200">Full (SSL/TLS)</td>
                <td className="p-2 border border-blue-200">None</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="p-2 border border-blue-200 font-medium">Default Port</td>
                <td className="p-2 border border-blue-200">22 (SSH)</td>
                <td className="p-2 border border-blue-200">990</td>
                <td className="p-2 border border-blue-200">21</td>
              </tr>
              <tr>
                <td className="p-2 border border-blue-200 font-medium">Firewall Friendly</td>
                <td className="p-2 border border-blue-200">Yes (single port)</td>
                <td className="p-2 border border-blue-200">No (multiple ports)</td>
                <td className="p-2 border border-blue-200">No (multiple ports)</td>
              </tr>
              <tr className="bg-blue-50">
                <td className="p-2 border border-blue-200 font-medium">Chroot Jail</td>
                <td className="p-2 border border-blue-200">Easy to configure</td>
                <td className="p-2 border border-blue-200">More complex</td>
                <td className="p-2 border border-blue-200">More complex</td>
              </tr>
              <tr>
                <td className="p-2 border border-blue-200 font-medium">Authentication</td>
                <td className="p-2 border border-blue-200">Password or Key-based</td>
                <td className="p-2 border border-blue-200">Password</td>
                <td className="p-2 border border-blue-200">Password (plaintext)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Security Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Use SFTP instead of FTP whenever possible (built-in encryption)</li>
          <li>Implement chroot jail to restrict users to their home directories</li>
          <li>Apply the principle of least privilege with restrictive permissions</li>
          <li>For SFTP, consider using key-based authentication instead of passwords</li>
          <li>Disable shell access for FTP/SFTP users if they only need file transfer</li>
          <li>Regularly audit user accounts and remove unused ones</li>
          <li>Use strong passwords and consider implementing account lockout policies</li>
          <li>Keep your FTP/SFTP server software updated</li>
        </ul>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Common Permission Issues</h2>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="font-medium text-blue-700 mb-2">Troubleshooting Permission Problems</h3>
          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>Cannot upload files:</strong> Check write permissions on upload directory (needs at least 755)</li>
            <li><strong>Cannot list directories:</strong> Directory needs read and execute permissions (at least 550)</li>
            <li><strong>SFTP chroot fails:</strong> Root of chroot must be owned by root and not writable by other users</li>
            <li><strong>Parent directory issues:</strong> Check permissions on all parent directories up to the root</li>
            <li><strong>SELinux blocking access:</strong> May need to set appropriate SELinux context labels</li>
          </ul>
        </div>
      </section>
    </>
  );
} 