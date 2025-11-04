'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShare, FaBookmark, FaClock, FaUser, FaCalendar } from 'react-icons/fa';

interface StorySlide {
  id: string;
  content: string;
  background_type: string;
  background_value: string;
  text_color: string;
  layout: string;
  animation: string;
  duration: number;
  font_size: number;
  footer_text: string;
  footer_url: string;
  logo_url: string;
  logo_position: string;
  logo_opacity: number;
  gradient_type?: string;
  gradient_color2?: string;
}

interface WebStory {
  id: string;
  title: string;
  slug: string;
  cover_image: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  creation_method: string;
}

export default function StoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [story, setStory] = useState<WebStory | null>(null);
  const [slides, setSlides] = useState<StorySlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stories/${slug}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStory(data.story);
            
            // Parse the content as JSON array of slides
            try {
              const parsedSlides = JSON.parse(data.story.content);
              setSlides(parsedSlides);
            } catch (parseError) {
              console.error('Error parsing story content:', parseError);
              setError('Invalid story format');
            }
          } else {
            setError(data.message || 'Story not found');
          }
        } else if (response.status === 404) {
          setError('Story not found');
        } else {
          setError('Failed to load story. Please try again later.');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load story. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStory();
    }
  }, [slug]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && slides.length > 0) {
      const timer = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, slides[currentSlide]?.duration * 1000 || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentSlide, slides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, slides.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Story Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The requested story could not be found.'}</p>
          <Link 
            href="/stories" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            View All Stories
          </Link>
        </div>
      </div>
    );
  }

  // Function to create a perfect gradient by mixing story color with black and white
  const createDesktopBackground = () => {
    if (slides.length === 0 || !slides[currentSlide]) {
      return 'linear-gradient(135deg, #1e293b, #334155, #0f172a)';
    }

    const currentSlideData = slides[currentSlide];
    let baseColor = currentSlideData.background_value;
    
    // If it's a gradient, use the first color
    if (currentSlideData.background_type === 'gradient') {
      baseColor = currentSlideData.background_value;
    }

    // Extract RGB values from hex color
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(baseColor);
    if (!rgb) return 'linear-gradient(135deg, #1e293b, #334155, #0f172a)';

    // Create variations by mixing with black and white
    const darkColor = `rgb(${Math.floor(rgb.r * 0.3)}, ${Math.floor(rgb.g * 0.3)}, ${Math.floor(rgb.b * 0.3)})`;
    const midColor = `rgb(${Math.floor(rgb.r * 0.7)}, ${Math.floor(rgb.g * 0.7)}, ${Math.floor(rgb.b * 0.7)})`;
    const lightColor = `rgb(${Math.floor(rgb.r * 0.9 + 255 * 0.1)}, ${Math.floor(rgb.g * 0.9 + 255 * 0.1)}, ${Math.floor(rgb.b * 0.9 + 255 * 0.1)})`;

    return `linear-gradient(135deg, ${darkColor}, ${midColor}, ${lightColor})`;
  };

  return (
    <div 
      className="min-h-screen transition-all duration-1000 relative overflow-hidden"
      style={{
        background: createDesktopBackground()
      }}
    >
      {/* Minimal Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="flex items-center justify-between">
          <Link 
            href="/stories"
            className="flex items-center text-white/80 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            <FaArrowLeft className="mr-2" />
            Back to Stories
          </Link>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-all ${
                isBookmarked 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-black/30 text-white/80 hover:text-white'
              }`}
            >
              <FaBookmark className={isBookmarked ? 'fill-current' : ''} />
            </button>
            <button className="p-2 rounded-full bg-black/30 text-white/80 hover:text-white transition-all">
              <FaShare />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Story Viewer */}
      <div className="relative h-screen flex items-center justify-center">
                 {/* Story Container */}
         <div className="relative w-full max-w-md h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl">
          {slides.length > 0 && (
            <>
              {/* Current Slide */}
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center p-8"
                style={{
                  background: slides[currentSlide].background_type === 'gradient' 
                    ? `linear-gradient(135deg, ${slides[currentSlide].background_value}, ${slides[currentSlide].gradient_color2 || '#000000'})`
                    : slides[currentSlide].background_value,
                  color: slides[currentSlide].text_color,
                  fontSize: `${slides[currentSlide].font_size}px`,
                  textAlign: slides[currentSlide].layout as any
                }}
              >
                <div className="text-center">
                  <div 
                    className="leading-relaxed"
                    style={{ fontSize: `${slides[currentSlide].font_size}px` }}
                    dangerouslySetInnerHTML={{ __html: slides[currentSlide].content }}
                  />
                  
                  {/* Footer */}
                  {slides[currentSlide].footer_text && (
                    <div className="mt-8 text-sm opacity-80">
                      {slides[currentSlide].footer_url ? (
                        <a 
                          href={slides[currentSlide].footer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          {slides[currentSlide].footer_text}
                        </a>
                      ) : (
                        slides[currentSlide].footer_text
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Progress Bar */}
              <div className="absolute top-16 left-4 right-4 flex gap-1">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white' 
                        : index < currentSlide 
                          ? 'bg-white/60' 
                          : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Controls - Invisible click areas like Times of India */}
              <div className="absolute inset-0 flex items-center justify-between">
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                  className="w-1/3 h-full bg-transparent"
                  title="Previous slide"
                />
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                  className="w-1/3 h-full bg-transparent"
                  title="Next slide"
                />
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="text-white text-sm bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                  {currentSlide + 1} / {slides.length}
                </div>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Minimal Footer Info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="text-center text-white/60 text-xs bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
          <div className="flex items-center justify-center gap-4">
            <span>HackerThink</span>
            <span>•</span>
            <span>{new Date(story.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}