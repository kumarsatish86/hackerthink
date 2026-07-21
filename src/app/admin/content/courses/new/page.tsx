'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const TipTapEditor = dynamic(() => import('@/components/TipTapEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-40 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
      Loading editor…
    </div>
  ),
});

const inputClass =
  'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30';

const labelClass = 'block text-sm font-semibold text-gray-900';
const helpClass = 'mt-1.5 text-xs text-gray-600';

export default function CreateCoursePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    content: '',
    level: 'Beginner',
    price: 0,
    discount_price: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: name === 'price' || name === 'discount_price' ? Number(value) || 0 : value,
      };

      if (name === 'title' && value && !prev.slug) {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      return newData;
    });
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      setError('Title and slug are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create course');
      }

      const data = await response.json();
      router.push(`/admin/content/courses/${data.course.id}`);
    } catch (err: unknown) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (session?.user?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-1 text-sm text-gray-600">
            Fill in the basics — you can expand modules and lessons after creating.
          </p>
        </div>
        <Link
          href="/admin/content/courses"
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basics */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Course basics</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="title" className={labelClass}>
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={formData.slug ? undefined : generateSlug}
                placeholder="e.g. Introduction to Machine Learning"
                className={`mt-1.5 ${inputClass}`}
                required
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="slug" className={labelClass}>
                Slug <span className="text-red-600">*</span>
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="introduction-to-machine-learning"
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                >
                  Generate
                </button>
              </div>
              <p className={helpClass}>
                URL-friendly name (e.g. <code className="rounded bg-gray-100 px-1">linux-basics</code>
                ). Leave empty while typing the title to auto-generate.
              </p>
              {formData.slug ? (
                <p className="mt-1 text-xs font-medium text-green-700">Slug: /courses/{formData.slug}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Descriptions with rich editors */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Descriptions</h2>

          <div className="mb-6">
            <label htmlFor="short_description" className={labelClass}>
              Short description
            </label>
            <p className={`${helpClass} mb-2`}>
              Plain-text summary for course listings and cards (keep it concise).
            </p>
            <textarea
              id="short_description"
              name="short_description"
              rows={4}
              value={formData.short_description}
              onChange={handleChange}
              placeholder="A one-paragraph overview for the course catalog…"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Course content / overview</label>
            <p className={`${helpClass} mb-2`}>
              Rich overview on the public course page. Add modules and lessons after creating.
            </p>
            <TipTapEditor
              content={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
              placeholder="Describe what students will learn, prerequisites, and outcomes…"
              height="360px"
              className="shadow-sm"
            />
          </div>
        </section>

        {/* Meta */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Level & pricing</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="level" className={labelClass}>
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className={`mt-1.5 ${inputClass}`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className={labelClass}>
                Price
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-600">
                  $
                </span>
                <input
                  type="number"
                  name="price"
                  id="price"
                  min={0}
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="discount_price" className={labelClass}>
                Discount price
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-gray-600">
                  $
                </span>
                <input
                  type="number"
                  name="discount_price"
                  id="discount_price"
                  min={0}
                  step="0.01"
                  value={formData.discount_price}
                  onChange={handleChange}
                  className={`${inputClass} pl-7`}
                />
              </div>
              <p className={helpClass}>Leave at 0 for no discount.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            href="/admin/content/courses"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}
