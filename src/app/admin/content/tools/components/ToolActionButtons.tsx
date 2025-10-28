'use client';

import React from 'react';
import Link from 'next/link';
import { FaEdit, FaEye } from 'react-icons/fa';

interface ToolActionButtonsProps {
  id: number;
  slug: string;
}

export default function ToolActionButtons({ id, slug }: ToolActionButtonsProps) {
  const confirmDelete = () => {
    return confirm('Are you sure you want to delete this tool? This action cannot be undone.');
  };
  
  return (
    <div className="space-x-2 flex flex-wrap">
      {/* Edit Button */}
      <Link 
        href={`/admin/content/tools/${id}`}
        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
        title="Edit Tool"
      >
        <FaEdit className="w-4 h-4" />
      </Link>
      
      {/* Preview Button */}
      <Link
        href={`/tools/${slug}`}
        target="_blank"
        className="inline-flex items-center justify-center w-8 h-8 text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors duration-200"
        title="Preview Tool"
      >
        <FaEye className="w-4 h-4" />
      </Link>
    </div>
  );
} 