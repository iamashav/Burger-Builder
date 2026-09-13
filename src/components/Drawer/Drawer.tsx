import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface DrawerProps {
  id: string;
  label: string;
  open: boolean;
  onClose: () => void;
  side?: 'left' | 'right';
  mobileOnly?: boolean;
  className?: string;
  children: ReactNode;
}

export function Drawer({
  id,
  label,
  open,
  onClose,
  side = 'left',
  mobileOnly = false,
  className,
  children,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-ink/70 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
          mobileOnly && 'sm:hidden',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        // aria-hidden keeps the offscreen panel and its controls out of the a11y tree and
        // the tab order while it is visually hidden.
        aria-hidden={!open}
        inert={!open}
        className={cn(
          'fixed top-0 z-50 flex h-full flex-col bg-ash ring-1 ring-smoke/15 transition-transform duration-300 ease-out',
          side === 'left' ? 'left-0' : 'right-0',
          open ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
          mobileOnly && 'sm:hidden',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
}
