'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  alt?: string;
  filename?: string;
  size?: number;
  created_at?: string;
}

interface MediaPickerProps {
  onSelect: (media: MediaItem | null) => void;
  selectedMedia?: MediaItem | null;
}

export function MediaPicker({ onSelect, selectedMedia }: MediaPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Don't fetch media items automatically - only when user searches or browses

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        console.log('MediaPicker API response:', data);
        console.log('Raw media items:', data.media);
        // Validate and sanitize media items
        const validatedMedia = (data.media || []).map((item: any) => ({
          id: item.id,
          url: item.filepath, // Map filepath to url for compatibility
          type: item.type === 'image' ? 'image' : 'video',
          title: item.title || item.originalFilename || item.filename || `Media ${item.id}` || 'Untitled',
          alt: item.alt || item.alt_text || '',
          filename: item.filename || item.originalFilename || '',
          size: item.size || 0,
          created_at: item.uploadedAt || new Date().toISOString()
        }));
        console.log('MediaPicker validated media:', validatedMedia);
        setMediaItems(validatedMedia);
      } else {
        // Fallback to sample data if API fails
        setMediaItems(getSampleMedia());
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      // Fallback to sample data
      setMediaItems(getSampleMedia());
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Fetch media when user starts searching (after 2+ characters)
    if (value.trim().length >= 2 && !hasSearched) {
      fetchMediaItems();
    }
  };

  const handleBrowseMedia = () => {
    if (!hasSearched) {
      fetchMediaItems();
    }
  };

  const getSampleMedia = (): MediaItem[] => [
    {
      id: '1',
      url: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Sample+Image+1',
      type: 'image',
      title: 'Sample Image 1',
      alt: 'A sample image for testing',
      filename: 'sample1.jpg'
    },
    {
      id: '2',
      url: 'https://via.placeholder.com/400x300/059669/ffffff?text=Sample+Image+2',
      type: 'image',
      title: 'Sample Image 2',
      alt: 'Another sample image',
      filename: 'sample2.jpg'
    },
    {
      id: '3',
      url: 'https://via.placeholder.com/400x300/dc2626/ffffff?text=Sample+Image+3',
      type: 'image',
      title: 'Sample Image 3',
      alt: 'Third sample image',
      filename: 'sample3.jpg'
    }
  ];

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      // Simulate upload progress (in a real implementation, you'd track actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const result = await response.json();
        const newMediaItem: MediaItem = {
          id: result.file.id || Date.now().toString(),
          url: result.file.filepath || URL.createObjectURL(file),
          type: 'image',
          title: result.file.originalFilename || file.name.replace(/\.[^/.]+$/, ""),
          alt: result.file.alt || '',
          filename: result.file.filename || file.name,
          size: file.size,
          created_at: result.file.uploadedAt || new Date().toISOString()
        };

        // Add to media items
        setMediaItems(prev => [newMediaItem, ...prev]);
        
        // Auto-select the newly uploaded image
        onSelect(newMediaItem);
      } else {
        // Create a temporary local item for demo purposes
        const tempItem: MediaItem = {
          id: Date.now().toString(),
          url: URL.createObjectURL(file),
          type: 'image',
          title: file.name.replace(/\.[^/.]+$/, ""),
          alt: '',
          filename: file.name,
          size: file.size,
          created_at: new Date().toISOString()
        };

        setMediaItems(prev => [tempItem, ...prev]);
        onSelect(tempItem);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const filteredMedia = searchTerm.trim() === '' 
    ? mediaItems 
    : mediaItems.filter(media =>
        (media.title && media.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (media.filename && media.filename.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <div className="space-y-4">
      {/* Search and Upload Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {!hasSearched && (
            <button
              onClick={handleBrowseMedia}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2 whitespace-nowrap"
            >
              <span>📂</span>
              <span>Browse Media</span>
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
          >
            <span>📤</span>
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Drag and Drop Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-indigo-400 bg-indigo-50'
            : uploading
            ? 'border-gray-300 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="mx-auto text-4xl text-gray-400 mb-2">📷</div>
        <p className="mt-2 text-sm text-gray-600">
          {uploading ? 'Uploading...' : 'Drag and drop images here, or click Upload Image'}
        </p>
        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
      </div>

      {/* Clear Selection Button */}
      {selectedMedia && (
        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.title}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
                sizes="48px"
                onError={(e) => {
                  console.error('Selected media image error:', selectedMedia.url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">{selectedMedia.title}</p>
              <p className="text-xs text-indigo-600">Selected</p>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="p-1 text-indigo-400 hover:text-indigo-600"
            title="Clear selection"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-lg mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Media Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredMedia.map((media) => (
            <div
              key={media.id}
              onClick={() => onSelect(media)}
              className={`cursor-pointer group rounded-lg border-2 transition-all duration-200 overflow-hidden ${
                selectedMedia?.id === media.id
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <Image
                  src={media.url}
                  alt={media.alt || media.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  onError={(e) => {
                    console.error('MediaPicker image load error:', media.url, e);
                    // Hide the Next.js Image and show fallback
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-img') as HTMLImageElement;
                    if (fallback) {
                      fallback.style.display = 'block';
                    }
                  }}
                  onLoad={() => {
                    console.log('MediaPicker image loaded successfully:', media.url);
                  }}
                />
                {/* Fallback regular img element */}
                <img 
                  src={media.url}
                  alt={media.alt || media.title}
                  className="fallback-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  style={{ display: 'none' }}
                  onError={(e) => {
                    console.error('MediaPicker fallback img load error:', media.url, e);
                    // Show placeholder
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.parentElement?.querySelector('.image-placeholder') as HTMLElement;
                    if (placeholder) {
                      placeholder.style.display = 'flex';
                    }
                  }}
                />
                {/* Final fallback placeholder */}
                <div className="image-placeholder w-full h-full flex items-center justify-center bg-gray-200" style={{ display: 'none' }}>
                  <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{media.title}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 capitalize">{media.type}</p>
                  {media.size && (
                    <p className="text-xs text-gray-400">
                      {(media.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && !hasSearched && filteredMedia.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="mx-auto text-4xl text-gray-300 mb-3">📷</div>
          <p className="text-sm">Start typing to search media or click "Browse Media"</p>
          <p className="text-xs mt-1">Or upload a new image using the button above</p>
        </div>
      )}

      {!loading && hasSearched && filteredMedia.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="mx-auto text-4xl text-gray-300 mb-3">📷</div>
          <p className="text-sm">
            {searchTerm ? `No media found matching "${searchTerm}"` : 'No media files yet'}
          </p>
          <p className="text-xs mt-1">Upload your first image to get started</p>
        </div>
      )}
    </div>
  );
} 