'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';

export default function AdminSettings() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LinuxConcept',
    siteDescription: 'Learn Linux and IT concepts easily',
    contactEmail: 'contact@ainews.com',
    maxUploadSize: 10
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: 'noreply@ainews.com',
    senderName: 'LinuxConcept'
  });

  const [apiSettings, setApiSettings] = useState({
    recaptchaKey: '',
    maxRequestsPerMinute: 60
  });

  const handleGeneralChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: value
    });
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };

  const handleApiChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiSettings({
      ...apiSettings,
      [name]: value
    });
  };

  const handleSaveSettings = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically save settings to an API or database
    console.log('Saving settings:', {
      general: generalSettings,
      email: emailSettings,
      api: apiSettings
    });
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>
      
      {/* Settings Navigation */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Link 
          href="/admin/settings" 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          General Settings
        </Link>
        <Link 
          href="/admin/settings/appearance" 
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Appearance Settings
        </Link>
        <Link 
          href="/admin/seo" 
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          SEO Settings
        </Link>
      </div>
      
      <form onSubmit={handleSaveSettings}>
        {/* General Settings */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">General Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={generalSettings.siteName}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                />
              </div>

              <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={generalSettings.contactEmail}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Site Description
            </label>
            <textarea
              id="siteDescription"
              name="siteDescription"
              value={generalSettings.siteDescription}
              onChange={handleGeneralChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
            <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 mb-1">
              Max Upload Size (MB)
                </label>
                <input
                  type="number"
              id="maxUploadSize"
              name="maxUploadSize"
              value={generalSettings.maxUploadSize}
              onChange={handleGeneralChange}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Email Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
              <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    id="smtpServer"
                    name="smtpServer"
                    value={emailSettings.smtpServer}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                type="text"
                    id="smtpPort"
                    name="smtpPort"
                    value={emailSettings.smtpPort}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
              <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtpUsername"
                    name="smtpUsername"
                    value={emailSettings.smtpUsername}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    name="smtpPassword"
                    value={emailSettings.smtpPassword}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
              <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    id="senderEmail"
                    name="senderEmail"
                    value={emailSettings.senderEmail}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
                </div>

                <div>
              <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1">
                Sender Name
                  </label>
                    <input
                      type="text"
                id="senderName"
                name="senderName"
                value={emailSettings.senderName}
                onChange={handleEmailChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

        {/* API Settings */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">API & Integration Settings</h2>
          
          <div className="mb-4">
            <label htmlFor="recaptchaKey" className="block text-sm font-medium text-gray-700 mb-1">
              reCAPTCHA Site Key
            </label>
                    <input
              type="text"
              id="recaptchaKey"
              name="recaptchaKey"
              value={apiSettings.recaptchaKey}
              onChange={handleApiChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
                </div>

          <div>
            <label htmlFor="maxRequestsPerMinute" className="block text-sm font-medium text-gray-700 mb-1">
              API Rate Limit (requests per minute)
                    </label>
                    <input
              type="number"
              id="maxRequestsPerMinute"
              name="maxRequestsPerMinute"
              value={apiSettings.maxRequestsPerMinute}
              onChange={handleApiChange}
              min="10"
              max="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
                </div>
              </div>

        {/* Save Button */}
        <div className="flex justify-end">
                <button
                  type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
            Save Settings
                </button>
              </div>
            </form>
    </div>
  );
} 