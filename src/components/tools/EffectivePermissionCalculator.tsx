"use client";
import React, { useState } from "react";

function permToSymbolic(perm: { r: boolean; w: boolean; x: boolean }) {
  return `${perm.r ? "r" : "-"}${perm.w ? "w" : "-"}${perm.x ? "x" : "-"}`;
}

export function EffectivePermissionCalculator() {
  const [userPerm, setUserPerm] = useState({ r: true, w: true, x: true });
  const [groupPerm, setGroupPerm] = useState({ r: true, w: false, x: true });
  const [otherPerm, setOtherPerm] = useState({ r: true, w: false, x: true });
  const [user, setUser] = useState("alice");
  const [fileOwner, setFileOwner] = useState("alice");
  const [primaryGroup, setPrimaryGroup] = useState("staff");
  const [fileGroup, setFileGroup] = useState("staff");
  const [suppGroups, setSuppGroups] = useState("wheel,dev");

  // Determine effective permission
  let effective = "-";
  if (user === fileOwner) {
    effective = permToSymbolic(userPerm);
  } else if (
    fileGroup === primaryGroup ||
    suppGroups.split(",").map(g => g.trim()).includes(fileGroup)
  ) {
    effective = permToSymbolic(groupPerm);
  } else {
    effective = permToSymbolic(otherPerm);
  }

  return (
    <div className="bg-gradient-to-br from-cyan-50 to-sky-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-sky-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#0EA5E9" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">Eff</text>
        </svg>
        Effective Permission Calculator (User + Group + Others)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-sky-700">User Permission</label>
          {["r", "w", "x"].map(perm => (
            <label key={perm} className="inline-flex items-center gap-1 mr-4">
              <input
                type="checkbox"
                checked={userPerm[perm as "r" | "w" | "x"]}
                onChange={() => setUserPerm(p => ({ ...p, [perm]: !p[perm as "r" | "w" | "x"] }))}
                className="accent-sky-600"
              />
              {perm}
            </label>
          ))}
          <div className="mt-2 font-mono">{permToSymbolic(userPerm)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-sky-700">Group Permission</label>
          {["r", "w", "x"].map(perm => (
            <label key={perm} className="inline-flex items-center gap-1 mr-4">
              <input
                type="checkbox"
                checked={groupPerm[perm as "r" | "w" | "x"]}
                onChange={() => setGroupPerm(p => ({ ...p, [perm]: !p[perm as "r" | "w" | "x"] }))}
                className="accent-sky-600"
              />
              {perm}
            </label>
          ))}
          <div className="mt-2 font-mono">{permToSymbolic(groupPerm)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-sky-700">Other Permission</label>
          {["r", "w", "x"].map(perm => (
            <label key={perm} className="inline-flex items-center gap-1 mr-4">
              <input
                type="checkbox"
                checked={otherPerm[perm as "r" | "w" | "x"]}
                onChange={() => setOtherPerm(p => ({ ...p, [perm]: !p[perm as "r" | "w" | "x"] }))}
                className="accent-sky-600"
              />
              {perm}
            </label>
          ))}
          <div className="mt-2 font-mono">{permToSymbolic(otherPerm)}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-sky-700">User</label>
          <input
            type="text"
            value={user}
            onChange={e => setUser(e.target.value)}
            className="w-full p-2 border rounded font-mono text-lg text-center mb-2"
          />
          <label className="block mb-2 font-medium text-sky-700">File Owner</label>
          <input
            type="text"
            value={fileOwner}
            onChange={e => setFileOwner(e.target.value)}
            className="w-full p-2 border rounded font-mono text-lg text-center mb-2"
          />
          <label className="block mb-2 font-medium text-sky-700">Primary Group</label>
          <input
            type="text"
            value={primaryGroup}
            onChange={e => setPrimaryGroup(e.target.value)}
            className="w-full p-2 border rounded font-mono text-lg text-center mb-2"
          />
          <label className="block mb-2 font-medium text-sky-700">File Group</label>
          <input
            type="text"
            value={fileGroup}
            onChange={e => setFileGroup(e.target.value)}
            className="w-full p-2 border rounded font-mono text-lg text-center mb-2"
          />
          <label className="block mb-2 font-medium text-sky-700">Supplementary Groups (comma separated)</label>
          <input
            type="text"
            value={suppGroups}
            onChange={e => setSuppGroups(e.target.value)}
            className="w-full p-2 border rounded font-mono text-lg text-center"
          />
        </div>
      </div>
      <div className="bg-sky-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-sky-200 font-medium">Effective Permissions</div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-2">
          <div className="text-center">
            <div className="font-bold">User</div>
            <div className="text-2xl font-mono">{permToSymbolic(userPerm)}</div>
          </div>
          <div className="text-center">
            <div className="font-bold">Group</div>
            <div className="text-2xl font-mono">{permToSymbolic(groupPerm)}</div>
          </div>
          <div className="text-center">
            <div className="font-bold">Others</div>
            <div className="text-2xl font-mono">{permToSymbolic(otherPerm)}</div>
          </div>
        </div>
        <div className="text-center text-sm text-sky-200 mt-2">
          <span>These are the permissions for user, group, and others for this file/directory.</span>
        </div>
      </div>
      <div className="bg-sky-700 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-sky-100 font-medium">Effective Permission for Entered User</div>
        <div className="text-center text-3xl font-mono mb-1">{effective}</div>
        <div className="text-center text-sm text-sky-100 mt-2">
          <span>This is the permission the entered user would have for this file/directory.</span>
        </div>
      </div>
    </div>
  );
}

export function EffectivePermissionInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-sky-800">How Effective Permissions are Determined</h2>
        <p className="text-gray-700 text-lg">
          Linux determines a user's effective permissions based on whether they are the file owner, belong to the file's group (primary or supplementary), or are considered "others". This tool helps you visualize which permission applies.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-sky-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Remember that ACLs and special bits (setuid/setgid/sticky) can further affect access.</li>
          <li>Use <code>id</code> command to check a user's groups.</li>
          <li>Effective permissions are the most permissive of all applicable rules (user {'>'} group {'>'} others).</li>
        </ul>
      </section>
    </>
  );
} 