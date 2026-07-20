'use client';

import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaSave, FaTimes, FaEdit, FaSpinner } from 'react-icons/fa';

export type RelationFieldType = 'text' | 'textarea' | 'code' | 'number' | 'select' | 'checkbox' | 'date';

export interface RelationField {
  key: string;
  label: string;
  type?: RelationFieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  span?: 1 | 2; // grid column span in the edit form
}

interface RelationsManagerProps {
  slug: string;
  type: string;
  title: string;
  description?: string;
  fields: RelationField[];
  /** Column keys (subset of fields, in order) rendered in the summary table. */
  listColumns?: string[];
  emptyLabel?: string;
}

interface RelationRow {
  id: string;
  [key: string]: any;
}

const emptyRowFromFields = (fields: RelationField[]): Record<string, any> => {
  const row: Record<string, any> = {};
  for (const field of fields) {
    row[field.key] = field.type === 'checkbox' ? false : '';
  }
  return row;
};

export default function RelationsManager({
  slug,
  type,
  title,
  description,
  fields,
  listColumns,
  emptyLabel = 'No entries yet.',
}: RelationsManagerProps) {
  const [rows, setRows] = useState<RelationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, any>>(emptyRowFromFields(fields));

  const columns = listColumns && listColumns.length ? listColumns : fields.slice(0, 3).map((f) => f.key);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/models/${slug}/relations?type=${type}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setRows(data.rows || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, type]);

  const resetForm = () => {
    setFormValues(emptyRowFromFields(fields));
    setEditingId(null);
    setShowAddForm(false);
  };

  const startEdit = (row: RelationRow) => {
    const next: Record<string, any> = {};
    for (const field of fields) {
      next[field.key] = row[field.key] ?? (field.type === 'checkbox' ? false : '');
    }
    setFormValues(next);
    setEditingId(row.id);
    setShowAddForm(true);
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, ...formValues } : formValues;
      const res = await fetch(`/api/admin/models/${slug}/relations?type=${type}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      resetForm();
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/admin/models/${slug}/relations?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
    } catch (err: any) {
      setError(err.message || 'Failed to delete entry');
    }
  };

  const renderCell = (row: RelationRow, key: string) => {
    const value = row[key];
    if (value === null || value === undefined || value === '') return <span className="text-gray-400">—</span>;
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    const str = String(value);
    return str.length > 80 ? `${str.slice(0, 80)}…` : str;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm whitespace-nowrap"
          >
            <FaPlus /> Add
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={field.span === 2 ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500"> *</span>}
                </label>
                {field.type === 'textarea' || field.type === 'code' ? (
                  <textarea
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={field.type === 'code' ? 6 : 3}
                    className={`w-full border rounded-lg px-3 py-2 text-sm ${field.type === 'code' ? 'font-mono' : ''}`}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    required={field.required}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select…</option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'checkbox' ? (
                  <div className="flex items-center h-9">
                    <input
                      type="checkbox"
                      checked={Boolean(formValues[field.key])}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm text-gray-600">Enabled</span>
                  </div>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                ) : field.type === 'date' ? (
                  <input
                    type="date"
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={formValues[field.key] ?? ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              {editingId ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              <FaTimes /> Cancel
            </button>
          </div>
        </form>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-3 py-2 text-left font-medium text-gray-700">
                  {fields.find((f) => f.key === col)?.label || col}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-gray-500">
                  <FaSpinner className="animate-spin inline mr-2" /> Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-gray-500">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-2 text-gray-700 align-top">
                      {renderCell(row, col)}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
