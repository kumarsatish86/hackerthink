'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Blockquote } from '@tiptap/extension-blockquote';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Node, mergeAttributes } from '@tiptap/core';

interface TipTapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
  showToolbar?: boolean;
  showMenuBar?: boolean;
}

// Link Modal Component
const LinkModal = ({ isOpen, onClose, onInsert, selectedText }: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (linkData: any) => void;
  selectedText: string;
}) => {
  const [url, setUrl] = useState('');
  const [text, setText] = useState(selectedText);
  const [target, setTarget] = useState('_self');
  const [rel, setRel] = useState('');

  useEffect(() => {
    setText(selectedText);
  }, [selectedText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert({
        href: url.trim(),
        text: text.trim() || url.trim(),
        target,
        rel: rel ? rel.split(' ').filter(Boolean) : []
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw]">
        <h3 className="text-lg font-medium mb-4">Insert Link</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link text (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Open In</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="_self">Same Window</option>
              <option value="_blank">New Tab</option>
              <option value="_parent">Parent Frame</option>
              <option value="_top">Top Frame</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Type</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rel.includes('nofollow')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRel(prev => prev + ' nofollow');
                    } else {
                      setRel(prev => prev.replace(' nofollow', ''));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">No-follow</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rel.includes('ugc')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRel(prev => prev + ' ugc');
                    } else {
                      setRel(prev => prev.replace(' ugc', ''));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">UGC (User Generated Content)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rel.includes('sponsored')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRel(prev => prev + ' sponsored');
                    } else {
                      setRel(prev => prev.replace(' sponsored', ''));
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">Sponsored</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Insert Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Custom Video Extension
const VideoExtension = Node.create({
  name: 'video',
  
  group: 'block',
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: '400',
      },
      type: {
        default: 'youtube', // 'youtube' or 'direct'
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'div.video-container',
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    const { src, title, width, height, type } = HTMLAttributes;
    
    if (type === 'youtube') {
      return ['div', mergeAttributes(HTMLAttributes, { class: 'video-container youtube-container' }), [
        'iframe', {
          src: src,
          width: width,
          height: height,
          frameborder: '0',
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowfullscreen: 'true',
          style: 'border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);',
          title: title || 'YouTube Video',
        }
      ]];
    } else {
      return ['div', mergeAttributes(HTMLAttributes, { class: 'video-container' }), [
        'video', {
          controls: 'true',
          style: 'width: 100%; height: auto; max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);',
          title: title || 'Video',
        }, [
          'source', { src: src, type: 'video/mp4' },
          'source', { src: src, type: 'video/webm' },
          'source', { src: src, type: 'video/ogg' },
          'Your browser does not support the video tag.'
        ]
      ]];
    }
  },
  

});


// Table Modal Component
const TableModal = ({ isOpen, onClose, onInsert }: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (tableData: any) => void;
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Table modal form submitted:', { rows, cols, withHeader });
    if (rows > 0 && cols > 0) {
      onInsert({
        rows,
        cols,
        withHeaderRow: withHeader
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px] max-w-[90vw]">
        <h3 className="text-lg font-medium mb-4">Insert Table</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rows</label>
              <input
                type="number"
                min="1"
                max="20"
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Columns</label>
              <input
                type="number"
                min="1"
                max="20"
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={withHeader}
                onChange={(e) => setWithHeader(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Include header row</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Insert Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Image Modal Component
const ImageModal = ({ isOpen, onClose, onInsert }: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (imageData: any) => void;
}) => {
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [tab, setTab] = useState<'url' | 'upload' | 'media'>('url');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onInsert({
        src: url.trim(),
        alt: alt.trim(),
        title: title.trim(),
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined
      });
      onClose();
    }
  };

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Insert Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'url' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setTab('media')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              tab === 'media' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Media Library
          </button>
        </div>

        {tab === 'url' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe the image for accessibility"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Image title (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="Auto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Auto"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Insert Image
              </button>
            </div>
          </form>
        )}

        {tab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium mb-2">Drag and drop files here</p>
                <p className="text-xs text-gray-400 mb-4">Supports: JPG, PNG, GIF, SVG, WebP (Max: 5MB)</p>
                <button 
                  onClick={async () => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = false;
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        try {
                          // Upload to server
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('type', 'image');
                          
                          const response = await fetch('/api/media', {
                            method: 'POST',
                            body: formData,
                          });
                          
                          if (response.ok) {
                            const result = await response.json();
                            onInsert({
                              src: result.file.filepath,
                              alt: file.name.replace(/\.[^/.]+$/, ""),
                              title: file.name.replace(/\.[^/.]+$/, ""),
                              width: undefined,
                              height: undefined
                            });
                          } else {
                            // Fallback to local data URL if upload fails
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const result = e.target?.result as string;
                              onInsert({
                                src: result,
                                alt: file.name.replace(/\.[^/.]+$/, ""),
                                title: file.name.replace(/\.[^/.]+$/, ""),
                                width: undefined,
                                height: undefined
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                          onClose();
                        } catch (error) {
                          console.error('Error uploading image:', error);
                          // Fallback to local data URL
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const result = e.target?.result as string;
                            onInsert({
                              src: result,
                              alt: file.name.replace(/\.[^/.]+$/, ""),
                              title: file.name.replace(/\.[^/.]+$/, ""),
                              width: undefined,
                              height: undefined
                            });
                            onClose();
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    };
                    input.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Upload Tips:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Use descriptive filenames for better SEO</li>
                    <li>• Optimize images before uploading</li>
                    <li>• Images are saved to media library for reuse</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'media' && (
          <MediaLibrary
            onSelect={(mediaItem) => {
              onInsert({
                src: mediaItem.url,
                alt: mediaItem.alt,
                title: mediaItem.name,
                width: mediaItem.dimensions.split('x')[0],
                height: mediaItem.dimensions.split('x')[1]
              });
              onClose();
            }}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
};

// Simple Toolbar Button Component
const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children, 
  title 
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
      isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={title}
  >
    {children}
  </button>
);

// Simple Divider
const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-2" />;

// Media Library Component
const MediaLibrary = ({ onSelect, onClose }: {
  onSelect: (mediaItem: any) => void;
  onClose: () => void;
}) => {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Load media files from the API
    const loadMediaFiles = async () => {
      setLoading(true);
      
      try {
        const response = await fetch('/api/media');
        if (response.ok) {
          const data = await response.json();
          console.log('TipTap MediaLibrary API response:', data);
          
          // Transform API response to match the expected format
          const transformedMedia = (data.media || []).map((item: any) => ({
            id: item.id,
            name: item.originalFilename || item.filename,
            url: item.filepath,
            type: 'image', // Since we're only dealing with images for now
            size: item.size ? formatFileSize(item.size) : 'Unknown',
            dimensions: item.dimensions ? `${item.dimensions.width}x${item.dimensions.height}` : 'Auto',
            category: 'images',
            alt: item.alt || item.alt_text || item.title || item.filename || '',
            uploadedAt: item.uploadedAt ? new Date(item.uploadedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }));
          
          console.log('TipTap MediaLibrary transformed media:', transformedMedia);
          setMediaFiles(transformedMedia);
        } else {
          console.error('Failed to fetch media:', response.statusText);
          setMediaFiles([]);
        }
      } catch (error) {
        console.error('Error fetching media files:', error);
        setMediaFiles([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return bytes + ' B';
      else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
      else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
      else return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    loadMediaFiles();
  }, []);

  const filteredMedia = mediaFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.alt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'logos', 'icons', 'images', 'documents'];

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading media library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-800">{uploadSuccess}</p>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-3 flex-shrink-0">
        <input
          type="text"
          placeholder="Search media files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs rounded-full capitalize ${
                selectedCategory === category
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="text-center py-8 text-gray-500 flex-1 flex items-center justify-center">
          <div>
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No media files found</p>
            <p className="text-sm">Try adjusting your search or category filter</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-1 min-h-0">
          {filteredMedia.map((file) => (
            <div
              key={file.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelect(file)}
            >
              <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center mb-2 overflow-hidden">
                {file.type === 'image' ? (
                  <>
                    <img
                      src={file.url}
                      alt={file.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallbackElement = target.nextElementSibling as HTMLElement;
                        if (fallbackElement) {
                          fallbackElement.style.display = 'flex';
                        }
                      }}
                    />
                    {/* Fallback for missing images */}
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50" style={{ display: 'none' }}>
                      <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-center px-2">Image not found</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-900 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{file.dimensions} • {file.size}</p>
                <p className="text-xs text-gray-400 capitalize">{file.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}

            {/* Unified Upload Area */}
      <div className="pt-4 border-t border-gray-200 flex-shrink-0">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
            
            const files = Array.from(e.dataTransfer.files);
            const imageFile = files.find(file => file.type.startsWith('image/'));
            
            if (imageFile) {
              setUploading(true);
              
              try {
                // Upload to server
                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('type', 'image');
                
                const response = await fetch('/api/media', {
                  method: 'POST',
                  body: formData,
                });
                
                if (response.ok) {
                  const result = await response.json();
                  const newMediaItem = {
                    id: result.file.id,
                    name: result.file.originalFilename,
                    url: result.file.filepath,
                    type: 'image',
                    size: imageFile.size > 1024 * 1024 
                      ? `${(imageFile.size / (1024 * 1024)).toFixed(1)}MB`
                      : `${(imageFile.size / 1024).toFixed(1)}KB`,
                    dimensions: 'Auto',
                    category: 'images',
                    alt: imageFile.name.replace(/\.[^/.]+$/, ''),
                    uploadedAt: new Date().toISOString().split('T')[0]
                  };
                  setMediaFiles(prev => [newMediaItem, ...prev]);
                  setUploadSuccess(`Successfully uploaded ${newMediaItem.name}!`);
                  onSelect(newMediaItem);
                } else {
                  // Fallback to local data URL if upload fails
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    const newMediaItem = {
                      id: Date.now(),
                      name: imageFile.name,
                      url: result,
                      type: 'image',
                      size: imageFile.size > 1024 * 1024 
                        ? `${(imageFile.size / (1024 * 1024)).toFixed(1)}MB`
                        : `${(imageFile.size / 1024).toFixed(1)}KB`,
                      dimensions: 'Auto',
                      category: 'images',
                      alt: imageFile.name.replace(/\.[^/.]+$/, ''),
                      uploadedAt: new Date().toISOString().split('T')[0]
                    };
                    setMediaFiles(prev => [newMediaItem, ...prev]);
                    setUploadSuccess(`Successfully uploaded ${newMediaItem.name}!`);
                    onSelect(newMediaItem);
                  };
                  reader.readAsDataURL(imageFile);
                }
              } catch (error) {
                console.error('Error uploading file:', error);
                // Fallback to local data URL
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result as string;
                  const newMediaItem = {
                    id: Date.now(),
                    name: imageFile.name,
                    url: result,
                    type: 'image',
                    size: imageFile.size > 1024 * 1024 
                      ? `${(imageFile.size / (1024 * 1024)).toFixed(1)}MB`
                      : `${(imageFile.size / 1024).toFixed(1)}KB`,
                    dimensions: 'Auto',
                    category: 'images',
                    alt: imageFile.name.replace(/\.[^/.]+$/, ''),
                    uploadedAt: new Date().toISOString().split('T')[0]
                  };
                  setMediaFiles(prev => [newMediaItem, ...prev]);
                  setUploadSuccess(`Successfully uploaded ${newMediaItem.name}!`);
                  onSelect(newMediaItem);
                };
                reader.readAsDataURL(imageFile);
              } finally {
                setUploading(false);
                // Clear success message after 3 seconds
                setTimeout(() => setUploadSuccess(null), 3000);
              }
            } else {
              alert('Please drop an image file.');
            }
          }}
          onClick={async () => {
            if (!uploading) {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.multiple = false;
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  setUploading(true);
                  
                  try {
                    // Upload to server
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', 'image');
                    
                    const response = await fetch('/api/media', {
                      method: 'POST',
                      body: formData,
                    });
                    
                    if (response.ok) {
                      const result = await response.json();
                      const newMediaItem = {
                        id: result.file.id,
                        name: result.file.originalFilename,
                        url: result.file.filepath,
                        type: 'image',
                        size: file.size > 1024 * 1024 
                          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
                          : `${(file.size / 1024).toFixed(1)}KB`,
                        dimensions: 'Auto',
                        category: 'images',
                        alt: file.name.replace(/\.[^/.]+$/, ''),
                        uploadedAt: new Date().toISOString().split('T')[0]
                      };
                      setMediaFiles(prev => [newMediaItem, ...prev]);
                      setUploadSuccess(`Successfully uploaded ${newMediaItem.name}!`);
                      onSelect(newMediaItem);
                    } else {
                      // Fallback to local data URL if upload fails
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        const result = e.target?.result as string;
                        const newMediaItem = {
                          id: Date.now(),
                          name: file.name,
                          url: result,
                          type: 'image',
                          size: file.size > 1024 * 1024 
                            ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
                            : `${(file.size / 1024).toFixed(1)}KB`,
                          dimensions: 'Auto',
                          category: 'images',
                          alt: file.name.replace(/\.[^/.]+$/, ''),
                          uploadedAt: new Date().toISOString().split('T')[0]
                        };
                        setMediaFiles(prev => [newMediaItem, ...prev]);
                        setUploadSuccess(`Successfully uploaded ${newMediaItem.name}!`);
                        onSelect(newMediaItem);
                      };
                      reader.readAsDataURL(file);
                    }
                  } catch (error) {
                    console.error('Error uploading file:', error);
                    // Fallback to local data URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const result = e.target?.result as string;
                      const newMediaItem = {
                        id: Date.now(),
                        name: file.name,
                        url: result,
                        type: 'image',
                        size: file.size > 1024 * 1024 
                          ? `${(file.size / (1024 * 1024)).toFixed(1)}MB`
                          : `${(file.size / 1024).toFixed(1)}KB`,
                        dimensions: 'Auto',
                        category: 'images',
                        alt: file.name.replace(/\.[^/.]+$/, ''),
                        uploadedAt: new Date().toISOString().split('T')[0]
                      };
                      setMediaFiles(prev => [newMediaItem, ...prev]);
                      setUploadSuccess(`Successfully uploaded ${newMediaItem.name}!`);
                      onSelect(newMediaItem);
                    };
                    reader.readAsDataURL(file);
                  } finally {
                    setUploading(false);
                    // Clear success message after 3 seconds
                    setTimeout(() => setUploadSuccess(null), 3000);
                  }
                }
              };
              input.click();
            }
          }}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <p className="text-lg font-medium text-blue-600 mb-2">Uploading...</p>
              <p className="text-sm text-gray-500">Please wait while we process your file</p>
            </>
          ) : (
            <>
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                Drag image files here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-3">Supports: JPG, PNG, GIF, SVG, WebP</p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium group-hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Files
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Video Modal Component
const VideoModal = ({ isOpen, onClose, onInsert }: {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (videoData: any) => void;
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('400');

  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      alert('Please enter a video URL');
      return;
    }
    
    onInsert({
      url: url.trim(),
      title: title.trim(),
      width,
      height
    });
    
    onClose();
    // Reset form
    setUrl('');
    setTitle('');
    setWidth('100%');
    setHeight('400');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-medium mb-4">Insert Video</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URL *</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://example.com/video.mp4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports YouTube URLs and direct video file links (MP4, WebM, OGG)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="100%">Full Width</option>
                <option value="75%">75% Width</option>
                <option value="50%">50% Width</option>
                <option value="400px">400px</option>
                <option value="600px">600px</option>
                <option value="800px">800px</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="400"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Insert Video
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main TipTap Editor Component
const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
  height = '400px',
  showToolbar = true,
  showMenuBar = false,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTableDropdownOpen, setIsTableDropdownOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close table dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isTableDropdownOpen && !(event.target as Element).closest('.table-dropdown')) {
        setIsTableDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTableDropdownOpen]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure StarterKit extensions to avoid duplicates
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 py-2 my-4 bg-gray-50 italic',
          },
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Table.configure({
        HTMLAttributes: {
          class: 'w-full max-w-full overflow-x-auto border-collapse border border-gray-300',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2 min-w-0 max-w-full break-words',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2 font-bold bg-gray-100 min-w-0 max-w-full break-words',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'list-none space-y-1 my-2 p-0',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-center space-x-3 p-1 rounded transition-colors duration-200',
        },
      }),
        VideoExtension,
    ],
    onBeforeCreate: ({ editor }) => {
      // Editor initialization
    },
    onCreate: ({ editor }) => {
      // Editor created successfully
    },
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    immediatelyRender: false,
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [editor, content]);

  // Show loading state while not yet mounted on client
  if (!isClient) {
    return (
      <div className={`border border-gray-300 rounded-md p-4 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-gray-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className={`border border-gray-300 rounded-md p-4 ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-2 text-gray-500">Initializing editor...</p>
        </div>
      </div>
    );
  }

  const handleLinkInsert = (linkData: any) => {
    if (editor) {
      if (editor.isActive('link')) {
        editor.chain().focus().extendMarkRange('link').setLink({
          href: linkData.href,
          target: linkData.target,
          rel: linkData.rel
        }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${linkData.href}" target="${linkData.target}" rel="${linkData.rel.join(' ')}">${linkData.text}</a>`).run();
      }
    }
  };

  const handleImageInsert = (imageData: any) => {
    if (editor) {
      const attrs: any = { src: imageData.src };
      if (imageData.alt) attrs.alt = imageData.alt;
      if (imageData.title) attrs.title = imageData.title;
      if (imageData.width) attrs.width = imageData.width;
      if (imageData.height) attrs.height = imageData.height;
      
      editor.chain().focus().setImage(attrs).run();
    }
  };

  const handleTableInsert = (tableData: any) => {
    if (editor) {
      console.log('Inserting table with data:', tableData);
      try {
        const result = editor.chain().focus().insertTable({
          rows: tableData.rows,
          cols: tableData.cols,
          withHeaderRow: tableData.withHeaderRow
        }).run();
        console.log('Table insertion result:', result);
        
        // Apply additional styling to the newly inserted table
        setTimeout(() => {
          const tables = document.querySelectorAll('.ProseMirror table');
          const lastTable = tables[tables.length - 1] as HTMLElement;
          if (lastTable) {
            lastTable.style.width = '100%';
            lastTable.style.maxWidth = '100%';
            lastTable.style.tableLayout = 'fixed';
          }
        }, 100);
      } catch (error) {
        console.error('Error inserting table:', error);
      }
    }
  };

  const handleVideoInsert = (videoData: { url: string; title?: string; width?: string; height?: string }) => {
    console.log('Video insertion started with data:', videoData);
    const { url, title, width = '100%', height = '400' } = videoData;
    
    let videoHTML = '';
    
    // Check if it's a YouTube URL and convert to embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      console.log('YouTube URL detected:', url);
      const videoId = extractYouTubeVideoId(url);
      console.log('Extracted video ID:', videoId);
      
      if (videoId) {
        videoHTML = `
          <div class="video-container youtube-container" style="position: relative; width: ${width}; max-width: 100%; margin: 1rem 0;">
            <iframe 
              src="https://www.youtube.com/embed/${videoId}"
              width="100%" 
              height="${height}" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen
              style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
              title="${title || 'YouTube Video'}"
            ></iframe>
            ${title ? `<p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">${title}</p>` : ''}
          </div>
        `;
        console.log('Generated YouTube HTML:', videoHTML);
      } else {
        console.log('Invalid YouTube URL, showing error');
        // Fallback for invalid YouTube URLs
        videoHTML = `
          <div class="video-container error-container" style="position: relative; width: ${width}; max-width: 100%; margin: 1rem 0; padding: 2rem; text-align: center; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
            <p style="color: #dc2626; margin: 0;">Invalid YouTube URL. Please check the URL and try again.</p>
          </div>
        `;
      }
    } else {
      console.log('Regular video URL detected:', url);
      // Regular video file - create responsive video HTML
      videoHTML = `
        <div class="video-container" style="position: relative; width: ${width}; max-width: 100%; margin: 1rem 0;">
          <video 
            controls 
            style="width: 100%; height: auto; max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
            title="${title || 'Video'}"
          >
            <source src="${url}" type="video/mp4">
            <source src="${url}" type="video/webm">
            <source src="${url}" type="video/ogg">
            Your browser does not support the video tag.
          </video>
          ${title ? `<p style="text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">${title}</p>` : ''}
        </div>
      `;
      console.log('Generated regular video HTML:', videoHTML);
    }
    
    try {
      console.log('Attempting to insert video using VideoExtension...');
      
      // Determine video type
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      const videoType = isYouTube ? 'youtube' : 'direct';
      
      // Extract YouTube video ID if needed
      let videoSrc = url;
      if (isYouTube) {
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
          videoSrc = `https://www.youtube.com/embed/${videoId}`;
        }
      }
      
      console.log('Video data for extension:', {
        src: videoSrc,
        title: title || 'Video',
        width,
        height,
        type: videoType
      });
      
      // Insert using the VideoExtension
      const result = editor.chain().focus().insertContent({
        type: 'video',
        attrs: {
          src: videoSrc,
          title: title || 'Video',
          width,
          height,
          type: videoType
        }
      }).run();
      
      console.log('VideoExtension insertion result:', result);
      
      if (result) {
        console.log('Video inserted successfully using VideoExtension');
      } else {
        console.log('Video insertion failed with VideoExtension');
      }
      
    } catch (error) {
      console.error('Error inserting video with VideoExtension:', error);
    }
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  };

  const openLinkModal = () => {
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    setIsLinkModalOpen(true);
  };

  // Helper function to check if cursor is in table
  const isInTable = () => {
    if (!editor) return false;
    
    // Check multiple table-related states
    const inTable = editor.isActive('table');
    const inTableCell = editor.isActive('tableCell');
    const inTableRow = editor.isActive('tableRow');
    const inTableHeader = editor.isActive('tableHeader');
    
    // Also check if we're inside a table node
    const { $from } = editor.state.selection;
    let node = $from.node();
    let depth = $from.depth;
    
    while (depth > 0) {
      if (node.type.name === 'table' || 
          node.type.name === 'tableRow' || 
          node.type.name === 'tableCell' || 
          node.type.name === 'tableHeader') {
        return true;
      }
      depth--;
      node = $from.node(depth);
    }
    
    return inTable || inTableCell || inTableRow || inTableHeader;
  };

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Simple Toolbar */}
      {showToolbar && (
        <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap items-center gap-1">
          {/* Headings Dropdown - First */}
          <select
            onChange={(e) => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
              }
            }}
            value={editor.isActive('heading', { level: 1 }) ? '1' : editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : '0'}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>

          <ToolbarDivider />

          {/* Basic Text Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <u>U</u>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Text Alignment Tools */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h10" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h6" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h14M4 18h16" />
            </svg>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Blockquote */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </ToolbarButton>

          {/* Enhanced Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <div className="flex flex-col items-start space-y-0.5">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-4 h-0.5 bg-current"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-3 h-0.5 bg-current"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-5 h-0.5 bg-current"></div>
              </div>
            </div>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <div className="flex flex-col items-start space-y-0.5">
              <div className="flex items-center space-x-1">
                <span className="text-[8px] leading-none">1.</span>
                <div className="w-2 h-0.5 bg-current"></div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[8px] leading-none">2.</span>
                <div className="w-1.5 h-0.5 bg-current"></div>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[8px] leading-none">3.</span>
                <div className="w-2.5 h-0.5 bg-current"></div>
              </div>
            </div>
          </ToolbarButton>

          {/* Task List */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <div className="flex flex-col items-start space-y-0.5">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 border border-current rounded-sm"></div>
                <div className="w-2 h-0.5 bg-current"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 border border-current rounded-sm"></div>
                <div className="w-1.5 h-0.5 bg-current"></div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 border border-current rounded-sm"></div>
                <div className="w-2.5 h-0.5 bg-current"></div>
              </div>
            </div>
          </ToolbarButton>

          <ToolbarDivider />

          {/* Enhanced Links and Images */}
              <ToolbarButton
            onClick={openLinkModal}
            isActive={editor.isActive('link')}
            title="Insert Link"
          >
            🔗
              </ToolbarButton>

              <ToolbarButton
            onClick={() => setIsImageModalOpen(true)}
            title="Insert Image"
              >
            🖼️
              </ToolbarButton>

          {/* Video Tool */}
              <ToolbarButton
            onClick={() => {
              console.log('Video button clicked');
              console.log('Current video modal state:', isVideoModalOpen);
              setIsVideoModalOpen(true);
              console.log('Video modal state set to true');
            }}
            title="Insert Video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
              </ToolbarButton>

              <ToolbarDivider />

          {/* Table Tools */}
              <ToolbarButton
            onClick={() => {
              console.log('Table button clicked');
              // Test direct table insertion first
              try {
                console.log('Attempting table insertion...');
                console.log('Editor commands:', Object.keys(editor.commands));
                console.log('Can insert table:', editor.can().insertTable());
                
                // Try different table insertion methods
                let result;
                if (editor.can().insertTable()) {
                  result = editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run();
                } else {
                                   // Fallback: try to insert table HTML directly
                 result = editor.chain().focus().insertContent(`
                   <table style="width: 100%; max-width: 100%; table-layout: fixed; border-collapse: collapse; margin: 1rem 0;">
                     <tr>
                       <th style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; background-color: #f3f4f6; font-weight: 600; text-align: left; width: 33.33%; font-size: 0.875rem;">Header 1</th>
                       <th style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; background-color: #f3f4f6; font-weight: 600; text-align: left; width: 33.33%; font-size: 0.875rem;">Header 2</th>
                       <th style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; background-color: #f3f4f6; font-weight: 600; text-align: left; width: 33.33%; font-size: 0.875rem;">Header 3</th>
                     </tr>
                     <tr>
                       <td style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; word-wrap: break-word; overflow-wrap: break-word; font-size: 0.875rem;">Cell 1</td>
                       <td style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; word-wrap: break-word; overflow-wrap: break-word; font-size: 0.875rem;">Cell 2</td>
                       <td style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; word-wrap: break-word; overflow-wrap: break-word; font-size: 0.875rem;">Cell 3</td>
                     </tr>
                     <tr>
                       <td style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; word-wrap: break-word; overflow-wrap: break-word; font-size: 0.875rem;">Cell 4</td>
                       <td style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; word-wrap: break-word; overflow-wrap: break-word; font-size: 0.875rem;">Cell 5</td>
                       <td style="border: 1px solid #d1d5db; padding: 0.375rem 0.5rem; word-wrap: break-word; overflow-wrap: break-word; font-size: 0.875rem;">Cell 6</td>
                     </tr>
                   </table>
                 `).run();
                }
                console.log('Table insertion result:', result);
              } catch (error) {
                console.error('Table insertion error:', error);
                // Fallback to modal
                setIsTableModalOpen(true);
              }
            }}
                title="Insert Table"
              >
            📊
              </ToolbarButton>

          {/* Table Management Dropdown */}
          <div className="relative table-dropdown">
            <ToolbarButton
              onClick={() => {
                console.log('Table management clicked');
                console.log('Is in table:', editor.isActive('table'));
                console.log('Is in table cell:', editor.isActive('tableCell'));
                console.log('Is in table row:', editor.isActive('tableRow'));
                console.log('Current selection:', editor.state.selection);
                console.log('Custom isInTable check:', isInTable());
                setIsTableDropdownOpen(!isTableDropdownOpen);
              }}
              disabled={!isInTable()}
              title={`Table Management ${isInTable() ? '(Active)' : '(Not in table)'}`}
            >
              <div className="flex items-center space-x-1">
                <span>⚙️</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
                  </ToolbarButton>

            {/* Table Management Dropdown Menu */}
            {isTableDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {/* Column Management */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Columns
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().addColumnBefore().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>⬅️➕</span>
                    <span>Add Column Before</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().addColumnAfter().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>➕➡️</span>
                    <span>Add Column After</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().deleteColumn().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>➖</span>
                    <span>Delete Column</span>
                  </button>
                  
                  {/* Row Management */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 mt-2">
                    Rows
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().addRowBefore().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>⬆️➕</span>
                    <span>Add Row Before</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().addRowAfter().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>➕⬇️</span>
                    <span>Add Row After</span>
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().deleteRow().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <span>❌</span>
                    <span>Delete Row</span>
                  </button>
                  
                  {/* Table Management */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100 mt-2">
                    Table
                  </div>
                  <button
                    onClick={() => {
                      editor.chain().focus().deleteTable().run();
                      setIsTableDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <span>🗑️</span>
                    <span>Delete Table</span>
                  </button>
                </div>
              </div>
            )}
          </div>

              <ToolbarDivider />

          {/* Code */}
              <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
              >
            {`{}`}
              </ToolbarButton>

              <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            {`</>`}
              </ToolbarButton>

          <ToolbarDivider />

          {/* Clear Formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Formatting"
          >
            🧹
          </ToolbarButton>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-4" style={{ height: showToolbar ? `calc(${height} - 60px)` : height }}>
        <div className="h-full overflow-y-auto overflow-x-auto border border-gray-200 rounded-md bg-white">
        <EditorContent 
          editor={editor} 
            className="h-full w-full"
            style={{ minHeight: '200px' }}
        />
        </div>
      </div>

      {/* Custom Table Styles */}
      <style jsx>{`
        .ProseMirror {
          overflow-wrap: break-word;
          word-wrap: break-word;
          height: 100%;
          min-height: 200px;
          outline: none;
          padding: 1rem;
          box-sizing: border-box;
          font-size: 14px;
          line-height: 1.5;
          color: #374151;
        }
        
        /* Base typography improvements */
        .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.3;
          color: #111827;
        }
        
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.875rem 0 0.5rem 0;
          line-height: 1.3;
          color: #111827;
        }
        
        .ProseMirror h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem 0;
          line-height: 1.3;
          color: #111827;
        }
        
        .ProseMirror h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.625rem 0 0.5rem 0;
          line-height: 1.3;
          color: #111827;
        }
        
        .ProseMirror h5 {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem 0;
          line-height: 1.3;
          color: #111827;
        }
        
        .ProseMirror h6 {
          font-size: 0.75rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem 0;
          line-height: 1.3;
          color: #111827;
        }
        
        /* List improvements */
        .ProseMirror ul, .ProseMirror ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        .ProseMirror ul li, .ProseMirror ol li {
          margin: 0.25rem 0;
          line-height: 1.5;
        }
        
        .ProseMirror ul ul, .ProseMirror ol ol, .ProseMirror ul ol, .ProseMirror ol ul {
          margin: 0.25rem 0;
        }
        
        /* Code blocks */
        .ProseMirror pre {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.75rem;
          margin: 0.75rem 0;
          overflow-x: auto;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        .ProseMirror code {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 0.125rem 0.25rem;
          font-size: 0.875rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .ProseMirror pre code {
          background: none;
          border: none;
          padding: 0;
        }
        
        /* Text Alignment Styles */
        .ProseMirror .text-left {
          text-align: left;
        }
        
        .ProseMirror .text-center {
          text-align: center;
        }
        
        .ProseMirror .text-right {
          text-align: right;
        }
        
        .ProseMirror .text-justify {
          text-align: justify;
        }
        
        .ProseMirror .is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        /* Ensure proper scrolling */
        .ProseMirror {
          overflow-y: visible;
          overflow-x: visible;
        }
        
        /* Editor container scrolling */
        .tiptap {
          height: 100%;
          overflow-y: auto;
          overflow-x: auto;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .ProseMirror table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed;
          border-collapse: collapse;
          margin: 1rem 0;
          border: 2px solid #3b82f6;
          position: relative;
        }
        
        /* Debug indicator for table detection */
        .ProseMirror table::before {
          content: "TABLE DETECTED";
          position: absolute;
          top: -20px;
          left: 0;
          background: #3b82f6;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 10;
        }
        
        .ProseMirror table td,
        .ProseMirror table th {
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 0;
          padding: 0.375rem 0.5rem;
          border: 1px solid #d1d5db;
          position: relative;
          min-height: 1.5rem;
          font-size: 0.875rem;
          line-height: 1.4;
        }
        
        /* Highlight active table cell */
        .ProseMirror table td:focus,
        .ProseMirror table th:focus {
          background-color: #dbeafe;
          outline: 2px solid #3b82f6;
        }
        
        .ProseMirror table th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
        
        .ProseMirror table tr:nth-child(even) {
          background-color: #f9fafb;
        }
        
        .ProseMirror table tr:hover {
          background-color: #f3f4f6;
        }
        
        /* Blockquote Styles */
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 0 8px 8px 0;
          position: relative;
          font-style: italic;
          color: #374151;
        }
        
        .ProseMirror blockquote::before {
          content: '"';
          font-size: 3rem;
          color: #3b82f6;
          position: absolute;
          top: -0.5rem;
          left: 1rem;
          font-family: serif;
          line-height: 1;
        }
        
        .ProseMirror blockquote p {
          margin: 0;
          line-height: 1.6;
        }
        
        .ProseMirror blockquote p:not(:last-child) {
          margin-bottom: 0.5rem;
        }
        
        /* Task List Styles */
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: center;
          margin-bottom: 0.25rem;
          padding: 0.125rem 0;
          min-height: 1.25rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.75rem;
          user-select: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
          line-height: 1.5;
          padding-top: 0.125rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] {
          width: 1.125rem;
          height: 1.125rem;
          margin: 0;
          cursor: pointer;
          border: 2px solid #d1d5db;
          border-radius: 3px;
          background-color: white;
          transition: all 0.2s ease;
          position: relative;
          top: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li input[type="checkbox"]:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .ProseMirror ul[data-type="taskList"] li input[type="checkbox"]:hover {
          border-color: #9ca3af;
        }
        
        .ProseMirror ul[data-type="taskList"] li input[type="checkbox"]:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        
        /* Empty task list item styling */
        .ProseMirror ul[data-type="taskList"] li:empty {
          min-height: 1.5rem;
        }
        
        /* Task list item hover effect */
        .ProseMirror ul[data-type="taskList"] li:hover {
          background-color: #f9fafb;
          border-radius: 4px;
          padding: 0.125rem 0.5rem;
          margin: 0 -0.5rem 0.25rem -0.5rem;
        }
        
        /* Video Styles */
        .ProseMirror .video-container {
          position: relative;
          width: 100%;
          max-width: 100%;
          margin: 1rem 0;
        }
        
        .ProseMirror .video-container video {
          width: 100%;
          height: auto;
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .ProseMirror .video-container p {
          text-align: center;
          margin-top: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        /* YouTube Video Styles */
        .ProseMirror .youtube-container {
          position: relative;
          width: 100%;
          max-width: 100%;
        }
        
        .ProseMirror .youtube-container iframe {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Error Container Styles */
        .ProseMirror .error-container {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        
        .ProseMirror .error-container p {
          color: #dc2626;
          margin: 0;
          font-size: 0.875rem;
        }
      `}</style>

      {/* Menu Bar (Optional) */}
      {showMenuBar && (
        <div className="border-t border-gray-300 bg-gray-50 p-2 text-xs text-gray-500">
          <span>Supports formatting, links, images, videos, code blocks, blockquotes, task lists, and mathematical formulas.</span>
        </div>
      )}

      {/* Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onInsert={handleLinkInsert}
        selectedText={editor.state.doc.textBetween(
          editor.state.selection.from,
          editor.state.selection.to
        )}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleImageInsert}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onInsert={handleVideoInsert}
      />

      {/* Table Modal */}
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        onInsert={handleTableInsert}
      />
    </div>
  );
};

export default TipTapEditor;
