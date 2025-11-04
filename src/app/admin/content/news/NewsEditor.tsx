'use client';

import { useState, useEffect } from 'react';
import { MediaPicker, MediaItem } from '../../../../components/MediaPicker';
import TipTapEditor from '../../../../components/TipTapEditor';
import toast, { Toaster } from 'react-hot-toast';

interface NewsItem {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string | null;
  featured_image_alt?: string;
  status: 'draft' | 'published' | 'scheduled';
  schedule_date?: string;
  publish_date?: string;
  update_date?: string;
  category_id?: string | null;
  author_id?: string;
  co_authors?: string[];
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  seo_graphs?: string;
  seo_schema?: string;
  estimated_reading_time?: number;
  word_count?: number;
  schema_json?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Author {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface NewsEditorProps {
  newsItem?: NewsItem;
  onSave: (newsItem: NewsItem) => void;
  categories: Category[];
  authors: Author[];
}

const NewsEditor: React.FC<NewsEditorProps> = ({
  newsItem,
  onSave,
  categories,
  authors,
}) => {
  // Form state
  const [formData, setFormData] = useState<NewsItem>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: null,
    featured_image_alt: '',
    status: 'draft',
    publish_date: '',
    update_date: '',
    category_id: null,
    author_id: '',
    co_authors: [],
    tags: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    seo_graphs: '',
    seo_schema: '',
    schema_json: '',
  });
  
  // Media state
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState<string>('');
  const [coAuthorInput, setCoAuthorInput] = useState<string>('');
  const [showCoAuthorDropdown, setShowCoAuthorDropdown] = useState(false);
  
  // Category state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  
  // Calculate reading time and word count
  const calculateStats = (text: string) => {
    const cleanText = text.replace(/<[^>]*>/g, ' ');
    const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    
    return {
      word_count: words,
      estimated_reading_time: readingTime
    };
  };
  
  // Auto-generate SEO data
  const autoGenerateSEO = () => {
    if (formData.title) {
      setFormData(prev => ({
        ...prev,
        seo_title: prev.seo_title || formData.title,
        seo_description: prev.seo_description || formData.excerpt || formData.title,
        seo_keywords: prev.seo_keywords || formData.tags?.join(', ') || ''
      }));
    }
  };

