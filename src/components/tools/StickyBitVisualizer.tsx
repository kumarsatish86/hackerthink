"use client";
import React, { useState } from "react";

export function StickyBitVisualizer() {
  const [owner, setOwner] = useState({ r: true, w: true, x: true });
  const [group, setGroup] = useState({ r: true, w: true, x: true });
  const [others, setOthers] = useState({ r: true, w: true, x: true });
  const [sticky, setSticky] = useState(false);

  // Calculate numeric and symbolic permissions
  const calcPerm = (perm: { r: boolean; w: boolean; x: boolean }) =>
    (perm.r ? 4 : 0) + (perm.w ? 2 : 0) + (perm.x ? 1 : 0);

  const getSymbolic = () => {
    const o = owner;
    const g = group;
    const ot = others;
    let sym = [o, g, ot]
      .map((p, i) =>
        `${p.r ? "r" : "-"}${p.w ? "w" : "-"}${
          i === 2 && sticky ? (p.x ? "t" : "T") : p.x ? "x" : "-"
        }`
      )
      .join("");
    return sym;
  };

  const getNumeric = () => {
    const o = calcPerm(owner);
    const g = calcPerm(group);
    const ot = calcPerm(others);
    return `${o}${g}${ot}${sticky ? " (with sticky bit)" : ""}`;
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-orange-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-2.83.48-5.48-1.51-5.96-4.34-.09-.52.36-.99.89-.99.44 0 .81.32.89.75.34 1.81 2.13 3.08 3.96 2.74 1.81-.34 3.08-2.13 2.74-3.96-.08-.43.31-.81.75-.81.53 0 .98.47.89.99-.48 2.83-3.13 4.82-5.96 4.34z" fill="#F59E42"/>
        </svg>
        Sticky Bit Visualizer
      </h2>
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4 text-center font-medium text-sm text-orange-700 mb-2">
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
                    className="h-5 w-5 accent-orange-600"
                  />
                </div>
              ))}
            </div>
          );
        })}
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={sticky}
            onChange={() => setSticky((s) => !s)}
            className="h-5 w-5 accent-orange-600 mr-2"
            id="sticky-bit-toggle"
          />
          <label htmlFor="sticky-bit-toggle" className="text-sm font-medium text-gray-700">
            Sticky Bit (t/T on others' execute)
          </label>
        </div>
      </div>
      <div className="bg-orange-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-orange-200 font-medium">Current Permissions</div>
        <div className="text-center text-3xl font-mono mb-1">{getNumeric()}</div>
        <div className="text-center text-xl font-mono">{getSymbolic()}</div>
        <div className="text-center text-sm text-orange-200 mt-2">
          Command: <code>chmod{others.x && sticky ? " +t" : sticky ? " o+t" : ""}</code>
        </div>
      </div>
    </div>
  );
}

export function StickyBitInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">What is the Sticky Bit?</h2>
        <p className="text-gray-700 text-lg">
          The <strong>sticky bit</strong> is a special permission that can be set on directories (and rarely on files) in Unix/Linux systems. When set on a directory, it allows only the file's owner, the directory's owner, or root to delete or rename files within that directory.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">How to Recognize the Sticky Bit</h2>
        <p className="text-gray-700 text-lg mb-3">
          In a directory listing (ls -l), the sticky bit appears as a <code>t</code> or <code>T</code> in the others' execute position:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li><code>t</code>: Others have execute permission and sticky bit is set (e.g., <code>drwxrwxrwt</code>)</li>
          <li><code>T</code>: Others do <strong>not</strong> have execute, but sticky bit is set (e.g., <code>drwxrwxrwT</code>)</li>
        </ul>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Setting the Sticky Bit</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700 mb-2">
            To set the sticky bit on a directory:
          </p>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
            chmod +t /path/to/dir
          </div>
          <p className="text-gray-700 mb-2">
            Or numerically (the leading <code>1</code> sets the sticky bit):
          </p>
          <div className="bg-gray-800 text-white p-3 rounded-lg font-mono mb-3">
            chmod 1777 /path/to/dir
          </div>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-orange-800">Where is the Sticky Bit Used?</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>The most common example is <code>/tmp</code> (<code>drwxrwxrwt</code>), allowing all users to write but only delete their own files.</li>
          <li>Rarely used on files; mostly relevant for directories.</li>
        </ul>
      </section>
    </>
  );
} 