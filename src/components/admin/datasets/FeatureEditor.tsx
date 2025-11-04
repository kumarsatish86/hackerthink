'use client';

import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface Feature {
  name: string;
  type: string;
  description?: string;
}

interface FeatureEditorProps {
  features?: any;
  onChange: (features: any) => void;
}

export default function FeatureEditor({ features, onChange }: FeatureEditorProps) {
  const [featureList, setFeatureList] = useState<Feature[]>(
    Array.isArray(features) ? features : []
  );

  const handleAdd = () => {
    const newFeature = { name: '', type: 'text', description: '' };
    const updated = [...featureList, newFeature];
    setFeatureList(updated);
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = featureList.filter((_, i) => i !== index);
    setFeatureList(updated);
    onChange(updated);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const updated = [...featureList];
    (updated[index] as any)[field] = value;
    setFeatureList(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Features</label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          <FaPlus /> Add Feature
        </button>
      </div>

      {featureList.map((feature, index) => (
        <div key={index} className="border rounded p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Feature name"
              value={feature.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            <select
              value={feature.type}
              onChange={(e) => handleChange(index, 'type', e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="datetime">Date/Time</option>
            </select>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-red-600 hover:text-red-800 px-3 py-2"
            >
              <FaTrash />
            </button>
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={feature.description || ''}
            onChange={(e) => handleChange(index, 'description', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}
    </div>
  );
}

