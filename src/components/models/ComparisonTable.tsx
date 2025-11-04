'use client';

import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaTrophy, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import Link from 'next/link';

interface ComparisonModel {
  id: string;
  name: string;
  slug: string;
  [key: string]: any;
}

interface ComparisonTableProps {
  models: ComparisonModel[];
  fields: Array<{
    key: string;
    label: string;
    type?: 'text' | 'number' | 'rating' | 'link' | 'badge' | 'custom';
    format?: (value: any) => string | React.ReactNode;
    compare?: 'higher' | 'lower' | 'equal' | 'none';
    render?: (value: any, model: ComparisonModel, index: number) => React.ReactNode;
  }>;
  showWinner?: boolean;
}

export default function ComparisonTable({
  models,
  fields,
  showWinner = true
}: ComparisonTableProps) {
  if (!models || models.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">No models to compare</p>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const formatRating = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : 'N/A';
  };

  const compareValues = (values: any[], compareType: 'higher' | 'lower' | 'equal' | 'none') => {
    if (compareType === 'none' || values.length < 2) return null;

    const numericValues = values.map(v => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const num = parseFloat(v);
        return isNaN(num) ? null : num;
      }
      return null;
    }).filter(v => v !== null) as number[];

    if (numericValues.length < 2) return null;

    if (compareType === 'higher') {
      const max = Math.max(...numericValues);
      return numericValues.map(v => v === max ? 'winner' : null);
    } else if (compareType === 'lower') {
      const min = Math.min(...numericValues);
      return numericValues.map(v => v === min ? 'winner' : null);
    } else if (compareType === 'equal') {
      const first = numericValues[0];
      const allEqual = numericValues.every(v => v === first);
      return allEqual ? numericValues.map(() => 'winner') : null;
    }

    return null;
  };

  const renderValue = (field: any, value: any, model: ComparisonModel, index: number) => {
    if (field.render) {
      return field.render(value, model, index);
    }

    switch (field.type) {
      case 'rating':
        return (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{formatRating(value)}</span>
          </div>
        );
      case 'number':
        return <span className="font-semibold">{formatNumber(Number(value))}</span>;
      case 'link':
        return value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" 
             className="text-blue-600 hover:text-blue-800 hover:underline">
            {value}
          </a>
        ) : '—';
      case 'badge':
        return value ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            {String(value)}
          </span>
        ) : '—';
      case 'custom':
        return field.format ? field.format(value) : String(value || '—');
      default:
        return <span>{String(value || '—')}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700">Property</th>
              {models.map((model) => (
                <th key={model.id} className="px-6 py-4 text-left font-semibold min-w-[200px]">
                  <Link href={`/models/${model.slug}`} className="flex items-center gap-2 hover:text-red-600 transition-colors">
                    {model.logo_url && (
                      <img src={model.logo_url} alt={model.name} className="w-8 h-8 rounded" />
                    )}
                    <span>{model.name}</span>
                  </Link>
                </th>
              ))}
              {showWinner && fields.some(f => f.compare && f.compare !== 'none') && (
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Winner</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {fields.map((field, fieldIndex) => {
              const values = models.map(model => model[field.key]);
              const winners = field.compare && field.compare !== 'none' 
                ? compareValues(values, field.compare)
                : null;

              return (
                <tr key={fieldIndex} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{field.label}</td>
                  {models.map((model, index) => {
                    const value = model[field.key];
                    const isWinner = winners && winners[index] === 'winner';

                    return (
                      <td 
                        key={model.id} 
                        className={`px-6 py-4 ${
                          isWinner ? 'bg-green-50 font-semibold' : ''
                        }`}
                      >
                        {renderValue(field, value, model, index)}
                      </td>
                    );
                  })}
                  {showWinner && field.compare && field.compare !== 'none' && (
                    <td className="px-6 py-4">
                      {winners && winners.includes('winner') ? (
                        <div className="flex items-center gap-2">
                          {winners.map((winner, idx) => {
                            if (winner === 'winner') {
                              return (
                                <span key={idx} className="text-green-600 font-semibold flex items-center gap-1">
                                  <FaTrophy /> {models[idx].name}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      ) : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

