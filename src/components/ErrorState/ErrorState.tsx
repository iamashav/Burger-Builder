import { Button } from '../Button/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'That did not load',
  message = 'The kitchen is unreachable right now. Check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div role="alert" className="mx-auto max-w-md bg-ash p-6 text-center ring-1 ring-danger/30">
      <h2 className="font-display text-xl tracking-wide text-danger">{title}</h2>
      <p className="mt-2 text-sm text-smoke">{message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
