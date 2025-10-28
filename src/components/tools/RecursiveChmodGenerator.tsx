"use client";
import React, { useState } from "react";

function octalToSymbolic(octal: string): string {
  if (!/^[0-7]{3}$/.test(octal)) return "---------";
  return octal.split("").map((digit) => {
    const n = parseInt(digit, 8);
    return `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;
  }).join("");
}

export function RecursiveChmodGenerator() {
  const [octal, setOctal] = useState("755");
  const [symbolic, setSymbolic] = useState(octalToSymbolic("755"));
  const [mode, setMode] = useState<"octal" | "symbolic">("octal");
  const [target, setTarget] = useState("/path/to/dir");
  const [filesOnly, setFilesOnly] = useState(false);
  const [dirsOnly, setDirsOnly] = useState(false);

  // Sync octal and symbolic
  const handleOctalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-7]/g, "").substring(0, 3);
    setOctal(value);
    setSymbolic(octalToSymbolic(value.padEnd(3, "0")));
    setMode("octal");
  };
  const handleSymbolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^rwx+=,ugo-]/g, "");
    setSymbolic(value);
    setMode("symbolic");
  };

  // Command generation
  let chmodCmd = "chmod -R ";
  if (filesOnly) chmodCmd += "--files ";
  if (dirsOnly) chmodCmd += "--directories ";
  chmodCmd += mode === "octal" ? octal : symbolic;
  chmodCmd += ` "${target}"`;

  return (
    <div className="bg-gradient-to-br from-pink-50 to-fuchsia-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-fuchsia-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#D946EF" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">chmod -R</text>
        </svg>
        Recursive Chmod Command Generator
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-fuchsia-700">Permission Mode</label>
          <div className="flex gap-4 mb-4">
            <button
              className={`px-3 py-1 rounded ${mode === "octal" ? "bg-fuchsia-200 text-fuchsia-900" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setMode("octal")}
            >
              Octal
            </button>
            <button
              className={`px-3 py-1 rounded ${mode === "symbolic" ? "bg-fuchsia-200 text-fuchsia-900" : "bg-gray-100 text-gray-600"}`}
              onClick={() => setMode("symbolic")}
            >
              Symbolic
            </button>
          </div>
          {mode === "octal" ? (
            <input
              type="text"
              value={octal}
              onChange={handleOctalChange}
              maxLength={3}
              className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-fuchsia-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
            />
          ) : (
            <input
              type="text"
              value={symbolic}
              onChange={handleSymbolicChange}
              className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-fuchsia-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
            />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-fuchsia-700">Target Directory or File</label>
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-fuchsia-300 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
          />
          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filesOnly}
                onChange={() => setFilesOnly(f => !f)}
                className="h-5 w-5 accent-fuchsia-600"
              />
              Files only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dirsOnly}
                onChange={() => setDirsOnly(d => !d)}
                className="h-5 w-5 accent-fuchsia-600"
              />
              Directories only
            </label>
          </div>
        </div>
      </div>
      <div className="bg-fuchsia-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-fuchsia-200 font-medium">Generated Command</div>
        <div className="text-center text-xl font-mono mb-1">{chmodCmd}</div>
        <div className="text-center text-sm text-fuchsia-200 mt-2">
          <span>Copy and run this command to recursively change permissions.</span>
        </div>
      </div>
    </div>
  );
}

export function RecursiveChmodInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-fuchsia-800">How Recursive Chmod Works</h2>
        <p className="text-gray-700 text-lg">
          The <code>-R</code> (recursive) option in <code>chmod</code> applies permission changes to all files and subdirectories within the specified directory.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-fuchsia-800">Tips & Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li>Be careful when running recursive chmod on system directories.</li>
          <li>Use <code>--files</code> or <code>--directories</code> (if supported) to target only files or directories.</li>
          <li>Always double-check your target path before running the command.</li>
        </ul>
      </section>
    </>
  );
} 