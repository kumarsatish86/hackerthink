'use client';

import React, { useMemo } from 'react';
import { FaTrophy } from 'react-icons/fa';
import Link from 'next/link';

export interface ComparisonModel {
  id: string;
  name: string;
  slug: string;
  [key: string]: any;
}

export type CompareField = {
  key: string;
  label: string;
  category?: string;
  type?: 'text' | 'number' | 'rating' | 'link' | 'badge' | 'custom' | 'list' | 'boolean';
  format?: (value: any) => string | React.ReactNode;
  compare?: 'higher' | 'lower' | 'equal' | 'none';
  /** Numeric extractor for winner logic (e.g. "8B" → 8). */
  compareValue?: (value: any, model: ComparisonModel) => number | null;
  render?: (value: any, model: ComparisonModel, index: number) => React.ReactNode;
  /** Hide row when every model has an empty value (default true). */
  hideIfEmpty?: boolean;
};

interface ComparisonTableProps {
  models: ComparisonModel[];
  fields: CompareField[];
  showWinner?: boolean;
}

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '' || value === '—';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value as object).length === 0;
  if (typeof value === 'number') return Number.isNaN(value);
  if (typeof value === 'boolean') return false;
  return false;
}

export default function ComparisonTable({
  models,
  fields,
  showWinner = true,
}: ComparisonTableProps) {
  const visibleFields = useMemo(() => {
    return fields.filter((field) => {
      if (field.hideIfEmpty === false) return true;
      const hide = field.hideIfEmpty !== false;
      if (!hide) return true;
      return models.some((m) => !isEmptyValue(m[field.key]));
    });
  }, [fields, models]);

  const grouped = useMemo(() => {
    const groups: Array<{ category: string | null; fields: CompareField[] }> = [];
    for (const field of visibleFields) {
      const cat = field.category || null;
      const last = groups[groups.length - 1];
      if (last && last.category === cat) {
        last.fields.push(field);
      } else {
        groups.push({ category: cat, fields: [field] });
      }
    }
    return groups;
  }, [visibleFields]);

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

  const compareValues = (field: CompareField, values: any[], modelsForField: ComparisonModel[]) => {
    if (!field.compare || field.compare === 'none' || values.length < 2) return null;

    const numericValues = values.map((v, i) => {
      if (field.compareValue) return field.compareValue(v, modelsForField[i]);
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'boolean') return v ? 1 : 0;
      if (typeof v === 'string') {
        const num = parseFloat(v.replace(/,/g, ''));
        return Number.isFinite(num) ? num : null;
      }
      return null;
    });

    const present = numericValues.filter((v): v is number => v != null && Number.isFinite(v));
    if (present.length < 2) return null;

    if (field.compare === 'higher') {
      const max = Math.max(...present);
      return numericValues.map((v) => (v != null && v === max ? 'winner' : null));
    }
    if (field.compare === 'lower') {
      const min = Math.min(...present);
      return numericValues.map((v) => (v != null && v === min ? 'winner' : null));
    }
    if (field.compare === 'equal') {
      const first = present[0];
      const allEqual = present.every((v) => v === first);
      return allEqual ? numericValues.map((v) => (v != null ? 'winner' : null)) : null;
    }
    return null;
  };

  const renderValue = (field: CompareField, value: any, model: ComparisonModel, index: number) => {
    if (field.render) return field.render(value, model, index);

    switch (field.type) {
      case 'rating':
        return (
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">★</span>
            <span className="font-semibold">{formatRating(value)}</span>
          </div>
        );
      case 'number':
        return <span className="font-semibold">{formatNumber(Number(value) || 0)}</span>;
      case 'boolean':
        if (value == null) return '—';
        return (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {value ? 'Yes' : 'No'}
          </span>
        );
      case 'list': {
        const items = Array.isArray(value)
          ? value
          : typeof value === 'string' && value
            ? value.split(',').map((s) => s.trim()).filter(Boolean)
            : [];
        if (!items.length) return '—';
        return (
          <div className="flex flex-wrap gap-1">
            {items.slice(0, 8).map((item, i) => (
              <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                {String(item)}
              </span>
            ))}
            {items.length > 8 && (
              <span className="text-xs text-gray-500">+{items.length - 8}</span>
            )}
          </div>
        );
      }
      case 'link':
        return value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline break-all"
          >
            Open
          </a>
        ) : (
          '—'
        );
      case 'badge':
        return value ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{String(value)}</span>
        ) : (
          '—'
        );
      case 'custom':
        return field.format ? field.format(value) : String(value || '—');
      default:
        return <span>{value == null || value === '' ? '—' : String(value)}</span>;
    }
  };

  const winnerCol =
    showWinner && visibleFields.some((f) => f.compare && f.compare !== 'none');
  const colSpan = models.length + 1 + (winnerCol ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                Property
              </th>
              {models.map((model) => (
                <th key={model.id} className="px-6 py-4 text-left font-semibold min-w-[200px]">
                  <Link
                    href={`/models/${model.slug}`}
                    className="flex items-center gap-2 hover:text-red-600 transition-colors"
                  >
                    {model.logo_url && (
                      <img src={model.logo_url} alt={model.name} className="w-8 h-8 rounded" />
                    )}
                    <span>{model.name}</span>
                  </Link>
                </th>
              ))}
              {winnerCol && (
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Winner</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {grouped.map((group, gi) => (
              <React.Fragment key={`g-${gi}-${group.category || 'general'}`}>
                {group.category && (
                  <tr className="bg-red-50/80">
                    <td
                      colSpan={colSpan}
                      className="px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-red-800"
                    >
                      {group.category}
                    </td>
                  </tr>
                )}
                {group.fields.map((field, fieldIndex) => {
                  const values = models.map((model) => model[field.key]);
                  const winners =
                    field.compare && field.compare !== 'none'
                      ? compareValues(field, values, models)
                      : null;

                  return (
                    <tr
                      key={`${field.key}-${fieldIndex}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3.5 font-medium text-gray-900 sticky left-0 bg-white z-10">
                        {field.label}
                      </td>
                      {models.map((model, index) => {
                        const value = model[field.key];
                        const isWinner = winners && winners[index] === 'winner';
                        return (
                          <td
                            key={model.id}
                            className={`px-6 py-3.5 ${isWinner ? 'bg-green-50 font-semibold' : ''}`}
                          >
                            {renderValue(field, value, model, index)}
                          </td>
                        );
                      })}
                      {winnerCol && (
                        <td className="px-6 py-3.5">
                          {field.compare && field.compare !== 'none' ? (
                            winners && winners.includes('winner') ? (
                              <div className="flex flex-col gap-1">
                                {winners.map((winner, idx) =>
                                  winner === 'winner' ? (
                                    <span
                                      key={idx}
                                      className="text-green-600 font-semibold flex items-center gap-1 text-sm"
                                    >
                                      <FaTrophy className="flex-shrink-0" /> {models[idx].name}
                                    </span>
                                  ) : null
                                )}
                              </div>
                            ) : (
                              '—'
                            )
                          ) : null}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {visibleFields.length === 0 && (
        <div className="p-6 text-center text-gray-500 text-sm">No comparable properties found.</div>
      )}
    </div>
  );
}
