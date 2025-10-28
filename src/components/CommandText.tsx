'use client';

import React from 'react';
import styles from '../styles/commands.module.css';

interface CommandTextProps {
  text: string;
  className?: string;
}

const CommandText: React.FC<CommandTextProps> = ({ text, className = '' }) => {
  if (!text) return null;
  
  // Replace <code> tags with styled spans using CSS module
  const formattedText = text.replace(
    /<code>(.*?)<\/code>/g, 
    `<span class="${styles.codeInline}">$1</span>`
  );
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: formattedText }} 
    />
  );
};

export default CommandText; 