'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Interfaces
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  content_type: 'articles' | 'courses' | 'lab_exercises' | 'scripts' | 'tools' | 'glossary' | 'web_stories' | 'roadmaps' | 'commands' | 'tutorials';
  item_count: number;
  created_at: string;
  updated_at: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  content_type: 'articles' | 'courses' | 'lab_exercises' | 'scripts' | 'tools' | 'glossary' | 'web_stories' | 'roadmaps' | 'commands' | 'tutorials';
  item_count: number;
  created_at: string;
  updated_at: string;
}

interface TaxonomyStats {
  total_categories: number;
  total_tags: number;
  categories_by_type: { [key: string]: number };
  tags_by_type: { [key: string]: number };
}

export default function TaxonomyManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [selectedContentType, setSelectedContentType] = useState<string>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [stats, setStats] = useState<TaxonomyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Tag | null>(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string; type: 'category' | 'tag' } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form state for new category
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    content_type: ''
  });
  
  // Form state for new tag
  const [newTag, setNewTag] = useState({
    name: '',
    slug: '',
    content_type: ''
  });

  // Content type options
  const contentTypes = [
    { value: 'all', label: 'All Content Types' },
    { value: 'articles', label: 'Articles' },
    { value: 'courses', label: 'Courses' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'lab_exercises', label: 'Lab Exercises' },
    { value: 'scripts', label: 'Scripts' },
    { value: 'tools', label: 'Tools' },
    { value: 'glossary', label: 'Glossary' },
    { value: 'web_stories', label: 'Web Stories' },
    { value: 'roadmaps', label: 'Learning Roadmaps' },
    { value: 'commands', label: 'Commands' }
  ];

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Fetch data
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchTaxonomyData();
    }
  }, [status, session, activeTab, selectedContentType]);

  const fetchTaxonomyData = async () => {
    try {
      setLoading(true);
      
      // Fetch based on active tab
      const endpoint = activeTab === 'categories' ? '/api/admin/taxonomy/categories' : '/api/admin/taxonomy/tags';
      const params = new URLSearchParams();
      if (selectedContentType !== 'all') {
        params.append('content_type', selectedContentType);
      }
      
      const response = await fetch(`${endpoint}?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'categories') {
          setCategories(data.categories || []);
        } else {
          setTags(data.tags || []);
        }
      }
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/taxonomy/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching taxonomy data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (activeTab === 'categories') {
      if (selectedItems.size === filteredCategories.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredCategories.map(cat => cat.id)));
      }
    } else {
      if (selectedItems.size === filteredTags.length) {
        setSelectedItems(new Set());
      } else {
        setSelectedItems(new Set(filteredTags.map(tag => tag.id)));
      }
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.size === 0) return;
    
    try {
      const endpoint = `/api/admin/taxonomy/${activeTab}/bulk`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          ids: Array.from(selectedItems)
        })
      });
      
      if (response.ok) {
        setSelectedItems(new Set());
        setBulkAction('');
        fetchTaxonomyData();
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getContentTypeLabel = (type: string) => {
    const contentType = contentTypes.find(ct => ct.value === type);
    return contentType?.label || type;
  };

  // Handle category creation
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/admin/taxonomy/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (response.ok) {
        const result = await response.json();
        // Reset form and close modal
        setNewCategory({ name: '', slug: '', description: '', content_type: '' });
        setShowCreateModal(false);
        // Refresh data
        fetchTaxonomyData();
      } else {
        const errorData = await response.json();
        setCreateError(errorData.error || 'Failed to create category');
      }
    } catch (error) {
      setCreateError('Error creating category');
      console.error('Error:', error);
    } finally {
      setCreating(false);
    }
  };

  // Handle tag creation
  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch('/api/admin/taxonomy/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTag)
      });

      if (response.ok) {
        const result = await response.json();
        // Reset form and close modal
        setNewTag({ name: '', slug: '', content_type: '' });
        setShowCreateModal(false);
        // Refresh data
        fetchTaxonomyData();
      } else {
        const errorData = await response.json();
        setCreateError(errorData.error || 'Failed to create tag');
      }
    } catch (error) {
      setCreateError('Error creating tag');
      console.error('Error:', error);
    } finally {
      setCreating(false);
    }
  };

  // Handle category editing
  const handleEditCategory = (category: Category) => {
    setEditingItem(category);
    setShowEditModal(true);
  };

  // Handle tag editing
  const handleEditTag = (tag: Tag) => {
    setEditingItem(tag);
    setShowEditModal(true);
  };

  // Handle category deletion
  const handleDeleteCategory = (id: string, name: string) => {
    setDeletingItem({ id, name, type: 'category' });
    setShowDeleteConfirm(true);
  };

  // Handle tag deletion
  const handleDeleteTag = (id: string, name: string) => {
    setDeletingItem({ id, name, type: 'tag' });
    setShowDeleteConfirm(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!deletingItem) return;
    
    setDeleting(true);
    try {
      const endpoint = deletingItem.type === 'category' 
        ? `/api/admin/taxonomy/categories?id=${deletingItem.id}`
        : `/api/admin/taxonomy/tags?id=${deletingItem.id}`;
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (response.ok) {
        setShowDeleteConfirm(false);
        setDeletingItem(null);
        fetchTaxonomyData();
      } else {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    
    setEditing(true);
    setEditError(null);

    try {
      const endpoint = editingItem.content_type === 'tutorials'
        ? `/api/admin/taxonomy/categories`
        : `/api/admin/taxonomy/tags`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem)
      });

      if (response.ok) {
        setEditSuccess('Item updated successfully!');
        setShowEditModal(false);
        setEditingItem(null);
        fetchTaxonomyData();
        // Clear success message after 3 seconds
        setTimeout(() => setEditSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setEditError(errorData.error || 'Failed to update item');
      }
    } catch (error) {
      setEditError('Error updating item');
      console.error('Error:', error);
    } finally {
      setEditing(false);
    }
  };

  // Reset form when modal is closed
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCreateError(null);
    setNewCategory({ name: '', slug: '', description: '', content_type: '' });
    setNewTag({ name: '', slug: '', content_type: '' });
  };

  // Reset edit form when modal is closed
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingItem(null);
    setEditError(null);
    setEditSuccess(null);
  };

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Handle name change for category (auto-generate slug)
  const handleCategoryNameChange = (name: string) => {
    setNewCategory(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Handle name change for tag (auto-generate slug)
  const handleTagNameChange = (name: string) => {
    setNewTag(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Taxonomy Management</h1>
            <p className="text-gray-600 mt-1">Manage categories and tags across all content types</p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <span className="text-lg">+</span>
            <span>Create {activeTab === 'categories' ? 'Category' : 'Tag'}</span>
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-indigo-600">{stats.total_categories}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{stats.total_tags}</div>
              <div className="text-sm text-gray-600">Total Tags</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.categories_by_type).length}
              </div>
              <div className="text-sm text-gray-600">Content Types (Categories)</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(stats.tags_by_type).length}
              </div>
              <div className="text-sm text-gray-600">Content Types (Tags)</div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {editSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{editSuccess}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'categories'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📁 Categories
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'tags'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏷️ Tags
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Content Type Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {contentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulk Actions</label>
              <div className="flex gap-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Action</option>
                  <option value="delete">Delete</option>
                  <option value="merge">Merge</option>
                  <option value="reassign">Reassign Content Type</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      activeTab === 'categories'
                        ? selectedItems.size === filteredCategories.length && filteredCategories.length > 0
                        : selectedItems.size === filteredTags.length && filteredTags.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                {activeTab === 'categories' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeTab === 'categories'
                ? filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(category.id)}
                          onChange={() => handleSelectItem(category.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">/{category.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getContentTypeLabel(category.content_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.item_count}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                 <div className="flex justify-end space-x-2">
                           <button
                             onClick={() => handleEditCategory(category)}
                             className="text-indigo-600 hover:text-indigo-900"
                           >
                             Edit
                           </button>
                           <button 
                             onClick={() => handleDeleteCategory(category.id, category.name)}
                             className="text-red-600 hover:text-red-900"
                           >
                             Delete
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                : filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(tag.id)}
                          onChange={() => handleSelectItem(tag.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{tag.name}</div>
                        <div className="text-sm text-gray-500">#{tag.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {getContentTypeLabel(tag.content_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tag.item_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tag.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditTag(tag)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && (
        (activeTab === 'categories' && filteredCategories.length === 0) ||
        (activeTab === 'tags' && filteredTags.length === 0)
      ) && (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">
            {activeTab === 'categories' ? '📁' : '🏷️'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? `No ${activeTab} match your search criteria.`
              : `Get started by creating your first ${activeTab === 'categories' ? 'category' : 'tag'}.`
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Create {activeTab === 'categories' ? 'Category' : 'Tag'}
          </button>
        </div>
      )}

             {/* Create Category Modal */}
       {showCreateModal && activeTab === 'categories' && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
             <h3 className="text-lg font-medium mb-4">Create New Category</h3>
             
             <form onSubmit={handleCreateCategory} className="space-y-4">
               {/* Content Type */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Content Type *
                 </label>
                 <select
                   value={newCategory.content_type}
                   onChange={(e) => setNewCategory(prev => ({ ...prev, content_type: e.target.value }))}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   <option value="">Select content type</option>
                   {contentTypes.filter(type => type.value !== 'all').map(type => (
                     <option key={type.value} value={type.value}>{type.label}</option>
                   ))}
                 </select>
               </div>

               {/* Name */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Category Name *
                 </label>
                 <input
                   type="text"
                   value={newCategory.name}
                   onChange={(e) => handleCategoryNameChange(e.target.value)}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="e.g., Linux Basics"
                 />
               </div>

               {/* Slug */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Slug *
                 </label>
                 <div className="flex space-x-2">
                   <input
                     type="text"
                     value={newCategory.slug}
                     onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                     required
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="e.g., linux-basics"
                   />
                   <button
                     type="button"
                     onClick={() => setNewCategory(prev => ({ ...prev, slug: generateSlug(prev.name) }))}
                     className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                     title="Regenerate slug from name"
                   >
                     ↻
                   </button>
                 </div>
               </div>

               {/* Description */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Description
                 </label>
                 <textarea
                   value={newCategory.description}
                   onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="Brief description of what this category covers..."
                 />
               </div>

               {/* Error Display */}
               {createError && (
                 <div className="bg-red-50 border border-red-200 rounded-md p-3">
                   <div className="text-sm text-red-700">{createError}</div>
                 </div>
               )}

               {/* Form Actions */}
               <div className="flex justify-end space-x-3 pt-4">
                 <button
                   type="button"
                   onClick={handleCloseModal}
                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={creating}
                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {creating ? 'Creating...' : 'Create Category'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Create Tag Modal */}
       {showCreateModal && activeTab === 'tags' && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
             <h3 className="text-lg font-medium mb-4">Create New Tag</h3>
             
             <form onSubmit={handleCreateTag} className="space-y-4">
               {/* Content Type */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Content Type *
                 </label>
                 <select
                   value={newTag.content_type}
                   onChange={(e) => setNewTag(prev => ({ ...prev, content_type: e.target.value }))}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   <option value="">Select content type</option>
                   {contentTypes.filter(type => type.value !== 'all').map(type => (
                     <option key={type.value} value={type.value}>{type.label}</option>
                   ))}
                 </select>
               </div>

               {/* Name */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Tag Name *
                 </label>
                 <input
                   type="text"
                   value={newTag.name}
                   onChange={(e) => handleTagNameChange(e.target.value)}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="e.g., beginner"
                 />
               </div>

               {/* Slug */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Slug *
                 </label>
                 <div className="flex space-x-2">
                   <input
                     type="text"
                     value={newTag.slug}
                     onChange={(e) => setNewTag(prev => ({ ...prev, slug: e.target.value }))}
                     required
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                     placeholder="e.g., beginner"
                   />
                   <button
                     type="button"
                     onClick={() => setNewTag(prev => ({ ...prev, slug: generateSlug(prev.name) }))}
                     className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                     title="Regenerate slug from name"
                   >
                     ↻
                   </button>
                 </div>
               </div>

               {/* Error Display */}
               {createError && (
                 <div className="bg-red-50 border border-red-200 rounded-md p-3">
                   <div className="text-sm text-red-700">{createError}</div>
                 </div>
               )}

               {/* Form Actions */}
               <div className="flex justify-end space-x-3 pt-4">
                 <button
                   type="button"
                   onClick={handleCloseModal}
                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={creating}
                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {creating ? 'Creating...' : 'Create Tag'}
                 </button>
               </div>
             </form>
           </div>
                  </div>
       )}

       {/* Edit Modal */}
       {showEditModal && editingItem && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
             <h3 className="text-lg font-medium mb-4">
               Edit {editingItem.content_type === 'tutorials' ? 'Category' : 'Tag'}
             </h3>
             
             <form onSubmit={handleEditSubmit} className="space-y-4">
               {/* Content Type */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Content Type *
                 </label>
                 <select
                   value={editingItem.content_type}
                   onChange={(e) => setEditingItem(prev => prev ? { ...prev, content_type: e.target.value } : null)}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 >
                   {contentTypes.filter(type => type.value !== 'all').map(type => (
                     <option key={type.value} value={type.value}>{type.label}</option>
                   ))}
                 </select>
               </div>

               {/* Name */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   {editingItem.content_type === 'tutorials' ? 'Category' : 'Tag'} Name *
                 </label>
                 <input
                   type="text"
                   value={editingItem.name}
                   onChange={(e) => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>

               {/* Slug */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Slug *
                 </label>
                 <input
                   type="text"
                   value={editingItem.slug}
                   onChange={(e) => setEditingItem(prev => prev ? { ...prev, slug: e.target.value } : null)}
                   required
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                 />
               </div>

               {/* Description (for categories only) */}
               {editingItem.content_type === 'tutorials' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Description
                   </label>
                   <textarea
                     value={(editingItem as Category).description || ''}
                     onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                     rows={3}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                   />
                 </div>
               )}

               {/* Error Display */}
               {editError && (
                 <div className="bg-red-50 border border-red-200 rounded-md p-3">
                   <div className="text-sm text-red-700">{editError}</div>
                 </div>
               )}

               {/* Form Actions */}
               <div className="flex justify-end space-x-3 pt-4">
                 <button
                   type="button"
                   onClick={handleCloseEditModal}
                   className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={editing}
                   className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {editing ? 'Saving...' : 'Save Changes'}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && deletingItem && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
             <h3 className="text-lg font-medium mb-4 text-red-600">Confirm Deletion</h3>
             
             <div className="mb-6">
               <p className="text-gray-700 mb-2">
                 Are you sure you want to delete this {deletingItem.type}?
               </p>
               <p className="text-gray-900 font-medium">
                 "{deletingItem.name}"
               </p>
               <p className="text-sm text-gray-500 mt-2">
                 This action cannot be undone.
               </p>
             </div>

             {/* Error Display */}
             {editError && (
               <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                 <div className="text-sm text-red-700">{editError}</div>
               </div>
             )}

             {/* Actions */}
             <div className="flex justify-end space-x-3">
               <button
                 onClick={() => setShowDeleteConfirm(false)}
                 disabled={deleting}
                 className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
               >
                 Cancel
               </button>
               <button
                 onClick={confirmDelete}
                 disabled={deleting}
                 className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {deleting ? 'Deleting...' : 'Delete'}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }
