'use client';

import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/forum/categories');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch categories' }));
        console.error('Error fetching categories:', errorData);
        // If tables don't exist, categories will be empty array, which is fine
        setCategories([]);
      } else {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/forum/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Categories</h2>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No categories found.</p>
          <p className="text-sm mt-2">
            If you haven't run migrations yet, click "Run Database Migrations" above.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-semibold">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setEditingCategory(category);
                  setShowForm(true);
                }}
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

