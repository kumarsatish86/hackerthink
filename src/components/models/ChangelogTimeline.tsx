'use client';

import React from 'react';
import { FaHistory, FaCalendar, FaCodeBranch, FaCheckCircle, FaBug, FaRocket } from 'react-icons/fa';

interface ChangelogEntry {
  id: string;
  version?: string;
  release_date?: string;
  changes?: string;
  description?: string;
  performance_improvements?: string;
  bug_fixes?: string;
  new_features?: string;
}

interface ChangelogTimelineProps {
  changelog: ChangelogEntry[];
  maxDisplay?: number;
}

export default function ChangelogTimeline({
  changelog,
  maxDisplay
}: ChangelogTimelineProps) {
  if (!changelog || changelog.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <FaHistory className="mx-auto w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-600">No changelog entries available</p>
      </div>
    );
  }

  const displayChangelog = maxDisplay ? changelog.slice(0, maxDisplay) : changelog;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative p-6">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-200"></div>
        
        <div className="space-y-6">
          {displayChangelog.map((entry, index) => (
            <div key={entry.id} className="relative pl-20">
              {/* Timeline Dot */}
              <div className="absolute left-4 w-8 h-8 rounded-full bg-red-600 border-4 border-white shadow-lg flex items-center justify-center z-10">
                <FaHistory className="text-white text-xs" />
              </div>
              
              {/* Entry Content */}
              <div className="bg-gray-50 rounded-lg p-5 border-l-4 border-red-500 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {entry.version && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-2">
                          <FaCodeBranch className="text-xs" />
                          v{entry.version}
                        </span>
                      )}
                      {entry.release_date && (
                        <span className="text-sm text-gray-600 flex items-center gap-2">
                          <FaCalendar className="text-xs" />
                          {formatDate(entry.release_date)}
                        </span>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-gray-700 mb-3 leading-relaxed">{entry.description}</p>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mt-4 pt-4 border-t">
                  {entry.new_features && (
                    <div className="bg-green-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FaRocket className="text-green-600 text-sm" />
                        <span className="text-sm font-semibold text-green-700">New Features</span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.new_features}</p>
                    </div>
                  )}
                  
                  {entry.performance_improvements && (
                    <div className="bg-blue-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FaCheckCircle className="text-blue-600 text-sm" />
                        <span className="text-sm font-semibold text-blue-700">Performance Improvements</span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.performance_improvements}</p>
                    </div>
                  )}
                  
                  {entry.bug_fixes && (
                    <div className="bg-yellow-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <FaBug className="text-yellow-600 text-sm" />
                        <span className="text-sm font-semibold text-yellow-700">Bug Fixes</span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.bug_fixes}</p>
                    </div>
                  )}
                  
                  {entry.changes && !entry.new_features && !entry.performance_improvements && !entry.bug_fixes && (
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-sm text-gray-700">{entry.changes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {maxDisplay && changelog.length > maxDisplay && (
        <div className="px-6 py-4 bg-gray-50 border-t text-center text-sm text-gray-600">
          Showing {maxDisplay} of {changelog.length} changelog entries
        </div>
      )}
    </div>
  );
}

