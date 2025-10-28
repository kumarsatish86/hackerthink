'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
  parent_id: string | null;
}

interface CommentsListProps {
  contentId: string;
  refreshTrigger?: number;
}

export default function CommentsList({ contentId, refreshTrigger = 0 }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/comments?contentId=${contentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        
        const data = await response.json();
        setComments(data.comments || []);
      } catch (err) {
        setError('Error loading comments. Please try again later.');
        console.error('Error fetching comments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [contentId, refreshTrigger]);

  if (isLoading) {
    return <div className="my-6 text-center">Loading comments...</div>;
  }

  if (error) {
    return <div className="my-6 text-red-500">{error}</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="my-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="my-6">
      <h3 className="text-xl font-semibold mb-4">Comments ({comments.length})</h3>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{comment.author_name}</h4>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 