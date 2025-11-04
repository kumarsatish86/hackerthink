'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FaEdit, FaUser, FaComments, FaHeart, FaClock } from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  social_links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  } | null;
  forum_reputation: number;
  forum_post_count: number;
  created_at: string;
  last_active: string | null;
}

interface Activity {
  type: 'thread' | 'post';
  id: number;
  title?: string;
  content?: string;
  thread?: {
    id: number;
    title: string;
    slug: string;
  };
  category?: {
    name: string;
    slug: string;
  };
  created_at: string;
}

interface UserProfileProps {
  userId: number;
}

export default function UserProfile({ userId }: UserProfileProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const isOwnProfile = session?.user?.id === userId.toString();

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/forum/users/${userId}/profile`);
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await fetch(`/api/forum/users/${userId}/activity?type=all&limit=20`);
      const data = await response.json();
      setActivity(data.activity || []);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                <FaUser className="w-12 h-12 text-gray-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {user.bio && (
              <p className="text-gray-700 mb-4">{user.bio}</p>
            )}

            {user.location && (
              <p className="text-sm text-gray-600 mb-4">{user.location}</p>
            )}

            {/* Social Links */}
            {user.social_links && Object.keys(user.social_links).length > 0 && (
              <div className="flex items-center space-x-4 mb-4">
                {user.social_links.twitter && (
                  <a
                    href={user.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Twitter
                  </a>
                )}
                {user.social_links.github && (
                  <a
                    href={user.social_links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    GitHub
                  </a>
                )}
                {user.social_links.website && (
                  <a
                    href={user.social_links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700"
                  >
                    Website
                  </a>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FaComments className="w-4 h-4" />
                <span>{user.forum_post_count} posts</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaHeart className="w-4 h-4" />
                <span>{user.forum_reputation} reputation</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="w-4 h-4" />
                <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activity.length === 0 ? (
            <p className="text-gray-500">No activity yet</p>
          ) : (
            activity.map((item, index) => (
              <div key={`${item.type}-${item.id}-${index}`} className="border-b border-gray-200 pb-4 last:border-0">
                {item.type === 'thread' ? (
                  <div>
                    <Link
                      href={`/forum/thread/${item.thread?.slug || item.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Started {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Link
                      href={`/forum/thread/${item.thread?.slug || item.thread?.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors"
                    >
                      {item.thread?.title || 'Post'}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.content?.substring(0, 200)}...
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Posted {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

