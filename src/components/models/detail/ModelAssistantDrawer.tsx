'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaRobot, FaTimes, FaCopy, FaArrowRight } from 'react-icons/fa';
import type { ModelCore } from '@/types/models';

function buildPromptTemplates(model: ModelCore): { label: string; prompt: string }[] {
  return [
    {
      label: 'Summarize this model',
      prompt: `Explain what ${model.name} by ${model.developer || 'its developer'} is, what it's good at, and who should use it.`,
    },
    {
      label: 'Compare with alternatives',
      prompt: `Compare ${model.name} against similar ${model.task || 'AI'} models and highlight the key trade-offs.`,
    },
    {
      label: 'Installation help',
      prompt: `Give me step-by-step instructions to install and run ${model.name} locally using ${model.framework || 'Python'}.`,
    },
    {
      label: 'Suggest use cases',
      prompt: `List practical, real-world use cases for ${model.name} in a production application.`,
    },
    {
      label: 'Debug an integration issue',
      prompt: `I'm integrating ${model.name} via its API and getting unexpected results. Help me debug the request/response format.`,
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
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--m-brand)] text-white shadow-lg transition hover:bg-[var(--m-brand-hover)] hover:scale-105"
        aria-label="Open AI prompt assistant"
      >
        <FaRobot className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-xl border border-[var(--m-border)] bg-[var(--m-surface)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--m-border)] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--m-text)]">
                <FaRobot className="text-[var(--m-brand)]" /> Prompt Assistant
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
                Copy a ready-made prompt about {model.name} to use with your favorite AI assistant.
              </p>
              {templates.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => copyPrompt(t.prompt)}
                  className="group flex w-full items-start justify-between gap-2 rounded-lg border border-[var(--m-border)] p-3 text-left transition hover:border-[var(--m-brand)] hover:bg-[var(--m-surface-2)]"
                >
                  <span>
                    <span className="block text-sm font-medium text-[var(--m-text)]">{t.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--m-text-muted)] line-clamp-2">{t.prompt}</span>
                  </span>
                  <FaCopy className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-[var(--m-text-muted)] group-hover:text-[var(--m-brand)]" />
                </button>
              ))}
              <a
                href="/dashboard"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--m-border)] p-3 text-sm text-[var(--m-brand)] hover:bg-[var(--m-surface-2)]"
              >
                Open full AI assistant <FaArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ModelAssistantDrawer;
