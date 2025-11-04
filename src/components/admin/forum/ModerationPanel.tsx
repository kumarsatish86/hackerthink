'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: number;
  post_id: number;
  reason: string;
  status: string;
  created_at: string;
  reporter_name: string;
  post_content: string;
  thread_title: string;
}

export default function ModerationPanel() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/forum/admin/reports?status=pending');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: number, action: 'resolved' | 'dismissed') => {
    try {
      const response = await fetch('/api/forum/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, action }),
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending Reports</h2>
      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-gray-500">No pending reports</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold">{report.thread_title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{report.post_content.substring(0, 200)}...</p>
                  <p className="text-xs text-gray-500 mt-2">Reported by: {report.reporter_name}</p>
                  <p className="text-xs text-gray-500">Reason: {report.reason}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleResolve(report.id, 'resolved')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, 'dismissed')}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

