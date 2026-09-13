import { useEffect, useState } from 'react';
import { Button, type ButtonProps } from '../Button/Button';

export interface ShareButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  url: string;
  label?: string;
}

type Status = 'idle' | 'copied' | 'failed';

export function ShareButton({ url, label = 'Copy link', ...buttonProps }: ShareButtonProps) {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (status !== 'copied') return;
    const timer = window.setTimeout(() => setStatus('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      // Clipboard access is refused on insecure origins and by some browsers' permission
      // prompts; showing the link lets the user copy it by hand instead.
      setStatus('failed');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button variant="ghost" onClick={() => void copy()} {...buttonProps}>
        {status === 'copied' ? 'Link copied' : label}
      </Button>
      <p aria-live="polite" className="sr-only">
        {status === 'copied' ? 'Link copied to clipboard' : ''}
      </p>
      {status === 'failed' && (
        <input
          readOnly
          value={url}
          aria-label="Share link"
          onFocus={(event) => event.currentTarget.select()}
          className="w-72 max-w-full border border-smoke/30 bg-ink px-2 py-1 font-mono text-[0.6875rem] text-bone"
        />
      )}
    </div>
  );
}
