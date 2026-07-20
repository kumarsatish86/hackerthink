'use client';

import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { Button, Card } from './Button';

export type BookmarkCardProps = {
  bookmarked?: boolean;
  count?: number;
  label?: string;
  onToggle?: () => void;
  className?: string;
};

export function BookmarkCard({
  bookmarked = false,
  count,
  label = 'Bookmark',
  onToggle,
  className = '',
}: BookmarkCardProps) {
  return (
    <Card className={`flex items-center justify-between gap-3 p-3 ${className}`}>
      <div>
        <div className="text-sm font-semibold text-[var(--ht-text)]">{label}</div>
        {typeof count === 'number' ? (
          <div className="text-xs text-[var(--ht-text-muted)]">{count} saved</div>
        ) : null}
      </div>
      <Button type="button" variant={bookmarked ? 'primary' : 'outline'} size="sm" onClick={onToggle} aria-pressed={bookmarked}>
        {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
        {bookmarked ? 'Saved' : 'Save'}
      </Button>
    </Card>
  );
}
