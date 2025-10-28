'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategorySelectProps {
  value: string;
  onChange: (category: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  placeholder = 'Select a category',
  className = '',
  required = false
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/admin/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    
    if (selectedValue === 'create-new') {
      setIsCreating(true);
    } else {
      onChange(selectedValue);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCreateError('Category name is required');
      return;
    }

    try {
      setIsLoading(true);
      setCreateError(null);
      
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create category');
      }
      
      const data = await response.json();
      
      // Refresh categories list
      await fetchCategories();
      
      // Close create form and select the new category
      setIsCreating(false);
      setNewCategoryName('');
      onChange(data.category.name);
    } catch (err) {
      console.error('Error creating category:', err);
      setCreateError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewCategoryName('');
    setCreateError(null);
  };

  if (isCreating) {
    return (
      <div className="mt-1">
        <div className="flex">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter new category name"
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleCreateCategory}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Create'}
          </button>
        </div>
        {createError && (
          <p className="mt-1 text-sm text-red-600">{createError}</p>
        )}
        <div className="mt-2">
          <button
            type="button"
            onClick={cancelCreate}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <select
        value={value}
        onChange={handleSelectChange}
        className={`mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${className}`}
        disabled={isLoading}
        required={required}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>
            {category.name}
          </option>
        ))}
        <option value="General">General</option>
        <option value="create-new">+ Create new category</option>
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CategorySelect; 