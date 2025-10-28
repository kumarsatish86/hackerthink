'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// Media item interface
interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  filepath: string;
  type: string;
  size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  alt?: string;
  title?: string;
  description?: string;
  inUseBy?: {
    type: string;
    id: string;
    title: string;
  }[];
}

export default function MediaDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = params;
  
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check user session and fetch data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchMediaItem(id);
      }
    }
  }, [status, session, router, id]);

  // Fetch media item by ID
  const fetchMediaItem = async (mediaId: string) => {
    try {
      setLoading(true);
      
      // Use the general media API and find the specific item
      console.log('=== DEBUGGING MEDIA DETAIL PAGE ===');
      console.log('Looking for media ID:', mediaId);
      alert('Media detail page is loading for ID: ' + mediaId);
      
      const response = await fetch(`/api/media?t=${Date.now()}`);
      console.log('Media API response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch media items');
      }
      
      const data = await response.json();
      console.log('Media API response:', data);
      console.log('All media items:', data.media?.map((item: any) => ({ 
        id: item.id, 
        filename: item.filename 
      })));
      
      // Find the specific media item by ID
      const mediaItems = data.media || [];
      const foundItem = mediaItems.find((item: any) => item.id === mediaId);
      console.log('Found item:', foundItem);
      
      if (foundItem) {
        // Transform the API response to match our interface
        const transformedItem: MediaItem = {
          id: foundItem.id,
          filename: foundItem.filename,
          originalFilename: foundItem.originalFilename || foundItem.filename,
          filepath: foundItem.filepath,
          type: foundItem.type || 'image',
          size: foundItem.size || 0,
          dimensions: foundItem.dimensions,
          mimeType: foundItem.mimeType || foundItem.mime_type || 'image/jpeg',
          uploadedBy: foundItem.uploadedBy || foundItem.uploaded_by || 'Unknown',
          uploadedAt: foundItem.uploadedAt || foundItem.upload_date || new Date().toISOString(),
          alt: foundItem.alt || foundItem.alt_text,
          title: foundItem.title,
          description: foundItem.description,
          inUseBy: [] // TODO: Implement usage tracking
        };
        
        setMediaItem(transformedItem);
        setError(null);
      } else {
        console.log('Media item not found in the list');
        setError('Media item not found');
      }
    } catch (err) {
      console.error('Error fetching media item:', err);
      setError('Failed to load media item. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    if (!mediaItem) return;
    
    if (window.confirm(`Are you sure you want to delete ${mediaItem.filename}?`)) {
      try {
        const response = await fetch(`/api/media?id=${mediaItem.id}`, { 
          method: 'DELETE' 
        });
        
        if (response.ok) {
          toast.success('Media deleted successfully!');
          // Navigate back to the media listing page
          router.push('/admin/media');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete media file');
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item. Please try again.');
      }
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !mediaItem) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Media item not found'}</p>
          <Link href="/admin/media" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
            Return to Media Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="mb-6">
        <Link href="/admin/media" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Media Library
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{mediaItem.filename}</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}${mediaItem.filepath}`);
                  toast.success('URL copied to clipboard!');
                }}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy URL
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            {/* Media Preview */}
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-6">
              {mediaItem.type === 'image' ? (
                <div className="relative h-80 w-full">
                  <Image
                    src={mediaItem.filepath}
                    alt={mediaItem.filename}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="w-full h-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              ) : mediaItem.type === 'document' ? (
                <div className="flex items-center justify-center h-80 bg-gray-100 rounded-md">
                  <svg className="h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 bg-gray-100 rounded-md">
                  <svg className="h-24 w-24 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* File Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">File Details</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Original Filename</dt>
                    <dd className="mt-1 text-sm text-gray-900">{mediaItem.originalFilename}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">MIME Type</dt>
                    <dd className="mt-1 text-sm text-gray-900">{mediaItem.mimeType}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">File Size</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatFileSize(mediaItem.size)}</dd>
                  </div>
                  {mediaItem.dimensions && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
                      <dd className="mt-1 text-sm text-gray-900">{mediaItem.dimensions.width} x {mediaItem.dimensions.height}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{mediaItem.uploadedBy}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Uploaded At</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDistanceToNow(new Date(mediaItem.uploadedAt), { addSuffix: true })}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">File Path</dt>
                    <dd className="mt-1 text-sm text-gray-900 break-all">{mediaItem.filepath}</dd>
                  </div>
                  {(mediaItem.alt || mediaItem.title || mediaItem.description) && (
                    <>
                      {mediaItem.title && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Title</dt>
                          <dd className="mt-1 text-sm text-gray-900">{mediaItem.title}</dd>
                        </div>
                      )}
                      {mediaItem.alt && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Alt Text</dt>
                          <dd className="mt-1 text-sm text-gray-900">{mediaItem.alt}</dd>
                        </div>
                      )}
                      {mediaItem.description && (
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900">{mediaItem.description}</dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>
          
          <div>
            {/* Usage Information */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Usage Information</h3>
                
                {mediaItem.inUseBy && mediaItem.inUseBy.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">
                      This media is being used in {mediaItem.inUseBy.length} location{mediaItem.inUseBy.length !== 1 ? 's' : ''}:
                    </p>
                    <ul className="space-y-3">
                      {mediaItem.inUseBy.map((usage, index) => (
                        <li key={index} className="bg-gray-50 rounded-md p-3">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              {usage.type === 'article' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Article
                                </span>
                              )}
                              {usage.type === 'webstory' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Web Story
                                </span>
                              )}
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">{usage.title}</h4>
                              <Link href={`/admin/content/${usage.type}s/${usage.id}`} className="text-xs text-indigo-600 hover:text-indigo-800">
                                View {usage.type}
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No usage found</h3>
                    <p className="mt-1 text-sm text-gray-500">This media is not currently used in any content.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const altText = mediaItem.alt || mediaItem.title || mediaItem.filename;
                      navigator.clipboard.writeText(`![${altText}](${window.location.origin}${mediaItem.filepath})`);
                      toast.success('Markdown image tag copied to clipboard!');
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Copy as Markdown
                  </button>
                  <button
                    onClick={() => {
                      const altText = mediaItem.alt || mediaItem.title || mediaItem.filename;
                      navigator.clipboard.writeText(`<img src="${window.location.origin}${mediaItem.filepath}" alt="${altText}" />`);
                      toast.success('HTML image tag copied to clipboard!');
                    }}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Copy as HTML
                  </button>
                  {mediaItem.type === 'image' && (
                    <a 
                      href={mediaItem.filepath} 
                      download={mediaItem.filename}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Download Image
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}