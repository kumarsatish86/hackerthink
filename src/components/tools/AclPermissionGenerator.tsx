"use client";
import React, { useState } from "react";

interface AclEntry {
  type: "user" | "group" | "other";
  name: string;
  r: boolean;
  w: boolean;
  x: boolean;
}

const defaultEntries: AclEntry[] = [
  { type: "user", name: "", r: true, w: true, x: true },
  { type: "group", name: "", r: true, w: false, x: true },
  { type: "other", name: "", r: true, w: false, x: true },
];

function aclPermString(entry: AclEntry) {
  return `${entry.r ? "r" : "-"}${entry.w ? "w" : "-"}${entry.x ? "x" : "-"}`;
}

export function AclPermissionGenerator() {
  const [entries, setEntries] = useState<AclEntry[]>(defaultEntries);
  const [target, setTarget] = useState("/path/to/file");

  // Add new entry
  const addEntry = (type: "user" | "group") => {
    setEntries([...entries, { type, name: "", r: false, w: false, x: false }]);
  };

  // Remove entry
  const removeEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx));
  };

  // Update entry
  const updateEntry = (idx: number, key: keyof AclEntry, value: any) => {
    setEntries(entries.map((e, i) => i === idx ? { ...e, [key]: value } : e));
  };

  // Generate setfacl command
  const setfaclCmd = `setfacl ${entries
    .map(e => {
      let who = e.type === "user" ? `u:${e.name || ""}` : e.type === "group" ? `g:${e.name || ""}` : "o";
      return `-m ${who}:${aclPermString(e)}`;
    })
    .join(" ")} \"${target}\"`;

  // Generate getfacl command
  const getfaclCmd = `getfacl \"${target}\"`;

  return (
    <div className="bg-gradient-to-br from-lime-50 to-green-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-lime-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#84CC16" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">ACL</text>
        </svg>
        ACL Permission Generator (getfacl/setfacl)
      </h2>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block mb-2 font-medium text-lime-700">Target File or Directory</label>
        <input
          type="text"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-lime-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 mb-4"
        />
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <button
              className="px-3 py-1 rounded bg-lime-200 text-lime-900"
              onClick={() => addEntry("user")}
            >
              + User ACL
            </button>
            <button
              className="px-3 py-1 rounded bg-lime-200 text-lime-900"
              onClick={() => addEntry("group")}
            >
              + Group ACL
            </button>
          </div>
          {entries.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-2">
              <select
                value={entry.type}
                onChange={e => updateEntry(idx, "type", e.target.value)}
                className="border rounded p-1 text-lime-800"
              >
                <option value="user">User</option>
                <option value="group">Group</option>
                <option value="other">Other</option>
              </select>
              {(entry.type === "user" || entry.type === "group") && (
                <input
                  type="text"
                  value={entry.name}
                  onChange={e => updateEntry(idx, "name", e.target.value)}
                  placeholder={entry.type === "user" ? "username" : "groupname"}
                  className="border rounded p-1 font-mono text-lime-800"
                />
              )}
              {["r", "w", "x"].map(perm => (
                <label key={perm} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={entry[perm as "r" | "w" | "x"]}
                    onChange={() => updateEntry(idx, perm as keyof AclEntry, !entry[perm as "r" | "w" | "x"])}
                    className="accent-lime-600"
                  />
                  {perm}
                </label>
              ))}
              {idx > 2 && (
                <button
                  className="ml-2 text-red-600 hover:underline"
                  onClick={() => removeEntry(idx)}
                  title="Remove entry"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-lime-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-lime-200 font-medium">Generated setfacl Command</div>
        <div className="text-center text-xl font-mono mb-1">{setfaclCmd}</div>
        <div className="text-center text-sm text-lime-200 mt-2">
          <span>Use this command to set ACLs on the target file or directory.</span>
        </div>
      </div>
      <div className="bg-lime-700 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-lime-100 font-medium">Generated getfacl Command</div>
        <div className="text-center text-xl font-mono mb-1">{getfaclCmd}</div>
        <div className="text-center text-sm text-lime-100 mt-2">
          <span>Use this command to view ACLs on the target file or directory.</span>
        </div>
      </div>
    </div>
  );
}

export function AclPermissionInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-lime-800">What are ACLs?</h2>
        <p className="text-gray-700 text-lg">
          <strong>Access Control Lists (ACLs)</strong> provide a more flexible permission mechanism for file systems, allowing permissions to be set for individual users and groups beyond the standard owner/group/other model.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-lime-800">How to Use getfacl and setfacl</h2>
        <p className="text-gray-700 text-lg mb-3">
          <code>getfacl</code> displays the ACLs of a file or directory, while <code>setfacl</code> is used to set them. This tool helps you generate the correct commands.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-lime-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Use ACLs for fine-grained permission control.</li>
          <li>Always verify ACLs with <code>getfacl</code> after setting them.</li>
          <li>Not all file systems support ACLs by default; check your system configuration.</li>
        </ul>
      </section>
    </>
  );
} 