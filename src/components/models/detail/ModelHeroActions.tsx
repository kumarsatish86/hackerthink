'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {
  FaDownload, FaExternalLinkAlt, FaPlay, FaFlag, FaShareAlt, FaBookmark, FaRegBookmark,
  FaTimes, FaExchangeAlt,
} from 'react-icons/fa';
import { Button, Card } from '@/components/models/ui/primitives';
import { CopyButton } from '@/components/models/ui/CopyButton';
import type { ModelCore, ModelInstallGuide } from '@/types/models';
import Link from 'next/link';
import { CollectionsMenu } from './CollectionsMenu';

const REPORT_REASONS = [
  'Incorrect metadata',
  'Broken link',
  'Outdated benchmark or version info',
  'Inappropriate or unsafe content',
  'Licensing concern',
  'Other',
];

function pickInstallCommand(model: ModelCore, guides: ModelInstallGuide[]): string {
  const guide = guides.find((g) => g.command) || guides[0];
  if (guide?.command) return guide.command;
  if (guide?.code) return guide.code;
  const pkg = model.slug || model.name.toLowerCase().replace(/\s+/g, '-');
  if (model.framework?.toLowerCase().includes('transformers') || !model.framework) {
    return `pip install transformers\n# then load "${model.name}" via from_pretrained("${model.external_model_id || pkg}")`;
  }
  return `pip install ${pkg}`;
}

export function ModelHeroActions({
  model,
  installGuides = [],
}: {
  model: ModelCore;
  installGuides?: ModelInstallGuide[];
}) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [reportBusy, setReportBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/models/${model.slug}/bookmark`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setBookmarked(!!data.bookmarked);
        setBookmarkCount(typeof data.count === 'number' ? data.count : null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [model.slug]);

  const toggleBookmark = async () => {
    if (!session?.user) {
      toast.error('Sign in to bookmark this model');
      return;
    }
    setBookmarkBusy(true);
    try {
      const res = await fetch(`/api/models/${model.slug}/bookmark`, {
        method: bookmarked ? 'DELETE' : 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to update bookmark');
      setBookmarked(!!data.bookmarked);
      setBookmarkCount(typeof data.count === 'number' ? data.count : null);
      toast.success(data.bookmarked ? 'Bookmarked' : 'Bookmark removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update bookmark');
    } finally {
      setBookmarkBusy(false);
    }
  };

  const scrollToPlayground = () => {
    const el = document.getElementById('playground');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `${window.location.pathname}?section=playground#playground`);
    } else {
      toast.error('Playground not available for this model');
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/models/${model.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: model.name, url });
        return;
      } catch {
        // fall through to clipboard copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const submitReport = async () => {
    setReportBusy(true);
    try {
      const res = await fetch(`/api/models/${model.slug}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, details: reportDetails || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit report');
      toast.success(data?.message || 'Report submitted');
      setReportOpen(false);
      setReportDetails('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit report');
    } finally {
      setReportBusy(false);
    }
  };

  const downloadHref = model.download_url || model.huggingface_url || model.github_url || undefined;
  const demoHref = model.demo_url || model.playground_config?.demo_url || undefined;
  const installCommand = pickInstallCommand(model, installGuides);
  const modelIdValue = model.external_model_id || model.slug;

  return (
    <div className="border-b border-[var(--m-border)] bg-[var(--m-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {downloadHref ? (
              <a href={downloadHref} target="_blank" rel="noopener noreferrer">
                <Button size="sm">
                  <FaDownload className="h-3.5 w-3.5" /> Download
                </Button>
              </a>
            ) : (
              <Button size="sm" disabled>
                <FaDownload className="h-3.5 w-3.5" /> Download
              </Button>
            )}

            {demoHref ? (
              <a href={demoHref} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <FaExternalLinkAlt className="h-3.5 w-3.5" /> Run Online
                </Button>
              </a>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <FaExternalLinkAlt className="h-3.5 w-3.5" /> Run Online
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={scrollToPlayground}>
              <FaPlay className="h-3.5 w-3.5" /> Playground
            </Button>

            <Link href={`/models/compare?models=${encodeURIComponent(model.slug)}`}>
              <Button variant="outline" size="sm" aria-label="Compare this model">
                <FaExchangeAlt className="h-3.5 w-3.5" /> Compare
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <CopyButton value={modelIdValue} label="Copy ID" />
            <CopyButton value={installCommand} label="Install" />
            <Button variant="ghost" size="sm" onClick={share}>
              <FaShareAlt className="h-3.5 w-3.5" /> Share
            </Button>
            <Button
              variant={bookmarked ? 'primary' : 'ghost'}
              size="sm"
              onClick={toggleBookmark}
              disabled={bookmarkBusy}
              aria-pressed={bookmarked}
            >
              {bookmarked ? <FaBookmark className="h-3.5 w-3.5" /> : <FaRegBookmark className="h-3.5 w-3.5" />}
              {bookmarked ? 'Saved' : 'Save'}
              {bookmarkCount != null && <span className="text-xs opacity-75">({bookmarkCount})</span>}
            </Button>
            <CollectionsMenu model={model} />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-[var(--m-text-muted)]"
            onClick={() => setReportOpen(true)}
          >
            <FaFlag className="h-3.5 w-3.5" /> Report
          </Button>
        </div>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--m-text)]">Report an issue</h3>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="text-[var(--m-text-muted)] hover:text-[var(--m-text)]"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">
              Reason
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="mb-3 w-full rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-[var(--m-text-muted)]">
              Details (optional)
            </label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              rows={4}
              maxLength={5000}
              className="mb-4 w-full rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm"
              placeholder="Tell us more about the issue..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setReportOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitReport} disabled={reportBusy}>
                {reportBusy ? 'Submitting…' : 'Submit Report'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ModelHeroActions;
