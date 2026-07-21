'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  content?: string;
  prerequisites: string;
  learning_objectives: string[];
  level: string;
  duration: number;
  published: boolean;
  featured_image_url?: string;
  created_at: string;
  updated_at: string;
  author_name: string;
}

export default function EditCourse() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    short_description: '',
    content: '',
    prerequisites: '',
    learning_objectives: [] as string[],
    level: 'Beginner',
    duration: 0,
    published: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else if (courseId) {
        fetchCourse();
      }
    }
  }, [status, session, router, courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/courses/${courseId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Course not found');
        }
        throw new Error('Failed to fetch course');
      }

      const data = await response.json();
      setCourse(data.course);

      setFormData({
        title: data.course.title || '',
        slug: data.course.slug || '',
        short_description: data.course.short_description || '',
        content: data.course.content || '',
        prerequisites: data.course.prerequisites || '',
        learning_objectives: data.course.learning_objectives || [],
        level: (() => {
          const raw = String(data.course.level || 'Beginner');
          const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
          return ['Beginner', 'Intermediate', 'Advanced'].includes(normalized)
            ? normalized
            : 'Beginner';
        })(),
        duration: data.course.duration || 0,
        published: data.course.published || false,
      });
    } catch (err: unknown) {
      console.error('Error fetching course:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'duration' ? Number(value) || 0 : value,
      }));
    }
  };

  const handleObjectiveChange = (index: number, value: string) => {
    const newObjectives = [...formData.learning_objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, learning_objectives: newObjectives });
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      learning_objectives: [...formData.learning_objectives, ''],
    });
  };

  const removeObjective = (index: number) => {
    const newObjectives = [...formData.learning_objectives];
    newObjectives.splice(index, 1);
    setFormData({ ...formData, learning_objectives: newObjectives });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update course');
      }

      router.push(`/admin/content/courses/${courseId}`);
    } catch (err: unknown) {
      console.error('Error updating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-red-500" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{error || 'Course not found'}</h1>
        <p className="mt-2 text-sm text-gray-600">Check the URL or return to the courses list.</p>
        <Link
          href="/admin/content/courses"
          className="mt-6 inline-flex rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
              Details
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="font-medium text-gray-900">Edit</li>
        </ol>
      </nav>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <p className="mt-1 text-sm text-gray-600">Update course details and overview content.</p>
        </div>
        <Link
          href={`/admin/content/courses/${courseId}`}
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
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Course basics</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="title" className={labelClass}>
                Title <span className="text-red-600">*</span>
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
              <label htmlFor="slug" className={labelClass}>
                Slug <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className={`mt-1.5 ${inputClass}`}
              />
              <p className={helpClass}>URL-friendly name (e.g. introduction-to-linux).</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Descriptions</h2>

          <div className="mb-6">
            <label htmlFor="short_description" className={labelClass}>
              Short description
            </label>
            <p className={`${helpClass} mb-2`}>Plain-text summary for course listings.</p>
            <textarea
              id="short_description"
              name="short_description"
              rows={4}
              value={formData.short_description}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>

          <div className="mb-6">
            <label className={labelClass}>Course content / overview</label>
            <p className={`${helpClass} mb-2`}>Rich overview shown on the public course page.</p>
            <TipTapEditor
              content={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
              placeholder="Describe what students will learn…"
              height="320px"
              className="shadow-sm"
            />
          </div>

          <div>
            <label htmlFor="prerequisites" className={labelClass}>
              Prerequisites
            </label>
            <textarea
              id="prerequisites"
              name="prerequisites"
              rows={3}
              value={formData.prerequisites}
              onChange={handleInputChange}
              className={`mt-1.5 ${inputClass}`}
            />
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Objectives & meta</h2>

          <div className="mb-6">
            <label className={labelClass}>Learning objectives</label>
            <div className="mt-2 space-y-2">
              {formData.learning_objectives.map((objective, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleObjectiveChange(index, e.target.value)}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeObjective(index)}
                    className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Add objective
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="level" className={labelClass}>
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className={`mt-1.5 ${inputClass}`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

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

            <div className="flex items-end pb-1">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900">
                <input
                  id="published"
                  name="published"
                  type="checkbox"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Published
              </label>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <Link
            href={`/admin/content/courses/${courseId}`}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
