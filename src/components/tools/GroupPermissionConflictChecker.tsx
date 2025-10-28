"use client";
import React, { useState } from "react";

function parseLsLine(line: string) {
  // Example: -rwxrwxrwx 1 user group 0 Jan 1 00:00 filename
  const match = line.match(/^([\-ld])([rwx-]{9})\s+\d+\s+(\S+)\s+(\S+)\s+\d+\s+.+?\s+(.+)$/);
  if (!match) return null;
  return {
    type: match[1],
    perm: match[2],
    user: match[3],
    group: match[4],
    name: match[5],
  };
}

function hasGroupConflict(perm: string) {
  // Compare group permissions (positions 3-5) with user (0-2) and others (6-8)
  // Conflict if group has more permissions than user or others
  const userPerm = perm.slice(0, 3);
  const groupPerm = perm.slice(3, 6);
  const otherPerm = perm.slice(6, 9);

  // Convert rwx to numeric for comparison
  const permToNum = (p: string) =>
    (p[0] === 'r' ? 4 : 0) + (p[1] === 'w' ? 2 : 0) + (p[2] === 'x' ? 1 : 0);

  const userNum = permToNum(userPerm);
  const groupNum = permToNum(groupPerm);
  const otherNum = permToNum(otherPerm);

  // Conflict if group > user or group > others
  return groupNum > userNum || groupNum > otherNum;
}

export function GroupPermissionConflictChecker() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleCheck = () => {
    const lines = input.split(/\r?\n/).filter(Boolean);
    const results = lines.map(parseLsLine).filter(Boolean);
    setParsed(results);
    setShowResults(true);
  };

  const conflictFiles = parsed.filter(f => hasGroupConflict(f.perm));

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#3B82F6" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">GROUP</text>
        </svg>
        Group Permission Conflict Checker
      </h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-blue-700">Paste output from <code>ls -l</code> or similar</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={8}
          className="w-full p-3 border rounded font-mono text-sm bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
          placeholder="-rw-r--r-- 1 user group 123 Jan 1 00:00 file.txt\ndrwxrwxr-x 2 root root 4096 Jan 1 00:00 public/"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          onClick={handleCheck}
        >
          Check Group Conflicts
        </button>
      </div>
      {showResults && (
        <div className="bg-blue-800 text-white rounded-lg p-4 shadow mb-4">
          <div className="text-center mb-1 text-blue-200 font-medium">Conflict Results</div>
          {parsed.length === 0 ? (
            <div className="text-center">No valid entries found.</div>
          ) : (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr className="bg-blue-700">
                  <th className="p-2 border border-blue-600">Type</th>
                  <th className="p-2 border border-blue-600">Permissions</th>
                  <th className="p-2 border border-blue-600">User</th>
                  <th className="p-2 border border-blue-600">Group</th>
                  <th className="p-2 border border-blue-600">Name</th>
                  <th className="p-2 border border-blue-600">Conflict</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((f, i) => (
                  <tr key={i} className={hasGroupConflict(f.perm) ? "bg-red-100 text-red-800" : ""}>
                    <td className="p-2 border border-blue-600">{f.type}</td>
                    <td className="p-2 border border-blue-600 font-mono">{f.perm}</td>
                    <td className="p-2 border border-blue-600">{f.user}</td>
                    <td className="p-2 border border-blue-600">{f.group}</td>
                    <td className="p-2 border border-blue-600">{f.name}</td>
                    <td className="p-2 border border-blue-600 font-bold">{hasGroupConflict(f.perm) ? "CONFLICT" : "OK"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 text-blue-100 text-sm">
            {conflictFiles.length > 0 ? (
              <span>{conflictFiles.length} file(s) or directory(ies) with group permission conflicts found. Review permissions!</span>
            ) : (
              <span>No group permission conflicts detected.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GroupPermissionConflictInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">What is a Group Permission Conflict?</h2>
        <p className="text-gray-700 text-lg">
          A group permission conflict occurs when group permissions are more permissive than user or others, which can lead to unintended access or security risks. This tool helps you identify such conflicts in your file and directory permissions.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Ensure group permissions do not exceed user or others unless explicitly required.</li>
          <li>Regularly audit group permissions, especially on shared systems.</li>
          <li>Restrict group access on sensitive files and directories.</li>
        </ul>
      </section>
    </>
  );
} 