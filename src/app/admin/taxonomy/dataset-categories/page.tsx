'use client';

import React, { useEffect, useState } from 'react';
import { FaDatabase, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

export default function DatasetCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/taxonomy/dataset-categories')
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/content/datasets" className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900">
          <FaArrowLeft className="mr-2" /> Back to Datasets
        </Link>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FaDatabase className="text-blue-600" />
          Dataset Categories
        </h1>
        <p className="mt-2 text-gray-600">Live facets from published datasets (domain / type)</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No published category facets yet. Publish datasets with domain or dataset_type set.
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{category.name}</div>
                  <div className="text-sm text-gray-500">
                    /{category.slug} · {category.count} datasets
                  </div>
                </div>
                <Link
                  href={`/datasets/category/${category.slug}`}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  View public
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
