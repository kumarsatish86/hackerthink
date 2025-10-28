"use client";
import React, { useState } from "react";

function octalToSymbolic(octal: string): string {
  if (!/^[0-7]{3}$/.test(octal)) return "---------";
  return octal.split("").map((digit) => {
    const n = parseInt(digit, 8);
    return `${n & 4 ? "r" : "-"}${n & 2 ? "w" : "-"}${n & 1 ? "x" : "-"}`;
  }).join("");
}

function symbolicToOctal(symbolic: string): string {
  if (!/^([r-][w-][x-]){3}$/.test(symbolic)) return "000";
  let octal = "";
  for (let i = 0; i < 9; i += 3) {
    let n = 0;
    if (symbolic[i] === "r") n += 4;
    if (symbolic[i + 1] === "w") n += 2;
    if (symbolic[i + 2] === "x") n += 1;
    octal += n.toString();
  }
  return octal;
}

export function PermissionConversionTool() {
  const [octal, setOctal] = useState("644");
  const [symbolic, setSymbolic] = useState(octalToSymbolic("644"));

  // Handle octal input
  const handleOctalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-7]/g, "").substring(0, 3);
    setOctal(value);
    setSymbolic(octalToSymbolic(value.padEnd(3, "0")));
  };

  // Handle symbolic input
  const handleSymbolicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^rwx-]/g, "").substring(0, 9);
    setSymbolic(value);
    setOctal(symbolicToOctal(value.padEnd(9, "-")));
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-800 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="4" fill="#10B981" />
          <text x="12" y="16" textAnchor="middle" fontSize="10" fill="#fff">Oct↔Sym</text>
        </svg>
        Permission Conversion Tool (Octal ↔ Symbolic)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-emerald-700">Octal Permission</label>
          <input
            type="text"
            value={octal}
            onChange={handleOctalChange}
            maxLength={3}
            className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <label className="block mb-2 font-medium text-emerald-700">Symbolic Permission</label>
          <input
            type="text"
            value={symbolic}
            onChange={handleSymbolicChange}
            maxLength={9}
            className="w-full p-3 border rounded font-mono text-xl text-center bg-white border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </div>
      <div className="bg-emerald-800 text-white rounded-lg p-4 shadow mb-4">
        <div className="text-center mb-1 text-emerald-200 font-medium">Breakdown</div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-lg">{octal}</div>
            <div className="text-xs text-emerald-200">Octal</div>
          </div>
          <div className="text-center text-2xl font-bold">↔</div>
          <div className="text-center">
            <div className="font-mono text-lg">{symbolic}</div>
            <div className="text-xs text-emerald-200">Symbolic</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PermissionConversionInfoSections() {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">How Permission Conversion Works</h2>
        <p className="text-gray-700 text-lg">
          Linux file permissions can be represented in both octal (e.g., <code>644</code>) and symbolic (e.g., <code>rw-r--r--</code>) notation. This tool lets you convert between the two instantly.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Octal Notation</h2>
        <p className="text-gray-700 text-lg mb-3">
          Each digit represents permissions for owner, group, and others:
        </p>
        <ul className="list-disc pl-6 text-gray-700">
          <li><strong>4</strong>: read (<code>r</code>)</li>
          <li><strong>2</strong>: write (<code>w</code>)</li>
          <li><strong>1</strong>: execute (<code>x</code>)</li>
        </ul>
        <p className="text-gray-700 mt-3">
          Add the values for each user class. For example, <code>6</code> (4+2) means read and write (<code>rw-</code>).
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Symbolic Notation</h2>
        <p className="text-gray-700 text-lg mb-3">
          Symbolic notation uses <code>r</code> (read), <code>w</code> (write), and <code>x</code> (execute) for each of owner, group, and others. For example, <code>rw-r--r--</code> means owner can read/write, group and others can only read.
        </p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-2 text-emerald-800">Examples</h2>
        <ul className="list-disc pl-6 text-gray-700 text-lg">
          <li><code>755</code> ↔ <code>rwxr-xr-x</code></li>
          <li><code>644</code> ↔ <code>rw-r--r--</code></li>
          <li><code>600</code> ↔ <code>rw-------</code></li>
        </ul>
      </section>
    </>
  );
} 