import { FaExclamationCircle } from 'react-icons/fa';
import { Button, Card } from './Button';
import type { HtAction } from './types';

export type ErrorStateProps = {
  title?: string;
  message: string;
  retry?: HtAction;
  className?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  retry,
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <Card className={`p-6 text-center ${className}`} role="alert">
      <FaExclamationCircle className="mx-auto mb-3 h-8 w-8 text-[var(--ht-danger)]" aria-hidden />
      <h3 className="text-sm font-semibold text-[var(--ht-text)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--ht-text-muted)]">{message}</p>
      {(retry || onRetry) && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            type="button"
          >
            {retry?.label || 'Try again'}
          </Button>
        </div>
      )}
    </Card>
  );
}
