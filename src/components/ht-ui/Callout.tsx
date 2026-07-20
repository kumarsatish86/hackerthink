import type { ReactNode } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';
import { Card } from './Button';

export type CalloutVariant = 'info' | 'warning' | 'success' | 'danger' | 'neutral';

export type CalloutProps = {
  variant?: CalloutVariant;
  title?: string;
  body?: string;
  children?: ReactNode;
  className?: string;
};

const styles: Record<CalloutVariant, { border: string; icon: ReactNode; soft: string }> = {
  info: {
    border: 'border-l-[var(--ht-info)]',
    soft: 'bg-[var(--ht-info-soft)]',
    icon: <FaInfoCircle className="text-[var(--ht-info)]" />,
  },
  warning: {
    border: 'border-l-[var(--ht-warning)]',
    soft: 'bg-[var(--ht-warning-soft)]',
    icon: <FaExclamationTriangle className="text-[var(--ht-warning)]" />,
  },
  success: {
    border: 'border-l-[var(--ht-success)]',
    soft: 'bg-[var(--ht-success-soft)]',
    icon: <FaCheckCircle className="text-[var(--ht-success)]" />,
  },
  danger: {
    border: 'border-l-[var(--ht-danger)]',
    soft: 'bg-[var(--ht-danger-soft)]',
    icon: <FaTimesCircle className="text-[var(--ht-danger)]" />,
  },
  neutral: {
    border: 'border-l-[var(--ht-border)]',
    soft: 'bg-[var(--ht-surface-2)]',
    icon: <FaInfoCircle className="text-[var(--ht-text-muted)]" />,
  },
};

/** Unified Callout / Info / Warning / Success / Danger box — JSON-configurable via props. */
export function Callout({ variant = 'info', title, body, children, className = '' }: CalloutProps) {
  const s = styles[variant];
  return (
    <Card className={`border-l-4 p-4 ${s.border} ${s.soft} ${className}`} role="note">
      <div className="flex gap-3">
        <span className="mt-0.5 shrink-0" aria-hidden>
          {s.icon}
        </span>
        <div className="min-w-0 flex-1">
          {title ? <h4 className="mb-1 text-sm font-semibold text-[var(--ht-text)]">{title}</h4> : null}
          {body ? <p className="text-sm text-[var(--ht-text)]">{body}</p> : null}
          {children}
        </div>
      </div>
    </Card>
  );
}

export const InfoBox = (p: Omit<CalloutProps, 'variant'>) => <Callout {...p} variant="info" />;
export const WarningBox = (p: Omit<CalloutProps, 'variant'>) => <Callout {...p} variant="warning" />;
export const SuccessBox = (p: Omit<CalloutProps, 'variant'>) => <Callout {...p} variant="success" />;
export const DangerBox = (p: Omit<CalloutProps, 'variant'>) => <Callout {...p} variant="danger" />;
