'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Head from 'next/head';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CommentsSection from '@/components/comments/CommentsSection';
import KaTeXRenderer from '@/components/KaTeXRenderer';
import React from 'react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
  featured_image?: string;
  category?: string;
  tags?: string[];
  reading_time?: number;
  schema_json?: string;
  meta_title?: string;
  meta_description?: string;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
}

// Define TOC item interface to include parent property
interface TocItem {
  id: string;
  text: string;
  level: number;
  parent?: string;
}

// Create a component to handle code blocks properly
const CodeBlockRenderer = ({ htmlContent }: { htmlContent: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState(htmlContent);
  
  // Process the HTML content before rendering to combine code blocks
  useEffect(() => {
    // Create a function to preprocess the HTML content
    const preprocessHtml = (html: string): string => {
      // Create a DOM parser to work with the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Apply direct heading styles before processing anything else
      const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
      headings.forEach((heading, index) => {
        // Skip empty or auto-generated headings
        const headingText = heading.textContent?.trim();
        if (!headingText || headingText === 'heading-1' || /^heading-\d+$/.test(headingText)) {
          return;
        }
        
        // Add clear ID based on text
        const baseName = headingText.toLowerCase().replace(/[^\w]+/g, '-');
        heading.id = `section-${baseName}`;
        
        // Apply inline styles for spacing
        (heading as HTMLElement).style.marginTop = '1em';
        (heading as HTMLElement).style.marginBottom = '0.5em';
        
        // Add attributes for later TOC detection
        heading.setAttribute('data-toc-level', heading.tagName.charAt(1));
        heading.setAttribute('data-toc-index', index.toString());
      });
      
      // Remove standalone "Code" headings
      const codeHeadings = Array.from(doc.querySelectorAll('p')).filter(p => 
        p.textContent?.trim() === 'Code' && 
        p.nextElementSibling?.tagName === 'PRE'
      );
      codeHeadings.forEach(heading => {
        heading.remove();
      });
      
      // Find all code block containers
      const codeBlockContainers = Array.from(doc.querySelectorAll('.ql-code-block-container'));
      
      // Process each code block container to merge pre elements
      codeBlockContainers.forEach(container => {
        // Get all pre elements in this container
        const preElements = Array.from(container.querySelectorAll('pre.ql-syntax'));
        
        if (preElements.length > 1) {
          // We need to merge multiple pre elements
          
          // Get language from the first pre (use for all)
          const lang = preElements[0].getAttribute('data-language') || 'plain';
          
          // Create a single pre element to replace all existing ones
          const newPre = document.createElement('pre');
          newPre.className = 'syntax-highlighted';
          newPre.setAttribute('data-language', lang);
          
          // Process each pre element and add its content to the new pre
          preElements.forEach((pre, index) => {
            // Get text content from this pre
            const content = pre.textContent?.trim() || '';
            
            // Create a code element for this line
            const codeEl = document.createElement('code');
            codeEl.textContent = content;
            
            // Add to the new pre
            newPre.appendChild(codeEl);
            
            // Add line break between code blocks (except after the last one)
            if (index < preElements.length - 1) {
              newPre.appendChild(document.createElement('br'));
            }
          });
          
          // Keep only the first pre and replace its content
          const firstPre = preElements[0];
          while (firstPre.firstChild) {
            firstPre.removeChild(firstPre.firstChild);
          }
          
          // Move all content from newPre to firstPre
          while (newPre.firstChild) {
            firstPre.appendChild(newPre.firstChild);
          }
          
          // Remove all other pre elements
          for (let i = 1; i < preElements.length; i++) {
            preElements[i].remove();
          }
          
          // Ensure the first pre has the right class and attribute
          firstPre.className = 'syntax-highlighted';
          firstPre.setAttribute('data-language', lang);
        } else if (preElements.length === 1) {
          // Single pre element - just ensure it has proper styling
          const pre = preElements[0] as HTMLElement;
          const lang = pre.getAttribute('data-language') || 'plain';
          
          // Set class and data-language
          pre.className = 'syntax-highlighted';
          pre.setAttribute('data-language', lang);
          
          // Ensure content is wrapped in code element
          if (!pre.querySelector('code')) {
            const content = pre.textContent || '';
            pre.textContent = '';
            
            const codeEl = document.createElement('code');
            codeEl.textContent = content;
            pre.appendChild(codeEl);
          }
        }
      });
      
      // Handle any standalone pre elements not in containers
      const standalonePres = Array.from(doc.querySelectorAll('pre.ql-syntax:not(.ql-code-block-container pre)'));
      standalonePres.forEach(pre => {
        const el = pre as HTMLElement;
        const lang = el.getAttribute('data-language') || 'plain';
        
        // Style the pre element
        el.className = 'syntax-highlighted';
        el.setAttribute('data-language', lang);
        
        // Ensure content is in a code element
        if (!el.querySelector('code')) {
          const content = el.textContent || '';
          el.textContent = '';
          
          const codeEl = document.createElement('code');
          codeEl.textContent = content;
          el.appendChild(codeEl);
        }
      });
      
      return doc.body.innerHTML;
    };
    
    // Process the HTML content
    try {
      if (typeof window !== 'undefined') {
        const processed = preprocessHtml(htmlContent);
        setProcessedContent(processed);
      }
    } catch (err) {
      console.error('Error preprocessing HTML:', err);
      // Fallback to original content
      setProcessedContent(htmlContent);
    }
  }, [htmlContent]);
  
  // After mount, apply syntax highlighting
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Apply syntax highlighting
    import('highlight.js').then(hljs => {
      containerRef.current?.querySelectorAll('pre.syntax-highlighted code').forEach(block => {
        const language = block.parentElement?.getAttribute('data-language') || 'plain';
        if (language !== 'plain') {
          try {
            hljs.default.highlightElement(block as HTMLElement);
          } catch (e) {
            console.warn('Error highlighting code:', e);
          }
        }
      });
    }).catch(err => {
      console.error('Failed to load highlight.js:', err);
    });
  }, [processedContent]);
  
  return (
    <div 
      className="article-content" 
      ref={containerRef} 
      dangerouslySetInnerHTML={{ __html: processedContent }} 
    />
  );
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [expandedHeadings, setExpandedHeadings] = useState<string[]>([]);
  const articleRef = useRef<HTMLDivElement>(null);
  const headingsRef = useRef<{ id: string; top: number; text: string }[]>([]);

  // Use params directly
  const slug = params.slug;

  // Table of contents state
  const [tableOfContents, setTableOfContents] = useState<TocItem[]>([]);
  
  // Create structuredData for the article (for JSON-LD schema)
  const structuredData = useMemo(() => {
    if (!article) return {};
    
    // If there's custom schema JSON, use that
    if (article.schema_json) {
      try {
        return JSON.parse(article.schema_json);
      } catch (e) {
        console.error('Error parsing schema JSON:', e);
      }
    }
    
    // Otherwise build a default schema
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.excerpt,
      image: article.featured_image,
      datePublished: article.created_at,
      dateModified: article.updated_at || article.created_at,
      author: {
        '@type': 'Person',
        name: article.author_name
      },
      publisher: {
        '@type': 'Organization',
        name: 'HackerThink',
        logo: {
          '@type': 'ImageObject',
          url: 'https://ainews.com/images/logo.png'
        }
      }
    };
  }, [article]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/articles');
            return;
          }
          throw new Error('Failed to fetch article');
        }
        
        const data = await response.json();
        setArticle(data.article);
        setRelatedArticles(data.relatedArticles || []);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, router]);

  // Before updating TOC, deduplicate entries by text
  const deduplicateTocItems = (items: TocItem[]): TocItem[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      // Create a key using both text and level
      const key = `${item.level}:${item.text}`;
      
      // Keep only first occurrence
      if (seen.has(key)) {
        return false;
      }
      
      seen.add(key);
      return true;
    });
  };

  // Extract headings for table of contents
  useEffect(() => {
    if (!article || !articleRef.current) return;
    
    // Direct scanning for headings
    const scanHeadings = () => {
      console.log("Scanning for headings in the article");
      
      // First try the article ref
      const articleContainers = articleRef.current.querySelectorAll('.article-content, .prose');
      
      // Log for debugging
      console.log("Article containers found:", articleContainers.length);
      
      if (articleContainers.length > 0) {
        // Collect all headings from all containers
        const headingsList: Element[] = [];
        
        articleContainers.forEach(container => {
          const containerHeadings = container.querySelectorAll('h2, h3, h4');
          console.log(`Found ${containerHeadings.length} headings in container`);
          
          // Add to our collection
          containerHeadings.forEach(heading => headingsList.push(heading));
        });
        
        // If we found direct headings, process them
        if (headingsList.length > 0) {
          console.log("Processing found headings:", headingsList.length);
          
          // Process into TOC items
          const tocItems: TocItem[] = [];
          let lastH2Id = '';
          
          headingsList.forEach((heading, index) => {
            const headingText = heading.textContent?.trim();
            if (!headingText || headingText === 'heading-1' || /^heading-\d+$/.test(headingText)) {
              return;
            }
            
            // Set ID if not present
            if (!heading.id) {
              const cleanText = headingText.toLowerCase().replace(/[^\w]+/g, '-');
              heading.id = `toc-heading-${cleanText}-${index}`;
            }
            
            const tag = heading.tagName.toLowerCase();
            const level = parseInt(tag.charAt(1));
            
            const tocItem: TocItem = {
              id: heading.id,
              text: headingText,
              level
            };
            
            // Handle parent-child relationships
            if (level === 2) {
              lastH2Id = heading.id;
            } else if (level > 2 && lastH2Id) {
              tocItem.parent = lastH2Id;
            }
            
            tocItems.push(tocItem);
            console.log(`Added heading to TOC: ${headingText}`);
            
            // Make heading clickable
            (heading as HTMLElement).style.cursor = 'pointer';
            heading.addEventListener('click', () => {
              window.location.hash = heading.id;
            });
          });
          
          // Update TOC if headings found - apply deduplication
          if (tocItems.length > 0) {
            const uniqueTocItems = deduplicateTocItems(tocItems);
            console.log(`Setting TOC with ${uniqueTocItems.length} unique headings (removed ${tocItems.length - uniqueTocItems.length} duplicates)`);
            setTableOfContents(uniqueTocItems);
          }
        }
      }
    };
    
    // Wait for content to render
    const timer = setTimeout(scanHeadings, 2000);
    return () => clearTimeout(timer);
  }, [article]);
  
  // Fallback method: scan entire document if TOC is still empty
  useEffect(() => {
    if (!article) return;
    
    if (tableOfContents.length === 0) {
      const timer = setTimeout(() => {
        console.log("FALLBACK: Scanning entire document for headings");
        
        // Get all headings directly from document
        const documentHeadings = document.querySelectorAll('h2, h3, h4');
        console.log("Document headings:", documentHeadings.length);
        
        if (documentHeadings.length > 0) {
          const tocItems: TocItem[] = [];
          let lastH2Id = '';
          
          documentHeadings.forEach((heading, index) => {
            // Get text content
            const text = heading.textContent?.trim();
            if (!text) return;
            
            // Skip TOC components
            if (heading.closest('.toc-scrollbar') || heading.closest('.bg-gray-50')) {
              return;
            }
            
            // Ensure ID
            if (!heading.id) {
              heading.id = `doc-heading-${index}`;
            }
            
            // Get level
            const level = parseInt(heading.tagName.charAt(1));
            
            // Create TOC item
            const item: TocItem = {
              id: heading.id,
              text,
              level
            };
            
            // Handle parent-child relationships  
            if (level === 2) {
              lastH2Id = heading.id;
            } else if (level > 2 && lastH2Id) {
              item.parent = lastH2Id;
            }
            
            tocItems.push(item);
            console.log(`FALLBACK: Found heading "${text}"`);
          });
          
          // Update TOC if we found headings - apply deduplication
          if (tocItems.length > 0) {
            const uniqueTocItems = deduplicateTocItems(tocItems);
            console.log(`FALLBACK: Setting TOC with ${uniqueTocItems.length} unique headings (removed ${tocItems.length - uniqueTocItems.length} duplicates)`);
            setTableOfContents(uniqueTocItems);
          }
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [article, tableOfContents]);

  // Update the article content processing
  useEffect(() => {
    // Listen for TOC updates from the CodeBlockRenderer
    const handleTocUpdate = (event: any) => {
      console.log("TOC update event received:", event.detail);
      const { tocItems } = event.detail;
      
      // Force display in console to debug
      console.log("TOC Items detected:", tocItems);
      
      // Make sure we're setting the TOC state
      setTableOfContents(tocItems);
      
      // Initialize with all accordions closed
      setExpandedHeadings([]);
    };
    
    if (articleRef.current) {
      console.log("Adding TOC update listener");
      articleRef.current.addEventListener('tocupdate', handleTocUpdate);
    }
    
    return () => {
      if (articleRef.current) {
        articleRef.current.removeEventListener('tocupdate', handleTocUpdate);
      }
    };
  }, [article]);

  // Add a log for debugging TOC
  useEffect(() => {
    console.log("Current table of contents:", tableOfContents);
  }, [tableOfContents]);

  // Toggle function for expanding/collapsing headings
  const toggleHeadingExpansion = (headingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setExpandedHeadings(prevExpanded => {
      // If already expanded, close it
      if (prevExpanded.includes(headingId)) {
        return prevExpanded.filter(id => id !== headingId);
      }
      // Otherwise, close all others and open only this one
      return [headingId];
    });
  };

  // Update scroll behavior with a more reliable approach
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element with ID ${id} not found`);
      return;
    }
    
    console.log(`Scrolling to element with ID: ${id}`);
    
    // Handle parent/child relationships
    const headingItem = tableOfContents.find(item => item.id === id);
    if (headingItem?.parent) {
      setExpandedHeadings([headingItem.parent]);
    } else if (headingItem?.level === 2) {
      setExpandedHeadings([id]);
    }
    
    // Update active section immediately
    setActiveSection(id);
    
    // Get the position of the element
    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + window.pageYOffset;
    
    // Scroll with offset to account for fixed header
    window.scrollTo({
      top: absoluteTop - 100, // 100px offset for the header
      behavior: 'smooth'
    });
    
    // Add highlight effect
    setTimeout(() => {
      element.classList.add('highlight-heading');
      setTimeout(() => {
        element.classList.remove('highlight-heading');
      }, 1500);
    }, 300);
  };

  // Add state for scroll lock
  const [scrollingInProgress, setScrollingInProgress] = useState(false);

  // Update the scroll tracking useEffect to only expand currently visible section
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current || tableOfContents.length === 0) return;
      
      // Calculate progress for progress bar
      const { top, height } = articleRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      const scrollProgress = Math.min(100, Math.max(0, scrollPercent * 100));
      
      setProgress(scrollProgress);
      
      // Get all heading elements and their positions
      const headingElements = tableOfContents.map(toc => {
        const element = document.getElementById(toc.id);
        return {
          id: toc.id,
          level: toc.level,
          parent: toc.parent,
          // Get position relative to the viewport
          top: element?.getBoundingClientRect().top || 0
        };
      });
      
      // Find the first heading that's either at the top or not yet scrolled past
      // We use a small offset to highlight the heading slightly before it reaches the top
      const offset = 100; // pixels from top
      
      // Filter headings that are above the offset point
      const headingsAboveOffset = headingElements.filter(h => h.top <= offset);
      
      if (headingsAboveOffset.length > 0) {
        // Get the last heading that's above the offset (the one closest to the top)
        const currentHeading = headingsAboveOffset[headingsAboveOffset.length - 1];
        
        if (currentHeading && currentHeading.id !== activeSection) {
          setActiveSection(currentHeading.id);
          
          // If the current heading is an H3/H4, only expand its parent H2
          if (currentHeading.level > 2 && currentHeading.parent) {
            setExpandedHeadings([currentHeading.parent as string]);
          } 
          // If it's an H2, only expand this one
          else if (currentHeading.level === 2) {
            setExpandedHeadings([currentHeading.id]);
          }
        }
      } else if (headingElements.length > 0 && scrollTop === 0) {
        // If we're at the top of the page, set the first heading as active
        setActiveSection(headingElements[0].id);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Call once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents, activeSection]);

  // Handle social sharing
  const handleShare = (platform: string) => {
    if (!article) return;
    
    const url = window.location.href;
    const title = article.title;
    const text = article.excerpt;
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard!');
        });
        break;
    }
  };

  // After article is loaded
  useEffect(() => {
    if (article) {
      // Update document title dynamically
      const title = article.meta_title || article.title;
      document.title = `${title} | HackerThink`;
      
      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', article.meta_description || article.excerpt);
      
      // Add JSON-LD schema
      let schemaScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement | null;
      if (!schemaScript) {
        schemaScript = document.createElement('script') as HTMLScriptElement;
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      
      // Use the article's schema_json if available, otherwise use structured data
      if (article.schema_json) {
        try {
          // Make sure it's valid JSON
          JSON.parse(article.schema_json);
          (schemaScript as HTMLScriptElement).textContent = article.schema_json;
        } catch (error) {
          console.error('Invalid schema JSON, using default instead:', error);
          (schemaScript as HTMLScriptElement).textContent = JSON.stringify(structuredData);
        }
      } else {
        (schemaScript as HTMLScriptElement).textContent = JSON.stringify(structuredData);
      }
      
      // Add OpenGraph meta tags
      const metaTags = {
        'og:title': title,
        'og:description': article.meta_description || article.excerpt,
        'og:type': 'article',
        'og:url': typeof window !== 'undefined' ? window.location.href : `https://ainews.com/articles/${article.slug}`,
        'og:image': article.featured_image || '',
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': article.meta_description || article.excerpt
      };
      
      // Set meta tags
      Object.entries(metaTags).forEach(([name, content]) => {
        if (!content) return; // Skip empty values
        
        let meta = document.querySelector(`meta[property="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
    }
    
    return () => {
      // Reset title when unmounting
      document.title = 'HackerThink';
      
      // Remove schema script
      const schemaScript = document.querySelector('script[type="application/ld+json"]');
      if (schemaScript) {
        schemaScript.remove();
      }
      
      // Remove OpenGraph tags
      ['og:title', 'og:description', 'og:type', 'og:url', 'og:image', 
       'twitter:card', 'twitter:title', 'twitter:description'].forEach(name => {
        const meta = document.querySelector(`meta[property="${name}"]`);
        if (meta) meta.remove();
      });
    };
  }, [article, structuredData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || "Article not found"}
          </h2>
          <p className="text-gray-600 mb-4">
            The article you're looking for might have been removed or is temporarily unavailable.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const publishedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const updatedDate = article.updated_at ? new Date(article.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : null;

  return (
    <>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-indigo-600 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white min-h-screen">
        {/* Featured Image & Header */}
        <div className="relative overflow-hidden">
          {article.featured_image ? (
            <div className="absolute inset-0 h-full w-full">
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${article.featured_image})`,
                  filter: 'blur(5px)',
                  transform: 'scale(1.1)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/90 to-black/90 mix-blend-multiply" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-purple-900" />
          )}

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <nav className="mb-6 text-sm font-medium" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-indigo-100">
                  <li>
                    <Link href="/" className="hover:text-white">Home</Link>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-4 w-4 shrink-0 text-indigo-300" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
                    </svg>
                    <Link href="/articles" className="ml-2 hover:text-white">Articles</Link>
                  </li>
                  {article.category && (
                    <li className="flex items-center">
                      <svg className="h-4 w-4 shrink-0 text-indigo-300" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z" />
                      </svg>
                      <Link href={`/articles/category/${article.category ? article.category.toLowerCase().replace(/\s+/g, '-') : ''}`} className="ml-2 hover:text-white">{article.category}</Link>
                    </li>
                  )}
                </ol>
              </nav>

              {/* Category Badge */}
              {article.category && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {article.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                {article.title}
              </h1>

              {/* Excerpt/Description */}
              {article.excerpt && (
                <p className="text-xl text-indigo-100 font-light mb-6 max-w-3xl">
                  {article.excerpt}
                </p>
              )}

              {/* Author & Publication Info - Enhanced */}
              <div className="mb-8 mt-8 flex items-center gap-5 py-4 px-6 rounded-xl bg-indigo-800/50 backdrop-blur-sm">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                    {article.author_name?.charAt(0) || 'A'}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <p className="text-white font-medium">{article.author_name}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-indigo-200">
                        <svg className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Published: {publishedDate}
                      </span>
                      {updatedDate && updatedDate !== publishedDate && (
                        <span className="text-indigo-200">
                          <svg className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Updated: {updatedDate}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {article.reading_time && (
                    <div className="text-indigo-200 text-sm mt-1">
                      <svg className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {article.reading_time} min read
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Floating share button */}
            <div className="fixed left-4 bottom-10 z-30 lg:static lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <motion.div 
                  className="flex flex-col items-center space-y-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div 
                    className="relative bg-white rounded-full shadow-md p-3 cursor-pointer"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                  >
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  
                  <motion.div 
                    className={`space-y-3 ${showShareOptions ? 'block' : 'hidden'} lg:block`}
                    animate={showShareOptions ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    initial={{ opacity: 0, y: 10 }}
                  >
                    <div 
                      className="bg-white rounded-full shadow-md p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleShare('twitter')}
                    >
                      <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    </div>
                    
                    <div 
                      className="bg-white rounded-full shadow-md p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleShare('facebook')}
                    >
                      <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div 
                      className="bg-white rounded-full shadow-md p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                      onClick={() => handleShare('linkedin')}
                    >
                      <svg className="h-6 w-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div 
                      className="bg-white rounded-full shadow-md p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleShare('copy')}
                    >
                      <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Article Content */}
            <motion.div 
              className="lg:col-span-8 xl:col-span-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              ref={articleRef}
            >
              <article className="prose prose-lg lg:prose-xl prose-indigo mx-auto prose-table-override">
                {/* Use the custom code block renderer */}
                {article.content && <CodeBlockRenderer htmlContent={article.content} />}
                
                {/* Keep the KaTeX renderer for formula processing */}
                {article.content?.includes('math-tex') && (
                  <KaTeXRenderer />
                )}
              </article>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, idx) => (
                      <Link 
                        key={idx} 
                        href={`/articles/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Card - Mobile */}
              <div className="mt-12 pt-6 border-t border-gray-200 lg:hidden">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        {article.author_name?.charAt(0) || 'A'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">About the author</h3>
                      <p className="text-indigo-600">{article.author_name}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">
                    IT professional and expert in the field, sharing valuable insights and knowledge about Linux and open-source technologies.
                  </p>
                  <div className="flex justify-end">
                    <Link 
                      href={`/authors/${article.author_name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View all articles →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Related Articles - Main Section */}
              {relatedArticles.length > 0 && (
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedArticles.slice(0, 6).map((relatedArticle) => (
                      <div key={relatedArticle.id} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                        <Link href={`/articles/${relatedArticle.slug}`} className="block">
                          {relatedArticle.featured_image ? (
                            <div className="aspect-video overflow-hidden">
                              <img 
                                src={relatedArticle.featured_image} 
                                alt={relatedArticle.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ) : (
                            <div className="aspect-video bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                          )}
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                              {relatedArticle.title}
                            </h3>
                            {relatedArticle.excerpt && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {relatedArticle.excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-center">
                    <Link 
                      href="/articles" 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      View All Articles
                      <svg className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-12 pt-6 border-t border-gray-200">
                <CommentsSection contentId={article.id} contentType="article" />
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              className="lg:col-span-3 xl:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="lg:sticky lg:top-24 space-y-8">
                {/* Table of Contents */}
                {tableOfContents.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Table of Contents</h3>
                    <nav className="max-h-[60vh] overflow-y-auto pr-2 toc-scrollbar">
                      <ul className="space-y-1">
                        {tableOfContents
                          .filter(item => item.level === 2)
                          .map((h2Item) => (
                            <li key={h2Item.id} className={`toc-item transition-all duration-200 rounded-md ${activeSection === h2Item.id ? 'bg-indigo-50' : ''}`}>
                              <div className="flex items-center py-1 px-2">
                                {/* Only show toggle icon if this heading has children */}
                                {tableOfContents.some(item => item.level > 2 && item.parent === h2Item.id) ? (
                                  <button 
                                    onClick={(e) => toggleHeadingExpansion(h2Item.id, e)}
                                    className="mr-2 p-1 rounded-md hover:bg-gray-200 focus:outline-none"
                                    aria-label={expandedHeadings.includes(h2Item.id) ? 'Collapse section' : 'Expand section'}
                                  >
                                    <svg 
                                      className={`h-3 w-3 transition-transform duration-200 ${expandedHeadings.includes(h2Item.id) ? 'transform rotate-90' : ''}`} 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                ) : (
                                  <div className="w-7"></div> /* Spacer to maintain alignment */
                                )}
                                <a 
                                  href={`#${h2Item.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    scrollToHeading(h2Item.id);
                                  }}
                                  className={`text-sm hover:text-indigo-700 transition-colors block truncate flex-grow font-medium ${
                                    activeSection === h2Item.id ? 'text-indigo-700' : 'text-gray-600'
                                  }`}
                                >
                                  {h2Item.text}
                                </a>
                              </div>
                              
                              {/* Show child items when expanded */}
                              {expandedHeadings.includes(h2Item.id) && (
                                <ul className="ml-6 space-y-0.5 border-l-2 border-gray-200 pl-2">
                                  {tableOfContents
                                    .filter(item => item.level > 2 && item.parent === h2Item.id)
                                    .map(childItem => (
                                      <li 
                                        key={childItem.id} 
                                        className={`toc-sub-item transition-all duration-200 ${
                                          activeSection === childItem.id ? 'bg-indigo-50 rounded-md' : ''
                                        }`}
                                      >
                                        <a 
                                          href={`#${childItem.id}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            scrollToHeading(childItem.id);
                                          }}
                                          className={`text-sm hover:text-indigo-700 transition-colors block truncate py-1 px-2 ${
                                            activeSection === childItem.id 
                                              ? 'text-indigo-700 font-medium' 
                                              : 'text-gray-500'
                                          }`}
                                        >
                                          {childItem.text}
                                        </a>
                                      </li>
                                    ))}
                                </ul>
                              )}
                            </li>
                          ))}
                      </ul>
                    </nav>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Table of Contents</h3>
                    <p className="text-sm text-gray-500">No headings found in the article.</p>
                  </div>
                )}

                {/* Related Articles Section */}
                {relatedArticles.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      {relatedArticles.map((relatedArticle) => (
                        <div key={relatedArticle.id} className="group">
                          <Link href={`/articles/${relatedArticle.slug}`} className="block">
                            {relatedArticle.featured_image && (
                              <div className="mb-2 aspect-video overflow-hidden rounded-md">
                                <img 
                                  src={relatedArticle.featured_image} 
                                  alt={relatedArticle.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              </div>
                            )}
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {relatedArticle.title}
                            </h4>
                            {relatedArticle.excerpt && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {relatedArticle.excerpt}
                              </p>
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <Link 
                        href="/articles" 
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                      >
                        View all articles
                        <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Subscription Section */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-6 text-white shadow-md">
                  <h3 className="text-lg font-bold mb-3">Stay Updated</h3>
                  <p className="text-indigo-100 text-sm mb-4">
                    Subscribe to our newsletter for the latest Linux tutorials, tips, and resources.
                  </p>
                  <form className="space-y-3">
                    <div>
                      <input 
                        type="email"
                        placeholder="Your email address"
                        className="w-full px-3 py-2 text-sm text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full px-3 py-2 text-sm font-medium text-indigo-700 bg-white rounded-md hover:bg-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      Subscribe
                    </button>
                  </form>
                  <p className="mt-3 text-xs text-indigo-200">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </div>

                {/* Add relevant sidebar components */}
                {/* (You can add the rest of the sidebar components as needed) */}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Full Width Subscription Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-700 to-purple-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="text-3xl font-bold text-white mb-4">Stay Updated with HackerThink</h2>
                <p className="text-indigo-100 text-lg mb-4 max-w-2xl">
                  Subscribe to our newsletter for the latest Linux tutorials, tips, command guides, and resources. 
                  Join our community of Linux enthusiasts and IT professionals.
                </p>
                <div className="flex flex-wrap gap-4 text-indigo-200">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Weekly newsletter</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Exclusive content</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>No spam</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 max-w-md w-full">
                <form className="bg-white rounded-lg shadow-xl p-6">
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="linux_updates" 
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Linux tutorials and updates
                      </span>
                    </label>
                  </div>
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        name="command_updates" 
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        Command guides and tips
                      </span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Subscribe to Newsletter
                  </button>
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Update the CSS styles
const codeBlockStyles = `
  /* Base code block styling */
  .article-content pre.ql-syntax,
  .article-content pre.syntax-highlighted {
    background-color: #1e1e2e !important;
    color: #f8f8f8 !important;
    overflow: auto !important;
    padding: 1em !important;
    border-radius: 6px !important;
    margin: 1.5em 0 !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace !important;
    font-size: 0.9em !important;
    line-height: 1.6 !important;
    white-space: pre !important;
    word-spacing: normal !important;
    word-break: normal !important;
    word-wrap: normal !important;
    tab-size: 4 !important;
    -webkit-hyphens: none !important;
    -moz-hyphens: none !important;
    -ms-hyphens: none !important;
    hyphens: none !important;
  }
  
  /* Much more aggressive heading spacing control */
  .article-content h2 {
    margin-top: 1em !important;
    margin-bottom: 0.5em !important;
    padding-top: 0.5em !important;
    line-height: 1.3 !important;
  }
  
  .article-content h3,
  .article-content h4 {
    margin-top: 0.75em !important;
    margin-bottom: 0.5em !important;
    padding-top: 0 !important;
    line-height: 1.3 !important;
  }
  
  /* Special case for consecutive headings - make them very tight */
  .article-content h2 + h3,
  .article-content h3 + h4 {
    margin-top: 0.5em !important;
    padding-top: 0 !important;
  }
  
  /* Code block styling */
  .article-content pre.syntax-highlighted {
    margin: 1.5em 0 !important;
    border-radius: 6px !important;
    overflow: auto !important;
    border: 1px solid #383854 !important;
    background-color: #1e1e2e !important;
  }
  
  /* Style code elements inside pre blocks */
  .article-content pre.syntax-highlighted code {
    display: block !important;
    padding: 1em !important;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace !important;
  }
  
  /* Table of Contents Styles */
  .toc-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  
  .toc-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .toc-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
  }
  
  .toc-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a1a1aa;
  }
  
  /* Heading Highlight Effect */
  @keyframes heading-highlight {
    0% { background-color: rgba(99, 102, 241, 0.2); }
    100% { background-color: rgba(99, 102, 241, 0); }
  }
  
  .highlight-heading {
    animation: heading-highlight 1.5s ease-out;
    border-radius: 4px;
  }
  
  /* TOC item hover effect */
  .toc-item:hover {
    background-color: rgba(243, 244, 246, 0.8);
    border-radius: 4px;
  }
  
  .toc-sub-item:hover {
    background-color: rgba(243, 244, 246, 0.5);
    border-radius: 4px;
  }
`; 