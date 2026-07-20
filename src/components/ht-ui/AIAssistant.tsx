'use client';

import { useState } from 'react';
import { FaCheck, FaRobot } from 'react-icons/fa';
import { Button, Card } from './Button';

export type AssistantAction = {
  id: string;
  label: string;
  promptTemplate: string;
};

export type AIAssistantProps = {
  title?: string;
  actions: AssistantAction[];
  contextVars?: Record<string, string>;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function AIAssistant({
  title = 'AI Assistant',
  actions,
  contextVars = {},
  className = '',
  open: controlledOpen,
  onOpenChange,
}: AIAssistantProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const open = controlledOpen ?? internalOpen;

  function setOpen(v: boolean) {
    setInternalOpen(v);
    onOpenChange?.(v);
  }

  async function copyPrompt(action: AssistantAction) {
    const text = fillTemplate(action.promptTemplate, contextVars);
    await navigator.clipboard.writeText(text);
    setCopiedId(action.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ht-brand)] text-white shadow-lg"
        aria-expanded={open}
        aria-label={title}
      >
        <FaRobot />
      </button>
      {open ? (
        <Card className="fixed bottom-20 right-6 z-40 max-h-[70vh] w-[min(100vw-2rem,22rem)] overflow-y-auto p-4 shadow-xl">
          <h3 className="mb-3 text-sm font-semibold text-[var(--ht-text)]">{title}</h3>
          <ul className="space-y-2">
            {actions.map((a) => (
              <li key={a.id}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  onClick={() => copyPrompt(a)}
                >
                  {a.label}
                  {copiedId === a.id ? <FaCheck className="text-[var(--ht-success)]" /> : null}
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
