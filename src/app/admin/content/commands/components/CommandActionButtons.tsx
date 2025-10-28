'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Command {
  id: number;
  title: string;
  slug: string;
  published: boolean;
}

interface CommandActionButtonsProps {
  command: Command;
}

export default function CommandActionButtons({ command }: CommandActionButtonsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleTogglePublish = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/commands/${command.id}/toggle-publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        // Refresh the page data
        router.refresh();
      } else {
        console.error('Failed to toggle command publish status');
      }
    } catch (error) {
      console.error('Error toggling command publish status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex space-x-2 justify-end">
      <Link
        href={`/commands/${command.slug}`}
        target="_blank"
        className="text-indigo-600 hover:text-indigo-900"
        title="View"
      >
        <span className="sr-only">View</span>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Link>
      
      <Link
        href={`/admin/content/commands/${command.id}`}
        className="text-blue-600 hover:text-blue-900"
        title="Edit"
      >
        <span className="sr-only">Edit</span>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </Link>
      
      <button
        onClick={handleTogglePublish}
        className={`${command.published ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
        disabled={isLoading}
        title={command.published ? 'Unpublish' : 'Publish'}
      >
        <span className="sr-only">{command.published ? 'Unpublish' : 'Publish'}</span>
        {command.published ? (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      
      <Link
        href={`/admin/content/commands/${command.id}/delete`}
        className="text-red-600 hover:text-red-900"
        title="Delete"
      >
        <span className="sr-only">Delete</span>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Link>
    </div>
  );
} 