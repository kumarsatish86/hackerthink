'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface InquiryType {
  id: number;
  type_name: string;
  email_recipient: string;
  smtp_config_id: number | null;
  smtp_config_name?: string;
  is_active: boolean;
}

export default function InquiryTypesManagement() {
  const [types, setTypes] = useState<InquiryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<InquiryType | null>(null);
  const [formData, setFormData] = useState({
    typeName: '',
    emailRecipient: '',
    smtpConfigId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact/types');
      if (!response.ok) throw new Error('Failed to fetch types');
      const data = await response.json();
      setTypes(data.types);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load inquiry types');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingType
        ? '/api/admin/contact/types'
        : '/api/admin/contact/types';
      const method = editingType ? 'PATCH' : 'POST';

      const body: any = editingType
        ? {
            id: editingType.id,
            typeName: formData.typeName,
            emailRecipient: formData.emailRecipient,
            smtpConfigId: formData.smtpConfigId ? parseInt(formData.smtpConfigId, 10) : null,
            isActive: formData.isActive,
          }
        : {
            typeName: formData.typeName,
            emailRecipient: formData.emailRecipient,
            smtpConfigId: formData.smtpConfigId ? parseInt(formData.smtpConfigId, 10) : null,
            isActive: formData.isActive,
          };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save inquiry type');
      }

      toast.success(editingType ? 'Inquiry type updated' : 'Inquiry type created');
      setShowForm(false);
      setEditingType(null);
      setFormData({ typeName: '', emailRecipient: '', smtpConfigId: '', isActive: true });
      fetchTypes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save inquiry type');
    }
  };

  const handleEdit = (type: InquiryType) => {
    setEditingType(type);
    setFormData({
      typeName: type.type_name,
      emailRecipient: type.email_recipient,
      smtpConfigId: type.smtp_config_id?.toString() || '',
      isActive: type.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inquiry type?')) return;

    try {
      const response = await fetch(`/api/admin/contact/types?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete inquiry type');
      }

      toast.success('Inquiry type deleted');
      fetchTypes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete inquiry type');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inquiry Types Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingType(null);
            setFormData({ typeName: '', emailRecipient: '', smtpConfigId: '', isActive: true });
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Add New Type
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingType ? 'Edit Inquiry Type' : 'Create Inquiry Type'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Name *
              </label>
              <input
                type="text"
                value={formData.typeName}
                onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Recipient *
              </label>
              <input
                type="email"
                value={formData.emailRecipient}
                onChange={(e) => setFormData({ ...formData, emailRecipient: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Configuration (Optional)
              </label>
              <input
                type="number"
                value={formData.smtpConfigId}
                onChange={(e) => setFormData({ ...formData, smtpConfigId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="SMTP Config ID"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                {editingType ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingType(null);
                  setFormData({ typeName: '', emailRecipient: '', smtpConfigId: '', isActive: true });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Recipient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SMTP Config</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {types.map((type) => (
                <tr key={type.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{type.type_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{type.email_recipient}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {type.smtp_config_name || 'Default'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${type.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {type.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(type)}
                      className="text-red-600 hover:text-red-700 mr-4 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

