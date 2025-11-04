'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { MediaPicker, MediaItem } from '@/components/MediaPicker';
import toast from 'react-hot-toast';

interface Guest {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  photo_url?: string;
  title?: string;
  company?: string;
  company_url?: string;
  designation?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  bio_summary?: string;
  verified: boolean;
}

export default function GuestEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const guestId = params?.id as string;
  const isNew = guestId === 'new';

  const [guest, setGuest] = useState<Guest>({
    id: '',
    name: '',
    slug: '',
    bio: '',
    photo_url: '',
    title: '',
    company: '',
    company_url: '',
    designation: '',
    social_links: {},
    bio_summary: '',
    verified: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        if (!isNew) {
          fetchGuest();
        } else {
          setLoading(false);
        }
      }
    }
  }, [status, session, router]);

  const fetchGuest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/interviews/guests/${guestId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch guest');
      }
      
      const data = await response.json();
      setGuest(data.guest);
      if (data.guest.photo_url) {
        setImageUrl(data.guest.photo_url);
      }
    } catch (err) {
      console.error('Error fetching guest:', err);
      setError('Failed to load guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'name' && !guest.slug) {
      setGuest(prev => ({ ...prev, [name]: value, slug: generateSlug(value) }));
    } else {
      setGuest(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setGuest(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const handleMediaSelect = (media: MediaItem) => {
    setGuest(prev => ({
      ...prev,
      photo_url: media.url
    }));
    setImageUrl(media.url);
  };

  const handleImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      setGuest(prev => ({
        ...prev,
        photo_url: imageUrl.trim()
      }));
      toast.success('Image URL set');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!guest.name.trim()) {
        toast.error('Name is required');
        return;
      }

      const url = isNew
        ? '/api/admin/interviews/guests'
        : `/api/admin/interviews/guests/${guestId}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save guest');
      }

      toast.success(isNew ? 'Guest created successfully!' : 'Guest updated successfully!');
      router.push('/admin/content/interviews/guests');
    } catch (err) {
      console.error('Error saving guest:', err);
      toast.error('Failed to save guest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/content/interviews/guests"
            className="text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Guests
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold">{isNew ? 'Create Guest' : 'Edit Guest'}</h2>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={guest.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={guest.slug}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={guest.bio}
                onChange={handleChange}
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio Summary
              </label>
              <textarea
                name="bio_summary"
                value={guest.bio_summary}
                onChange={handleChange}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={guest.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., CEO, CTO, Researcher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={guest.designation}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={guest.company}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company URL
              </label>
              <input
                type="url"
                name="company_url"
                value={guest.company_url}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Photo</h3>
            
            <MediaPicker onSelect={handleMediaSelect} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or enter image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleImageUrlSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Set URL
                </button>
              </div>
            </div>

            {guest.photo_url && (
              <div>
                <img
                  src={guest.photo_url}
                  alt={guest.name}
                  className="h-32 w-32 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Social Links</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={guest.social_links?.linkedin || ''}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter/X
                </label>
                <input
                  type="url"
                  value={guest.social_links?.twitter || ''}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub
                </label>
                <input
                  type="url"
                  value={guest.social_links?.github || ''}
                  onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={guest.social_links?.website || ''}
                  onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={guest.verified}
                onChange={(e) => setGuest(prev => ({ ...prev, verified: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Verified</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isNew ? 'Create Guest' : 'Update Guest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

