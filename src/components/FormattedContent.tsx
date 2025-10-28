'use client';

import React, { useEffect, useRef } from 'react';
import styles from '../styles/commands.module.css';

interface FormattedContentProps {
  html: string;
  className?: string;
}

const FormattedContent: React.FC<FormattedContentProps> = ({ html, className = '' }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Find all code tags and replace them with styled spans
    const codeTags = contentRef.current.querySelectorAll('code');
    codeTags.forEach(codeTag => {
      const span = document.createElement('span');
      span.className = styles.codeInline;
      span.textContent = codeTag.textContent;
      if (codeTag.parentNode) {
        codeTag.parentNode.replaceChild(span, codeTag);
      }
    });
    
    // Look for raw code tags in text nodes
    const processTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (text && (text.includes('<code>') || text.includes('</code>'))) {
          const span = document.createElement('span');
          const cleanedText = text.replace(/<\/?code>/g, '');
          span.className = styles.codeInline;
          span.textContent = cleanedText;
          if (node.parentNode) {
            node.parentNode.replaceChild(span, node);
          }
        }
      } else {
        node.childNodes.forEach(processTextNodes);
      }
    };
    
    processTextNodes(contentRef.current);
    
    // Add hover effects to example wrappers
    const exampleWrappers = contentRef.current.querySelectorAll(`.${styles.exampleWrapper}`);
    exampleWrappers.forEach(wrapper => {
      wrapper.addEventListener('mouseenter', () => {
        const actions = wrapper.querySelector(`.${styles.codeBlockActions}`);
        if (actions) {
          (actions as HTMLElement).style.opacity = '1';
        }
      });
      
      wrapper.addEventListener('mouseleave', () => {
        const actions = wrapper.querySelector(`.${styles.codeBlockActions}`);
        if (actions) {
          (actions as HTMLElement).style.opacity = '0';
        }
      });
    });
    
    // Handle copy button clicks
    const copyButtons = contentRef.current.querySelectorAll(`.${styles.copyButton}`);
    copyButtons.forEach(button => {
      button.addEventListener('click', function(this: HTMLElement) {
        const command = this.getAttribute('data-command');
        if (command) {
          navigator.clipboard.writeText(command)
            .then(() => {
              const originalHTML = this.innerHTML;
              this.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
              setTimeout(() => {
                this.innerHTML = originalHTML;
              }, 2000);
            })
            .catch(err => {
              console.error('Failed to copy text: ', err);
            });
        }
      });
    });
    
  }, [html]);
  
  if (!html) return null;
  
  return (
    <div 
      ref={contentRef} 
      className={`command-content w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default FormattedContent; 