"use client";
import React, { useState, useEffect } from 'react';

export function UmaskCalculator() {
  const [umaskValue, setUmaskValue] = useState("022");
  const [manualMode, setManualMode] = useState(false);
  const [permissions, setPermissions] = useState([
    { r: true, w: true, x: false }, // Owner (6)
    { r: true, w: false, x: false }, // Group (4)
    { r: true, w: false, x: false }  // Others (4)
  ]);
  const [fileDefault, setFileDefault] = useState("666");
  const [dirDefault, setDirDefault] = useState("777");
  
  // Calculate umask value from checkboxes
  const calculateUmaskFromPermissions = () => {
    return permissions
      .map(p => (p.r ? "0" : "4") + (p.w ? "0" : "2") + (p.x ? "0" : "1"))
      .join("");
  };
  
  // Calculate permissions from umask value
  const calculatePermissionsFromUmask = (umask: string) => {
    if (umask.length !== 3) return;
    
    const newPermissions = [...permissions];
    
    for (let i = 0; i < 3; i++) {
      const digit = parseInt(umask[i]);
      newPermissions[i] = {
        r: !(digit & 4),
        w: !(digit & 2),
        x: !(digit & 1)
      };
    }
    
    return newPermissions;
  };
  
  // Update umask when permissions change
  useEffect(() => {
    if (!manualMode) {
      setUmaskValue(calculateUmaskFromPermissions());
    }
  }, [permissions, manualMode]);
  
  // Update permissions when umask changes in manual mode
  useEffect(() => {
    if (manualMode) {
      const newPermissions = calculatePermissionsFromUmask(umaskValue);
      if (newPermissions) {
        setPermissions(newPermissions);
      }
    }
  }, [umaskValue, manualMode]);
  
  // Handle checkbox changes
  const handlePermissionChange = (idx: number, perm: 'r' | 'w' | 'x') => {
    if (manualMode) return;
    
    setPermissions(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [perm]: !updated[idx][perm] };
      return updated;
    });
  };
  
  // Handle manual umask input change
  const handleUmaskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-7]/g, "").substring(0, 3);
    setUmaskValue(value);
  };
  
  // Calculate effective permissions for files and directories
  const calculateEffective = (defaultPerm: string) => {
    if (defaultPerm.length !== 3 || umaskValue.length !== 3) return "000";
    
    return Array.from(defaultPerm).map((defDigit, i) => {
      const umaskDigit = umaskValue[i] || "0";
      const defaultBinary = parseInt(defDigit, 8);
      const umaskBinary = parseInt(umaskDigit, 8);
      return (defaultBinary & ~umaskBinary).toString();
    }).join("");
  };
  
  // Get symbolic notation for a permission value
  const getSymbolic = (value: string) => {
    if (value.length !== 3) return "---------";
    
    return value.split("").map(digit => {
      const num = parseInt(digit);
      return `${(num & 4) ? "r" : "-"}${(num & 2) ? "w" : "-"}${(num & 1) ? "x" : "-"}`;
    }).join("");
  };
  
  // Calculate effective permissions
  const effectiveFilePerms = calculateEffective(fileDefault);
  const effectiveDirPerms = calculateEffective(dirDefault);
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-indigo-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="#5941A9"/>
        </svg>
        Umask Calculator
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="font-semibold mb-4 text-indigo-700 text-lg">Umask Permission Bits</h3>
            
            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={manualMode}
                  onChange={() => setManualMode(!manualMode)}
                  className="mr-2 h-4 w-4 accent-indigo-600"
                />
                <span className="text-sm font-medium text-gray-700">Manual Umask Entry</span>
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={umaskValue}
                  onChange={handleUmaskChange}
                  disabled={!manualMode}
                  className={`w-full p-3 border rounded font-mono text-xl text-center ${
                    manualMode ? "bg-white border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" : "bg-gray-100"
                  }`}
                  maxLength={3}
                />
                <div className="absolute top-3 left-3 text-gray-400 font-medium">
                  umask
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 text-center mb-2 font-medium text-sm text-indigo-700">
              <div></div>
              <div>Read</div>
              <div>Write</div>
              <div>Execute</div>
            </div>
            
            {['User', 'Group', 'Others'].map((label, idx) => (
              <div key={label} className="grid grid-cols-4 items-center mb-3 border-b pb-2 border-gray-100">
                <div className="font-medium text-gray-700">{label}</div>
                {(['r', 'w', 'x'] as const).map((perm) => (
                  <div key={perm} className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={!permissions[idx][perm]}
                      onChange={() => handlePermissionChange(idx, perm)}
                      disabled={manualMode}
                      className="h-5 w-5 accent-indigo-600"
                    />
                  </div>
                ))}
              </div>
            ))}
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Checked boxes represent bits that are BLOCKED in new files/directories.</p>
            </div>
          </div>
          
          <div className="bg-indigo-800 text-white rounded-lg p-4 shadow">
            <div className="text-center mb-1 text-indigo-200 font-medium">Current Umask Value</div>
            <div className="text-center text-3xl font-mono mb-1">{umaskValue}</div>
            <div className="text-center text-sm text-indigo-200">
              Command: <code>umask {umaskValue}</code>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-3 text-indigo-700 text-lg">Effective Permissions Preview</h3>
          
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h4 className="font-medium text-gray-700 mb-3">File Creation (Default: 666)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-500 mb-1">Default Permission</div>
                <div className="font-mono text-lg">{fileDefault}</div>
                <div className="font-mono text-xs text-gray-500">{getSymbolic(fileDefault)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center flex items-center justify-center">
                <div className="font-bold text-xl text-indigo-600">-</div>
                <div className="font-mono text-lg mx-2">{umaskValue}</div>
                <div className="font-bold text-xl text-indigo-600">=</div>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg text-center">
                <div className="text-xs text-indigo-700 mb-1">Effective Permission</div>
                <div className="font-mono text-lg">{effectiveFilePerms}</div>
                <div className="font-mono text-xs text-indigo-600">{getSymbolic(effectiveFilePerms)}</div>
              </div>
            </div>
            
            <h4 className="font-medium text-gray-700 mb-3">Directory Creation (Default: 777)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-500 mb-1">Default Permission</div>
                <div className="font-mono text-lg">{dirDefault}</div>
                <div className="font-mono text-xs text-gray-500">{getSymbolic(dirDefault)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center flex items-center justify-center">
                <div className="font-bold text-xl text-indigo-600">-</div>
                <div className="font-mono text-lg mx-2">{umaskValue}</div>
                <div className="font-bold text-xl text-indigo-600">=</div>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg text-center">
                <div className="text-xs text-indigo-700 mb-1">Effective Permission</div>
                <div className="font-mono text-lg">{effectiveDirPerms}</div>
                <div className="font-mono text-xs text-indigo-600">{getSymbolic(effectiveDirPerms)}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-medium text-gray-700 mb-2">Common Umask Values</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${umaskValue === "022" ? "bg-indigo-100 border-indigo-300" : "hover:bg-gray-50 border-gray-200"}`}
                onClick={() => {
                  setUmaskValue("022");
                  setManualMode(true);
                }}
              >
                <div className="font-mono text-lg">022</div>
                <div className="text-sm text-gray-600">Standard for most Linux distros</div>
                <div className="text-xs text-gray-500 mt-1">Files: 644 (rw-r--r--)</div>
                <div className="text-xs text-gray-500">Dirs: 755 (rwxr-xr-x)</div>
              </div>
              
              <div 
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${umaskValue === "002" ? "bg-indigo-100 border-indigo-300" : "hover:bg-gray-50 border-gray-200"}`}
                onClick={() => {
                  setUmaskValue("002");
                  setManualMode(true);
                }}
              >
                <div className="font-mono text-lg">002</div>
                <div className="text-sm text-gray-600">Collaborative environments</div>
                <div className="text-xs text-gray-500 mt-1">Files: 664 (rw-rw-r--)</div>
                <div className="text-xs text-gray-500">Dirs: 775 (rwxrwxr-x)</div>
              </div>
              
              <div 
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${umaskValue === "077" ? "bg-indigo-100 border-indigo-300" : "hover:bg-gray-50 border-gray-200"}`}
                onClick={() => {
                  setUmaskValue("077");
                  setManualMode(true);
                }}
              >
                <div className="font-mono text-lg">077</div>
                <div className="text-sm text-gray-600">Private - owner only</div>
                <div className="text-xs text-gray-500 mt-1">Files: 600 (rw-------)</div>
                <div className="text-xs text-gray-500">Dirs: 700 (rwx------)</div>
              </div>
              
              <div 
                className={`border rounded-lg p-3 cursor-pointer transition-colors ${umaskValue === "027" ? "bg-indigo-100 border-indigo-300" : "hover:bg-gray-50 border-gray-200"}`}
                onClick={() => {
                  setUmaskValue("027");
                  setManualMode(true);
                }}
              >
                <div className="font-mono text-lg">027</div>
                <div className="text-sm text-gray-600">Group collaboration, restricted others</div>
                <div className="text-xs text-gray-500 mt-1">Files: 640 (rw-r-----)</div>
                <div className="text-xs text-gray-500">Dirs: 750 (rwxr-x---)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UmaskInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">What is <code>umask</code>?</h2>
        <p className="text-gray-700 text-lg">
          <code>umask</code> (user mask) is a command in Linux/Unix systems that sets the default permissions for newly created files and directories. It works by "masking out" (removing) certain permission bits from the default permissions.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">How Umask Works</h2>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <p className="text-gray-700 mb-4">
            When you create a new file or directory, the system starts with default permissions (typically 666 for files and 777 for directories), then <strong>subtracts</strong> the umask value:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-lg mb-2">For Files:</h3>
              <div className="font-mono bg-gray-100 p-3 rounded">
                666 - umask = effective permissions
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Default file permissions (666) minus your umask value gives the actual permissions for new files
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium text-lg mb-2">For Directories:</h3>
              <div className="font-mono bg-gray-100 p-3 rounded">
                777 - umask = effective permissions
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Default directory permissions (777) minus your umask value gives the actual permissions for new directories
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-indigo-700">Understanding Umask Values</h3>
            <p className="text-gray-700 mb-3">
              Umask uses the same octal notation as chmod, but with opposite meaning:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li><strong>1</strong> blocks execute (x)</li>
              <li><strong>2</strong> blocks write (w)</li>
              <li><strong>4</strong> blocks read (r)</li>
            </ul>
            <p className="text-gray-700 mt-3">
              For example, umask <strong>022</strong> means "block write and execute for group and others, but don't block anything for owner".
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-indigo-700">Checking Current Umask</h3>
            <p className="text-gray-700 mb-3">
              To check your current umask setting:
            </p>
            <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
              $ umask<br/>
              0022
            </div>
            <p className="text-gray-700">
              The leading 0 is sometimes shown but can be omitted when setting the umask.
            </p>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Common Umask Settings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-indigo-100">
                <th className="p-3 border border-indigo-200">Umask</th>
                <th className="p-3 border border-indigo-200">File Permissions</th>
                <th className="p-3 border border-indigo-200">Directory Permissions</th>
                <th className="p-3 border border-indigo-200">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white">
                <td className="p-3 border border-gray-200 font-mono">022</td>
                <td className="p-3 border border-gray-200 font-mono">644 (rw-r--r--)</td>
                <td className="p-3 border border-gray-200 font-mono">755 (rwxr-xr-x)</td>
                <td className="p-3 border border-gray-200">Default on most Linux systems, good balance of security</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200 font-mono">002</td>
                <td className="p-3 border border-gray-200 font-mono">664 (rw-rw-r--)</td>
                <td className="p-3 border border-gray-200 font-mono">775 (rwxrwxr-x)</td>
                <td className="p-3 border border-gray-200">Good for collaborative environments where group members need write access</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 border border-gray-200 font-mono">077</td>
                <td className="p-3 border border-gray-200 font-mono">600 (rw-------)</td>
                <td className="p-3 border border-gray-200 font-mono">700 (rwx------)</td>
                <td className="p-3 border border-gray-200">Maximum privacy, files accessible only by the owner</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-3 border border-gray-200 font-mono">027</td>
                <td className="p-3 border border-gray-200 font-mono">640 (rw-r-----)</td>
                <td className="p-3 border border-gray-200 font-mono">750 (rwxr-x---)</td>
                <td className="p-3 border border-gray-200">Group can read/execute but not write, others have no permissions</td>
              </tr>
              <tr className="bg-white">
                <td className="p-3 border border-gray-200 font-mono">007</td>
                <td className="p-3 border border-gray-200 font-mono">660 (rw-rw----)</td>
                <td className="p-3 border border-gray-200 font-mono">770 (rwxrwx---)</td>
                <td className="p-3 border border-gray-200">Owner and group have full access, others have none</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Setting Your Umask</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-medium text-lg mb-3 text-indigo-700">Temporary Change</h3>
          <p className="text-gray-700 mb-2">
            To set umask for your current session only:
          </p>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-5">
            $ umask 022
          </div>
          
          <h3 className="font-medium text-lg mb-3 text-indigo-700">Permanent Change</h3>
          <p className="text-gray-700 mb-2">
            To make your umask change permanent, add it to your shell's startup file:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">For Bash:</p>
              <div className="bg-gray-800 text-white p-2 rounded-lg font-mono text-sm">
                # Add to ~/.bashrc<br/>
                umask 022
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">For Zsh:</p>
              <div className="bg-gray-800 text-white p-2 rounded-lg font-mono text-sm">
                # Add to ~/.zshrc<br/>
                umask 022
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-indigo-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>The standard umask on most Linux systems is <code>022</code>, which is a good balance between security and usability</li>
          <li>For sensitive data, consider using a more restrictive umask like <code>077</code></li>
          <li>On shared systems where collaboration is important, <code>002</code> might be appropriate</li>
          <li>Remember that the umask only affects newly created files, not existing ones</li>
          <li>When setting up web servers, the umask may need to be adjusted based on which user runs the web server process</li>
        </ul>
      </section>
    </>
  );
} 