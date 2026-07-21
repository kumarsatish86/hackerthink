'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaRobot, FaTimes, FaCopy } from 'react-icons/fa';
import type { DatasetCore } from '@/types/datasets';

function templates(dataset: DatasetCore) {
  const id = dataset.external_dataset_id || dataset.slug;
  return [
    { id: 'explain', label: 'Explain dataset', prompt: `Explain ${dataset.name} (${id}): modality, tasks, strengths, risks, and who should use it.` },
    { id: 'preprocess', label: 'Generate preprocessing', prompt: `Write Python preprocessing for ${dataset.name} (${id}) with train/val split and basic cleaning.` },
    { id: 'coco-yolo', label: 'Convert COCO to YOLO', prompt: `Show how to convert COCO annotations to YOLO for a dataset like ${dataset.name}.` },
    { id: 'split', label: 'Train/validation split', prompt: `Generate a stratified train/validation split script for ${dataset.name}.` },
    { id: 'augment', label: 'Augmentation pipeline', prompt: `Create an Albumentations/torchvision augmentation pipeline suitable for ${dataset.name}.` },
    { id: 'train', label: 'Training script', prompt: `Write a minimal PyTorch training loop using ${dataset.name} (${id}).` },
    { id: 'gpu', label: 'Estimate GPU', prompt: `Estimate GPU RAM and batch size for training on ${dataset.name} (size ${dataset.size || 'unknown'}).` },
    { id: 'models', label: 'Recommend models', prompt: `Recommend foundation/fine-tune models for ${dataset.name} tasks ${JSON.stringify(dataset.task_types || [])}.` },
    { id: 'dupes', label: 'Detect duplicates', prompt: `Outline a duplicate detection pipeline for ${dataset.name}.` },
    { id: 'clean', label: 'Cleaning pipeline', prompt: `Generate a data cleaning checklist and code sketch for ${dataset.name}.` },
  ];
}

export function DatasetAssistantDrawer({ dataset }: { dataset: DatasetCore }) {
  const [open, setOpen] = useState(false);
  const items = templates(dataset);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ht-brand)] text-white shadow-lg sm:bottom-5"
        aria-label="Open dataset AI assistant"
      >
        <FaRobot />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 p-4" role="dialog" aria-modal>
          <div className="max-h-[70vh] w-full max-w-sm overflow-y-auto rounded-xl border border-[var(--ht-border)] bg-[var(--ht-surface)] p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--ht-text)]">Dataset Assistant</h3>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <FaTimes />
              </button>
            </div>
            <ul className="space-y-2">
              {items.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-2 rounded-lg border border-[var(--ht-border)] p-3 text-left text-sm hover:border-[var(--ht-brand)]"
                    onClick={async () => {
                      await navigator.clipboard.writeText(t.prompt);
                      toast.success('Prompt copied');
                    }}
                  >
                    <span>
                      <span className="block font-medium text-[var(--ht-text)]">{t.label}</span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-[var(--ht-text-muted)]">{t.prompt}</span>
                    </span>
                    <FaCopy className="mt-1 shrink-0 text-[var(--ht-text-muted)]" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default DatasetAssistantDrawer;
