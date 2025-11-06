'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SMTPConfig {
  id: number;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  from_email: string;
  from_name: string;
  is_default: boolean;
  is_active: boolean;
}

export default function SMTPConfigsManagement() {
  const [configs, setConfigs] = useState<SMTPConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SMTPConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '587',
    secure: false,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    isDefault: false,
    isActive: true,
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact/smtp-configs');
      if (!response.ok) throw new Error('Failed to fetch SMTP configs');
      const data = await response.json();
      setConfigs(data.configs);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load SMTP configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingConfig
        ? `/api/admin/contact/smtp-configs/${editingConfig.id}`
        : '/api/admin/contact/smtp-configs';
      const method = editingConfig ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          host: formData.host,
          port: parseInt(formData.port, 10),
          secure: formData.secure,
          username: formData.username,
          password: formData.password || undefined,
          fromEmail: formData.fromEmail,
          fromName: formData.fromName,
          isDefault: formData.isDefault,
          isActive: formData.isActive,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save SMTP configuration');
      }

      toast.success(editingConfig ? 'SMTP configuration updated' : 'SMTP configuration created');
      setShowForm(false);
      setEditingConfig(null);
      setFormData({
        name: '',
        host: '',
        port: '587',
        secure: false,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        isDefault: false,
        isActive: true,
      });
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save SMTP configuration');
    }
  };

  const handleEdit = (config: SMTPConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      host: config.host,
      port: config.port.toString(),
      secure: config.secure,
      username: config.username,
      password: '***', // Masked
      fromEmail: config.from_email,
      fromName: config.from_name || '',
      isDefault: config.is_default,
      isActive: config.is_active,
    });
    setShowForm(true);
  };

  const handleTest = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/contact/smtp-configs/${id}`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('SMTP connection test successful!');
      } else {
        toast.error(data.error || 'SMTP connection test failed');
      }
    } catch (error: any) {
      toast.error('Failed to test SMTP connection');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this SMTP configuration?')) return;

    try {
      const response = await fetch(`/api/admin/contact/smtp-configs/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete SMTP configuration');
      }

      toast.success('SMTP configuration deleted');
      fetchConfigs();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete SMTP configuration');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SMTP Configurations</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingConfig(null);
            setFormData({
              name: '',
              host: '',
              port: '587',
              secure: false,
              username: '',
              password: '',
              fromEmail: '',
              fromName: '',
              isDefault: false,
              isActive: true,
            });
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
        >
          Add New Configuration
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingConfig ? 'Edit SMTP Configuration' : 'Create SMTP Configuration'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Host *</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Port *</label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {editingConfig ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required={!editingConfig}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email *</label>
                <input
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                <input
                  type="text"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.secure}
                  onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Secure (SSL/TLS)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Default</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                {editingConfig ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingConfig(null);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Host</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Port</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{config.name}</div>
                    {config.is_default && (
                      <div className="text-xs text-red-600">Default</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{config.host}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{config.port}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{config.from_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${config.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {config.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleTest(config.id)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-red-600 hover:text-red-700 mr-4 transition-colors duration-200"
                    >
                      Edit
                    </button>
                    {!config.is_default && (
                      <button
                        onClick={() => handleDelete(config.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
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

