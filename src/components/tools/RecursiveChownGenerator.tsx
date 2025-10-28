"use client";
import React, { useState } from "react";

export function RecursiveChownGenerator() {
  const [user, setUser] = useState("");
  const [group, setGroup] = useState("");
  const [target, setTarget] = useState("/path/to/dir");
  const [filesOnly, setFilesOnly] = useState(false);
  const [dirsOnly, setDirsOnly] = useState(false);

  // Command generation
  let chownCmd = "chown -R ";
  if (filesOnly) chownCmd += "--files ";
  if (dirsOnly) chownCmd += "--directories ";
  chownCmd += user || group ? `${user}${group ? ":" + group : ""}` : "user:group";
  chownCmd += ` "${target}"`;

  return (
    <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#0EA5E9" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">chown -R</text>
        </svg>
        Recursive Chown Command Generator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-blue-700">User</label>
          <input
            type="text"
            value={user}
            onChange={e => setUser(e.target.value)}
            className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="username"
          />
          <label className="block mt-4 mb-2 font-medium text-blue-700">Group (optional)</label>
          <input
            type="text"
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="groupname"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-blue-700">Target Directory or File</label>
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filesOnly}
                onChange={() => setFilesOnly(f => !f)}
                className="h-5 w-5 accent-blue-600"
              />
              Files only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dirsOnly}
                onChange={() => setDirsOnly(d => !d)}
                className="h-5 w-5 accent-blue-600"
              />
              Directories only
            </label>
          </div>
        </div>
      </div>
      <div className="bg-blue-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-blue-200 font-medium">Generated Command</div>
        <div className="text-center text-xl font-mono mb-1">{chownCmd}</div>
        <div className="text-center text-sm text-blue-200 mt-2">
          <span>Copy and run this command to recursively change ownership.</span>
        </div>
      </div>
    </div>
  );
}

export function RecursiveChownInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">How Recursive Chown Works</h2>
        <p className="text-gray-700 text-lg">
          The <code>-R</code> (recursive) option in <code>chown</code> applies ownership changes to all files and subdirectories within the specified directory.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-blue-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Be careful when running recursive chown on system directories.</li>
          <li>Use <code>--files</code> or <code>--directories</code> (if supported) to target only files or directories.</li>
          <li>Always double-check your target path before running the command.</li>
        </ul>
      </section>
    </>
  );
} 