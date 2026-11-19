'use client';

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from 'react';
import Image from 'next/image';

export default function AppearanceSettings() {
  const [settings, setSettings] = useState({
    siteLogo: '/images/default-logo.png',
    favicon: '/images/favicon.ico',
    primaryColor: '#3b82f6',
    secondaryColor: '#6366f1',
    footerText: '© 2023 HackerThink. All rights reserved.'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<'filesystem' | 'database'>('filesystem');
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);

  // Load existing settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/settings/appearance');
        
        if (!response.ok) {
          throw new Error('Failed to load settings');
        }
        
        const data = await response.json();
        console.log('Loaded settings:', data.settings);
        
        if (data.settings) {
          setSettings({
            siteLogo: data.settings.logo_path || '/images/default-logo.png',
            favicon: data.settings.favicon_path || '/images/favicon.ico',
            primaryColor: data.settings.primary_color || '#3b82f6',
            secondaryColor: data.settings.secondary_color || '#6366f1',
            footerText: data.settings.footer_text || '© 2023 HackerThink. All rights reserved.'
          });
          
          // Set previews for existing images
          if (data.settings.logo_path) {
            setLogoPreview(data.settings.logo_path);
          }
          
          if (data.settings.favicon_path) {
            setFaviconPreview(data.settings.favicon_path);
          }

          if (data.settings.footer_logo_path) {
            setFooterLogoPreview(data.settings.footer_logo_path);
          }
        }

        if (data.storage?.mode === 'database' || data.storage?.mode === 'filesystem') {
          setStorageMode(data.storage.mode);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        setErrorMessage('Failed to load existing settings');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|png|svg\+xml|gif)/)) {
      setErrorMessage('Logo must be an image file (JPEG, PNG, SVG, or GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Logo file size must be under 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMessage('');
  };

  const handleFooterLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/(jpeg|png|svg\+xml|gif|webp)/)) {
      setErrorMessage('Footer logo must be an image file (JPEG, PNG, SVG, GIF, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Footer logo file size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFooterLogoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMessage('');
  };

  const handleFaviconChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (browsers often report empty or octet-stream for .ico)
    const okType =
      !file.type ||
      /image\/(x-icon|vnd\.microsoft\.icon|png|svg\+xml|webp|jpeg|jpg|gif)/i.test(file.type) ||
      /\.(ico|png|svg|webp|jpe?g|gif)$/i.test(file.name);
    if (!okType) {
      setErrorMessage('Favicon must be an ICO, PNG, SVG, WEBP, or JPEG file');
      return;
    }

    // Validate file size (1MB max)
    if (file.size > 1 * 1024 * 1024) {
      setErrorMessage('Favicon file size must be under 1MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFaviconPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMessage('');
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      formData.append('primaryColor', settings.primaryColor);
      formData.append('secondaryColor', settings.secondaryColor);
      formData.append('footerText', settings.footerText);

      // Add logo file if it exists
      if (logoInputRef.current?.files?.[0]) {
        formData.append('logo', logoInputRef.current.files[0]);
      }

      // Add favicon file if it exists
      if (faviconInputRef.current?.files?.[0]) {
        formData.append('favicon', faviconInputRef.current.files[0]);
      }

      if (footerLogoInputRef.current?.files?.[0]) {
        formData.append('footerLogo', footerLogoInputRef.current.files[0]);
      }

      console.log('Submitting settings form data...');

      // Send to API endpoint
      const response = await fetch('/api/admin/settings/appearance', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save settings');
      }
      
      console.log('Settings saved successfully:', data);
      setSuccessMessage('Appearance settings saved successfully!');

      if (data.settings?.logo_path) {
        setLogoPreview(data.settings.logo_path);
        setSettings((prev) => ({ ...prev, siteLogo: data.settings.logo_path }));
      }
      if (data.settings?.favicon_path) {
        setFaviconPreview(data.settings.favicon_path);
        setSettings((prev) => ({ ...prev, favicon: data.settings.favicon_path }));
      }
      if (data.settings?.footer_logo_path) {
        setFooterLogoPreview(data.settings.footer_logo_path);
      }

      if (logoInputRef.current) logoInputRef.current.value = '';
      if (faviconInputRef.current) faviconInputRef.current.value = '';
      if (footerLogoInputRef.current) footerLogoInputRef.current.value = '';
      
      // Refresh so public layout picks up new favicon/logo paths
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      setErrorMessage(`Error saving appearance settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Site Appearance Settings</h1>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errorMessage}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <span className="ml-3 text-lg text-gray-700">Loading settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Site Identity</h2>

            <div className={`mb-6 rounded-md border px-4 py-3 text-sm ${
              storageMode === 'database'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}>
              Upload storage:{' '}
              <strong>{storageMode === 'database' ? 'Database' : 'Local filesystem'}</strong>
              {' · '}
              Change this under{' '}
              <a href="/admin/integrations/other" className="text-red-600 underline">
                Integrations → Other → Database Asset Storage
              </a>
              .
            </div>
            
            {/* Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Logo
              </label>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-56 h-24 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden rounded-md px-2">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={() => setLogoPreview(null)}
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs mt-1">No logo</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow space-y-3">
                  <input
                    type="file"
                    id="logo"
                    ref={logoInputRef}
                    onChange={handleLogoChange}
                    accept="image/png, image/jpeg, image/svg+xml, image/gif"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended size: 500×75 pixels (wide). Max file size: 5MB. Supported formats: PNG, JPEG, SVG, GIF.
                  </p>
                  <p className="text-xs text-gray-500">
                    This logo appears in the site header at up to 500×75 pixels.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Logo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Logo
              </label>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-56 h-24 bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden rounded-md px-2">
                  {footerLogoPreview ? (
                    <img 
                      src={footerLogoPreview} 
                      alt="Footer Logo Preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={() => setFooterLogoPreview(null)}
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs mt-1">No footer logo</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow space-y-3">
                  <input
                    type="file"
                    id="footerLogo"
                    ref={footerLogoInputRef}
                    onChange={handleFooterLogoChange}
                    accept="image/png, image/jpeg, image/svg+xml, image/gif, image/webp"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended size: 500×75 pixels. Max 5MB. Use a light/white version for the dark footer.
                  </p>
                  <p className="text-xs text-gray-500">
                    Optional. If empty, the footer falls back to the site logo or site name text.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Favicon Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden rounded-md">
                  {faviconPreview ? (
                    <img 
                      src={faviconPreview} 
                      alt="Favicon Preview" 
                      className="max-w-full max-h-full object-contain"
                      onError={() => setFaviconPreview(null)}
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs mt-1">No icon</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow space-y-3">
                  <input
                    type="file"
                    id="favicon"
                    ref={faviconInputRef}
                    onChange={handleFaviconChange}
                    accept=".ico,.png,.svg,.webp,.jpg,.jpeg,image/x-icon,image/vnd.microsoft.icon,image/png,image/svg+xml,image/webp,image/jpeg"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-600 hover:file:bg-red-100"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended size: 32x32 pixels. Max file size: 1MB. Supported formats: ICO, PNG, SVG, WEBP, JPEG.
                  </p>
                  <p className="text-xs text-gray-500">
                    This icon will appear in browser tabs and bookmarks.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Theme Colors */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Theme Colors</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-10 border border-gray-300 rounded-l-md"
                  />
                  <input
                    type="text"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                    name="primaryColor"
                    className="flex-grow px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                <div className="flex">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleInputChange}
                    className="h-10 w-10 border border-gray-300 rounded-l-md"
                  />
                  <input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={handleInputChange}
                    name="secondaryColor"
                    className="flex-grow px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer Text */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Footer Settings</h2>
            
            <div className="mb-4">
              <label htmlFor="footerText" className="block text-sm font-medium text-gray-700 mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                id="footerText"
                name="footerText"
                value={settings.footerText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 
