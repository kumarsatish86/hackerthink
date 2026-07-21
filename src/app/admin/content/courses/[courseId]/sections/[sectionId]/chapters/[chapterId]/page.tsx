'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-500">
      Loading editor…
    </div>
  ),
});

const inputClass =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30';
const labelClass = 'block text-sm font-semibold text-gray-900';
const helpClass = 'mt-1.5 text-xs text-gray-600';

interface Chapter {
  id: string;
  section_id: string;
  title: string;
  content: string;
  content_type: string;
  video_url: string;
  duration: number;
  is_free_preview: boolean;
  order_index: number;
}

export default function ChapterEditor() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const chapterId = params.chapterId as string;
  const isNewChapter = chapterId === 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(!isNewChapter);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    content_type: 'text',
    video_url: '',
    duration: 0,
    is_free_preview: false,
    order_index: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (!isNewChapter) {
        fetchChapterDetails();
      } else {
        fetchNextOrderIndex();
      }
    }
  }, [status, session, router, courseId, sectionId, chapterId, isNewChapter]);

  const fetchChapterDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chapter details. Status: ${response.status}`);
      }

      const data = await response.json();
      setChapter(data.chapter);
      setFormData({
        title: data.chapter.title,
        content: data.chapter.content || '',
        content_type: data.chapter.content_type || 'text',
        video_url: data.chapter.video_url || '',
        duration: data.chapter.duration || 0,
        is_free_preview: data.chapter.is_free_preview || false,
        order_index: data.chapter.order_index,
      });
    } catch (err) {
      console.error('Error fetching chapter details:', err);
      setError('Failed to load chapter details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextOrderIndex = async () => {
    try {
      const response = await fetch(
        `/api/admin/courses/${courseId}/sections/${sectionId}/chapters`
      );

      if (response.ok) {
        const data = await response.json();
        const nextIndex = data.chapters?.length || 0;
        setFormData((prev) => ({
          ...prev,
          order_index: nextIndex,
        }));
      }
    } catch (err) {
      console.error('Error fetching chapters for order index:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? Number(value) || 0
            : value,
    }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('PDF must be 25MB or smaller.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const body = new FormData();
      body.append('file', file);

      const response = await fetch('/api/media', {
        method: 'POST',
        body,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload PDF');
      }

      const data = await response.json();
      const url = data.filepath || data.file?.filepath || data.media?.filepath;
      if (!url) throw new Error('Upload succeeded but no file URL was returned');

      setFormData((prev) => ({ ...prev, content: url }));
    } catch (err: unknown) {
      console.error('PDF upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload PDF');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.content_type === 'pdf' && !formData.content.trim()) {
      setError('Add a PDF URL or upload a PDF file.');
      return;
    }
    if (formData.content_type === 'video' && !formData.video_url.trim()) {
      setError('Enter a video URL.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const method = isNewChapter ? 'POST' : 'PUT';
      const url = isNewChapter
        ? `/api/admin/courses/${courseId}/sections/${sectionId}/chapters`
        : `/api/admin/courses/${courseId}/sections/${sectionId}/chapters/${chapterId}`;

      const payload = {
        ...formData,
        video_url: formData.content_type === 'video' ? formData.video_url : '',
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isNewChapter ? 'create' : 'update'} chapter`);
      }

      const data = await response.json();

      if (isNewChapter) {
        router.push(
          `/admin/content/courses/${courseId}/sections/${sectionId}/chapters/${data.chapter.id}`
        );
      } else {
        setChapter(data.chapter);
        alert('Chapter updated successfully');
      }
    } catch (err) {
      console.error(`Error ${isNewChapter ? 'creating' : 'updating'} chapter:`, err);
      setError(`Failed to ${isNewChapter ? 'create' : 'update'} chapter. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex flex-wrap gap-2 text-sm text-gray-600">
          <li>
            <Link href="/admin/content/courses" className="hover:text-gray-900">
              Courses
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href={`/admin/content/courses/${courseId}`} className="hover:text-gray-900">
              Course Details
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              href={`/admin/content/courses/${courseId}/sections/${sectionId}`}
              className="hover:text-gray-900"
            >
              Section Editor
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="font-medium text-gray-900">
            {isNewChapter ? 'New Chapter' : 'Chapter Editor'}
          </li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isNewChapter ? 'Create New Chapter' : 'Edit Chapter'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isNewChapter
            ? 'Add a lesson with text, video, PDF, or an external link.'
            : 'Update chapter content and settings.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="title" className={labelClass}>
            Chapter Title <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <div>
          <label htmlFor="content_type" className={labelClass}>
            Content Type
          </label>
          <select
            id="content_type"
            name="content_type"
            value={formData.content_type}
            onChange={handleInputChange}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="text">Text</option>
            <option value="video">Video</option>
            <option value="pdf">PDF</option>
            <option value="external_resource">External Resource</option>
          </select>
        </div>

        {formData.content_type === 'video' && (
          <div>
            <label htmlFor="video_url" className={labelClass}>
              Video URL <span className="text-red-600">*</span>
            </label>
            <input
              type="url"
              name="video_url"
              id="video_url"
              value={formData.video_url}
              onChange={handleInputChange}
              placeholder="https://www.youtube.com/watch?v=…"
              className={`mt-1.5 ${inputClass}`}
              required
            />
            <p className={helpClass}>YouTube, Vimeo, or a direct video link.</p>
          </div>
        )}

        {formData.content_type === 'pdf' && (
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <label htmlFor="pdf_url" className={labelClass}>
                PDF URL <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="pdf_url"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className={`mt-1.5 ${inputClass}`}
                placeholder="https://example.com/lesson.pdf or /api/uploads/documents/…"
              />
              <p className={helpClass}>Paste a public PDF link, or upload a file below.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handlePdfUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload PDF'}
              </button>
              {formData.content ? (
                <a
                  href={formData.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-red-700 hover:underline"
                >
                  Preview current PDF
                </a>
              ) : null}
            </div>
          </div>
        )}

        {(formData.content_type === 'text' ||
          formData.content_type === 'external_resource') && (
          <div>
            <label className={labelClass}>
              {formData.content_type === 'external_resource' ? 'Resource details' : 'Content'}
            </label>
            <p className={`${helpClass} mb-2`}>
              {formData.content_type === 'external_resource'
                ? 'Describe the resource and include links.'
                : 'Write the lesson content with formatting.'}
            </p>
            <TipTapEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Start writing…"
              height="320px"
              className="shadow-sm"
            />
          </div>
        )}

        {formData.content_type === 'video' && (
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <p className={`${helpClass} mb-2`}>Extra text shown with the video.</p>
            <TipTapEditor
              content={formData.content}
              onChange={handleContentChange}
              placeholder="Optional notes…"
              height="200px"
              className="shadow-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="duration" className={labelClass}>
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              id="duration"
              min={0}
              value={formData.duration}
              onChange={handleInputChange}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>

          <div>
            <label htmlFor="order_index" className={labelClass}>
              Order
            </label>
            <input
              type="number"
              name="order_index"
              id="order_index"
              min={0}
              value={formData.order_index}
              onChange={handleInputChange}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
        </div>

        <div className="flex items-start gap-3">
          <input
            id="is_free_preview"
            name="is_free_preview"
            type="checkbox"
            checked={formData.is_free_preview}
            onChange={handleInputChange}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <div>
            <label htmlFor="is_free_preview" className="text-sm font-semibold text-gray-900">
              Free Preview
            </label>
            <p className="text-xs text-gray-600">
              Make this chapter available as a free preview for non-enrolled students.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            href={`/admin/content/courses/${courseId}/sections/${sectionId}`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : isNewChapter ? 'Create Chapter' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
