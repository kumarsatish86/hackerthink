'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FaDownload, FaEye, FaSearch, FaCopy, FaBookmark, FaShareAlt, FaFlag, FaCode,
} from 'react-icons/fa';
import { Button, ShareCard, BookmarkCard } from '@/components/ht-ui';
import type { DatasetCore } from '@/types/datasets';

export function DatasetHeroActions({ dataset }: { dataset: DatasetCore }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const id = dataset.external_dataset_id || dataset.slug;
  const url = typeof window !== 'undefined' ? window.location.href : `https://hackerthink.com/datasets/${dataset.slug}`;

  const copyId = async () => {
    await navigator.clipboard.writeText(id);
    toast.success('Dataset ID copied');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        {dataset.download_url || dataset.huggingface_url ? (
          <a href={dataset.download_url || dataset.huggingface_url || '#'} target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              <FaDownload /> Download
            </Button>
          </a>
        ) : (
          <a href="#download">
            <Button size="sm" variant="outline">
              <FaDownload /> Download
            </Button>
          </a>
        )}
        <a href="#samples">
          <Button size="sm" variant="outline">
            <FaEye /> View Samples
          </Button>
        </a>
        <a href="#explorer">
          <Button size="sm" variant="outline">
            <FaSearch /> Open Explorer
          </Button>
        </a>
        <Button size="sm" variant="ghost" type="button" onClick={copyId}>
          <FaCopy /> Copy Dataset ID
        </Button>
        <Button
          size="sm"
          variant="ghost"
          type="button"
          onClick={() => setBookmarked((v) => !v)}
          aria-pressed={bookmarked}
        >
          <FaBookmark /> Bookmark
        </Button>
        <Button size="sm" variant="ghost" type="button" onClick={() => setShowShare((v) => !v)}>
          <FaShareAlt /> Share
        </Button>
        <a href={`mailto:support@hackerthink.com?subject=Report%20${encodeURIComponent(dataset.slug)}`}>
          <Button size="sm" variant="ghost" type="button">
            <FaFlag /> Report Issue
          </Button>
        </a>
        <a href="#download">
          <Button size="sm" variant="ghost" type="button">
            <FaCode /> Generate API
          </Button>
        </a>
      </div>
      {showShare ? (
        <div className="mt-3 max-w-md">
          <ShareCard url={url} title={dataset.name} />
        </div>
      ) : null}
      <div className="mt-3 max-w-xs">
        <BookmarkCard bookmarked={bookmarked} onToggle={() => setBookmarked((v) => !v)} label="Save dataset" />
      </div>
    </div>
  );
}
