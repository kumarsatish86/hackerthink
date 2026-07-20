'use client';

import { FaBoxOpen } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore, ModelInstallGuide } from '@/types/models';
import { DevToolsPanel } from '../DevToolsPanel';

function guessLanguage(target: string): string {
  const t = target.toLowerCase();
  if (t.includes('docker')) return 'dockerfile';
  if (t.includes('pip') || t.includes('python') || t.includes('conda')) return 'bash';
  if (t.includes('npm') || t.includes('node') || t.includes('js')) return 'bash';
  if (t.includes('curl') || t.includes('api')) return 'bash';
  return 'bash';
}

export function InstallationSection({
  model,
  installGuides,
}: {
  model: ModelCore;
  installGuides: ModelInstallGuide[];
}) {
  return (
    <DetailSection id="installation" title="Installation" description="Set up this model in your environment">
      {installGuides.length > 0 ? (
        <div className="space-y-4">
          {installGuides.map((guide) => (
            <Card key={guide.id} className="p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <FaBoxOpen className="text-[var(--m-brand)]" />
                <h3 className="text-sm font-semibold text-[var(--m-text)]">{guide.title || guide.target}</h3>
                <Badge>{guide.target}</Badge>
                {guide.version_label && <Badge tone="brand">{guide.version_label}</Badge>}
              </div>
              {guide.description && <p className="mb-3 text-sm text-[var(--m-text-muted)]">{guide.description}</p>}
              <CodeBlock code={guide.code || guide.command || ''} language={guessLanguage(guide.target)} title={guide.target} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <FaBoxOpen className="mx-auto mb-3 h-8 w-8 text-[var(--m-text-muted)]" />
          <p className="text-sm text-[var(--m-text-muted)]">
            No dedicated install guides yet — use the snippets below to get started.
          </p>
        </Card>
      )}

      <div className="mt-6">
        <DevToolsPanel model={model} />
      </div>
    </DetailSection>
  );
}

export default InstallationSection;
