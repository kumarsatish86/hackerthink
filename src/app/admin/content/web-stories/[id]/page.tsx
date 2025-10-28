'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentDuplicateIcon as DuplicateIcon, 
  EyeIcon, 
  PlayIcon,
  PauseIcon,
  SwatchIcon as PaletteIcon,
  PhotoIcon,
  DocumentTextIcon as TextIcon,
  SparklesIcon,
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CogIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

interface StorySlide {
  id: string;
  content: string;
  background_type: 'color' | 'image' | 'gradient';
  background_value: string;
  text_color: string;
  layout: 'top' | 'center' | 'bottom' | 'full';
  animation: 'fade' | 'slide' | 'zoom' | 'bounce';
  duration: number;
  font_size: number;
  footer_text: string;
  footer_url: string;
  logo_url: string;
  logo_alignment: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  logo_opacity: number;
}

interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  is_published: boolean;
  creation_method: 'manual' | 'ai';
  content: string;
  created_at: string;
  updated_at: string;
}

export default function EditWebStory() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [story, setStory] = useState<WebStory | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Enhanced slide structure
  const [slides, setSlides] = useState<StorySlide[]>([{
    id: '1',
    content: 'Welcome to your web story!',
    background_type: 'color',
    background_value: '#667eea',
    text_color: '#ffffff',
    layout: 'center',
    animation: 'fade',
    duration: 5,
    font_size: 18,
    footer_text: '',
    footer_url: '',
    logo_url: '',
    logo_alignment: 'top-left',
    logo_opacity: 100
  }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // State persistence and initialization
  useEffect(() => {
    // Load state from sessionStorage on mount
    const savedState = sessionStorage.getItem(`web-story-${id}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.slides) setSlides(parsedState.slides);
        if (parsedState.currentSlide !== undefined) setCurrentSlide(parsedState.currentSlide);
        if (parsedState.title) setTitle(parsedState.title);
        if (parsedState.slug) setSlug(parsedState.slug);
        if (parsedState.coverImage) setCoverImage(parsedState.coverImage);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading saved state:', error);
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, [id]);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      const stateToSave = {
        slides,
        currentSlide,
        title,
        slug,
        coverImage,
        timestamp: Date.now()
      };
      sessionStorage.setItem(`web-story-${id}`, JSON.stringify(stateToSave));
    }
  }, [slides, currentSlide, title, slug, coverImage, isInitialized, id]);

  // Redirect if not authenticated - only run when status changes
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
        router.push('/dashboard');
      return;
    }
    
    if (status === 'authenticated' && session?.user?.role === 'admin' && isInitialized) {
        fetchStory();
      }
  }, [status, session?.user?.role, isInitialized]); // Removed router and id from dependencies

  // Separate useEffect for event listeners to prevent re-registration
  useEffect(() => {
    // Prevent any form submissions that might cause page reloads
    const handleFormSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // Add event listener to prevent form submissions
    document.addEventListener('submit', handleFormSubmit, true);
    
    // Add beforeunload listener to warn about unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return 'You have unsaved changes. Are you sure you want to leave?';
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('submit', handleFormSubmit, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty dependency array - only run once

  const fetchStory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/web-stories/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const storyData = data.story;
        setStory(storyData);
        setTitle(storyData.title);
        setSlug(storyData.slug);
        setCoverImage(storyData.cover_image);
        
        // Parse slides from JSON content
        try {
          const slidesData = JSON.parse(storyData.content || '[]');
          // Ensure all slides have the new properties with fallbacks
          const enhancedSlides = slidesData.map((slide: any) => ({
            ...slide,
            font_size: slide.font_size || 18,
            footer_text: slide.footer_text || '',
            footer_url: slide.footer_url || '',
            logo_url: slide.logo_url || '',
            logo_alignment: slide.logo_alignment || 'top-left',
            logo_opacity: slide.logo_opacity || 100
          }));
          setSlides(enhancedSlides);
        } catch (parseError) {
          console.error('Error parsing slides:', parseError);
          // If parsing fails, create a default slide
          setSlides([{
          id: '1',
            content: 'Welcome to your web story!',
              background_type: 'color',
            background_value: '#667eea',
              text_color: '#ffffff',
            layout: 'center',
            animation: 'fade',
            duration: 5,
            font_size: 18,
            footer_text: '',
            footer_url: '',
            logo_url: '',
            logo_alignment: 'top-left',
            logo_opacity: 100
          }]);
        }
      } else {
        setStatusMessage({ message: data.message || 'Story not found', type: 'error' });
      }
    } catch (err) {
      console.error('Error fetching web story:', err);
      setStatusMessage({ message: 'Failed to load web story. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setSlug(newSlug);
  };

  // Add new slide
  const addNewSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      content: 'New slide content',
      background_type: 'color' as const,
      background_value: '#667eea',
      text_color: '#ffffff',
      layout: 'center' as const,
      animation: 'fade' as const,
      duration: 5,
      font_size: 18,
      footer_text: '',
      footer_url: '',
      logo_url: '',
      logo_alignment: 'top-left' as const,
      logo_opacity: 100
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  // Delete slide
  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlide >= newSlides.length) {
      setCurrentSlide(newSlides.length - 1);
      }
    }
  };

  // Update current slide
  const updateCurrentSlide = (field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = { ...newSlides[currentSlide], [field]: value };
    setSlides(newSlides);
  };

  // Save story
  const handleSaveStory = async () => {
    if (!title.trim()) {
      setStatusMessage({ message: 'Please enter a title', type: 'error' });
      return;
    }
    
    if (!slug.trim()) {
      setStatusMessage({ message: 'Please enter a URL slug', type: 'error' });
      return;
    }
    
    if (slides.length === 0) {
      setStatusMessage({ message: 'Please add at least one slide', type: 'error' });
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare the story data
      const storyData = {
        title: title.trim(),
        slug: slug.trim(),
        cover_image: coverImage.trim(),
        is_published: story?.is_published || false,
        creation_method: story?.creation_method || 'manual',
        content: JSON.stringify(slides) // Store slides as JSON
      };
      
      // Make API call to update the web story
      const response = await fetch(`/api/admin/web-stories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });
      
      const data = await response.json();
      
      if (data.success) {
      setStatusMessage({ message: 'Web story updated successfully!', type: 'success' });
      
      // Clear saved state after successful save
      sessionStorage.removeItem(`web-story-${id}`);
      
      setTimeout(() => {
        router.push('/admin/content/web-stories');
      }, 1500);
      } else {
        setStatusMessage({ message: data.message || 'Failed to update story. Please try again.', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating story:', err);
      setStatusMessage({ message: 'Failed to update story. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin/content/web-stories" className="text-indigo-600 hover:text-indigo-700">
                ← Back to Web Stories
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Edit Web Story</h1>
            </div>
            <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/content/web-stories')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveStory}
            disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className={`mx-4 mt-4 p-4 rounded-lg ${
          statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {statusMessage.message}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Section - Story Details & Slide Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Story Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Story Details</h2>
            <div className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Story Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter your story title..."
              />
            </div>
              
            <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="url-friendly-slug"
              />
            </div>
              
            <div>
                <label htmlFor="cover" className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <input
                type="text"
                id="cover"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
                  />
                </div>

              {/* Story Status */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    story?.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {story?.is_published ? 'Published' : 'Draft'}
                </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {story?.created_at ? new Date(story.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Slide Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <ArrowsUpDownIcon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Slide Management</h2>
              </div>
              <button
                onClick={addNewSlide}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Slide</span>
              </button>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
                  {slides.map((slide, index) => (
                    <div 
                  key={slide.id}
                  className={`group relative rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    currentSlide === index
                      ? 'border-indigo-400 bg-indigo-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white/50'
                  }`}
                      onClick={() => setCurrentSlide(index)}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                          <ArrowsUpDownIcon className="w-full h-full" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Slide {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            const newSlide = { ...slide, id: Date.now().toString() };
                            setSlides([...slides, newSlide]);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                          title="Duplicate slide"
                        >
                          <DuplicateIcon className="w-3 h-3" />
                        </button>
                        {slides.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                            title="Delete slide"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Mini Slide Preview */}
                    <div 
                      className="mt-2 aspect-[3/4] rounded-lg overflow-hidden relative"
                      style={{
                        backgroundColor: slide.background_type === 'color' ? slide.background_value : 'transparent',
                        backgroundImage: slide.background_type === 'image' ? `url(${slide.background_value})` : 
                                       slide.background_type === 'gradient' ? slide.background_value : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      <div 
                        className={`absolute inset-0 flex justify-center p-2 ${
                          slide.layout === 'top' ? 'items-start pt-2' :
                          slide.layout === 'bottom' ? 'items-end pb-2' :
                          slide.layout === 'center' ? 'items-center' :
                          slide.layout === 'full' ? 'items-center p-1' :
                          'items-center'
                        }`}
                      >
                        <div 
                          className={`text-xs line-clamp-3 overflow-hidden max-w-full ${
                            slide.layout === 'full' ? 'text-justify w-full' : 'text-center'
                          }`}
                          style={{ color: slide.text_color }}
                          dangerouslySetInnerHTML={{ 
                            __html: slide.content.substring(0, 80) + (slide.content.length > 80 ? '...' : '') 
                          }}
                        />
                        </div>
                    </div>
                  </div>
                </div>
              ))}
                      </div>
                      
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Total Slides: {slides.length}</span>
                <span>Current: {currentSlide + 1}</span>
              </div>
            </div>
          </div>
                      </div>
                      
        {/* Enhanced Slide Editor with Icon-Based Controls */}
        <div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          onSubmit={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target instanceof HTMLButtonElement) {
              e.preventDefault();
            }
          }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-bold text-gray-900">Slide Editor</h2>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-800">Mobile Preview</h3>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700">
                    9:16
                  </button>
                  <span className="text-xs text-gray-500">Mobile</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Slide {currentSlide + 1} of {slides.length}</span>
              <div className="flex space-x-2">
                        <button
                  type="button"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous slide"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                        </button>
                <button
                  type="button"
                  onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                  disabled={currentSlide === slides.length - 1}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next slide"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
                    </div>
                </div>
            </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-300px)] min-h-0">
            {/* Left Controls Panel */}
            <div className="lg:col-span-5 space-y-6 flex flex-col h-full">
              {/* Rich Text Content Editor */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 flex flex-col">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-4 h-4 text-white" />
          </div>
                  <label className="text-sm font-semibold text-blue-800">Content</label>
        </div>

                {/* Rich Text Toolbar */}
                <div className="flex flex-wrap gap-2 mb-3 p-2 bg-white/80 rounded-lg border border-blue-200">
                  <button
                    onClick={() => {
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        document.execCommand('bold', false);
                      }
                    }}
                    className="px-2 py-1 text-sm font-bold bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    onClick={() => {
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        document.execCommand('italic', false);
                      }
                    }}
                    className="px-2 py-1 text-sm italic bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    onClick={() => {
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        document.execCommand('underline', false);
                      }
                    }}
                    className="px-2 py-1 text-sm underline bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Underline"
                  >
                    U
                  </button>
                  <div className="border-l border-gray-300 mx-1"></div>
                  <select
                    onChange={(e) => {
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        document.execCommand('fontSize', false, e.target.value);
                      }
                    }}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                    title="Font Size"
                  >
                    <option value="1">8px</option>
                    <option value="2">10px</option>
                    <option value="3">12px</option>
                    <option value="4">14px</option>
                    <option value="5">18px</option>
                    <option value="6">24px</option>
                    <option value="7">36px</option>
                  </select>
                  <div className="border-l border-gray-300 mx-1"></div>
                        <input
                    type="color"
                    onChange={(e) => {
                      document.execCommand('foreColor', false, e.target.value);
                    }}
                    className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                    title="Text Color"
                  />
                </div>
                
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => {
                    e.preventDefault();
                    const content = e.currentTarget.innerHTML;
                    updateCurrentSlide('content', content);
                  }}
                  onKeyDown={(e) => {
                    // Prevent Enter key from causing page reload
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      document.execCommand('insertHTML', false, '<br>');
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                  }}
                  dangerouslySetInnerHTML={{ __html: slides[currentSlide]?.content || '<p style="color: #999;">Write your slide content here...</p>' }}
                  className="w-full flex-1 px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/70 focus:outline-none min-h-[150px]"
                  style={{ minHeight: '150px' }}
                />
                    </div>
                    
                             {/* Background Controls */}
               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <PaletteIcon className="w-4 h-4 text-white" />
                  </div>
                  <label className="text-sm font-semibold text-purple-800">Background</label>
                </div>
                
                {/* Background Type Selector */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => updateCurrentSlide('background_type', 'color')}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      slides[currentSlide]?.background_type === 'color'
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-purple-200 hover:border-purple-300 text-gray-700 bg-white/70'
                    }`}
                  >
                    🎨 Color
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentSlide('background_type', 'image')}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      slides[currentSlide]?.background_type === 'image'
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-purple-200 hover:border-purple-300 text-gray-700 bg-white/70'
                    }`}
                  >
                    🖼️ Image
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCurrentSlide('background_type', 'gradient')}
                    className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      slides[currentSlide]?.background_type === 'gradient'
                        ? 'border-purple-500 bg-purple-100 text-purple-700'
                        : 'border-purple-200 hover:border-purple-300 text-gray-700 bg-white/70'
                    }`}
                  >
                    🌈 Gradient
                  </button>
                </div>
                
                {/* Color Background Controls */}
                {slides[currentSlide]?.background_type === 'color' && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                          <input
                            type="color"
                        value={slides[currentSlide]?.background_value || '#667eea'}
                            onChange={(e) => updateCurrentSlide('background_value', e.target.value)}
                        className="w-12 h-12 border border-purple-200 rounded-lg cursor-pointer"
                          />
                      <div className="flex-1">
                          <input
                            type="text"
                          value={slides[currentSlide]?.background_value || '#667eea'}
                            onChange={(e) => updateCurrentSlide('background_value', e.target.value)}
                          className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white/70 text-sm"
                          placeholder="#667eea"
                          />
                        </div>
                      </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'].map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => updateCurrentSlide('background_value', color)}
                          className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                            slides[currentSlide]?.background_value === color
                              ? 'border-purple-400 scale-110 shadow-lg'
                              : 'border-purple-200'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Image Background Controls */}
                {slides[currentSlide]?.background_type === 'image' && (
                  <div className="space-y-3">
                        <input
                      type="url"
                      value={slides[currentSlide]?.background_value || ''}
                          onChange={(e) => updateCurrentSlide('background_value', e.target.value)}
                      className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white/70 text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
                        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
                        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400',
                        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400'
                      ].map((imageUrl, index) => (
                        <button
                          type="button"
                          key={index}
                          onClick={() => updateCurrentSlide('background_value', imageUrl)}
                          className={`aspect-square rounded-lg border-2 transition-all hover:scale-105 overflow-hidden ${
                            slides[currentSlide]?.background_value === imageUrl
                              ? 'border-purple-400 scale-105 shadow-lg'
                              : 'border-purple-200'
                          }`}
                        >
                          <img 
                            src={imageUrl} 
                            alt={`Background ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                      </div>
                    )}
                
                {/* Gradient Background Controls */}
                {slides[currentSlide]?.background_type === 'gradient' && (
                  <div className="space-y-2">
                    {/* Custom Gradient Controls - Compact */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-purple-700">Custom:</span>
                        <select
                          value={slides[currentSlide]?.gradient_type || '2-color'}
                          onChange={(e) => updateCurrentSlide('gradient_type', e.target.value)}
                          className="px-2 py-1 border border-purple-200 rounded text-xs bg-white/70 w-20"
                        >
                          <option value="2-color">2 Colors</option>
                          <option value="3-color">3 Colors</option>
                        </select>
                  </div>
                  
                      {/* 2-Color Gradient - Compact */}
                      {slides[currentSlide]?.gradient_type === '2-color' && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                      <input
                        type="color"
                              value={slides[currentSlide]?.gradient_color1 || '#667eea'}
                              onChange={(e) => updateCurrentSlide('gradient_color1', e.target.value)}
                              className="w-6 h-6 border border-purple-200 rounded cursor-pointer"
                      />
                      <input
                              type="color"
                              value={slides[currentSlide]?.gradient_color2 || '#764ba2'}
                              onChange={(e) => updateCurrentSlide('gradient_color2', e.target.value)}
                              className="w-6 h-6 border border-purple-200 rounded cursor-pointer"
                            />
                            <select
                              value={slides[currentSlide]?.gradient_direction || '45deg'}
                              onChange={(e) => updateCurrentSlide('gradient_direction', e.target.value)}
                              className="px-1 py-1 border border-purple-200 rounded text-xs bg-white/70 w-12"
                            >
                              <option value="0deg">→</option>
                              <option value="45deg">↗</option>
                              <option value="90deg">↑</option>
                              <option value="135deg">↖</option>
                              <option value="180deg">←</option>
                              <option value="225deg">↙</option>
                              <option value="270deg">↓</option>
                              <option value="315deg">↘</option>
                            </select>
                    </div>
                          <div 
                            className="w-full h-6 rounded border border-purple-200"
                            style={{ 
                              background: `linear-gradient(${slides[currentSlide]?.gradient_direction || '45deg'}, ${slides[currentSlide]?.gradient_color1 || '#667eea'}, ${slides[currentSlide]?.gradient_color2 || '#764ba2'})`
                            }}
                          ></div>
                  </div>
                      )}
                      
                      {/* 3-Color Gradient - Compact */}
                      {slides[currentSlide]?.gradient_type === '3-color' && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <input
                              type="color"
                              value={slides[currentSlide]?.gradient_color1 || '#667eea'}
                              onChange={(e) => updateCurrentSlide('gradient_color1', e.target.value)}
                              className="w-6 h-6 border border-purple-200 rounded cursor-pointer"
                            />
                            <input
                              type="color"
                              value={slides[currentSlide]?.gradient_color2 || '#f093fb'}
                              onChange={(e) => updateCurrentSlide('gradient_color2', e.target.value)}
                              className="w-6 h-6 border border-purple-200 rounded cursor-pointer"
                            />
                            <input
                              type="color"
                              value={slides[currentSlide]?.gradient_color3 || '#f5576c'}
                              onChange={(e) => updateCurrentSlide('gradient_color3', e.target.value)}
                              className="w-6 h-6 border border-purple-200 rounded cursor-pointer"
                            />
                            <select
                              value={slides[currentSlide]?.gradient_direction || '45deg'}
                              onChange={(e) => updateCurrentSlide('gradient_direction', e.target.value)}
                              className="px-1 py-1 border border-purple-200 rounded text-xs bg-white/70 w-12"
                            >
                              <option value="0deg">→</option>
                              <option value="45deg">↗</option>
                              <option value="90deg">↑</option>
                              <option value="135deg">↖</option>
                              <option value="180deg">←</option>
                              <option value="225deg">↙</option>
                              <option value="270deg">↓</option>
                              <option value="315deg">↘</option>
                            </select>
                      </div>
                          <div 
                            className="w-full h-6 rounded border border-purple-200"
                            style={{ 
                              background: `linear-gradient(${slides[currentSlide]?.gradient_direction || '45deg'}, ${slides[currentSlide]?.gradient_color1 || '#667eea'}, ${slides[currentSlide]?.gradient_color2 || '#f093fb'}, ${slides[currentSlide]?.gradient_color3 || '#f5576c'})`
                            }}
                          ></div>
                  </div>
                      )}
                </div>
                
                    {/* Predefined Gradients - Compact */}
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-purple-700">Quick:</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          'linear-gradient(45deg, #667eea, #764ba2)',
                          'linear-gradient(45deg, #f093fb, #f5576c)',
                          'linear-gradient(45deg, #4facfe, #00f2fe)',
                          'linear-gradient(45deg, #43e97b, #38f9d7)',
                          'linear-gradient(135deg, #667eea, #764ba2)',
                          'linear-gradient(90deg, #ff9a9e, #fecfef)'
                        ].map((gradient, index) => (
                          <button
                            type="button"
                            key={index}
                            onClick={() => updateCurrentSlide('background_value', gradient)}
                            className={`h-8 rounded border transition-all hover:scale-105 ${
                              slides[currentSlide]?.background_value === gradient
                                ? 'border-purple-400 scale-105 shadow-lg'
                                : 'border-purple-200'
                            }`}
                            style={{ background: gradient }}
                            title={`Gradient ${index + 1}`}
                          />
                        ))}
                  </div>
                </div>
              </div>
                )}
              </div>
              

            </div>

            {/* Mobile Preview - Aligned with Side Panels */}
            <div className="lg:col-span-4 flex flex-col items-center justify-start">
              
              {/* Enhanced Mobile Preview */}
              <div className="relative">
                {/* Phone Frame */}
                <div className="bg-gray-800 rounded-[2rem] p-1.5 shadow-2xl">
                  <div className="bg-black rounded-[1.5rem] p-0.5">
                    <div 
                      className="w-72 h-[576px] rounded-[1.25rem] overflow-hidden relative bg-white"
                  style={{
                        backgroundColor: slides[currentSlide]?.background_type === 'color' ? slides[currentSlide]?.background_value : 'transparent',
                        backgroundImage: slides[currentSlide]?.background_type === 'image' ? `url(${slides[currentSlide]?.background_value})` : 
                                       slides[currentSlide]?.background_type === 'gradient' ? 
                                         (slides[currentSlide]?.gradient_type === '2-color' ? 
                                           `linear-gradient(${slides[currentSlide]?.gradient_direction || '45deg'}, ${slides[currentSlide]?.gradient_color1 || '#667eea'}, ${slides[currentSlide]?.gradient_color2 || '#764ba2'})` :
                                           slides[currentSlide]?.gradient_type === '3-color' ?
                                           `linear-gradient(${slides[currentSlide]?.gradient_direction || '45deg'}, ${slides[currentSlide]?.gradient_color1 || '#667eea'}, ${slides[currentSlide]?.gradient_color2 || '#f093fb'}, ${slides[currentSlide]?.gradient_color3 || '#f5576c'})` :
                                           slides[currentSlide]?.background_value) : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                      {/* Status Bar */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-6 text-white text-xs font-medium">
                        <span>9:41</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-2 border border-white rounded-sm">
                            <div className="w-full h-full bg-white rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Logo */}
                      {slides[currentSlide]?.logo_url && (
                        <div 
                          className={`absolute z-10 ${
                            slides[currentSlide]?.logo_alignment === 'top-left' ? 'top-4 left-4' :
                            slides[currentSlide]?.logo_alignment === 'top-right' ? 'top-4 right-4' :
                            slides[currentSlide]?.logo_alignment === 'bottom-left' ? 'bottom-16 left-4' :
                            slides[currentSlide]?.logo_alignment === 'bottom-right' ? 'bottom-16 right-4' :
                            'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                          }`}
                        >
                          <img 
                            src={slides[currentSlide]?.logo_url} 
                            alt="Logo"
                            className="max-w-16 max-h-16 object-contain"
                            style={{ opacity: (slides[currentSlide]?.logo_opacity || 100) / 100 }}
                  />
                </div>
                      )}

                      {/* Content Area */}
                      <div 
                        className={`absolute inset-0 flex justify-center p-8 pt-12 ${
                          slides[currentSlide]?.layout === 'top' ? 'items-start pt-16' :
                          slides[currentSlide]?.layout === 'bottom' ? 'items-end pb-16' :
                          slides[currentSlide]?.layout === 'center' ? 'items-center' :
                          slides[currentSlide]?.layout === 'full' ? 'items-center p-4 pt-8' :
                          'items-center'
                        }`}
                      >
                        <div 
                          className={`leading-relaxed text-lg font-medium ${
                            slides[currentSlide]?.layout === 'full' ? 'text-justify w-full' : 'text-center'
                          }`}
                          style={{ color: slides[currentSlide]?.text_color }}
                          dangerouslySetInnerHTML={{ 
                            __html: slides[currentSlide]?.content || '<p>No content</p>'
                          }}
                      />
              </div>

                      {/* Footer Text */}
                      {slides[currentSlide]?.footer_text && (
                        <div className="absolute bottom-20 left-4 right-4 text-center">
                          <a 
                            href={slides[currentSlide]?.footer_url || '#'}
                            className="text-white text-sm underline hover:no-underline"
                            style={{ 
                              textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                              opacity: 0.9
                            }}
                          >
                            {slides[currentSlide]?.footer_text}
                          </a>
            </div>
          )}
                      
                      {/* Progress Indicator */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {slides.map((_, index) => (
                          <div
                            key={index}
                            className={`w-8 h-1 rounded-full transition-all ${
                              index === currentSlide ? 'bg-white' : 'bg-white/30'
                            }`}
                          />
                        ))}
        </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions - Integrated with Mobile Frame */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200">
                  <button
                    onClick={() => deleteSlide(currentSlide)}
                    disabled={slides.length <= 1}
                    className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full shadow-md transition-all"
                    title="Delete slide"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newSlide = { ...slides[currentSlide], id: Date.now().toString() };
                      setSlides([...slides, newSlide]);
                    }}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-md transition-all"
                    title="Duplicate slide"
                  >
                    <DuplicateIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={addNewSlide}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-md transition-all"
                    title="Add new slide"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Controls Panel - Compact Design */}
            <div className="lg:col-span-3 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Layout & Animation - Combined Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Layout Controls - Compact */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                      <ArrowsUpDownIcon className="w-3 h-3 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-orange-800">Layout</label>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'top', icon: '⬆️' },
                      { id: 'center', icon: '🎯' },
                      { id: 'bottom', icon: '⬇️' },
                      { id: 'full', icon: '📱' }
                    ].map((layout) => (
                      <button
                        type="button"
                        key={layout.id}
                        onClick={() => updateCurrentSlide('layout', layout.id)}
                        className={`p-2 rounded border text-xs flex items-center justify-center transition-all ${
                          slides[currentSlide]?.layout === layout.id
                            ? 'border-orange-400 bg-orange-100 text-orange-700'
                            : 'border-orange-200 hover:border-orange-300 text-gray-700 bg-white/70'
                        }`}
                        title={layout.id}
                      >
                        <span className="text-sm">{layout.icon}</span>
                      </button>
                    ))}
                      </div>
                </div>

                {/* Animation Controls - Compact */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-3 border border-pink-200">
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="w-6 h-6 bg-pink-500 rounded flex items-center justify-center">
                      <SparklesIcon className="w-3 h-3 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-pink-800">Animation</label>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { id: 'fade', icon: '🌅' },
                      { id: 'slide', icon: '➡️' },
                      { id: 'zoom', icon: '🔍' },
                      { id: 'bounce', icon: '⚡' }
                    ].map((animation) => (
                      <button
                        type="button"
                        key={animation.id}
                        onClick={() => updateCurrentSlide('animation', animation.id)}
                        className={`p-2 rounded border text-xs flex items-center justify-center transition-all ${
                          slides[currentSlide]?.animation === animation.id
                            ? 'border-pink-400 bg-pink-100 text-pink-700'
                            : 'border-pink-200 hover:border-pink-300 text-gray-700 bg-white/70'
                        }`}
                        title={animation.id}
                      >
                        <span className="text-sm">{animation.icon}</span>
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
                
              {/* Duration Control - Compact */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center">
                      <ClockIcon className="w-3 h-3 text-white" />
                    </div>
                    <label className="text-xs font-semibold text-teal-800">Duration</label>
                  </div>
                  <span className="text-xs text-teal-600">{slides[currentSlide]?.duration || 5}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={slides[currentSlide]?.duration || 5}
                  onChange={(e) => updateCurrentSlide('duration', parseInt(e.target.value))}
                  className="w-full h-2 bg-teal-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>


              
              {/* Footer Text Control - Compact */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
                <div className="flex items-center space-x-1 mb-2">
                  <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center">
                    <DocumentTextIcon className="w-3 h-3 text-white" />
                  </div>
                  <label className="text-xs font-semibold text-indigo-800">Footer</label>
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={slides[currentSlide]?.footer_text || ''}
                    onChange={(e) => updateCurrentSlide('footer_text', e.target.value)}
                    className="w-full px-2 py-1 border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 bg-white/70 text-xs"
                    placeholder="Footer text"
                  />
                  <input
                    type="url"
                    value={slides[currentSlide]?.footer_url || ''}
                    onChange={(e) => updateCurrentSlide('footer_url', e.target.value)}
                    className="w-full px-2 py-1 border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 bg-white/70 text-xs"
                    placeholder="URL"
                  />
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={slides[currentSlide]?.footer_color || '#ffffff'}
                      onChange={(e) => updateCurrentSlide('footer_color', e.target.value)}
                      className="w-8 h-8 border border-indigo-200 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={slides[currentSlide]?.footer_color || '#ffffff'}
                      onChange={(e) => updateCurrentSlide('footer_color', e.target.value)}
                      className="flex-1 px-2 py-1 border border-indigo-200 rounded focus:ring-1 focus:ring-indigo-500 bg-white/70 text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Logo Control - Ultra Compact */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-3 border border-violet-200">
                <div className="flex items-center space-x-1 mb-2">
                  <div className="w-6 h-6 bg-violet-500 rounded flex items-center justify-center">
                    <PhotoIcon className="w-3 h-3 text-white" />
                  </div>
                  <label className="text-xs font-semibold text-violet-800">Logo</label>
                </div>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={slides[currentSlide]?.logo_url || ''}
                    onChange={(e) => updateCurrentSlide('logo_url', e.target.value)}
                    className="w-full px-2 py-1 border border-violet-200 rounded focus:ring-1 focus:ring-violet-500 bg-white/70 text-xs"
                    placeholder="Logo URL"
                  />
                  
                  <div className="flex items-center space-x-2">
                    <select
                      value={slides[currentSlide]?.logo_alignment || 'top-left'}
                      onChange={(e) => updateCurrentSlide('logo_alignment', e.target.value)}
                      className="flex-1 px-2 py-1 border border-violet-200 rounded focus:ring-1 focus:ring-violet-500 bg-white/70 text-xs"
                    >
                      <option value="top-left">Top L</option>
                      <option value="top-right">Top R</option>
                      <option value="bottom-left">Bot L</option>
                      <option value="bottom-right">Bot R</option>
                      <option value="center">Center</option>
                    </select>
                    
                    <div className="flex items-center space-x-1 min-w-0">
                      <span className="text-xs text-violet-700 whitespace-nowrap">{slides[currentSlide]?.logo_opacity || 100}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={slides[currentSlide]?.logo_opacity || 100}
                        onChange={(e) => updateCurrentSlide('logo_opacity', parseInt(e.target.value))}
                        className="w-16 h-1 bg-violet-200 rounded appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
            </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
} 