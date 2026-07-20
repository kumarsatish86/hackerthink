'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { SeoTxtKind } from '@/lib/seo/txtFileConfig';
import { SEO_TXT_CONFIG } from '@/lib/seo/txtFileConfig';

type Props = {
  kind: SeoTxtKind;
};

export default function SeoTxtEditorPage({ kind }: Props) {
  const config = SEO_TXT_CONFIG[kind];
  const { status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const apiPath = `/api/admin/seo/${kind}`;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      void fetchContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, kind]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(apiPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${config.publicPath}`);
      }
      const data = await response.json();
      setContent(data[config.responseField] || '');
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
    setSuccess(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const response = await fetch(apiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [config.responseField]: content }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || `Failed to save ${config.publicPath}`);
      }
      setSuccess(`${config.publicPath} saved successfully`);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 min-w-0">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
          <p className="text-gray-600">{config.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => void fetchContent()}
            disabled={saving || !isDirty}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !isDirty}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden min-w-0">
        <div className="px-4 py-5 sm:p-6">
          <textarea
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter your ${config.publicPath} content here...`}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm resize-y"
            spellCheck={false}
          />
          <div className="mt-4 text-sm text-gray-500">
            <h3 className="text-sm font-medium text-gray-900">Example {config.publicPath}</h3>
            <pre className="mt-2 bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap break-words">
              {config.example}
            </pre>
            <p className="mt-2">
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-900"
              >
                {config.docsLabel}
              </a>
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !isDirty}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Public {config.publicPath} URL
          </h3>
          <p className="mt-2 max-w-xl text-sm text-gray-500">
            This file is publicly available at:
          </p>
          <div className="mt-3">
            <a
              href={config.publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              View {config.publicPath}
              <svg
                className="ml-2 -mr-0.5 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
