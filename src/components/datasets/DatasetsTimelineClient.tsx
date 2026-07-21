'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Timeline } from '@/components/ht-ui';
import { EmptyState, Spinner } from '@/components/ht-ui';

interface TimelineDataset {
  id: string;
  name: string;
  slug: string;
  provider?: string;
  dataset_type?: string;
  release_date?: string;
  description?: string;
  download_count: number;
}

export default function DatasetsTimelineClient() {
  const [datasets, setDatasets] = useState<TimelineDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: 'published',
          limit: '200',
          sort: 'release_date',
          order: 'desc',
        });
        if (selectedYear) params.set('year', selectedYear);
        const res = await fetch(`/api/datasets?${params}`);
        const data = await res.json();
        setDatasets(data.datasets || []);
      } catch (e) {
        console.error(e);
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedYear]);

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const d of datasets) {
      if (d.release_date) set.add(String(new Date(d.release_date).getFullYear()));
    }
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [datasets]);

  const events = useMemo(
    () =>
      datasets
        .filter((d) => d.release_date)
        .map((d) => ({
          id: d.id,
          date: new Date(d.release_date!).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          title: d.name,
          body: `${d.provider || 'Unknown'} · ${d.dataset_type || 'Dataset'} — ${
            d.description ? d.description.slice(0, 140) : 'Open catalog entry'
          }`,
        })),
    [datasets]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-[var(--ht-text)]">
          Year
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="ml-2 rounded-md border border-[var(--ht-border)] bg-[var(--ht-bg)] px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-[var(--ht-text-muted)]">{events.length} dated releases</p>
      </div>

      {events.length ? (
        <div className="space-y-2">
          <Timeline events={events.slice(0, 80)} />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {datasets.slice(0, 40).map((d) => (
              <li key={d.id}>
                <Link
                  href={`/datasets/${d.slug}`}
                  className="text-sm font-medium text-[var(--ht-brand)] hover:underline"
                >
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          title="No dated releases in this filter"
          body="Try clearing the year filter or enrich release_date on catalog entries."
        />
      )}
    </div>
  );
}
