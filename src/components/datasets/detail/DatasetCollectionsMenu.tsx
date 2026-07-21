'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaFolderPlus, FaPlus } from 'react-icons/fa';
import { Button } from '@/components/models/ui/primitives';
import type { DatasetCore } from '@/types/datasets';

type Collection = { id: string; name: string; slugs: string[] };

const STORAGE_KEY = 'ht_dataset_collections_v1';

function readLocal(): Collection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(cols: Collection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));
}

export function DatasetCollectionsMenu({ dataset }: { dataset: DatasetCore }) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    setCollections(readLocal());
  }, []);

  const persist = (next: Collection[]) => {
    setCollections(next);
    writeLocal(next);
  };

  const addToCollection = (id: string) => {
    const next = collections.map((c) =>
      c.id === id
        ? { ...c, slugs: c.slugs.includes(dataset.slug) ? c.slugs : [...c.slugs, dataset.slug] }
        : c
    );
    persist(next);
    toast.success('Added to collection');
    setOpen(false);
  };

  const createCollection = () => {
    const trimmed = name.trim() || `Collection ${collections.length + 1}`;
    const col: Collection = {
      id: `c_${Date.now()}`,
      name: trimmed,
      slugs: [dataset.slug],
    };
    persist([col, ...collections]);
    setName('');
    toast.success(`Created “${trimmed}”`);
    setOpen(false);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(collections, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dataset-collections.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative inline-block">
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <FaFolderPlus className="mr-1.5 h-3.5 w-3.5" /> Collections
      </Button>
      {open ? (
        <div
          className="absolute right-0 z-40 mt-2 w-64 rounded-lg border border-[var(--m-border)] bg-[var(--m-surface)] p-3 shadow-lg"
          role="menu"
        >
          <p className="mb-2 text-xs font-medium text-[var(--m-text-muted)]">Save to a local collection</p>
          <ul className="mb-2 max-h-40 space-y-1 overflow-y-auto">
            {collections.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1.5 text-left text-sm text-[var(--m-text)] hover:bg-[var(--m-brand-soft)]"
                  onClick={() => addToCollection(c.id)}
                >
                  {c.name}{' '}
                  <span className="text-xs text-[var(--m-text-muted)]">({c.slugs.length})</span>
                </button>
              </li>
            ))}
            {!collections.length ? (
              <li className="px-2 py-1 text-xs text-[var(--m-text-muted)]">No collections yet</li>
            ) : null}
          </ul>
          <div className="flex gap-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New collection"
              className="min-w-0 flex-1 rounded border border-[var(--m-border)] bg-transparent px-2 py-1 text-sm"
              aria-label="New collection name"
            />
            <Button type="button" size="sm" onClick={createCollection} aria-label="Create collection">
              <FaPlus className="h-3 w-3" />
            </Button>
          </div>
          {collections.length > 0 ? (
            <button
              type="button"
              className="mt-2 text-xs text-[var(--m-brand)] hover:underline"
              onClick={exportJson}
            >
              Export JSON
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default DatasetCollectionsMenu;
