'use client';

import React from 'react';
import Link from 'next/link';
import { FaBrain, FaDownload, FaStar, FaProjectDiagram, FaCode } from 'react-icons/fa';

interface Variant {
  id: string;
  variant_name?: string;
  variant_slug?: string;
  parent_name?: string;
  parent_slug?: string;
  variant_type?: string;
  description?: string;
  model_type?: string;
  parameters?: string;
  logo_url?: string;
  developer?: string;
  rating?: number;
  download_count?: number;
}

interface VariantCardProps {
  variant: Variant;
  type: 'variant' | 'parent';
  showDescription?: boolean;
}

export default function VariantCard({ variant, type, showDescription = true }: VariantCardProps) {
  const modelSlug = type === 'variant' ? variant.variant_slug : variant.parent_slug;
  const modelName = type === 'variant' ? variant.variant_name : variant.parent_name;

  const formatRating = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(1) : 'N/A';
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const getVariantTypeLabel = (type?: string) => {
    if (!type) return 'Variant';
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
  };

  if (!modelSlug || !modelName) return null;

  return (
    <Link
      href={`/models/${modelSlug}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-red-500"
    >
      <div className="flex items-start gap-4">
        {variant.logo_url ? (
          <img
            src={variant.logo_url}
            alt={modelName}
            className="w-16 h-16 rounded-lg flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FaBrain className="text-red-600 text-2xl" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{modelName}</h3>
              {variant.developer && (
                <p className="text-sm text-gray-600 truncate">{variant.developer}</p>
              )}
            </div>
            {variant.variant_type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium ml-2 flex-shrink-0">
                {getVariantTypeLabel(variant.variant_type)}
              </span>
            )}
          </div>

          {showDescription && variant.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{variant.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
            {variant.model_type && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {variant.model_type}
              </span>
            )}
            {variant.parameters && (
              <span className="font-medium">{variant.parameters}</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            {variant.rating !== undefined && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-400" />
                <span className="font-semibold">{formatRating(variant.rating)}</span>
              </div>
            )}
            {variant.download_count !== undefined && (
              <div className="flex items-center gap-1">
                <FaDownload className="text-blue-600" />
                <span>{formatNumber(variant.download_count)}</span>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto text-red-600">
              <FaProjectDiagram />
              <span>View Details →</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

