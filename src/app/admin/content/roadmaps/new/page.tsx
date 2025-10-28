'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import roadmapService from '@/lib/services/roadmapService';
import { validateRoadmapData } from '@/lib/validators/roadmapValidator';

export default function NewRoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: '',
    level: '',
    meta_description: '',
    image_path: '',
    is_published: false
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (session?.user?.role !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when it's edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      // Generate slug from title if slug is empty or was auto-generated
      slug: !prev.slug || prev.slug === createSlug(prev.title) 
        ? createSlug(title) 
        : prev.slug
    }));
  };

  const createSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      console.log("Form submission started");
    
    // Validate form data
    const validationResult = validateRoadmapData(formData);
    if (!validationResult.isValid) {
        console.log("Validation failed:", validationResult.errors);
        
        // Convert the array of errors to an object with field names as keys
        const errorObj: {[key: string]: string} = {};
        validationResult.errors.forEach(err => {
          // Extract field name from error message
          const field = err.toLowerCase().split(' ')[0];
          errorObj[field] = err;
        });
        setErrors(errorObj);
      return;
    }
    
      console.log("Validation passed, submitting form");
      setIsSubmitting(true);
      setFormError('');
      
      const newRoadmap = await roadmapService.createRoadmap(formData);
      
      console.log("Roadmap created:", newRoadmap);
      
      // Show success message before redirecting
      alert('Roadmap created successfully! Redirecting to edit page...');
      
      // Redirect to the edit page for the new roadmap
      router.push(`/admin/content/roadmaps/${newRoadmap.id}`);
    } catch (error: any) {
      console.error('Error creating roadmap:', error);
      setFormError(`Failed to create roadmap: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Roadmap</h1>
        <p className="text-gray-600">Add a new learning roadmap to help users navigate their learning journey</p>
      </div>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Roadmap Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., DevOps Engineer Roadmap"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., devops-engineer"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Used in the URL: /learning-roadmap/your-slug
              </p>
            </div>

            {/* Level */}
            <div className="col-span-1">
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Beginner-Intermediate">Beginner to Intermediate</option>
                <option value="Intermediate-Advanced">Intermediate to Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-500">{errors.level}</p>
              )}
            </div>

            {/* Duration */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., 6-8 months"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the roadmap and what users will learn"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Meta Description */}
            <div className="col-span-2">
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="SEO description (will appear in search results)"
              />
              {errors.meta_description && (
                <p className="mt-1 text-sm text-red-500">{errors.meta_description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Keep it under 160 characters for optimal SEO
              </p>
            </div>

            {/* Image Path */}
            <div className="col-span-2">
              <label htmlFor="image_path" className="block text-sm font-medium text-gray-700 mb-1">
                Image Path
              </label>
              <input
                type="text"
                id="image_path"
                name="image_path"
                value={formData.image_path}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., /images/roadmaps/devops-engineer.jpg"
              />
              {errors.image_path && (
                <p className="mt-1 text-sm text-red-500">{errors.image_path}</p>
              )}
            </div>

            {/* Publish Status */}
            <div className="col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                  Publish this roadmap (make it visible to users)
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href="/admin/content/roadmaps"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Roadmap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 