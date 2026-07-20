'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FaFolderPlus, FaPlus } from 'react-icons/fa';
import { Button } from '@/components/models/ui/primitives';
import type { ModelCore } from '@/types/models';

type Collection = { id: string; name: string; slugs: string[] };

const STORAGE_KEY = 'ht_model_collections_v1';

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

export function CollectionsMenu({ model }: { model: ModelCore }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    const local = readLocal();
    setCollections(local);
    if (!session?.user) return;
    fetch('/api/models/collections')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.collections?.length) {
          const mapped = data.collections.map((c: any) => ({
            id: c.id,
            name: c.name,
            slugs: Array.isArray(c.slugs) ? c.slugs : [],
          }));
          setCollections(mapped);
        }
      })
      .catch(() => {});
  }, [session?.user]);

  const persist = (next: Collection[]) => {
    setCollections(next);
    writeLocal(next);
  };

  const addToCollection = (id: string) => {
    const next = collections.map((c) =>
      c.id === id
        ? { ...c, slugs: c.slugs.includes(model.slug) ? c.slugs : [...c.slugs, model.slug] }
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
      slugs: [model.slug],
    };
    persist([col, ...collections]);
    setName('');
    toast.success(`Created “${trimmed}”`);
    setOpen(false);
  };

  const exportCompareLater = () => {
    const match = collections.find((c) => c.slugs.includes(model.slug)) || collections[0];
    const slugs = match?.slugs?.length ? match.slugs.slice(0, 4) : [model.slug];
    window.location.href = `/models/compare?models=${encodeURIComponent(slugs.join(','))}`;
  };

  const exportJson = () => {
    const match = collections.find((c) => c.slugs.includes(model.slug)) || collections[0];
    const payload = match || { id: 'adhoc', name: model.name, slugs: [model.slug] };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.name.replace(/\s+/g, '-').toLowerCase()}-collection.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Collection JSON exported');
  };

  const shareCollection = async () => {
    const match = collections.find((c) => c.slugs.includes(model.slug)) || collections[0];
    const slugs = match?.slugs?.length ? match.slugs : [model.slug];
    const shareUrl = `${window.location.origin}/models/compare?models=${encodeURIComponent(slugs.join(','))}&collection=${encodeURIComponent(match?.name || 'shared')}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied');
    } catch {
      toast.error('Could not copy share link');
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          if (!session?.user) {
            toast.error('Sign in to manage collections (local collections still available)');
          }
          setOpen((v) => !v);
        }}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <FaFolderPlus className="h-3.5 w-3.5" /> Collection
      </Button>
      {open && (
        <div
          className="absolute left-0 z-40 mt-1 w-64 rounded-lg border border-[var(--m-border)] bg-[var(--m-surface)] p-3 shadow-lg"
          role="menu"
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--m-text-muted)]">
            Save to collection
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto">
            {collections.length === 0 && (
              <p className="text-xs text-[var(--m-text-muted)]">No collections yet.</p>
            )}
            {collections.map((c) => (
              <button
                key={c.id}
                type="button"
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--m-surface-2)]"
                onClick={() => addToCollection(c.id)}
              >
                <span>{c.name}</span>
                <span className="text-xs text-[var(--m-text-muted)]">{c.slugs.length}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-1">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New collection"
              className="min-w-0 flex-1 rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-2 py-1 text-xs"
            />
            <Button size="sm" variant="outline" onClick={createCollection} aria-label="Create collection">
              <FaPlus className="h-3 w-3" />
            </Button>
          </div>
          <button
            type="button"
            className="mt-2 w-full rounded-md border border-[var(--m-border)] px-2 py-1.5 text-xs text-[var(--m-text)] hover:bg-[var(--m-surface-2)]"
            onClick={exportCompareLater}
          >
            Export / Compare later
          </button>
          <button
            type="button"
            className="mt-1 w-full rounded-md border border-[var(--m-border)] px-2 py-1.5 text-xs text-[var(--m-text)] hover:bg-[var(--m-surface-2)]"
            onClick={shareCollection}
          >
            Copy share link
          </button>
          <button
            type="button"
            className="mt-1 w-full rounded-md border border-[var(--m-border)] px-2 py-1.5 text-xs text-[var(--m-text)] hover:bg-[var(--m-surface-2)]"
            onClick={exportJson}
          >
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
