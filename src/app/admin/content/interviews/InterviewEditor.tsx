'use client';

import { useState, useEffect } from 'react';
import { MediaPicker, MediaItem } from '../../../../components/MediaPicker';
import TipTapEditor from '../../../../components/TipTapEditor';
import toast, { Toaster } from 'react-hot-toast';
import { FaPlus, FaTrash, FaGripVertical, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Interview {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: any; // JSONB for structured Q&A
  featured_image?: string | null;
  featured_image_alt?: string;
  status: 'draft' | 'published' | 'scheduled';
  schedule_date?: string;
  guest_id?: string;
  category_id?: string | null;
  interview_type: 'text' | 'video' | 'podcast' | 'mixed';
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  schema_json?: string;
  estimated_reading_time?: number;
  featured?: boolean;
}

interface Guest {
  id: string;
  name: string;
  slug: string;
  photo_url?: string;
  bio?: string;
  title?: string;
  company?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface QAItem {
  id: string;
  section: string;
  question: string;
  answer: string;
  isHighlight?: boolean;
  isQuote?: boolean;
}

interface InterviewEditorProps {
  interview?: Interview;
  onSave: (interview: Interview) => void;
  categories: Category[];
  guests: Guest[];
}

const InterviewEditor: React.FC<InterviewEditorProps> = ({
  interview,
  onSave,
  categories,
  guests,
}) => {
  // Form state
  const [formData, setFormData] = useState<Interview>({
    title: '',
    slug: '',
    excerpt: '',
    content: {
      intro: '',
      outro: '',
      qa: []
    },
    featured_image: null,
    featured_image_alt: '',
    status: 'draft',
    interview_type: 'text',
    guest_id: '',
    category_id: null,
    tags: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    schema_json: '',
    featured: false,
  });
  
  // Media state
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState<string>('');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [qaItems, setQaItems] = useState<QAItem[]>([]);
  const [currentSection, setCurrentSection] = useState<string>('Background');
  
  // Question sections
  const sections = ['Background', 'Technical', 'Opinion', 'Advice', 'Future of AI', 'General'];

  // Initialize form data when interview changes
  useEffect(() => {
    if (interview) {
      const interviewCopy = {
        ...interview,
        content: interview.content || { intro: '', outro: '', qa: [] },
        tags: interview.tags || []
      };
      setFormData(interviewCopy);
      
      if (interview.featured_image) {
        setImageUrl(interview.featured_image);
      }
      
      // Load Q&A items
      if (interview.content?.qa && Array.isArray(interview.content.qa)) {
        setQaItems(interview.content.qa);
      }
    }
  }, [interview]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  };

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({ ...prev, [name]: value, slug: generateSlug(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle Q&A item changes
  const handleQAChange = (id: string, field: keyof QAItem, value: any) => {
    setQaItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Add new Q&A item
  const addQAItem = () => {
    const newItem: QAItem = {
      id: `qa-${Date.now()}`,
      section: currentSection,
      question: '',
      answer: '',
      isHighlight: false,
      isQuote: false,
    };
    setQaItems(prev => [...prev, newItem]);
  };

  // Remove Q&A item
  const removeQAItem = (id: string) => {
    setQaItems(prev => prev.filter(item => item.id !== id));
  };

  // Move Q&A item
  const moveQAItem = (id: string, direction: 'up' | 'down') => {
    const index = qaItems.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= qaItems.length) return;
    
    const newItems = [...qaItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setQaItems(newItems);
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
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

  // Handle image URL submission
  const handleImageUrlSubmit = () => {
    const url = imageUrl.trim();
    if (url) {
      setFormData(prev => ({
        ...prev,
        featured_image: url,
        featured_image_alt: prev.featured_image_alt || 'Featured image'
      }));
      toast.success('Image URL set');
    }
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
      
      if (!formData.guest_id) {
        toast.error('Guest is required');
        return;
      }
      
      // Update content with Q&A items
      const finalContent = {
        ...formData.content,
        qa: qaItems
      };
      
      const finalFormData = {
        ...formData,
        content: finalContent
      };
      
      await onSave(finalFormData);
      toast.success(interview ? 'Interview updated successfully!' : 'Interview created successfully!');
    } catch (error) {
      console.error('Error saving interview:', error);
      toast.error('Failed to save interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Q&A items by section
  const getQABySection = (section: string) => {
    return qaItems.filter(item => item.section === section);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Toaster />
      
      {/* Basic Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Guest Selection */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Guest *</h2>
          <button
            type="button"
            onClick={() => setShowGuestModal(true)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            + New Guest
          </button>
        </div>
        
        <select
          name="guest_id"
          value={formData.guest_id}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Select a guest...</option>
          {guests.map(guest => (
            <option key={guest.id} value={guest.id}>
              {guest.name} {guest.title && `- ${guest.title}`} {guest.company && `at ${guest.company}`}
            </option>
          ))}
        </select>
      </div>

      {/* Interview Metadata */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Interview Metadata</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category_id"
              value={formData.category_id || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select a category...</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Type
            </label>
            <select
              name="interview_type"
              value={formData.interview_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="video">Video</option>
              <option value="podcast">Podcast</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured
            </label>
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              className="w-4 h-4"
            />
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Featured Image</h2>
        
        <div className="space-y-4">
          <MediaPicker onSelect={handleMediaSelect} />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or enter image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              <button
                type="button"
                onClick={handleImageUrlSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Set URL
              </button>
            </div>
          </div>
          
          {formData.featured_image && (
            <div>
              <img
                src={formData.featured_image}
                alt={formData.featured_image_alt || 'Featured image'}
                className="max-w-md rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      {/* Introduction */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <TipTapEditor
          content={formData.content?.intro || ''}
          onChange={(content) => setFormData(prev => ({
            ...prev,
            content: { ...prev.content, intro: content }
          }))}
        />
      </div>

      {/* Q&A Sections */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Questions & Answers</h2>
          <div className="flex gap-2">
            <select
              value={currentSection}
              onChange={(e) => setCurrentSection(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {sections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addQAItem}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2"
            >
              <FaPlus /> Add Q&A
            </button>
          </div>
        </div>
        
        {sections.map(section => {
          const sectionItems = getQABySection(section);
          if (sectionItems.length === 0) return null;
          
          return (
            <div key={section} className="mb-6">
              <h3 className="text-lg font-medium mb-3">{section}</h3>
              {sectionItems.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <select
                      value={item.section}
                      onChange={(e) => handleQAChange(item.id, 'section', e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                      {sections.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                    <div className="flex gap-1 ml-auto">
                      <button
                        type="button"
                        onClick={() => moveQAItem(item.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        <FaArrowUp />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveQAItem(item.id, 'down')}
                        disabled={index === sectionItems.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        <FaArrowDown />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeQAItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => handleQAChange(item.id, 'question', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter question..."
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Answer
                    </label>
                    <TipTapEditor
                      content={item.answer}
                      onChange={(content) => handleQAChange(item.id, 'answer', content)}
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.isHighlight || false}
                        onChange={(e) => handleQAChange(item.id, 'isHighlight', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Highlight</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.isQuote || false}
                        onChange={(e) => handleQAChange(item.id, 'isQuote', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Pull Quote</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Conclusion */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Conclusion</h2>
        <TipTapEditor
          content={formData.content?.outro || ''}
          onChange={(content) => setFormData(prev => ({
            ...prev,
            content: { ...prev.content, outro: content }
          }))}
        />
      </div>

      {/* Tags */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Tags</h2>
        
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagInput}
          placeholder="Type a tag and press Enter"
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
        />
        
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              name="seo_title"
              value={formData.seo_title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              name="seo_description"
              value={formData.seo_description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Keywords
            </label>
            <input
              type="text"
              name="seo_keywords"
              value={formData.seo_keywords}
              onChange={handleChange}
              placeholder="keyword1, keyword2, keyword3"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : interview ? 'Update Interview' : 'Create Interview'}
        </button>
      </div>
    </form>
  );
};

export default InterviewEditor;

