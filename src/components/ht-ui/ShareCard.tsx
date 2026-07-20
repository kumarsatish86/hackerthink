'use client';

import { useState } from 'react';
import { FaCheck, FaLink, FaShareAlt } from 'react-icons/fa';
import { Button, Card } from './Button';

export type ShareChannel = {
  id: string;
  label: string;
  href?: string;
};

export type ShareCardProps = {
  url: string;
  title: string;
  channels?: ShareChannel[];
  className?: string;
};

export function ShareCard({ url, title, channels = [], className = '' }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--ht-text)]">
        <FaShareAlt aria-hidden /> Share
      </div>
      <p className="mb-3 truncate text-xs text-[var(--ht-text-muted)]" title={title}>
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={copy}>
          {copied ? <FaCheck /> : <FaLink />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        {channels.map((c) =>
          c.href ? (
            <a key={c.id} href={c.href} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="ghost" size="sm">
                {c.label}
              </Button>
            </a>
          ) : null
        )}
      </div>
    </Card>
  );
}
