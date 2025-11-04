'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTimes } from 'react-icons/fa';
import RichTextEditor from './RichTextEditor';

interface PostFormProps {
  threadId?: number;
  categoryId?: number;
  onPostCreated?: () => void;
  onCancel?: () => void;
  isReply?: boolean;
}

export default function PostForm({ threadId, categoryId, onPostCreated, onCancel, isReply = true }: PostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isReply && threadId) {
        // Reply to thread
        const response = await fetch('/api/forum/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ thread_id: threadId, content }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create post');
        }

        if (onPostCreated) {
          onPostCreated();
        }
      } else if (categoryId) {
        // Create new thread
        if (!title.trim()) {
          throw new Error('Title is required');
        }

        const response = await fetch('/api/forum/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, category_id: categoryId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create thread');
        }

        const data = await response.json();
        router.push(`/forum/thread/${data.thread.slug}`);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isReply && (
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
            placeholder="Enter thread title..."
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          {isReply ? 'Reply' : 'Content'}
        </label>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder={isReply ? 'Write your reply...' : 'Write your post...'}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end space-x-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : isReply ? 'Reply' : 'Create Thread'}
        </button>
      </div>
    </form>
  );
}

