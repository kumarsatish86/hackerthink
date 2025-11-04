'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// Media types
type MediaType = 'image' | 'document' | 'webstory';

// Media item interface
interface MediaItem {
  id: string;
  filename: string;
  originalFilename: string;
  filepath: string;
  type: MediaType;
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

export default function MediaManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for media data
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [currentFolder, setCurrentFolder] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // State for upload
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
  // State for selected items
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  // State for edit modal
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    alt_text: '',
    title: '',
    description: ''
  });
  
  // State for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check user session and fetch data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchMediaItems();
      }
    }
  }, [status, session, router]);

  // Fetch media items from the API
  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      
      // Fetch media items from the actual API
      const response = await fetch('/api/media', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Media API response:', data);
        console.log('Number of media items:', (data.media || []).length);
        
        // Transform API response to match MediaItem interface
        const mediaItems = (data.media || []).map((item: any) => {
          console.log('Processing media item:', {
            id: item.id,
            filename: item.filename,
            filepath: item.filepath,
            type: item.type
          });
          
          return {
            id: item.id,
            filename: item.filename || item.originalFilename,
            originalFilename: item.originalFilename || item.filename,
            filepath: item.filepath,
            type: item.type as MediaType,
            size: item.size,
            mimeType: item.mimeType || item.mime_type,
            uploadedBy: item.uploadedBy || 'Unknown',
            uploadedAt: item.uploadedAt || new Date().toISOString(),
            dimensions: item.dimensions,
            alt: item.alt || item.alt_text || '',
            title: item.title || '',
            description: item.description || '',
            inUseBy: item.inUseBy || []
          };
        });
        
        setMediaItems(mediaItems);
        setError(null);
      } else {
        console.error('Failed to fetch media items:', response.statusText);
        setError('Failed to load media items. Please check your authentication.');
      }
    } catch (err) {
      console.error('Error fetching media items:', err);
      setError('Failed to load media items. Please try again later.');
      
      // Fallback to empty array instead of sample data
      setMediaItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter media items based on search and filters
  const filteredMediaItems = mediaItems.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.originalFilename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  // Sort media items
  const sortedMediaItems = [...filteredMediaItems].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    } else if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.filename.localeCompare(b.filename)
        : b.filename.localeCompare(a.filename);
    } else { // size
      return sortOrder === 'asc'
        ? a.size - b.size
        : b.size - a.size;
    }
  });

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadingFiles(Array.from(e.target.files));
    }
  };
  
  // Handle file upload
  const handleUpload = async () => {
    if (uploadingFiles.length === 0) return;
    
    setIsUploading(true);
    const newUploadProgress = {...uploadProgress};
    let successfulUploads = 0;
    
    try {
      // Upload each file using the actual API
      for (let i = 0; i < uploadingFiles.length; i++) {
        const file = uploadingFiles[i];
        
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', file.type.startsWith('image/') ? 'image' : 'document');
          
          // Start progress tracking
          newUploadProgress[file.name] = 10;
          setUploadProgress({...newUploadProgress});
          
          const response = await fetch('/api/media', {
            method: 'POST',
            body: formData,
          });
          
          // Update progress
          newUploadProgress[file.name] = 50;
          setUploadProgress({...newUploadProgress});
          
          if (response.ok) {
            const result = await response.json();
            console.log('Upload successful:', result);
            
            // Complete progress
            newUploadProgress[file.name] = 100;
            setUploadProgress({...newUploadProgress});
            successfulUploads++;
          } else {
            console.error('Upload failed for', file.name, response.statusText);
            newUploadProgress[file.name] = 0;
            setUploadProgress({...newUploadProgress});
            toast.error(`Failed to upload ${file.name}`);
          }
        } catch (fileError) {
          console.error('Error uploading file:', file.name, fileError);
          newUploadProgress[file.name] = 0;
          setUploadProgress({...newUploadProgress});
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      // Clean up and refresh
      setTimeout(() => {
        setIsUploading(false);
        setUploadingFiles([]);
        setUploadProgress({});
        fetchMediaItems(); // Refresh media items
        
        if (successfulUploads > 0) {
          toast.success(`${successfulUploads} file(s) uploaded successfully!`);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error uploading files:', error);
      setIsUploading(false);
      toast.error('Failed to upload files. Please try again.');
    }
  };
  
  // Handle media item selection
  const handleItemSelect = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      try {
        const response = await fetch(`/api/media?ids=${JSON.stringify(selectedItems)}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setMediaItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
          setSelectedItems([]);
          toast.success(`${selectedItems.length} item(s) deleted successfully!`);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete items');
        }
      } catch (error) {
        console.error('Error deleting items:', error);
        toast.error('Failed to delete items. Please try again.');
      }
    }
  };
  
  // Handle single item delete
  const handleDeleteItem = (item: MediaItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };
  
  // Confirm single delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const response = await fetch(`/api/media?id=${itemToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMediaItems(prev => prev.filter(item => item.id !== itemToDelete.id));
        toast.success('Media file deleted successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete media file');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete media file. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };
  
  // Handle edit item
  const handleEditItem = (item: MediaItem) => {
    setEditingItem(item);
    setEditFormData({
      alt_text: item.alt || '',
      title: item.title || '',
      description: item.description || ''
    });
    setShowEditModal(true);
  };
  
  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    try {
      const response = await fetch('/api/media', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingItem.id,
          ...editFormData
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Update the item in the local state
        setMediaItems(prev => prev.map(item => 
          item.id === editingItem.id 
            ? { ...item, alt: editFormData.alt_text, title: editFormData.title, description: editFormData.description }
            : item
        ));
        
        toast.success('Media file updated successfully!');
        setShowEditModal(false);
        setEditingItem(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update media file');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update media file. Please try again.');
    }
  };
  
  // Handle preview - navigate to the detail page
  const handlePreview = (item: MediaItem) => {
    router.push(`/admin/media/${item.id}`);
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Management</h1>
          <p className="text-gray-600">Upload and manage media files for your content</p>
        </div>
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Files
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upload Files</h2>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${isUploading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isUploading ? 'Uploading...' : 'Start Upload'}
            </button>
          </div>
          <div className="space-y-3">
            {uploadingFiles.map((file, index) => (
              <div key={index} className="border rounded-md p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress[file.name] || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">{uploadProgress[file.name] || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search media files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as MediaType | 'all')}
                className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="document">Documents</option>
                <option value="webstory">Web Stories</option>
              </select>
              
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy as 'date' | 'name' | 'size');
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
                className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="size-desc">Size (Largest)</option>
                <option value="size-asc">Size (Smallest)</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Actions Bar */}
        {selectedItems.length > 0 && (
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center text-sm">
              <span className="mr-3 font-medium">{selectedItems.length} item(s) selected</span>
              <button
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-900 mr-3"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Media Grid */}
      <div className="bg-white shadow rounded-lg">
        {sortedMediaItems.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No media items</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by uploading media files.</p>
            <div className="mt-6">
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload Files
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {sortedMediaItems.map((item) => (
              <div 
                key={item.id} 
                className={`border rounded-md overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${selectedItems.includes(item.id) ? 'ring-2 ring-red-500' : ''}`}
                onClick={() => handleItemSelect(item.id)}
                onDoubleClick={() => handlePreview(item)}
              >
                {/* Media Thumbnail */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  {item.type === 'image' ? (
                    <div className="w-full h-full relative">
                      {/* Try Next.js Image first, fallback to regular img */}
                      <Image 
                        src={item.filepath}
                        alt={item.alt || item.filename}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="w-full h-full object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          console.error('Next.js Image load error:', item.filepath, e);
                          // Hide the Next.js Image and show fallback
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.fallback-img') as HTMLImageElement;
                          if (fallback) {
                            fallback.style.display = 'block';
                          }
                        }}
                        onLoad={() => {
                          console.log('Next.js Image loaded successfully:', item.filepath);
                        }}
                      />
                      {/* Fallback regular img element */}
                      <img 
                        src={item.filepath}
                        alt={item.alt || item.filename}
                        className="fallback-img w-full h-full object-cover"
                        style={{ display: 'none' }}
                        onError={(e) => {
                          console.error('Fallback img load error:', item.filepath, e);
                          // Show placeholder icon
                          e.currentTarget.style.display = 'none';
                          const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          console.log('Fallback img loaded successfully:', item.filepath);
                        }}
                      />
                      {/* Final fallback placeholder */}
                      <div className="image-placeholder w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                        <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  ) : item.type === 'document' ? (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  {selectedItems.includes(item.id) && (
                    <div className="absolute top-2 right-2 h-6 w-6 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Action buttons that appear on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                      className="px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item);
                      }}
                      className="px-2 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(item);
                      }}
                      className="px-2 py-1.5 bg-gray-600 text-white rounded-md text-xs font-medium hover:bg-gray-700"
                      title="View Details"
                    >
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Media Info */}
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-900 truncate" title={item.filename}>
                    {item.filename}
                  </p>
                  <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{formatDistanceToNow(new Date(item.uploadedAt), { addSuffix: true })}</span>
                  </div>
                  {item.inUseBy && item.inUseBy.length > 0 && (
                    <div className="mt-1 flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        In use
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Media</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.alt_text}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Describe the image for accessibility..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Important for accessibility and SEO
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Media File</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{itemToDelete.filename}"? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
