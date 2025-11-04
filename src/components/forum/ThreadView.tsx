'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { FaLock, FaThumbtack, FaCheckCircle, FaHeart, FaBookmark, FaBell, FaReply } from 'react-icons/fa';
import PostCard from './PostCard';
import PostForm from './PostForm';

interface Thread {
  id: number;
  title: string;
  slug: string;
  post_count: number;
  views: number;
  is_locked: boolean;
  is_sticky: boolean;
  is_solved: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: number;
    name: string;
    avatar_url: string | null;
  };
}

interface Post {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  author: {
    id: number;
    name: string;
    avatar_url: string | null;
    reputation: number;
  };
  like_count: number;
  is_liked: boolean;
}

interface ThreadViewProps {
  threadSlug: string;
}

export default function ThreadView({ threadSlug }: ThreadViewProps) {
  const { data: session } = useSession();
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    fetchThread();
  }, [threadSlug]);

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/forum/threads/${threadSlug}`);
      const data = await response.json();
      setThread(data.thread);
    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };

  const fetchPosts = async () => {
    if (!thread) return;
    try {
      const response = await fetch(`/api/forum/posts?threadId=${thread.id}`);
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (thread) {
      fetchPosts();
    }
  }, [thread]);

  const handlePostCreated = () => {
    fetchPosts();
    setShowReplyForm(false);
  };

  const handleSubscribe = async () => {
    if (!session?.user || !thread) return;
    
    try {
      const response = await fetch(`/api/forum/threads/${thread.id}/subscribe`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchThread();
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleBookmark = async () => {
    if (!session?.user || !thread) return;
    
    try {
      const response = await fetch(`/api/forum/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: thread.id }),
      });
      if (response.ok) {
        fetchThread();
      }
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  if (loading || !thread) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thread Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {thread.is_sticky && (
                <FaThumbtack className="w-5 h-5 text-yellow-500" title="Sticky" />
              )}
              {thread.is_locked && (
                <FaLock className="w-5 h-5 text-gray-500" title="Locked" />
              )}
              {thread.is_solved && (
                <FaCheckCircle className="w-5 h-5 text-green-500" title="Solved" />
              )}
              <h1 className="text-3xl font-bold text-gray-900">{thread.title}</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <Link href={`/forum/category/${thread.category.slug}`} className="hover:text-red-600">
                {thread.category.name}
              </Link>
              <span>{thread.post_count} posts</span>
              <span>{thread.views} views</span>
            </div>
          </div>
          {session?.user && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleSubscribe}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Subscribe"
              >
                <FaBell className="w-5 h-5" />
              </button>
              <button
                onClick={handleBookmark}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                title="Bookmark"
              >
                <FaBookmark className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostCard
            key={post.id}
            post={post}
            isFirstPost={index === 0}
            threadId={thread.id}
            onPostUpdated={fetchPosts}
          />
        ))}
      </div>

      {/* Reply Form */}
      {session?.user && !thread.is_locked && (
        <div className="bg-white rounded-lg shadow p-6">
          {!showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <FaReply className="w-4 h-4" />
              <span>Reply</span>
            </button>
          ) : (
            <PostForm
              threadId={thread.id}
              onPostCreated={handlePostCreated}
              onCancel={() => setShowReplyForm(false)}
            />
          )}
        </div>
      )}

      {thread.is_locked && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-700">This thread is locked and cannot receive new replies.</p>
        </div>
      )}
    </div>
  );
}

