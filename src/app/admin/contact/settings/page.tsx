'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function ContactSettingsManagement() {
  const [settings, setSettings] = useState({
    spamProtectionType: 'honeypot',
    rateLimitPerHour: '5',
    maxFileSize: '5242880',
    defaultSmtpConfigId: '',
    adminEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/contact/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      
      setSettings({
        spamProtectionType: data.settings.spam_protection_type || 'honeypot',
        rateLimitPerHour: data.settings.rate_limit_per_hour || '5',
        maxFileSize: data.settings.max_file_size || '5242880',
        defaultSmtpConfigId: data.settings.default_smtp_config_id || '',
        adminEmail: data.settings.admin_email || '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await fetch('/api/admin/contact/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spamProtectionType: settings.spamProtectionType,
          rateLimitPerHour: parseInt(settings.rateLimitPerHour, 10),
          maxFileSize: parseInt(settings.maxFileSize, 10),
          defaultSmtpConfigId: settings.defaultSmtpConfigId ? parseInt(settings.defaultSmtpConfigId, 10) : null,
          adminEmail: settings.adminEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('Settings saved successfully');
      fetchSettings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contact Module Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spam Protection Type *
          </label>
          <select
            value={settings.spamProtectionType}
            onChange={(e) => setSettings({ ...settings, spamProtectionType: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="honeypot">Honeypot (Recommended)</option>
            <option value="recaptcha">Google reCAPTCHA v3</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {settings.spamProtectionType === 'honeypot'
              ? 'Honeypot uses a hidden field that bots typically fill out. No external service required.'
              : 'reCAPTCHA requires API keys to be configured in environment variables.'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rate Limit (submissions per hour per IP) *
          </label>
          <input
            type="number"
            value={settings.rateLimitPerHour}
            onChange={(e) => setSettings({ ...settings, rateLimitPerHour: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            min="1"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum number of contact form submissions allowed per IP address per hour.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max File Size (bytes) *
          </label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            min="0"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum file size for attachments (default: 5MB = 5242880 bytes).
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default SMTP Configuration ID
          </label>
          <input
            type="number"
            value={settings.defaultSmtpConfigId}
            onChange={(e) => setSettings({ ...settings, defaultSmtpConfigId: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Leave empty to use environment variables"
          />
          <p className="mt-1 text-sm text-gray-500">
            ID of the default SMTP configuration to use. Leave empty to use environment variables.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email *
          </label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Default email address for admin notifications.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
