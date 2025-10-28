"use client";
import React, { useState } from "react";

export function SetuidSetgidDemonstrator() {
  const [owner, setOwner] = useState({ r: true, w: true, x: true });
  const [group, setGroup] = useState({ r: true, w: true, x: true });
  const [others, setOthers] = useState({ r: true, w: true, x: true });
  const [setuid, setSetuid] = useState(false);
  const [setgid, setSetgid] = useState(false);

  // Calculate numeric and symbolic permissions
  const calcPerm = (perm: { r: boolean; w: boolean; x: boolean }) =>
    (perm.r ? 4 : 0) + (perm.w ? 2 : 0) + (perm.x ? 1 : 0);

  const getSymbolic = () => {
    const o = owner;
    const g = group;
    const ot = others;
    return [
      `${o.r ? "r" : "-"}${o.w ? "w" : "-"}${setuid ? (o.x ? "s" : "S") : o.x ? "x" : "-"}`,
      `${g.r ? "r" : "-"}${g.w ? "w" : "-"}${setgid ? (g.x ? "s" : "S") : g.x ? "x" : "-"}`,
      `${ot.r ? "r" : "-"}${ot.w ? "w" : "-"}${ot.x ? "x" : "-"}`
    ].join("");
  };

  const getNumeric = () => {
    const o = calcPerm(owner);
    const g = calcPerm(group);
    const ot = calcPerm(others);
    const special = (setuid ? 4 : 0) + (setgid ? 2 : 0);
    return `${special ? special : ''}${o}${g}${ot}`;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-cyan-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#06B6D4" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">S/G</text>
        </svg>
        Setuid/Setgid Demonstrator
      </h2>
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4 text-center font-medium text-sm text-cyan-700 mb-2">
          <div></div>
          <div>Read</div>
          <div>Write</div>
          <div>Execute</div>
        </div>
        {["Owner", "Group", "Others"].map((label, idx) => {
          const perm = [owner, group, others][idx];
          const setPerm = [setOwner, setGroup, setOthers][idx];
          return (
            <div key={label} className="grid grid-cols-4 items-center mb-3 border-b pb-2 border-gray-100">
              <div className="font-medium text-gray-700">{label}</div>
              {["r", "w", "x"].map((permKey) => (
                <div key={permKey} className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={perm[permKey]}
                    onChange={() => setPerm((prev: any) => ({ ...prev, [permKey]: !prev[permKey] }))}
                    className="h-5 w-5 accent-cyan-600"
                  />
                </div>
              ))}
            </div>
          );
        })}
        <div className="flex items-center mt-4 gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={setuid}
              onChange={() => setSetuid((s) => !s)}
              className="h-5 w-5 accent-cyan-600 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">setuid (s/S on owner's execute)</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={setgid}
              onChange={() => setSetgid((s) => !s)}
              className="h-5 w-5 accent-cyan-600 mr-2"
            />
            <span className="text-sm font-medium text-gray-700">setgid (s/S on group's execute)</span>
          </label>
        </div>
      </div>
      <div className="bg-cyan-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-cyan-200 font-medium">Current Permissions</div>
        <div className="text-center text-3xl font-mono mb-1">{getNumeric()}</div>
        <div className="text-center text-xl font-mono">{getSymbolic()}</div>
        <div className="text-center text-sm text-cyan-200 mt-2">
          Command: <code>chmod{setuid || setgid ? ` ${setuid ? '+u' : ''}${setgid ? '+g' : ''}s` : ''}</code>
        </div>
      </div>
    </div>
  );
}

export function SetuidSetgidInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">What are setuid and setgid?</h2>
        <p className="text-gray-700 text-lg">
          <strong>setuid</strong> and <strong>setgid</strong> are special permission bits in Unix/Linux systems. When set on an executable file, setuid allows the file to run with the permissions of the file's owner, and setgid allows it to run with the permissions of the file's group. When set on a directory, setgid causes new files and subdirectories to inherit the group of the directory.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">How to Recognize setuid/setgid</h2>
        <p className="text-gray-700 text-lg mb-3">
          In a directory listing (ls -l), setuid and setgid appear as <code>s</code> or <code>S</code> in the execute position for owner and group:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li><code>s</code>: Execute and setuid/setgid are set (e.g., <code>-rwsr-xr-x</code> or <code>-rwxr-sr-x</code>)</li>
          <li><code>S</code>: setuid/setgid is set, but execute is not (e.g., <code>-rwSr-xr-x</code> or <code>-rwxr-Sr-x</code>)</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Setting setuid/setgid</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700 mb-2">
            To set setuid on a file:
          </p>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
            chmod u+s /path/to/file
          </div>
          <p className="text-gray-700 mb-2">
            To set setgid on a file or directory:
          </p>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
            chmod g+s /path/to/file_or_dir
          </div>
          <p className="text-gray-700 mb-2">
            Or numerically (the leading <code>4</code> sets setuid, <code>2</code> sets setgid):
          </p>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
            chmod 4755 /path/to/file (setuid)
          </div>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
            chmod 2755 /path/to/dir (setgid)
          </div>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-cyan-800">Where are setuid/setgid Used?</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>setuid is commonly used for programs that need root privileges, like <code>passwd</code>.</li>
          <li>setgid is often used on directories for collaborative group access.</li>
        </ul>
      </section>
    </>
  );
} 