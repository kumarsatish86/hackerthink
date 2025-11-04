'use client';

import React, { useState } from 'react';
import { FaBrain, FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export default function ModelCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save category
    if (editingCategory) {
      // Update existing
      const updated = categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c);
      setCategories(updated);
    } else {
      // Add new
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        count: 0
      };
      setCategories([...categories, newCategory]);
    }
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/models" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <FaArrowLeft className="mr-2" /> Back to Models
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FaBrain className="text-red-600" />
          Model Categories
        </h1>
        <p className="text-gray-600 mt-2">Manage categories for AI models</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Categories</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No categories yet. Add your first category to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.slug}</p>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Used in {category.count} model(s)
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setFormData({
                        name: category.name,
                        slug: category.slug,
                        description: category.description || ''
                      });
                      setShowAddModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', slug: '', description: '' });
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

