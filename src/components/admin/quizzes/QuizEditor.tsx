'use client';

import { useState, useEffect } from 'react';
import { Quiz, QuizCategory } from '@/types/quiz';
import toast from 'react-hot-toast';

interface QuizEditorProps {
  quiz?: Quiz;
  categories: QuizCategory[];
  onSave: (quizData: Partial<Quiz>) => Promise<void>;
}

export default function QuizEditor({ quiz, categories, onSave }: QuizEditorProps) {
  const [formData, setFormData] = useState({
    title: quiz?.title || '',
    slug: quiz?.slug || '',
    description: quiz?.description || '',
    thumbnail_url: quiz?.thumbnail_url || '',
    difficulty: quiz?.difficulty || 'Beginner',
    estimated_time: quiz?.estimated_time || null as number | null,
    passing_score: quiz?.passing_score || 70,
    randomize_questions: quiz?.randomize_questions || false,
    randomize_answers: quiz?.randomize_answers || false,
    status: quiz?.status || 'draft',
    seo_title: quiz?.seo_title || '',
    seo_description: quiz?.seo_description || '',
    seo_keywords: quiz?.seo_keywords || '',
    category_ids: quiz?.category_names ? [] : ([] as number[])
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (quiz) {
      // Fetch category IDs for this quiz
      fetch(`/api/admin/quizzes/${quiz.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.quiz.category_ids) {
            setSelectedCategories(data.quiz.category_ids);
          }
        })
        .catch(() => {});
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      setIsSaving(true);
      await onSave({
        ...formData,
        category_ids: selectedCategories
      });
    } catch (error) {
      // Error handling is done in parent
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Auto-generated from title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thumbnail URL
          </label>
          <input
            type="url"
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quiz Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={formData.estimated_time || ''}
              onChange={(e) => setFormData({ ...formData, estimated_time: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={formData.passing_score}
              onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 70 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.randomize_questions}
              onChange={(e) => setFormData({ ...formData, randomize_questions: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Randomize Question Order</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.randomize_answers}
              onChange={(e) => setFormData({ ...formData, randomize_answers: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">Randomize Answer Options</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <label
              key={category.id}
              className={`px-4 py-2 rounded-lg cursor-pointer border-2 transition-colors ${
                selectedCategories.includes(category.id)
                  ? 'bg-blue-100 border-blue-500 text-blue-800'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
                className="hidden"
              />
              {category.name}
            </label>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">SEO Settings</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Title
          </label>
          <input
            type="text"
            value={formData.seo_title}
            onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Leave empty to use quiz title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Description
          </label>
          <textarea
            value={formData.seo_description}
            onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Meta description for search engines"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Keywords
          </label>
          <input
            type="text"
            value={formData.seo_keywords}
            onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Comma-separated keywords"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : quiz ? 'Update Quiz' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}