  // Initialize form data when newsItem prop changes
  useEffect(() => {
    if (newsItem) {
      setFormData({
        ...newsItem,
        co_authors: newsItem.co_authors || [],
        tags: newsItem.tags || [],
      });
      
      if (newsItem.featured_image) {
        setImageUrl(newsItem.featured_image);
      }
    }
  }, [newsItem]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !newsItem) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, newsItem]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate stats
      const stats = calculateStats(formData.content);
      
      const newsData = {
        ...formData,
        ...stats,
        featured_image: imageUrl || formData.featured_image,
      };
      
      await onSave(newsData);
      toast.success(newsItem ? 'News item updated successfully!' : 'News item created successfully!');
    } catch (error) {
      console.error('Error saving news item:', error);
      toast.error('Failed to save news item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags?.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag]
        }));
      }
      setTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Handle co-author addition
  const handleAddCoAuthor = (authorId: string) => {
    if (!formData.co_authors?.includes(authorId)) {
      setFormData(prev => ({
        ...prev,
        co_authors: [...(prev.co_authors || []), authorId]
      }));
    }
    setCoAuthorInput('');
    setShowCoAuthorDropdown(false);
  };

  // Handle co-author removal
  const handleRemoveCoAuthor = (authorId: string) => {
    setFormData(prev => ({
      ...prev,
      co_authors: prev.co_authors?.filter(id => id !== authorId) || []
    }));
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
    setImageUrl(media.url);
    setFormData(prev => ({
      ...prev,
      featured_image: media.url,
      featured_image_alt: media.alt_text || ''
    }));
  };

  // Handle category addition
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setIsAddingCategory(true);
    setCategoryError(null);

    try {
      // Here you would typically make an API call to create the category
      // For now, we'll just add it to the local list
      const newCategory = {
        id: `temp-${Date.now()}`,
        name: newCategoryName.trim()
      };
      
      setCategoriesList(prev => [...prev, newCategory]);
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      setNewCategoryName('');
      setShowCategoryModal(false);
      toast.success('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      setCategoryError('Failed to add category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {newsItem ? 'Edit News Item' : 'Create New News Item'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {newsItem ? 'Update your news content and settings' : 'Write and publish your news item'}
          </p>
        </div>
      
        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-none" noValidate>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Main Content Area */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Basic Information Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Enter news title"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="news-item-slug"
                      required
                    />
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt
                    </label>
                    <textarea
                      id="excerpt"
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Brief summary of the news item"
                    />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content</h2>
                <TipTapEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  placeholder="Write your news content here..."
                />
              </div>

              {/* Featured Image Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Featured Image</h2>
                
                <div className="space-y-4">
                  {/* Image URL */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Media Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Or select from media library
                    </label>
                    <MediaPicker
                      onSelect={handleMediaSelect}
                      selectedMedia={selectedMedia}
                    />
                  </div>

                  {/* Alt Text */}
                  <div>
                    <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      id="altText"
                      value={formData.featured_image_alt}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
                
                <div className="space-y-4">
                  {/* Tag Input */}
                  <div>
                    <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 mb-1">
                      Add Tags
                    </label>
                    <input
                      type="text"
                      id="tagInput"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleAddTag}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Type a tag and press Enter"
                    />
                  </div>

                  {/* Tags Display */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full text-red-400 hover:bg-red-200 hover:text-red-500"
                          >
                            <span className="sr-only">Remove</span>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                              <path d="M0 0h8v8H0z" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-4 space-y-8">
              
              {/* Publish Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h2>
                
                <div className="space-y-4">
                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  {/* Schedule Date */}
                  {formData.status === 'scheduled' && (
                    <div>
                      <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Date
                      </label>
                      <input
                        type="datetime-local"
                        id="scheduleDate"
                        value={formData.schedule_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule_date: e.target.value }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Category</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category
                    </label>
                    <select
                      id="category"
                      value={formData.category_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value || null }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    >
                      <option value="">No Category</option>
                      {categoriesList.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    + Add New Category
                  </button>
                </div>
              </div>

              {/* Author */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Author</h2>
                
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Author
                  </label>
                  <select
                    id="author"
                    value={formData.author_id || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, author_id: e.target.value }))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select Author</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">SEO Settings</h2>
                  <button
                    type="button"
                    onClick={autoGenerateSEO}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Auto Generate
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* SEO Title */}
                  <div>
                    <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seoTitle"
                      value={formData.seo_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="SEO optimized title"
                    />
                  </div>

                  {/* SEO Description */}
                  <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Description
                    </label>
                    <textarea
                      id="seoDescription"
                      rows={3}
                      value={formData.seo_description}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="SEO meta description"
                    />
                  </div>

                  {/* SEO Keywords */}
                  <div>
                    <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      id="seoKeywords"
                      value={formData.seo_keywords}
                      onChange={(e) => setFormData(prev => ({ ...prev, seo_keywords: e.target.value }))}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>

              {/* Content Stats */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Content Stats</h2>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Word Count:</span>
                    <span>{formData.word_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reading Time:</span>
                    <span>{formData.estimated_reading_time || 0} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : (newsItem ? 'Update News Item' : 'Create News Item')}
            </button>
          </div>
        </form>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="newCategoryName"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="Enter category name"
                  />
                  {categoryError && (
                    <p className="mt-1 text-sm text-red-600">{categoryError}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setNewCategoryName('');
                      setCategoryError(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={isAddingCategory}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {isAddingCategory ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsEditor;

