'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { FaStar, FaLink, FaUsers, FaPaperPlane, FaComment } from 'react-icons/fa';
import { Button, Card } from '@/components/models/ui/primitives';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCommunityLink, ModelCore } from '@/types/models';
import { formatDate } from '../utils';

interface Comment {
  id: string;
  user_id?: string | null;
  body: string;
  created_at: string;
  author_name?: string | null;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`Rate ${star} stars`}
          className="text-lg"
        >
          <FaStar className={(hover || value) >= star ? 'text-yellow-400' : 'text-[var(--m-border)]'} />
        </button>
      ))}
    </div>
  );
}

export function CommunitySection({ model, links }: { model: ModelCore; links: ModelCommunityLink[] }) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingBusy, setRatingBusy] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/models/${model.slug}/comments`)
      .then((res) => (res.ok ? res.json() : { comments: [] }))
      .then((data) => {
        if (active) setComments(data.comments || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCommentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [model.slug]);

  const submitRating = async () => {
    if (!rating) {
      toast.error('Select a star rating first');
      return;
    }
    setRatingBusy(true);
    try {
      const res = await fetch(`/api/models/${model.slug}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review, user_id: session?.user?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to submit rating');
      toast.success('Thanks for rating this model!');
      setReview('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit rating');
    } finally {
      setRatingBusy(false);
    }
  };

  const submitComment = async () => {
    if (!session?.user) {
      toast.error('Sign in to leave a comment');
      return;
    }
    if (!commentBody.trim()) return;
    setCommentBusy(true);
    try {
      const res = await fetch(`/api/models/${model.slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: commentBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to post comment');
      setComments((prev) => [{ ...data.comment, author_name: session.user?.name }, ...prev]);
      setCommentBody('');
      toast.success('Comment posted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to post comment');
    } finally {
      setCommentBusy(false);
    }
  };

  return (
    <DetailSection id="community" title="Community" description="Ratings, discussion, and where to connect">
      <Card className="mb-6 p-4">
        <h3 className="mb-2 text-sm font-semibold text-[var(--m-text)]">Projects Using This Model</h3>
        <p className="mb-3 text-xs text-[var(--m-text-muted)]">
          Showcase community apps, demos, and production stories powered by {model.name}.
        </p>
        <ul className="space-y-2 text-sm text-[var(--m-text)]">
          <li className="rounded-md border border-dashed border-[var(--m-border)] px-3 py-2">
            Submit your project via community links or discussion below.
          </li>
          {links
            .filter((l) => /project|showcase|demo|github/i.test(`${l.title} ${l.link_type || ''}`))
            .slice(0, 5)
            .map((l) => (
              <li key={l.id}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[var(--m-brand)] hover:underline">
                  {l.title}
                </a>
              </li>
            ))}
        </ul>
      </Card>

      <Card className="mb-6 p-4">
        <h3 className="mb-2 text-sm font-semibold text-[var(--m-text)]">Tips &amp; user benchmarks</h3>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--m-text-muted)]">
          <li>Share latency/VRAM notes from your hardware in Discussion.</li>
          <li>Link your Colab or Space for others to reproduce results.</li>
          <li>Call out quantization settings that worked best for you.</li>
        </ul>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">Known Issues</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ht-text-muted)]">
            <li>Watch tokenizer mismatches when swapping base checkpoints.</li>
            <li>Large batch sizes may OOM on consumer GPUs — start small.</li>
            <li>Report reproducible bugs with hardware + quantization notes.</li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">Common Errors</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ht-text-muted)]">
            <li>`CUDA out of memory` — reduce batch or use a quantized variant.</li>
            <li>`safetensors` load failures — confirm transformers version.</li>
            <li>Unexpected dims — verify pooling strategy matches training.</li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">Deployment Notes</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ht-text-muted)]">
            <li>Pin model revision digests in production images.</li>
            <li>Warm the model on pod start to avoid first-request spikes.</li>
            <li>Export OpenAPI from your serving layer for client SDKs.</li>
          </ul>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--ht-text)]">Fine-tuning Experiences</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--ht-text-muted)]">
            <li>Start with a small domain set and early-stop on STS/retrieval.</li>
            <li>Document learning rate and epochs that worked for peers.</li>
            <li>Share adapters (LoRA) when full FT is unnecessary.</li>
          </ul>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
            <FaStar className="text-yellow-400" /> Rate this model
          </h3>
          <StarPicker value={rating} onChange={setRating} />
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={2}
            placeholder="Optional review..."
            className="mt-3 w-full rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm"
          />
          <Button size="sm" className="mt-3" onClick={submitRating} disabled={ratingBusy}>
            {ratingBusy ? 'Submitting…' : 'Submit Rating'}
          </Button>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
            <FaLink className="text-[var(--m-brand)]" /> Community Links
          </h3>
          {links.length > 0 ? (
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-[var(--m-text)] hover:text-[var(--m-brand)]"
                  >
                    <FaUsers className="h-3.5 w-3.5 flex-shrink-0 text-[var(--m-text-muted)]" />
                    {link.title}
                    {link.link_type && <span className="text-xs text-[var(--m-text-muted)]">({link.link_type})</span>}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--m-text-muted)]">No community links added yet.</p>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
          <FaComment className="text-[var(--m-brand)]" /> Discussion ({comments.length})
        </h3>
        <div className="mb-4 flex gap-2">
          <input
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder={session?.user ? 'Share your thoughts...' : 'Sign in to comment'}
            disabled={!session?.user}
            className="flex-1 rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-3 py-2 text-sm disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitComment();
            }}
          />
          <Button size="sm" onClick={submitComment} disabled={commentBusy || !session?.user}>
            <FaPaperPlane className="h-3.5 w-3.5" />
          </Button>
        </div>
        {commentsLoading ? (
          <p className="text-sm text-[var(--m-text-muted)]">Loading comments…</p>
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="border-t border-[var(--m-border)] pt-3 first:border-t-0 first:pt-0">
                <div className="mb-1 flex items-center gap-2 text-xs text-[var(--m-text-muted)]">
                  <span className="font-medium text-[var(--m-text)]">{c.author_name || 'Anonymous'}</span>
                  <span>{formatDate(c.created_at)}</span>
                </div>
                <p className="text-sm text-[var(--m-text)]">{c.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--m-text-muted)]">Be the first to comment on this model.</p>
        )}
      </Card>
    </DetailSection>
  );
}

export default CommunitySection;
