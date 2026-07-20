'use client';

import { useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  FaDownload, FaExpand, FaCompress, FaExternalLinkAlt, FaPlay, FaMoon, FaSun, FaCode,
} from 'react-icons/fa';
import { CopyButton } from './CopyButton';
import type { ModelCore } from '@/types/models';

export function CodeBlock({
  code,
  language = 'python',
  title,
  versions,
  model,
  runOnlineHref,
}: {
  code: string;
  language?: string;
  title?: string;
  versions?: { label: string; code: string; language?: string }[];
  model?: ModelCore;
  runOnlineHref?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [versionIdx, setVersionIdx] = useState(0);
  const [forceTheme, setForceTheme] = useState<'auto' | 'dark' | 'light'>('auto');

  const active = useMemo(() => {
    if (versions?.length) {
      const v = versions[versionIdx] || versions[0];
      return { code: v.code, language: v.language || language, title: v.label };
    }
    return { code, language, title };
  }, [code, language, title, versions, versionIdx]);

  const dark =
    forceTheme === 'dark' || (forceTheme === 'auto' && resolvedTheme === 'dark');

  const download = () => {
    const blob = new Blob([active.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(active.title || 'snippet').replace(/\s+/g, '-').toLowerCase()}.${active.language || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colabHref = `https://colab.research.google.com/#create=true`;
  const vscodeHref = `vscode://vscode.new/?${encodeURIComponent(active.code.slice(0, 500))}`;
  const online =
    runOnlineHref ||
    model?.demo_url ||
    (model?.playground_config?.demo_url as string | undefined) ||
    (model ? `/models/${model.slug}?section=playground#playground` : undefined);

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
        <div className="flex flex-wrap items-center gap-1">
          <CopyButton value={active.code} label="Copy" />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            aria-label={expanded ? 'Collapse' : 'Expand'}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            aria-label="Download"
            title="Download"
          >
            <FaDownload />
          </button>
          <a
            href={colabHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            title="Open in Colab"
            aria-label="Open in Colab"
          >
            <FaExternalLinkAlt />
          </a>
          <a
            href={vscodeHref}
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            title="Open in VS Code"
            aria-label="Open in VS Code"
          >
            <FaCode />
          </a>
          {online && (
            <a
              href={online}
              className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
              title="Run online"
              aria-label="Run online"
            >
              <FaPlay />
            </a>
          )}
          <button
            type="button"
            onClick={() =>
              setForceTheme((t) => (t === 'auto' ? 'dark' : t === 'dark' ? 'light' : 'auto'))
            }
            className="rounded-md border border-[var(--m-border)] px-2 py-1 text-xs text-[var(--m-text-muted)]"
            aria-label="Toggle code theme"
            title="Dark / Light theme"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
      <div className={expanded ? 'max-h-none' : 'max-h-80 overflow-auto'}>
        <SyntaxHighlighter
          language={active.language}
          style={dark ? oneDark : oneLight}
          customStyle={{ margin: 0, background: 'transparent', fontSize: '0.85rem' }}
          wrapLongLines
        >
          {active.code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
