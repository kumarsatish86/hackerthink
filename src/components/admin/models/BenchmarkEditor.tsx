'use client';

import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Benchmark {
  name: string;
  score: number;
}

interface BenchmarkEditorProps {
  benchmarks?: Benchmark[];
  onChange: (benchmarks: Benchmark[]) => void;
}

export default function BenchmarkEditor({ benchmarks = [], onChange }: BenchmarkEditorProps) {
  const [benchmarkList, setBenchmarkList] = useState<Benchmark[]>(benchmarks);

  const handleAdd = () => {
    const newBenchmark = { name: '', score: 0 };
    const updated = [...benchmarkList, newBenchmark];
    setBenchmarkList(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = benchmarkList.filter((_, i) => i !== index);
    setBenchmarkList(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: 'name' | 'score', value: string | number) => {
    const updated = [...benchmarkList];
    updated[index][field] = value;
    setBenchmarkList(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Benchmarks</label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          <FaPlus /> Add Benchmark
        </button>
      </div>

      {benchmarkList.map((benchmark, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Benchmark name (e.g., MMLU)"
            value={benchmark.name}
            onChange={(e) => handleChange(index, 'name', e.target.value)}
            className="flex-1 border rounded px-3 py-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Score"
            value={benchmark.score}
            onChange={(e) => handleChange(index, 'score', parseFloat(e.target.value) || 0)}
            className="w-24 border rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="text-red-600 hover:text-red-800 px-3 py-2"
          >
            <FaTrash />
          </button>
        </div>
      ))}
    </div>
  );
}

