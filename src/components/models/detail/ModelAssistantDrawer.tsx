'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaRobot, FaTimes, FaCopy, FaArrowRight } from 'react-icons/fa';
import type { ModelCore } from '@/types/models';

function buildPromptTemplates(model: ModelCore): { id: string; label: string; prompt: string }[] {
  const id = model.external_model_id || model.slug;
  const fw = model.framework || 'transformers';
  const task = model.task || 'inference';
  return [
    {
      id: 'explain',
      label: 'Explain',
      prompt: `Explain ${model.name} (${id}) by ${model.developer || 'its developer'}: architecture (${model.architecture || 'n/a'}), task (${task}), strengths, and who should use it.`,
    },
    {
      id: 'compare',
      label: 'Compare',
      prompt: `Compare ${model.name} (${id}) to the closest open alternatives for ${task}. Cover quality, latency, license, and deployment cost.`,
    },
    {
      id: 'deploy',
      label: 'Deploy',
      prompt: `Design a FastAPI + Docker deployment for ${model.name} (${id}) with health checks, env vars, and resource requests.`,
    },
    {
      id: 'code',
      label: 'Code',
      prompt: `Generate production-ready ${fw} code to load and run ${model.name} (${id}) for ${task}, including error handling.`,
    },
    {
      id: 'benchmark',
      label: 'Benchmark',
      prompt: `Propose a benchmark suite for ${model.name} covering accuracy, latency, RAM/VRAM, and comparison peers.`,
    },
    {
      id: 'finetune',
      label: 'Fine-tune',
      prompt: `Outline a fine-tuning plan for ${model.name} on a custom dataset: data format, hyperparameters, evaluation, and risks.`,
    },
    {
      id: 'convert',
      label: 'Convert',
      prompt: `Show how to export ${model.name} (${id}) to ONNX (and optionally TorchScript) and validate numerical parity.`,
    },
    {
      id: 'quantize',
      label: 'Quantize',
      prompt: `Recommend quantization options (INT8/GPTQ/AWQ/GGUF) for ${model.name} and expected quality/speed trade-offs.`,
    },
    {
      id: 'troubleshoot',
      label: 'Troubleshoot',
      prompt: `I'm integrating ${model.name} and seeing errors. Help debug common load/inference issues for ${fw}.`,
    },
    {
      id: 'optimize',
      label: 'Optimize',
      prompt: `Optimize serving ${model.name} (${id}) for p95 latency and cost: batching, caching, hardware choice, and autoscaling.`,
    },
  ];
}

export function ModelAssistantDrawer({ model }: { model: ModelCore }) {
  const [open, setOpen] = useState(false);
  const templates = buildPromptTemplates(model);

  const copyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied — paste it into your favorite AI assistant');
    } catch {
      toast.error('Could not copy prompt');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--m-brand)] text-white shadow-lg transition hover:scale-105 hover:bg-[var(--m-brand-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:bottom-5"
        aria-label="Open AI prompt assistant"
      >
        <FaRobot className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Model AI assistant"
        >
          <div className="w-full max-w-sm rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--m-border)] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
                <FaRobot className="text-[var(--m-brand)]" /> Model Assistant
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-[var(--m-text-muted)] hover:text-[var(--m-text)]"
              >
                <FaTimes />
              </button>
            </div>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
              <p className="mb-2 text-xs text-[var(--m-text-muted)]">
                Contextual prompts for {model.name} — copy and run in your AI tool.
              </p>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => copyPrompt(t.prompt)}
                  className="group flex w-full items-start justify-between gap-2 rounded-lg border border-[var(--m-border)] p-3 text-left transition hover:border-[var(--m-brand)] hover:bg-[var(--m-surface-2)]"
                >
                  <span>
                    <span className="block text-sm font-medium text-[var(--m-text)]">{t.label}</span>
                    <span className="mt-0.5 line-clamp-2 block text-xs text-[var(--m-text-muted)]">{t.prompt}</span>
                  </span>
                  <FaCopy className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-[var(--m-text-muted)] group-hover:text-[var(--m-brand)]" />
                </button>
              ))}
              <a
                href="/dashboard"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--m-border)] p-3 text-sm text-[var(--m-brand)] hover:bg-[var(--m-surface-2)]"
              >
                Open dashboard <FaArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModelAssistantDrawer;
