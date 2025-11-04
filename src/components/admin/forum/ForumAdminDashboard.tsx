'use client';

import { useState } from 'react';
import { FaUsers, FaComments, FaBan, FaChartBar, FaDatabase } from 'react-icons/fa';
import CategoryManager from './CategoryManager';
import ModerationPanel from './ModerationPanel';
import UserManagement from './UserManagement';
import Analytics from './Analytics';

export default function ForumAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'categories' | 'moderation' | 'users' | 'analytics'>('categories');
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<string | null>(null);

  const handleRunMigrations = async () => {
    if (!confirm('This will create the forum database tables. Continue?')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      const response = await fetch('/api/admin/forum/migrations', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok || response.status === 207) {
        // Show detailed results
        const results = data.results || [];
        const successCount = results.filter((r: any) => r.status === 'success').length;
        const errorCount = results.filter((r: any) => r.status === 'error').length;
        
        let message = `${data.message}\n\n`;
        results.forEach((result: any) => {
          if (result.status === 'success') {
            message += `✓ ${result.migration}: ${result.message || 'Success'}\n`;
          } else {
            message += `✗ ${result.migration}: ${result.message || 'Error'}\n`;
            if (result.stack) {
              message += `   ${result.stack.split('\n')[0]}\n`;
            }
          }
        });

        if (errorCount > 0) {
          setMigrationResult(`⚠️ ${message.trim()}`);
        } else {
          setMigrationResult(`✅ ${message.trim()}`);
        }
      } else {
        setMigrationResult(`❌ Error: ${data.message || data.error || 'Failed to run migrations'}`);
      }
    } catch (error: any) {
      setMigrationResult(`❌ Error: ${error.message || 'Failed to run migrations'}`);
      console.error('Migration error:', error);
    } finally {
      setMigrating(false);
    }
  };

  const tabs = [
    { id: 'categories' as const, label: 'Categories', icon: FaComments },
    { id: 'moderation' as const, label: 'Moderation', icon: FaBan },
    { id: 'users' as const, label: 'Users', icon: FaUsers },
    { id: 'analytics' as const, label: 'Analytics', icon: FaChartBar },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Forum Administration</h1>
          <button
            onClick={handleRunMigrations}
            disabled={migrating}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDatabase className="w-4 h-4" />
            <span>{migrating ? 'Running Migrations...' : 'Run Database Migrations'}</span>
          </button>
        </div>

        {migrationResult && (
          <div className={`mb-6 p-4 rounded-md ${
            migrationResult.includes('✅') || migrationResult.includes('Success')
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : migrationResult.includes('⚠️')
              ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <pre className="text-sm whitespace-pre-wrap font-mono">{migrationResult}</pre>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'moderation' && <ModerationPanel />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'analytics' && <Analytics />}
        </div>
      </div>
    </div>
  );
}

