import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  children: ReactNode;
}

const VARIANTS = {
  primary:
    'bg-flood text-ink hover:bg-flood/85 disabled:bg-transparent disabled:text-smoke disabled:ring-1 disabled:ring-inset disabled:ring-smoke/25 disabled:hover:bg-transparent',
  ghost:
    'bg-transparent text-bone ring-1 ring-inset ring-smoke/40 hover:ring-flood hover:text-flood disabled:text-smoke disabled:ring-smoke/20 disabled:hover:text-smoke disabled:hover:ring-smoke/20',
  danger:
    'bg-transparent text-danger ring-1 ring-inset ring-danger/40 hover:bg-danger/10 disabled:text-smoke disabled:ring-smoke/20',
} as const;

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex cursor-pointer items-center justify-center px-5 py-2.5 font-mono text-xs tracking-[0.14em] uppercase transition-colors disabled:cursor-not-allowed',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
