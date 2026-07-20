'use client';

import { FaBoxOpen, FaClock, FaGraduationCap, FaMemory, FaMicrochip, FaCode, FaCheck } from 'react-icons/fa';
import { Badge, Card } from '@/components/models/ui/primitives';
import { CodeBlock } from '@/components/models/ui/CodeBlock';
import { DetailSection } from '@/components/models/ui/DetailSection';
import type { ModelCore, ModelInstallGuide, ModelInstallMeta } from '@/types/models';
import { DevToolsPanel } from '../DevToolsPanel';
import { InfoCard } from '../InfoCard';

function guessLanguage(target: string): string {
  const t = target.toLowerCase();
  if (t.includes('docker')) return 'dockerfile';
  if (t.includes('pip') || t.includes('python') || t.includes('conda')) return 'bash';
  if (t.includes('npm') || t.includes('node') || t.includes('js')) return 'bash';
  if (t.includes('curl') || t.includes('api')) return 'bash';
  return 'bash';
}

function defaultInstallMeta(model: ModelCore): ModelInstallMeta {
  const qf = model.quick_facts || {};
  const paramsB = model.param_count_b;
  return {
    estimated_time: qf.install_time || (paramsB && paramsB > 7 ? '20–45 min' : '5–15 min'),
    difficulty: qf.install_difficulty || (paramsB && paramsB > 13 ? 'hard' : paramsB && paramsB > 3 ? 'medium' : 'easy'),
    python_version: qf.python_version || '3.9+',
    cuda_version: qf.cuda_version || (paramsB && paramsB > 3 ? '11.8+ / 12.x' : 'Optional'),
    ram_required: qf.ram_required || model.memory_footprint || (paramsB ? `~${Math.max(4, Math.ceil(paramsB * 2))} GB` : '8 GB+'),
    gpu_required: qf.gpu_requirement || (paramsB && paramsB > 3 ? 'Recommended' : 'Optional for CPU'),
    expected_output: `Successful import / load of ${model.external_model_id || model.slug}`,
    verification_command:
      qf.verification_command ||
      `python -c "from transformers import AutoModel; AutoModel.from_pretrained('${model.external_model_id || model.slug}')"`,
    troubleshooting: [
      'Upgrade pip and install a matching torch build for your CUDA version.',
      'If OOM occurs, try a quantized variant or reduce batch size.',
      'Clear Hugging Face cache if downloads corrupt: rm -rf ~/.cache/huggingface/hub',
      'Pin transformers/tokenizers versions when facing import errors.',
    ],
  };
}

export function InstallationSection({
  model,
  installGuides,
}: {
  model: ModelCore;
  installGuides: ModelInstallGuide[];
}) {
  const meta = { ...defaultInstallMeta(model), ...(model.install_meta || {}) };

  return (
    <DetailSection id="installation" title="Installation" description="Set up this model in your environment">
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <MetaChip icon={<FaClock />} label="Install time" value={meta.estimated_time} />
        <MetaChip icon={<FaGraduationCap />} label="Difficulty" value={meta.difficulty} />
        <MetaChip icon={<FaCode />} label="Python" value={meta.python_version} />
        <MetaChip icon={<FaMicrochip />} label="CUDA" value={meta.cuda_version} />
        <MetaChip icon={<FaMemory />} label="RAM" value={meta.ram_required} />
        <MetaChip icon={<FaMicrochip />} label="GPU" value={meta.gpu_required} />
      </div>

      {meta.expected_output && (
        <Card className="mb-4 border-l-4 border-l-[var(--m-brand)] p-3 text-sm text-[var(--m-text)]">
          <strong>Expected output:</strong> {meta.expected_output}
        </Card>
      )}

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
              <CodeBlock
                code={guide.code || guide.command || ''}
                language={guessLanguage(guide.target)}
                title={guide.target}
                model={model}
              />
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

      {meta.verification_command && (
        <div className="mt-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
            <FaCheck className="text-emerald-600" /> Verification command
          </h3>
          <CodeBlock code={meta.verification_command} language="bash" title="Verify" model={model} />
        </div>
      )}

      {meta.troubleshooting && meta.troubleshooting.length > 0 && (
        <div className="mt-4">
          <InfoCard title="Troubleshooting" bullets={meta.troubleshooting} tone="warning" />
        </div>
      )}

      <div className="mt-6">
        <DevToolsPanel model={model} />
      </div>
    </DetailSection>
  );
}

function MetaChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <Card className="p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--m-text-muted)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold capitalize text-[var(--m-text)]">{value}</div>
    </Card>
  );
}

export default InstallationSection;
