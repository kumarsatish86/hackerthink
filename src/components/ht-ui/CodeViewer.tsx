'use client';

import { CodeBlock } from '@/components/models/ui/CodeBlock';
import type { ModelCore } from '@/types/models';

export type CodeViewerVersion = {
  label: string;
  code: string;
  language?: string;
};

export type CodeViewerProps = {
  code: string;
  language?: string;
  filename?: string;
  title?: string;
  versions?: CodeViewerVersion[];
  model?: ModelCore;
  runOnlineHref?: string;
};

/** Design-system Code Viewer — wraps models CodeBlock with JSON-friendly props. */
export function CodeViewer({
  code,
  language = 'python',
  filename,
  title,
  versions,
  model,
  runOnlineHref,
}: CodeViewerProps) {
  return (
    <CodeBlock
      code={code}
      language={language}
      title={title || filename}
      versions={versions}
      model={model}
      runOnlineHref={runOnlineHref}
    />
  );
}
