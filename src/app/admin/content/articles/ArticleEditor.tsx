'use client';

import { useState, useEffect } from 'react';
import { MediaPicker, MediaItem } from '../../../../components/MediaPicker';
import TipTapEditor from '../../../../components/TipTapEditor';
import toast, { Toaster } from 'react-hot-toast';

interface Article {
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
  email?: string;
  role?: string;
}

interface ArticleEditorProps {
  article?: Article;
  onSave: (article: Article) => void;
  categories: Category[];
  authors: Author[];
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  onSave,
  categories,
  authors,
}) => {
  // Form state
  const [formData, setFormData] = useState<Article>({
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
    const { title, content } = formData;
    
    // Generate SEO title
    let seoTitle = formData.seo_title || title;
    if (!seoTitle && content) {
      const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
      seoTitle = cleanContent.substring(0, 60) + (cleanContent.length > 60 ? '...' : '');
    }
    
    // Generate SEO description
    let seoDescription = formData.seo_description || formData.excerpt;
    if (!seoDescription && content) {
      const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
      seoDescription = cleanContent.substring(0, 160) + (cleanContent.length > 160 ? '...' : '');
    }
    
    // Generate SEO keywords
    let seoKeywords = formData.seo_keywords;
    if (!seoKeywords && content) {
      const cleanContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
      const words = cleanContent.split(/\s+/).filter(word => word.length > 3);
      const wordCount = words.reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const topWords = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([word]) => word);
      
      seoKeywords = topWords.join(', ');
    }
    
    // Generate Open Graph and Twitter Card data
    const seoGraphs = JSON.stringify({
      og_title: seoTitle,
      og_description: seoDescription,
      og_type: 'article',
      og_image: formData.featured_image || '',
      twitter_card: 'summary_large_image',
      twitter_title: seoTitle,
      twitter_description: seoDescription,
      twitter_image: formData.featured_image || ''
    }, null, 2);
    
    // Generate JSON-LD schema
    const seoSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": seoTitle,
      "description": seoDescription,
      "image": formData.featured_image || '',
      "author": {
        "@type": "Person",
        "name": authors.find(a => a.id === formData.author_id)?.name || 'Unknown'
      },
      "publisher": {
        "@type": "Organization",
        "name": "Your Site Name",
        "logo": {
          "@type": "ImageObject",
          "url": "/logo.png"
        }
      },
      "datePublished": formData.publish_date || new Date().toISOString(),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": typeof window !== 'undefined' ? window.location.href : ''
      }
    }, null, 2);
    
    setFormData(prev => ({
      ...prev,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: seoKeywords,
      seo_graphs: seoGraphs,
      seo_schema: seoSchema
    }));
    
    toast.success('SEO data generated successfully!');
  };
  
  // Initialize form data when article changes
  useEffect(() => {
    if (article) {
      const articleCopy = {
        ...article,
        co_authors: article.co_authors || [],
        tags: article.tags || []
      };
      setFormData(articleCopy);
      
      if (article.featured_image) {
        setImageUrl(article.featured_image);
      }
    }
  }, [article]);
  
  // Update categories list when categories prop changes
  useEffect(() => {
    setCategoriesList(categories);
  }, [categories]);
  
  // Filtered co-authors for dropdown
  const filteredCoAuthors = authors.filter(author => 
    author.name.toLowerCase().includes(coAuthorInput.toLowerCase()) &&
    !formData.co_authors?.includes(author.name)
  );
  
  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug when title changes
    if (name === 'title' && value.trim()) {
      const autoSlug = generateSlug(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        // Only auto-generate slug if it's empty or matches the previous auto-generated slug
        slug: prev.slug === '' || prev.slug === generateSlug(prev.title) ? autoSlug : prev.slug
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle editor content change
  const handleEditorChange = (content: string) => {
    const stats = calculateStats(content);
    setFormData(prev => ({ 
      ...prev, 
      content, 
      ...stats 
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!formData.title.trim()) {
        toast.error('Title is required');
        return;
      }
      
      if (!formData.content.trim()) {
        toast.error('Content is required');
        return;
      }
      
      if (!formData.author_id) {
        toast.error('Author is required');
        return;
      }
      
      const finalStats = calculateStats(formData.content);
      const finalFormData = { ...formData, ...finalStats };
      
      await onSave(finalFormData);
      toast.success(article ? 'Article updated successfully!' : 'Article created successfully!');
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle media selection
  const handleMediaSelect = (media: MediaItem) => {
    setSelectedMedia(media);
    setFormData(prev => ({
      ...prev,
      featured_image: media.url,
      featured_image_alt: media.alt || 'Featured image' 
    }));
  };
  
  // Handle image URL input
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
  };
  
  // Handle image URL submission
  const handleImageUrlSubmit = () => {
    const url = imageUrl.trim();
    if (url) {
      // Basic validation for URL format (allows both relative and absolute URLs)
      const isValidUrl = url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || 
                        url.startsWith('http') || 
                        url.startsWith('/') ||
                        url.startsWith('data:');
      
      if (isValidUrl) {
        setFormData(prev => ({
          ...prev,
          featured_image: url,
          featured_image_alt: 'Featured image' 
        }));
        setSelectedMedia(null);
        toast.success('Image URL set successfully!');
      } else {
        toast.error('Please enter a valid image URL');
      }
    }
  };
  
  // Handle tag input
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  // Handle tag input key press
  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags?.includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }));
        setTagInput('');
      }
    }
  };
  
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove) 
    }));
  };

  // Remove co-author
  const removeCoAuthor = (coAuthorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      co_authors: (prev.co_authors || []).filter(coAuthor => coAuthor !== coAuthorToRemove) 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-6 lg:px-8 py-8">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {article ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {article ? 'Update your article content and settings' : 'Write and publish your article'}
          </p>
        </div>
      
        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-none" noValidate>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Main Content Area */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Basic Information Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  {/* Title */}
                  <div className="lg:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter article title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  {/* Slug */}
                  <div className="lg:col-span-2">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      placeholder="article-slug-url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  {/* Author */}
                  <div>
                    <label htmlFor="author_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Author *
                    </label>
                    <select
                      id="author_id"
                      name="author_id"
                      value={formData.author_id || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select an author...</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name} {author.email && `(${author.email})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select a category...</option>
                      {categoriesList.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  
                  {/* Publish Date */}
                  <div>
                    <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date
                    </label>
                    <input
                      type="datetime-local"
                      id="publish_date"
                      name="publish_date"
                      value={formData.publish_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Update Date */}
                  <div>
                    <label htmlFor="update_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Update Date
                    </label>
                    <input
                      type="datetime-local"
                      id="update_date"
                      name="update_date"
                      value={formData.update_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  {/* Schedule Date */}
                  {formData.status === 'scheduled' && (
                    <div>
                      <label htmlFor="schedule_date" className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule Date
                      </label>
                      <input
                        type="datetime-local"
                        id="schedule_date"
                        name="schedule_date"
                        value={formData.schedule_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Content</h2>
                </div>
                
                <div className="pt-4">
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <TipTapEditor
                      content={formData.content}
                      onChange={handleEditorChange}
                      placeholder="Write your article content here..."
                      height="700px"
                      showToolbar={true}
                      showMenuBar={true}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Supports formatting, links, images, code blocks, and mathematical formulas.
                    </p>
                    <div className="text-xs text-gray-500">
                      {formData.word_count || 0} words · {formData.estimated_reading_time || 0} min read
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Featured Image */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="pb-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Featured Image</h2>
                </div>
                
                <div className="pt-4 space-y-4">
                  {/* Current Image Display */}
                  {formData.featured_image && (
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={formData.featured_image}
                          alt={formData.featured_image_alt || 'Featured image'}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          Current featured image
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, featured_image: null, featured_image_alt: '' }));
                            setSelectedMedia(null);
                            setImageUrl('');
                          }}
                          className="mt-1 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Media Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select from Media Library
                    </label>
                    <MediaPicker
                      onSelect={handleMediaSelect}
                      selectedMedia={selectedMedia}
                    />
                  </div>
                  
                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or enter image URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={handleImageUrlChange}
                        placeholder="/uploads/images/filename.jpg or https://example.com/image.jpg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={handleImageUrlSubmit}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Alt Text */}
                  {formData.featured_image && (
                    <div>
                      <label htmlFor="featured_image_alt" className="block text-sm font-medium text-gray-700 mb-1">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        id="featured_image_alt"
                        name="featured_image_alt"
                        value={formData.featured_image_alt || ''}
                        onChange={handleChange}
                        placeholder="Describe the image for accessibility..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar - Metadata & SEO */}
            <div className="xl:col-span-4 space-y-6">
              
              {/* Excerpt Field */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Article Summary</h3>
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows={4}
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Brief summary of the article..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>
              
              {/* Tags */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
                <div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Type a tag and press Enter..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Co-Authors Input */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Co-Authors</h3>
                <div>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={coAuthorInput}
                        onChange={(e) => setCoAuthorInput(e.target.value)}
                        onFocus={() => setShowCoAuthorDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCoAuthorDropdown(false), 200)}
                        placeholder="Search for authors, admins, or editors..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      
                      {/* Co-Author Dropdown */}
                      {showCoAuthorDropdown && coAuthorInput.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                          {filteredCoAuthors.length > 0 ? (
                            filteredCoAuthors.map((user) => (
                              <button
                                key={user.id}
                                type="button"
                                onClick={() => {
                                  if (!formData.co_authors?.includes(user.name)) {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      co_authors: [...(prev.co_authors || []), user.name] 
                                    }));
                                  }
                                  setCoAuthorInput('');
                                  setShowCoAuthorDropdown(false);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-red-600">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {user.name}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">
                                      {user.email} ({user.role})
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <p className="p-4 text-sm text-gray-500">No authors found</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Display selected co-authors */}
                    {formData.co_authors && formData.co_authors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.co_authors.map((coAuthor, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                          >
                            {coAuthor}
                            <button
                              type="button"
                              onClick={() => removeCoAuthor(coAuthor)}
                              className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* SEO Section */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="pb-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">SEO Settings</h2>
                  <button
                    type="button"
                    onClick={autoGenerateSEO}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm font-medium"
                  >
                    Auto-Generate SEO
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-6 pt-4">
                  {/* SEO Title */}
                  <div>
                    <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      id="seo_title"
                      name="seo_title"
                      value={formData.seo_title || ''}
                      onChange={handleChange}
                      placeholder="SEO-optimized title (defaults to article title if empty)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  {/* SEO Description */}
                  <div>
                    <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Description
                    </label>
                    <textarea
                      id="seo_description"
                      name="seo_description"
                      rows={3}
                      value={formData.seo_description || ''}
                      onChange={handleChange}
                      placeholder="SEO-optimized description (defaults to excerpt if empty)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommended length: 150-160 characters
                    </p>
                  </div>
                  
                  {/* SEO Keywords */}
                  <div>
                    <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      id="seo_keywords"
                      name="seo_keywords"
                      value={formData.seo_keywords || ''}
                      onChange={handleChange}
                      placeholder="Comma-separated keywords"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  
                  {/* SEO Graphs */}
                  <div>
                    <label htmlFor="seo_graphs" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Graphs (Open Graph & Twitter Cards)
                    </label>
                    <textarea
                      id="seo_graphs"
                      name="seo_graphs"
                      rows={6}
                      value={formData.seo_graphs || ''}
                      onChange={handleChange}
                      placeholder="Open Graph and Twitter Card metadata..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      JSON format for Open Graph and Twitter Card metadata
                    </p>
                  </div>
                  
                  {/* SEO Schema */}
                  <div>
                    <label htmlFor="seo_schema" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Schema (JSON-LD Structured Data)
                    </label>
                    <textarea
                      id="seo_schema"
                      name="seo_schema"
                      rows={8}
                      value={formData.seo_schema || ''}
                      onChange={handleChange}
                      placeholder="JSON-LD structured data for search engines..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      JSON-LD structured data for search engine optimization
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleEditor;
