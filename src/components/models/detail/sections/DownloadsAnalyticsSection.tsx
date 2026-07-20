'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaDownload, FaFire } from 'react-icons/fa';
import { Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelDownloadAnalytics } from '@/types/models';
import { formatCompactNumber } from '../utils';

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <p className="text-2xl font-bold text-[var(--m-text)]">{value}</p>
      <p className="text-xs uppercase tracking-wide text-[var(--m-text-muted)]">{label}</p>
    </Card>
  );
}

export function DownloadsAnalyticsSection({ analytics }: { analytics: ModelDownloadAnalytics }) {
  const hasTrend = analytics.trend && analytics.trend.length > 0;

  return (
    <DetailSection id="downloads-analytics" title="Downloads & Analytics" description="Adoption trends over the last 30 days">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Today" value={formatCompactNumber(analytics.today)} />
        <StatBlock label="This Week" value={formatCompactNumber(analytics.weekly)} />
        <StatBlock label="This Month" value={formatCompactNumber(analytics.monthly)} />
        <StatBlock label="All Time" value={formatCompactNumber(analytics.total)} />
      </div>

      <Card className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
            <FaDownload className="text-[var(--m-brand)]" /> Download Trend
          </h3>
          <span className="flex items-center gap-1.5 text-xs text-[var(--m-text-muted)]">
            <FaFire className="text-amber-500" /> Popularity score: {analytics.popularity_score}/100
          </span>
        </div>
        {hasTrend ? (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={analytics.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="downloads" stroke="#dc2626" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[var(--m-text-muted)]">Not enough data yet to plot a trend.</p>
        )}
      </Card>
    </DetailSection>
  );
}

export default DownloadsAnalyticsSection;
