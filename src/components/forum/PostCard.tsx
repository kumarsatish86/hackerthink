'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FaHeart, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import DOMPurify from 'isomorphic-dompurify';

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

interface PostCardProps {
  post: Post;
  isFirstPost?: boolean;
  threadId: number;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, isFirstPost, threadId, onPostUpdated }: PostCardProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isEditing, setIsEditing] = useState(false);

  const handleLike = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(!isLiked);
        setLikeCount(data.like_count || likeCount + (isLiked ? -1 : 1));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/forum/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (response.ok && onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const isOwner = session?.user?.id === post.author.id.toString();

  // Sanitize HTML content
  const sanitizedContent = DOMPurify.sanitize(post.content);

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${isFirstPost ? 'border-2 border-red-200' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {post.author.avatar_url ? (
            <img
              src={post.author.avatar_url}
              alt={post.author.name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {post.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              {post.author.reputation > 0 && (
                <span className="text-xs text-gray-500">({post.author.reputation})</span>
              )}
              {isFirstPost && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Original Post
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{new Date(post.created_at).toLocaleString()}</span>
              {post.is_edited && (
                <span className="text-xs italic">(edited)</span>
              )}
            </div>
          </div>

          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-3 py-1 rounded-md transition-colors ${
                  isLiked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={!session?.user}
              >
                <FaHeart className="w-4 h-4" />
                <span>{likeCount}</span>
              </button>
            </div>
            {isOwner && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                >
                  <FaEdit className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <FaTrash className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

