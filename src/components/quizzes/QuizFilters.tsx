'use client';

import { FaFilter, FaSort } from 'react-icons/fa';

interface QuizFiltersProps {
  categories: any[];
  selectedCategory: string;
  selectedDifficulty: string;
  sortBy: string;
  sortOrder: string;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
  onSortChange: (sortBy: string) => void;
  onSortOrderChange: (order: string) => void;
}

export default function QuizFilters({
  categories,
  selectedCategory,
  selectedDifficulty,
  sortBy,
  sortOrder,
  onCategoryChange,
  onDifficultyChange,
  onSortChange,
  onSortOrderChange
}: QuizFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <FaFilter className="w-4 h-4" />
        <span className="font-medium">Filters:</span>
      </div>

      <div>
        <label className="text-sm text-gray-600 mr-2">Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.slug}>
              {category.name} ({category.quiz_count})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-600 mr-2">Difficulty:</label>
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <FaSort className="w-4 h-4 text-gray-600" />
        <label className="text-sm text-gray-600">Sort:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="created_at">Date</option>
          <option value="title">Title</option>
          <option value="difficulty">Difficulty</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
    </div>
  );
}

