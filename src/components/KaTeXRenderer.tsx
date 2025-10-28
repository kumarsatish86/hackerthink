'use client';

import { useEffect } from 'react';
import katex from 'katex';

interface KaTeXRendererProps {
  content?: string;
}

export const KaTeXRenderer: React.FC<KaTeXRendererProps> = ({ content }) => {
  useEffect(() => {
    // Find all math-tex elements and render them with KaTeX
    const elements = document.querySelectorAll('.math-tex');
    elements.forEach(element => {
      const texExpression = element.textContent || '';
      
      try {
        // Extract LaTeX expression from \( \) delimiters
        const texMatch = texExpression.match(/\\\((.*?)\\\)/);
        if (texMatch && texMatch[1]) {
          katex.render(texMatch[1], element as HTMLElement, {
            throwOnError: false,
            displayMode: false
          });
        }
        
        // Handle display math with \[ \] delimiters
        const displayTexMatch = texExpression.match(/\\\[(.*?)\\\]/);
        if (displayTexMatch && displayTexMatch[1]) {
          katex.render(displayTexMatch[1], element as HTMLElement, {
            throwOnError: false,
            displayMode: true
          });
        }
      } catch (error) {
        console.error('Error rendering KaTeX:', error);
      }
    });
  }, [content]);

  // Return null instead of duplicating content
  return null;
};

export default KaTeXRenderer; 