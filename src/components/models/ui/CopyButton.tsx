'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaCheck, FaCopy } from 'react-icons/fa';

export function CopyButton({
  value,
  label = 'Copy',
  className = '',
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-[var(--m-border)] bg-[var(--m-surface)] px-2 py-1 text-xs font-medium text-[var(--m-text-muted)] hover:text-[var(--m-text)] ${className}`}
      aria-label={label}
    >
      {copied ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
      {copied ? 'Copied' : label}
    </button>
  );
}
