'use client';

import { useState, useEffect } from 'react';
import CommentForm from './CommentForm';
import CommentsList from './CommentsList';
import { Toaster } from 'react-hot-toast';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

interface CommentsSectionProps {
  contentId: string | number;
  contentType: string;
}

export default function CommentsSection({ contentId, contentType }: CommentsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formattedContentId, setFormattedContentId] = useState<string>('');
  
  // Convert numeric IDs to UUIDs for content compatibility
  useEffect(() => {
    // If contentId is already a UUID string, use it directly
    if (typeof contentId === 'string' && contentId.includes('-')) {
      setFormattedContentId(contentId);
    } else {
      // Use a deterministic UUID namespace
      const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Standard DNS namespace
      
      // Create a deterministic string based on the content type and ID
      const baseStr = `${contentType}-${contentId}`;
      
      // Generate a deterministic v5 UUID based on the string and namespace
      const deterministicUUID = uuidv5(baseStr, NAMESPACE);
      setFormattedContentId(deterministicUUID);
      
      console.log(`Converting content ID ${contentId} to UUID: ${deterministicUUID}`);
    }
  }, [contentId, contentType]);
  
  const handleCommentSubmitted = () => {
    // Increment to trigger a refresh of the comments list
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (!formattedContentId) {
    return <div>Loading comments section...</div>;
  }
  
  return (
    <section className="max-w-4xl mx-auto my-8 px-4">
      <Toaster position="top-right" />
      
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        
        <CommentForm 
          contentId={formattedContentId} 
          onCommentSubmitted={handleCommentSubmitted} 
        />
        
        <CommentsList 
          contentId={formattedContentId} 
          refreshTrigger={refreshTrigger}
        />
      </div>
    </section>
  );
} 