"use client";
import React, { useState } from "react";

type PermissionIssueType = "container-cant-write" | "host-cant-access" | "custom";

interface PermissionSolution {
  description: string;
  dockerRunCommand?: string;
  hostCommands?: string[];
  containerCommands?: string[];
  dockerfile?: string;
}

export function DockerVolumePermissionHelper() {
  const [hostUserId, setHostUserId] = useState("");
  const [hostGroupId, setHostGroupId] = useState("");
  const [containerUserId, setContainerUserId] = useState("");
  const [containerGroupId, setContainerGroupId] = useState("");
  const [volumePath, setVolumePath] = useState("/data");
  const [hostPath, setHostPath] = useState("/home/user/data");
  const [issueType, setIssueType] = useState<PermissionIssueType>("container-cant-write");
  const [showSolution, setShowSolution] = useState(false);

  const handleGenerateSolution = () => {
    setShowSolution(true);
  };

  const getSolution = (): PermissionSolution => {
    const huid = hostUserId || "1000";
    const hgid = hostGroupId || "1000";
    const cuid = containerUserId || "root";
    const cgid = containerGroupId || "root";
    
    // Common variables for commands
    const hostPathEscaped = hostPath.replace(/'/g, "\\'");
    
    switch(issueType) {
      case "container-cant-write":
        return {
          description: "To allow the container to write to the volume, you need to either match the container's user ID with the host's owner of the directory, or adjust the permissions on the host.",
          hostCommands: [
            `# Option 1: Change ownership of the host directory to match container's user`,
            `sudo chown -R ${cuid}:${cgid} '${hostPathEscaped}'`,
            ``,
            `# Option 2: Make the directory writable by all users (less secure)`,
            `sudo chmod -R a+rw '${hostPathEscaped}'`
          ],
          dockerRunCommand: `# Option 3: Run the container with the host's user ID`,
          containerCommands: [
            `# Option 4: Add a command to your container startup to set permissions`,
            `chown -R ${cuid}:${cgid} ${volumePath}`
          ],
          dockerfile: `# Option 5: In your Dockerfile, set the user to match host user\nUSER ${huid}:${hgid}`
        };
        
      case "host-cant-access":
        return {
          description: "Files created by the container might be owned by the container's user ID, which doesn't exist on the host system. Here's how to fix it:",
          hostCommands: [
            `# Take ownership back on the host`,
            `sudo chown -R ${huid}:${hgid} '${hostPathEscaped}'`
          ],
          dockerRunCommand: `# Run the container with the host's user ID\ndocker run -v ${hostPath}:${volumePath} -u ${huid}:${hgid} your-image`,
          dockerfile: `# In your Dockerfile, create a user that matches the host user\nRUN groupadd -g ${hgid} hostgroup && useradd -u ${huid} -g hostgroup hostuser\nUSER ${huid}:${hgid}`
        };
        
      case "custom":
      default:
        return {
          description: "Based on your provided IDs, here are ways to resolve permission conflicts between the host and container:",
          hostCommands: [
            `# On host: Change ownership to container's user ID`,
            `sudo chown -R ${cuid}:${cgid} '${hostPathEscaped}'`,
            ``,
            `# On host: Make the directory accessible to both systems`,
            `sudo chmod -R 777 '${hostPathEscaped}' # Warning: Insecure for production`
          ],
          dockerRunCommand: `# Run with specific user mapping\ndocker run -v ${hostPath}:${volumePath} -u ${huid}:${hgid} your-image`,
          containerCommands: [
            `# Inside container: Adjust ownership`,
            `chown -R ${cuid}:${cgid} ${volumePath}`
          ],
          dockerfile: `# Dockerfile: Create matching users\nRUN groupadd -g ${hgid} hostgroup && useradd -u ${huid} -g hostgroup hostuser`
        };
    }
  };

  const solution = getSolution();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-800 flex items-center gap-2">
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 9.5V7H3v2.5M21 14.5V12H3v2.5M3 17L3 19H21V17" />
          <rect x="9" y="10" width="6" height="4" rx="1" />
          <circle cx="12" cy="15" r="1" />
        </svg>
        Docker Volume Permission Helper
      </h2>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-cyan-700">Identify Your Permission Issue</h3>
        
        <div className="mb-6">
          <label className="block font-medium text-gray-700 mb-2">What type of issue are you having?</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="container-cant-write"
                checked={issueType === "container-cant-write"}
                onChange={() => setIssueType("container-cant-write")}
                className="text-cyan-600 mr-2"
              />
              <span>Container can't write to mounted volume</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="host-cant-access"
                checked={issueType === "host-cant-access"}
                onChange={() => setIssueType("host-cant-access")}
                className="text-cyan-600 mr-2"
              />
              <span>Host can't access files created by container</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="custom"
                checked={issueType === "custom"}
                onChange={() => setIssueType("custom")}
                className="text-cyan-600 mr-2"
              />
              <span>Custom scenario (specify user/group IDs below)</span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-cyan-700 mb-3">Host System</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host User ID</label>
                <input
                  type="text"
                  value={hostUserId}
                  onChange={(e) => setHostUserId(e.target.value)}
                  placeholder="1000"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Group ID</label>
                <input
                  type="text"
                  value={hostGroupId}
                  onChange={(e) => setHostGroupId(e.target.value)}
                  placeholder="1000"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Host Path</label>
                <input
                  type="text"
                  value={hostPath}
                  onChange={(e) => setHostPath(e.target.value)}
                  placeholder="/home/user/data"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-cyan-700 mb-3">Container</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container User ID</label>
                <input
                  type="text"
                  value={containerUserId}
                  onChange={(e) => setContainerUserId(e.target.value)}
                  placeholder="root or numeric ID"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Container Group ID</label>
                <input
                  type="text"
                  value={containerGroupId}
                  onChange={(e) => setContainerGroupId(e.target.value)}
                  placeholder="root or numeric ID"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume Mount Path</label>
                <input
                  type="text"
                  value={volumePath}
                  onChange={(e) => setVolumePath(e.target.value)}
                  placeholder="/data"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleGenerateSolution}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Generate Solution
        </button>
      </div>
      
      {showSolution && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3 text-cyan-700">Solution</h3>
          
          <div className="mb-4">
            <p className="text-gray-700">{solution.description}</p>
          </div>
          
          {solution.hostCommands && (
            <div className="mb-6">
              <h4 className="font-medium text-cyan-700 mb-2">Host Commands</h4>
              <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {solution.hostCommands.join('\n')}
                </pre>
              </div>
            </div>
          )}
          
          {solution.dockerRunCommand && (
            <div className="mb-6">
              <h4 className="font-medium text-cyan-700 mb-2">Docker Run Command</h4>
              <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {solution.dockerRunCommand}
                </pre>
              </div>
            </div>
          )}
          
          {solution.containerCommands && (
            <div className="mb-6">
              <h4 className="font-medium text-cyan-700 mb-2">Container Commands</h4>
              <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {solution.containerCommands.join('\n')}
                </pre>
              </div>
            </div>
          )}
          
          {solution.dockerfile && (
            <div className="mb-6">
              <h4 className="font-medium text-cyan-700 mb-2">Dockerfile Changes</h4>
              <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {solution.dockerfile}
                </pre>
              </div>
            </div>
          )}
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-yellow-700">
                  Warning: Consider security implications before changing permissions. In production environments, 
                  always use the principle of least privilege.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DockerVolumePermissionHelperInfoSections() {
  // Define default values for host user/group IDs for examples
  const defaultHostUserId = "1000";
  const defaultHostGroupId = "1000";
  
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Understanding Docker Volume Permission Issues</h2>
        <p className="text-gray-700 text-lg">
          Permission issues between Docker containers and host-mounted volumes are common because Linux uses numeric user IDs (UIDs) and group IDs (GIDs) 
          to determine access permissions. When a container runs as a different user than the host file owner, permission conflicts arise.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Common Scenarios</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-cyan-700 mb-1">Container can't write to volume</h3>
            <p className="text-gray-600">
              The container's user (often root or an app-specific user) doesn't have permission to write to the host directory, 
              which is owned by your host user.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-medium text-cyan-700 mb-1">Host can't access container-created files</h3>
            <p className="text-gray-600">
              Files created by the container are owned by the container's user ID, which might not map to a real user on your host system, 
              making them inaccessible.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Use the <code>-u</code> flag with <code>docker run</code> to specify a user that matches your host user ID</li>
          <li>Create a dedicated user in your Dockerfile with the same UID/GID as your host user</li>
          <li>For development environments, <code>chmod 777</code> can be a quick fix, but is not secure for production</li>
          <li>Use Docker Compose's <code>user</code> directive to run services as specific users</li>
          <li>Consider using Docker volumes instead of bind mounts for better permission handling</li>
        </ul>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Advanced Solutions</h2>
        <div className="bg-white p-5 rounded-lg shadow">
          <h3 className="font-medium text-cyan-700 mb-2">Using Docker Compose</h3>
          <div className="bg-gray-800 text-gray-200 p-3 rounded">
            <pre className="text-sm font-mono whitespace-pre-wrap">
{`version: '3'
services:
  app:
    image: your-image
    user: "${defaultHostUserId}:${defaultHostGroupId}" # Use host user/group IDs
    volumes:
      - ./data:/app/data`}
            </pre>
          </div>
          
          <h3 className="font-medium text-cyan-700 mt-4 mb-2">Using ACLs (Advanced)</h3>
          <div className="bg-gray-800 text-gray-200 p-3 rounded">
            <pre className="text-sm font-mono whitespace-pre-wrap">
{`# Set default ACLs on the host directory
sudo setfacl -R -d -m u:1000:rwX /path/to/host/directory
sudo setfacl -R -m u:1000:rwX /path/to/host/directory`}
            </pre>
          </div>
        </div>
      </section>
    </>
  );
} 