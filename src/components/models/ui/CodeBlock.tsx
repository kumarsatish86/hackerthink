'use client';

import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { CopyButton } from './CopyButton';

export function CodeBlock({
  code,
  language = 'python',
  title,
  versions,
}: {
  code: string;
  language?: string;
  title?: string;
  versions?: { label: string; code: string; language?: string }[];
}) {
  const { resolvedTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [versionIdx, setVersionIdx] = useState(0);

  const active = useMemo(() => {
    if (versions?.length) {
      const v = versions[versionIdx] || versions[0];
      return { code: v.code, language: v.language || language, title: v.label };
    }
    return { code, language, title };
  }, [code, language, title, versions, versionIdx]);

  const download = () => {
    const blob = new Blob([active.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(active.title || 'snippet').replace(/\s+/g, '-').toLowerCase()}.${active.language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--m-border)] bg-[var(--m-surface-2)] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--m-text-muted)]">
            {active.title || active.language}
          </span>
          {versions && versions.length > 1 && (
            <select
              className="rounded border border-[var(--m-border)] bg-[var(--m-surface)] px-2 py-1 text-xs"
              value={versionIdx}
              onChange={(e) => setVersionIdx(Number(e.target.value))}
              aria-label="Code version"
            >
              {versions.map((v, i) => (
                <option key={v.label} value={i}>
                  {v.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-1">
          <CopyButton value={active.code} label="Copy" />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            aria-label="Download"
          >
            <FaDownload />
          </button>
        </div>
      </div>
      <div className={expanded ? 'max-h-none' : 'max-h-80 overflow-auto'}>
        <SyntaxHighlighter
          language={active.language}
          style={resolvedTheme === 'dark' ? oneDark : oneLight}
          customStyle={{ margin: 0, background: 'transparent', fontSize: '0.85rem' }}
          wrapLongLines
        >
          {active.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
