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

function isRisky(perm: string) {
  // World-writable or world-executable
  return perm[7] === 'w' || perm[8] === 'x';
}

export function PermissionAuditChecker() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleCheck = () => {
    const lines = input.split(/\r?\n/).filter(Boolean);
    const results = lines.map(parseLsLine).filter(Boolean);
    setParsed(results);
    setShowResults(true);
  };

  const riskyFiles = parsed.filter(f => isRisky(f.perm));

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-orange-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#F87171" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">AUDIT</text>
        </svg>
        Permission Audit Checker
      </h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-orange-700">Paste output from <code>ls -l</code> or similar</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={8}
          className="w-full p-3 border rounded font-mono text-sm bg-white border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 mb-4"
          placeholder="-rw-r--r-- 1 user group 123 Jan 1 00:00 file.txt\ndrwxrwxrwx 2 root root 4096 Jan 1 00:00 public/"
        />
        <button
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 font-semibold"
          onClick={handleCheck}
        >
          Audit Permissions
        </button>
      </div>
      {showResults && (
        <div className="bg-orange-800 text-white rounded-lg p-4 shadow mb-4">
          <div className="text-center mb-1 text-orange-200 font-medium">Audit Results</div>
          {parsed.length === 0 ? (
            <div className="text-center">No valid entries found.</div>
          ) : (
            <table className="w-full text-left border-collapse mt-2">
              <thead>
                <tr className="bg-orange-700">
                  <th className="p-2 border border-orange-600">Type</th>
                  <th className="p-2 border border-orange-600">Permissions</th>
                  <th className="p-2 border border-orange-600">User</th>
                  <th className="p-2 border border-orange-600">Group</th>
                  <th className="p-2 border border-orange-600">Name</th>
                  <th className="p-2 border border-orange-600">Risk</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((f, i) => (
                  <tr key={i} className={isRisky(f.perm) ? "bg-red-100 text-red-800" : ""}>
                    <td className="p-2 border border-orange-600">{f.type}</td>
                    <td className="p-2 border border-orange-600 font-mono">{f.perm}</td>
                    <td className="p-2 border border-orange-600">{f.user}</td>
                    <td className="p-2 border border-orange-600">{f.group}</td>
                    <td className="p-2 border border-orange-600">{f.name}</td>
                    <td className="p-2 border border-orange-600 font-bold">{isRisky(f.perm) ? "RISK" : "OK"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 text-orange-100 text-sm">
            {riskyFiles.length > 0 ? (
              <span>{riskyFiles.length} risky file(s) or directory(ies) found. Review permissions!</span>
            ) : (
              <span>No risky permissions detected.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PermissionAuditInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">What is a Permission Audit?</h2>
        <p className="text-gray-700 text-lg">
          A permission audit checks files and directories for risky or non-standard permissions, such as world-writable or world-executable, which can be a security risk.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Avoid world-writable (<code>o+w</code>) and world-executable (<code>o+x</code>) permissions unless absolutely necessary.</li>
          <li>Restrict permissions on sensitive files and directories.</li>
          <li>Regularly audit permissions, especially on shared or public systems.</li>
        </ul>
      </section>
    </>
  );
} 